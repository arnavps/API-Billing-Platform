import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MoreVertical, 
  ExternalLink, 
  Activity, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  PauseCircle
} from 'lucide-react';
import { APIData } from '../../services/api.service';

interface APICardProps {
  api: APIData;
}

export const APICard: React.FC<APICardProps> = ({ api }) => {
  const statusColors = {
    active: 'text-green-400 bg-green-500/10 border-green-500/20',
    paused: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    maintenance: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  const StatusIcon = {
    active: CheckCircle2,
    paused: PauseCircle,
    maintenance: AlertCircle,
  }[api.status];

  return (
    <div className="group relative bg-dark-900 border border-gray-800 rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-primary/5">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-dark-800 border border-gray-700 text-2xl group-hover:scale-110 transition-transform duration-300">
            {api.icon || '⚡'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
              {api.name}
            </h3>
            <p className="text-sm text-gray-500 font-mono">/{api.slug}</p>
          </div>
        </div>
        <button className="p-2 text-gray-500 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      <p className="text-gray-400 text-sm line-clamp-2 mb-6 h-10">
        {api.description}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-dark-950/50 rounded-xl p-3 border border-gray-800/50">
          <div className="flex items-center space-x-2 text-gray-500 mb-1">
            <Activity className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Requests</span>
          </div>
          <p className="text-lg font-bold text-white">{api.analytics.totalRequests.toLocaleString()}</p>
        </div>
        <div className="bg-dark-950/50 rounded-xl p-3 border border-gray-800/50">
          <div className="flex items-center space-x-2 text-gray-500 mb-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Latency</span>
          </div>
          <p className="text-lg font-bold text-white">{api.analytics.avgResponseTime}ms</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${statusColors[api.status]}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          <span className="capitalize">{api.status}</span>
        </div>
        <Link 
          to={`/apis/${api._id}`}
          className="flex items-center space-x-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors group/link"
        >
          <span>View Details</span>
          <ExternalLink className="h-4 w-4 transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
