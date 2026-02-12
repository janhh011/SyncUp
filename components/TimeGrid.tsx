import React, { useState, useEffect } from 'react';
import { DAYS, HOURS } from '../types';

interface TimeGridProps {
  value: number[]; // Array of selected slots (0-167)
  onChange: (value: number[]) => void;
  readOnly?: boolean;
}

const TimeGrid: React.FC<TimeGridProps> = ({ value, onChange, readOnly = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'add' | 'remove'>('add');

  // Convert linear index to Day/Hour for display logic if needed
  // Index = dayIndex * 24 + hourIndex

  const handleMouseDown = (slotIndex: number) => {
    if (readOnly) return;
    setIsDragging(true);
    const isSelected = value.includes(slotIndex);
    setDragMode(isSelected ? 'remove' : 'add');
    toggleSlot(slotIndex, !isSelected);
  };

  const handleMouseEnter = (slotIndex: number) => {
    if (!isDragging || readOnly) return;
    toggleSlot(slotIndex, dragMode === 'add');
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleSlot = (slotIndex: number, shouldAdd: boolean) => {
    let newValue = [...value];
    if (shouldAdd) {
      if (!newValue.includes(slotIndex)) newValue.push(slotIndex);
    } else {
      newValue = newValue.filter(v => v !== slotIndex);
    }
    onChange(newValue);
  };

  // Prevent scroll when dragging on mobile
  useEffect(() => {
    const handleWindowMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => window.removeEventListener('mouseup', handleWindowMouseUp);
  }, []);

  return (
    <div className="select-none overflow-x-auto pb-4">
      <div className="min-w-[600px]">
        {/* Header Days */}
        <div className="grid grid-cols-[50px_repeat(7,1fr)] gap-1 mb-2">
          <div className="text-xs text-gray-400 font-medium self-end pb-1 text-right pr-2">GMT</div>
          {DAYS.map(day => (
            <div key={day} className="text-center text-sm font-bold text-brand-black uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="grid grid-cols-[50px_repeat(7,1fr)] gap-1">
          {HOURS.map(hour => (
            <React.Fragment key={hour}>
              {/* Time Label */}
              <div className="text-xs text-gray-400 font-medium text-right pr-2 -mt-1.5 h-8">
                {hour}:00
              </div>
              
              {/* Day Cells for this Hour */}
              {DAYS.map((_, dayIndex) => {
                const slotIndex = dayIndex * 24 + hour;
                const isSelected = value.includes(slotIndex);
                
                return (
                  <div
                    key={slotIndex}
                    onMouseDown={() => handleMouseDown(slotIndex)}
                    onMouseEnter={() => handleMouseEnter(slotIndex)}
                    className={`
                      h-8 rounded-sm cursor-pointer transition-colors duration-75
                      ${isSelected ? 'bg-brand-green' : 'bg-gray-100 hover:bg-gray-200'}
                      ${readOnly ? 'cursor-default' : ''}
                    `}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      {!readOnly && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          Click and drag to select multiple slots.
        </p>
      )}
    </div>
  );
};

export default TimeGrid;