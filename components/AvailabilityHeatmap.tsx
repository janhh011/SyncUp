import React from 'react';
import { DAYS, HOURS } from '../types';

interface AvailabilityHeatmapProps {
  heatmapData: number[]; // Array of 168 integers (counts)
  totalMembers: number;
}

const AvailabilityHeatmap: React.FC<AvailabilityHeatmapProps> = ({ heatmapData, totalMembers }) => {
  
  const getOpacity = (count: number) => {
    if (count === 0) return 0;
    // Calculate intensity: 0.2 min opacity to 1.0 max
    return 0.2 + (count / totalMembers) * 0.8;
  };

  const getTooltip = (count: number, day: string, hour: number) => {
    return `${count}/${totalMembers} available on ${day} at ${hour}:00`;
  };

  return (
    <div className="select-none overflow-x-auto pb-4">
       <div className="min-w-[600px]">
        {/* Header Days */}
        <div className="grid grid-cols-[50px_repeat(7,1fr)] gap-1 mb-2">
          <div className="text-xs text-gray-400 font-medium self-end pb-1 text-right pr-2"></div>
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
              {DAYS.map((day, dayIndex) => {
                const slotIndex = dayIndex * 24 + hour;
                const count = heatmapData[slotIndex] || 0;
                const opacity = getOpacity(count);
                
                return (
                  <div
                    key={slotIndex}
                    title={getTooltip(count, day, hour)}
                    className={`h-8 rounded-sm transition-all duration-300 relative group`}
                    style={{
                      backgroundColor: count > 0 ? '#22c55e' : '#f3f4f6',
                      opacity: count > 0 ? opacity : 1
                    }}
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap pointer-events-none transition-opacity">
                      {count}/{totalMembers} Free
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
       <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-100 rounded"></div>
          <span>None</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-brand-green/30 rounded"></div>
          <span>Few</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-brand-green rounded"></div>
          <span>All</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityHeatmap;