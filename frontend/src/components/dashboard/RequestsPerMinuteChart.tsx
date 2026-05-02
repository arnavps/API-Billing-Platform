import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useRealtimeStore } from '../../store/useRealtimeStore';

export const RequestsPerMinuteChart: React.FC = () => {
  const { requestsPerMinute } = useRealtimeStore();

  return (
    <div className="h-full w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={requestsPerMinute} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" opacity={0.5} />
          <XAxis 
            dataKey="timestamp" 
            hide 
          />
          <YAxis 
            stroke="#4b5563" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
          />
          <Tooltip 
            cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-dark-900/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Throughput</p>
                    <div className="flex items-baseline space-x-1">
                      <p className="text-xl font-black text-white leading-none">{payload[0].value}</p>
                      <p className="text-[10px] text-gray-500 font-medium">req/sec</p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorRequests)" 
            isAnimationActive={false} // Disable animation for live updates to prevent jitter
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
