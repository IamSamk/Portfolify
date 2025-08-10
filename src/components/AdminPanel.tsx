import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

interface AdminPanelProps {
  onClose: () => void;
}

const STORAGE_KEY = 'vercel_tokens';

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [tokens, setTokens] = useState<string[]>([]);
  const [newToken, setNewToken] = useState('');

  // Load tokens from localStorage on component mount
  useEffect(() => {
    const storedTokens = localStorage.getItem(STORAGE_KEY);
    if (storedTokens) {
      setTokens(JSON.parse(storedTokens));
    }
  }, []);

  // Save tokens to localStorage whenever they change
  const saveTokens = (updatedTokens: string[]) => {
    setTokens(updatedTokens);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTokens));
  };

  const addToken = () => {
    if (!newToken.trim() || tokens.includes(newToken.trim())) {
      alert('Please enter a valid, unique Vercel API token.');
      return;
    }
    const updatedTokens = [...tokens, newToken.trim()];
    saveTokens(updatedTokens);
    setNewToken('');
  };

  const removeToken = (tokenToRemove: string) => {
    const updatedTokens = tokens.filter(token => token !== tokenToRemove);
    saveTokens(updatedTokens);
  };

  return (
    <div className="modal-overlay">
      <div className="modal admin-modal">
        <div className="modal-header">
          <h2>Admin Panel - Vercel Token Management</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <div className="admin-section">
            <h3>Add New Vercel Token</h3>
            <div className="add-token-form">
              <input
                type="text"
                placeholder="Enter Vercel API token"
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
                className="token-input"
              />
              <button 
                onClick={addToken} 
                disabled={!newToken.trim()}
                className="add-btn"
              >
                Add Token
              </button>
            </div>
            <p className="token-info">
              Add multiple Vercel API tokens to automatically rotate when rate limits are reached.
              The primary token is hardcoded; these are additional fallback tokens.
            </p>
          </div>

          <div className="admin-section">
            <h3>Stored Fallback Tokens ({tokens.length})</h3>
            {tokens.length === 0 ? (
              <p>No fallback tokens stored. Add a token to create a backup for deployments.</p>
            ) : (
              <div className="tokens-list">
                {tokens.map((token, index) => (
                  <div key={index} className="token-item">
                    <span className="token-preview">...{token.slice(-6)}</span>
                    <button 
                      onClick={() => removeToken(token)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-section">
            <h3>Usage Information</h3>
            <div className="usage-info">
              <p>• The primary token is fixed and cannot be changed here.</p>
              <p>• These fallback tokens are stored in your browser's local storage.</p>
              <p>• If a deployment fails with one token, the system automatically tries the next.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
