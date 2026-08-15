const fs = require('fs');
const filePath = 'd:/zbiz-web/src/app/bfs-dashboard/agents/cashflowagent/CashflowAgentUI.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const startStr = 'export const CashflowInsightsView: React.FC<{ onAskZeyro?: (text: string) => void }> = ({ onAskZeyro }) => {';
const endStr = 'export const CashflowInputView: React.FC = () => {';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.log('Could not find boundaries');
  process.exit(1);
}

const replacement = `export const CashflowInsightsView: React.FC<{ onAskZeyro?: (text: string) => void }> = ({ onAskZeyro }) => {
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [insightType, setInsightType] = useState<'general' | 'msme'>('general');

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionRect(rect);
      setSelectedText(selection.toString().trim());
    } else {
      setSelectionRect(null);
      setSelectedText('');
    }
  };

  const handleAsk = () => {
    if (onAskZeyro && selectedText) {
      onAskZeyro(\`Can you explain this finding?\\n\\n"\${selectedText}"\`);
      window.getSelection()?.removeAllRanges();
      setSelectionRect(null);
      setSelectedText('');
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans relative" onMouseUp={handleMouseUp} onMouseLeave={() => { setSelectionRect(null); setSelectedText(''); }}>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold text-[#111111]">Auto-Generated Insights</h2>
          
          <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            <button 
              onClick={() => setInsightType('general')}
              className={\`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all duration-200 \${insightType === 'general' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
            >
              General Retail
            </button>
            <button 
              onClick={() => setInsightType('msme')}
              className={\`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all duration-200 \${insightType === 'msme' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
            >
              MSME Business
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-2">Deep dive into behavioral patterns detected across the {insightType === 'general' ? 'retail' : 'business'} dataset. Select any text to ask Zeyro for clarification.</p>
      </div>

      <div className="flex flex-col gap-6">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center shrink-0 shadow-md mt-1">
             <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          </div>
          <div className="bg-white border border-[#E6E5DF] rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.015)] text-[13px] text-gray-800 leading-relaxed max-w-2xl rounded-tl-sm relative group hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300">
            <span className="font-semibold block mb-1.5 flex items-center gap-2">
              Zeyro Core
              <span className="text-[9px] font-mono font-normal text-green-500 uppercase tracking-widest bg-green-50 px-1.5 py-0.5 rounded border border-green-100 flex items-center gap-1">
                <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                Analysis Complete
              </span>
            </span>
            I have analyzed the 12-month transaction dataset across the {insightType === 'general' ? 'retail' : 'MSME'} portfolio. I found distinct macro-behavioral patterns that deviate from traditional underwriting assumptions. Here is my detailed report:
          </div>
        </motion.div>

        <motion.div 
          key={insightType} 
          initial="hidden" 
          animate="show" 
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.3 }
            }
          }}
          className="ml-12 flex flex-col gap-12 text-[13px] leading-[1.8] text-gray-700 font-serif group/report"
        >
          {insightType === 'general' ? (
            <>
              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-5">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  Retail Portfolio Snapshot
                </h3>

                <div className="grid grid-cols-3 gap-6 font-sans border-b border-gray-100 pb-8">
                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Total Applicants</span>
                    <div className="flex items-end gap-2 mt-2">
                      <span className="text-3xl font-bold text-gray-900 tracking-tighter">2.4M</span>
                      <span className="text-[10px] text-green-600 font-bold mb-1.5 flex items-center"><svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> +12% YoY</span>
                    </div>
                    <div className="w-full h-1 bg-[#E6E5DF] mt-4 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }} className="h-full bg-gray-900"></motion.div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Cohort Distribution</span>
                    <div className="mt-3 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Salaried</span><span>45%</span></div>
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Pensioner</span><span>32%</span></div>
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400"></span> Gig Worker</span><span>23%</span></div>
                    </div>
                    <div className="flex w-full h-1.5 mt-3 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} transition={{ duration: 0.8, delay: 0.5 }} className="bg-blue-400"></motion.div>
                      <motion.div initial={{ width: 0 }} animate={{ width: '32%' }} transition={{ duration: 0.8, delay: 0.7 }} className="bg-amber-400"></motion.div>
                      <motion.div initial={{ width: 0 }} animate={{ width: '23%' }} transition={{ duration: 0.8, delay: 0.9 }} className="bg-rose-400"></motion.div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Average FOIR</span>
                    <div className="flex items-end gap-2 mt-1">
                      <span className="text-3xl font-bold text-gray-900 tracking-tighter">38.4%</span>
                      <span className="text-[10px] text-amber-600 font-bold mb-1.5 bg-amber-100 px-1.5 py-0.5 rounded">Elevated</span>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-500 font-medium leading-relaxed">
                      The aggregate FOIR has crept up by 400bps compared to last quarter, heavily influenced by gig workers.
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shadow-[0_0_8px_rgba(251,113,133,0.6)]"></span>
                  1. Volatility Swings in Gig Worker Segments
                </h3>

                <div className="grid grid-cols-2 gap-8 items-center border-b border-gray-100 pb-8">
                  <div className="bg-[#FAF9F5] rounded-xl p-4 border border-[#E6E5DF] flex flex-col items-center justify-center h-40 relative group-hover:bg-[#F5F4F0] transition-colors">
                    <span className="absolute top-3 left-4 text-[9px] font-sans font-semibold text-gray-500 uppercase tracking-widest">Monthly Inflows</span>
                    <svg viewBox="0 0 200 80" className="w-full h-full pt-4 overflow-visible">
                      <defs>
                        <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fb7185" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="20" x2="200" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="0" y1="60" x2="200" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                      <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }} d="M 0,60 L 30,55 L 60,70 L 90,20 L 120,65 L 150,15 L 180,68 L 200,60" fill="none" stroke="#fb7185" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.5 }} d="M 0,60 L 30,55 L 60,70 L 90,20 L 120,65 L 150,15 L 180,68 L 200,60 L 200,80 L 0,80 Z" fill="url(#roseGradient)" />
                      <circle cx="90" cy="20" r="4" fill="#fb7185" className="animate-pulse" />
                      <circle cx="150" cy="15" r="4" fill="#fb7185" className="animate-pulse" />
                      <text x="90" y="10" fontSize="9" fill="#fb7185" textAnchor="middle" className="font-sans font-medium">Festive Peak</text>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>
                      Over the past 6 months, we observed a pattern where profiles categorized under the 
                      <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-rose-50"> Gig Worker </span> segment 
                      experience income volatility swings exceeding 40% month-over-month. Inflows peak dramatically around festive seasons but plummet during monsoons.
                    </p>
                    <p>
                      This severe lack of normalization creates a synthetic risk flag in FOIR models. We recommend introducing a 
                      <span className="italic text-gray-900 bg-gray-100 px-1 rounded transition-colors group-hover:bg-rose-50 group-hover:text-rose-700"> buffer-reserve requirement </span> 
                      during underwriting to smooth out these seasonal valleys.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.6)]"></span>
                  2. Hidden Liabilities: BNPL Overload
                </h3>

                <div className="grid grid-cols-2 gap-8 items-center border-b border-gray-100 pb-8">
                  <div className="bg-[#FAF9F5] rounded-xl p-4 border border-[#E6E5DF] flex flex-col items-center justify-center h-40 relative group-hover:bg-[#F5F4F0] transition-colors">
                    <span className="absolute top-3 left-4 text-[9px] font-sans font-semibold text-gray-500 uppercase tracking-widest">EMI Composition</span>
                    <svg viewBox="0 0 200 100" className="w-full h-full pt-4">
                      <motion.rect initial={{ height: 0, y: 90 }} animate={{ height: 20, y: 70 }} transition={{ duration: 0.8, delay: 0.5 }} x="40" y="70" width="40" height="20" fill="#94a3b8" rx="2" />
                      <text x="60" y="98" fontSize="9" fill="#64748b" textAnchor="middle" className="font-sans font-medium">Reported</text>
                      
                      <motion.rect initial={{ height: 0, y: 90 }} animate={{ height: 20, y: 70 }} transition={{ duration: 0.8, delay: 0.5 }} x="120" y="70" width="40" height="20" fill="#94a3b8" rx="2" />
                      <motion.rect initial={{ height: 0, y: 70 }} animate={{ height: 50, y: 20 }} transition={{ duration: 0.8, delay: 1 }} x="120" y="20" width="40" height="50" fill="#2dd4bf" rx="2" />
                      <text x="140" y="98" fontSize="9" fill="#64748b" textAnchor="middle" className="font-sans font-medium">Actual</text>
                      
                      <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.8 }} d="M 120,40 L 95,40" fill="none" stroke="#2dd4bf" strokeWidth="1" strokeDasharray="2 2" />
                      <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} x="90" y="42" fontSize="9" fill="#14b8a6" textAnchor="end" className="font-sans font-bold">+18% BNPL Load</motion.text>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>
                      Our transaction clustering engine detected an unusual density of micro-repayments (sub-₹2,000) occurring between the 1st and 5th of every month. These are primarily directed towards payment gateways associated with leading Buy-Now-Pay-Later providers.
                    </p>
                    <p>
                      Because these are not formally reported to the credit bureau immediately, they form a layer of 
                      <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-teal-50"> Hidden Liability</span>. 
                      For applicants in the ₹4L-₹8L bracket, these hidden EMIs quietly consume up to 18% of their disposable income, rendering their bureau-reported FOIR artificially low.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_rgba(192,132,252,0.6)]"></span>
                  3. Geographic Loan Concentration
                </h3>

                <div className="border-b border-gray-100 pb-8 flex flex-col gap-2">
                  <p>
                    Our geospatial clustering indicates a massive concentration of unsecured personal loans originating from Tier-2 cities in Karnataka and Tamil Nadu over the last 90 days. While origination volumes are up, the 
                    <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-purple-50"> 30-day delinquency rate </span> 
                    in these specific zones has spiked by 1.8%.
                  </p>
                  <p>
                    This anomaly correlates strongly with localized shifts in auto-manufacturing and textile supply chain payouts. We advise tightening the geographic score modifier for unsecured debt in these PIN codes for the next quarter until macro stability resumes.
                  </p>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
                  4. EOM Salary Depletion & Repayment Timing
                </h3>

                <div className="grid grid-cols-2 gap-8 items-center border-b border-gray-100 pb-8">
                  <div className="bg-[#FAF9F5] rounded-xl p-4 border border-[#E6E5DF] flex flex-col items-center justify-center h-40 relative group-hover:bg-[#F5F4F0] transition-colors">
                    <span className="absolute top-3 left-4 text-[9px] font-sans font-semibold text-gray-500 uppercase tracking-widest">Account Balance Curve</span>
                    <svg viewBox="0 0 200 80" className="w-full h-full pt-4 overflow-visible">
                      <line x1="0" y1="60" x2="200" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                      <motion.rect initial={{ width: 0 }} animate={{ width: 60 }} transition={{ duration: 1, delay: 0.5 }} x="0" y="10" height="50" fill="#fef3c7" opacity="0.5" />
                      <text x="30" y="55" fontSize="8" fill="#d97706" textAnchor="middle" className="font-sans font-medium uppercase">Safe Zone</text>
                      <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }} d="M 0,10 C 20,10 40,30 60,40 C 100,50 140,55 200,58" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="0" cy="10" r="3" fill="#f59e0b" />
                      <circle cx="200" cy="58" r="3" fill="#f59e0b" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>
                      Across the salaried applicant pool earning under ₹12L PA, the End-of-Month (EOM) account depletion rate is accelerating. By the 15th of the month, average balances fall below 20% of their incoming salary. 
                    </p>
                    <p>
                      This means that EMIs scheduled after the 15th face a 
                      <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-amber-50"> 3.4x higher probability of bouncing </span> 
                      simply due to timing mismatch rather than true insolvency. We strongly recommend auto-aligning EMI collection mandates strictly between the 1st and 5th of the month for this cohort.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                  5. Utility Bill Autopay Resilience
                </h3>

                <div className="flex flex-col gap-2">
                  <p>
                    While general spending shows high volatility, the data reveals that users with active, unbroken utility autopay mandates (Electricity, Broadband) for over 6 consecutive months have a 
                    <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-emerald-50"> near-zero 90+ DPD default rate </span> 
                    on subsequent personal loans.
                  </p>
                  <p>
                    This recurring utility compliance acts as an incredibly strong proxy for financial discipline. The ML engine has automatically updated the feature weights, granting a +12 point score bump to applicants exhibiting this behavior.
                  </p>
                </div>
              </motion.section>
            </>
          ) : (
            <>
              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-5">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  MSME Business Snapshot
                </h3>

                <div className="grid grid-cols-3 gap-6 font-sans border-b border-gray-100 pb-8">
                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Total Entities</span>
                    <div className="flex items-end gap-2 mt-2">
                      <span className="text-3xl font-bold text-gray-900 tracking-tighter">84,210</span>
                      <span className="text-[10px] text-green-600 font-bold mb-1.5 flex items-center"><svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> +4% QoQ</span>
                    </div>
                    <div className="w-full h-1 bg-[#E6E5DF] mt-4 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }} className="h-full bg-gray-900"></motion.div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Sector Distribution</span>
                    <div className="mt-3 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Manufacturing</span><span>40%</span></div>
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Services</span><span>35%</span></div>
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-500"></span> Retail</span><span>25%</span></div>
                    </div>
                    <div className="flex w-full h-1.5 mt-3 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '40%' }} transition={{ duration: 0.8, delay: 0.5 }} className="bg-indigo-500"></motion.div>
                      <motion.div initial={{ width: 0 }} animate={{ width: '35%' }} transition={{ duration: 0.8, delay: 0.7 }} className="bg-cyan-500"></motion.div>
                      <motion.div initial={{ width: 0 }} animate={{ width: '25%' }} transition={{ duration: 0.8, delay: 0.9 }} className="bg-pink-500"></motion.div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Average DSCR</span>
                    <div className="flex items-end gap-2 mt-1">
                      <span className="text-3xl font-bold text-gray-900 tracking-tighter">1.4x</span>
                      <span className="text-[10px] text-green-600 font-bold mb-1.5 bg-green-100 px-1.5 py-0.5 rounded">Healthy</span>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-500 font-medium leading-relaxed">
                      Debt Service Coverage Ratio remains robust above 1.2x industry standard, though inventory turnover cycles are slightly elongating.
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.6)]"></span>
                  1. Entity Resolution in B2B Supply Chains
                </h3>

                <div className="grid grid-cols-2 gap-8 items-center border-b border-gray-100 pb-8">
                  <div className="bg-[#FAF9F5] rounded-xl p-4 border border-[#E6E5DF] flex flex-col items-center justify-center h-40 relative group-hover:bg-[#F5F4F0] transition-colors">
                    <span className="absolute top-3 left-4 text-[9px] font-sans font-semibold text-gray-500 uppercase tracking-widest">Network Concentration</span>
                    <svg viewBox="0 0 200 100" className="w-full h-full pt-2 overflow-visible">
                      <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} cx="100" cy="50" r="16" fill="#818cf8" />
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                        const angle = (i * Math.PI * 2) / 8;
                        const x = 100 + Math.cos(angle) * 45;
                        const y = 50 + Math.sin(angle) * 35;
                        return (
                          <g key={i}>
                            <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }} x1="100" y1="50" x2={x} y2={y} stroke="#c7d2fe" strokeWidth="1.5" />
                            <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + i * 0.1, type: 'spring' }} cx={x} cy={y} r="4" fill="#a5b4fc" />
                          </g>
                        );
                      })}
                      <motion.circle initial={{ scale: 1, opacity: 0.5 }} animate={{ scale: 2, opacity: 0 }} transition={{ repeat: Infinity, duration: 2 }} cx="100" cy="50" r="16" fill="#818cf8" />
                      <text x="100" y="53" fontSize="10" fill="white" textAnchor="middle" className="font-sans font-bold">62%</text>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>
                      By cross-referencing ledger entries from Tally ERP feeds with Sahamati AA bank statements for our MSME cohorts, we discovered that 
                      <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-indigo-50"> 62% of Tier-3 manufacturers </span> 
                      rely heavily on just three primary raw material suppliers.
                    </p>
                    <p>
                      This vendor concentration poses a systemic supply chain risk. The 
                      <span className="italic text-gray-900 bg-gray-100 px-1 rounded transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-700"> GST Reconciliation Engine </span> 
                      has been configured to flag early warning signals if these key nodes exhibit delayed tax filings.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                  2. GST vs Bank Statement Revenue Discrepancies
                </h3>

                <div className="border-b border-gray-100 pb-8 flex flex-col gap-2">
                  <p>
                    Our cross-verification pipeline identified that 18% of MSMEs in the retail sector are reporting 
                    <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-red-50"> 20-30% lower revenue on GST returns </span> 
                    compared to the cash inflows actively hitting their current accounts.
                  </p>
                  <p>
                    While this artificially lowers their formal eligibility in traditional models, the ML pipeline recognizes the actual cashflow strength. We recommend triggering an automated "Cashflow Surrogate" override to approve credit limits based on actual bank deposits rather than purely reported GST turnover.
                  </p>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span>
                  3. Elongating Inventory Turnover Cycles
                </h3>

                <div className="grid grid-cols-2 gap-8 items-center border-b border-gray-100 pb-8">
                  <div className="bg-[#FAF9F5] rounded-xl p-4 border border-[#E6E5DF] flex flex-col items-center justify-center h-40 relative group-hover:bg-[#F5F4F0] transition-colors">
                    <span className="absolute top-3 left-4 text-[9px] font-sans font-semibold text-gray-500 uppercase tracking-widest">Days Sales Outstanding</span>
                    <svg viewBox="0 0 200 80" className="w-full h-full pt-4 overflow-visible">
                      <line x1="0" y1="60" x2="200" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                      
                      <motion.rect initial={{ height: 0, y: 60 }} animate={{ height: 20, y: 40 }} transition={{ duration: 0.8, delay: 0.5 }} x="20" y="40" width="20" height="20" fill="#67e8f9" rx="2" />
                      <motion.rect initial={{ height: 0, y: 60 }} animate={{ height: 25, y: 35 }} transition={{ duration: 0.8, delay: 0.6 }} x="70" y="35" width="20" height="25" fill="#22d3ee" rx="2" />
                      <motion.rect initial={{ height: 0, y: 60 }} animate={{ height: 35, y: 25 }} transition={{ duration: 0.8, delay: 0.7 }} x="120" y="25" width="20" height="35" fill="#06b6d4" rx="2" />
                      <motion.rect initial={{ height: 0, y: 60 }} animate={{ height: 50, y: 10 }} transition={{ duration: 0.8, delay: 0.8 }} x="170" y="10" width="20" height="50" fill="#0891b2" rx="2" />
                      
                      <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.2, ease: "easeOut" }} d="M 30,35 L 80,30 L 130,20 L 180,5" fill="none" stroke="#164e63" strokeWidth="2" strokeDasharray="4 4" />
                      
                      <text x="30" y="75" fontSize="8" fill="#94a3b8" textAnchor="middle">Q1</text>
                      <text x="80" y="75" fontSize="8" fill="#94a3b8" textAnchor="middle">Q2</text>
                      <text x="130" y="75" fontSize="8" fill="#94a3b8" textAnchor="middle">Q3</text>
                      <text x="180" y="75" fontSize="8" fill="#94a3b8" textAnchor="middle">Q4</text>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>
                      Analysis of recurring B2B invoice clearing times shows that the average Days Sales Outstanding (DSO) for our manufacturing cohort has increased from 
                      <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-cyan-50"> 45 days to 72 days </span> 
                      over the past four quarters.
                    </p>
                    <p>
                      This creates severe short-term working capital stress, even for highly profitable businesses. We recommend proactively offering targeted Invoice Discounting lines to MSMEs hitting the 60-day threshold before they request formal restructuring.
                    </p>
                  </div>
                </div>
              </motion.section>
            </>
          )}
        </motion.div>
      </div>

      {/* Floating Ask Zeyro Tooltip */}
      <AnimatePresence>
        {selectionRect && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed z-50 pointer-events-auto"
            style={{ 
              top: selectionRect.top - 45, 
              left: selectionRect.left + (selectionRect.width / 2) - 60 
            }}
          >
            <button
              onClick={handleAsk}
              className="bg-gray-900 text-white font-sans text-[11px] font-semibold px-4 py-2 rounded-lg shadow-xl hover:bg-black transition-colors flex items-center gap-2 group border border-gray-700"
            >
              <svg className="w-3.5 h-3.5 text-indigo-400 group-hover:animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              Ask Zeyro
            </button>
            {/* Tooltip Triangle */}
            <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-gray-700"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};\n`;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully patched CashflowInsightsView');
