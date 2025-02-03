import React, { useState, useRef, useEffect } from 'react';

interface DraggableNumberInputProps {
  value?: number;
  name?: string;
  onChange?: (event: { target: { name?: string; value: number } }) => void;
  className?: string;
  min?: number | null;
  max?: number | null;
}

const DraggableNumberInput: React.FC<DraggableNumberInputProps> = ({
  value: externalValue = 0,
  name,
  onChange,
  className = 'w-40 border-slate-200',
  min = 0,
  max
}) => {
  const [internalValue, setInternalValue] = useState<number | null>(externalValue);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startValue, setStartValue] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInternalValue(externalValue);
  }, [externalValue]);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - startPos.x;
    const dy = startPos.y - e.clientY;
    const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;

    const currentValue = startValue || 0;

    const newValue = Math.min(Math.max(min || -Infinity, currentValue + Math.round(delta / 2)), max || Infinity);

    setInternalValue(newValue);
    onChange?.({
      target: {
        name,
        value: newValue
      }
    });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartValue(internalValue || 0);
    document.body.style.cursor = 'move';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? null : Number(e.target.value);
    setInternalValue(newValue);
    if (newValue !== null) {
      onChange?.({
        target: {
          name,
          value: Math.max(0, newValue)
        }
      });
    }
  };

  const handleBlur = () => {
    if (internalValue === null) {
      const defaultValue = 0;
      setInternalValue(defaultValue);
      onChange?.({
        target: {
          name,
          value: defaultValue
        }
      });
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startPos, startValue]);

  return (
    <div className="relative inline-block">
      <input
        ref={inputRef}
        type="number"
        name={name}
        value={internalValue === null ? '' : internalValue}
        onChange={handleInputChange}
        onMouseDown={handleMouseDown}
        onBlur={handleBlur}
        min={min || -Infinity}
        max={max || Infinity}
        className={`cursor-move ${className}`}
      />
      {isDragging && (
        <div className="fixed inset-0 z-50 cursor-move" />
      )}
    </div>
  );
};

export default DraggableNumberInput;
