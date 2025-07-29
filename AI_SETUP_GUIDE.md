# 🤖 Free AI Setup Guide

Your portfolio designer now supports **multiple FREE AI options** with no credit costs!

## 🚀 Option 1: Ollama (Recommended - 100% Local & Free)

### Installation:
1. **Download Ollama**: Visit https://ollama.ai and download for Windows
2. **Install**: Run the installer
3. **Download a model**: Open terminal and run:
   ```bash
   ollama pull llama3.2
   # OR for coding-specific tasks:
   ollama pull codellama
   ```
4. **Start Ollama**: It runs automatically after install

### Usage:
- Ollama runs on `http://localhost:11434`
- Your app will automatically detect and use it
- **100% free, unlimited usage, runs offline**

## 🌐 Option 2: Hugging Face (Free API Tier)

### Setup:
1. **Sign up**: Go to https://huggingface.co (free)
2. **Get token** (optional): Settings → Access Tokens
3. **Add to server** (optional): Update `server/index.js` with your token

### Usage:
- Free tier: 1000 requests/month
- No token needed for basic usage
- Works out of the box

## 🎯 Option 3: Intelligent Rule-Based (Always Available)

- **No setup needed**
- Uses advanced algorithms to analyze your canvas
- Creates professional websites based on layout detection
- **Always works as fallback**

## 🔄 How It Works:

1. **Draw your design** in the canvas
2. **Click "AI Generate"**
3. **Add custom instructions** (optional)
4. **AI analyzes your canvas**:
   - Detects layout sections (header, content, footer)
   - Extracts colors and text
   - Identifies website type (portfolio, business, etc.)
   - Creates responsive, professional design
5. **Get professional website code**

## ✨ Features:

- **Smart Layout Detection**: Automatically organizes your elements
- **Color Extraction**: Uses your exact colors from canvas
- **Responsive Design**: Mobile-first, works on all devices
- **Professional Styling**: Modern CSS with animations
- **SEO Ready**: Proper meta tags and semantic HTML
- **Accessibility**: WCAG compliant structure

## 🛠 Recommended Setup:

1. **Install Ollama** for best results (most intelligent)
2. **Keep Hugging Face** as backup (when offline)
3. **Rule-based system** always works as final fallback

Try it now! Draw something in the canvas and click "AI Generate" 🎨✨
