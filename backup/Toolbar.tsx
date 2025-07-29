import React from 'react';
import type { CanvasElement } from './PortfolioDesigner';

interface ToolbarProps {
  tool: 'select' | 'rect' | 'circle' | 'polygon' | 'star' | 'text' | 'brush' | 'eraser';
  setTool: (tool: 'select' | 'rect' | 'circle' | 'polygon' | 'star' | 'text' | 'brush' | 'eraser') => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  fontFamily: string;
  setFontFamily: (family: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  polygonSides: number;
  setPolygonSides: (sides: number) => void;
  selectedElement: CanvasElement | undefined;
  onElementChange: (id: string, newAttrs: Partial<CanvasElement>) => void;
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onClear: () => void;
  onAIGenerate: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  setTool,
  currentColor,
  setCurrentColor,
  textColor,
  setTextColor,
  backgroundColor,
  setBackgroundColor,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  brushSize,
  setBrushSize,
  polygonSides,
  setPolygonSides,
  selectedElement,
  onElementChange,
  onUndo,
  onRedo,
  onDelete,
  onClear,
  onAIGenerate,
  canUndo,
  canRedo,
}) => {
  const fontOptions = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Comic Sans MS'];

  return (
    <div className="toolbar">
      {/* Tools Section */}
      <div className="toolbar-section">
        <h3>Tools</h3>
        <div className="tool-buttons">
          <button
            className={tool === 'select' ? 'active' : ''}
            onClick={() => setTool('select')}
            title="Select Tool (V)"
          >
            <span className="tool-icon">↖️</span>
            <span className="tool-label">Select</span>
          </button>
          <button
            className={tool === 'text' ? 'active' : ''}
            onClick={() => setTool('text')}
            title="Text Tool (T)"
          >
            <span className="tool-icon">📝</span>
            <span className="tool-label">Text</span>
          </button>
          <button
            className={tool === 'brush' ? 'active' : ''}
            onClick={() => setTool('brush')}
            title="Brush Tool (B)"
          >
            <span className="tool-icon">🖌️</span>
            <span className="tool-label">Brush</span>
          </button>
          <button
            className={tool === 'eraser' ? 'active' : ''}
            onClick={() => setTool('eraser')}
            title="Eraser Tool (E)"
          >
            <span className="tool-icon">🧽</span>
            <span className="tool-label">Eraser</span>
          </button>
        </div>

        {/* Brush Settings - Show directly below when brush is active */}
        {tool === 'brush' && (
          <div className="tool-settings">
            <div className="input-group">
              <label>Brush Size:</label>
              <input
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
              />
              <span className="range-value">{brushSize}px</span>
            </div>
            <div className="color-input-group">
              <label>Brush Color:</label>
              <input
                type="color"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
              />
              <span className="color-value">{currentColor}</span>
            </div>
          </div>
        )}

        {/* Eraser Settings - Show directly below when eraser is active */}
        {tool === 'eraser' && (
          <div className="tool-settings">
            <div className="input-group">
              <label>Eraser Size:</label>
              <input
                type="range"
                min="1"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
              />
              <span className="range-value">{brushSize}px</span>
            </div>
          </div>
        )}
        
        <h4 style={{margin: '1rem 0 0.5rem 0', color: '#475569', fontSize: '0.875rem'}}>Shapes</h4>
        <div className="tool-buttons">
          <button
            className={tool === 'rect' ? 'active' : ''}
            onClick={() => setTool('rect')}
            title="Rectangle Tool (R)"
          >
            <span className="tool-icon">▭</span>
            <span className="tool-label">Rectangle</span>
          </button>
          <button
            className={tool === 'circle' ? 'active' : ''}
            onClick={() => setTool('circle')}
            title="Circle Tool (C)"
          >
            <span className="tool-icon">⭕</span>
            <span className="tool-label">Circle</span>
          </button>
          <button
            className={tool === 'polygon' ? 'active' : ''}
            onClick={() => setTool('polygon')}
            title="Polygon Tool"
          >
            <span className="tool-icon">⬟</span>
            <span className="tool-label">Polygon</span>
          </button>
          <button
            className={tool === 'star' ? 'active' : ''}
            onClick={() => setTool('star')}
            title="Star Tool"
          >
            <span className="tool-icon">⭐</span>
            <span className="tool-label">Star</span>
          </button>
        </div>

        {/* Polygon Settings - Show directly below when polygon is active */}
        {tool === 'polygon' && (
          <div className="tool-settings">
            <div className="input-group">
              <label>Number of Sides:</label>
              <input
                type="range"
                min="3"
                max="12"
                value={polygonSides}
                onChange={(e) => setPolygonSides(parseInt(e.target.value))}
              />
              <span className="range-value">{polygonSides} sides</span>
            </div>
          </div>
        )}
      </div>

      {/* Colors Section */}
      <div className="toolbar-section">
        <h3>Colors</h3>
        <div className="color-controls">
          <div className="color-input-group">
            <label>Fill Color:</label>
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
            />
            <span className="color-value">{currentColor}</span>
          </div>
          <div className="color-input-group">
            <label>Background:</label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
            <span className="color-value">{backgroundColor}</span>
          </div>
        </div>
      </div>

      {/* Text Properties */}
      <div className="toolbar-section">
        <h3>Text & Drawing</h3>
        <div className="text-controls">
          <div className="input-group">
            <label>Font Size:</label>
            <input
              type="number"
              min="8"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
            />
          </div>
          <div className="input-group">
            <label>Font Family:</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
            >
              {fontOptions.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
          <div className="color-input-group">
            <label>Text Color:</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
            <span className="color-value">{textColor}</span>
          </div>
          <div className="input-group">
            <label>Brush Size:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
            />
            <span className="range-value">{brushSize}px</span>
          </div>
        </div>
      </div>

      {/* Selected Element Properties */}
      {selectedElement && (
        <div className="toolbar-section">
          <h3>Selected Element</h3>
          <div className="element-controls">
            <div className="input-group">
              <label>X:</label>
              <input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => onElementChange(selectedElement.id, { x: parseInt(e.target.value) })}
              />
            </div>
            <div className="input-group">
              <label>Y:</label>
              <input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => onElementChange(selectedElement.id, { y: parseInt(e.target.value) })}
              />
            </div>
            {selectedElement.type === 'rect' && (
              <>
                <div className="input-group">
                  <label>Width:</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.width || 0)}
                    onChange={(e) => onElementChange(selectedElement.id, { width: parseInt(e.target.value) })}
                  />
                </div>
                <div className="input-group">
                  <label>Height:</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.height || 0)}
                    onChange={(e) => onElementChange(selectedElement.id, { height: parseInt(e.target.value) })}
                  />
                </div>
              </>
            )}
            {selectedElement.type === 'text' && (
              <>
                <div className="input-group">
                  <label>Font Size:</label>
                  <input
                    type="number"
                    min="8"
                    max="72"
                    value={selectedElement.fontSize || 16}
                    onChange={(e) => onElementChange(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                  />
                </div>
                <div className="input-group">
                  <label>Font:</label>
                  <select
                    value={selectedElement.fontFamily || 'Arial'}
                    onChange={(e) => onElementChange(selectedElement.id, { fontFamily: e.target.value })}
                  >
                    {fontOptions.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
                <div className="color-input-group">
                  <label>Text Color:</label>
                  <input
                    type="color"
                    value={selectedElement.fill}
                    onChange={(e) => onElementChange(selectedElement.id, { fill: e.target.value })}
                  />
                  <span className="color-value">{selectedElement.fill}</span>
                </div>
              </>
            )}
            {selectedElement.type !== 'text' && (
              <div className="input-group">
                <label>Color:</label>
                <input
                  type="color"
                  value={selectedElement.fill}
                  onChange={(e) => onElementChange(selectedElement.id, { fill: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions Section */}
      <div className="toolbar-section">
        <h3>Actions</h3>
        <div className="action-buttons">
          <button onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
            ↶ Undo
          </button>
          <button onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
            ↷ Redo
          </button>
          <button onClick={onDelete} disabled={!selectedElement} title="Delete (Del)">
            🗑️ Delete
          </button>
          <button onClick={onAIGenerate} title="AI Generate Website" className="ai-generate-btn">
            🤖 AI Generate
          </button>
          <button onClick={onClear} title="Clear All" className="clear-btn">
            🗑️ Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
