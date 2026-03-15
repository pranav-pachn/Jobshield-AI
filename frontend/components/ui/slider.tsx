import React from 'react';

export interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number[];
  onValueChange: (value: number[]) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value,
      onValueChange,
      min,
      max,
      step = 1,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = React.useState<'min' | 'max' | null>(null);

    const handleMouseDown = (type: 'min' | 'max') => {
      if (!disabled) {
        setIsDragging(type);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return;

      const slider = e.currentTarget;
      const rect = slider.getBoundingClientRect();
      const percentage = (e.clientX - rect.left) / rect.width;
      const newValue = Math.round((min + percentage * (max - min)) / step) * step;

      const clampedValue = Math.max(min, Math.min(max, newValue));
      const newValues = [...value];

      if (isDragging === 'min') {
        newValues[0] = Math.min(clampedValue, newValues[1]);
      } else {
        newValues[1] = Math.max(clampedValue, newValues[0]);
      }

      onValueChange(newValues);
    };

    const minPercent = ((value[0] - min) / (max - min)) * 100;
    const maxPercent = ((value[1] - min) / (max - min)) * 100;

    return (
      <div
        ref={ref}
        className={`relative h-6 select-none ${className}`}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        {...props}
      >
        {/* Track background */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-secondary rounded-full"></div>

        {/* Active range highlight */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full pointer-events-none"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        ></div>

        {/* Min thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-lg transition-all cursor-pointer hover:shadow-xl ${
            isDragging === 'min' ? 'scale-125' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{
            left: `${minPercent}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: isDragging === 'min' ? 10 : 5,
          }}
          onMouseDown={() => handleMouseDown('min')}
        ></div>

        {/* Max thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow-lg transition-all cursor-pointer hover:shadow-xl ${
            isDragging === 'max' ? 'scale-125' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{
            left: `${maxPercent}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: isDragging === 'max' ? 10 : 5,
          }}
          onMouseDown={() => handleMouseDown('max')}
        ></div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
