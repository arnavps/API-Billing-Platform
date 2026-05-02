import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useDocsStore } from '../../store/useDocsStore';
import { CodeBlock } from '../../components/docs/CodeBlock';

export const GuidePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchGuide, currentGuide, loading, error } = useDocsStore();

  useEffect(() => {
    if (id) fetchGuide(id);
  }, [id, fetchGuide]);

  if (loading) return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 bg-white/5 w-1/2 rounded-lg" />
      <div className="space-y-4">
        <div className="h-4 bg-white/5 w-full rounded-md" />
        <div className="h-4 bg-white/5 w-5/6 rounded-md" />
        <div className="h-4 bg-white/5 w-4/6 rounded-md" />
      </div>
      <div className="h-64 bg-white/5 rounded-2xl" />
    </div>
  );

  if (error) return (
    <div className="text-rose-400 bg-rose-400/10 p-4 rounded-xl border border-rose-400/20">
      {error}
    </div>
  );

  if (!currentGuide) return <div className="text-slate-400">Guide not found</div>;

  return (
    <div className="prose prose-invert prose-primary max-w-none animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-white mt-12 mb-4 border-b border-white/5 pb-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-white mt-8 mb-4" {...props} />,
          p: ({ node, ...props }) => <p className="text-slate-400 leading-relaxed mb-6" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-slate-400 space-y-2 mb-6" {...props} />,
          li: ({ node, ...props }) => <li className="text-slate-400" {...props} />,
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text';
            
            return inline ? (
              <code className="bg-white/5 px-1.5 py-0.5 rounded text-primary-400 font-mono text-sm" {...props}>
                {children}
              </code>
            ) : (
              <CodeBlock 
                code={String(children).replace(/\n$/, '')} 
                language={language} 
              />
            );
          },
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-primary-500 bg-primary-500/5 px-6 py-4 rounded-r-xl italic text-slate-300 mb-6" {...props} />
          ),
          a: ({ node, ...props }) => <a className="text-primary-400 hover:text-primary-300 underline decoration-primary-500/30 underline-offset-4 transition-colors" {...props} />,
        }}
      >
        {currentGuide.content}
      </ReactMarkdown>
    </div>
  );
};
