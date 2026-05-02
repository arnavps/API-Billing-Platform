import React, { useEffect, useState } from 'react';
import { activityService, ActivityLog } from '../services/activity.service';
import { motion } from 'framer-motion';
import { 
  Activity as ActivityIcon, 
  Search, 
  Filter, 
  ChevronRight, 
  Layers, 
  Key, 
  CreditCard, 
  Users, 
  Webhook,
  Clock,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

const EntityIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'api': return <Layers className="h-4 w-4" />;
    case 'key': return <Key className="h-4 w-4" />;
    case 'billing': return <CreditCard className="h-4 w-4" />;
    case 'team': return <Users className="h-4 w-4" />;
    case 'webhook': return <Webhook className="h-4 w-4" />;
    default: return <ActivityIcon className="h-4 w-4" />;
  }
};

export const Activity: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [entityType, setEntityType] = useState<string>('');

  useEffect(() => {
    fetchLogs();
  }, [entityType]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await activityService.getLogs({ 
        entityType: entityType || undefined,
        limit: 50 
      });
      setLogs(data.logs);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(filter.toLowerCase()) ||
    log.userId.firstName.toLowerCase().includes(filter.toLowerCase()) ||
    log.userId.lastName.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Activity Log</h1>
          <p className="text-gray-400 mt-1">Monitor all actions across your account and team.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search actions..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 bg-dark-800 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm w-full md:w-64"
            />
          </div>
          
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="px-4 py-2 bg-dark-800 border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm text-gray-300"
          >
            <option value="">All Types</option>
            <option value="api">APIs</option>
            <option value="key">Keys</option>
            <option value="team">Team</option>
            <option value="billing">Billing</option>
            <option value="webhook">Webhooks</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-dark-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-gray-500 animate-pulse">Loading activity logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center">
            <div className="h-16 w-16 bg-dark-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700">
              <ActivityIcon className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-white">No activity found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredLogs.map((log, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={log._id} 
                    className="hover:bg-dark-800/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-dark-800 border border-gray-700 rounded-lg group-hover:border-primary/50 transition-colors">
                          <EntityIcon type={log.entityType} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">{log.action}</p>
                          <p className="text-xs text-gray-500 font-mono">{log.entityId.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                          {log.userId.firstName[0]}{log.userId.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-200">{log.userId.firstName} {log.userId.lastName}</p>
                          <p className="text-xs text-gray-500">{log.userId.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 capitalize">
                      {log.entityType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      <div className="flex flex-col">
                        <span>{format(new Date(log.createdAt), 'MMM d, yyyy')}</span>
                        <span className="text-xs text-gray-600">{format(new Date(log.createdAt), 'HH:mm:ss')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
