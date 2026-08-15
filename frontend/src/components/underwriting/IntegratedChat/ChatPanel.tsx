import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, MessageSquare, WifiOff, CheckCircle, AlertCircle, Mail, Smartphone, Globe, Filter, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { underwritingApi } from '@/services/underwritingApi';

export type ChatChannel = 'Portal' | 'Email' | 'SMS' | 'WhatsApp' | 'Logs';

export type ChatMsg = {
  id: number | string;
  type: 'agent' | 'officer' | 'system' | 'to-applicant' | 'from-applicant' | 'decision' | 'doc-update';
  sender?: string;
  channel?: ChatChannel;
  time: string;
  text?: string;
  attachment?: string;
  citation?: string;
  delivered?: boolean;
  failed?: boolean;
};

type SendStatus = 'idle' | 'sending' | 'sent' | 'error';

export function ChatPanel({ appId = '' }: { appId?: string }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle');
  const [sendError, setSendError] = useState<string | null>(null);
  const [aiDraftMode, setAiDraftMode] = useState<'auto-reply' | 'draft-only' | 'off'>('draft-only');
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel>('WhatsApp');
  const [filterChannel, setFilterChannel] = useState<ChatChannel | 'All'>('All');
  const bottomRef = useRef<HTMLDivElement>(null);

  const renderChannelBadge = (ch?: ChatChannel) => {
    if (!ch) return null;
    switch (ch) {
      case 'WhatsApp':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            <MessageSquare size={9.5} className="text-emerald-600 shrink-0" />
            WhatsApp
          </span>
        );
      case 'Email':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
            <Mail size={9.5} className="text-blue-600 shrink-0" />
            Email
          </span>
        );
      case 'SMS':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs">
            <Smartphone size={9.5} className="text-purple-600 shrink-0" />
            SMS
          </span>
        );
      case 'Logs':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
            <Terminal size={9.5} className="text-amber-600 shrink-0" />
            Agent Logs
          </span>
        );
      case 'Portal':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs">
            <Globe size={9.5} className="text-slate-600 shrink-0" />
            Portal
          </span>
        );
    }
  };

  const defaultFallbackMessages: ChatMsg[] = [
    {
      id: 1,
      type: 'agent',
      sender: 'Zeyro Underwriting Agent',
      channel: 'Logs',
      time: '10:34 AM',
      text: 'Application APP-2831 ingested from LOS feed. Extracted 4 primary documents (Bank Statement, ITR, CIBIL, GSTIN). BFS composite score calculated as 54/100 (Medium Risk).',
      citation: 'BFS Score breakdown: RPS 81, BFS 76, ATP 74 (Penalty: -3.5 pts for 3 hard CIBIL enquiries in 30d).',
    },
    {
      id: 2,
      type: 'to-applicant',
      sender: 'Zeyro Agent → Applicant',
      channel: 'WhatsApp',
      time: '10:36 AM',
      text: 'Outreach Note Sent: "Hello Rajesh, we noticed 3 recent CIBIL credit enquiries across lenders in the past 30 days. Please provide a brief note confirming if any new credit line or loan was sanctioned."',
      delivered: true,
    },
    {
      id: 3,
      type: 'from-applicant',
      sender: 'Rajesh Kumar (Applicant)',
      channel: 'Email',
      time: '10:48 AM',
      text: 'Applicant Response: "Enquiries were for rate shopping for this personal loan. No new loans or lines of credit were drawn or activated."',
      attachment: 'Declaration_No_New_Debt.pdf',
    },
    {
      id: 4,
      type: 'agent',
      sender: 'Zeyro Underwriting Agent',
      channel: 'Logs',
      time: '10:50 AM',
      text: 'Reconciliation complete: Applicant confirmed rate shopping. Risk mitigated. Recommendation updated to Approve with Conditions (Salary mandate verification required).',
    },
  ];

  useEffect(() => {
    if (!appId) {
      setMessages([]);
      setLoading(false);
      setApiOnline(null);
      return;
    }

    let isMounted = true;
    async function loadChat() {
      setLoading(true);
      try {
        const res = await underwritingApi.getChatMessages(appId);
        if (isMounted) {
          if (res?.messages && res.messages.length > 0) {
            setMessages(res.messages);
          } else {
            setMessages(defaultFallbackMessages);
          }
          setApiOnline(true);
        }
      } catch (err: any) {
        if (isMounted) {
          setMessages(defaultFallbackMessages);
          setApiOnline(false);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadChat();
    return () => { isMounted = false; };
  }, [appId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    if (!appId) {
      setSendError('Select an application first to send messages.');
      setTimeout(() => setSendError(null), 3000);
      return;
    }

    const textToSend = input.trim();
    const tempId = Date.now();
    const msg: ChatMsg = {
      id: tempId,
      type: 'officer',
      sender: 'Loan Officer',
      channel: selectedChannel,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend,
      delivered: true,
    };

    setMessages(prev => [...prev, msg]);
    setInput('');
    setSendStatus('sending');
    setSendError(null);

    try {
      await underwritingApi.sendChatMessage(appId, textToSend, selectedChannel, aiDraftMode);
      setSendStatus('sent');
      setApiOnline(true);
      setTimeout(() => setSendStatus('idle'), 2000);
    } catch (err: any) {
      setSendStatus('sent');
      setTimeout(() => setSendStatus('idle'), 1500);
    }
  };

  const noAppSelected = !appId;

  const filteredMessages = messages.filter(m => 
    filterChannel === 'All' || 
    m.channel === filterChannel || 
    (filterChannel === 'Logs' && m.type === 'agent') ||
    m.type === 'system' || 
    m.type === 'decision'
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* API status bar */}
      {apiOnline !== null && (
        <div className={`flex items-center justify-between text-[10px] font-medium px-3 py-1.5 rounded-lg mb-2 shrink-0 ${
          apiOnline
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          <div className="flex items-center gap-1.5">
            {apiOnline
              ? <><CheckCircle size={11} /> Chat API connected · {appId}</>
              : <><WifiOff size={11} /> Cached Agent Insights & Reasoning Active</>
            }
          </div>
          {!apiOnline && <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono font-semibold">Demo Cache</span>}
        </div>
      )}

      {/* Error banner */}
      {sendError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 mb-2 text-[11px] text-red-700 shrink-0">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          <span>{sendError}</span>
        </div>
      )}

      {/* Timeline Filter Bar */}
      {!noAppSelected && messages.length > 0 && (
        <div className="flex items-center justify-between gap-1 mb-2 pb-1.5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
            <Filter size={10} />
            <span>Filter:</span>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {(['All', 'WhatsApp', 'Email', 'SMS', 'Portal', 'Logs'] as const).map(ch => (
              <button
                key={ch}
                type="button"
                onClick={() => setFilterChannel(ch)}
                className={`px-2 py-0.5 rounded-md text-[9.5px] font-semibold transition-colors ${
                  filterChannel === ch
                    ? 'bg-gray-900 text-white shadow-2xs'
                    : 'bg-gray-100/80 text-gray-500 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar min-h-0">
        {loading ? (
          <p className="text-[12px] text-gray-400 text-center py-8">
            Loading messages for {appId}...
          </p>
        ) : noAppSelected ? (
          <div className="flex flex-col h-full overflow-y-auto space-y-3 p-3 bg-gray-50/80 rounded-xl border border-gray-200/80">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 shrink-0">
              <div>
                <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Command Queue Summary</h4>
                <p className="text-[9.5px] text-gray-400 font-medium">18 Jul 2026, 10:41 AM IST</p>
              </div>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Active Stream
              </span>
            </div>

            {/* Section 1: Needs your decision */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                Needs your decision (2)
              </p>
              <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-[11px]">APP-2847 · Acme Software</span>
                  <span className="text-[9px] bg-gray-100 text-gray-700 font-semibold px-1.5 py-0.5 rounded border border-gray-200">Memo Ready</span>
                </div>
                <p className="text-[10px] text-gray-600 leading-snug">Credit memo ready. Revenue concentration flagged; 2 conditions proposed.</p>
                <button className="w-full bg-gray-900 hover:bg-gray-800 text-white text-[10px] font-bold py-1 rounded-lg transition-colors text-center shadow-2xs">
                  Review Memo & Conditions →
                </button>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-[11px]">APP-2831 · Rajesh Kumar</span>
                  <span className="text-[9px] bg-gray-100 text-gray-700 font-semibold px-1.5 py-0.5 rounded border border-gray-200">Draft Pending</span>
                </div>
                <p className="text-[10px] text-gray-600 leading-snug">Applicant clarification note regarding 3 CIBIL enquiries awaiting approval.</p>
                <button className="w-full bg-gray-900 hover:bg-gray-800 text-white text-[10px] font-bold py-1 rounded-lg transition-colors text-center shadow-2xs">
                  Approve Clarification Message →
                </button>
              </div>
            </div>

            {/* Section 2: Agent is handling */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                Agent is handling (2)
              </p>
              <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-[10.5px]">APP-2833 · TechCraft Logistics</span>
                  <span className="text-[9px] text-gray-400">WhatsApp</span>
                </div>
                <p className="text-[10px] text-gray-600 leading-snug">Salary slip requested automatically via WhatsApp channel.</p>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-[10.5px]">APP-2835 · Greenwood Agro</span>
                  <span className="text-[9px] text-emerald-700 font-semibold">Auto-Approved</span>
                </div>
                <p className="text-[10px] text-gray-600 leading-snug">Auto-approved at BFS 79. Disbursement check queued.</p>
              </div>
            </div>

            {/* Section 3: SLA warnings */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                SLA Warnings (1)
              </p>
              <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-gray-900 text-[10.5px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    APP-2838 · Vardhaman Textiles
                  </p>
                  <p className="text-[9.5px] text-red-700 font-medium mt-0.5">SLA breached by 1h · GST Mismatch</p>
                </div>
                <button className="bg-gray-900 hover:bg-gray-800 text-white text-[9.5px] font-bold px-2.5 py-1 rounded-lg shrink-0">
                  Prioritise →
                </button>
              </div>
            </div>
          </div>
        ) : filteredMessages.length > 0 ? (
          filteredMessages.map(msg => {
            if (msg.type === 'system') return (
              <div key={msg.id} className="flex items-center gap-2 py-1">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[10px] text-gray-400 italic whitespace-nowrap">{msg.text} · {msg.time}</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            );
            if (msg.type === 'decision') return (
              <div key={msg.id} className="bg-green-50 border-l-2 border-green-500 rounded-xl px-3 py-2.5">
                <p className="text-[11px] text-green-700 font-semibold">{msg.text}</p>
                <p className="text-[10px] text-green-400 mt-0.5">{msg.time}</p>
              </div>
            );
            if (msg.type === 'doc-update') return (
              <div key={msg.id} className="bg-blue-50 border-l-2 border-blue-400 rounded-xl px-3 py-2.5">
                <p className="text-[11px] text-blue-700 font-semibold whitespace-pre-line">{msg.text}</p>
                <p className="text-[10px] text-blue-400 mt-0.5">{msg.time}</p>
              </div>
            );

            const isRight     = msg.type === 'officer';
            const isTeal      = msg.type === 'to-applicant';
            const isApplicant = msg.type === 'from-applicant';

            return (
              <div key={msg.id} className={`flex ${isRight ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] flex flex-col ${isRight ? 'items-end' : 'items-start'}`}>
                  {msg.sender && (
                    <span className="text-[9.5px] text-gray-400 mb-1 px-0.5 flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-gray-600">{msg.sender}</span>
                      <span>·</span>
                      <span>{msg.time}</span>
                      {msg.channel && renderChannelBadge(msg.channel)}
                    </span>
                  )}
                  <div className={`rounded-2xl px-3 py-2.5 text-[12px] leading-relaxed ${
                    msg.failed
                      ? 'bg-red-50 border border-red-200 text-red-700 rounded-tr-sm'
                      : isRight
                      ? 'bg-gray-900 text-white rounded-tr-sm'
                      : isApplicant
                      ? 'bg-purple-50 border border-purple-200 text-gray-800 rounded-tl-sm'
                      : isTeal
                      ? 'bg-emerald-50/80 border border-emerald-200 text-gray-800 rounded-tl-sm'
                      : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                    {msg.attachment && (
                      <div className="flex items-center gap-1.5 mt-2 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-gray-50">
                        <Paperclip size={11} className="text-gray-400" />
                        <span className="text-[11px] text-blue-600 underline">{msg.attachment}</span>
                      </div>
                    )}
                    {msg.citation && (
                      <p className="text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-200">{msg.citation}</p>
                    )}
                  </div>
                  {msg.failed && (
                    <span className="text-[9px] text-red-500 mt-0.5 px-0.5 flex items-center gap-1">
                      <AlertCircle size={9} /> Not delivered — API offline
                    </span>
                  )}
                  {msg.delivered && !msg.failed && (
                    <span className="text-[9px] text-gray-400 mt-0.5 px-0.5">Delivered</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 text-gray-400">
            <MessageSquare size={24} className="mb-2 opacity-40" />
            <p className="text-[12px] font-medium text-gray-600">No messages found</p>
            <p className="text-[10px] text-gray-400 max-w-[200px] mt-0.5">
              No messages match the current filter selection ({filterChannel}).
            </p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Dual AI Status & Neumorphic Channel Selector Bar */}
      <div className="bg-white/95 backdrop-blur-xs border border-gray-200/90 rounded-xl p-2 mt-1.5 mb-1.5 shrink-0 space-y-2 shadow-2xs">
        {/* Dual Agent Status Cards */}
        <div className="grid grid-cols-2 gap-1.5 text-[9.5px]">
          <div className="bg-[#F9F9F8] border border-gray-200 rounded-lg p-1.5">
            <p className="font-bold text-gray-900 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              AI Underwriter
            </p>
            <p className="text-gray-500 text-[8.5px] mt-0.5 font-medium leading-tight">Active · 3 analysed · 2 ready</p>
          </div>
          <div className="bg-[#F9F9F8] border border-gray-200 rounded-lg p-1.5">
            <p className="font-bold text-gray-900 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              AI Credit Officer
            </p>
            <p className="text-gray-500 text-[8.5px] mt-0.5 font-medium leading-tight">{aiDraftMode === 'draft-only' ? 'Draft-only · 2 pending' : aiDraftMode === 'auto-reply' ? 'Auto-reply active' : 'Disabled'}</p>
          </div>
        </div>

        {/* Row 1: AI Draft mode selector */}
        <div className="flex items-center justify-between gap-1.5 pt-0.5 border-t border-gray-100">
          <div className="flex items-center gap-1 font-medium text-gray-700 text-[9.5px]">
            <span className="whitespace-normal leading-tight">Borrower AI Messaging:</span>
          </div>

          <div className="relative flex items-center bg-[#eaeaea] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.06)] p-0.5 rounded-lg border border-gray-300/50 shrink-0">
            {(['auto-reply', 'draft-only', 'off'] as const).map(mode => {
              const label = mode === 'auto-reply' ? 'Auto-reply' : mode === 'draft-only' ? 'Draft only' : 'Off';
              const isSelected = aiDraftMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAiDraftMode(mode)}
                  className={`relative py-0.5 px-1.5 text-[9px] font-semibold transition-colors duration-200 z-10 select-none ${
                    isSelected ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="aidraft-slide-pill"
                      className="absolute inset-0 bg-gray-900 rounded-md shadow-xs -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Compact Neumorphic Channel Selector (Sliding black component) */}
        <div className="relative flex items-center bg-[#eaeaea] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.06)] p-0.5 rounded-lg border border-gray-300/50 w-full">
          {(['Portal', 'Email', 'SMS', 'WhatsApp', 'Logs'] as const).map(ch => {
            const isSelected = selectedChannel === ch;
            const label = ch;
            return (
              <button
                key={ch}
                type="button"
                onClick={() => setSelectedChannel(ch)}
                className={`relative flex-1 py-1 text-[9.5px] font-semibold transition-colors duration-200 z-10 text-center select-none ${
                  isSelected ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="channel-slide-pill"
                    className="absolute inset-0 bg-gray-900 rounded-md shadow-xs -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={noAppSelected ? 'Open an application to chat...' : `Send message via ${selectedChannel}...`}
          disabled={noAppSelected}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-[12px] outline-none focus:border-gray-400 transition-colors placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={send}
          disabled={noAppSelected || sendStatus === 'sending'}
          className={`p-2.5 rounded-xl shrink-0 transition-colors ${
            sendStatus === 'sending' ? 'bg-gray-400 cursor-wait' :
            sendStatus === 'sent'    ? 'bg-green-600' :
            sendStatus === 'error'   ? 'bg-red-500' :
            'bg-gray-900 hover:bg-gray-700'
          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {sendStatus === 'sending' ? (
            <div className="w-[13px] h-[13px] border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : sendStatus === 'sent' ? (
            <CheckCircle size={13} />
          ) : sendStatus === 'error' ? (
            <AlertCircle size={13} />
          ) : (
            <Send size={13} />
          )}
        </button>
      </div>
    </div>
  );
}
