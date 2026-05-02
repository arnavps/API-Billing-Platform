import React, { useState } from 'react';
import { 
  ClipboardIcon, 
  CheckIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface CodeBlockProps {
  code: string;
  language: string;
  title?: string;
  showLineNumbers?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language, 
  title,
  showLineNumbers = false 
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl border border-white/5 bg-surface-950 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
          </div>
          {title && (
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">
              {title}
            </span>
          )}
          <span className="text-[10px] font-bold text-primary-500/50 uppercase tracking-widest px-2 py-0.5 bg-primary-500/5 rounded border border-primary-500/10">
            {language}
          </span>
        </div>
        <button 
          onClick={copyToClipboard}
          className="p-1.5 hover:bg-white/5 rounded-md transition-all text-slate-400 hover:text-white flex items-center gap-2 group"
        >
          {copied ? (
            <>
              <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <ClipboardIcon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="relative group">
        <pre className="p-5 overflow-x-auto text-sm font-mono leading-relaxed custom-scrollbar">
          <code className={`language-${language} text-slate-300`}>
            {code.trim()}
          </code>
        </pre>
      </div>
    </div>
  );
};

export const LanguageTabs: React.FC<{
  options: Array<{ label: string; language: string; code: string }>;
}> = ({ options }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="space-y-0">
      <div className="flex items-center gap-2 px-2 overflow-x-auto no-scrollbar">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeIdx === i 
                ? 'text-primary-400 border-primary-500 bg-primary-500/5' 
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <CodeBlock 
        code={options[activeIdx].code} 
        language={options[activeIdx].language} 
      />
    </div>
  );
};
