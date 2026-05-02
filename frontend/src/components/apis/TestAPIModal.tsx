import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Play, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Code,
  Globe,
  Database,
  Terminal
} from 'lucide-react';
import { apiService } from '../../services/api.service';

interface TestAPIModalProps {
  api: any;
  onClose: () => void;
}

export const TestAPIModal: React.FC<TestAPIModalProps> = ({ api, onClose }) => {
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('');
  const [headers, setHeaders] = useState([{ key: 'Content-Type', value: 'application/json' }]);
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const headerObj = headers.reduce((acc: any, h) => {
        if (h.key) acc[h.key] = h.value;
        return acc;
      }, {});

      let bodyObj = {};
      if (body) {
        try {
          bodyObj = JSON.parse(body);
        } catch (e) {
          // Handle invalid JSON
        }
      }

      const response = await apiService.testConnection({
        baseUrl: api.baseUrl,
        endpoint,
        method,
        headers: headerObj,
        body: bodyObj
      });

      setResult(response.data);
    } catch (error: any) {
      setResult({
        status: error.response?.status || 500,
        statusText: error.response?.statusText || 'Error',
        error: error.message,
        data: error.response?.data,
        responseTime: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const removeHeader = (index: number) => setHeaders(headers.filter((_, i) => i !== index));
  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-dark-900 border border-gray-800 w-full max-w-5xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-dark-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Play className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Test API Endpoint</h3>
              <p className="text-xs text-gray-500">Simulate a request through your proxy to {api.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white hover:bg-dark-800 rounded-xl transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Request Panel */}
          <div className="flex-1 overflow-y-auto p-6 border-r border-gray-800 custom-scrollbar">
            <div className="space-y-6">
              <div className="flex space-x-2">
                <select 
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="bg-dark-950 border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
                >
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>PATCH</option>
                  <option>DELETE</option>
                </select>
                <div className="flex-1 relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <input 
                    type="text" 
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="/v1/resource"
                    className="w-full bg-dark-950 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Base URL indicator */}
              <div className="flex items-center space-x-2 text-[11px] text-gray-500 bg-dark-950/50 p-2 rounded-lg border border-gray-800/50">
                <span className="font-bold uppercase opacity-50">Base:</span>
                <span className="font-mono">{api.baseUrl}</span>
              </div>

              {/* Headers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Headers</h4>
                  <button 
                    onClick={addHeader}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    + Add Header
                  </button>
                </div>
                <div className="space-y-2">
                  {headers.map((header, index) => (
                    <div key={index} className="flex space-x-2">
                      <input 
                        type="text" 
                        placeholder="Key"
                        value={header.key}
                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                        className="flex-1 bg-dark-950 border border-gray-800 rounded-lg py-2 px-3 text-xs text-gray-300 focus:outline-none focus:border-primary/50"
                      />
                      <input 
                        type="text" 
                        placeholder="Value"
                        value={header.value}
                        onChange={(e) => updateHeader(index, 'value', e.target.value)}
                        className="flex-1 bg-dark-950 border border-gray-800 rounded-lg py-2 px-3 text-xs text-gray-300 focus:outline-none focus:border-primary/50"
                      />
                      <button 
                        onClick={() => removeHeader(index)}
                        className="p-2 text-gray-600 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body */}
              {method !== 'GET' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Body (JSON)</h4>
                  <textarea 
                    rows={8}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder='{ "key": "value" }'
                    className="w-full bg-dark-950 border border-gray-800 rounded-xl py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Response Panel */}
          <div className="flex-1 bg-dark-950/30 overflow-y-auto p-6 custom-scrollbar relative">
            {!result && !isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-dark-800 rounded-2xl mb-4 border border-gray-800">
                  <Terminal className="h-8 w-8 text-gray-600" />
                </div>
                <h4 className="text-gray-400 font-bold mb-1">No request sent yet</h4>
                <p className="text-xs text-gray-600">Configure your request and click Send.</p>
              </div>
            ) : isLoading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Waiting for response...</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1.5 rounded-lg border font-bold flex items-center ${
                      result.status < 300 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {result.status < 300 ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                      {result.status} {result.statusText}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 bg-dark-900 px-2 py-1.5 rounded border border-gray-800">
                      <Clock className="h-3.5 w-3.5 mr-1.5 opacity-50" />
                      {result.responseTime}ms
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-dark-900 border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="px-4 py-2 bg-dark-800 border-b border-gray-800 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Response Body</span>
                      <Code className="h-3.5 w-3.5 text-gray-600" />
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <pre className="text-xs font-mono text-gray-300">
                        {JSON.stringify(result.data || result.error, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-dark-950/50 flex justify-end">
          <button 
            onClick={handleTest}
            disabled={isLoading}
            className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            <span>Send Request</span>
          </button>
        </div>
      </div>
    </div>
  );
};
