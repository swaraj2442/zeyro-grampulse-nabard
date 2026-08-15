import re

file_path = r'd:\zbiz-web\src\app\bfs-dashboard\agents\transactionenrichment\TransactionEnrichmentAgentUI.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find where EnrichmentInsightsView starts
start_idx = content.find('export const EnrichmentInsightsView: React.FC')
if start_idx == -1:
    print("Could not find EnrichmentInsightsView")
    exit(1)

new_insights_view = '''export const EnrichmentInsightsView: React.FC<{ onAskZeyro?: (text: string) => void }> = ({ onAskZeyro }) => {
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [insightType, setInsightType] = useState<'general' | 'msme'>('general');
  const [timeline, setTimeline] = useState('This Month');
  const { handleContextMenu, renderContextMenu } = useChartContextMenu(onAskZeyro);

  const dynamicData = React.useMemo(() => {
    switch (timeline) {
      case 'Today': return { timeText: "today's intraday", records: "4.2K", accuracy: "97.4%", anomalies: "12", entities: "1,204", msmeAccuracy: "96.1%", riskFlags: "8" };
      case 'This Week': return { timeText: "this week's", records: "45.1K", accuracy: "97.8%", anomalies: "145", entities: "12,450", msmeAccuracy: "96.5%", riskFlags: "92" };
      case 'This Year': return { timeText: "the 12-month", records: "2.4M", accuracy: "98.4%", anomalies: "8,210", entities: "84,210", msmeAccuracy: "97.1%", riskFlags: "4,120" };
      default: return { timeText: timeline === 'This Month' ? "this month's" : 	he , records: "185K", accuracy: "98.1%", anomalies: "410", entities: "24,100", msmeAccuracy: "96.8%", riskFlags: "240" };
    }
  }, [timeline]);

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

  return (
    <div className="flex flex-col gap-6 font-sans relative select-text" onMouseUp={handleMouseUp}>
      {renderContextMenu()}
      
      {/* Header Section */}
      <div className="flex justify-between items-end gap-6 border-b border-gray-100 pb-5 select-none">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-[#111111]">Auto-Generated Insights</h2>
            <p className="text-xs text-gray-400">Deep dive into behavioral patterns detected across the {insightType === 'general' ? 'retail' : 'business'} dataset.</p>
          </div>
          
          <div className="flex bg-gray-100/80 p-1 rounded-lg border border-gray-200/50 w-fit">
            <button 
              onClick={() => setInsightType('general')}
              className={elative px-4 py-1.5 text-[11px] font-semibold rounded-md transition-all duration-200 outline-none whitespace-nowrap }
            >
              {insightType === 'general' && (
                <motion.div layoutId="activeInsightTypeEnrichment" className="absolute inset-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-md border border-gray-200/50" initial={false} transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }} />
              )}
              <span className="relative z-10">General Retail</span>
            </button>
            <button 
              onClick={() => setInsightType('msme')}
              className={elative px-4 py-1.5 text-[11px] font-semibold rounded-md transition-all duration-200 outline-none whitespace-nowrap }
            >
              {insightType === 'msme' && (
                <motion.div layoutId="activeInsightTypeEnrichment" className="absolute inset-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-md border border-gray-200/50" initial={false} transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }} />
              )}
              <span className="relative z-10">MSME Business</span>
            </button>
          </div>
        </div>
        
        <div className="flex shrink-0">
          <DateFilterToolbar selectedFilter={timeline} onSelectFilter={setTimeline} />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center shrink-0 shadow-md mt-1">
             <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          </div>
          <div className="bg-white border border-[#E6E5DF] rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.015)] text-[13px] text-gray-800 leading-relaxed max-w-2xl rounded-tl-sm relative group hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300">
            <span className="font-semibold block mb-1.5 flex items-center gap-2">
              Zeyro Enrichment Intelligence
              <span className="text-[9px] font-mono font-normal text-green-500 uppercase tracking-widest bg-green-50 px-1.5 py-0.5 rounded border border-green-100 flex items-center gap-1">
                <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                Analysis Complete
              </span>
            </span>
            I have analyzed {dynamicData.timeText} dataset across the {insightType === 'general' ? 'retail' : 'MSME'} portfolio. I found distinct behavioral patterns that reveal hidden liabilities and deep merchant dependencies. Here is my detailed report:
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
                  Retail Dataset Snapshot
                </h3>

                <div className="grid grid-cols-3 gap-6 font-sans border-b border-gray-100 pb-8">
                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Total Processed</span>
                    <div className="flex items-end gap-2 mt-2">
                      <span className="text-3xl font-bold text-gray-900 tracking-tighter">{dynamicData.records}</span>
                    </div>
                    <div className="w-full h-1 bg-[#E6E5DF] mt-4 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }} className="h-full bg-gray-900"></motion.div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Anomaly Distribution</span>
                    <div className="mt-3 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Round Tripping</span><span>62%</span></div>
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400"></span> High Velocity</span><span>28%</span></div>
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Misc Risk</span><span>10%</span></div>
                    </div>
                    <div className="flex w-full h-1.5 mt-3 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '62%' }} transition={{ duration: 0.8, delay: 0.5 }} className="bg-amber-400"></motion.div>
                      <motion.div initial={{ width: 0 }} animate={{ width: '28%' }} transition={{ duration: 0.8, delay: 0.7 }} className="bg-rose-400"></motion.div>
                      <motion.div initial={{ width: 0 }} animate={{ width: '10%' }} transition={{ duration: 0.8, delay: 0.9 }} className="bg-blue-400"></motion.div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Model Accuracy</span>
                    <div className="flex items-end gap-2 mt-1">
                      <span className="text-3xl font-bold text-gray-900 tracking-tighter">{dynamicData.accuracy}</span>
                      <span className="text-[10px] text-green-600 font-bold mb-1.5 bg-green-100 px-1.5 py-0.5 rounded">High Confidence</span>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-500 font-medium leading-relaxed">
                      Entity resolution success rate has climbed up to 98% this cycle with the latest merchant DB update.
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                  1. Gen-Z (18-24) vs BNPL Stacking
                </h3>

                <div className="grid grid-cols-2 gap-8 items-center border-b border-gray-100 pb-8">
                  <div className="bg-[#FAF9F5] rounded-xl p-4 border border-[#E6E5DF] flex flex-col items-center justify-center h-40 relative group-hover:bg-[#F5F4F0] transition-colors">
                    <span className="absolute top-3 left-4 text-[9px] font-sans font-semibold text-gray-500 uppercase tracking-widest">Stacking Propensity</span>
                    <svg viewBox="0 0 200 80" className="w-full h-full pt-4 overflow-visible" onContextMenu={handleContextMenu}>
                      <line x1="0" y1="60" x2="200" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                      <motion.rect initial={{ height: 0, y: 60 }} animate={{ height: 45, y: 15 }} transition={{ duration: 0.8, delay: 0.5 }} x="40" y="15" width="30" height="45" fill="#6366f1" rx="2" />
                      <text x="55" y="75" fontSize="8" fill="#64748b" textAnchor="middle" className="font-sans font-medium">Gen Z</text>
                      
                      <motion.rect initial={{ height: 0, y: 60 }} animate={{ height: 25, y: 35 }} transition={{ duration: 0.8, delay: 0.7 }} x="85" y="35" width="30" height="25" fill="#60a5fa" rx="2" />
                      <text x="100" y="75" fontSize="8" fill="#64748b" textAnchor="middle" className="font-sans font-medium">Millennials</text>

                      <motion.rect initial={{ height: 0, y: 60 }} animate={{ height: 10, y: 50 }} transition={{ duration: 0.8, delay: 0.9 }} x="130" y="50" width="30" height="10" fill="#cbd5e1" rx="2" />
                      <text x="145" y="75" fontSize="8" fill="#64748b" textAnchor="middle" className="font-sans font-medium">Gen X</text>
                      
                      <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.5 }} d="M 55,10 L 100,30 L 145,45" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="2 2" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>
                      Our enrichment models parsing UPI recurring mandates have flagged a major trend: The 
                      <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-indigo-50"> Gen-Z cohort (18-24) </span> 
                      in Tier 1 cities exhibits 40% higher BNPL stacking (3+ active short-term loans simultaneously) compared to Millennials.
                    </p>
                    <p>
                      This stacking behavior is rarely captured by traditional credit bureaus in real-time, leaving lenders blind to their actual monthly obligations. We advise capping unsecured exposure for this age group unless a verified salary stream is detected.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]"></span>
                  2. Tier 2 Cities: Q-Commerce Dependency
                </h3>

                <div className="grid grid-cols-2 gap-8 items-center border-b border-gray-100 pb-8">
                  <div className="bg-[#FAF9F5] rounded-xl p-4 border border-[#E6E5DF] flex flex-col items-center justify-center h-40 relative group-hover:bg-[#F5F4F0] transition-colors">
                    <span className="absolute top-3 left-4 text-[9px] font-sans font-semibold text-gray-500 uppercase tracking-widest">Q-Commerce Monopoly</span>
                    <svg viewBox="0 0 100 100" className="w-24 h-24 mt-4" onContextMenu={handleContextMenu}>
                      <motion.circle initial={{ strokeDasharray: "0 100" }} animate={{ strokeDasharray: "68 32" }} transition={{ duration: 1, delay: 0.5 }} cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="20" strokeDashoffset="25" />
                      <motion.circle initial={{ strokeDasharray: "0 100" }} animate={{ strokeDasharray: "32 68" }} transition={{ duration: 1, delay: 0.5 }} cx="50" cy="50" r="40" fill="none" stroke="#a855f7" strokeWidth="20" strokeDashoffset="-43" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>
                      Spatial enrichment data highlights that users in Tier 2 cities (e.g., Surat, Jaipur) rely heavily on single Q-Commerce applications for daily needs. Specifically, 
                      <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-amber-50"> 68% show >80 dependency scores </span> 
                      on either Zepto or Swiggy Instamart, with very little overlap.
                    </p>
                    <p>
                      This deep loyalty provides a prime opportunity for highly targeted, co-branded card offerings or exclusive cash-back rewards rather than generic retail discounts.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                  3. Late Night Spenders & Subscription Churn
                </h3>

                <div className="flex flex-col gap-2">
                  <p>
                    Correlating transaction timestamps with merchant categories reveals that users with the 
                    <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-rose-50"> "Late-Night Spender" </span> 
                    persona (frequent gaming/food txns between 11PM-3AM) have a 3x higher subscription churn rate on core financial products compared to morning transactors.
                  </p>
                  <p>
                    This cohort typically demonstrates highly impulsive spending. We recommend switching their EMI deduction cycles to the 1st of the month strictly, leaving no room for discretionary depletion.
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
                      <span className="text-3xl font-bold text-gray-900 tracking-tighter">{dynamicData.entities}</span>
                    </div>
                    <div className="w-full h-1 bg-[#E6E5DF] mt-4 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }} className="h-full bg-gray-900"></motion.div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Risk Flags</span>
                    <div className="mt-3 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Over-Leveraged</span><span>40%</span></div>
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> GST Mismatch</span><span>35%</span></div>
                      <div className="flex justify-between items-center text-[10px] font-semibold text-gray-700"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-500"></span> Churn Risk</span><span>25%</span></div>
                    </div>
                    <div className="flex w-full h-1.5 mt-3 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: '40%' }} transition={{ duration: 0.8, delay: 0.5 }} className="bg-indigo-500"></motion.div>
                      <motion.div initial={{ width: 0 }} animate={{ width: '35%' }} transition={{ duration: 0.8, delay: 0.7 }} className="bg-cyan-500"></motion.div>
                      <motion.div initial={{ width: 0 }} animate={{ width: '25%' }} transition={{ duration: 0.8, delay: 0.9 }} className="bg-pink-500"></motion.div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Model Accuracy</span>
                    <div className="flex items-end gap-2 mt-1">
                      <span className="text-3xl font-bold text-gray-900 tracking-tighter">{dynamicData.msmeAccuracy}</span>
                      <span className="text-[10px] text-green-600 font-bold mb-1.5 bg-green-100 px-1.5 py-0.5 rounded">Optimal</span>
                    </div>
                    <div className="mt-2 text-[10px] text-gray-500 font-medium leading-relaxed">
                      B2B transaction resolution is performing optimally thanks to the latest Tally ERP contextual sync.
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
                  1. Business Age vs Working Capital Stress
                </h3>

                <div className="grid grid-cols-2 gap-8 items-center border-b border-gray-100 pb-8">
                  <div className="bg-[#FAF9F5] rounded-xl p-4 border border-[#E6E5DF] flex flex-col items-center justify-center h-40 relative group-hover:bg-[#F5F4F0] transition-colors">
                    <span className="absolute top-3 left-4 text-[9px] font-sans font-semibold text-gray-500 uppercase tracking-widest">Credit Line Overlap</span>
                    <svg viewBox="0 0 200 80" className="w-full h-full pt-4 overflow-visible" onContextMenu={handleContextMenu}>
                      <line x1="0" y1="60" x2="200" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                      
                      <motion.rect initial={{ height: 0, y: 60 }} animate={{ height: 50, y: 10 }} transition={{ duration: 0.8, delay: 0.5 }} x="40" y="10" width="30" height="50" fill="#f59e0b" rx="2" />
                      <text x="55" y="75" fontSize="8" fill="#64748b" textAnchor="middle">{"<3 Yrs"}</text>
                      
                      <motion.rect initial={{ height: 0, y: 60 }} animate={{ height: 25, y: 35 }} transition={{ duration: 0.8, delay: 0.7 }} x="85" y="35" width="30" height="25" fill="#60a5fa" rx="2" />
                      <text x="100" y="75" fontSize="8" fill="#64748b" textAnchor="middle">{"3-7 Yrs"}</text>

                      <motion.rect initial={{ height: 0, y: 60 }} animate={{ height: 10, y: 50 }} transition={{ duration: 0.8, delay: 0.9 }} x="130" y="50" width="30" height="10" fill="#22c55e" rx="2" />
                      <text x="145" y="75" fontSize="8" fill="#64748b" textAnchor="middle">{"7+ Yrs"}</text>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>
                      Young MSMEs (under 3 years of operation) demonstrate a 
                      <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-amber-50"> 55% higher frequency </span> 
                      of tapping into overlapping short-term credit lines compared to established businesses.
                    </p>
                    <p>
                      This signals chronic working capital stress. We recommend introducing strict caps on concurrent OD facilities for businesses aged under 3 years to curb systemic default risks.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } } }} className="flex flex-col gap-4 group">
                <h3 className="font-sans font-bold text-gray-900 text-sm tracking-tight m-0 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span>
                  2. Invoice Discounting Affinity
                </h3>

                <div className="border-b border-gray-100 pb-8 flex flex-col gap-2">
                  <p>
                    Behavioral tagging shows that businesses receiving consistent B2B receipts on Day 1-5 of the month are 
                    <span className="font-semibold text-gray-900 bg-gray-50 px-1 rounded transition-colors group-hover:bg-cyan-50"> 4x more likely to convert </span> 
                    on invoice discounting nudges presented in the third week of the month.
                  </p>
                  <p>
                    By timing these offerings accurately using our enrichment signals, the portfolio can boost cross-sell conversion dramatically without increasing marketing spend.
                  </p>
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
            style={{ top: selectionRect.bottom + 10, left: selectionRect.left + (selectionRect.width / 2) - 100 }}
          >
            <div className="bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 py-1 px-1 flex flex-col min-w-[200px]">
              <div className="px-3 py-1.5 border-b border-gray-800 text-[10px] font-medium text-gray-400">
                Selected: <span className="text-gray-200 truncate max-w-[150px] inline-block align-bottom">{selectedText}</span>
              </div>
              <button 
                onClick={() => {
                  if (onAskZeyro) {
                    onAskZeyro(Explain the significance of this insight detail: "");
                    setSelectionRect(null);
                    window.getSelection()?.removeAllRanges();
                  }
                }}
                className="text-left px-3 py-2 text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 rounded-md"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Ask Zeyro
              </button>
            </div>
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45 border-l border-t border-gray-700"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
'''

content = content[:start_idx] + new_insights_view

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated EnrichmentInsightsView")
