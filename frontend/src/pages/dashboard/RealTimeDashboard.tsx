import React from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useRealtimeStore } from '../../store/useRealtimeStore';
import { LiveRequestFeed } from '../../components/dashboard/LiveRequestFeed';
import { RequestsPerMinuteChart } from '../../components/dashboard/RequestsPerMinuteChart';
import { AlertsPanel } from '../../components/dashboard/AlertsPanel';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Zap, 
  AlertCircle,
  Clock,
  ArrowUpRight,
  CheckCircle
} from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';

const RealTimeDashboard: React.FC = () => {
  const { isConnected } = useWebSocket();
  const { errors, activeAPIs, recentRequests } = useRealtimeStore();

  // Calculate some live stats
  const totalRequests = recentRequests.length;
  const avgLatency = recentRequests.length > 0 
    ? Math.round(recentRequests.reduce((acc, curr) => acc + curr.responseTime, 0) / recentRequests.length)
    : 0;


  return (
    <div className="space-y-8 pb-12">
      {/* Header & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Live Monitor</h1>
          <p className="text-gray-400 font-medium">Real-time health and performance across your API network.</p>
        </div>
        
        <div className={`
          flex items-center space-x-3 px-5 py-2.5 rounded-2xl border backdrop-blur-md transition-all duration-500 shadow-xl
          ${isConnected 
            ? 'bg-green-500/5 border-green-500/20 text-green-400 shadow-green-500/5' 
            : 'bg-red-500/5 border-red-500/20 text-red-400 shadow-red-500/5'}
        `}>
          <div className="relative flex h-3 w-3">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </div>
          <span className="text-sm font-black uppercase tracking-widest tabular-nums">
            {isConnected ? 'System Online' : 'System Offline'}
          </span>
          {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Throughput"
          value={totalRequests > 0 ? `${(totalRequests / 60).toFixed(2)} rps` : '0.00 rps'}
          icon={Zap}
          color="primary"
          data={recentRequests.slice(-10).map(r => ({ value: r.responseTime }))}
        />
        <StatCard
          title="Active APIs"
          value={activeAPIs || '1'}
          icon={Activity}
          color="success"
        />
        <StatCard
          title="Error Rate"
          value={totalRequests > 0 ? `${((errors.length / totalRequests) * 100).toFixed(2)}%` : '0.00%'}
          icon={AlertCircle}
          color="danger"
          trend={errors.length > 0 ? 'up' : 'stable'}
        />
        <StatCard
          title="Avg Latency"
          value={`${avgLatency}ms`}
          icon={Clock}
          color="warning"
          data={recentRequests.slice(-20).map(r => ({ value: r.responseTime }))}
        />
      </div>

      {/* Charts & Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-dark-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl h-[450px] flex flex-col group">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">System Throughput</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1 opacity-60">Requests per second (Live)</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Active Stream</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <RequestsPerMinuteChart />
            </div>
          </div>

          {/* Error Intelligence Panel */}
          <div className="bg-dark-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Anomalies & Failures</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1 opacity-60">Critical system events detected</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${errors.length > 0 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                {errors.length} Anomalies
              </span>
            </div>
            
            {errors.length === 0 ? (
              <div className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/5 mb-6 border border-green-500/10">
                  <CheckCircle className="h-10 w-10 text-green-500/20" />
                </div>
                <p className="text-sm font-bold text-gray-400 tracking-tight">Clean State Detected</p>
                <p className="text-xs text-gray-600 mt-2 font-medium">All systems operating within defined performance thresholds.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {errors.slice(0, 6).map((err, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-red-500/20 transition-all duration-300 group">
                    <div className="flex items-center space-x-4">
                      <div className="p-2.5 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-colors">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-gray-100 truncate">{err.apiName}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter truncate opacity-60">{err.endpoint}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-xs font-black text-red-400 leading-none mb-1">{err.status}</p>
                      <p className="text-[10px] text-gray-600 font-mono font-bold tracking-tighter uppercase tabular-nums">Failed</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Live Feed */}
        <div className="lg:col-span-1">
          <LiveRequestFeed />
          
          <div className="mt-8 bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 p-8 rounded-3xl relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-lg font-black text-white mb-2 tracking-tight">Need higher limits?</h4>
              <p className="text-xs text-gray-300 font-medium leading-relaxed mb-6">Your current plan handles up to 1,000 req/min. Enterprise plans offer unlimited burst capacity.</p>
              <button className="w-full py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 shadow-xl shadow-black/20">
                Upgrade Now
              </button>
            </div>
            <Activity className="absolute -bottom-10 -right-10 h-40 w-40 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          </div>
        </div>
      </div>

      <AlertsPanel />
    </div>
  );
};

export default RealTimeDashboard;
