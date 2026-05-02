import React from 'react';
import { useRealtimeStore } from '../../store/useRealtimeStore';
import { format } from 'date-fns';
import { ChevronRight, Activity } from 'lucide-react';

export const LiveRequestFeed: React.FC = () => {
  const { recentRequests } = useRealtimeStore();

  const getStatusColor = (status: number) => {
    if (status >= 500) return 'text-red-400 bg-red-400/10 border-red-400/20 shadow-[0_0_10px_rgba(248,113,113,0.1)]';
    if (status >= 400) return 'text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]';
    return 'text-green-400 bg-green-400/10 border-green-400/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]';
  };

  return (
    <div className="bg-dark-900/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
      <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-bold text-sm tracking-tight">Live Request Feed</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
            Live
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {recentRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4 p-8">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-2 border-dashed border-gray-800 animate-spin-slow" />
              <Activity className="h-6 w-6 text-gray-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-400">Listening for signals...</p>
              <p className="text-xs text-gray-600 mt-1">Incoming API traffic will appear here in real-time</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentRequests.map((req) => (
              <div 
                key={req.requestId} 
                className="p-4 hover:bg-white/5 transition-all duration-300 group cursor-pointer animate-in fade-in slide-in-from-top-4 duration-500"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-10 flex items-center justify-center rounded-xl text-xs font-black border transition-transform group-hover:scale-105 ${getStatusColor(req.status)}`}>
                    {req.status}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-0.5">
                      <span className="text-[10px] font-black text-primary/80 uppercase tracking-tighter bg-primary/10 px-1.5 py-0.5 rounded">
                        {req.method}
                      </span>
                      <span className="text-sm font-semibold text-gray-100 truncate group-hover:text-white transition-colors">
                        {req.endpoint}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 mt-1.5">
                      <span className="text-[10px] text-gray-500 font-medium">{req.apiName}</span>
                      <div className="w-1 h-1 rounded-full bg-gray-800" />
                      <span className="text-[10px] text-gray-500 font-mono tracking-tighter">{req.responseTime}ms</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[10px] font-mono text-gray-500 tabular-nums">
                      {format(new Date(req.timestamp), 'HH:mm:ss')}
                    </span>
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-white/5 bg-black/20 text-center">
        <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest">
          Showing last 50 requests
        </p>
      </div>
    </div>
  );
};
