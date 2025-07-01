import React, { useRef, useCallback, useState } from "react";

export interface SliderProps {
  value: number[];
  max: number;
  min?: number;
  step?: number;
  onValueChange: (value: number[]) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Slider component following the app's design system
 * Compatible with the existing audio seeking functionality
 */
export const Slider: React.FC<SliderProps> = ({
  value,
  max,
  min = 0,
  step = 1,
  onValueChange,
  className = "",
  disabled = false,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const currentValue = value[0] || 0;
  const percentage = ((currentValue - min) / (max - min)) * 100;

  const updateValue = useCallback(
    (clientX: number) => {
      if (!sliderRef.current || disabled) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const newPercentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const newValue = min + (newPercentage / 100) * (max - min);

      // Round to step
      const steppedValue = Math.round(newValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));

      onValueChange([clampedValue]);
    },
    [min, max, step, onValueChange, disabled]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;

      e.preventDefault();
      setIsDragging(true);
      updateValue(e.clientX);

      const handleMouseMove = (e: MouseEvent) => {
        updateValue(e.clientX);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [updateValue, disabled]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;

      e.preventDefault();
      setIsDragging(true);
      const touch = e.touches[0];
      updateValue(touch.clientX);

      const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        updateValue(touch.clientX);
      };

      const handleTouchEnd = () => {
        setIsDragging(false);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };

      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    },
    [updateValue, disabled]
  );

  return (
    <div className={`relative w-full ${className}`}>
      {/* Track */}
      <div
        ref={sliderRef}
        className={`relative h-2 bg-slate-700/50 rounded-full cursor-pointer group ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Progress */}
        <div
          className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-100"
          style={{ width: `${percentage}%` }}
        />

        {/* Handle */}
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-lg transition-all duration-200 ${
            isDragging || !disabled
              ? "opacity-100 cursor-grab active:cursor-grabbing"
              : "opacity-0 group-hover:opacity-100"
          } ${disabled ? "cursor-not-allowed" : ""}`}
          style={{ left: `calc(${percentage}% - 6px)` }}
        />
      </div>
    </div>
  );
};

export default Slider;
