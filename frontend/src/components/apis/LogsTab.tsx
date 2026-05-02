import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronDown, 
  Terminal, 
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Code,
  Code,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAPIStore } from '../../store/useAPIStore';

interface LogsTabProps {
  apiId: string;
}

export const LogsTab: React.FC<LogsTabProps> = ({ apiId }) => {
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRawModalOpen, setIsRawModalOpen] = useState(false);
  const [selectedRawLog, setSelectedRawLog] = useState<any>(null);

  const { logs, fetchAPILogs, isLogsLoading, logsPage, logsPages } = useAPIStore();

  useEffect(() => {
    if (apiId) {
      const delayDebounceFn = setTimeout(() => {
        fetchAPILogs(apiId, { 
          search: searchTerm, 
          status: statusFilter === 'all' ? undefined : statusFilter,
          page: 1 
        });
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [apiId, searchTerm, statusFilter, fetchAPILogs]);

  const handleLoadMore = () => {
    if (logsPage < logsPages) {
      fetchAPILogs(apiId, { 
        search: searchTerm, 
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: logsPage + 1 
      });
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-400 bg-green-400/10 border-green-500/20';
    if (status >= 400 && status < 500) return 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20';
    return 'text-red-400 bg-red-400/10 border-red-500/20';
  };

  if (isLogsLoading && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Fetching historical logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-900/50 p-4 border border-gray-800 rounded-2xl">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search logs (method, path, status)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-950 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-950 border border-gray-800 rounded-xl px-4 py-2 text-sm text-gray-400 focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
          >
            <option value="all">All Status Codes</option>
            <option value="2xx">2xx Success</option>
            <option value="4xx">4xx Client Error</option>
            <option value="5xx">5xx Server Error</option>
          </select>
          <button 
            onClick={() => fetchAPILogs(apiId, { search: searchTerm, status: statusFilter === 'all' ? undefined : statusFilter, page: 1 })}
            className="p-2 bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-white rounded-xl transition-all"
            title="Refresh logs"
          >
            <RefreshCw className={`h-4 w-4 ${isLogsLoading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-xl text-sm font-medium transition-all">
            <Filter className="h-4 w-4" />
            <span>Advanced</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-dark-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 bg-dark-950/50">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] w-10"></th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Method & Path</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Latency</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-gray-500 text-sm">No request logs found.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <React.Fragment key={log._id}>
                    <tr 
                      onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
                      className={`hover:bg-white/[0.02] transition-colors group cursor-pointer ${expandedLog === log._id ? 'bg-white/[0.02]' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          {expandedLog === log._id ? (
                            <ChevronDown className="h-4 w-4 text-primary" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-300" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            log.method === 'GET' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            log.method === 'POST' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {log.method}
                          </span>
                          <span className="text-gray-300 font-mono text-xs">{log.path}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(log.status)}`}>
                          {log.status >= 200 && log.status < 300 ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1.5 opacity-50" />
                          {log.latency}ms
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-mono text-gray-500 bg-dark-950 px-2 py-1 rounded border border-gray-800">
                          {log.ip}
                        </span>
                      </td>
                    </tr>
                    
                    {expandedLog === log._id && (
                      <tr className="bg-dark-950/50">
                        <td colSpan={6} className="px-6 py-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Request Details */}
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
                                  <Terminal className="h-3.5 w-3.5 mr-2 text-primary" />
                                  Request
                                </h4>
                                <span className="text-[10px] text-gray-600 font-mono truncate max-w-[200px]">UA: {log.userAgent}</span>
                              </div>
                              <div className="space-y-4">
                                <div className="bg-dark-900 rounded-xl p-4 border border-gray-800">
                                  <p className="text-[10px] font-bold text-gray-600 uppercase mb-2">Headers</p>
                                  <pre className="text-[11px] text-gray-400 overflow-x-auto font-mono custom-scrollbar">
                                    {JSON.stringify(log.request.headers, null, 2)}
                                  </pre>
                                </div>
                                <div className="bg-dark-900 rounded-xl p-4 border border-gray-800">
                                  <p className="text-[10px] font-bold text-gray-600 uppercase mb-2">Body</p>
                                  <pre className="text-[11px] text-gray-400 overflow-x-auto font-mono custom-scrollbar">
                                    {log.request.body ? JSON.stringify(log.request.body, null, 2) : 'No body'}
                                  </pre>
                                </div>
                              </div>
                            </div>

                            {/* Response Details */}
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
                                  <Code className="h-3.5 w-3.5 mr-2 text-green-400" />
                                  Response
                                </h4>
                                <span className="text-[10px] text-gray-600 font-mono">Duration: {log.latency}ms</span>
                              </div>
                              <div className="space-y-4">
                                <div className="bg-dark-900 rounded-xl p-4 border border-gray-800">
                                  <p className="text-[10px] font-bold text-gray-600 uppercase mb-2">Headers</p>
                                  <pre className="text-[11px] text-gray-400 overflow-x-auto font-mono custom-scrollbar">
                                    {JSON.stringify(log.response.headers, null, 2)}
                                  </pre>
                                </div>
                                <div className="bg-dark-900 rounded-xl p-4 border border-gray-800">
                                  <p className="text-[10px] font-bold text-gray-600 uppercase mb-2">Body</p>
                                  <pre className="text-[11px] text-gray-400 overflow-x-auto font-mono custom-scrollbar">
                                    {JSON.stringify(log.response.body, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6 pt-6 border-t border-gray-800 flex justify-end">
                            <button 
                              onClick={() => {
                                setSelectedRawLog(log);
                                setIsRawModalOpen(true);
                              }}
                              className="flex items-center space-x-2 text-xs font-bold text-primary hover:text-primary-light transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span>View Raw JSON Log</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {logs.length > 0 && logsPage < logsPages && (
        <div className="flex items-center justify-center pt-4">
          <button 
            onClick={handleLoadMore}
            className="px-6 py-2.5 bg-dark-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center space-x-2"
            disabled={isLogsLoading}
          >
            {isLogsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isLogsLoading ? 'Loading...' : 'Load More Logs'}</span>
          </button>
        </div>
      )}

      {/* Raw JSON Modal */}
      {isRawModalOpen && selectedRawLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-dark-900 border border-gray-800 rounded-3xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-dark-950/50">
              <div>
                <h3 className="text-lg font-bold text-white">Raw Request Log</h3>
                <p className="text-xs text-gray-500 font-mono mt-1">ID: {selectedRawLog._id}</p>
              </div>
              <button 
                onClick={() => setIsRawModalOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
              >
                <XCircle className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-dark-950/30">
              <pre className="text-xs text-primary font-mono bg-dark-950 p-6 rounded-2xl border border-gray-800/50 leading-relaxed overflow-x-auto">
                {JSON.stringify(selectedRawLog, null, 2)}
              </pre>
            </div>
            <div className="p-6 border-t border-gray-800 bg-dark-950/50 flex justify-end">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedRawLog, null, 2));
                }}
                className="px-6 py-2 bg-primary text-dark-950 rounded-xl text-sm font-bold hover:bg-primary-light transition-all active:scale-95"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
