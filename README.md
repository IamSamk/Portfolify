# Portfolio Designer

> A powerful visual design tool powered by **Excalidraw** that converts your creative drawings into professional, deployable websites with pixel-perfect accuracy and automated deployment to Vercel.

[![Portfolio Designer](https://img.shields.io/badge/Portfolio-Designer-brightgreen)](https://portfolio-designer.vercel.app/)
[![Excalidraw](https://img.shields.io/badge/Powered%20by-Excalidraw-ff6900)](https://excalidraw.com/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## Live Demo

**Try it now:** [Portfolio Designer](http://localhost:5173/Portfolify/)

---

## Key Features

### Visual Design to Code with Excalidraw
Transform your creative vision into production-ready websites using the power of Excalidraw:

| Feature | Description | Technology |
|---------|-------------|------------|
| **Excalidraw Canvas** | Industry-leading interactive drawing interface | Excalidraw React component |
| **Real-time Preview** | Instant HTML/CSS conversion from Excalidraw data | Custom ExcalidrawToHTML service |
| **Responsive Design** | Mobile-optimized output | CSS Grid & Flexbox |
| **SVG Precision** | Pixel-perfect shape rendering | SVG polygon generation |
| **Live Deployment** | One-click Vercel deployment | Vercel REST API v6 |

### Advanced Automation

#### Intelligent Conversion Engine
- **Excalidraw Shape Recognition** - Automatically detects rectangles, diamonds, ellipses, arrows from Excalidraw data
- **Style Preservation** - Maintains colors, strokes, fills, and opacity exactly as drawn in Excalidraw
- **Precise Positioning** - Converts Excalidraw coordinates with mathematical accuracy
- **Typography Support** - Preserves fonts, sizes, and text styling from Excalidraw elements
- **Color Management** - Full spectrum color support with transparency, powered by Excalidraw's color system

#### Deployment Automation
- **One-Click Deploy** - Direct deployment to Vercel hosting
- **Token Management** - Secure API token storage and rotation
- **Multi-Token Support** - Automatic fallback for rate limiting
- **Deployment Status** - Real-time feedback and error handling
- **Live URLs** - Instant access to deployed websites

#### User Experience
- **Excalidraw Interface** - Clean, intuitive design workflow powered by the best drawing tool
- **Auto-Preview** - See results before deployment with real-time Excalidraw conversion
- **Mobile Responsive** - Works perfectly on all devices with Excalidraw's touch support
- **Keyboard Shortcuts** - Efficient workflow controls inherited from Excalidraw
- **Undo/Redo** - Full action history management using Excalidraw's built-in system

---

## Quick Start

### Method 1: Direct Development
```bash
# Clone the repository
git clone https://github.com/IamSamk/Portfolify.git

# Navigate to the project
cd Portfolify

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:5173/Portfolify/
```

### Method 2: Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to your hosting platform
# Built files are in the 'dist' directory
```

---

## Detailed Usage Guide

### Step 1: Create Your Design with Excalidraw
```
Excalidraw Elements Supported:
✓ Rectangles - Perfect for layouts and containers
✓ Diamonds - Custom SVG polygon rendering from Excalidraw shapes
✓ Ellipses - Circles and oval shapes drawn in Excalidraw
✓ Lines & Arrows - Connecting elements with Excalidraw's precision
✓ Text Elements - Typography and labels using Excalidraw's text tools
✓ Freehand Drawing - Creative illustrations with Excalidraw's brush tools
```

### Step 2: Preview Your Website
1. **Real-time Conversion**: See instant HTML preview as you draw in Excalidraw
2. **Style Verification**: Check colors, sizes, and positioning from your Excalidraw design
3. **Responsive Check**: Verify mobile compatibility of your Excalidraw-generated layout
4. **Interactive Preview**: Test the generated website converted from your Excalidraw creation

### Step 3: Deploy to Vercel

#### Automated Deployment
1. Click "Preview & Deploy" button
2. Enter your project name (e.g., "my-portfolio")
3. Click "Deploy Now" for instant deployment
4. Receive live URL immediately

#### Token Management
1. Access Admin Panel for token configuration
2. Add multiple Vercel API tokens for redundancy
3. Automatic token rotation for rate limit handling
4. Secure localStorage token management

### Step 4: Manage Your Portfolio
- **Live Editing**: Continue editing and redeploy instantly
- **Version Control**: Each deployment creates a new version
- **Custom Domains**: Configure custom domains in Vercel dashboard
- **Analytics**: Monitor website performance

---

## Technical Specifications

### Core Architecture
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for optimized development and builds
- **Canvas Engine**: **Excalidraw** - The industry-leading collaborative drawing tool
- **Conversion Engine**: Custom ExcalidrawToHTML service for seamless transformation
- **Deployment**: Vercel REST API v6 integration
- **State Management**: React hooks and context with Excalidraw state integration

### Browser Compatibility
| Browser | Version | Status | Features |
|---------|---------|--------|----------|
| Chrome | 90+ | ✓ Full Support | All features available |
| Firefox | 88+ | ✓ Full Support | All features available |
| Safari | 14+ | ✓ Full Support | All features available |
| Edge | 90+ | ✓ Full Support | All features available |
| Mobile Browsers | Modern | ✓ Full Support | Touch-optimized interface |

### Output Specifications
- **HTML5**: Semantic, accessible markup
- **CSS3**: Modern styling with Grid and Flexbox
- **SVG**: Vector graphics for perfect scaling
- **Responsive**: Mobile-first design approach
- **Performance**: Optimized for fast loading

---

## Project Structure

```
portfolio-designer/
├── index.html                    # Main HTML entry point
├── package.json                  # Project dependencies and scripts
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── src/
│   ├── App.tsx                   # Main React component
│   ├── components/
│   │   ├── PortfolioDesigner.tsx # Main design interface
│   │   ├── PreviewModal.tsx      # Preview and deployment modal
│   │   ├── AdminPanel.tsx        # Token management interface
│   │   └── *.css                 # Component-specific styles
│   ├── services/
│   │   ├── ExcalidrawToHTML.ts   # Core conversion engine
│   │   └── DirectVercelAPI.ts    # Deployment service
│   └── main.tsx                  # React DOM entry point
└── README.md                     # This documentation
```

### Key Components Description

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `PortfolioDesigner` | Main application interface | Canvas integration, toolbar controls |
| `PreviewModal` | Preview and deployment UI | Real-time preview, deployment status |
| `AdminPanel` | Token management | Secure token storage, multi-token UI |
| `ExcalidrawToHTML` | Conversion engine | Shape recognition, CSS generation |
| `DirectVercelAPI` | Deployment service | API integration, error handling |

---

## Advanced Configuration

### Environment Variables
```bash
# Create .env file in project root
VITE_VERCEL_TOKEN=your_vercel_token_here
VITE_API_BASE_URL=https://api.vercel.com
```

### Vercel API Token Setup
1. **Create Token**: Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. **Generate Token**: Click "Create Token" with full permissions
3. **Configure Application**: Add token through Admin Panel
4. **Test Deployment**: Verify token works with test deployment

### Custom Styling
```typescript
// Modify design system in ExcalidrawToHTML.ts
const DESIGN_SYSTEM = {
  primaryColor: '#your-primary-color',
  secondaryColor: '#your-secondary-color',
  accentColor: '#your-accent-color',
  backgroundColor: '#your-bg-color',
  baseFontSize: 16,
  headingFontSize: 24
};
```

### Deployment Customization
```typescript
// Configure deployment settings in DirectVercelAPI.ts
const DEPLOYMENT_CONFIG = {
  target: 'production', // or 'preview'
  regions: ['sfo1', 'iad1'], // deployment regions
  framework: null // static site
};
```

---

## Security & Privacy

### Data Protection
- **Local Processing** - All design data stays in your browser
- **Secure Token Storage** - Encrypted localStorage for API tokens
- **No Data Collection** - Zero tracking or analytics
- **HTTPS Only** - Secure communication with APIs

### API Security
- **Token Rotation**: Support for multiple API tokens
- **Rate Limiting**: Automatic handling of API limits
- **Error Handling**: Secure error reporting without token exposure
- **Scope Limitation**: Tokens only need deployment permissions

---

## Troubleshooting

### Common Issues & Solutions

#### Design Not Converting
```
Problem: Excalidraw design doesn't generate HTML
Solution:
1. Ensure elements are properly positioned in Excalidraw
2. Check browser console for Excalidraw data errors
3. Verify Excalidraw scene data is valid
4. Try refreshing the page and redrawing in Excalidraw
```

#### Deployment Failures
```
Problem: Vercel deployment fails
Solution:
1. Verify API token is valid and active
2. Check token permissions in Vercel dashboard
3. Ensure project name is unique
4. Try with different token if available
```

#### Preview Not Showing
```
Problem: Preview modal shows blank content
Solution:
1. Draw some elements in Excalidraw first
2. Check if HTML conversion from Excalidraw completed
3. Verify CSS styles are generated from Excalidraw data
4. Try different browser or clear Excalidraw cache
```

### Error Codes Reference

| Error Code | Description | Solution |
|------------|-------------|----------|
| `401` | Invalid API token | Update token in Admin Panel |
| `403` | Insufficient permissions | Check token scope in Vercel |
| `429` | Rate limit exceeded | Wait or add additional tokens |
| `500` | Vercel server error | Try again later |

---

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build
npm run preview

# Bundle analyzer (if configured)
npx vite-bundle-analyzer
```

### Runtime Performance
- **Code Splitting**: Dynamic imports for optimal loading
- **Tree Shaking**: Remove unused code automatically
- **Asset Optimization**: Compressed CSS and JavaScript
- **Service Worker**: Offline capability and caching

### Deployment Performance
- **Vercel Edge Network**: Global CDN for fast delivery
- **Automatic Optimization**: Image and asset optimization
- **HTTP/2**: Modern protocol support
- **Compression**: Gzip and Brotli compression

---

## Contributing

We welcome contributions! Here's how you can help:

### Development Guidelines
1. **Code Quality**: Follow TypeScript best practices
2. **Testing**: Ensure all features work across browsers
3. **Documentation**: Update README for new features
4. **Performance**: Maintain optimal loading times

### Contribution Workflow
```bash
# Fork and clone the repository
git clone https://github.com/IamSamk/Portfolify.git

# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Test thoroughly

# Commit with descriptive message
git commit -m "feat: add your feature description"

# Push and create pull request
git push origin feature/your-feature-name
```

### Areas for Contribution
- **New Shape Support** - Add support for additional Excalidraw shapes and elements
- **Export Formats** - Support for additional export formats from Excalidraw data
- **Deployment Platforms** - Integration with other hosting services
- **Mobile Experience** - Enhanced mobile interface for Excalidraw touch interactions
- **Templates** - Pre-built design templates using Excalidraw elements

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**MIT License Benefits:**
- ✅ **Free Use** - Anyone can use your code for any purpose
- ✅ **Modify & Distribute** - Others can build upon your work
- ✅ **Commercial Use** - Companies can use it in their products
- ✅ **Great for Portfolio** - Shows you support open source community
- ✅ **No Attribution Required** - Though it's always appreciated!

---

## Acknowledgments

- **🎨 Excalidraw Team** - For creating the amazing collaborative drawing tool that powers this entire application. Excalidraw's intuitive interface, powerful drawing capabilities, and excellent React integration made this project possible. Special thanks to the open-source community behind Excalidraw!
- **Vercel** - For excellent deployment platform and API
- **React Team** - For the robust frontend framework
- **TypeScript Team** - For type safety and developer experience
- **Vite Team** - For lightning-fast build tooling

---

### **🎨 Special Thanks to Excalidraw**

This project wouldn't exist without the incredible work of the **Excalidraw team**. Excalidraw has revolutionized how we think about collaborative drawing and design tools. Their commitment to open-source, user experience, and developer-friendly APIs has made Portfolio Designer possible.

**What makes Excalidraw special:**
- ✨ **Intuitive Design** - Natural drawing experience that feels like pen and paper
- 🤝 **Collaborative Features** - Real-time collaboration capabilities
- 🛠️ **Developer-Friendly** - Excellent React integration and extensible architecture
- 🎯 **Performance** - Smooth, responsive canvas interactions
- 💎 **Open Source** - Community-driven development and transparency

**Learn more about Excalidraw:** [excalidraw.com](https://excalidraw.com/)

---

### Getting Help
- **Documentation**: This README file
- **Issues**: [GitHub Issues](https://github.com/IamSamk/Portfolify/issues)
- **Discussions**: [GitHub Discussions](https://github.com/IamSamk/Portfolify/discussions)
- **Contact**: Feel free to reach out for questions or collaborations

### Quick Links
- **Live Demo**: [Portfolio Designer](http://localhost:5173/Portfolify/)
- **Repository**: [GitHub - IamSamk/Portfolify](https://github.com/IamSamk/Portfolify)
- **🎨 Excalidraw**: [excalidraw.com](https://excalidraw.com/) - The amazing tool that powers this project!

---

**Made with ❤️ for designers and developers, powered by the incredible Excalidraw**

[![GitHub stars](https://img.shields.io/github/stars/IamSamk/Portfolify?style=social)](https://github.com/IamSamk/Portfolify)
[![GitHub forks](https://img.shields.io/github/forks/IamSamk/Portfolify?style=social)](https://github.com/IamSamk/Portfolify)
[![GitHub issues](https://img.shields.io/github/issues/IamSamk/Portfolify)](https://github.com/IamSamk/Portfolify/issues)
