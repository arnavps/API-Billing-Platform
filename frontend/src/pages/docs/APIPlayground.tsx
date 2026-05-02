import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDocsStore } from '../../store/useDocsStore';
import { 
  PlayIcon, 
  ArrowPathIcon, 
  DocumentDuplicateIcon,
  ChevronDownIcon,
  PlusIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  BoltIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export const APIPlayground: React.FC = () => {
  const { fetchPublicAPIs, publicAPIs, proxyPlaygroundRequest } = useDocsStore();
  const [selectedApi, setSelectedApi] = useState<any>(null);
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('/');
  const [apiKey, setApiKey] = useState('');
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([
    { key: 'Content-Type', value: 'application/json' }
  ]);
  const [params, setParams] = useState<Array<{ key: string; value: string }>>([]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('params');

  useEffect(() => {
    fetchPublicAPIs();
  }, [fetchPublicAPIs]);

  const handleSendRequest = async () => {
    if (!selectedApi) return;
    setLoading(true);
    setResponse(null);

    try {
      const headerObj = headers.reduce((acc, curr) => {
        if (curr.key) acc[curr.key] = curr.value;
        return acc;
      }, {} as any);

      const queryObj = params.reduce((acc, curr) => {
        if (curr.key) acc[curr.key] = curr.value;
        return acc;
      }, {} as any);

      const res = await proxyPlaygroundRequest(selectedApi.slug, {
        method,
        path,
        headers: headerObj,
        query: queryObj,
        body: method !== 'GET' ? (body ? JSON.parse(body) : {}) : undefined,
      }, apiKey);

      setResponse(res);
    } catch (error: any) {
      setResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const removeHeader = (index: number) => setHeaders(headers.filter((_, i) => i !== index));
  
  const addParam = () => setParams([...params, { key: '', value: '' }]);
  const removeParam = (index: number) => setParams(params.filter((_, i) => i !== index));

  return (
    <div className="h-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">API Playground</h1>
        <p className="text-slate-400">Interactive environment to test APIs in real-time.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 min-h-[600px]">
        {/* Request Panel */}
        <div className="glass-card p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <CommandLineIcon className="w-5 h-5 text-primary-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Request</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">API</label>
                <select 
                  className="w-full bg-surface-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 transition-all appearance-none"
                  onChange={(e) => {
                    const api = publicAPIs.find(a => a.slug === e.target.value);
                    setSelectedApi(api);
                    if (api?.endpoints?.[0]) {
                      setPath(api.endpoints[0].path);
                      setMethod(api.endpoints[0].method);
                    }
                  }}
                >
                  <option value="">Select API...</option>
                  {publicAPIs.map(api => (
                    <option key={api.slug} value={api.slug}>{api.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Method</label>
                <select 
                  className="w-full bg-surface-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 transition-all"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                >
                  {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">API Key</label>
                <input 
                  type="password"
                  placeholder="mf_live_..."
                  className="w-full bg-surface-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 transition-all font-mono"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Path</label>
              <div className="flex bg-surface-800 border border-white/5 rounded-lg overflow-hidden group focus-within:border-primary-500 transition-all">
                <span className="px-3 py-2 bg-white/5 text-slate-500 text-sm border-r border-white/5 font-mono">
                  {selectedApi ? `/${selectedApi.slug}` : '/api'}
                </span>
                <input 
                  type="text" 
                  className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none font-mono"
                  placeholder="/endpoint"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex border-b border-white/5 gap-6">
                {(['params', 'headers', 'body'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-bold capitalize transition-all relative ${
                      activeTab === tab ? 'text-primary-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              <div className="min-h-[200px]">
                {activeTab === 'params' && (
                  <div className="space-y-2">
                    {params.map((param, idx) => (
                      <div key={idx} className="flex gap-2 group">
                        <input 
                          placeholder="Key" 
                          className="flex-1 bg-surface-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-primary-500"
                          value={param.key}
                          onChange={(e) => {
                            const newParams = [...params];
                            newParams[idx].key = e.target.value;
                            setParams(newParams);
                          }}
                        />
                        <input 
                          placeholder="Value" 
                          className="flex-1 bg-surface-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-primary-500"
                          value={param.value}
                          onChange={(e) => {
                            const newParams = [...params];
                            newParams[idx].value = e.target.value;
                            setParams(newParams);
                          }}
                        />
                        <button onClick={() => removeParam(idx)} className="p-2 text-slate-500 hover:text-rose-400">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button onClick={addParam} className="flex items-center gap-2 text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors px-1 py-2">
                      <PlusIcon className="w-3 h-3" /> Add Parameter
                    </button>
                  </div>
                )}

                {activeTab === 'headers' && (
                  <div className="space-y-2">
                    {headers.map((header, idx) => (
                      <div key={idx} className="flex gap-2 group">
                        <input 
                          placeholder="Key" 
                          className="flex-1 bg-surface-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-primary-500"
                          value={header.key}
                          onChange={(e) => {
                            const newHeaders = [...headers];
                            newHeaders[idx].key = e.target.value;
                            setHeaders(newHeaders);
                          }}
                        />
                        <input 
                          placeholder="Value" 
                          className="flex-1 bg-surface-800 border border-white/5 rounded-lg px-3 py-2 text-sm focus:border-primary-500"
                          value={header.value}
                          onChange={(e) => {
                            const newHeaders = [...headers];
                            newHeaders[idx].value = e.target.value;
                            setHeaders(newHeaders);
                          }}
                        />
                        <button onClick={() => removeHeader(idx)} className="p-2 text-slate-500 hover:text-rose-400">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button onClick={addHeader} className="flex items-center gap-2 text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors px-1 py-2">
                      <PlusIcon className="w-3 h-3" /> Add Header
                    </button>
                  </div>
                )}

                {activeTab === 'body' && (
                  <textarea 
                    className="w-full h-48 bg-surface-800 border border-white/5 rounded-xl p-4 text-sm font-mono focus:outline-none focus:border-primary-500 transition-all resize-none"
                    placeholder={`{\n  "key": "value"\n}`}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>

          <button 
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/10 ${
              loading ? 'bg-primary-500/20 text-primary-400 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600 text-white active:scale-[0.98]'
            }`}
            onClick={handleSendRequest}
            disabled={loading}
          >
            {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PlayIcon className="w-5 h-5 fill-current" />}
            {loading ? 'Sending Request...' : 'Send Request'}
          </button>
        </div>

        {/* Response Panel */}
        <div className="glass-card p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Response</h3>
            </div>
            {response && !response.error && (
              <div className="flex gap-4 text-xs font-medium">
                <span className="flex items-center gap-1 text-emerald-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {response.statusCode} OK
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <ClockIcon className="w-3 h-3" />
                  {response.responseTime}ms
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 bg-surface-800 rounded-xl border border-white/5 overflow-hidden flex flex-col min-h-[400px]">
            {!response && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3 p-12 text-center">
                <BoltIcon className="w-12 h-12 opacity-20" />
                <p>Send a request to see the response here</p>
              </div>
            )}
            
            {loading && (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <ArrowPathIcon className="w-10 h-10 text-primary-500 animate-spin opacity-50" />
                  <p className="text-sm font-medium text-slate-400 animate-pulse">Processing request...</p>
                </div>
              </div>
            )}

            {response && (
              <div className="flex flex-col h-full">
                <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/5">
                  <span className="text-xs font-bold text-slate-500 uppercase">Body</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(response.body || response.error, null, 2))}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  </button>
                </div>
                <pre className="flex-1 p-4 overflow-auto text-sm font-mono text-emerald-400">
                  {JSON.stringify(response.body || response.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
