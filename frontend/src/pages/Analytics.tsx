import React, { useEffect, useState } from 'react';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useAuthStore } from '../store/useAuthStore';
import { RequestsAreaChart, LatencyChart, EndpointsBarChart } from '../components/analytics/Charts';
import { 
  Activity, 
  Zap, 
  AlertCircle, 
  Clock, 
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const Analytics: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    overview, 
    series, 
    endpoints, 
    fetchOverview, 
    fetchSeries, 
    fetchEndpoints,
    initSocket,
    disconnectSocket
  } = useAnalyticsStore();

  const [period, setPeriod] = useState('24h');

  useEffect(() => {
    fetchOverview(period);
    fetchSeries(undefined, period);
    fetchEndpoints();

    if (user) {
      initSocket(user._id);
    }

    return () => disconnectSocket();
  }, [period, user]);

  const stats = [
    {
      label: 'Total Requests',
      value: overview?.totalRequests.toLocaleString() || '0',
      change: '+12.5%',
      trend: 'up',
      icon: Activity,
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/10'
    },
    {
      label: 'Success Rate',
      value: `${overview?.successRate.toFixed(1) || '100'}%`,
      change: '+0.2%',
      trend: 'up',
      icon: Zap,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
    {
      label: 'Avg Latency',
      value: `${overview?.avgLatency.toFixed(0) || '0'}ms`,
      change: '-14ms',
      trend: 'down',
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    },
    {
      label: 'Errors',
      value: overview?.failedRequests.toLocaleString() || '0',
      change: '+2',
      trend: 'up',
      icon: AlertCircle,
      color: 'text-rose-400',
      bg: 'bg-rose-400/10'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Overview</h1>
          <p className="text-slate-400">Real-time performance and usage insights across all APIs.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
          {['24h', '7d', '30d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                period === p 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stat.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Requests Volume</h3>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              Total Requests
            </div>
          </div>
          <RequestsAreaChart data={series} />
        </div>

        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Response Latency</h3>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              Average (ms)
            </div>
          </div>
          <LatencyChart data={series} />
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-6">Top Endpoints</h3>
          <EndpointsBarChart data={endpoints} />
        </div>

        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-6">Error Distribution</h3>
          <div className="space-y-4">
            {overview?.failedRequests === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <div className="bg-slate-900/50 p-4 rounded-full mb-4">
                  <Zap className="w-8 h-8 text-emerald-500/50" />
                </div>
                <p>No errors recorded in this period.</p>
              </div>
            ) : (
              <div className="text-slate-400 text-sm">
                Error breakdown data will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
