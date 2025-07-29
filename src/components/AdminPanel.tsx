import React, { useState } from 'react';

interface Token {
  id: number;
  token: string;
  active: boolean;
}

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [newToken, setNewToken] = useState('');
  const [loading, setLoading] = useState(false);

  const authenticate = () => {
    if (password === 'admin123' || password === process.env.REACT_APP_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      loadTokens();
    } else {
      alert('Invalid password');
    }
  };

  const loadTokens = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/tokens', {
        headers: {
          'password': password
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data.tokens);
      } else {
        throw new Error('Failed to load tokens');
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
      alert('Failed to load tokens');
    } finally {
      setLoading(false);
    }
  };

  const addToken = async () => {
    if (!newToken.trim()) {
      alert('Please enter a token');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'password': password
        },
        body: JSON.stringify({ token: newToken.trim() })
      });

      if (response.ok) {
        setNewToken('');
        await loadTokens();
        alert('Token added successfully');
      } else {
        throw new Error('Failed to add token');
      }
    } catch (error) {
      console.error('Error adding token:', error);
      alert('Failed to add token');
    } finally {
      setLoading(false);
    }
  };

  const removeToken = async (index: number) => {
    if (!confirm('Are you sure you want to remove this token?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/tokens/${index}`, {
        method: 'DELETE',
        headers: {
          'password': password
        }
      });

      if (response.ok) {
        await loadTokens();
        alert('Token removed successfully');
      } else {
        throw new Error('Failed to remove token');
      }
    } catch (error) {
      console.error('Error removing token:', error);
      alert('Failed to remove token');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="modal-overlay">
        <div className="modal admin-modal">
          <div className="modal-header">
            <h2>Admin Panel</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="modal-content">
            <div className="login-form">
              <h3>Authentication Required</h3>
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && authenticate()}
                className="password-input"
              />
              <button onClick={authenticate} className="auth-btn">
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                disabled={loading || !newToken.trim()}
                className="add-btn"
              >
                {loading ? 'Adding...' : 'Add Token'}
              </button>
            </div>
            <p className="token-info">
              Add multiple Vercel API tokens to automatically rotate when rate limits are reached.
              Each token allows 100 deployments per day.
            </p>
          </div>

          <div className="admin-section">
            <h3>Current Tokens ({tokens.length})</h3>
            {loading ? (
              <p>Loading...</p>
            ) : tokens.length === 0 ? (
              <p>No tokens configured. Add a token to enable deployments.</p>
            ) : (
              <div className="tokens-list">
                {tokens.map((token, index) => (
                  <div key={token.id} className={`token-item ${token.active ? 'active' : ''}`}>
                    <div className="token-info">
                      <span className="token-preview">{token.token}</span>
                      {token.active && <span className="active-badge">Active</span>}
                    </div>
                    <button 
                      onClick={() => removeToken(index)}
                      className="remove-btn"
                      disabled={loading}
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
              <p>• Tokens are automatically rotated for each deployment</p>
              <p>• Each Vercel token has a limit of 100 deployments per day</p>
              <p>• Add multiple tokens to increase daily deployment capacity</p>
              <p>• Tokens are stored securely on the server</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
