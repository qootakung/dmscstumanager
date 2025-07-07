
import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ResizableTableProps {
  children: React.ReactNode;
  className?: string;
}

interface ResizableThProps {
  children: React.ReactNode;
  className?: string;
  width?: number;
  onResize?: (width: number) => void;
}

interface ResizableTdProps {
  children?: React.ReactNode;
  className?: string;
  width?: number;
}

export const ResizableTable: React.FC<ResizableTableProps> = ({ children, className }) => {
  return (
    <div className="w-full overflow-auto">
      <table className={cn("w-full border-collapse border border-black", className)}>
        {children}
      </table>
    </div>
  );
};

export const ResizableTh: React.FC<ResizableThProps> = ({ 
  children, 
  className, 
  width = 150,
  onResize 
}) => {
  const [currentWidth, setCurrentWidth] = useState(width);
  const [isResizing, setIsResizing] = useState(false);
  const thRef = useRef<HTMLTableCellElement>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startX.current = e.clientX;
    startWidth.current = currentWidth;
    
    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX.current;
      const newWidth = Math.max(50, startWidth.current + diff);
      setCurrentWidth(newWidth);
      onResize?.(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [currentWidth, onResize]);

  return (
    <th
      ref={thRef}
      className={cn(
        "border border-black px-2 py-1 text-center font-medium bg-gray-100 relative",
        className
      )}
      style={{ width: `${currentWidth}px`, minWidth: `${currentWidth}px` }}
    >
      {children}
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors",
          isResizing && "bg-blue-500"
        )}
        onMouseDown={handleMouseDown}
      />
    </th>
  );
};

export const ResizableTd: React.FC<ResizableTdProps> = ({ 
  children, 
  className,
  width 
}) => {
  return (
    <td
      className={cn("border border-black px-2 py-1", className)}
      style={width ? { width: `${width}px`, minWidth: `${width}px` } : undefined}
    >
      {children}
    </td>
  );
};
