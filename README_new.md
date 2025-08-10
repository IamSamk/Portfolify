# Portfolify

A modern web application for creating interactive portfolio designs with canvas-based drawing tools and automated deployment capabilities.

## Overview

Portfolify is a React-based portfolio designer that enables users to create interactive designs using Konva.js canvas functionality and deploy them directly to Vercel. The application features drag-and-drop elements, drawing tools, and real-time preview capabilities.

## Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Konva.js** for interactive canvas functionality
- **Excalidraw** for advanced drawing capabilities

### Backend Integration
- **Vercel API** for automated deployment
- **Express.js** server integration
- Multi-token management for API rate limiting

## Features

- Interactive canvas with shape and text drawing tools
- Drag, resize, and move functionality for all elements
- Color and font styling options
- Undo/redo functionality
- HTML/CSS export from canvas designs
- Automated deployment to Vercel
- Admin panel for managing API tokens

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/IamSamk/Portfolify.git
cd Portfolify
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be available in the `dist/` directory.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Project Structure

```
src/
├── components/          # React components
├── services/           # API services and utilities
├── types/              # TypeScript type definitions
└── styles/             # CSS and styling files
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
