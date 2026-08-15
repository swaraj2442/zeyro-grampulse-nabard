import React, { useState, useEffect } from 'react';
import { Home, ArrowUp, Loader2 } from 'lucide-react';
import { agentDashboardContent } from './agentDashboardContent';
import { CashflowInputView, CashflowOutputView, CashflowReportView, CashflowDataView, CashflowInsightsView, CashflowPortfolioOverview } from './agents/cashflowagent/CashflowAgentUI';
import { EnrichmentDataView, EnrichmentInputView, EnrichmentOutputView, EnrichmentReportsView, EnrichmentInsightsView } from './agents/transactionenrichment/TransactionEnrichmentAgentUI';

interface AgentWorkspaceViewProps {
  selectedNode: string;
  setSelectedNode: (node: string | null) => void;
  setIsExpanded: (exp: boolean) => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  rightPanelTab: 'copilot' | 'logs';
  setRightPanelTab: (tab: 'copilot' | 'logs') => void;
  chatMessages: any[];
  inputVal: string;
  setInputVal: (val: string) => void;
  handleSendMessage: (overrideText?: string) => void;
  addSystemMessage: (text: string, customElement?: string) => void;
  agentLogs: string[];
  addAgentLog: (text: string) => void;
}

const AgentThoughtsLive: React.FC<{ logs: string[] }> = ({ logs }) => {
  const [steps, setSteps] = useState<{ text: string }[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Parse current session logs
    const sessionLogs = [];
    let foundUpload = false;
    for (let i = logs.length - 1; i >= 0; i--) {
      sessionLogs.unshift(logs[i]);
      if (logs[i].startsWith('FILE_UPLOAD')) {
        foundUpload = true;
        break;
      }
    }
    const currentSession = foundUpload ? sessionLogs : logs;

    const parsedSteps = [];
    let complete = false;
    for (const log of currentSession) {
      if (log.includes('FILE_UPLOAD')) {
        parsedSteps.push({ text: 'Loaded using-superpowers skill' });
      } else if (log.includes('SYNC||')) {
        const parts = log.split('||');
        if (parts.length === 3) {
          parsedSteps.push({ text: parts[2] });
        }
      } else if (log.includes('PIPELINE: Processing complete.')) {
        complete = true;
      }
    }
    
    setSteps(parsedSteps);
    setIsComplete(complete);
    if (complete) {
      setShouldRender(false);
    } else {
      setShouldRender(true);
    }
  }, [logs]);

  if (!shouldRender || steps.length === 0) return null;

  return (
    <div className="flex flex-col w-full max-w-[280px] bg-[#FAF9F5] mb-2">
      <div className="flex items-center gap-2 mb-4 pl-1">
        {isComplete ? (
           <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        ) : (
           <Loader2 size={14} className="animate-spin text-orange-500" />
        )}
        <span className={`text-[12px] font-semibold ${isComplete ? 'text-gray-500' : 'text-gray-400'}`}>
          {isComplete ? 'Complete' : 'Working'}
        </span>
      </div>
      
      <div className="flex flex-col ml-1">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          const isActive = isLast && !isComplete;
          return (
            <div key={i} className="flex gap-4 relative pb-5">
              {/* Vertical line connector */}
              {i < steps.length - 1 && (
                <div className="absolute left-[7px] top-6 bottom-[-4px] w-[1px] bg-gray-200" />
              )}
              
              <div className="flex flex-col items-center mt-0.5 z-10 shrink-0 bg-[#FAF9F5]">
                <svg className={`w-[15px] h-[15px] ${isActive ? 'text-blue-500' : 'text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              
              <div className={`text-[11px] font-medium leading-[1.4] mt-[1px] ${isActive ? 'text-blue-700 font-semibold' : 'text-gray-500'}`}>
                {step.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const AgentWorkspaceView: React.FC<AgentWorkspaceViewProps> = ({
  selectedNode,
  setSelectedNode,
  setIsExpanded,
  activeSection,
  setActiveSection,
  rightPanelTab,
  setRightPanelTab,
  chatMessages,
  inputVal,
  setInputVal,
  handleSendMessage,
  addSystemMessage,
  agentLogs,
  addAgentLog,
}) => {
  const content = agentDashboardContent[selectedNode] || agentDashboardContent['Underwriting'];
  const [referenceText, setReferenceText] = useState<string | null>(null);
  const [globalCashflowProfile, setGlobalCashflowProfile] = useState<string | null>(null);

  const renderMessageText = (text: string, isAgent: boolean) => {
    if (text.startsWith('> "') && text.includes('"\n\n')) {
      const parts = text.split('"\n\n');
      const quote = parts[0].substring(2); // remove '> '
      const body = parts.slice(1).join('"\n\n');
      return (
        <div className="flex flex-col gap-2">
          <div className={`pl-2.5 border-l-2 text-[11px] italic opacity-80 ${isAgent ? 'border-gray-300' : 'border-gray-500'}`}>
            {quote}"
          </div>
          <div className="whitespace-pre-wrap">{body}</div>
        </div>
      );
    }
    return <div className="whitespace-pre-wrap">{text}</div>;
  };

  const renderActiveTabContent = () => {
    if (activeSection === 'DATA') {
      const data = content.DATA;
      if (data.customElement === 'cashflow_data') {
        return <CashflowDataView 
          data={data} 
          selectedNode={selectedNode} 
          initialSelectedId={globalCashflowProfile}
          onProfileSelect={(id) => setGlobalCashflowProfile(id)}
          onNavigate={(tab, id) => {
            setGlobalCashflowProfile(id);
            setActiveSection(tab);
          }} 
        />;
      }
      if (data.customElement === 'transaction_enrichment_data') {
        return <EnrichmentDataView data={data} selectedNode={selectedNode} onNavigateToOutput={() => setActiveSection('OUTPUT')} />;
      }
      return (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-base font-semibold text-[#111111]">{selectedNode} Agent — DATA</h2>
            <p className="text-xs text-gray-400 mt-1 mb-5">{data.description}</p>
          </div>
          <div className="bg-white border border-[#E6E5DF] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <h3 className="text-xs font-semibold text-gray-800 mb-3 uppercase tracking-wider text-[10px]">What Lives Here</h3>
            <ul className="text-xs text-gray-500 space-y-2.5 list-disc pl-4 leading-relaxed">
              {data.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white border border-[#E6E5DF] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] divide-y divide-[#F0EFEA]">
            <div className="p-4 bg-gray-50 border-b border-[#E6E5DF]">
              <span className="text-xs font-semibold text-gray-700">Connected Sources</span>
            </div>
            {data.sources.map((source) => (
              <div key={source.name} className="p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${source.isOk ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                    {source.isOk ? '✓' : '⚠'}
                  </span>
                  <span className="font-medium text-gray-800">{source.name}</span>
                </div>
                <span className={`text-[10px] ${source.isOk ? 'text-gray-400 font-mono' : 'text-amber-600 font-semibold cursor-pointer'}`}>
                  {source.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeSection === 'INPUT') {
      const input = content.INPUT;
      if (input.customElement === 'cashflow_input') {
        return <CashflowInputView />;
      }
      if (input.customElement === 'transaction_enrichment_input') {
        return <EnrichmentInputView />;
      }
      return (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-base font-semibold text-[#111111]">{selectedNode} Agent — INPUT</h2>
            <p className="text-xs text-gray-400 mt-1 mb-5">{input.description}</p>
          </div>
          <div className="bg-white border border-[#E6E5DF] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <h3 className="text-xs font-semibold text-gray-800 mb-3 uppercase tracking-wider text-[10px]">What the Agent Accepts</h3>
            <ul className="text-xs text-gray-500 space-y-2.5 list-disc pl-4 leading-relaxed">
              {input.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Forms based on agent type */}
          {input.formType === 'underwriting' && (
            <div className="bg-white border border-[#E6E5DF] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-4 text-xs">
              <h3 className="font-semibold text-gray-800 border-b pb-2">Application Form</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-gray-600">Application ID</label>
                  <input type="text" disabled placeholder="Auto-generated" className="border border-gray-200 rounded p-2 bg-gray-50 text-gray-400 outline-none font-mono" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-gray-600">Applicant Type</label>
                  <select className="border border-gray-200 rounded p-2 bg-white outline-none">
                    <option>Salaried</option>
                    <option>Self-employed</option>
                    <option>MSME</option>
                    <option>Gig worker</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-gray-600">Loan Amount</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2.5 text-gray-400">₹</span>
                    <input type="text" placeholder="Amount" className="border border-gray-200 rounded pl-6 pr-2 py-2 w-full outline-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-gray-600">Loan Tenure (Months)</label>
                  <input type="text" placeholder="Tenure" className="border border-gray-200 rounded p-2 outline-none" />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="font-semibold text-gray-600">AA Consent Token</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Paste token" className="border border-gray-200 rounded p-2 w-full outline-none font-mono text-[11px]" />
                    <button type="button" className="bg-gray-900 hover:bg-gray-800 text-white px-3 rounded text-[11px] font-medium transition-colors">Request via SMS</button>
                  </div>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="font-semibold text-gray-600">Bureau Auth</label>
                  <button type="button" className="border border-gray-900 text-gray-900 hover:bg-gray-50 py-2 rounded font-medium transition-colors">Trigger Bureau Pull</button>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="font-semibold text-gray-600">Documents</label>
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer transition-colors">
                    <span className="text-[11px] text-gray-400 font-medium">Upload PDF (Bank statement, ITR, Salary slips)</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="font-semibold text-gray-600">Override Threshold</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span>BFS &ge;</span>
                    <input type="number" defaultValue={62} className="border border-gray-200 rounded p-1 w-16 text-center" />
                    <span className="text-gray-400">auto-approve</span>
                    <span className="mx-2">|</span>
                    <span>BFS &le;</span>
                    <input type="number" defaultValue={45} className="border border-gray-200 rounded p-1 w-16 text-center" />
                    <span className="text-gray-400">auto-reject</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {input.formType === 'enrichment' && (
            <div className="bg-white border border-[#E6E5DF] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-4 text-xs">
              <h3 className="font-semibold text-gray-800 border-b pb-2">Input Options</h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center border-b pb-1.5 border-gray-50">
                  <span className="font-semibold text-gray-600">Single account enrichment</span>
                  <div className="flex gap-2">
                    <span className="text-gray-500 mt-1">Account ID:</span>
                    <input type="text" placeholder="ID" className="border border-gray-200 rounded p-1 w-32 outline-none font-mono" />
                  </div>
                </div>
                <div className="flex justify-between items-center border-b pb-1.5 border-gray-50">
                  <span className="font-semibold text-gray-600">Batch enrichment</span>
                  <button className="border border-gray-200 hover:bg-gray-50 rounded px-2.5 py-1 font-medium">Upload CSV or connect feed</button>
                </div>
                <div className="flex justify-between items-center border-b pb-1.5 border-gray-50">
                  <span className="font-semibold text-gray-600">Date range</span>
                  <div className="flex gap-2 items-center text-gray-400">
                    <span>From</span>
                    <input type="date" className="border border-gray-200 rounded p-1 text-gray-700 outline-none" />
                    <span>To</span>
                    <input type="date" className="border border-gray-200 rounded p-1 text-gray-700 outline-none" />
                  </div>
                </div>
                <div className="flex justify-between items-center border-b pb-1.5 border-gray-50">
                  <span className="font-semibold text-gray-600">Custom merchant flag</span>
                  <div className="flex gap-2 items-center text-gray-400">
                    <span>Merchant name:</span>
                    <input type="text" placeholder="Name" className="border border-gray-200 rounded p-1 text-gray-700 outline-none" />
                    <span>&rarr; Category:</span>
                    <input type="text" placeholder="Category" className="border border-gray-200 rounded p-1 text-gray-700 outline-none" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-600">Re-enrich existing batch</span>
                  <div className="flex gap-2">
                    <span className="text-gray-500 mt-1">Batch ID:</span>
                    <input type="text" placeholder="Batch ID" className="border border-gray-200 rounded p-1 w-32 outline-none font-mono" />
                    <button className="bg-gray-900 text-white font-medium hover:bg-gray-800 px-3 py-1 rounded transition-colors">Re-run</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {input.formType === 'findoc' && (
            <div className="bg-white border border-[#E6E5DF] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-4 text-xs">
              <h3 className="font-semibold text-gray-800 border-b pb-2">Upload Document</h3>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-gray-600">Applicant ID</label>
                  <input type="text" placeholder="ID (e.g. USR-9928)" className="border border-gray-200 rounded p-2 outline-none font-mono" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-gray-600">Document Type</label>
                  <select className="border border-gray-200 rounded p-2 bg-white outline-none">
                    <option>Auto-detect ▾</option>
                    <option>Bank Statement</option>
                    <option>ITR</option>
                    <option>GST Filing</option>
                    <option>Salary Slip</option>
                    <option>Form 16</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-gray-600">File</label>
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer transition-colors">
                    <span className="text-[11px] text-gray-400 font-medium">Upload PDF (Max 20MB)</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-gray-600">Password (if protected)</label>
                  <input type="password" placeholder="PDF Password" className="border border-gray-200 rounded p-2 outline-none" />
                </div>
                <div className="flex justify-between items-center border-t pt-3 mt-1">
                  <span className="font-semibold text-gray-600">Re-parse existing</span>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Doc ID" className="border border-gray-200 rounded p-1 w-32 outline-none font-mono" />
                    <button className="bg-gray-900 text-white font-medium hover:bg-gray-800 px-3 py-1 rounded transition-colors">Re-run</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {input.formType === 'cashflow' && (
            <CashflowInputView 
              initialSelectedId={globalCashflowProfile}
              onSimulateProcess={(t, c) => {
                setRightPanelTab('copilot');
                addSystemMessage(t, c);
              }} 
              onAddLog={addAgentLog} 
            />
          )}

          {input.formType === 'device' && (
            <div className="bg-white border border-[#E6E5DF] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-xs flex flex-col gap-3">
              <h3 className="font-semibold text-gray-800 border-b pb-2">Device Security Config</h3>
              <div className="flex justify-between items-center border-b pb-1.5 border-gray-50">
                <span>Biometric Verification Limit</span>
                <input type="text" defaultValue="₹50,000" className="border border-gray-200 rounded p-1 w-24 text-center outline-none font-mono" />
              </div>
              <div className="flex justify-between items-center">
                <span>Geofence Strict Lockout</span>
                <span className="font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Enabled</span>
              </div>
            </div>
          )}

          {input.formType === 'suite' && (
            <div className="bg-white border border-[#E6E5DF] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-xs flex flex-col gap-3">
              <h3 className="font-semibold text-gray-800 border-b pb-2">Suite Concurrency Controls</h3>
              <div className="flex justify-between items-center border-b pb-1.5 border-gray-50">
                <span>Max Concurrency</span>
                <input type="number" defaultValue={100} className="border border-gray-200 rounded p-1 w-20 text-center outline-none font-mono" />
              </div>
              <div className="flex justify-between items-center">
                <span>Pipeline Exec Mode</span>
                <span className="font-mono text-gray-600">Sequential</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeSection === 'OUTPUT') {
      const output = content.OUTPUT;
      if (output.customElement === 'transaction_enrichment_output') {
        return (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-base font-semibold text-[#111111]">{selectedNode} Agent — OUTPUT</h2>
              <p className="text-xs text-gray-400 mt-1 mb-5">{output.description}</p>
            </div>
            <EnrichmentOutputView />
          </div>
        );
      }
      return (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-base font-semibold text-[#111111]">{selectedNode} Agent — OUTPUT</h2>
            <p className="text-xs text-gray-400 mt-1 mb-5">{output.description}</p>
          </div>
          <div className="flex flex-col gap-4 text-xs">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-2">
              <span className="font-semibold text-gray-900">{output.title}</span>
              {output.meta && <span className="text-[10px] text-gray-400 font-mono">{output.meta}</span>}
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-3.5 leading-relaxed">
              {output.metrics.map((row) => (
                <div key={row.label} className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500">{row.label}</span>
                  {row.badge ? (
                    <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${row.badge.type === 'success' ? 'bg-green-50 text-green-700' :
                        row.badge.type === 'warning' ? 'bg-amber-50 text-amber-700' :
                          'bg-gray-50 text-gray-700'
                      }`}>{row.badge.text}</span>
                  ) : (
                    <span className="font-semibold text-gray-800">{row.value}</span>
                  )}
                </div>
              ))}
            </div>

            {output.breakdown && (
              <div className="mt-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-[10px] font-semibold text-gray-700 block mb-2 uppercase tracking-wide">{output.breakdownTitle}</span>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {output.breakdown.map((b) => (
                    <div key={b.label} className="bg-white p-2 rounded border border-gray-100">
                      <div className="font-semibold text-gray-800">{b.value}</div>
                      <div className="text-[9px] text-gray-400 mt-0.5 font-sans leading-tight">{b.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {output.lists && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                {output.lists.map((list) => (
                  <div key={list.title} className="flex flex-col gap-2">
                    <span className={`font-bold text-[10px] uppercase tracking-wide ${list.type === 'success' ? 'text-green-700' : 'text-amber-700'
                      }`}>{list.title}</span>
                    {list.items.map((item) => (
                      <div key={item} className="flex gap-1.5 items-start text-gray-600 leading-normal">
                        <span className={list.type === 'success' ? 'text-green-700' : 'text-amber-700'}>
                          {list.type === 'success' ? '✓' : '⚠'}
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Custom UI Elements */}
            {output.customElement === 'cashflow_output' && (
              <CashflowOutputView 
                initialSelectedId={globalCashflowProfile}
                onProfileSelect={(id) => setGlobalCashflowProfile(id)}
                onAskZeyro={(question: string) => {
                  setRightPanelTab('copilot');
                  setReferenceText(question);
                }}
              />
            )}

            {output.customElement === 'enrichment_distribution' && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-2 text-xs">
                <span className="font-semibold text-gray-700 block mb-3 uppercase tracking-wide text-[10px]">Category Distribution (today)</span>
                <div className="flex flex-col gap-2.5">
                  {[
                    { cat: 'Income credits', share: '34%', detail: '₹2.8Cr total', isFlagged: false },
                    { cat: 'EMI outflows', share: '18%', detail: '₹1.4Cr total', isFlagged: false },
                    { cat: 'Essential spend', share: '21%', detail: 'Rent, utility billing', isFlagged: false },
                    { cat: 'Discretionary spend', share: '14%', detail: 'Entertainment, shopping', isFlagged: false },
                    { cat: 'P2P transfers', share: '8%', detail: '37 flagged', isFlagged: true },
                    { cat: 'Cash withdrawals', share: '3%', detail: '9 flagged', isFlagged: true },
                    { cat: 'Unclassified', share: '2%', detail: '→ manual review queue', isFlagged: true }
                  ].map((row) => (
                    <div key={row.cat} className="flex justify-between items-center">
                      <div className="flex gap-2 items-center">
                        <span className="w-12 text-gray-500 font-semibold">{row.share}</span>
                        <span className="text-gray-800 font-medium">{row.cat}</span>
                      </div>
                      <span className={`font-mono text-[10px] ${row.isFlagged ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>{row.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {output.customElement === 'findoc_mismatch' && (
              <div className="flex flex-col gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-2 mt-1">
                  <span className="font-semibold text-gray-700 block border-b pb-1 uppercase tracking-wide text-[10px]">Extracted Fields</span>
                  {[
                    { label: 'Gross Income', val: '₹8,40,000' },
                    { label: 'Deductions', val: '₹1,80,000' },
                    { label: 'Net Taxable Income', val: '₹6,60,000' },
                    { label: 'Tax Paid', val: '₹44,200' },
                    { label: 'Effective Tax Rate', val: '5.3%' },
                    { label: 'ITR Type', val: 'ITR-3 (Business / Profession)' },
                    { label: 'Filing Date', val: '31 Jul 2024' },
                    { label: 'Assessment Year', val: '2024-25' }
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between">
                      <span className="text-gray-500">{row.label}</span>
                      <span className="font-medium text-gray-800">{row.val}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                  <span className="font-bold text-amber-700 text-[10px] uppercase tracking-wide block mb-2">Cross-Validation vs AA Feed</span>
                  <div className="flex flex-col gap-1.5 text-gray-700 pl-1 leading-normal">
                    <div className="flex justify-between border-b border-amber-100 pb-1.5 text-[11px]">
                      <span>AA-derived annual income</span>
                      <span className="font-semibold">₹6,20,000</span>
                    </div>
                    <div className="flex justify-between border-b border-amber-100 pb-1.5 text-[11px]">
                      <span>ITR declared income</span>
                      <span className="font-semibold">₹8,40,000</span>
                    </div>
                    <div className="flex justify-between pt-1 font-semibold text-amber-900">
                      <div className="flex items-center gap-1.5">
                        <span>⚠</span>
                        <span>Mismatch Flag Raised</span>
                      </div>
                      <span>₹2,20,000 (26%)</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono mt-1">&bull; Mismatch threshold &gt;15% triggers flag</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeSection === 'REPORTS') {
      const reports = content.REPORTS;
      if (reports.customElement === 'transaction_enrichment_report') {
        return (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-base font-semibold text-[#111111]">{selectedNode} Agent — REPORTS</h2>
              <p className="text-xs text-gray-400 mt-1 mb-5">{reports.description}</p>
            </div>
            <div className="flex-1 flex flex-col min-h-0 bg-white border border-[#E6E5DF] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-4">
              <EnrichmentReportsView onAskZeyro={(text) => {
                setRightPanelTab('copilot');
                setTimeout(() => handleSendMessage(text), 100);
              }} />
            </div>
          </div>
        );
      }
      return (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-base font-semibold text-[#111111]">{selectedNode} Agent — REPORTS</h2>
            <p className="text-xs text-gray-400 mt-1 mb-5">{reports.description}</p>
          </div>
          <div className="bg-white border border-[#E6E5DF] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] divide-y divide-[#F0EFEA]">
            {reports.list.map((item) => (
              <div key={item.name} className="p-4 flex flex-col gap-1 text-xs">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-gray-500 leading-normal">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3 text-xs mt-2 border-t pt-4 border-dashed border-gray-300">
            {reports.actions?.map((act) => (
              <button key={act} className={`px-4 py-2 rounded-xl transition-colors font-medium ${act.includes('Download')
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}>{act}</button>
            ))}
          </div>

          {reports.customElement === 'cashflow_report' && (
            <div className="mt-4 pt-4 border-t border-dashed border-gray-300">
              <CashflowReportView 
                initialSelectedId={globalCashflowProfile}
                onProfileSelect={(id) => setGlobalCashflowProfile(id)}
                onAskZeyro={(question: string) => {
                  setRightPanelTab('copilot');
                  setReferenceText(question);
                }}
              />
            </div>
          )}
        </div>
      );
    }

    if (activeSection === 'INSIGHTS') {
      const insights = content.INSIGHTS;
      if (insights.customElement === 'cashflow_insights') {
        return (
          <CashflowInsightsView 
            onAskZeyro={(question: string) => {
              setRightPanelTab('copilot');
              setReferenceText(question);
            }} 
          />
        );
      }
      if (insights.customElement === 'transaction_enrichment_insights') {
        return (
          <EnrichmentInsightsView 
            onAskZeyro={(question: string) => {
              setRightPanelTab('copilot');
              setReferenceText(question);
            }} 
          />
        );
      }
      return (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#111111]">{selectedNode} Agent — INSIGHTS</h2>
            <p className="text-xs text-gray-400 mt-1 mb-5">{insights.description}</p>
          </div>
          {insights.list.map((item, idx) => (
            <div key={idx} className="bg-white border border-[#E6E5DF] rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex gap-3 text-xs leading-relaxed text-gray-700">
              <span className="text-base shrink-0">📊</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      );
    }

    if (activeSection === 'OTHER') {
      const other = content.OTHER;
      return (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-base font-semibold text-[#111111]">{selectedNode} Agent — CONFIGURATION</h2>
            <p className="text-xs text-gray-400 mt-1 mb-5">{other.description}</p>
          </div>
          <div className="bg-white border border-[#E6E5DF] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-xs flex flex-col gap-4">
            {other.sections.map((sect) => (
              <div key={sect.title} className="flex flex-col gap-2">
                <h3 className="font-semibold text-gray-900 border-b pb-1.5 uppercase tracking-wide text-[9px] text-gray-400">{sect.title}</h3>
                {sect.customElement === 'scoring_thresholds' && (
                  <div className="flex flex-col gap-2.5 mt-1">
                    <div className="flex items-center gap-2 mt-1">
                      <span>Auto-approve if BFS &ge;</span>
                      <input type="number" defaultValue={62} className="border border-gray-200 rounded p-1 w-16 text-center outline-none font-mono" />
                      <span className="text-gray-400 font-mono text-[10px]">&larr; adjustable</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Auto-reject if BFS &le;</span>
                      <input type="number" defaultValue={45} className="border border-gray-200 rounded p-1 w-16 text-center outline-none font-mono" />
                      <span className="text-gray-400 font-mono text-[10px]">&larr; adjustable</span>
                    </div>
                    <div className="text-gray-500 font-mono text-[10px] mt-0.5">Grey zone (manual review) 45–62</div>
                  </div>
                )}
                {sect.customElement === 'enrichment_rules' && (
                  <div className="flex gap-3 text-xs mt-1">
                    <button className="border border-gray-200 hover:bg-gray-50 font-medium px-4 py-2 rounded-xl transition-colors font-sans">+ Add rule</button>
                    <button className="border border-gray-200 hover:bg-gray-50 font-medium px-4 py-2 rounded-xl transition-colors font-sans">Category override history</button>
                  </div>
                )}
                {sect.customElement === 'findoc_rules' && (
                  <div className="flex justify-between items-center mt-1 text-xs font-sans">
                    <span>Trigger mismatch warning if difference &gt;</span>
                    <div className="flex gap-1 items-center">
                      <input type="number" defaultValue={15} className="border border-gray-200 rounded p-1 w-12 text-center" />
                      <span>%</span>
                    </div>
                  </div>
                )}
                {Array.isArray(sect.content) && (
                  <div className="flex flex-col gap-2 mt-1">
                    {sect.content.map((c) => (
                      <div key={c.label} className="flex justify-between border-b border-gray-50 pb-1.5">
                        <span>{c.label}</span>
                        <span className="font-mono text-gray-600" dangerouslySetInnerHTML={{ __html: c.value }} />
                      </div>
                    ))}
                  </div>
                )}
                {typeof sect.content === 'string' && sect.content && (
                  <p className="text-gray-500 leading-relaxed mt-1 font-sans">{sect.content}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Sidebar (Left, width 240px) */}
      <div className="w-[240px] bg-white border-r border-[#E6E5DF] flex flex-col shrink-0">
        {/* Home button / Back to canvas */}
        <div className="p-4 border-b border-[#E6E5DF]">
          <button
            onClick={() => {
              setSelectedNode(null);
              setIsExpanded(false);
            }}
            className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors w-full px-2.5 py-1.5 rounded-lg hover:bg-[#F5F4F0]"
          >
            <Home size={14} className="text-gray-400" />
            <span>Back to Canvas</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-6">
          <div>
            <span className="px-3 text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-2">
              AGENT OVERVIEW
            </span>
            <div className="flex flex-col gap-0.5">
              {['DATA', 'INPUT', 'OUTPUT', 'REPORTS', 'INSIGHTS', 'OTHER'].map((name) => {
                const isActive = activeSection === name;
                return (
                  <button
                    key={name}
                    onClick={() => setActiveSection(name)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors w-full ${isActive
                        ? 'bg-[#111111] text-white'
                        : 'text-gray-600 hover:bg-[#F5F4F0] hover:text-gray-900'
                      }`}
                  >
                    <span>{name}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-green-500'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>


      </div>

      {/* Central Workspace Content Area */}
      <div className="flex-1 bg-[#FAF9F5] flex flex-col overflow-hidden">
        {/* Title Header */}
        <div className="h-12 border-b border-[#E6E5DF] bg-white flex items-center px-6 gap-2 shrink-0">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
            {selectedNode} / {activeSection}
          </span>
        </div>

        {/* Scrollable Workspace panel */}
        <div className="flex-1 overflow-y-auto p-8 w-full max-w-3xl mx-auto">
          {selectedNode === 'Cashflow Monitoring' && <CashflowPortfolioOverview />}
          {renderActiveTabContent()}
        </div>
      </div>

      {/* Right: Panel (380px) */}
      <div className="w-[380px] bg-white border-l border-[#E6E5DF] flex flex-col shrink-0">
        {/* Tabs */}
        <div className="flex border-b border-[#E6E5DF] h-12 shrink-0">
          <button
            onClick={() => setRightPanelTab('copilot')}
            className={`flex-1 text-xs font-semibold tracking-tight border-b-2 transition-all ${rightPanelTab === 'copilot'
                ? 'border-black text-[#111111] bg-[#FCFAF5]'
                : 'border-transparent text-gray-400 hover:text-gray-600 bg-white'
              }`}
          >
            Zeyro Copilot
          </button>
          <button
            onClick={() => setRightPanelTab('logs')}
            className={`flex-1 text-xs font-semibold tracking-tight border-b-2 transition-all ${rightPanelTab === 'logs'
                ? 'border-black text-[#111111] bg-[#FCFAF5]'
                : 'border-transparent text-gray-400 hover:text-gray-600 bg-white'
              }`}
          >
            Agent Logs
          </button>
        </div>

        {/* Tab Content */}
        {rightPanelTab === 'copilot' ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#FAF9F5]">
            {/* Messages */}
            <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.isAgent ? 'items-start' : 'items-end'}`}>
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {msg.text && <span className="text-[10px] font-semibold text-gray-700">{msg.sender}</span>}
                    {msg.text && <span className="text-[8px] text-gray-400 font-mono">{msg.timestamp}</span>}
                  </div>
                  {msg.text && (
                    <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed max-w-[280px] border shadow-[0_1px_2px_rgba(0,0,0,0.01)] ${msg.isAgent
                        ? 'bg-white border-[#E6E5DF] rounded-tl-sm text-gray-800'
                        : 'bg-[#111111] text-white border-black rounded-tr-sm'
                      }`}>
                      {renderMessageText(msg.text, msg.isAgent)}
                    </div>
                  )}
                  {msg.customElement === 'agent_thoughts' && (
                    <AgentThoughtsLive logs={agentLogs} />
                  )}
                  {msg.customElement === 'view_output_card' && (
                    <div className="mt-2 border border-gray-200 bg-white shadow-sm rounded-lg p-3 w-full max-w-[280px]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-[10px]">✓</span>
                        </div>
                        <span className="text-[11px] text-gray-800 font-semibold">Ready for Review</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <button onClick={() => { setGlobalCashflowProfile('ACC-5521'); setActiveSection('OUTPUT'); }} className="bg-gray-900 text-white w-full py-1.5 rounded-md text-[10px] font-medium hover:bg-gray-800 transition-colors border border-gray-700">
                          View Output Data
                        </button>
                        <button onClick={() => { setGlobalCashflowProfile('ACC-5521'); setActiveSection('REPORTS'); }} className="bg-white text-gray-700 border border-gray-300 w-full py-1.5 rounded-md text-[10px] font-medium hover:bg-gray-50 transition-colors">
                          View Report
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input bar */}
            <div className="p-4 border-t border-[#E6E5DF] bg-white flex flex-col gap-2">
              {referenceText && (
                <div className="bg-gray-100 rounded-lg p-2.5 flex flex-col gap-1.5 relative border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Referencing</span>
                    <button 
                      onClick={() => setReferenceText(null)}
                      className="text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                  <div className="text-[11px] text-gray-600 font-serif italic truncate opacity-90">"{referenceText}"</div>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (referenceText) {
                    handleSendMessage(`> "${referenceText}"\n\n${inputVal}`);
                    setReferenceText(null);
                  } else {
                    handleSendMessage();
                  }
                }}
                className="relative"
              >
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={`Ask about ${selectedNode} agent...`}
                  className="w-full border border-gray-200 bg-[#F5F4F0] rounded-xl pl-4 pr-12 py-3.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ArrowUp size={12} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-5 overflow-y-auto bg-[#1A1A18] font-mono text-[11px] text-[#A6A295] leading-relaxed flex flex-col gap-1">
            {agentLogs.map((log, i) => {
              if (log.includes('SYNC||')) {
                const parts = log.split('||');
                // parts[0] has timestamp, e.g. "[15:39:00] SYNC"
                const prefix = parts[0].replace('SYNC', '').trim();
                const profText = parts[1];
                return <div key={i}>{prefix} {profText}</div>;
              }
              return <div key={i}>{log}</div>;
            })}
          </div>
        )}
      </div>
    </>
  );
};
