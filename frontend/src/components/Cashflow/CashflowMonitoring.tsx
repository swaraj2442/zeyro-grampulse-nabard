"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimationFrame, useMotionValue, useTransform } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const MONTH_DATA = [
  {
    month: "JANUARY",
    weeklyData: [
      { score: 642, label: "Stable activity", type: "neutral" },
      { score: 644, label: "Stable activity", type: "neutral" },
      { score: 646, label: "Stable activity", type: "neutral" },
      { score: 645, label: "Stable activity", type: "neutral" }
    ],
    bottomTitle: "Standard monthly cycle",
    transactions: [
      { date: "Jan 04", category: "UPI Transfer", amount: "-₹12,500" },
      { date: "Jan 15", category: "Investments", amount: "-₹30,000" }
    ]
  },
  {
    month: "FEBRUARY",
    weeklyData: [
      { score: 650, label: "New activity detected", type: "positive" },
      { score: 655, label: "New activity detected", type: "positive" },
      { score: 660, label: "New activity detected", type: "positive" },
      { score: 665, label: "New activity detected", type: "positive" }
    ],
    bottomTitle: "Additional income source detected",
    transactions: [
      { date: "Feb 08", category: "Freelance", amount: "₹45,000" },
      { date: "Feb 20", category: "AIRBNB", amount: "₹55,000" }
    ]
  },
  {
    month: "MARCH",
    weeklyData: [
      { score: 660, label: "Monitoring activity", type: "warning" },
      { score: 650, label: "Monitoring activity", type: "warning" },
      { score: 640, label: "Monitoring activity", type: "warning" },
      { score: 630, label: "Monitoring activity", type: "warning" }
    ],
    bottomTitle: "New home loan detected",
    transactions: [
      { date: "Mar 05", category: "Consulting", amount: "₹80,000" },
      { date: "Mar 10", category: "Home Loan EMI", amount: "-₹85,000" }
    ]
  },
  {
    month: "APRIL",
    weeklyData: [
      { score: 620, label: "High outflow", type: "negative" },
      { score: 610, label: "High outflow", type: "negative" },
      { score: 600, label: "High outflow", type: "negative" },
      { score: 595, label: "High outflow", type: "negative" }
    ],
    bottomTitle: "Unusual expense detected",
    transactions: [
      { date: "Apr 12", category: "Medical", amount: "-₹1,20,000" },
      { date: "Apr 15", category: "Credit Card", amount: "-₹45,000" }
    ]
  },
  {
    month: "MAY",
    weeklyData: [
      { score: 595, label: "Recovery phase", type: "negative" },
      { score: 605, label: "Recovery phase", type: "negative" },
      { score: 615, label: "Recovery phase", type: "negative" },
      { score: 625, label: "Recovery phase", type: "warning" }
    ],
    bottomTitle: "Reduced expenses",
    transactions: [
      { date: "May 10", category: "Groceries", amount: "-₹18,000" },
      { date: "May 25", category: "Tax Refund", amount: "₹25,000" }
    ]
  },
  {
    month: "JUNE",
    weeklyData: [
      { score: 635, label: "Positive growth", type: "positive" },
      { score: 645, label: "Positive growth", type: "positive" },
      { score: 655, label: "Positive growth", type: "positive" },
      { score: 660, label: "Positive growth", type: "positive" }
    ],
    bottomTitle: "Bonus payment received",
    transactions: [
      { date: "Jun 02", category: "Subscription", amount: "-₹1,499" },
      { date: "Jun 10", category: "Annual Bonus", amount: "₹3,00,000" }
    ]
  },
  {
    month: "JULY",
    weeklyData: [
      { score: 655, label: "Stable activity", type: "neutral" },
      { score: 653, label: "Stable activity", type: "neutral" },
      { score: 651, label: "Stable activity", type: "neutral" },
      { score: 650, label: "Stable activity", type: "neutral" }
    ],
    bottomTitle: "Regular monthly cycle",
    transactions: [
      { date: "Jul 05", category: "Rent", amount: "-₹40,000" },
      { date: "Jul 18", category: "Dining", amount: "-₹8,500" }
    ]
  },
  {
    month: "AUGUST",
    weeklyData: [
      { score: 652, label: "Investment growth", type: "positive" },
      { score: 658, label: "Investment growth", type: "positive" },
      { score: 665, label: "Investment growth", type: "positive" },
      { score: 670, label: "Investment growth", type: "positive" }
    ],
    bottomTitle: "New mutual fund SIP",
    transactions: [
      { date: "Aug 12", category: "SIP Auto-debit", amount: "-₹50,000" },
      { date: "Aug 22", category: "E-commerce", amount: "-₹15,000" }
    ]
  },
  {
    month: "SEPTEMBER",
    weeklyData: [
      { score: 665, label: "Festival spending", type: "warning" },
      { score: 655, label: "Festival spending", type: "warning" },
      { score: 645, label: "Festival spending", type: "warning" },
      { score: 635, label: "Festival spending", type: "warning" }
    ],
    bottomTitle: "Increased retail purchases",
    transactions: [
      { date: "Sep 15", category: "Electronics", amount: "-₹95,000" },
      { date: "Sep 28", category: "Travel", amount: "-₹35,000" }
    ]
  },
  {
    month: "OCTOBER",
    weeklyData: [
      { score: 640, label: "Stable activity", type: "neutral" },
      { score: 645, label: "Stable activity", type: "neutral" },
      { score: 650, label: "Stable activity", type: "neutral" },
      { score: 655, label: "Stable activity", type: "neutral" }
    ],
    bottomTitle: "Standard income deposits",
    transactions: [
      { date: "Oct 04", category: "Salary", amount: "₹1,50,000" },
      { date: "Oct 10", category: "Home Loan EMI", amount: "-₹85,000" }
    ]
  },
  {
    month: "NOVEMBER",
    weeklyData: [
      { score: 660, label: "Dividend income", type: "positive" },
      { score: 665, label: "Dividend income", type: "positive" },
      { score: 670, label: "Dividend income", type: "positive" },
      { score: 675, label: "Dividend income", type: "positive" }
    ],
    bottomTitle: "Stock dividend received",
    transactions: [
      { date: "Nov 14", category: "Utilities", amount: "-₹6,200" },
      { date: "Nov 20", category: "Dividends", amount: "₹42,000" }
    ]
  },
  {
    month: "DECEMBER",
    weeklyData: [
      { score: 680, label: "Excellent health", type: "positive" },
      { score: 685, label: "Excellent health", type: "positive" },
      { score: 690, label: "Excellent health", type: "positive" },
      { score: 695, label: "Excellent health", type: "positive" }
    ],
    bottomTitle: "Year-end financial stability",
    transactions: [
      { date: "Dec 18", category: "Flight Booking", amount: "-₹22,000" },
      { date: "Dec 24", category: "Fixed Deposit", amount: "-₹1,00,000" }
    ]
  }
];

const getActivityColors = (type: string) => {
  switch (type) {
    case 'positive':
      return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    case 'negative':
      return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    case 'warning':
      return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    case 'neutral':
    default:
      return 'bg-black/20 border-black/40 text-gray-300';
  }
};

const getTxColors = (amount: string) => {
  return amount.includes('-')
    ? 'bg-rose-500/10 text-rose-400'
    : 'bg-[#192b23] text-[#22c55e]';
};

export default function CashflowMonitoring() {
  const [monthIndex, setMonthIndex] = useState(0);
  const [weekIndex, setWeekIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWeekIndex(prevWeek => {
        if (prevWeek === 3) {
          setMonthIndex(prevMonth => (prevMonth + 1) % 12);
          return 0;
        }
        return prevWeek + 1;
      });
    }, 2000); // Toggle every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const currentMonthData = MONTH_DATA[monthIndex];
  const targetScoreValue = currentMonthData.weeklyData[weekIndex].score;

  // Motion values for continuous live animation
  const score = useMotionValue(MONTH_DATA[0].weeklyData[0].score);
  const roundedScore = useTransform(score, v => Math.round(v));

  // Dynamic CIBIL-style coloring
  const scoreColor = useTransform(score, [580, 620, 650, 700], ['#f43f5e', '#f59e0b', '#22c55e', '#22c55e']);
  const scoreBorderColor = useTransform(score, [580, 620, 650, 700], ['rgba(244,63,94,0.3)', 'rgba(245,158,11,0.3)', 'rgba(34,197,94,0.3)', 'rgba(34,197,94,0.3)']);
  const scoreShadow = useTransform(score, [580, 620, 650, 700], [
    'drop-shadow(0px 2px 4px rgba(244,63,94,0.3))',
    'drop-shadow(0px 2px 4px rgba(245,158,11,0.3))',
    'drop-shadow(0px 2px 4px rgba(34,197,94,0.3))',
    'drop-shadow(0px 2px 4px rgba(34,197,94,0.3))'
  ]);
  const dotShadow = useTransform(score, [580, 620, 650, 700], [
    'drop-shadow(0 0 12px #f43f5e)',
    'drop-shadow(0 0 12px #f59e0b)',
    'drop-shadow(0 0 12px #22c55e)',
    'drop-shadow(0 0 12px #22c55e)'
  ]);

  const pathData = useMotionValue("");
  const dotY = useMotionValue(110);

  // Live Chart State (Ticker)
  const historyRef = React.useRef<number[]>(Array.from({ length: 130 }, () => 110));
  const lastUpdate = React.useRef(0);
  const targetY = React.useRef(110);

  useAnimationFrame((t) => {
    // 1. Smoothly transition the score
    const current = score.get();
    const diff = targetScoreValue - current;

    if (Math.abs(diff) > 0.1) {
      score.set(current + diff * 0.05); // Spring-like easing towards target
    }

    // 2. Generate live erratic ticker (right to left)
    const TICK_RATE = 60; // ms per new data point for a fast, live feel

    if (t - lastUpdate.current > TICK_RATE) {
      lastUpdate.current = t;

      // Map score (580-700) directly to Y-axis (160 down to 40 up)
      const mappedScore = Math.min(Math.max(targetScoreValue, 580), 700);
      const mappedY = 160 - ((mappedScore - 580) / 120) * 120;

      // Allow minor random wiggles for a "live" feel, but strictly anchor to the real score!
      if (Math.random() > 0.85) {
        targetY.current = mappedY + (Math.random() * 12 - 6);
      }

      const lastY = historyRef.current[historyRef.current.length - 1];
      let nextY = lastY + (targetY.current - lastY) * 0.05 + (Math.random() * 3 - 1.5);
      nextY = Math.max(20, Math.min(180, nextY));

      historyRef.current.push(nextY);
      historyRef.current.shift();
    }

    const progress = Math.min(1, Math.max(0, (t - lastUpdate.current) / TICK_RATE));
    const dx = progress * 5;

    let d = "";
    for (let i = 0; i < historyRef.current.length; i++) {
      const x = (i * 5) - 50 - dx;
      const y = historyRef.current[i];

      if (i === 0) d += `M ${x},${y}`;
      else d += ` L ${x},${y}`;

      if (x <= 300 && x + 5 > 300) {
        const nextY = historyRef.current[i + 1] || y;
        const ratio = (300 - x) / 5;
        dotY.set(y + (nextY - y) * ratio);
      }
    }
    pathData.set(d);
  });

  return (
    <section className="w-full bg-[#f4efe6] text-gray-900 py-24 flex items-center justify-center">
      <div className="max-w-6xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">

        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-white border border-black/10 flex items-center justify-center shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 22H22L12 2Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 10L6 22H18L12 10Z" fill="black" fillOpacity="0.3" />
              </svg>
            </div>
            <span className="text-gray-600 font-medium">Cashflow</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 leading-tight">
            Continuous cash<br />flow monitoring
          </h2>

          <p className="text-lg text-gray-600 max-w-md mb-10">
            Track evolving customer financial conditions in real time
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded-full font-medium flex items-center justify-center gap-2 transition-transform duration-200 ease-out active:scale-[0.97] hover:bg-gray-800">
              Talk to our team
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto relative bg-[#111113] border border-white/5 rounded-2xl p-4 md:p-6 overflow-hidden shadow-2xl">

          <div className="bg-[#18181a] rounded-xl p-5 flex justify-between items-start relative z-10 border border-white/[0.03] shadow-lg">
            <div>
              <motion.p className="text-sm font-medium mb-2 tracking-wide" style={{ color: scoreColor }}>BFS Score</motion.p>
              <motion.div
                className="border rounded-lg px-3 py-1 inline-block"
                style={{ borderColor: scoreBorderColor }}
              >
                <motion.span
                  className="text-3xl font-medium tabular-nums"
                  style={{ color: scoreColor }}
                >
                  {roundedScore}
                </motion.span>
              </motion.div>
            </div>
            <div className="text-right flex flex-col items-end">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentMonthData.month}
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.4 }}
                  className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-3"
                >
                  {currentMonthData.month}
                </motion.p>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMonthData.weeklyData[weekIndex].label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`border rounded-full px-3 py-1.5 backdrop-blur-sm ${getActivityColors(currentMonthData.weeklyData[weekIndex].type)}`}
                >
                  <span className="text-xs font-medium">
                    {currentMonthData.weeklyData[weekIndex].label}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="relative w-full h-[180px] my-2">
            <svg viewBox="0 0 500 200" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              <line x1="150" y1="0" x2="150" y2="200" stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />
              <line x1="300" y1="0" x2="300" y2="200" stroke="white" strokeOpacity="0.05" strokeDasharray="4 4" />

              <motion.path
                d={pathData}
                style={{ stroke: scoreColor, filter: scoreShadow }}
                strokeWidth="2.5"
                fill="none"
              />

              <motion.circle
                cx={300}
                cy={dotY}
                r="5"
                style={{ fill: scoreColor, filter: dotShadow }}
              />
              <motion.circle
                cx={300}
                cy={dotY}
                r="2"
                fill="white"
              />
            </svg>
          </div>

          <div className="bg-[#18181a] rounded-xl p-5 relative z-10 border border-white/[0.03] shadow-lg min-h-[160px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={monthIndex}
                initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(2px)" }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-sm font-medium text-gray-300 mb-4">{currentMonthData.bottomTitle}</h3>
                <div className="space-y-3">
                  {currentMonthData.transactions.map((tx, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 w-12">{tx.date}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${getTxColors(tx.amount)}`}>
                          {tx.category}
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${tx.amount.includes('-') ? 'text-gray-400' : 'text-gray-300'}`}>
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
