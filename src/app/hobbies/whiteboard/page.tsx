'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface DrawingPoint {
  x: number;
  y: number;
  color: string;
  size: number;
  timestamp: number;
}

interface DrawingStroke {
  id: string;
  points: DrawingPoint[];
  color: string;
  size: number;
  timestamp: number;
}

const COLORS = [
  '#000000', // Black
  '#EF4444', // Red
  '#F97316', // Orange  
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#6366F1', // Indigo
  '#84CC16', // Lime
  '#F43F5E', // Rose
  '#6B7280', // Gray
  '#FFFFFF', // White
];

const BRUSH_SIZES = [2, 4, 8, 12, 16];
const ERASER_SIZE = 8;

const WhiteboardPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentSize, setCurrentSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawingPoint[]>([]);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Load existing drawings from API
  const loadDrawings = useCallback(async () => {
    try {
      const response = await fetch('/api/whiteboard/drawings');
      if (response.ok) {
        const data = await response.json();
        setStrokes(data.strokes || []);
      }
    } catch (error) {
      console.error('Error loading drawings:', error);
    }
  }, []);

  // Save drawing stroke to API
  const saveStroke = useCallback(async (stroke: DrawingStroke) => {
    try {
      await fetch('/api/whiteboard/drawings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stroke }),
      });
    } catch (error) {
      console.error('Error saving stroke:', error);
    }
  }, []);

  // Redraw entire canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context and apply offset
    ctx.save();
    ctx.translate(canvasOffset.x, canvasOffset.y);

    // Draw all strokes
    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;

      if (stroke.color === 'ERASER') {
        // Eraser mode - completely remove pixels
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        // Normal drawing mode
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
      }
      
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      
      ctx.stroke();
    });

    // Restore context
    ctx.restore();
  }, [strokes, canvasOffset]);

  // Initialize canvas and load existing drawings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setCanvasSize({ width, height });
      canvas.width = width;
      canvas.height = height;
      
      // Redraw all strokes after resize
      redrawCanvas();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    loadDrawings();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [loadDrawings, redrawCanvas]);

  // Redraw canvas when strokes change
  useEffect(() => {
    redrawCanvas();
  }, [strokes, redrawCanvas, canvasSize]);

  // Get mouse/touch position relative to canvas
  const getCanvasPosition = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left - canvasOffset.x,
      y: clientY - rect.top - canvasOffset.y,
    };
  }, [canvasOffset]);

  // Start drawing or dragging
  const startInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Check if middle mouse button or two fingers for dragging
    const shouldDrag = ('button' in e && e.button === 1) || 
                      ('touches' in e && e.touches.length === 2);
    
    if (shouldDrag) {
      setIsDragging(true);
      setDragStart({ x: clientX, y: clientY });
    } else {
      setIsDrawing(true);
      const pos = getCanvasPosition(e.nativeEvent);
      const point: DrawingPoint = {
        x: pos.x,
        y: pos.y,
        color: isEraser ? 'ERASER' : currentColor,
        size: isEraser ? ERASER_SIZE : currentSize,
        timestamp: Date.now(),
      };
      setCurrentStroke([point]);
    }
  }, [getCanvasPosition, currentColor, currentSize, isEraser]);

  // Handle mouse/touch move
  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    
    if (isDragging) {
      // Handle canvas dragging
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const deltaX = clientX - dragStart.x;
      const deltaY = clientY - dragStart.y;
      
      setCanvasOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setDragStart({ x: clientX, y: clientY });
    } else if (isDrawing) {
      // Handle drawing
      const pos = getCanvasPosition(e);
      const point: DrawingPoint = {
        x: pos.x,
        y: pos.y,
        color: isEraser ? 'ERASER' : currentColor,
        size: isEraser ? ERASER_SIZE : currentSize,
        timestamp: Date.now(),
      };

      setCurrentStroke(prev => [...prev, point]);

      // Draw current stroke in real-time
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.translate(canvasOffset.x, canvasOffset.y);

      if (isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = ERASER_SIZE;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentSize;
      }
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (currentStroke.length > 0) {
        const lastPoint = currentStroke[currentStroke.length - 1];
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }

      ctx.restore();
    }
  }, [isDragging, isDrawing, dragStart, getCanvasPosition, currentColor, currentSize, isEraser, currentStroke, canvasOffset]);

  // Stop interaction
  const stopInteraction = useCallback(async () => {
    if (isDragging) {
      setIsDragging(false);
    }
    
    if (isDrawing && currentStroke.length > 0) {
      setIsDrawing(false);
      
      // Create stroke object
      const stroke: DrawingStroke = {
        id: `stroke-${Date.now()}-${Math.random()}`,
        points: currentStroke,
        color: isEraser ? 'ERASER' : currentColor,
        size: isEraser ? ERASER_SIZE : currentSize,
        timestamp: Date.now(),
      };

      // Add to strokes and save
      setStrokes(prev => [...prev, stroke]);
      await saveStroke(stroke);
      setCurrentStroke([]);
    }
  }, [isDragging, isDrawing, currentStroke, currentColor, currentSize, isEraser, saveStroke]);


  // Event listeners for mouse and touch
  useEffect(() => {
    if (isDrawing || isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', stopInteraction);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', stopInteraction);

      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', stopInteraction);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', stopInteraction);
      };
    }
  }, [isDrawing, isDragging, handleMove, stopInteraction]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Controls - Top Left */}
      <div className="fixed top-4 left-4 lg:left-72 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-xl px-4 py-3 border border-zinc-200 dark:border-zinc-800 shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          {/* Color Palette */}
          <div className="flex gap-1">
            {COLORS.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  currentColor === color && !isEraser
                    ? 'border-zinc-900 dark:border-zinc-100 scale-110'
                    : 'border-zinc-300 dark:border-zinc-600 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setCurrentColor(color);
                  setIsEraser(false);
                }}
                aria-label={`Select ${color} color`}
              />
            ))}
          </div>

          {/* Brush Size */}
          <div className="flex gap-1">
            {BRUSH_SIZES.map((size) => (
              <button
                key={size}
                className={`w-8 h-8 rounded-lg border transition-all flex items-center justify-center ${
                  currentSize === size && !isEraser
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800'
                    : 'border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
                onClick={() => {
                  setCurrentSize(size);
                  setIsEraser(false);
                }}
              >
                <div
                  className="rounded-full bg-zinc-600 dark:bg-zinc-400"
                  style={{
                    width: Math.min(size, 12),
                    height: Math.min(size, 12),
                  }}
                />
              </button>
            ))}
          </div>

          {/* Eraser */}
          <button
            className={`px-3 py-1 rounded-lg border transition-all text-xs font-medium ${
              isEraser
                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                : 'border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
            onClick={() => setIsEraser(!isEraser)}
          >
            Eraser
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="fixed bottom-4 left-4 lg:left-72 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-xl px-4 py-3 border border-zinc-200 dark:border-zinc-800 shadow-lg max-w-sm">
        <div className="text-sm text-zinc-700 dark:text-zinc-300">
          <div className="font-medium mb-1">🎨 Infinite Canvas</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            • Click and drag to draw<br/>
            • Middle-click and drag to move canvas<br/>
            • Use eraser to remove strokes<br/>
            • All drawings are saved automatically
          </div>
        </div>
      </div>

      {/* Canvas Container with White Background */}
      <div className="absolute inset-0 bg-white">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair touch-none"
          onMouseDown={startInteraction}
          onTouchStart={startInteraction}
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            cursor: isDragging ? 'grabbing' : isEraser ? 'crosshair' : 'crosshair'
          }}
        />
      </div>
    </div>
  );
};

export default WhiteboardPage;
