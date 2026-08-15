"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Map, Moon, ArrowUp, Plus, X, LogOut, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { AgentWorkspaceView } from './agentWorkspaceView';
import UnderwritingWorkspace from './underwritingWorkspace';

export default function BFSDashboard() {
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [addedAgents, setAddedAgents] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const [rightPanelTab, setRightPanelTab] = useState<'copilot' | 'logs'>('copilot');
  const [activeSection, setActiveSection] = useState<string>('DATA');
  const [inputVal, setInputVal] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: 1,
      sender: 'Zeyro Copilot',
      text: 'Zeyro sandbox agent is online and ready. What would you like to explore?',
      timestamp: '10:40 AM',
      isAgent: true
    }
  ]);
  const [agentLogs, setAgentLogs] = useState<string[]>([
    `[15:38:12] INFO: Initializing Agent Model...`,
    `[15:38:14] SUCCESS: Loaded capability sets.`,
    `[15:39:00] INFO: Listening for new events...`
  ]);

  const addAgentLog = (text: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setAgentLogs(prev => [...prev, `[${timestamp}] ${text}`]);
  };

  const handleSendMessage = (overrideText?: string) => {
    const textToSend = overrideText || inputVal;
    if (!textToSend.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'You',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAgent: false
    };
    setChatMessages(prev => [...prev, newMsg]);
    setInputVal('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'Zeyro Copilot',
        text: `Processed query for ${selectedNode || 'agent'}. Sync status is stable.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAgent: true
      }]);
    }, 1000);
  };

  const addSystemMessage = (text: string, customElement?: string) => {
    setChatMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      sender: 'Zeyro Copilot',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAgent: true,
      customElement
    }]);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const [nodes, setNodes] = useState<any[]>([]);
  const [homeData, setHomeData] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const authApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    async function fetchModules() {
      try {
        const response = await fetch(`${authApiUrl}/api/intelligence-modules`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        if (data && data.modules) {
          const fetchedNodes = data.modules.map((mod: any, index: number) => ({
            label: mod.name,
            angle: (index * (360 / data.modules.length)) - 90,
          }));
          setNodes(fetchedNodes);
        } else {
          throw new Error('No modules in response');
        }
      } catch {
        setApiError(true);
        setNodes([]);
      }
    }
    async function fetchHomeData() {
      try {
        const response = await fetch(`${authApiUrl}/api/home`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setHomeData(data);
      } catch {
        setApiError(true);
      }
    }
    fetchModules();
    fetchHomeData();
  }, []);


  // isExpanded is only set to true when the mini agent screen card is clicked directly
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUnderwriting, setShowUnderwriting] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#f4f5f4] font-sans overflow-hidden relative">

      {/* ── Underwriting Workspace full-screen overlay ── */}
      <AnimatePresence>
        {showUnderwriting && (
          <motion.div
            key="underwriting-workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 bg-[#F7F7F5] overflow-hidden"
          >
            <UnderwritingWorkspace onBack={() => { setShowUnderwriting(false); setSelectedAgent(null); }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full-screen agent workspace overlay ── */}
      <AnimatePresence>
        {isExpanded && selectedNode && (
          <motion.div
            key="fullscreen-expanded"
            layoutId={`agent-card-${selectedNode}`}
            className="absolute inset-0 z-50 bg-[#FAF9F5] flex overflow-hidden text-gray-800"
            transition={{ type: 'spring', damping: 32, stiffness: 200 }}
          >
            <AgentWorkspaceView
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              setIsExpanded={setIsExpanded}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              rightPanelTab={rightPanelTab}
              setRightPanelTab={setRightPanelTab}
              chatMessages={chatMessages}
              inputVal={inputVal}
              setInputVal={setInputVal}
              handleSendMessage={handleSendMessage}
              addSystemMessage={addSystemMessage}
              agentLogs={agentLogs}
              addAgentLog={addAgentLog}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Pane (Main Workspace) */}
      <div className="flex-1 relative flex flex-col">
        {/* Top Header */}
        <div className="absolute top-0 w-full p-4 flex justify-between items-start z-10">
          {/* Logo Dropdown */}
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-md border border-gray-200 cursor-pointer shadow-sm">
            <span className="font-semibold text-sm text-gray-800">Z</span>
            <span className="text-[10px] text-gray-400">▼</span>
            <span className="ml-1 font-medium text-sm text-gray-700">Zeyro Sandbox</span>
          </div>

          {/* Right Top Actions */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-800 transition-colors shadow-sm relative group">
              <span className="text-yellow-400 text-[10px]">✿</span> Request production access
              <div className="absolute top-full right-0 mt-2 bg-white text-gray-800 border border-gray-200 px-3 py-1.5 rounded-md text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Review the requirements for activating your production environment.
              </div>
            </button>
            <button className="text-gray-500 hover:text-gray-800 transition-colors">
              <Moon size={18} />
            </button>
            <button className="text-gray-500 hover:text-gray-800 transition-colors">
              <Map size={18} />
            </button>
            <button className="text-gray-500 hover:text-gray-800 transition-colors">
              <Search size={18} />
            </button>
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            <button 
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Center Canvas / Mind Map */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">

          {/* Expanded card now lives at root level above everything */}

          <motion.div 
            className={`absolute inset-0 flex items-center justify-center ${isExpanded ? 'pointer-events-none' : ''}`}
            animate={{ opacity: isExpanded ? 0 : 1, scale: isExpanded ? 0.97 : 1 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          >
          
          {/* Circular Connection Lines (Dashed circles in background) */}
          <div className="absolute w-[500px] h-[500px] rounded-full border border-dashed border-gray-300 pointer-events-none" />
          <div className="absolute w-[250px] h-[250px] rounded-full border border-dashed border-gray-200 pointer-events-none" />
          
          {/* Center Hub */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute z-10 flex items-center justify-center w-32 h-32 rounded-full bg-white/10 backdrop-blur-md border border-white/30 shadow-lg cursor-pointer hover:bg-white/20 hover:shadow-xl transition-all"
          >
            <img src="/o3.png" alt="Agent Icon" className="w-24 h-24 object-contain" />
          </motion.div>

          {/* Surrounding Nodes */}
          {nodes.map((node, i) => {
            const radius = 250;
            const angleRad = (node.angle * Math.PI) / 180;
            const x = Math.cos(angleRad) * radius;
            const y = Math.sin(angleRad) * radius;
            
            return (
              <React.Fragment key={node.label}>
                {/* Continuous Water stream connecting to center */}
                <div 
                  className="absolute pointer-events-none origin-left flex items-center"
                  style={{
                    width: `${radius}px`,
                    height: '20px',
                    top: '50%',
                    left: '50%',
                    transform: `translateY(-50%) rotate(${node.angle}deg)`,
                  }}
                >
                  <svg className="w-full h-full">
                    {/* Faint background track */}
                    <line x1="0" y1="10" x2="100%" y2="10" stroke="rgba(229, 231, 235, 0.2)" strokeWidth="1" />
                    
                    {node.label === selectedNode ? (
                      <>
                        {/* Layer 1: Longer segments */}
                        <motion.line
                          x1="0" y1="10" x2="100%" y2="10"
                          stroke="rgba(147, 197, 253, 0.9)"
                          strokeWidth="2.5"
                          strokeLinecap="square"
                          strokeDasharray="16 12 8 28"
                          animate={{ strokeDashoffset: [64, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          style={{ filter: 'drop-shadow(0px 0px 2px rgba(147,197,253,0.7))' }}
                        />
                        
                        {/* Layer 2: Slower, even longer segments */}
                        <motion.line
                          x1="0" y1="10" x2="100%" y2="10"
                          stroke="rgba(191, 219, 254, 0.7)"
                          strokeWidth="1.5"
                          strokeLinecap="square"
                          strokeDasharray="24 24"
                          animate={{ strokeDashoffset: [48, 0] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                        />
                      </>
                    ) : (
                      <line x1="0" y1="10" x2="100%" y2="10" stroke="rgba(229, 231, 235, 0.6)" strokeWidth="1.5" strokeDasharray="8 8" />
                    )}
                  </svg>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => {
                    setSelectedNode(node.label === selectedNode ? null : node.label);
                    setSelectedAgent(null);
                  }}
                  className={`absolute bg-white px-4 py-2 rounded-full shadow-sm border ${node.label === selectedNode ? 'border-blue-400 shadow-blue-100 ring-2 ring-blue-50' : 'border-gray-100'} flex items-center gap-2 text-[11px] font-medium ${node.label === selectedNode ? 'text-blue-700' : 'text-gray-500'} cursor-pointer hover:shadow-md transition-all whitespace-nowrap z-10`}
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  }}
                >
                  <span className="text-gray-300 text-[10px]">⬡</span>
                  {node.label}
                  {node.notification && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold border-2 border-white box-content shadow-sm">
                      {node.notification}
                    </span>
                  )}
                  {addedAgents[node.label] && !isExpanded && (
                    <div className={`absolute ${node.label === 'Underwriting' ? 'top-1/2 items-start left-[calc(100%+32px)]' : 'top-1/2 items-start ' + (x >= 0 ? 'left-[calc(100%+16px)]' : 'right-[calc(100%+16px)] flex-row-reverse')} pointer-events-none flex gap-4`}>
                      {/* Dotted line */}
                      {node.label === 'Underwriting' ? (
                        <svg className={`absolute -left-8 top-0 w-[142px] h-[60px] overflow-visible`} style={{ zIndex: -1 }}>
                          <line x1="0" y1="0" x2="142" y2="0" stroke="#d1d5db" strokeWidth="1" strokeDasharray="4 4" />
                          <circle cx="0" cy="0" r="1.5" fill="white" stroke="#d1d5db" strokeWidth="1" />
                          <line x1="142" y1="0" x2="142" y2="55" stroke="#d1d5db" strokeWidth="1" strokeDasharray="4 4" />
                          <circle cx="142" cy="55" r="2" fill="white" stroke="#d1d5db" strokeWidth="1" />
                        </svg>
                      ) : (
                        <svg className={`absolute ${x >= 0 ? '-left-4' : '-right-4'} top-0 w-[96px] h-[20px] overflow-visible`} style={{ zIndex: -1 }}>
                          <line x1={x >= 0 ? "0" : "96"} y1="0" x2="48" y2="0" stroke="#d1d5db" strokeWidth="1" strokeDasharray="4 4" />
                          <circle cx={x >= 0 ? "0" : "96"} cy="0" r="1.5" fill="white" stroke="#d1d5db" strokeWidth="1" />
                          <line x1="48" y1="0" x2="48" y2="20" stroke="#d1d5db" strokeWidth="1" strokeDasharray="4 4" />
                          <circle cx="48" cy="20" r="2" fill="white" stroke="#d1d5db" strokeWidth="1" />
                        </svg>
                      )}

                      {/* Mini card — click to morph into full screen */}
                      <motion.div
                        layoutId={`agent-card-${node.label}`}
                        className={`bg-white rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.07)] border border-gray-100 overflow-hidden flex flex-col ${node.label === 'Underwriting' ? 'mt-[-100px]' : 'mt-[20px]'} shrink-0 cursor-pointer pointer-events-auto hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-shadow`}
                        style={{ width: 220, height: 155 }}
                        transition={{ type: 'spring', damping: 32, stiffness: 200 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNode(node.label);
                          if (node.label.toLowerCase().includes('underwriting')) {
                            setShowUnderwriting(true);
                          } else {
                            setIsExpanded(true);
                          }
                        }}
                      >
                        <motion.div layoutId={`card-bar-${node.label}`} className="h-5 bg-gray-50 border-b border-gray-100 flex items-center px-2 gap-1 shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#ff5f56]"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-[#ffbd2e]"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-[#27c93f]"></div>
                          <span className="ml-2 text-[7px] text-gray-400 font-medium truncate">{node.label} · Agent</span>
                        </motion.div>
                        <div className="flex-1 bg-[#fafafa] p-2 flex flex-col gap-1.5 overflow-hidden">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                              <span className="text-[5px] text-orange-500">✿</span>
                            </div>
                            <span className="text-[7px] font-semibold text-gray-800 truncate">{node.label}</span>
                            <span className="ml-auto flex items-center gap-0.5 text-[6px] text-green-600 font-medium">
                              <span className="w-1 h-1 rounded-full bg-green-500 inline-block"></span>Active
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            {[['24','Tasks'],['18','Dec.'],['97%','Acc.']].map(([val, lbl]) => (
                              <div key={lbl} className="bg-white rounded border border-gray-100 px-1 py-0.5 text-center">
                                <div className="text-[8px] font-semibold text-gray-800">{val}</div>
                                <div className="text-[5px] text-gray-400">{lbl}</div>
                              </div>
                            ))}
                          </div>
                          <div className="bg-white rounded border border-gray-100 p-1 flex-1 flex flex-col justify-between">
                            {['Processed batch #441','Flagged anomaly #12','Report generated'].map((item, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-blue-400 shrink-0"></div>
                                <span className="text-[6px] text-gray-500 truncate">{item}</span>
                                <span className="ml-auto text-[5px] text-gray-300">{idx+1}m</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </React.Fragment>
            );
          })}
          </motion.div>
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-6 left-6 z-20 flex gap-4 items-end">
          {isPopupOpen && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 w-72 p-4 relative mb-2"
            >
              <button 
                onClick={() => setIsPopupOpen(false)}
                className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-gray-700 shadow-sm z-10"
              >
                <X size={12} />
              </button>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800 text-sm">New Intelligence Models Are Live</h3>
                <span className="text-[10px] text-gray-400 font-mono mt-0.5">Intelligence Suite v1.0</span>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Income Estimation, Behavioral Risk, Cashflow Monitoring and Explainable Underwriting are now available in your sandbox.
              </p>
              <button className="w-full bg-gray-800 text-white py-2 rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors shadow-sm">
                Explore updates
              </button>
            </motion.div>
          )}

          <button className="w-10 h-10 bg-gray-800 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors">
            <Plus size={20} />
          </button>
        </div>
      </div>

      {selectedAgent ? (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-[480px] h-[90vh] bg-white border border-gray-100 shadow-2xl flex flex-col z-20 rounded-[24px] my-4 mr-4 p-6 overflow-y-auto no-scrollbar"
        >
          {/* Agent Detail View */}
          <div className="flex items-center justify-between mb-2 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#fff8ea] border border-orange-100 rounded-xl flex items-center justify-center text-xl text-[#d97706]">⬡</div>
              <h3 className="text-[22px] font-semibold text-gray-900 tracking-tight">{selectedAgent}</h3>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedAgent(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
                title="Back to Department"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <p className="text-[14px] text-gray-500 mb-6 shrink-0 leading-relaxed">
            Autonomous agent responsible for executing workflows and analyzing data within {selectedNode}.
          </p>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 shadow-sm shrink-0">
            <h4 className="text-[14px] font-semibold text-gray-900 mb-3">Capabilities</h4>
            <ul className="text-[13px] text-gray-500 space-y-2 list-disc pl-4">
              <li>Real-time data synchronization</li>
              <li>Automated task routing and execution</li>
              <li>Decision engine with explainability</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 flex justify-between items-center hover:border-gray-300 transition-colors cursor-pointer shadow-sm shrink-0">
            <div>
              <h4 className="text-[14px] font-semibold text-gray-900 mb-1">Agent Logs & Activity</h4>
              <div className="text-[13px] text-gray-500">View recent decisions and workflow steps.</div>
            </div>
            <ArrowUp size={16} className="rotate-45 text-gray-300" />
          </div>
          
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex justify-between items-center hover:border-gray-300 transition-colors cursor-pointer shadow-sm shrink-0 mb-8">
            <div className="flex items-center gap-2">
              <h4 className="text-[14px] font-semibold text-gray-400">Settings</h4>
              <span className="text-[12px] text-gray-300 flex items-center justify-center border border-gray-100 rounded-full w-4 h-4 text-[10px]">i</span>
            </div>
            <ArrowUp size={16} className="rotate-45 text-gray-200" />
          </div>
        </motion.div>
      ) : selectedNode ? (
        <div className="w-[480px] h-[90vh] bg-white border border-gray-100 shadow-2xl flex flex-col z-20 rounded-[24px] my-4 mr-4 p-6 overflow-y-auto no-scrollbar">
           {/* Node Detail View */}
           <div className="flex items-center justify-between mb-2 shrink-0">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-lg text-gray-400">⬡</div>
               <h3 className="text-[22px] font-semibold text-gray-900 tracking-tight">{selectedNode}</h3>
             </div>
             <button 
               onClick={() => setSelectedNode(null)}
               className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
               title="Return to home"
             >
               <Home size={18} />
             </button>
           </div>
           <p className="text-[14px] text-gray-500 mb-6 shrink-0 leading-relaxed">
             {selectedNode} agents streamline your processes, coordinate teams, and keep everything running smoothly.
           </p>

           <div className="w-full h-[200px] rounded-[16px] overflow-hidden mb-6 border border-gray-100 shrink-0 shadow-sm">
             <img src="/hero_banner.png" alt="Hero" className="w-full h-full object-cover" />
           </div>

           <div className="bg-white border border-gray-200 rounded-2xl mb-4 shrink-0 overflow-hidden shadow-sm">
             <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
               <div className="flex items-center gap-2">
                 <h4 className="text-[14px] font-semibold text-gray-900">Agents</h4>
                 <span className="text-[12px] text-gray-400 flex items-center justify-center border border-gray-200 rounded-full w-4 h-4 text-[10px]">i</span>
               </div>
               <div className="flex items-center gap-1 text-[13px] text-gray-400">
                 1 <ArrowUp size={14} className="rotate-180" />
               </div>
             </div>
             <div className="p-4">
               <div className="text-[13px] text-gray-500 mb-4">The default and custom agents assigned to this department.</div>
               <div 
                  onClick={() => setShowUnderwriting(true)}
                  className="flex items-center gap-4 mb-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer hover:border-gray-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all"
                >
                  <div className="w-12 h-12 bg-[#fff8ea] rounded-xl flex items-center justify-center text-[#d97706] text-xl">⬡</div>
                  <div>
                    <div className="text-[14px] font-semibold text-gray-900 mb-0.5">Underwriting Agent</div>
                    <div className="text-[13px] text-gray-500">Application pipeline, BFS scoring, credit memo.</div>
                  </div>
                </div>
                <button 
                  onClick={() => selectedNode && setAddedAgents(prev => ({...prev, [selectedNode]: true}))}
                  className="w-full py-3 bg-[#f5f5f5] hover:bg-[#ebebeb] text-gray-500 text-[13px] font-medium rounded-xl transition-colors"
                >
                  + New Agent
                </button>
             </div>
           </div>

           <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 flex justify-between items-center hover:border-gray-300 transition-colors cursor-pointer shadow-sm shrink-0">
             <div>
               <div className="flex items-center gap-2 mb-1">
                 <h4 className="text-[14px] font-semibold text-gray-900">Tasks</h4>
                 <span className="text-[12px] text-gray-400 flex items-center justify-center border border-gray-200 rounded-full w-4 h-4 text-[10px]">i</span>
               </div>
               <div className="text-[13px] text-gray-500">Current and recent work owned by this department's agents.</div>
             </div>
             <ArrowUp size={16} className="rotate-45 text-gray-300" />
           </div>

           <div className="bg-white border border-gray-200 rounded-2xl p-5 flex justify-between items-center hover:border-gray-300 transition-colors cursor-pointer shadow-sm shrink-0 mb-8">
             <div className="flex items-center gap-2">
               <h4 className="text-[14px] font-semibold text-gray-400">Scratchpad</h4>
               <span className="text-[12px] text-gray-300 flex items-center justify-center border border-gray-100 rounded-full w-4 h-4 text-[10px]">i</span>
             </div>
             <ArrowUp size={16} className="rotate-45 text-gray-200" />
           </div>
        </div>
      ) : (
      <div className="w-[480px] h-[90vh] bg-white border border-gray-100 shadow-2xl flex flex-col z-20 rounded-[24px] my-4 mr-4 p-6 overflow-y-auto no-scrollbar">
         {/* Top header */}
         <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm shrink-0">
           <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-lg shadow-sm">📄</div>
           <div>
             <h3 className="text-[14px] font-semibold text-gray-900 leading-tight">Intelligence Setup</h3>
             <p className="text-[12px] text-gray-500 mt-0.5">Sandbox environment · Zeyro Intelligence</p>
           </div>
         </div>

         {/* Agent Chat bubble */}
         <div className="flex flex-col gap-3 px-1 mb-6 shrink-0">
           <div className="flex items-center gap-2">
             <img src="/o3.png" alt="Agent Icon" className="w-5 h-5 object-contain drop-shadow-sm" />
             <span className="text-[12px] font-semibold text-gray-700">Zeyro Copilot</span>
           </div>
           
           <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
             Analyzing your use case
           </div>

           <p className="text-[13px] text-gray-800 leading-[1.6]">
             Welcome to your Zeyro Workspace! Your intelligence sandbox is fully configured. What would you like to explore next?
           </p>
         </div>

          {/* Agent Pipeline Overview */}
          <div className="flex flex-col gap-2 mt-4 shrink-0">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Agent Pipeline Overview</h4>
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white text-[11px] leading-normal">
              <div className="grid grid-cols-3 bg-gray-50 px-3 py-2 font-bold text-gray-500 border-b border-gray-200 uppercase tracking-wider text-[8px]">
                <div>Pipeline Stage</div>
                <div>Dashboard Section</div>
                <div>Data Integration</div>
              </div>
              <div className="grid grid-cols-3 px-3 py-2.5 border-b border-gray-100 items-start gap-1">
                <div className="font-medium text-gray-800">Integrations &rarr; Sahamati AA, Bureau, Findoc</div>
                <div className="text-gray-500">Input Processing</div>
                <div className="text-gray-500">Findoc Analyser + Transaction Enrichment workspaces</div>
              </div>
              <div className="grid grid-cols-3 px-3 py-2.5 border-b border-gray-100 items-start gap-1">
                <div className="font-medium text-gray-800">Making sense of it</div>
                <div className="text-gray-500">AI Agent Suite &rarr; Credit Sentinel + Underwriting</div>
                <div className="text-gray-500">Output</div>
              </div>
              <div className="grid grid-cols-3 px-3 py-2.5 bg-gray-50/50 items-start gap-1">
                <div className="font-semibold text-gray-700 col-span-3">BFS Score Summary + Portfolio Health + Audit Trail</div>
              </div>
            </div>
          </div>

          {/* Quick Action Tabs */}
          <div className="flex flex-col gap-2 mt-4 shrink-0">
           <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Suggested Next Steps</h4>
           <div className="flex flex-col gap-2">
             <button className="text-left p-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-between group">
               <div>
                 <div className="text-[13px] font-medium text-gray-900 group-hover:text-gray-900">Explore Underwriting Models</div>
                 <div className="text-[11px] text-gray-500 mt-0.5">Test scoring logic with sample data</div>
               </div>
               <ArrowUp size={14} className="text-gray-400 rotate-45 group-hover:text-gray-600 transition-colors" />
             </button>
             <button className="text-left p-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-between group">
               <div>
                 <div className="text-[13px] font-medium text-gray-900 group-hover:text-gray-900">View Cashflow Analytics</div>
                 <div className="text-[11px] text-gray-500 mt-0.5">Analyze transaction patterns and risk</div>
               </div>
               <ArrowUp size={14} className="text-gray-400 rotate-45 group-hover:text-gray-600 transition-colors" />
             </button>
             <button className="text-left p-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-between group">
               <div>
                 <div className="text-[13px] font-medium text-gray-900 group-hover:text-gray-900">Integration Docs</div>
                 <div className="text-[11px] text-gray-500 mt-0.5">Connect via API or SDKs</div>
               </div>
               <ArrowUp size={14} className="text-gray-400 rotate-45 group-hover:text-gray-600 transition-colors" />
             </button>
           </div>
         </div>

         {/* Chat Input */}
         <div className="w-full relative mt-auto pt-6 shrink-0">
           <input
             type="text"
             placeholder="Ask Zeyro Copilot anything..."
             className="w-full border border-gray-200 bg-white rounded-2xl pl-4 pr-14 py-4 text-[13px] text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all shadow-sm"
           />
           <button className="absolute right-3 top-1/2 -translate-y-1/2 mt-3 bg-gray-800 text-white p-2 rounded-xl hover:bg-gray-700 transition-colors">
             <ArrowUp size={16} />
           </button>
         </div>
       </div>
      )}

      {/* Top Center API Error Snackbar */}
      <AnimatePresence>
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-50 px-4 py-2.5 rounded-full shadow-md border border-red-200 pointer-events-none"
          >
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span className="text-sm font-medium text-red-800">
              Backend Disconnected: Displaying offline sandbox UI
            </span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
