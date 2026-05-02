import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: LucideIcon;
  data?: any[];
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  data = [],
  color = 'primary',
  loading = false,
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'success': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'warning': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'danger': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'info': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      default: return 'text-primary-400 bg-primary-400/10 border-primary-400/20';
    }
  };

  const getChartColor = () => {
    switch (color) {
      case 'success': return '#4ade80';
      case 'warning': return '#fbbf24';
      case 'danger': return '#f87171';
      case 'info': return '#22d3ee';
      default: return '#60a5fa';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card p-6 flex flex-col space-y-4 relative overflow-hidden group"
    >
      {/* Background Glow */}
      <div className={cn(
        "absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
        color === 'primary' && "bg-primary-500",
        color === 'success' && "bg-green-500",
        color === 'warning' && "bg-amber-500",
        color === 'danger' && "bg-red-500",
        color === 'info' && "bg-cyan-500"
      )} />

      <div className="flex items-center justify-between">
        <div className={cn("p-2.5 rounded-xl border", getColorClasses())}>
          <Icon className="h-5 w-5" />
        </div>
        {change !== undefined && (
          <div className={cn(
            "text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center space-x-1",
            trend === 'up' ? "text-green-400 bg-green-400/10 border-green-400/20" : 
            trend === 'down' ? "text-red-400 bg-red-400/10 border-red-400/20" : 
            "text-gray-400 bg-gray-400/10 border-gray-400/20"
          )}>
            <span>{trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{title}</p>
        <div className="flex items-baseline space-x-2">
          {loading ? (
            <div className="h-8 w-24 bg-white/5 animate-pulse rounded-lg" />
          ) : (
            <h3 className="text-2xl font-black text-white tracking-tight">{value}</h3>
          )}
        </div>
      </div>

      {/* Mini Chart */}
      <div className="h-12 w-full -mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={getChartColor()} stopOpacity={0.2} />
                <stop offset="100%" stopColor={getChartColor()} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={getChartColor()}
              strokeWidth={2}
              fill={`url(#grad-${title})`}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
