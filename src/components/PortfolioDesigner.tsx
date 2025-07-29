import React, { useState } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import PreviewModal from './PreviewModal.tsx';
import AdminPanel from './AdminPanel.tsx';
import AIGenerationModal from './AIGenerationModal.tsx';
import './PortfolioDesigner.css';

const PortfolioDesigner: React.FC = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAIGeneration, setShowAIGeneration] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [convertedElements, setConvertedElements] = useState<any[]>([]);

  // Generate preview - now using client-side AI (works on GitHub Pages!)
  const generatePreview = async () => {
    try {
      if (!excalidrawAPI) {
        alert('Canvas not ready yet');
        return;
      }

      // Get the current drawing data from excalidraw
      const elements = excalidrawAPI.getSceneElements();
      const convertedElements = convertExcalidrawElements(elements);
      
      // Use client-side AI service (works without backend!)
      const { default: ClientSideAI } = await import('../services/ClientSideAI');
      
      // Initialize AI if not already done
      await ClientSideAI.initialize();
      
      // Generate website using client-side AI
      const result = await ClientSideAI.generateWebsite(convertedElements, '');
      
      setGeneratedHtml(result.html);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      alert('Failed to generate preview');
    }
  };

  // Deploy to Vercel (with multi-account rotation)
  const deployToVercel = async (projectName: string) => {
    try {
      // First, let's try to deploy to Vercel using our backend API
      // The backend will handle multiple Vercel accounts rotation
      const deploymentData = {
        projectName: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        html: generatedHtml,
        timestamp: Date.now()
      };

      // Try deploying via our backend API (with multi-account support)
      try {
        const response = await fetch('/api/vercel/deploy-vercel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(deploymentData)
        });

        if (response.ok) {
          const result = await response.json();
          alert(`🚀 Success! Your website is live at:\n${result.url}\n\nDeployed using Vercel account: ${result.accountUsed}`);
          return result.url;
        } else {
          throw new Error('Backend deployment failed');
        }
      } catch (backendError) {
        console.warn('Backend deployment failed, falling back to download:', backendError);
        
        // Fallback: Download HTML file with Vercel instructions
        const link = document.createElement('a');
        const file = new Blob([generatedHtml], { type: 'text/html' });
        link.href = URL.createObjectURL(file);
        link.download = `${projectName}.html`;
        link.click();
        
        // Show comprehensive Vercel deployment instructions
        alert(`📦 Website downloaded as ${projectName}.html!\n\n🚀 Manual Vercel Deployment:\n\n1. Go to vercel.com and sign in\n2. Create new project\n3. Upload the HTML file as index.html\n4. Deploy!\n\n💡 Pro Tip: Use multiple Vercel accounts for unlimited deployments!`);
        
        return `File downloaded: ${projectName}.html`;
      }
    } catch (error) {
      console.error('Error preparing deployment:', error);
      throw error;
    }
  };

  // Convert Excalidraw elements to our format for AI generation
  const convertExcalidrawElements = (excalidrawElements: any[]) => {
    return excalidrawElements.map(element => {
      // Excalidraw element format:
      // {
      //   id: string,
      //   type: "rectangle" | "ellipse" | "diamond" | "arrow" | "line" | "freedraw" | "text" | "image",
      //   x: number, y: number, width: number, height: number,
      //   strokeColor: string, backgroundColor: string,
      //   fillStyle: "hachure" | "cross-hatch" | "solid",
      //   strokeWidth: number, roughness: number, opacity: number,
      //   text?: string, fontSize?: number, fontFamily?: number,
      //   points?: [number, number][] // for lines/arrows
      // }
      
      const baseElement = {
        id: element.id,
        type: element.type,
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        fill: element.backgroundColor || 'transparent',
        stroke: element.strokeColor || '#000000',
        strokeWidth: element.strokeWidth || 1,
        opacity: (element.opacity || 100) / 100,
      };

      // Add specific properties based on element type
      if (element.type === 'text') {
        return {
          ...baseElement,
          text: element.text || '',
          fontSize: element.fontSize || 20,
          fontFamily: element.fontFamily || 1,
        };
      }

      if (element.type === 'arrow' || element.type === 'line') {
        return {
          ...baseElement,
          points: element.points || [[0, 0], [element.width, element.height]],
        };
      }

      return baseElement;
    });
  };

  // Open AI Generation Modal
  const openAIGeneration = () => {
    if (!excalidrawAPI) {
      alert('Canvas not ready yet');
      return;
    }

    const excalidrawElements = excalidrawAPI.getSceneElements();
    const convertedElements = convertExcalidrawElements(excalidrawElements);
    setConvertedElements(convertedElements);
    
    setShowAIGeneration(true);
  };

  return (
    <div className="portfolio-designer">
      <div className="header">
        <h1>Portfolio Designer</h1>
        <div className="header-actions">
          <button onClick={() => setShowAdmin(true)} className="admin-btn">
            Admin
          </button>
          <button onClick={generatePreview} className="preview-btn">
            Preview
          </button>
          <button onClick={openAIGeneration} className="ai-generate-btn">
            AI Generate
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="canvas-container">
          <div className="canvas-wrapper">
            <Excalidraw
              excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
              UIOptions={{
                canvasActions: {
                  export: false,
                  loadScene: false,
                  saveToActiveFile: false
                }
              }}
            />
          </div>
        </div>
      </div>

      {showPreview && (
        <PreviewModal
          html={generatedHtml}
          onClose={() => setShowPreview(false)}
          onDeploy={deployToVercel}
        />
      )}

      {showAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}

      {showAIGeneration && (
        <AIGenerationModal
          elements={convertedElements} // Now properly converted excalidraw elements
          onClose={() => setShowAIGeneration(false)}
          onAccept={(html: string) => {
            setGeneratedHtml(html);
            setShowAIGeneration(false);
            setShowPreview(true);
          }}
        />
      )}
    </div>
  );
};

export default PortfolioDesigner;
