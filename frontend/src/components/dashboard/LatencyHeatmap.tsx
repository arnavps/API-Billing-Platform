import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Info } from 'lucide-react';

interface LatencyHeatmapProps {
  data?: any[];
  loading?: boolean;
}

export const LatencyHeatmap: React.FC<LatencyHeatmapProps> = ({ loading = false }) => {
  // Generate mock data for the heatmap if not provided
  const rows = 12; // Latency buckets
  const cols = 24; // Time slots

  const getIntensity = (val: number) => {
    if (val > 0.8) return 'bg-primary-500';
    if (val > 0.6) return 'bg-primary-600/80';
    if (val > 0.4) return 'bg-primary-700/60';
    if (val > 0.2) return 'bg-primary-800/40';
    return 'bg-white/5';
  };

  if (loading) {
    return (
      <div className="glass-card p-6 h-full min-h-[300px] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-400">Processing telemetry distribution...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <Clock className="h-4 w-4 text-primary-400" />
          </div>
          <h3 className="font-bold text-sm tracking-tight">Latency Distribution</h3>
        </div>
        <button className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
          <Info className="h-3.5 w-3.5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <div className="flex-1 grid grid-cols-[auto_1fr] gap-4">
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between py-1 text-[9px] font-black text-gray-600 uppercase tracking-tighter text-right pr-2">
            <span>2000ms</span>
            <span>1000ms</span>
            <span>500ms</span>
            <span>200ms</span>
            <span>100ms</span>
            <span>50ms</span>
            <span>20ms</span>
          </div>

          {/* Heatmap Grid */}
          <div className="grid grid-rows-12 gap-1 relative">
            {Array.from({ length: rows }).map((_, r) => (
              <div key={r} className="flex space-x-1 h-full">
                {Array.from({ length: cols }).map((_, c) => {
                  // Mock intensity based on a normal distribution for visualization
                  const intensity = Math.random() * (1 - (Math.abs(r - 8) / 8));
                  return (
                    <motion.div
                      key={`${r}-${c}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (r * cols + c) * 0.001 }}
                      className={cn(
                        "flex-1 rounded-sm transition-all duration-300 hover:ring-1 hover:ring-white/40 cursor-crosshair",
                        getIntensity(intensity)
                      )}
                      title={`${(Math.random() * 100).toFixed(0)} requests at ${2000 - r * 150}ms`}
                    />
                  );
                })}
              </div>
            ))}
            
            {/* Hover Crosshair Overlay (Optional addition) */}
          </div>
        </div>

        {/* X-Axis Labels */}
        <div className="grid grid-cols-24 ml-[50px] mt-4 text-[9px] font-black text-gray-600 uppercase tracking-tighter">
          <span className="col-span-4">24h ago</span>
          <span className="col-span-4 text-center">18h ago</span>
          <span className="col-span-4 text-center">12h ago</span>
          <span className="col-span-4 text-center">6h ago</span>
          <span className="col-span-4 text-center">1h ago</span>
          <span className="col-span-4 text-right">Now</span>
        </div>
      </div>

      <div className="p-3 border-t border-white/5 bg-black/20 flex justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-sm bg-white/5" />
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Low Traffic</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-sm bg-primary-500" />
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">High Volume</span>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
