import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Transformer, Line, Circle, RegularPolygon, Star } from 'react-konva';
import Konva from 'konva';
import Toolbar from './Toolbar.tsx';
import PreviewModal from './PreviewModal.tsx';
import AdminPanel from './AdminPanel.tsx';
import AIGenerationModal from './AIGenerationModal.tsx';
import './PortfolioDesigner.css';

export interface CanvasElement {
  id: string;
  type: 'rect' | 'circle' | 'polygon' | 'star' | 'text' | 'path';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  sides?: number; // For polygon tool
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  points?: number[];
  draggable: boolean;
  rotation?: number;
}

const PortfolioDesigner: React.FC = () => {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]); // For multi-selection
  const [tool, setTool] = useState<'select' | 'rect' | 'circle' | 'polygon' | 'star' | 'text' | 'brush' | 'eraser'>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false); // For area selection
  const [selectionStart, setSelectionStart] = useState<{x: number, y: number} | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{x: number, y: number} | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState('#3b82f6');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [brushSize, setBrushSize] = useState(3);
  const [polygonSides, setPolygonSides] = useState(3); // For polygon tool
  const [history, setHistory] = useState<CanvasElement[][]>([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAIGeneration, setShowAIGeneration] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [showAlignmentGuides, setShowAlignmentGuides] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const isPainting = useRef(false);

  // Fixed canvas dimensions for debugging
  const canvasWidth = 1200;
  const canvasHeight = 800;

  // Helper function to check if element is in selection area
  const isElementInSelection = (element: CanvasElement, start: {x: number, y: number}, end: {x: number, y: number}) => {
    const selectionX = Math.min(start.x, end.x);
    const selectionY = Math.min(start.y, end.y);
    const selectionWidth = Math.abs(end.x - start.x);
    const selectionHeight = Math.abs(end.y - start.y);

    // Check if element overlaps with selection rectangle
    if (element.type === 'rect') {
      const elementRight = element.x + (element.width || 0);
      const elementBottom = element.y + (element.height || 0);
      const selectionRight = selectionX + selectionWidth;
      const selectionBottom = selectionY + selectionHeight;

      return !(element.x > selectionRight || 
               elementRight < selectionX || 
               element.y > selectionBottom || 
               elementBottom < selectionY);
    } else if (element.type === 'circle' || element.type === 'polygon' || element.type === 'star') {
      const elementRadius = element.radius || 0;
      const elementLeft = element.x - elementRadius;
      const elementRight = element.x + elementRadius;
      const elementTop = element.y - elementRadius;
      const elementBottom = element.y + elementRadius;
      const selectionRight = selectionX + selectionWidth;
      const selectionBottom = selectionY + selectionHeight;

      return !(elementLeft > selectionRight || 
               elementRight < selectionX || 
               elementTop > selectionBottom || 
               elementBottom < selectionY);
    } else if (element.type === 'text') {
      // Approximate text bounds
      const textWidth = (element.text?.length || 0) * (element.fontSize || 16) * 0.6;
      const textHeight = element.fontSize || 16;
      const elementRight = element.x + textWidth;
      const elementBottom = element.y + textHeight;
      const selectionRight = selectionX + selectionWidth;
      const selectionBottom = selectionY + selectionHeight;

      return !(element.x > selectionRight || 
               elementRight < selectionX || 
               element.y > selectionBottom || 
               elementBottom < selectionY);
    }
    return false;
  };

  // Update transformer when selection changes
  useEffect(() => {
    // Don't show transformer during brush/eraser use
    if ((tool === 'brush' || tool === 'eraser') && (isPainting.current || isDrawing)) {
      return;
    }
    
    if (transformerRef.current && stageRef.current) {
      // Handle multi-selection
      if (selectedIds.length > 0) {
        const selectedNodes = selectedIds
          .map(id => stageRef.current?.findOne(`#${id}`))
          .filter((node): node is Konva.Node => node !== undefined);
        transformerRef.current.nodes(selectedNodes);
        transformerRef.current.getLayer()?.batchDraw();
      } else if (selectedId) {
        const selectedNode = stageRef.current.findOne(`#${selectedId}`);
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode]);
          transformerRef.current.getLayer()?.batchDraw();
        }
      } else {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectedId, selectedIds, tool, isPainting.current, isDrawing]);

  // Save to history
  const saveToHistory = useCallback((newElements: CanvasElement[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  }, [history, historyStep]);

  // Undo
  const undo = useCallback(() => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setElements([...history[historyStep - 1]]);
    }
  }, [history, historyStep]);

  // Redo
  const redo = useCallback(() => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setElements([...history[historyStep + 1]]);
    }
  }, [history, historyStep]);

  // Handle stage click
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
      return;
    }

    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
      return;
    }

    if (tool === 'select') {
      setSelectedId(e.target.id());
    }
  };

  // Handle stage mouse down - updated for area selection and fixed eraser
  const handleStageMouseDown = (e: any) => {
    // Check if we clicked on a shape (not the stage background)
    const clickedOnBackground = e.target === e.target.getStage() || e.target.name() === 'background';
    
    if (tool === 'select') {
      if (clickedOnBackground) {
        // Start area selection
        if (!stageRef.current) return;
        const pos = stageRef.current.getPointerPosition();
        if (!pos) return;
        
        setIsSelecting(true);
        setSelectionStart(pos);
        setSelectionEnd(pos);
        setSelectedId(null);
        setSelectedIds([]);
      } else {
        // Single element selection
        setSelectedId(e.target.id());
        setSelectedIds([]);
      }
      return;
    }

    // If we clicked on an existing shape (not background), don't create a new one
    if (!clickedOnBackground) {
      console.log('Clicked on existing shape, not creating new one');
      return;
    }

    if (!stageRef.current) {
      return;
    }

    const stage = stageRef.current;
    const pos = stage.getPointerPosition();
    
    if (!pos) {
      return;
    }

    setIsDrawing(true);
    
    const id = `${tool}_${Date.now()}`;
    
    if (tool === 'rect') {
      const newRect: CanvasElement = {
        id,
        type: 'rect',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        fill: currentColor,
        stroke: '#000000',
        strokeWidth: 2,
        draggable: true,
      };
      setElements(prev => [...prev, newRect]);
      setSelectedId(id);
    } else if (tool === 'circle') {
      const newCircle: CanvasElement = {
        id,
        type: 'circle',
        x: pos.x,
        y: pos.y,
        radius: 0,
        fill: currentColor,
        stroke: '#000000',
        strokeWidth: 2,
        draggable: true,
      };
      setElements(prev => [...prev, newCircle]);
      setSelectedId(id);
    } else if (tool === 'polygon') {
      const newPolygon: CanvasElement = {
        id,
        type: 'polygon',
        x: pos.x,
        y: pos.y,
        radius: 0,
        sides: polygonSides,
        fill: currentColor,
        stroke: '#000000',
        strokeWidth: 2,
        draggable: true,
      };
      setElements(prev => [...prev, newPolygon]);
      setSelectedId(id);
    } else if (tool === 'star') {
      const newStar: CanvasElement = {
        id,
        type: 'star',
        x: pos.x,
        y: pos.y,
        radius: 0,
        fill: currentColor,
        stroke: '#000000',
        strokeWidth: 2,
        draggable: true,
      };
      setElements(prev => [...prev, newStar]);
      setSelectedId(id);
    } else if (tool === 'text') {
      const newText: CanvasElement = {
        id,
        type: 'text',
        x: pos.x,
        y: pos.y,
        text: 'Enter your text',
        fontSize,
        fontFamily,
        fill: textColor,
        draggable: true,
      };
      setElements(prev => [...prev, newText]);
      setSelectedId(id);
      setIsDrawing(false);
      
      // Auto-open text editor after a short delay to ensure the element is rendered
      setTimeout(() => {
        startTextEditing(newText, true);
      }, 100);
    } else if (tool === 'brush') {
      isPainting.current = true;
      setIsDrawing(true);
      const newPath: CanvasElement = {
        id,
        type: 'path',
        x: 0,
        y: 0,
        points: [pos.x, pos.y],
        fill: '',
        stroke: currentColor,
        strokeWidth: brushSize,
        draggable: false,
      };
      setElements(prev => [...prev, newPath]);
      setSelectedId(id);
    } else if (tool === 'eraser') {
      isPainting.current = true;
      setIsDrawing(true);
      
      // Find elements at this position and remove them
      const elementsToRemove = elements.filter(el => {
        if (el.type === 'rect') {
          return pos.x >= el.x && pos.x <= (el.x + (el.width || 0)) &&
                 pos.y >= el.y && pos.y <= (el.y + (el.height || 0));
        } else if (el.type === 'circle') {
          const distance = Math.sqrt(Math.pow(pos.x - el.x, 2) + Math.pow(pos.y - el.y, 2));
          return distance <= (el.radius || 0);
        } else if (el.type === 'polygon' || el.type === 'star') {
          const distance = Math.sqrt(Math.pow(pos.x - el.x, 2) + Math.pow(pos.y - el.y, 2));
          return distance <= (el.radius || 0);
        } else if (el.type === 'text') {
          const textWidth = (el.text?.length || 0) * (el.fontSize || 16) * 0.6;
          const textHeight = el.fontSize || 16;
          return pos.x >= el.x && pos.x <= (el.x + textWidth) &&
                 pos.y >= el.y && pos.y <= (el.y + textHeight);
        } else if (el.type === 'path') {
          // Check if point is near any point in the path
          const points = el.points || [];
          for (let i = 0; i < points.length; i += 2) {
            const distance = Math.sqrt(Math.pow(pos.x - points[i], 2) + Math.pow(pos.y - points[i + 1], 2));
            if (distance <= (el.strokeWidth || 2) + 5) {
              return true;
            }
          }
        }
        return false;
      });
      
      if (elementsToRemove.length > 0) {
        setElements(prev => prev.filter(el => !elementsToRemove.includes(el)));
      }
    }
  };

  // Handle stage mouse move - updated for area selection
  const handleStageMouseMove = () => {
    if (!stageRef.current) return;

    const stage = stageRef.current;
    const pos = stage.getPointerPosition();
    if (!pos) {
      // Mouse is out of bounds, stop painting and selection
      if ((tool === 'brush' || tool === 'eraser') && isPainting.current) {
        isPainting.current = false;
        setIsDrawing(false);
      }
      if (tool === 'select' && isSelecting) {
        setIsSelecting(false);
        setSelectionStart(null);
        setSelectionEnd(null);
      }
      return;
    }

    // Check if mouse is within canvas bounds
    if (pos.x < 0 || pos.x > canvasWidth || pos.y < 0 || pos.y > canvasHeight) {
      if ((tool === 'brush' || tool === 'eraser') && isPainting.current) {
        isPainting.current = false;
        setIsDrawing(false);
      }
      if (tool === 'select' && isSelecting) {
        setIsSelecting(false);
        setSelectionStart(null);
        setSelectionEnd(null);
      }
      return;
    }

    // Handle area selection
    if (tool === 'select' && isSelecting && selectionStart) {
      setSelectionEnd(pos);
      return;
    }

    // Handle brush painting
    if (tool === 'brush' && isPainting.current) {
      setElements(elements.map(el => {
        if (el.id === selectedId && el.type === 'path') {
          const newPoints = [...(el.points || []), pos.x, pos.y];
          return {
            ...el,
            points: newPoints,
          };
        }
        return el;
      }));
      return;
    }

    // Handle eraser
    if (tool === 'eraser' && isPainting.current) {
      // Continue erasing elements at current position
      const elementsToRemove = elements.filter(el => {
        if (el.type === 'rect') {
          return pos.x >= el.x && pos.x <= (el.x + (el.width || 0)) &&
                 pos.y >= el.y && pos.y <= (el.y + (el.height || 0));
        } else if (el.type === 'circle') {
          const distance = Math.sqrt(Math.pow(pos.x - el.x, 2) + Math.pow(pos.y - el.y, 2));
          return distance <= (el.radius || 0);
        } else if (el.type === 'polygon' || el.type === 'star') {
          const distance = Math.sqrt(Math.pow(pos.x - el.x, 2) + Math.pow(pos.y - el.y, 2));
          return distance <= (el.radius || 0);
        } else if (el.type === 'text') {
          const textWidth = (el.text?.length || 0) * (el.fontSize || 16) * 0.6;
          const textHeight = el.fontSize || 16;
          return pos.x >= el.x && pos.x <= (el.x + textWidth) &&
                 pos.y >= el.y && pos.y <= (el.y + textHeight);
        } else if (el.type === 'path') {
          // Check if point is near any point in the path
          const points = el.points || [];
          for (let i = 0; i < points.length; i += 2) {
            const distance = Math.sqrt(Math.pow(pos.x - points[i], 2) + Math.pow(pos.y - points[i + 1], 2));
            if (distance <= (el.strokeWidth || 2) + 5) {
              return true;
            }
          }
        }
        return false;
      });
      
      if (elementsToRemove.length > 0) {
        setElements(prev => prev.filter(el => !elementsToRemove.includes(el)));
      }
      return;
    }

    if (!isDrawing) return;

    setElements(elements.map(el => {
      if (el.id === selectedId) {
        if (el.type === 'rect') {
          const newWidth = pos.x - el.x;
          const newHeight = pos.y - el.y;
          return {
            ...el,
            width: Math.abs(newWidth),
            height: Math.abs(newHeight),
            x: newWidth < 0 ? pos.x : el.x,
            y: newHeight < 0 ? pos.y : el.y,
          };
        } else if (el.type === 'circle' || el.type === 'polygon' || el.type === 'star') {
          const distance = Math.sqrt(
            Math.pow(pos.x - el.x, 2) + Math.pow(pos.y - el.y, 2)
          );
          return {
            ...el,
            radius: distance,
          };
        }
      }
      return el;
    }));
  };

  // Handle stage mouse up - updated for area selection
  const handleStageMouseUp = () => {
    // Handle area selection completion
    if (tool === 'select' && isSelecting && selectionStart && selectionEnd) {
      const selectedElements = elements.filter(el => 
        isElementInSelection(el, selectionStart, selectionEnd)
      );
      
      if (selectedElements.length > 0) {
        setSelectedIds(selectedElements.map(el => el.id));
        setSelectedId(null);
      }
      
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
      return;
    }

    if (tool === 'brush' || tool === 'eraser') {
      isPainting.current = false;
    }
    if (isDrawing) {
      saveToHistory(elements);
      setIsDrawing(false);
    }
  };

  // Handle element change
  const handleElementChange = (id: string, newAttrs: Partial<CanvasElement>) => {
    const newElements = elements.map(el =>
      el.id === id ? { ...el, ...newAttrs } : el
    );
    setElements(newElements);
  };

  // Enhanced text editing function
  const startTextEditing = (element: CanvasElement, autoFocus: boolean = false) => {
    const textNode = stageRef.current?.findOne(`#${element.id}`);
    if (!textNode) return;

    setIsEditingText(true);
    setEditingTextId(element.id);

    const textPosition = textNode.absolutePosition();
    const stageBox = stageRef.current?.container().getBoundingClientRect();
    if (!stageBox) return;

    const areaPosition = {
      x: stageBox.left + textPosition.x,
      y: stageBox.top + textPosition.y,
    };

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    // Set initial text or placeholder
    const currentText = element.text || '';
    const isPlaceholder = currentText === 'Enter your text' || currentText === '';
    
    textarea.value = isPlaceholder ? '' : currentText;
    textarea.placeholder = 'Enter your text';
    textarea.style.position = 'absolute';
    textarea.style.top = areaPosition.y + 'px';
    textarea.style.left = areaPosition.x + 'px';
    textarea.style.width = Math.max(200, (element.width || 200)) + 'px';
    textarea.style.height = Math.max(30, (element.height || 30)) + 'px';
    textarea.style.fontSize = (element.fontSize || fontSize) + 'px';
    textarea.style.fontFamily = element.fontFamily || fontFamily;
    textarea.style.color = element.fill || textColor;
    textarea.style.border = '2px solid #007bff';
    textarea.style.borderRadius = '4px';
    textarea.style.padding = '4px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'white';
    textarea.style.zIndex = '1000';
    textarea.style.resize = 'none';
    textarea.style.outline = 'none';

    if (autoFocus) {
      setTimeout(() => {
        textarea.focus();
        textarea.select();
      }, 10);
    } else {
      textarea.focus();
    }

    const finishEditing = () => {
      const newText = textarea.value.trim() || 'Enter your text';
      handleElementChange(element.id, { 
        text: newText,
        fill: textColor // Update text color
      });
      document.body.removeChild(textarea);
      setIsEditingText(false);
      setEditingTextId(null);
      saveToHistory(elements);
    };

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        finishEditing();
      }
      if (e.key === 'Escape') {
        document.body.removeChild(textarea);
        setIsEditingText(false);
        setEditingTextId(null);
      }
    });

    textarea.addEventListener('blur', finishEditing);
  };

  // Handle text double click
  const handleTextDblClick = (element: CanvasElement) => {
    startTextEditing(element, false);
  };

  // Generate preview
  const generatePreview = async () => {
    try {
      const design = {
        elements,
        canvas: {
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor
        }
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ design }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }

      const result = await response.json();
      setGeneratedHtml(result.html);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      alert('Failed to generate preview');
    }
  };

  // Deploy to Vercel
  const deployToVercel = async (projectName: string) => {
    try {
      const design = {
        elements,
        canvas: {
          width: canvasWidth,
          height: canvasHeight,
          backgroundColor
        }
      };

      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ design, projectName }),
      });

      if (!response.ok) {
        throw new Error('Failed to deploy');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error deploying:', error);
      throw error;
    }
  };

  // Delete selected element(s) - updated for multi-selection
  const deleteSelected = useCallback(() => {
    if (selectedIds.length > 0) {
      const newElements = elements.filter(el => !selectedIds.includes(el.id));
      setElements(newElements);
      saveToHistory(newElements);
      setSelectedIds([]);
    } else if (selectedId) {
      const newElements = elements.filter(el => el.id !== selectedId);
      setElements(newElements);
      saveToHistory(newElements);
      setSelectedId(null);
    }
  }, [selectedId, selectedIds, elements, saveToHistory]);

  // Clear canvas - updated to clear selections
  const clearCanvas = useCallback(() => {
    setElements([]);
    setSelectedId(null);
    setSelectedIds([]);
    saveToHistory([]);
  }, [saveToHistory]);

  // Open AI Generation Modal
  const openAIGeneration = useCallback(() => {
    setShowAIGeneration(true);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser behavior for our shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      } else if (e.key === 'Escape') {
        setSelectedId(null);
        setSelectedIds([]);
        setTool('select');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, deleteSelected]);

  // Get selected element
  const selectedElement = elements.find(el => el.id === selectedId);

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
        </div>
      </div>

      <div className="main-content">
        <Toolbar
          tool={tool}
          setTool={setTool}
          currentColor={currentColor}
          setCurrentColor={setCurrentColor}
          textColor={textColor}
          setTextColor={setTextColor}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          fontSize={fontSize}
          setFontSize={setFontSize}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          polygonSides={polygonSides}
          setPolygonSides={setPolygonSides}
          selectedElement={selectedElement}
          onElementChange={handleElementChange}
          onUndo={undo}
          onRedo={redo}
          onDelete={deleteSelected}
          onClear={clearCanvas}
          onAIGenerate={openAIGeneration}
          canUndo={historyStep > 0}
          canRedo={historyStep < history.length - 1}
        />

        <div className="canvas-container">
          <div className="canvas-wrapper">
            <Stage
              ref={stageRef}
              width={canvasWidth}
              height={canvasHeight}
              onClick={handleStageClick}
              onMouseDown={handleStageMouseDown}
              onMouseMove={handleStageMouseMove}
              onMouseUp={handleStageMouseUp}
              onMouseLeave={() => {
                // Stop painting when mouse leaves canvas
                if ((tool === 'brush' || tool === 'eraser') && isPainting.current) {
                  isPainting.current = false;
                  setIsDrawing(false);
                }
                // Stop area selection when mouse leaves canvas
                if (tool === 'select' && isSelecting) {
                  setIsSelecting(false);
                  setSelectionStart(null);
                  setSelectionEnd(null);
                }
              }}
            >
            <Layer>
              <Rect
                name="background"
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                fill={backgroundColor}
              />
              
              {elements.map((element) => {
                if (element.type === 'rect') {
                  return (
                    <Rect
                      key={element.id}
                      id={element.id}
                      x={element.x}
                      y={element.y}
                      width={element.width || 0}
                      height={element.height || 0}
                      fill={element.fill}
                      stroke={element.stroke}
                      strokeWidth={element.strokeWidth || 2}
                      draggable={element.draggable}
                      onDragEnd={(e) => {
                        handleElementChange(element.id, {
                          x: e.target.x(),
                          y: e.target.y(),
                        });
                        saveToHistory(elements);
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();
                        
                        node.scaleX(1);
                        node.scaleY(1);
                        
                        handleElementChange(element.id, {
                          x: node.x(),
                          y: node.y(),
                          width: Math.max(5, node.width() * scaleX),
                          height: Math.max(5, node.height() * scaleY),
                        });
                        saveToHistory(elements);
                      }}
                      onClick={() => {
                        setSelectedId(element.id);
                        setSelectedIds([]);
                      }}
                    />
                  );
                } else if (element.type === 'circle') {
                  return (
                    <Circle
                      key={element.id}
                      id={element.id}
                      x={element.x}
                      y={element.y}
                      radius={element.radius || 0}
                      fill={element.fill}
                      stroke={element.stroke}
                      strokeWidth={element.strokeWidth || 2}
                      draggable={element.draggable}
                      onDragEnd={(e) => {
                        handleElementChange(element.id, {
                          x: e.target.x(),
                          y: e.target.y(),
                        });
                        saveToHistory(elements);
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        
                        node.scaleX(1);
                        node.scaleY(1);
                        
                        handleElementChange(element.id, {
                          x: node.x(),
                          y: node.y(),
                          radius: Math.max(5, (element.radius || 0) * scaleX),
                        });
                        saveToHistory(elements);
                      }}
                      onClick={() => setSelectedId(element.id)}
                    />
                  );
                } else if (element.type === 'polygon') {
                  return (
                    <RegularPolygon
                      key={element.id}
                      id={element.id}
                      x={element.x}
                      y={element.y}
                      sides={element.sides || 3}
                      radius={element.radius || 0}
                      fill={element.fill}
                      stroke={element.stroke}
                      strokeWidth={element.strokeWidth || 2}
                      draggable={element.draggable}
                      onDragEnd={(e) => {
                        handleElementChange(element.id, {
                          x: e.target.x(),
                          y: e.target.y(),
                        });
                        saveToHistory(elements);
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        
                        node.scaleX(1);
                        node.scaleY(1);
                        
                        handleElementChange(element.id, {
                          x: node.x(),
                          y: node.y(),
                          radius: Math.max(5, (element.radius || 0) * scaleX),
                        });
                        saveToHistory(elements);
                      }}
                      onClick={() => setSelectedId(element.id)}
                    />
                  );
                } else if (element.type === 'star') {
                  return (
                    <Star
                      key={element.id}
                      id={element.id}
                      x={element.x}
                      y={element.y}
                      numPoints={5}
                      innerRadius={element.radius ? element.radius * 0.4 : 0}
                      outerRadius={element.radius || 0}
                      fill={element.fill}
                      stroke={element.stroke}
                      strokeWidth={element.strokeWidth || 2}
                      draggable={element.draggable}
                      onDragEnd={(e) => {
                        handleElementChange(element.id, {
                          x: e.target.x(),
                          y: e.target.y(),
                        });
                        saveToHistory(elements);
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        const scaleX = node.scaleX();
                        
                        node.scaleX(1);
                        node.scaleY(1);
                        
                        handleElementChange(element.id, {
                          x: node.x(),
                          y: node.y(),
                          radius: Math.max(5, (element.radius || 0) * scaleX),
                        });
                        saveToHistory(elements);
                      }}
                      onClick={() => setSelectedId(element.id)}
                    />
                  );
                } else if (element.type === 'text') {
                  const displayText = element.text === 'Enter your text' ? element.text : element.text;
                  const isPlaceholder = element.text === 'Enter your text';
                  
                  return (
                    <Text
                      key={element.id}
                      id={element.id}
                      x={element.x}
                      y={element.y}
                      text={displayText}
                      fontSize={element.fontSize}
                      fontFamily={element.fontFamily}
                      fill={isPlaceholder ? '#999999' : element.fill}
                      opacity={isPlaceholder ? 0.7 : 1}
                      fontStyle={isPlaceholder ? 'italic' : 'normal'}
                      draggable={element.draggable && !isEditingText}
                      onDragEnd={(e) => {
                        handleElementChange(element.id, {
                          x: e.target.x(),
                          y: e.target.y(),
                        });
                        saveToHistory(elements);
                      }}
                      onDblClick={() => handleTextDblClick(element)}
                      onClick={() => {
                        setSelectedId(element.id);
                        setSelectedIds([]);
                      }}
                    />
                  );
                } else if (element.type === 'path') {
                  // Only render brush paths, not eraser paths
                  return (
                    <Line
                      key={element.id}
                      id={element.id}
                      points={element.points || []}
                      stroke={element.stroke}
                      strokeWidth={element.strokeWidth || 2}
                      tension={0.5}
                      lineCap="round"
                      lineJoin="round"
                    />
                  );
                }
                return null;
              })}
              
              {/* Selection rectangle for area selection */}
              {isSelecting && selectionStart && selectionEnd && (
                <Rect
                  x={Math.min(selectionStart.x, selectionEnd.x)}
                  y={Math.min(selectionStart.y, selectionEnd.y)}
                  width={Math.abs(selectionEnd.x - selectionStart.x)}
                  height={Math.abs(selectionEnd.y - selectionStart.y)}
                  fill="rgba(0, 123, 255, 0.1)"
                  stroke="rgba(0, 123, 255, 0.8)"
                  strokeWidth={1}
                  dash={[5, 5]}
                />
              )}
              
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            </Layer>
            </Stage>
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
          elements={elements}
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
