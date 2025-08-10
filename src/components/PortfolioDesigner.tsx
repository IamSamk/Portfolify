import React, { useState } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import PreviewModal from './PreviewModal.tsx';
import AdminPanel from './AdminPanel.tsx';
import DirectVercelAPI from '../services/DirectVercelAPI';
import type { DeploymentResult } from '../services/DirectVercelAPI';
import ExcalidrawToHTML from '../services/ExcalidrawToHTML';
import './PortfolioDesigner.css';

const PortfolioDesigner: React.FC = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [generatedHtml, setGeneratedHtml] = useState('');

  const handleGenerateWebsite = async () => {
    if (!excalidrawAPI) {
      alert('Canvas not ready yet');
      return;
    }
    const elements = excalidrawAPI.getSceneElements();
    if (elements.length === 0) {
      alert('Please draw something on the canvas first!');
      return;
    }
    const result = await ExcalidrawToHTML.generateWebsite(elements);
    setGeneratedHtml(result.html);
    setShowPreview(true);
  };

  // Deploy to Vercel (fully automated)
  const deployToVercel = async (projectName: string): Promise<DeploymentResult> => {
    try {
      console.log('🚀 Starting automated Vercel deployment...');
      
      if (!generatedHtml) {
        return {
          success: false,
          message: 'No website generated yet. Please generate a website first.'
        };
      }

      // Use the new Direct Vercel API for truly automated deployment
      const result = await DirectVercelAPI.deployWebsite(generatedHtml, projectName);
      
      if (result.success && result.url) {
        // Show success with actual live URL
        alert(`🎉 DEPLOYMENT SUCCESSFUL!\n\nYour portfolio is now LIVE at:\n${result.url}\n\n✨ Professional website deployed in seconds!`);
        return result;
      } else {
        // Return the error result from the API
        return result;
      }
      
    } catch (error) {
      console.error('Error during deployment:', error);
      
      // Enhanced fallback with comprehensive guidance
      const cleanProjectName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      const link = document.createElement('a');
      const file = new Blob([generatedHtml], { type: 'text/html' });
      link.href = URL.createObjectURL(file);
      link.download = `${cleanProjectName}.html`;
      link.click();
      
      alert(`🚀 FILE READY FOR DEPLOYMENT!\n\n📦 Downloaded: ${cleanProjectName}.html\n\n⚡ INSTANT DEPLOYMENT:\n1. Go to vercel.com/new\n2. Drag & drop the file\n3. Click "Deploy"\n4. Your site goes LIVE!\n\n✨ Takes less than 30 seconds!`);
      
      return {
        success: false,
        message: `📦 ${cleanProjectName}.html ready for instant Vercel deployment! Error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  };

  return (
    <div className="portfolio-designer">
      <div className="header">
        <h1>Portfolio Designer</h1>
        <div className="header-actions">
          <button onClick={() => setShowAdmin(true)} className="admin-btn">
            Admin
          </button>
          <button onClick={handleGenerateWebsite} className="preview-deploy-btn">
            Preview & Deploy
          </button>
          <button onClick={handleGenerateWebsite} className="ai-generate-btn">
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
    </div>
  );
};

export default PortfolioDesigner;
