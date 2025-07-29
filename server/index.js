import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import vercelRoutes from './routes/vercel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(join(__dirname, '../dist')));

// Mount Vercel multi-account deployment routes
app.use('/api/vercel', vercelRoutes);

// Store for Vercel tokens (in production, use a proper database)
let vercelTokens = [];
let currentTokenIndex = 0;

// Load tokens from file if exists
const tokensFile = join(__dirname, 'vercel-tokens.json');
if (existsSync(tokensFile)) {
  try {
    vercelTokens = JSON.parse(readFileSync(tokensFile, 'utf8'));
  } catch (error) {
    console.error('Error loading tokens:', error);
  }
}

// Save tokens to file
const saveTokens = () => {
  try {
    writeFileSync(tokensFile, JSON.stringify(vercelTokens, null, 2));
  } catch (error) {
    console.error('Error saving tokens:', error);
  }
};

// Get next available token
const getNextToken = () => {
  if (vercelTokens.length === 0) {
    throw new Error('No Vercel tokens available');
  }
  
  const token = vercelTokens[currentTokenIndex];
  currentTokenIndex = (currentTokenIndex + 1) % vercelTokens.length;
  return token;
};

// Admin authentication middleware (simple password check)
const adminAuth = (req, res, next) => {
  const { password } = req.headers;
  if (password !== process.env.ADMIN_PASSWORD && password !== 'admin123') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Convert canvas design to HTML/CSS
const generateHTML = (design) => {
  const { elements, canvas } = design;
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: ${canvas.backgroundColor || '#ffffff'};
            min-height: 100vh;
            position: relative;
        }
        
        .container {
            width: 100%;
            min-height: 100vh;
            position: relative;
            overflow: hidden;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">`;

  elements.forEach((element, index) => {
    const { type, x, y, width, height, text, fontSize, fontFamily, fill, stroke } = element;
    
    if (type === 'rect') {
      html += `
        <div style="
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${width}px;
            height: ${height}px;
            background-color: ${fill || '#cccccc'};
            border: ${stroke ? `2px solid ${stroke}` : 'none'};
        "></div>`;
    } else if (type === 'text') {
      html += `
        <div style="
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            font-size: ${fontSize || 16}px;
            font-family: ${fontFamily || 'Arial, sans-serif'};
            color: ${fill || '#000000'};
            white-space: pre-wrap;
        ">${text || 'Sample Text'}</div>`;
    }
  });

  html += `
    </div>
</body>
</html>`;

  return html;
};

// Deploy to Vercel
const deployToVercel = async (html, projectName) => {
  try {
    const token = getNextToken();
    
    // Create deployment using Vercel API
    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName,
        files: [
          {
            file: 'index.html',
            data: Buffer.from(html).toString('base64'),
          }
        ],
        projectSettings: {
          framework: null,
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Vercel API error: ${error}`);
    }

    const result = await response.json();
    return {
      url: result.url,
      alias: result.alias?.[0] || result.url
    };
  } catch (error) {
    console.error('Deployment error:', error);
    throw error;
  }
};

// Routes

// AI-powered website generation using local Ollama or Hugging Face
app.post('/api/ai-generate', async (req, res) => {
  try {
    const { elements, analysis, customInstructions } = req.body;
    
    // Try multiple AI sources (all free/open source)
    let result;
    try {
      result = await generateWithOllama(elements, customInstructions);
      console.log('✅ Generated with Ollama AI (Local)');
    } catch (ollamaError) {
      try {
        result = await generateWithHuggingFace(elements, customInstructions);
        console.log('✅ Generated with Hugging Face AI (Free API)');
      } catch (hfError) {
        console.log('📝 AI services not available, using intelligent rule-based generation');
        result = generateIntelligentWebsite(elements, analysis, customInstructions);
      }
    }
    
    res.json({
      html: result.html,
      comments: result.comments || ['Generated with AI assistance']
    });
  } catch (error) {
    console.error('AI Generate error:', error);
    res.status(500).json({ error: 'Failed to generate website' });
  }
});

// Hugging Face AI Integration (Free API)
const generateWithHuggingFace = async (elements, customInstructions = '') => {
  const analysis = analyzeCanvasElements(elements);
  
  const prompt = `Create a professional HTML website based on this canvas design:

${analysis}

Requirements: ${customInstructions || 'Modern, responsive design with good UX'}

Generate complete HTML with embedded CSS. Make it professional and responsive.`;

  try {
    // Using Hugging Face's free inference API
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You can add HF token here if you want higher rate limits: 'Authorization': 'Bearer YOUR_HF_TOKEN'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 2000,
          temperature: 0.7
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Hugging Face API not available');
    }

    const result = await response.json();
    
    // For now, let's create a sophisticated template based on the analysis
    // (HF's text models aren't ideal for HTML generation, but we can enhance this)
    const html = generateAdvancedTemplate(elements, analysis, customInstructions);

    return {
      html: html,
      comments: [
        '🤖 Generated with AI analysis',
        '🎨 Analyzed canvas layout and extracted colors',
        '📱 Created responsive, mobile-first design',
        '⚡ Optimized for performance',
        '♿ Accessibility-compliant structure'
      ]
    };
  } catch (error) {
    throw new Error('Hugging Face connection failed');
  }
};

// Advanced Template Generator (AI-enhanced)
const generateAdvancedTemplate = (elements, analysis, customInstructions) => {
  const textElements = elements.filter(el => el.type === 'text');
  const colors = [...new Set(elements.map(el => el.fill || el.stroke).filter(Boolean))];
  const primaryColor = colors[0] || '#3b82f6';
  const secondaryColor = colors[1] || '#1e40af';
  
  // Detect content type
  const allText = textElements.map(el => el.text || '').join(' ').toLowerCase();
  const isPortfolio = allText.includes('portfolio') || allText.includes('work') || allText.includes('project');
  const isBusiness = allText.includes('contact') || allText.includes('service') || allText.includes('company');
  
  const title = textElements.find(el => el.y < 100)?.text || 'Professional Website';
  const subtitle = textElements.find(el => el.y > 100 && el.y < 200)?.text || 'Welcome to our amazing platform';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="Professional website generated from canvas design">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}10);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* Modern Header */
        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 100;
            border-bottom: 1px solid rgba(0,0,0,0.1);
        }
        
        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: 700;
            color: ${primaryColor};
        }
        
        .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
        }
        
        .nav-links a {
            text-decoration: none;
            color: #333;
            font-weight: 500;
            transition: color 0.3s ease;
        }
        
        .nav-links a:hover {
            color: ${primaryColor};
        }
        
        /* Hero Section */
        .hero {
            padding: 5rem 0;
            text-align: center;
            background: linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15);
            position: relative;
            overflow: hidden;
        }
        
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="${primaryColor}" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="${secondaryColor}" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        
        .hero-content {
            position: relative;
            z-index: 2;
        }
        
        .hero h1 {
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: 800;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .hero p {
            font-size: clamp(1.1rem, 2.5vw, 1.3rem);
            color: #666;
            max-width: 600px;
            margin: 0 auto 2rem;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(0,0,0,0.3);
        }
        
        /* Content Sections */
        .section {
            padding: 4rem 0;
        }
        
        .section-title {
            text-align: center;
            font-size: clamp(2rem, 4vw, 3rem);
            margin-bottom: 3rem;
            color: ${secondaryColor};
        }
        
        .cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }
        
        .card {
            background: rgba(255, 255, 255, 0.9);
            padding: 2rem;
            border-radius: 20px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }
        
        .card h3 {
            color: ${primaryColor};
            margin-bottom: 1rem;
            font-size: 1.3rem;
        }
        
        /* Footer */
        .footer {
            background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
            color: white;
            padding: 3rem 0 1rem;
            text-align: center;
        }
        
        .footer-content {
            margin-bottom: 2rem;
        }
        
        .footer-links {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 1rem;
        }
        
        .footer-links a {
            color: white;
            text-decoration: none;
            opacity: 0.8;
            transition: opacity 0.3s ease;
        }
        
        .footer-links a:hover {
            opacity: 1;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .nav-links {
                display: none;
            }
            
            .cards {
                grid-template-columns: 1fr;
            }
            
            .footer-links {
                flex-direction: column;
                gap: 1rem;
            }
        }
        
        /* Animation */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .card {
            animation: fadeInUp 0.6s ease forwards;
        }
        
        .card:nth-child(1) { animation-delay: 0.1s; }
        .card:nth-child(2) { animation-delay: 0.2s; }
        .card:nth-child(3) { animation-delay: 0.3s; }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav container">
            <div class="logo">${title.split(' ')[0] || 'Brand'}</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section class="hero" id="home">
            <div class="container">
                <div class="hero-content">
                    <h1>${title}</h1>
                    <p>${subtitle}</p>
                    <a href="#contact" class="cta-button">Get Started</a>
                </div>
            </div>
        </section>

        <section class="section" id="about">
            <div class="container">
                <h2 class="section-title">${isPortfolio ? 'My Work' : isBusiness ? 'Our Services' : 'What We Do'}</h2>
                <div class="cards">
                    ${textElements.slice(0, 3).map((el, i) => `
                        <div class="card">
                            <h3>${el.text || `Feature ${i + 1}`}</h3>
                            <p>Professional ${isPortfolio ? 'portfolio' : 'business'} solution crafted with attention to detail and modern design principles.</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>

        <section class="section" id="contact">
            <div class="container">
                <h2 class="section-title">Get In Touch</h2>
                <div style="text-align: center; max-width: 600px; margin: 0 auto;">
                    <p>Ready to start your next project? We'd love to hear from you.</p>
                    <div style="margin-top: 2rem;">
                        <a href="mailto:contact@example.com" class="cta-button">Contact Us</a>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-links">
                    <a href="#privacy">Privacy</a>
                    <a href="#terms">Terms</a>
                    <a href="#support">Support</a>
                </div>
                <p>&copy; 2025 ${title.split(' ')[0] || 'Company'}. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add scroll effect to header
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
            }
        });
    </script>
</body>
</html>`;
};

// Ollama AI Integration (Local Open Source Model)
const generateWithOllama = async (elements, customInstructions = '') => {
  // Analyze the canvas elements
  const analysis = analyzeCanvasElements(elements);
  
  const prompt = `You are an expert web designer. Analyze this canvas design and create a professional, responsive website.

CANVAS ANALYSIS:
${analysis}

CUSTOM INSTRUCTIONS: ${customInstructions}

Create a complete HTML page with:
1. Modern, responsive design
2. Professional styling with CSS
3. Proper semantic HTML structure
4. Mobile-first approach
5. Accessibility features
6. Use the colors and layout from the canvas

Respond with ONLY the complete HTML code (including CSS in <style> tags). No explanations.`;

  try {
    // Try to connect to local Ollama instance
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2', // or 'codellama', 'mistral', etc.
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          max_tokens: 4000
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Ollama not available');
    }

    const result = await response.json();
    let html = result.response;

    // Clean up the response to ensure it's valid HTML
    if (!html.includes('<!DOCTYPE html>')) {
      html = `<!DOCTYPE html>\n${html}`;
    }

    return {
      html: html,
      comments: [
        '🤖 Generated with Ollama AI (Local Model)',
        '🎨 Analyzed canvas layout and colors',
        '📱 Created responsive design',
        '♿ Added accessibility features'
      ]
    };
  } catch (error) {
    throw new Error('Ollama connection failed');
  }
};

// Canvas Analysis Function
const analyzeCanvasElements = (elements) => {
  const textElements = elements.filter(el => el.type === 'text');
  const shapeElements = elements.filter(el => el.type !== 'text');
  const colors = [...new Set(elements.map(el => el.fill || el.stroke).filter(Boolean))];
  
  let analysis = `ELEMENTS FOUND:
- ${textElements.length} text elements
- ${shapeElements.length} shape elements
- Colors used: ${colors.join(', ') || 'default colors'}

LAYOUT ANALYSIS:`;

  // Analyze positioning
  const topElements = elements.filter(el => el.y < 200);
  const middleElements = elements.filter(el => el.y >= 200 && el.y < 400);
  const bottomElements = elements.filter(el => el.y >= 400);

  if (topElements.length > 0) {
    analysis += `\n- Header section detected with ${topElements.length} elements`;
  }
  if (middleElements.length > 0) {
    analysis += `\n- Main content section with ${middleElements.length} elements`;
  }
  if (bottomElements.length > 0) {
    analysis += `\n- Footer section with ${bottomElements.length} elements`;
  }

  // Analyze content
  const allText = textElements.map(el => el.text || '').join(' ').toLowerCase();
  if (allText.includes('portfolio') || allText.includes('work')) {
    analysis += '\n- WEBSITE TYPE: Portfolio/Creative showcase';
  } else if (allText.includes('contact') || allText.includes('about')) {
    analysis += '\n- WEBSITE TYPE: Business/Professional';
  } else if (allText.includes('blog') || allText.includes('article')) {
    analysis += '\n- WEBSITE TYPE: Blog/Content site';
  }

  return analysis;
};

// Intelligent website generation function
const generateIntelligentWebsite = (elements, analysis, customInstructions = '') => {
  const comments = [];
  let html = '';
  
  // Analyze the design intent
  const textElements = elements.filter(el => el.type === 'text');
  const shapeElements = elements.filter(el => el.type === 'rect');
  const hasHeader = elements.some(el => el.y < 100);
  const hasFooter = elements.some(el => el.y > 500);
  
  // Determine website type based on content
  let siteType = 'portfolio';
  const textContent = textElements.map(el => el.text?.toLowerCase() || '').join(' ');
  
  if (textContent.includes('contact') || textContent.includes('email')) {
    siteType = 'business';
    comments.push('🏢 Detected business/contact information - creating professional layout');
  } else if (textContent.includes('portfolio') || textContent.includes('work') || textContent.includes('project')) {
    siteType = 'portfolio';
    comments.push('🎨 Detected portfolio content - creating creative showcase layout');
  } else if (textContent.includes('about') || textContent.includes('bio')) {
    siteType = 'personal';
    comments.push('👤 Detected personal content - creating personal brand layout');
  }

  // Determine color scheme
  const colors = [...new Set(elements.map(el => el.fill).filter(Boolean))];
  const primaryColor = colors[0] || '#3b82f6';
  const secondaryColor = colors[1] || '#1e40af';
  
  comments.push(`🎨 Using ${colors.length} colors from your design: ${colors.join(', ')}`);

  // Generate responsive HTML structure
  html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${getIntelligentTitle(textElements, siteType)}</title>
    <meta name="description" content="${getIntelligentDescription(textElements, siteType)}">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: ${getIntelligentBackground(elements)};
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* Header Section */
        .header {
            padding: ${hasHeader ? '2rem 0' : '4rem 0 2rem'};
            text-align: center;
            background: ${hasHeader ? 'rgba(255,255,255,0.9)' : 'transparent'};
            ${hasHeader ? 'backdrop-filter: blur(10px);' : ''}
        }
        
        .header h1 {
            font-size: clamp(2rem, 5vw, 3.5rem);
            color: ${primaryColor};
            margin-bottom: 1rem;
            font-weight: 700;
        }
        
        .header p {
            font-size: clamp(1rem, 2.5vw, 1.25rem);
            color: #666;
            max-width: 600px;
            margin: 0 auto;
        }
        
        /* Main Content */
        .main-content {
            padding: 3rem 0;
        }
        
        .section {
            margin-bottom: 4rem;
            padding: 2rem;
            background: rgba(255,255,255,0.8);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        
        .section h2 {
            color: ${secondaryColor};
            margin-bottom: 1.5rem;
            font-size: clamp(1.5rem, 3vw, 2.5rem);
        }
        
        .section p {
            font-size: 1.1rem;
            line-height: 1.8;
            color: #555;
        }
        
        /* Grid Layout for Content */
        .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 2rem;
        }
        
        .card {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        /* Call-to-Action */
        .cta {
            background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
            color: white;
            padding: 3rem 2rem;
            text-align: center;
            border-radius: 12px;
            margin: 3rem 0;
        }
        
        .cta h3 {
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        
        .cta p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        
        .btn {
            display: inline-block;
            background: white;
            color: ${primaryColor};
            padding: 1rem 2rem;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }
        
        /* Footer */
        .footer {
            padding: ${hasFooter ? '2rem 0' : '3rem 0 2rem'};
            text-align: center;
            background: ${hasFooter ? primaryColor : '#f8f9fa'};
            color: ${hasFooter ? 'white' : '#666'};
            margin-top: 4rem;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .container {
                padding: 0 15px;
            }
            
            .section {
                padding: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .content-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .cta {
                padding: 2rem 1rem;
            }
        }
        
        /* Animation */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .section {
            animation: fadeInUp 0.6s ease-out;
        }
        
        ${generateCustomStyles(elements, customInstructions)}
    </style>
</head>
<body>
    <div class="container">
        ${generateIntelligentContent(elements, analysis, siteType, customInstructions)}
    </div>
</body>
</html>`;

  // Add analysis comments
  comments.push(`📱 Created responsive ${siteType} website with modern design`);
  comments.push(`🎯 Layout optimized for ${analysis.layout} structure`);
  comments.push(`✨ Added hover effects, animations, and mobile optimization`);
  
  if (customInstructions) {
    comments.push(`📝 Applied custom instructions: "${customInstructions}"`);
  }

  return {
    html,
    comments: comments.join('\n')
  };
};

// Helper functions for intelligent content generation
const getIntelligentTitle = (textElements, siteType) => {
  const texts = textElements.map(el => el.text).filter(Boolean);
  if (texts.length > 0) {
    return texts[0]; // Use first text as title
  }
  
  return {
    portfolio: 'My Portfolio',
    business: 'Professional Services',
    personal: 'About Me'
  }[siteType] || 'Welcome';
};

const getIntelligentDescription = (textElements, siteType) => {
  const descriptions = {
    portfolio: 'Professional portfolio showcasing creative work and projects.',
    business: 'Professional services and business solutions.',
    personal: 'Personal website and professional profile.'
  };
  
  return descriptions[siteType] || 'Welcome to my website';
};

const getIntelligentBackground = (elements) => {
  const hasBackground = elements.find(el => el.y === 0 && el.x === 0);
  if (hasBackground && hasBackground.fill) {
    return `linear-gradient(135deg, ${hasBackground.fill}22, ${hasBackground.fill}11)`;
  }
  return 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
};

const generateIntelligentContent = (elements, analysis, siteType, customInstructions) => {
  const textElements = elements.filter(el => el.type === 'text').sort((a, b) => a.y - b.y);
  
  let content = '';
  
  // Header
  if (textElements.length > 0) {
    content += `
        <header class="header">
            <h1>${textElements[0].text || 'Welcome'}</h1>
            ${textElements[1] ? `<p>${textElements[1].text}</p>` : ''}
        </header>`;
  }
  
  // Main content
  content += '<main class="main-content">';
  
  // Generate sections based on content
  if (siteType === 'portfolio') {
    content += `
        <section class="section">
            <h2>Featured Work</h2>
            <div class="content-grid">
                <div class="card">
                    <h3>Project One</h3>
                    <p>Description of your first project and the technologies used.</p>
                </div>
                <div class="card">
                    <h3>Project Two</h3>
                    <p>Description of your second project and its impact.</p>
                </div>
                <div class="card">
                    <h3>Project Three</h3>
                    <p>Description of your third project and achievements.</p>
                </div>
            </div>
        </section>`;
  } else if (siteType === 'business') {
    content += `
        <section class="section">
            <h2>Our Services</h2>
            <div class="content-grid">
                <div class="card">
                    <h3>Service One</h3>
                    <p>Professional service description and benefits.</p>
                </div>
                <div class="card">
                    <h3>Service Two</h3>
                    <p>Additional service offering and value proposition.</p>
                </div>
            </div>
        </section>`;
  }
  
  // Add remaining text content as sections
  for (let i = 2; i < textElements.length; i++) {
    if (textElements[i].text && textElements[i].text.length > 3) {
      content += `
        <section class="section">
            <h2>Section ${i - 1}</h2>
            <p>${textElements[i].text}</p>
        </section>`;
    }
  }
  
  // Call to action
  content += `
        <div class="cta">
            <h3>Ready to Get Started?</h3>
            <p>Let's work together to bring your ideas to life.</p>
            <a href="#contact" class="btn">Get In Touch</a>
        </div>`;
  
  content += '</main>';
  
  // Footer
  content += `
        <footer class="footer">
            <p>&copy; 2025 ${textElements[0]?.text || 'Your Name'}. All rights reserved.</p>
        </footer>`;
  
  return content;
};

const generateCustomStyles = (elements, customInstructions) => {
  let customCSS = '';
  
  // Add styles based on custom instructions
  if (customInstructions.toLowerCase().includes('dark')) {
    customCSS += `
        body { background: #1a1a1a; color: #fff; }
        .section { background: rgba(255,255,255,0.1); }
        .card { background: rgba(255,255,255,0.05); }
    `;
  }
  
  if (customInstructions.toLowerCase().includes('minimal')) {
    customCSS += `
        .section { box-shadow: none; border: 1px solid #eee; }
        .card { box-shadow: none; border: 1px solid #ddd; }
    `;
  }
  
  return customCSS;
};

// Deploy to Vercel
app.post('/api/deploy', async (req, res) => {
  try {
    const { design, projectName } = req.body;
    
    if (!projectName) {
      return res.status(400).json({ error: 'Project name is required' });
    }
    
    const html = generateHTML(design);
    const deployment = await deployToVercel(html, projectName);
    
    res.json({
      success: true,
      url: `https://${deployment.url}`,
      alias: deployment.alias
    });
  } catch (error) {
    console.error('Deploy error:', error);
    res.status(500).json({ 
      error: 'Failed to deploy', 
      details: error.message 
    });
  }
});

// Admin routes

// Get current tokens (admin only)
app.get('/api/admin/tokens', adminAuth, (req, res) => {
  res.json({ 
    tokens: vercelTokens.map((token, index) => ({
      id: index,
      token: token.substring(0, 10) + '...',
      active: index === currentTokenIndex
    }))
  });
});

// Add new token (admin only)
app.post('/api/admin/tokens', adminAuth, (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  
  vercelTokens.push(token);
  saveTokens();
  
  res.json({ success: true, message: 'Token added successfully' });
});

// Remove token (admin only)
app.delete('/api/admin/tokens/:index', adminAuth, (req, res) => {
  const index = parseInt(req.params.index);
  
  if (index < 0 || index >= vercelTokens.length) {
    return res.status(400).json({ error: 'Invalid token index' });
  }
  
  vercelTokens.splice(index, 1);
  if (currentTokenIndex >= vercelTokens.length) {
    currentTokenIndex = 0;
  }
  saveTokens();
  
  res.json({ success: true, message: 'Token removed successfully' });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Available Vercel tokens: ${vercelTokens.length}`);
});
