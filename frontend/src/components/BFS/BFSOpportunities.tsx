"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingDown } from 'lucide-react';

const liveUsersData = [
  { initials: 'PS', name: 'Priya Sharma', loc: 'Mumbai, MH', score: 795 },
  { initials: 'AK', name: 'Arjun Kumar', loc: 'Bengaluru, KA', score: 812 },
  { initials: 'RD', name: 'Rahul Desai', loc: 'Pune, MH', score: 715 },
  { initials: 'NM', name: 'Neha Menon', loc: 'Chennai, TN', score: 760 },
  { initials: 'VT', name: 'Vikram Thakur', loc: 'Delhi, DL', score: 742 },
  { initials: 'AG', name: 'Ananya Gupta', loc: 'Hyderabad, TS', score: 680 },
];

const getScoreColor = (score: number) => {
  if (score >= 780) return 'bg-emerald-50 text-emerald-600';
  if (score >= 740) return 'bg-green-50 text-green-600';
  if (score >= 700) return 'bg-blue-50 text-blue-600';
  return 'bg-amber-50 text-amber-600';
};

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

function MobileSwipeStack({ cards }: { cards: React.ReactNode[] }) {
  const [cardsOrder, setCardsOrder] = useState([...Array(cards.length).keys()]);
  const [exitX, setExitX] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDragEnd = (e: any, info: any) => {
    if (isAnimating) return;
    const swipeThreshold = 120; 
    if (Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > 800) {
      setIsAnimating(true);
      const direction = info.offset.x > 0 ? 1 : -1;
      setExitX(window.innerWidth * direction);
      
      setTimeout(() => {
        setCardsOrder(prev => [...prev.slice(1), prev[0]]);
        setExitX(0);
        setIsAnimating(false);
      }, 300);
    }
  };

  return (
    <div className="relative w-full h-[520px] flex justify-center items-start pt-4 overflow-hidden mb-8">
      {[...cardsOrder].reverse().map((cardIndex, reversedIndex) => {
        const isTop = reversedIndex === cards.length - 1;
        const isBottom = reversedIndex === 0;
        const distance = cards.length - 1 - reversedIndex;
        
        const scale = isTop ? 1 : 1 - (distance * 0.05);
        const y = isTop ? 0 : distance * 20;
        const zIndex = reversedIndex;
        const opacity = distance > 2 ? 0 : 1;
        const currentX = isTop && isAnimating ? exitX : 0;

        return (
          <motion.div
            key={cardIndex}
            style={{ zIndex }}
            initial={false}
            animate={{ scale, y, x: currentX, opacity }}
            transition={
              isBottom 
                ? { duration: 0 } 
                : { type: 'spring', stiffness: 300, damping: 25, x: { duration: 0.3 } }
            }
            className={`absolute top-4 flex-none w-[320px] flex flex-col bg-[#e8eae8] rounded-[24px] p-6 overflow-hidden h-[460px] shadow-lg border border-gray-200 ${isTop ? 'cursor-grab active:cursor-grabbing' : ''}`}
            drag={isTop && !isAnimating ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={isTop ? handleDragEnd : undefined}
          >
             {cards[cardIndex]}
          </motion.div>
        );
      })}
    </div>
  );
}

function LiveUsersWidget() {
  const [users, setUsers] = useState(liveUsersData);

  useEffect(() => {
    const interval = setInterval(() => {
      setUsers(prev => {
        const next = [...prev];
        const first = next.shift();
        if (first) next.push(first);
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute -right-4 -bottom-8 w-[200px] bg-[#fafafa] rounded-2xl shadow-lg border border-gray-200 z-10">
      <div className="p-2 border-b border-gray-200 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
        <span className="text-[10px] font-medium text-gray-800">Live users</span>
      </div>
      <div className="flex flex-col p-1 overflow-hidden relative" style={{ minHeight: '80px', overflowAnchor: 'none' }}>
        <AnimatePresence>
          {users.slice(0, 2).map((user, i) => (
            <motion.div 
              key={user.name}
              initial={{ opacity: 0, y: i === 0 ? 14 : 50, scale: 0.95 }}
              animate={{ opacity: 1, y: i === 0 ? 4 : 40, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="absolute top-0 left-1 flex items-center justify-between p-1.5 rounded-lg border-b border-gray-100"
              style={{ width: 'calc(100% - 8px)' }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full border border-gray-200 bg-white flex items-center justify-center text-[8px] font-medium text-gray-500">{user.initials}</div>
                <div className="text-[9px] font-medium text-gray-800">{user.name}</div>
              </div>
              <div className={`${getScoreColor(user.score)} text-[7px] font-bold px-1.5 py-0.5 rounded flex items-center`}>{user.score}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function BFSOpportunities() {
  const useCaseCards = [
    (
      <React.Fragment key="c1">
        <div className="flex items-center gap-2 mb-6">
           <div className="w-2 h-2 rounded-sm bg-blue-400"></div>
           <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">01 Data Enrichment</span>
        </div>
        <div className="w-full h-[260px] relative mb-8 rounded-2xl flex justify-center items-center">
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[450px] scale-[0.55] sm:scale-[0.65] md:scale-[0.6] lg:scale-[0.8]">
              <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="w-full h-8 bg-[#f9f9f9] border-b border-gray-100 flex items-center px-3 gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>
                <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-50">
                  <div>
                    <div className="text-[10px] text-gray-500 mb-1">Personal Loans</div>
                    <div className="text-xl font-medium text-gray-800 mb-2">234</div>
                    <div className="flex gap-0.5 mb-1">
                      {[...Array(8)].map((_, i) => <div key={i} className="h-1 w-1 bg-green-500"></div>)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 mb-1">Credit Cards</div>
                    <div className="text-xl font-medium text-gray-800 mb-2">1,291</div>
                    <div className="flex gap-0.5 mb-1">
                      {[...Array(6)].map((_, i) => <div key={i} className="h-1 w-1 bg-cyan-500"></div>)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 mb-1">BNPL Credit</div>
                    <div className="text-xl font-medium text-gray-800 mb-2">9,182</div>
                    <div className="flex gap-0.5 mb-1">
                      {[...Array(12)].map((_, i) => <div key={i} className="h-1 w-1 bg-orange-500"></div>)}
                    </div>
                  </div>
                </div>
                <div className="p-4 pb-6">
                  <div className="text-[10px] text-gray-500 mb-3">Time Series</div>
                  <div className="relative h-24 w-full">
                    <div className="absolute left-6 right-0 top-0 bottom-6 border-b border-l border-gray-100">
                      <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M 0 70 L 15 60 L 30 60 L 45 45 L 60 45 L 75 55 L 90 55 L 100 45" fill="none" stroke="#22c55e" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        <path d="M 0 85 L 15 75 L 30 75 L 45 75 L 60 70 L 75 85 L 90 85 L 100 75" fill="none" stroke="#06b6d4" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                      </svg>
                    </div>
                    <div className="absolute left-6 right-0 bottom-0 flex justify-between text-[8px] text-gray-400 pt-1">
                      <span>0s</span><span>1s</span><span>2s</span>
                    </div>
                  </div>
                </div>
              </div>
              <LiveUsersWidget />
          </div>
        </div>
        <h3 className="text-[17px] font-semibold text-gray-900 mb-2 leading-tight">Behavioral Data Enrichment</h3>
        <p className="text-[13px] text-gray-500 leading-relaxed flex-1">
          Zeyro enriches raw transactional and behavioral data to build comprehensive borrower profiles. This deep data enrichment connects directly to credit lending, empowering institutions to make smarter, highly accurate risk decisions.
        </p>
      </React.Fragment>
    ),
    (
      <React.Fragment key="c2">
        <div className="flex items-center gap-2 mb-6">
           <div className="w-2 h-2 rounded-sm bg-emerald-400"></div>
           <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">02 Risk Profiling</span>
        </div>
        <div className="w-full h-[260px] relative mb-8 rounded-2xl flex justify-center items-center">
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[450px] scale-[0.55] sm:scale-[0.65] md:scale-[0.6] lg:scale-[0.8]">
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="w-full h-8 bg-[#f9f9f9] border-b border-gray-100 flex items-center px-3 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-50 pb-3">
                <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                  <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <span className="text-[11px] font-medium text-gray-800">Application #8492</span>
              </div>
              <div className="space-y-3 w-[60%]">
                <div>
                  <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest">Applicant Name</span>
                  <span className="font-semibold text-gray-900 text-[11px]">Shreya Sharma</span>
                </div>
                <div>
                  <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest">Loan Product</span>
                  <span className="font-semibold text-gray-900 text-[11px]">Buy Now Pay Later</span>
                </div>
                <div>
                  <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest">Requested Limit</span>
                  <span className="font-semibold text-gray-900 text-[11px]">₹75,000</span>
                </div>
                <div className="h-[60px]"></div>
              </div>
              </div>
            </div>
            <div className="absolute right-8 top-12 w-[220px] bg-white rounded-2xl shadow-lg border border-gray-200 z-20">
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-800">Risk Assessment Report</span>
              </div>
              <div className="p-4">
                <div className="text-[8px] text-gray-400 uppercase tracking-widest font-bold mb-1">Approval Confidence</div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-light text-gray-900 tracking-tighter">94%</span>
                  <div className="bg-emerald-50 text-emerald-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full mb-1">Low Risk</div>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-green-400 w-[94%]"></div>
                </div>
                <button className="w-full py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[9px] font-semibold text-gray-800">
                  Auto-Approve Profile
                </button>
              </div>
            </div>
          </div>
        </div>
        <h3 className="text-[17px] font-semibold text-gray-900 mb-2 leading-tight">Risk Profiling</h3>
        <p className="text-[13px] text-gray-500 leading-relaxed flex-1">
          Approve more borrowers instantly for BNPL, credit line, cards and term loans with higher confidence.
        </p>
      </React.Fragment>
    ),
    (
      <React.Fragment key="c3">
        <div className="flex items-center gap-2 mb-6">
           <div className="w-2 h-2 rounded-sm bg-purple-400"></div>
           <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">03 New-To-Credit Lending</span>
        </div>
        <div className="w-full h-[260px] relative mb-8 rounded-2xl flex justify-center items-center">
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[450px] scale-[0.55] sm:scale-[0.65] md:scale-[0.6] lg:scale-[0.8]">
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[220px] overflow-hidden">
              <div className="w-full h-8 bg-[#f9f9f9] border-b border-gray-100 flex items-center px-3 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              </div>
              <div className="p-4">
                <div className="p-2 border-b border-gray-50 flex items-center gap-2">
                <div className="text-[9px] font-bold text-gray-400 border border-gray-200 bg-gray-50 px-2 py-1 rounded uppercase tracking-wider">Alt Data Sync</div>
              </div>
              <div className="mt-3 w-[50%] ml-auto flex flex-col gap-2">
                <div className="flex items-center justify-between py-1">
                  <span className="text-[10px] font-medium text-gray-800">Transactions</span>
                  <span className="text-[7px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Synced</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[10px] font-medium text-gray-800">Behavioral</span>
                  <span className="text-[7px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Synced</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[10px] font-medium text-gray-800">Subscriptions</span>
                  <span className="text-[7px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Synced</span>
                </div>
              </div>
              </div>
            </div>
            <div className="absolute left-6 top-8 w-[220px] bg-white rounded-2xl shadow-lg border border-gray-200 z-20">
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-800">NTC Analytics Score</span>
                <div className="text-[7px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">Thin-File</div>
              </div>
              <div className="p-4 flex flex-col items-center">
                <div className="relative w-16 h-16 flex items-center justify-center mb-3">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray="282.7" strokeDashoffset="56.5" strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-light text-gray-900 tracking-tight">785</span>
                  </div>
                </div>
                <div className="w-full space-y-1.5 mb-3">
                  <div className="flex justify-between text-[9px] p-1.5 bg-gray-50 rounded border border-gray-100">
                    <span className="text-gray-600">Utility Payments</span>
                    <span className="text-emerald-600 font-semibold">Consistent</span>
                  </div>
                  <div className="flex justify-between text-[9px] p-1.5 bg-gray-50 rounded border border-gray-100">
                    <span className="text-gray-600">Identity Match</span>
                    <span className="text-emerald-600 font-semibold">Verified</span>
                  </div>
                </div>
                <button className="w-full py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-[9px] font-semibold text-blue-700">
                  Approve Credit Line
                </button>
              </div>
            </div>
          </div>
        </div>
        <h3 className="text-[17px] font-semibold text-gray-900 mb-2 leading-tight">New-To-Credit Lending</h3>
        <p className="text-[13px] text-gray-500 leading-relaxed flex-1">
          Lend to thin-file or new-to-credit borrowers with 360-degree analytics and boost portfolio size.
        </p>
      </React.Fragment>
    ),
    (
      <React.Fragment key="c4">
        <div className="flex items-center gap-2 mb-6">
           <div className="w-2 h-2 rounded-sm bg-rose-500"></div>
           <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">04 Fraud Detection</span>
        </div>
        <div className="w-full h-[260px] relative mb-8 rounded-2xl flex justify-center items-center">
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[350px] scale-[0.75] md:scale-[0.85]">
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-4 bg-rose-50 p-2 rounded-lg w-fit border border-rose-100">
                <AlertTriangle size={14} className="text-rose-600" />
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wide">Applicant red flags</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[12px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                  <span className="text-gray-500 font-medium">Balance trend:</span>
                  <span className="text-gray-900 font-semibold">Negative</span>
                </div>
                <div className="flex items-center gap-2 text-[12px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                  <span className="text-gray-500 font-medium">Recent paychecks:</span>
                  <span className="text-gray-900 font-semibold">None</span>
                </div>
                <div className="flex items-center gap-2 text-[12px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                  <span className="text-gray-500 font-medium">Loan stacking:</span>
                  <span className="text-rose-600 font-bold tracking-tight">Detected</span>
                </div>
              </div>
            </div>
            <div className="absolute top-36 left-4 right-4 bg-[#fafafa] rounded-2xl shadow-lg border border-gray-200 p-4 z-20">
              <div className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mb-3">Loan Application</div>
              <div className="space-y-1.5 text-[11px]">
                <div className="text-gray-800 font-medium">Personal Loan</div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-semibold text-gray-900">₹4,50,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Terms:</span>
                  <span className="font-semibold text-gray-900">60 months</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <h3 className="text-[17px] font-semibold text-gray-900 mb-2 leading-tight">Identify first-party fraud</h3>
        <p className="text-[13px] text-gray-500 leading-relaxed flex-1">
          Detect abuse, loan stacking, and other irregularities in real-time before extending credit.
        </p>
      </React.Fragment>
    ),
    (
      <React.Fragment key="c5">
        <div className="flex items-center gap-2 mb-6">
           <div className="w-2 h-2 rounded-sm bg-cyan-500"></div>
           <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">05 Income Verification</span>
        </div>
        <div className="w-full h-[260px] relative mb-8 rounded-2xl flex justify-center items-center">
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[350px] scale-[0.75] md:scale-[0.85]">
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex flex-col gap-2 mb-3">
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                <div>
                  <div className="text-[12px] font-semibold text-emerald-600">Salary NEFT</div>
                  <div className="text-[9px] text-gray-400">Apr 15 • 8:42 am</div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-bold text-emerald-600">+₹1,24,481</div>
                  <div className="text-[9px] text-gray-400">₹94,280</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 rounded">
                <div>
                  <div className="text-[12px] font-medium text-gray-800">Airbnb Payout</div>
                  <div className="text-[9px] text-gray-400">Apr 8 • 8:42 am</div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-semibold text-gray-800">+₹16,602</div>
                  <div className="text-[9px] text-gray-400">₹67,798</div>
                </div>
              </div>
            </div>
            <div className="w-full h-32 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-end justify-between gap-2 overflow-hidden">
               <div className="w-full bg-emerald-400 rounded-t border-b border-emerald-500 h-[80%]"></div>
               <div className="w-full bg-emerald-300 rounded-t border-b border-emerald-400 h-[40%]"></div>
               <div className="w-full bg-emerald-400 rounded-t border-b border-emerald-500 h-[75%]"></div>
               <div className="w-full bg-gray-200 border-dashed border-2 border-gray-300 rounded-t h-[90%] flex items-center justify-center opacity-70"></div>
               <div className="w-full bg-gray-200 border-dashed border-2 border-gray-300 rounded-t h-[50%] flex items-center justify-center opacity-70"></div>
            </div>
          </div>
        </div>
        <h3 className="text-[17px] font-semibold text-gray-900 mb-2 leading-tight">Estimate income accurately</h3>
        <p className="text-[13px] text-gray-500 leading-relaxed flex-1">
          Track direct deposits, recurring transfers, and pay frequencies for precise income estimation.
        </p>
      </React.Fragment>
    ),
    (
      <React.Fragment key="c6">
        <div className="flex items-center gap-2 mb-6">
           <div className="w-2 h-2 rounded-sm bg-orange-500"></div>
           <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">06 Dynamic Pricing</span>
        </div>
        <div className="w-full h-[260px] relative mb-8 rounded-2xl flex justify-center items-center">
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[350px] scale-[0.75] md:scale-[0.85]">
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
              <div className="text-[11px] font-bold text-gray-800 mb-3">Ability to pay</div>
              <div className="w-full h-3 rounded-full bg-gradient-to-r from-red-400 via-amber-400 to-emerald-400 relative mb-2 shadow-inner">
                <div className="absolute top-1/2 -translate-y-1/2 right-[15%] w-5 h-5 bg-white border border-gray-200 shadow-md rounded-full shadow-emerald-900/10 cursor-grab"></div>
              </div>
              <div className="flex justify-between text-[9px] text-gray-400 font-medium">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full"></div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Loan Offer Generated</div>
              <div className="flex gap-2 mb-4">
                 <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-100">Approved</span>
                 <span className="bg-gray-50 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded border border-gray-200">Tier 1 Rate</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Max Amount:</span>
                  <span className="font-semibold text-emerald-600">₹8,50,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Interest Rate:</span>
                  <span className="font-semibold text-gray-900">11.5% p.a.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <h3 className="text-[17px] font-semibold text-gray-900 mb-2 leading-tight">Improve offers and pricing</h3>
        <p className="text-[13px] text-gray-500 leading-relaxed flex-1">
          Optimize loan amounts and price dynamically based on real-time risk and ability-to-pay.
        </p>
      </React.Fragment>
    )
  ];

  return (
    <section className="w-full py-24 px-4 md:px-8 bg-[#f5f5f5] flex items-center justify-center overflow-hidden">
      <div className="max-w-[1400px] w-full mx-auto flex flex-col md:gap-16 relative">
        
        {/* --- SECTION HEADER --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          className="flex flex-col items-start text-left max-w-3xl pt-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Use cases
          </h2>
          <p className="text-lg md:text-xl text-gray-500 leading-relaxed text-balance">
            Enrich existing borrower profiles and confidently expand into new segments. Zeyro provides the infrastructure to deploy dynamic, risk-adjusted pricing models effortlessly.
          </p>
        </motion.div>

        {/* --- MOBILE SWIPE STACK --- */}
        <div className="md:hidden mt-8 w-full flex justify-center">
          <MobileSwipeStack cards={useCaseCards} />
        </div>

        {/* --- DESKTOP HORIZONTAL SCROLLING LIST --- */}
        <div className="hidden md:flex overflow-x-auto snap-x snap-mandatory gap-6 lg:gap-8 items-stretch pb-12 pt-4 px-4 -mx-4 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
          <style dangerouslySetInnerHTML={{__html: `
            .hide-scrollbar::-webkit-scrollbar { display: none; }
          `}} />

          {useCaseCards.map((card, idx) => (
            <motion.div 
              key={`desktop-${idx}`}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.1 * idx }}
              className="flex-none w-[400px] flex flex-col bg-[#e8eae8] rounded-[24px] p-6 overflow-hidden h-[460px] snap-start shadow-sm border border-gray-100"
            >
              {card}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
