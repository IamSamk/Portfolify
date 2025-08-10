# Portfolio Designer

> A powerful visual design tool that converts Excalidraw drawings into professional, deployable websites with pixel-perfect accuracy and automated deployment to Vercel.

[![Portfolio Designer](https://img.shields.io/badge/Portfolio-Designer-brightgreen)](https://portfolio-designer.vercel.app/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## Live Demo

**Try it now:** [Portfolio Designer](http://localhost:5173/Portfolify/)

---

## Key Features

### Visual Design to Code
Transform your creative vision into production-ready websites:

| Feature | Description | Technology |
|---------|-------------|------------|
| **Canvas Drawing** | Interactive Excalidraw interface | Excalidraw React component |
| **Real-time Preview** | Instant HTML/CSS conversion | Custom ExcalidrawToHTML service |
| **Responsive Design** | Mobile-optimized output | CSS Grid & Flexbox |
| **SVG Precision** | Pixel-perfect shape rendering | SVG polygon generation |
| **Live Deployment** | One-click Vercel deployment | Vercel REST API v6 |

### Advanced Automation

#### Intelligent Conversion Engine
- **Shape Recognition** - Automatically detects rectangles, diamonds, ellipses, arrows
- **Style Preservation** - Maintains colors, strokes, fills, and opacity
- **Precise Positioning** - Converts coordinates with mathematical accuracy
- **Typography Support** - Preserves fonts, sizes, and text styling
- **Color Management** - Full spectrum color support with transparency

#### Deployment Automation
- **One-Click Deploy** - Direct deployment to Vercel hosting
- **Token Management** - Secure API token storage and rotation
- **Multi-Token Support** - Automatic fallback for rate limiting
- **Deployment Status** - Real-time feedback and error handling
- **Live URLs** - Instant access to deployed websites

#### User Experience
- **Intuitive Interface** - Clean, modern design workflow
- **Auto-Preview** - See results before deployment
- **Mobile Responsive** - Works perfectly on all devices
- **Keyboard Shortcuts** - Efficient workflow controls
- **Undo/Redo** - Full action history management

---

## Quick Start

### Method 1: Direct Development
```bash
# Clone the repository
git clone https://github.com/yourusername/portfolio-designer.git

# Navigate to the project
cd portfolio-designer

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

### Step 1: Create Your Design
```
Design Elements Supported:
✓ Rectangles - Perfect for layouts and containers
✓ Diamonds - Custom SVG polygon rendering
✓ Ellipses - Circles and oval shapes
✓ Lines & Arrows - Connecting elements
✓ Text Elements - Typography and labels
✓ Freehand Drawing - Creative illustrations
```

### Step 2: Preview Your Website
1. **Real-time Conversion**: See instant HTML preview as you draw
2. **Style Verification**: Check colors, sizes, and positioning
3. **Responsive Check**: Verify mobile compatibility
4. **Interactive Preview**: Test the generated website

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
- **Canvas Engine**: Excalidraw for interactive drawing
- **Conversion Engine**: Custom ExcalidrawToHTML service
- **Deployment**: Vercel REST API v6 integration
- **State Management**: React hooks and context

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
Problem: Canvas design doesn't generate HTML
Solution:
1. Ensure elements are properly positioned
2. Check browser console for errors
3. Verify Excalidraw data is valid
4. Try refreshing the page
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
1. Draw some elements on canvas first
2. Check if HTML conversion completed
3. Verify CSS styles are generated
4. Try different browser
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
git clone https://github.com/your-username/portfolio-designer.git

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
- **New Shape Support** - Add support for additional shapes
- **Export Formats** - Support for additional export formats
- **Deployment Platforms** - Integration with other hosting services
- **Mobile Experience** - Enhanced mobile interface
- **Templates** - Pre-built design templates

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**MIT License Benefits:**
- ✓ Free for commercial and personal use
- ✓ Modify and distribute freely
- ✓ No attribution required (though appreciated)
- ✓ No warranty provided

---

## Acknowledgments

- **Excalidraw Team** - For the amazing drawing interface
- **Vercel** - For excellent deployment platform and API
- **React Team** - For the robust frontend framework
- **TypeScript Team** - For type safety and developer experience
- **Vite Team** - For lightning-fast build tooling

---

### Getting Help
- **Documentation**: This README file
- **Issues**: [GitHub Issues](https://github.com/yourusername/portfolio-designer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/portfolio-designer/discussions)
- **Contact**: [your-email@example.com](mailto:your-email@example.com)

### Quick Links
- **Live Demo**: [Portfolio Designer](http://localhost:5173/Portfolify/)
- **Download**: [Latest Release](https://github.com/yourusername/portfolio-designer/releases)
- **Star**: [GitHub Repository](https://github.com/yourusername/portfolio-designer)
- **Excalidraw**: [excalidraw.com](https://excalidraw.com/)

---

**Made with ❤️ for designers and developers**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/portfolio-designer?style=social)](https://github.com/yourusername/portfolio-designer)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/portfolio-designer?style=social)](https://github.com/yourusername/portfolio-designer)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/portfolio-designer)](https://github.com/yourusername/portfolio-designer/issues)
