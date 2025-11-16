'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface DraggableItem {
  id: string;
  x: number;
  y: number;
  src: string;
  alt: string;
}

const PlaygroundPage: React.FC = () => {
  // Function to generate well-distributed positions across the viewport (avoiding sidebar)
  const getDistributedPosition = (index: number, total: number) => {
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
  };

  // Available images from playground folder - will maintain natural aspect ratios
  const playgroundImages = [
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

  const [items, setItems] = useState<DraggableItem[]>([]);

  // Initialize items with distributed positions on mount
  useEffect(() => {
    const initialItems: DraggableItem[] = [];
    
    playgroundImages.forEach((img, index) => {
      const position = getDistributedPosition(index, playgroundImages.length);
      initialItems.push({
        id: `image-${index + 1}`,
        x: position.x,
        y: position.y,
        src: img.src,
        alt: img.alt
      });
    });
    
    setItems(initialItems);
  }, []);

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    const item = items.find(i => i.id === itemId);
    if (!item) return;

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

    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
    setDraggedItem(itemId);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggedItem || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;

    setItems(prev => prev.map(item => 
      item.id === draggedItem 
        ? { ...item, x: newX, y: newY }
        : item
    ));
  };

  const handleTouchMove = (e: TouchEvent) => {
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
  };

  const handleMouseUp = () => {
    setDraggedItem(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleTouchEnd = () => {
    setDraggedItem(null);
    setDragOffset({ x: 0, y: 0 });
  };

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
  }, [draggedItem, dragOffset]);

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
              ${draggedItem === item.id ? 'z-50 shadow-2xl' : 'z-10'}
            `}
            style={{
              left: item.x,
              top: item.y,
              userSelect: 'none'
            }}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
            onTouchStart={(e) => handleTouchStart(e, item.id)}
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
