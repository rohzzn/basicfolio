'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface DraggableItem {
  id: string;
  x: number;
  y: number;
  src: string;
  alt: string;
  zIndex: number;
}

interface PhotoLikes {
  [photoId: string]: number;
}

interface HeartAnimation {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}


// Available images from playground folder - will maintain natural aspect ratios
const PLAYGROUND_IMAGES = [
  { src: '/images/playground/1.png', alt: 'Personal moment 1' },
  { src: '/images/playground/2.png', alt: 'Personal moment 2' },
  { src: '/images/playground/3.png', alt: 'Personal moment 3' },
  { src: '/images/playground/4.png', alt: 'Personal moment 4' },
  { src: '/images/playground/5.png', alt: 'Personal moment 5' },
  { src: '/images/playground/6.png', alt: 'Personal moment 6' },
  { src: '/images/playground/7.png', alt: 'Personal moment 7' },
  { src: '/images/playground/8.png', alt: 'Personal moment 8' },
  { src: '/images/playground/9.png', alt: 'Personal moment 9' },
  { src: '/images/playground/10.png', alt: 'Personal moment 10' },
  { src: '/images/playground/11.png', alt: 'Personal moment 11' },
  { src: '/images/playground/12.png', alt: 'Personal moment 12' },
  { src: '/images/playground/13.png', alt: 'Personal moment 13' },
  { src: '/images/playground/14.png', alt: 'Personal moment 14' },
  { src: '/images/playground/15.png', alt: 'Personal moment 15' }
];

const PlaygroundPage: React.FC = () => {
  // Function to generate well-distributed positions across the viewport (avoiding sidebar)
  const getDistributedPosition = useCallback((index: number, total: number) => {
    // Create a grid-like distribution with some randomness
    const cols = Math.ceil(Math.sqrt(total));
    const rows = Math.ceil(total / cols);
    
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    // Account for sidebar width (approximately 256px on desktop)
    const sidebarWidth = window.innerWidth >= 1024 ? 256 : 0; // lg:pl-64 = 256px
    const padding = 50;
    const rightPadding = 350; // Account for image width
    const bottomPadding = 250; // Account for image height
    
    // Calculate available space (excluding sidebar)
    const availableWidth = window.innerWidth - sidebarWidth - padding - rightPadding;
    const availableHeight = window.innerHeight - (padding * 2) - bottomPadding;
    
    const cellWidth = availableWidth / cols;
    const cellHeight = availableHeight / rows;
    
    // Base position in grid (starting after sidebar)
    const baseX = sidebarWidth + padding + (col * cellWidth);
    const baseY = padding + (row * cellHeight);
    
    // Add randomness within each cell (but keep within cell bounds)
    const randomOffsetX = (Math.random() - 0.5) * (cellWidth * 0.6);
    const randomOffsetY = (Math.random() - 0.5) * (cellHeight * 0.6);
    
    return {
      x: Math.max(sidebarWidth + 20, Math.min(window.innerWidth - rightPadding, baseX + randomOffsetX)),
      y: Math.max(20, Math.min(window.innerHeight - bottomPadding, baseY + randomOffsetY))
    };
  }, []);

  const [items, setItems] = useState<DraggableItem[]>([]);
  const [, setLikes] = useState<PhotoLikes>({});
  const [totalLikes, setTotalLikes] = useState<number>(0);
  const [heartAnimations, setHeartAnimations] = useState<HeartAnimation[]>([]);
  const [maxZIndex, setMaxZIndex] = useState<number>(10);

  // Fetch likes from API
  const fetchLikes = useCallback(async () => {
    try {
      const response = await fetch('/api/playground/likes');
      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes || {});
        setTotalLikes(data.totalLikes || 0);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  }, []);

  // Add a like to a photo
  const addLike = useCallback(async (photoId: string) => {
    try {
      const response = await fetch('/api/playground/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoId }),
      });

      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes || {});
        setTotalLikes(data.totalLikes || 0);
        return true;
      }
    } catch (error) {
      console.error('Error adding like:', error);
    }
    return false;
  }, []);

  // Handle double click to like
  const handleDoubleClick = useCallback(async (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent dragging when double-clicking
    setDraggedItem(null);
    setDragOffset({ x: 0, y: 0 });

    // Get click position relative to the image
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;


    // Add like
    const success = await addLike(itemId);
    
    if (success) {
      // Create heart animation
      const heartId = `heart-${Date.now()}-${Math.random()}`;
      const newHeart: HeartAnimation = {
        id: heartId,
        x: centerX,
        y: centerY,
        timestamp: Date.now()
      };

      setHeartAnimations(prev => [...prev, newHeart]);

      // Remove heart animation after 2 seconds
      setTimeout(() => {
        setHeartAnimations(prev => prev.filter(heart => heart.id !== heartId));
      }, 2000);
    }
  }, [addLike]);

  // Initialize items with distributed positions on mount
  useEffect(() => {
    const initialItems: DraggableItem[] = [];
    
    PLAYGROUND_IMAGES.forEach((img, index) => {
      const position = getDistributedPosition(index, PLAYGROUND_IMAGES.length);
      initialItems.push({
        id: `image-${index + 1}`,
        x: position.x,
        y: position.y,
        src: img.src,
        alt: img.alt,
        zIndex: 10 + index
      });
    });
    
    setItems(initialItems);
    fetchLikes(); // Fetch likes when component mounts
  }, [getDistributedPosition, fetchLikes]);

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // Bring clicked item to top
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    setItems(prev => prev.map(i => 
      i.id === itemId ? { ...i, zIndex: newZIndex } : i
    ));

    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDraggedItem(itemId);
  };

  const handleTouchStart = (e: React.TouchEvent, itemId: string) => {
    e.preventDefault();
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // Bring touched item to top
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    setItems(prev => prev.map(i => 
      i.id === itemId ? { ...i, zIndex: newZIndex } : i
    ));

    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
    setDraggedItem(itemId);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedItem || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;

    setItems(prev => prev.map(item => 
      item.id === draggedItem 
        ? { ...item, x: newX, y: newY }
        : item
    ));
  }, [draggedItem, dragOffset.x, dragOffset.y]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!draggedItem || !containerRef.current) return;

    const touch = e.touches[0];
    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = touch.clientX - containerRect.left - dragOffset.x;
    const newY = touch.clientY - containerRect.top - dragOffset.y;

    setItems(prev => prev.map(item => 
      item.id === draggedItem 
        ? { ...item, x: newX, y: newY }
        : item
    ));
  }, [draggedItem, dragOffset.x, dragOffset.y]);

  const handleMouseUp = useCallback(() => {
    setDraggedItem(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const handleTouchEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (draggedItem) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [draggedItem, handleMouseMove, handleTouchMove, handleMouseUp, handleTouchEnd]);

  return (
    <div className="fixed inset-0 overflow-visible">
      {/* Designer Dots Background */}
      <div 
        className="absolute inset-0 opacity-40 dark:opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(156, 163, 175, 0.6) 1px, transparent 0)
          `,
          backgroundSize: '16px 16px'
        }}
      />
      
      {/* Secondary Dot Layer for Depth */}
      <div 
        className="absolute inset-0 opacity-20 dark:opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(156, 163, 175, 0.4) 0.5px, transparent 0)
          `,
          backgroundSize: '8px 8px',
          backgroundPosition: '4px 4px'
        }}
      />
      
      {/* Heart Counter */}
      <div className="fixed top-4 right-4 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-full px-4 py-2 border border-zinc-200 dark:border-zinc-800 shadow-lg">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <span className="text-red-500 text-lg">❤️</span>
          <span>{totalLikes.toLocaleString()}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">total loves</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="fixed bottom-4 left-4 lg:left-72 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-xl px-4 py-3 border border-zinc-200 dark:border-zinc-800 shadow-lg max-w-sm">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">❤️</span>
            </div>
          </div>
          <div className="text-sm text-zinc-700 dark:text-zinc-300">
            <div className="font-medium">Double-click any photo</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">to show some love</div>
          </div>
        </div>
      </div>


      {/* Heart Animations */}
      {heartAnimations.map((heart) => (
        <div
          key={heart.id}
          className="fixed pointer-events-none z-50"
          style={{
            left: heart.x - 16,
            top: heart.y - 16,
            animation: 'heartFloat 2s ease-out forwards'
          }}
        >
          <div className="text-3xl drop-shadow-lg animate-pulse">❤️</div>
        </div>
      ))}

      {/* Content Container */}
      <div 
        ref={containerRef}
        className="absolute inset-0 p-4 md:p-8 cursor-default select-none"
        style={{ 
          overflow: 'visible',
          width: '100vw',
          height: '100vh'
        }}
      >

        {/* Draggable Images */}
        {items.map((item) => (
          <div
            key={item.id}
            className={`
              absolute cursor-move rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200
              border-2 border-white dark:border-zinc-800
              ${draggedItem === item.id ? 'shadow-2xl' : ''}
            `}
            style={{
              left: item.x,
              top: item.y,
              zIndex: item.zIndex,
              userSelect: 'none'
            }}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
            onTouchStart={(e) => handleTouchStart(e, item.id)}
            onDoubleClick={(e) => handleDoubleClick(e, item.id)}
          >
            <Image
              src={item.src}
              alt={item.alt}
              width={0}
              height={0}
              sizes="100vw"
              className="w-auto h-auto max-w-xs max-h-xs"
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: '300px',
                maxHeight: '300px'
              }}
              draggable={false}
              quality={100}
              priority
              unoptimized
            />
            
          </div>
        ))}

      </div>
    </div>
  );
};

export default PlaygroundPage;
