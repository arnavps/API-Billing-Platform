import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Globe, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface APIStatus {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'maintenance' | 'error';
  latency: number;
  uptime: number;
  region: string;
}

interface HealthGridProps {
  apis: APIStatus[];
  loading?: boolean;
}

export const HealthGrid: React.FC<HealthGridProps> = ({ apis, loading = false }) => {
  if (loading) {
    return (
      <div className="glass-card p-6 h-full min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-400">Pinging edge nodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Globe className="h-4 w-4 text-green-400" />
          </div>
          <h3 className="font-bold text-sm tracking-tight">System Health Matrix</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">All Systems Operational</span>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar">
        {apis.map((api, index) => (
          <motion.div
            key={api.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="space-y-1">
                <h4 className="text-sm font-black text-white group-hover:text-primary-400 transition-colors">{api.name}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">{api.region}</span>
                  <div className="w-1 h-1 rounded-full bg-gray-800" />
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">{api.uptime}% Uptime</span>
                </div>
              </div>
              <div className={cn(
                "p-1.5 rounded-lg border",
                api.status === 'active' ? "text-green-400 border-green-400/20 bg-green-400/10" :
                api.status === 'error' ? "text-red-400 border-red-400/20 bg-red-400/10" :
                "text-amber-400 border-amber-400/20 bg-amber-400/10"
              )}>
                {api.status === 'active' ? <CheckCircle2 className="h-3.5 w-3.5" /> : 
                 api.status === 'error' ? <AlertCircle className="h-3.5 w-3.5" /> : 
                 <Clock className="h-3.5 w-3.5" />}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-2 bg-black/20 rounded-xl border border-white/5">
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Latency</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-sm font-bold text-white">{api.latency}</span>
                  <span className="text-[9px] text-gray-600 font-medium">ms</span>
                </div>
              </div>
              <div className="p-2 bg-black/20 rounded-xl border border-white/5">
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Throughput</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-sm font-bold text-white">4.2k</span>
                  <span className="text-[9px] text-gray-600 font-medium">rps</span>
                </div>
              </div>
            </div>
            
            {/* Status Bar */}
            <div className="mt-4 flex space-x-0.5">
              {Array.from({ length: 24 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-4 flex-1 rounded-sm",
                    i === 22 ? "bg-amber-400/50" : 
                    i === 10 ? "bg-red-400/50" : 
                    "bg-green-400/50"
                  )}
                  title={`Status ${23-i}h ago: ${i === 22 ? 'Degraded' : i === 10 ? 'Down' : 'Operational'}`}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
