import React from 'react';
import { motion } from 'framer-motion';
import { Map, Zap } from 'lucide-react';

export const GeographicDistribution: React.FC = () => {
  // Mock data for regions
  const regions = [
    { name: 'North America', status: 'optimal', load: 45, latency: 24, coords: { x: '25%', y: '35%' } },
    { name: 'Europe', status: 'optimal', load: 22, latency: 18, coords: { x: '50%', y: '30%' } },
    { name: 'Asia Pacific', status: 'degraded', load: 88, latency: 142, coords: { x: '75%', y: '45%' } },
    { name: 'South America', status: 'optimal', load: 12, latency: 56, coords: { x: '35%', y: '70%' } },
  ];

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Map className="h-4 w-4 text-indigo-400" />
          </div>
          <h3 className="font-bold text-sm tracking-tight">Global Traffic Distribution</h3>
        </div>
        <div className="flex items-center space-x-2 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
          <Zap className="h-3 w-3 text-indigo-400" />
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Edge</span>
        </div>
      </div>

      <div className="flex-1 relative p-6 overflow-hidden bg-black/20">
        {/* World Map SVG Mockup */}
        <svg viewBox="0 0 800 400" className="w-full h-full opacity-20 fill-gray-500">
          <path d="M150,150 L200,100 L250,150 L200,200 Z" /> {/* North America */}
          <path d="M400,100 L450,80 L500,120 L450,150 Z" /> {/* Europe */}
          <path d="M600,150 L700,120 L750,200 L650,250 Z" /> {/* Asia */}
          <path d="M250,250 L300,300 L350,250 L300,200 Z" /> {/* South America */}
          {/* Add more map paths if needed, or keep it abstract */}
        </svg>

        {/* Region Hotspots */}
        {regions.map((region, i) => (
          <motion.div
            key={region.name}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.2 }}
            style={{ left: region.coords.x, top: region.coords.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative group cursor-pointer">
              {/* Pulse effect */}
              <div className={cn(
                "absolute -inset-4 rounded-full animate-ping opacity-20",
                region.status === 'optimal' ? "bg-green-400" : "bg-amber-400"
              )} />
              
              {/* Hotspot dot */}
              <div className={cn(
                "relative h-3 w-3 rounded-full border-2 border-dark-900 shadow-xl",
                region.status === 'optimal' ? "bg-green-400 shadow-green-400/40" : "bg-amber-400 shadow-amber-400/40"
              )} />

              {/* Tooltip */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20">
                <div className="glass-card p-3 whitespace-nowrap border-primary/20 shadow-2xl">
                  <p className="text-xs font-black text-white mb-1">{region.name}</p>
                  <div className="space-y-1">
                    <div className="flex justify-between space-x-4">
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Latency</span>
                      <span className="text-[9px] text-white font-mono">{region.latency}ms</span>
                    </div>
                    <div className="flex justify-between space-x-4">
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Active Load</span>
                      <span className="text-[9px] text-white font-mono">{region.load}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Connection Lines (Abstract) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
          <line x1="25%" y1="35%" x2="50%" y2="30%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="50%" y1="30%" x2="75%" y2="45%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="25%" y1="35%" x2="35%" y2="70%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      <div className="p-4 bg-black/40 grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Active Nodes</p>
          <p className="text-lg font-black text-white">42</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Global P95</p>
          <p className="text-lg font-black text-primary-400">84ms</p>
        </div>
      </div>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
