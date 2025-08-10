import React, { useState } from 'react';
import type { DeploymentResult } from '../services/DirectVercelAPI';

interface PreviewModalProps {
  html: string;
  onClose: () => void;
  onDeploy: (projectName: string) => Promise<DeploymentResult>;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ html, onClose, onDeploy }) => {
  const [projectName, setProjectName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);

  const handleDeploy = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    setIsDeploying(true);
    const result = await onDeploy(projectName.trim().toLowerCase().replace(/\s+/g, '-'));
    setIsDeploying(false);
    setDeploymentResult(result);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Preview & Deploy</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {!deploymentResult?.success ? (
            <>
              <div className="preview-section">
                <h3>HTML Preview</h3>
                <div className="preview-container">
                  <iframe
                    srcDoc={html}
                    style={{
                      width: '100%',
                      height: '400px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                    title="Preview"
                  />
                </div>
              </div>

              <div className="deploy-section">
                <h3>Deploy to Vercel</h3>
                <div className="deploy-form">
                  <input
                    type="text"
                    placeholder="Enter project name (e.g., my-portfolio)"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="project-name-input"
                  />
                  <button
                    onClick={handleDeploy}
                    disabled={isDeploying || !projectName.trim()}
                    className="deploy-btn"
                  >
                    {isDeploying ? 'Deploying...' : 'Deploy Now'}
                  </button>
                </div>
                {deploymentResult && !deploymentResult.success && (
                  <div className="error-message">
                    <p><strong>Deployment Failed:</strong></p>
                    <p>{deploymentResult.message}</p>
                  </div>
                )}
                <p className="deploy-note">
                  Your portfolio will be deployed to Vercel and available instantly!
                </p>
              </div>
            </>
          ) : (
            <div className="success-section">
              <h3>🎉 Deployment Successful!</h3>
              <p>Your portfolio is now live at:</p>
              <div className="deployed-url">
                <a href={deploymentResult.url} target="_blank" rel="noopener noreferrer">
                  {deploymentResult.url}
                </a>
              </div>
              <div className="success-actions">
                <button 
                  onClick={() => window.open(deploymentResult.url!, '_blank')}
                  className="visit-btn"
                >
                  Visit Site
                </button>
                <button onClick={onClose} className="done-btn">
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
