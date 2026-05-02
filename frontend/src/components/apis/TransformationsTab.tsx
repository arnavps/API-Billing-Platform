import React, { useState } from 'react';
import { 
  Code2, 
  Save, 
  Play, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAPIStore } from '../../store/useAPIStore';

interface TransformationsTabProps {
  api: any;
}

export const TransformationsTab: React.FC<TransformationsTabProps> = ({ api }) => {
  const { updateAPIConfiguration, isLoading } = useAPIStore();
  const [requestTransform, setRequestTransform] = useState(api.configuration?.transformations?.request || '// (req) => { \n//   req.headers["x-custom"] = "value"; \n//   return req; \n// }');
  const [responseTransform, setResponseTransform] = useState(api.configuration?.transformations?.response || '// (res) => { \n//   delete res.data.internal_id; \n//   return res; \n// }');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSave = async () => {
    try {
      await updateAPIConfiguration(api._id, {
        transformations: {
          request: requestTransform,
          response: responseTransform
        }
      });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save transformations', error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Sandboxed Transformations</h3>
          <p className="text-sm text-gray-500">Modify requests and responses in real-time using secure JavaScript execution.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center space-x-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all disabled:opacity-50"
        >
          {isLoading ? <Zap className="h-4 w-4 animate-spin" /> : isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          <span>{isSuccess ? 'Saved!' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Request Transformation */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-primary">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <ArrowRight className="h-4 w-4" />
            </div>
            <span className="font-bold uppercase tracking-widest text-[10px]">Request Interceptor</span>
          </div>
          
          <div className="bg-dark-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-dark-950 px-4 py-2 border-b border-gray-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-500 italic">request_transform.js</span>
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
              </div>
            </div>
            <textarea
              value={requestTransform}
              onChange={(e) => setRequestTransform(e.target.value)}
              spellCheck={false}
              className="w-full h-64 p-6 bg-transparent text-gray-300 font-mono text-sm focus:outline-none resize-none custom-scrollbar"
              placeholder="(req) => { ... }"
            />
            <div className="px-6 py-3 bg-dark-950/50 border-t border-gray-800 text-[10px] text-gray-500 flex items-center space-x-2">
              <Info className="h-3 w-3" />
              <span>Context: req (method, headers, body, query)</span>
            </div>
          </div>
        </div>

        {/* Response Transformation */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-secondary">
            <div className="p-1.5 bg-secondary/10 rounded-lg">
              <ArrowRight className="h-4 w-4 rotate-180" />
            </div>
            <span className="font-bold uppercase tracking-widest text-[10px]">Response Interceptor</span>
          </div>
          
          <div className="bg-dark-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-dark-950 px-4 py-2 border-b border-gray-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-500 italic">response_transform.js</span>
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
              </div>
            </div>
            <textarea
              value={responseTransform}
              onChange={(e) => setResponseTransform(e.target.value)}
              spellCheck={false}
              className="w-full h-64 p-6 bg-transparent text-gray-300 font-mono text-sm focus:outline-none resize-none custom-scrollbar"
              placeholder="(res) => { ... }"
            />
            <div className="px-6 py-3 bg-dark-950/50 border-t border-gray-800 text-[10px] text-gray-500 flex items-center space-x-2">
              <Info className="h-3 w-3" />
              <span>Context: res (status, headers, data)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Card */}
      <div className="bg-gradient-to-br from-dark-900 to-dark-800 border border-gray-800 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Code2 className="h-32 w-32" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span>How Transformations Work</span>
          </h4>
          <div className="space-y-4 text-sm text-gray-400 leading-relaxed">
            <p>
              Transformations allow you to programmatically modify requests before they reach your backend, and responses before they reach your customers. This is perfect for adding custom headers, filtering sensitive data, or restructuring payloads.
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Scripts run in a secure V8 sandbox with a 100ms timeout.</li>
              <li>You must return the modified object (req or res).</li>
              <li>Access is restricted to the request/response object context only.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-4">
        <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center space-x-3">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <span className="text-xs text-yellow-500/80 font-medium">Use with caution. Transformations increase latency by approximately 5-10ms.</span>
        </div>
      </div>
    </div>
  );
};
