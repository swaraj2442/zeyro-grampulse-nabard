"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Download, Copy, Filter, Terminal } from 'lucide-react';
import { underwritingApi } from '@/services/underwritingApi';

export function AgentLogsPanel() {
  const [logs, setLogs] = useState<Array<{ time: string; level: string; msg: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadLogs() {
      setLoading(true);
      try {
        const res = await underwritingApi.getAgentLogs();
        if (isMounted && Array.isArray(res)) {
          setLogs(res);
        }
      } catch (err) {
        if (isMounted) setLogs([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadLogs();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight }); }, [logs]);

  const col = (l: string) =>
    l === 'WARN' ? 'text-amber-400' : l === 'ERROR' ? 'text-red-400' : 'text-green-400';

  const handleCopy = () => {
    const text = logs.map(l => `[${l.time}] [${l.level}] ${l.msg}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div ref={ref} className="flex-1 overflow-y-auto bg-[#1A1A1A] rounded-xl p-3 font-mono text-[10px] leading-relaxed space-y-0.5 no-scrollbar min-h-0">
        {loading ? (
          <p className="text-gray-500 text-center py-8">Connecting to agent log stream...</p>
        ) : logs.length > 0 ? (
          logs.map((log, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-gray-500 shrink-0 tabular-nums">{log.time}</span>
              <span className={`shrink-0 w-12 ${col(log.level)}`}>[{log.level}]</span>
              <span className="text-gray-300">{log.msg}</span>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 text-gray-500">
            <Terminal size={20} className="mb-2 opacity-40" />
            <p className="text-[11px] font-medium text-gray-400">No agent execution logs recorded</p>
            <p className="text-[10px] text-gray-600 mt-0.5">Logs will stream in real-time as background jobs run.</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 shrink-0">
        <button className="text-[11px] text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 flex items-center gap-1 transition-colors">
          <Download size={11} /> Download
        </button>
        <button onClick={handleCopy} className="text-[11px] text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 flex items-center gap-1 transition-colors">
          <Copy size={11} /> Copy
        </button>
        <button className="text-[11px] text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 flex items-center gap-1 transition-colors ml-auto">
          <Filter size={11} /> ALL ▾
        </button>
      </div>
    </div>
  );
}
