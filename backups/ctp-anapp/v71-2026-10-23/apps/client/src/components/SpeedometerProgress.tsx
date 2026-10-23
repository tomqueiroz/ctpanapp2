import React from 'react';

interface SpeedometerProgressProps {
  percentage: number;
  size?: number;
}

export const SpeedometerProgress: React.FC<SpeedometerProgressProps> = ({ 
  percentage, 
  size = 180 
}) => {
  // Calculate angle for the needle (from -90 to 90 degrees, 180 total)
  const angle = -90 + (percentage / 100) * 180;
  
  // Generate gradient stops for the arc
  const getColor = (percent: number) => {
    if (percent < 33) return '#3B82F6'; // Blue
    if (percent < 66) return '#0EA5E9'; // Sky blue
    return '#0072BC'; // CTP Blue
  };

  return (
    <div className="relative inline-flex flex-col items-center">
      {/* Speedometer container */}
      <div className="relative" style={{ width: size, height: size * 0.65 }}>
        <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
          {/* Background arc */}
          <path
            d={`M ${size * 0.15} ${size * 0.55} A ${size * 0.35} ${size * 0.35} 0 0 1 ${size * 0.85} ${size * 0.55}`}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="20"
            strokeLinecap="round"
          />
          
          {/* Progress arc - gradient from blue to blue */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#0072BC" />
            </linearGradient>
          </defs>
          
          <path
            d={`M ${size * 0.15} ${size * 0.55} A ${size * 0.35} ${size * 0.35} 0 0 1 ${size * 0.85} ${size * 0.55}`}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="20"
            strokeDasharray={`${(percentage / 100) * (size * 0.35 * Math.PI)} ${size * 0.35 * Math.PI}`}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const tickAngle = -90 + (tick / 100) * 180;
            const tickRad = (tickAngle * Math.PI) / 180;
            const innerRadius = size * 0.35 - 5;
            const outerRadius = size * 0.35 + 5;
            const labelRadius = size * 0.35 + 20;
            
            const x1 = size / 2 + innerRadius * Math.cos(tickRad);
            const y1 = size / 2 + innerRadius * Math.sin(tickRad);
            const x2 = size / 2 + outerRadius * Math.cos(tickRad);
            const y2 = size / 2 + outerRadius * Math.sin(tickRad);
            const labelX = size / 2 + labelRadius * Math.cos(tickRad);
            const labelY = size / 2 + labelRadius * Math.sin(tickRad);
            
            return (
              <g key={tick}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#9CA3AF"
                  strokeWidth="2"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-semibold fill-gray-600"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Center pivot */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r="6"
            fill="#1F2937"
          />

          {/* Needle */}
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2 + (size * 0.3) * Math.cos((angle * Math.PI) / 180)}
            y2={size / 2 + (size * 0.3) * Math.sin((angle * Math.PI) / 180)}
            stroke="#FF6B00"
            strokeWidth="4"
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
          />
          
          {/* Needle tip */}
          <circle
            cx={size / 2 + (size * 0.3) * Math.cos((angle * Math.PI) / 180)}
            cy={size / 2 + (size * 0.3) * Math.sin((angle * Math.PI) / 180)}
            r="5"
            fill="#FF6B00"
            className="transition-all duration-700 ease-out"
          />
        </svg>
      </div>
      
      {/* Digital display */}
      <div className="mt-2 bg-gradient-to-r from-[#0072BC] to-[#0EA5E9] text-white px-8 py-3 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="text-4xl font-bold tabular-nums">{percentage}%</div>
          <div className="text-xs font-medium mt-1 opacity-90">PROGRESSO</div>
        </div>
      </div>
    </div>
  );
};
