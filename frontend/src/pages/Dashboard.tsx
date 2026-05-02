import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { StatCard } from '../components/dashboard/StatCard';
import { HealthGrid } from '../components/dashboard/HealthGrid';
import { LatencyHeatmap } from '../components/dashboard/LatencyHeatmap';
import { GeographicDistribution } from '../components/dashboard/GeographicDistribution';
import { LiveRequestFeed } from '../components/dashboard/LiveRequestFeed';
import { analyticsService, AnalyticsOverview } from '../services/analytics.service';
import { 
  Activity, 
  Zap, 
  Users, 
  ShieldCheck, 
  ArrowUpRight, 
  TrendingUp,
  Globe
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await analyticsService.getOverview('24h');
        setOverview(data);
      } catch (error) {
        console.error('Failed to fetch overview', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  // Mock data for health grid
  const apiHealth = [
    { id: '1', name: 'Weather API', status: 'active' as const, latency: 45, uptime: 99.9, region: 'US-East' },
    { id: '2', name: 'Crypto Index', status: 'active' as const, latency: 120, uptime: 98.5, region: 'EU-West' },
    { id: '3', name: 'User Auth Service', status: 'active' as const, latency: 32, uptime: 100, region: 'Global' },
    { id: '4', name: 'Payment Gateway', status: 'active' as const, latency: 210, uptime: 99.9, region: 'US-West' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">
              Welcome back, <span className="text-gradient">{user?.firstName}</span>
            </h1>
            <p className="text-gray-400 font-medium">Your API infrastructure is performing within optimal parameters.</p>
          </div>
          
          <div className="flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md shadow-xl">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-dark-900 bg-gradient-to-br from-gray-700 to-gray-900" />
              ))}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              <span className="text-white">12 Teams</span> Active
            </div>
          </div>
        </div>

        {/* Core Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Requests"
            value={overview?.totalRequests.toLocaleString() || '0'}
            change={12.5}
            trend="up"
            icon={Activity}
            color="primary"
            loading={loading}
            data={[
              { value: 400 }, { value: 300 }, { value: 600 }, { value: 800 }, 
              { value: 500 }, { value: 900 }, { value: 1200 }
            ]}
          />
          <StatCard
            title="Success Rate"
            value={`${overview?.successRate.toFixed(1) || '0'}%`}
            change={0.2}
            trend="up"
            icon={ShieldCheck}
            color="success"
            loading={loading}
            data={[
              { value: 99.1 }, { value: 99.5 }, { value: 99.2 }, { value: 99.8 }, 
              { value: 99.7 }, { value: 99.9 }, { value: 99.9 }
            ]}
          />
          <StatCard
            title="Avg Latency"
            value={`${Math.round(overview?.avgLatency || 0)}ms`}
            change={5.4}
            trend="down"
            icon={Zap}
            color="warning"
            loading={loading}
            data={[
              { value: 120 }, { value: 140 }, { value: 110 }, { value: 95 }, 
              { value: 105 }, { value: 88 }, { value: 92 }
            ]}
          />
          <StatCard
            title="Data Transferred"
            value="1.2 GB"
            change={8.1}
            trend="up"
            icon={Globe}
            color="info"
            loading={loading}
            data={[
              { value: 200 }, { value: 450 }, { value: 300 }, { value: 600 }, 
              { value: 800 }, { value: 750 }, { value: 900 }
            ]}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Health & Latency */}
          <div className="lg:col-span-2 space-y-8">
            <div className="h-[450px]">
              <HealthGrid apis={apiHealth} loading={loading} />
            </div>
            <div className="h-[350px]">
              <LatencyHeatmap loading={loading} />
            </div>
            <div className="h-[400px]">
              <GeographicDistribution />
            </div>
          </div>

          {/* Right Column - Live Feed & Insights */}
          <div className="lg:col-span-1 space-y-8">
            <LiveRequestFeed />
            
            {/* Insights Card */}
            <div className="glass-card p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-6">
                  <TrendingUp className="h-5 w-5 text-primary-400" />
                  <h4 className="text-sm font-black uppercase tracking-widest text-white">Smart Insights</h4>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 font-medium">
                  We've detected a <span className="text-white font-bold">15% increase</span> in traffic from Southeast Asia. Consider deploying a new edge node in Singapore to reduce latency by approx. <span className="text-green-400 font-bold">40ms</span>.
                </p>
                <button className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-primary-400 group-hover:text-primary-300 transition-colors">
                  <span>View Optimization Plan</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
              <Activity className="absolute -bottom-10 -right-10 h-40 w-40 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
