import React, { useState } from 'react';

interface AIGenerationModalProps {
  elements: any[];
  onClose: () => void;
  onAccept: (html: string) => void;
}

const AIGenerationModal: React.FC<AIGenerationModalProps> = ({ elements, onClose, onAccept }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHTML, setGeneratedHTML] = useState('');
  const [aiComments, setAIComments] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateWebsite = async () => {
    setIsGenerating(true);
    try {
      // Use Excalidraw JSON to HTML converter (most accurate!)
      const { default: ExcalidrawToHTML } = await import('../services/ExcalidrawToHTML');
      
      // Generate website directly from structured Excalidraw data
      const result = await ExcalidrawToHTML.generateWebsite(elements, customInstructions);
      
      setGeneratedHTML(result.html);
      setAIComments(Array.isArray(result.comments) ? result.comments.join('\n') : result.comments || 'Generated successfully!');
      setHasGenerated(true);
    } catch (error) {
      console.error('Error generating website:', error);
      alert('Failed to generate website. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateWithChanges = () => {
    setHasGenerated(false);
    setGeneratedHTML('');
    setAIComments('');
    generateWebsite();
  };

  return (
    <div className="modal-overlay">
      <div className="modal ai-modal">
        <div className="modal-header">
          <h2>🤖 AI Website Generation</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {!hasGenerated ? (
            <div className="ai-generation-setup">
              <div className="canvas-analysis">
                <h3>Canvas Analysis</h3>
                <div className="analysis-summary">
                  <p>📊 <strong>Elements detected:</strong> {elements.length}</p>
                  <p>📝 <strong>Text elements:</strong> {elements.filter(el => el.type === 'text').length}</p>
                  <p>🔷 <strong>Shape elements:</strong> {elements.filter(el => ['rectangle', 'ellipse', 'diamond'].includes(el.type)).length}</p>
                  <p>✏️ <strong>Drawings:</strong> {elements.filter(el => ['line', 'arrow', 'freedraw'].includes(el.type)).length}</p>
                </div>
              </div>

              <div className="custom-instructions">
                <h3>Custom Instructions (Optional)</h3>
                <textarea
                  placeholder="Add any specific requirements for your website... 
Example: 'Make it a portfolio site for a designer', 'Add a contact form', 'Use modern colors', etc."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={4}
                  className="instructions-textarea"
                />
              </div>

              <div className="generation-actions">
                <button
                  onClick={generateWebsite}
                  disabled={isGenerating}
                  className="generate-btn"
                >
                  {isGenerating ? '🔄 Generating...' : '🚀 Generate Smart Website'}
                </button>
              </div>

              <div className="ai-info">
                <h4>How AI Generation Works:</h4>
                <ul>
                  <li>🔍 Analyzes your canvas layout and elements</li>
                  <li>🎨 Interprets design intent and content structure</li>
                  <li>📱 Creates responsive, modern HTML/CSS</li>
                  <li>✨ Adds smart features based on your design</li>
                  <li>💬 Provides explanations for design decisions</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="ai-results">
              <div className="ai-comments-section">
                <h3>🧠 AI Analysis & Comments</h3>
                <div className="ai-comments">
                  {aiComments.split('\n').map((comment, index) => (
                    <p key={index}>{comment}</p>
                  ))}
                </div>
              </div>

              <div className="preview-section">
                <h3>📱 Generated Website Preview</h3>
                <div className="preview-container">
                  <iframe
                    srcDoc={generatedHTML}
                    style={{
                      width: '100%',
                      height: '400px',
                      border: '1px solid #ccc',
                      borderRadius: '8px'
                    }}
                    title="AI Generated Preview"
                  />
                </div>
              </div>

              <div className="approval-actions">
                <div className="action-buttons-row">
                  <button
                    onClick={() => onAccept(generatedHTML)}
                    className="accept-btn"
                  >
                    ✅ Accept & Deploy
                  </button>
                  <button
                    onClick={regenerateWithChanges}
                    className="regenerate-btn"
                  >
                    🔄 Regenerate
                  </button>
                  <button
                    onClick={onClose}
                    className="cancel-btn"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>

              <div className="modification-section">
                <h4>Want Changes?</h4>
                <textarea
                  placeholder="Describe what you'd like to change... 
Example: 'Make the header bigger', 'Change colors to blue theme', 'Add a gallery section'"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={3}
                  className="changes-textarea"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGenerationModal;
