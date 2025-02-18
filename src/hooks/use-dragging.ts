import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

interface UseDraggingProps {
  onDragStateChange?: (isDragging: boolean) => void;
  onDragEnd?: () => void;
  debounceTime?: number;
}

export const useDragging = ({
  onDragStateChange,
  onDragEnd,
  debounceTime = 300
}: UseDraggingProps = {}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingRef = useRef(false);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
      }
      
      // Reset dragging state on unmount
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        onDragStateChange?.(false);
      }
    };
  }, [onDragStateChange]);

  const handleDragStart = useCallback(() => {
    // Cancel any pending drag end events
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    
    if (!isDraggingRef.current) {
      setIsDragging(true);
      isDraggingRef.current = true;
      onDragStateChange?.(true);
    }
  }, [onDragStateChange]);

  const handleDragEnd = useCallback(() => {
    // Debounce the drag end to prevent flickering loading states
    // when the user is making quick adjustments
    dragTimeoutRef.current = setTimeout(() => {
      setIsDragging(false);
      isDraggingRef.current = false;
      onDragStateChange?.(false);
      onDragEnd?.();
    }, debounceTime);
  }, [onDragStateChange, onDragEnd, debounceTime]);
  
  const dragHandlers = useMemo(() => ({
    onMouseDown: handleDragStart,
    onMouseUp: handleDragEnd,
    onMouseLeave: handleDragEnd,
    onTouchStart: handleDragStart,
    onTouchEnd: handleDragEnd,
    onTouchCancel: handleDragEnd
  }), [handleDragStart, handleDragEnd]);

  return {
    isDragging,
    dragHandlers
  };
};