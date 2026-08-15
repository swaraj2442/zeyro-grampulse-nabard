import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, BarChart2, Type, Heading, FileText, Image as ImageIcon, Key, List, Box } from 'lucide-react';

const PIXEL_CHARS_DENSE = ['▓', '▒', '▓'];
const PIXEL_CHARS_MID = ['▒', '░', '▒'];
const PIXEL_CHARS_LIGHT = ['░', '·', '░', '·'];

function DecodeText({ value, duration = 600, className = '' }: { value: string; duration?: number; className?: string }) {
  const [resolvedCount, setResolvedCount] = useState(0);
  const [scrambledTail, setScrambledTail] = useState('');
  const frameRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const chars = value.split('');
    const totalFrames = Math.ceil(duration / 30);
    let frame = 0;

    const generateTail = (fromIdx: number) => {
      const remaining = chars.slice(fromIdx);
      const totalRem = remaining.length;
      return remaining.map((ch, idx) => {
        if (ch === ' ' || ch === '\t') return ch;
        // Gradient micro pixel effect: textured blocks near resolved text, dissolving to light dots at the tail
        const ratio = idx / Math.max(1, totalRem);
        if (ratio < 0.35) return PIXEL_CHARS_DENSE[Math.floor(Math.random() * PIXEL_CHARS_DENSE.length)];
        if (ratio < 0.70) return PIXEL_CHARS_MID[Math.floor(Math.random() * PIXEL_CHARS_MID.length)];
        return PIXEL_CHARS_LIGHT[Math.floor(Math.random() * PIXEL_CHARS_LIGHT.length)];
      }).join('');
    };

    const tick = () => {
      frame++;
      const progress = frame / totalFrames;
      const count = Math.min(value.length, Math.floor(progress * value.length));
      setResolvedCount(count);
      setScrambledTail(generateTail(count));
      if (frame < totalFrames) {
        frameRef.current = setTimeout(tick, 30);
      } else {
        setResolvedCount(value.length);
        setScrambledTail('');
      }
    };

    if (frameRef.current) clearTimeout(frameRef.current);
    frameRef.current = setTimeout(tick, 30);
    return () => { if (frameRef.current) clearTimeout(frameRef.current); };
  }, [value, duration]);

  const resolvedText = value.slice(0, resolvedCount);

  return (
    <span className={className}>
      {resolvedText}
      {scrambledTail && (
        <span className="text-[#ff4d94] font-mono font-bold select-none tracking-tighter opacity-100 drop-shadow-[0_0_6px_rgba(255,77,148,0.8)]">
          {scrambledTail}
        </span>
      )}
    </span>
  );
}

const renderCardContent = (card: any) => {
  switch (card.type) {
    case 'chart':
      return (
        <div className="flex-1 w-full bg-pink-50/20 rounded overflow-hidden relative border border-pink-100 mt-2">
           <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full opacity-80">
             <path d={card.chartPath || "M0 50 L0 35 L20 40 L40 20 L60 30 L80 10 L100 25 L100 50 Z"} fill="url(#pink-grad2)" stroke="#f98cc8" strokeWidth="1.5"/>
             <defs>
               <linearGradient id="pink-grad2" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#f98cc8" stopOpacity="0.4" />
                 <stop offset="100%" stopColor="#f98cc8" stopOpacity="0.0" />
               </linearGradient>
             </defs>
           </svg>
           <span className="absolute right-4 top-2 text-gray-800 font-serif text-[10px] italic">{card.chartLabels[0]}</span>
           <span className="absolute right-4 bottom-2 text-gray-800 font-serif text-[10px] italic font-bold">{card.chartLabels[1]}</span>
        </div>
      );
    case 'docInfo':
      return (
        <div className="flex flex-col gap-1.5 text-[9px] font-serif italic text-gray-800 flex-1 justify-center mt-1">
           <span className="uppercase text-gray-600 font-semibold tracking-wider text-[7px] mb-0.5">Processed:</span>
           <div className="flex items-center gap-1.5 border border-[#f98cc8] p-1.5 mb-1 bg-white">
             <FileText className="w-3 h-3 text-gray-800 shrink-0" />
              <span className="truncate text-gray-800"><DecodeText value={card.filename} duration={800} /></span>
           </div>
           <div className="flex items-center justify-between">
             <span className="uppercase text-gray-600 font-semibold tracking-wider text-[7px]">Type:</span>
              <span className="border border-[#f98cc8] px-2 py-0.5 text-gray-800 bg-white"><DecodeText value={card.docType} duration={600} /></span>
           </div>
           <div className="flex items-center justify-between">
             <span className="uppercase text-gray-600 font-semibold tracking-wider text-[7px]">Status:</span>
              <span className="border border-[#f98cc8] px-2 py-0.5 text-gray-800 bg-white"><DecodeText value={card.status} duration={600} /></span>
           </div>
        </div>
      );
    case 'progress':
      return (
        <div className="flex flex-col gap-2 text-[10px] font-serif italic text-gray-800 flex-1 justify-center">
           {card.items.map((item: any, idx: any) => (
             <div key={idx} className="relative flex items-center justify-between border-b border-[#f98cc8] pb-1">
               <div className="absolute left-0 top-0 bottom-0 bg-[#f98cc8]/20 -z-10" style={{ width: `${item.value}%`}}></div>
                <span className="whitespace-nowrap"><DecodeText value={item.label} duration={600} /></span>
                <span><DecodeText value={String(item.value) + '%'} duration={600} /></span>
             </div>
           ))}
        </div>
      );
    case 'table':
      return (
        <table className="w-full text-gray-800 font-serif italic text-[9.5px] text-left flex-1 mt-1">
           <thead><tr className="border-b border-[#f98cc8]">
              {card.headers.map((h: any, i: any) => <th key={i} className={`pb-1.5 font-normal uppercase text-[8px] tracking-wider text-gray-600 ${i===card.headers.length-1 ? 'text-right' : ''}`}><DecodeText value={h} duration={500} /></th>)}
           </tr></thead>
           <tbody>
             {card.rows.map((row: any, idx: any) => (
               <tr key={idx} className={idx < card.rows.length - 1 ? "border-b border-[#f98cc8]" : ""}>
                 {row.map((cell: any, cidx: any) => (
                     <td key={cidx} className={`py-1.5 ${cidx===0 ? (card.fadeFirstCol ? 'text-gray-500' : '') : ''} ${cidx===row.length-1 ? 'text-right font-medium' : ''} ${cell.length > 15 ? 'truncate max-w-[50px]' : ''}`}><DecodeText value={cell} duration={700} /></td>
                 ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case 'summary':
      return (
        <>
          <p className="text-[10px] leading-[1.6] text-gray-800 font-serif italic mt-1 relative z-10"><DecodeText value={card.text} duration={900} /></p>
        </>
      );
    default:
      return null;
  }
};

const TagIcon = ({ name }: { name: string }) => {
  const props = { className: "w-4 h-4 text-[#f98cc8] shrink-0" };
  switch(name) {
    case 'TABLE': return <Table {...props} />;
    case 'GRAPH': 
    case 'CHART': return <BarChart2 {...props} />;
    case 'TEXT': return <Type {...props} />;
    case 'HEADER': return <Heading {...props} />;
    case 'IMAGE': return <ImageIcon {...props} />;
    case 'KEY': return <Key {...props} />;
    case 'FORM': return <List {...props} />;
    default: return <Box {...props} />;
  }
};

const slides = [
  {
    id: "service",
    title: "Service Agreement",
    subtitle: "Period: 2020-2024 Coverage: 8 Major U.S. Metro Markets Date: December 20, 2024",
    headerTag: "NEXA LABS, INC.",
    contentTitle: "Scope of Work",
    contentParagraphs: [
      "NEXA Labs shall provide the Customer with structured data extraction services covering invoice processing, contract review, and compliance auditing across all enterprise document workflows. Services include automated bbox detection, semantic field tagging, and human-in-the-loop validation for high-confidence outputs.",
      "Throughput SLA: 50,000 pages per month with 99.5% uptime guaranteed through redundant cloud regions and quarterly DR drills. Onboarding window: 30 days from contract execution. All extracted data delivered via JSON or Markdown over secure HTTPS with optional VPC peering."
    ],
    tableData: [
      { city: "New York, NY", price: "$700k", growth: "+24%", avgY: "$8.5M" },
      { city: "Los Angeles, CA", price: "$820k", growth: "+21%", avgY: "$9.2M" },
      { city: "Miami, FL", price: "$490k", growth: "+46%", avgY: "$4.1M" }
    ],
    cardsData: {
      left: [
        { title: "Contract Value", type: "chart", chartPath: "M0 50 L0 30 Q25 40 50 20 T100 10 L100 50 Z", chartLabels: ["$420k", "$465k"], footer: ["2020 Value", "2024 Value"] },
        { title: "Doc Info", type: "docInfo", filename: "NEXA_Agreement_Q2.pdf", docType: "Agreement", status: "Processed" },
        { title: "Scope Match", type: "progress", items: [{label: "API Service", value: 52}, {label: "Compliance", value: 28}, {label: "Support", value: 20}] }
      ],
      right: [
        { title: "Line Items", type: "table", fadeFirstCol: true, headers: ["DATE", "VENDOR", "AMOUNT"], rows: [["04.01", "API Access", "$220k"], ["04.01", "Compliance", "$120k"], ["04.01", "Onboarding", "$80k"]] },
        { title: "Parties", type: "table", headers: ["VENDOR", "CONFIDENCE"], rows: [["NEXA Labs Inc.", "99%"], ["K. Chen, VP", "97%"], ["Customer Inc.", "95%"]] },
        { title: "DOCUMENT SUMMARY", type: "summary", text: "Enterprise agreement for structured data extraction with a 50k pages/mo SLA and 99.5% uptime across redundant cloud regions." }
      ],
      tags: [
        ["CHART", "KEY"],
        ["TEXT", "TABLE"],
        ["HEADER", "IMAGE"]
      ]
    }
  },
  {
    id: "housing",
    title: "U.S. Housing Market",
    subtitle: "Period: 2020-2024 Coverage: 8 Major U.S. Metro Markets",
    headerTag: "REPORT",
    contentTitle: "Market Overview",
    contentParagraphs: [
      "U.S. residential real estate prices have risen sharply across all major metros between 2020 and 2024, driven by pandemic-era migration, persistently low housing inventory, and the long-term impact of remote work on buyer preferences.",
      "Austin recorded the steepest appreciation at +66%, while traditionally expensive markets like New York (+24%) and Los Angeles (+21%) saw more moderate gains. Mortgage rates above 7% have dampened transaction volumes significantly, but prices have remained resilient."
    ],
    tableData: [
      { city: "New York, NY", price: "$650k", growth: "+24%", avgY: "$8.5M" },
      { city: "Los Angeles, CA", price: "$820k", growth: "+21%", avgY: "$9.2M" },
      { city: "Austin, TX", price: "$490k", growth: "+66%", avgY: "$4.1M" }
    ],
    cardsData: {
      left: [
        { title: "Price Trend", type: "chart", chartPath: "M0 50 L0 35 L20 40 L40 20 L60 30 L80 10 L100 25 L100 50 Z", chartLabels: ["$540k", "$680k"], footer: ["2020 Median", "2024 Median"] },
        { title: "Doc Info", type: "docInfo", filename: "US_Housing_Q4_2024.pdf", docType: "Market Report", status: "Processed" },
        { title: "Property Mix", type: "progress", items: [{label: "Single Family", value: 58}, {label: "Condos", value: 24}, {label: "Multi-Family", value: 18}] }
      ],
      right: [
        { title: "Recent Sales", type: "table", fadeFirstCol: true, headers: ["DATE:", "VENDOR:", "AMOUNT:"], rows: [["12.03", "New York", "$890k"], ["12.05", "Los Angeles", "$820k"], ["12.07", "Austin", "$610k"]] },
        { title: "Top Markets", type: "table", headers: ["VENDOR:", "CONFIDENCE:"], rows: [["Austin, TX", "+66%"], ["New York, NY", "+24%"], ["Los Angeles, CA", "+21%"]] },
        { title: "DOCUMENT SUMMARY", type: "summary", text: "U.S. housing prices rose sharply across all metros with Austin leading at +66% and Boston/Seattle showing tight sub-20-day supply." }
      ],
      tags: [
        ["TABLE", "GRAPH"],
        ["TEXT", "TABLE"],
        ["TABLE", "HEADER"]
      ]
    }
  }
];

export default function HeroSlider() {

  const [activeIndex, setActiveIndex] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [triggerIndices, setTriggerIndices] = useState([0, 0, 0]);
  const nextId = React.useRef(6);
  const [stack, setStack] = useState(() => {
    return [0, 1, 2, 3, 4, 5].map(depth => ({
      id: depth,
      slideIndex: depth % slides.length
    }));
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
       const t1 = setTimeout(() => setTriggerIndices(p => [activeIndex, p[1], p[2]]), 1200);
       const t2 = setTimeout(() => setTriggerIndices(p => [p[0], activeIndex, p[2]]), 1300);
       const t3 = setTimeout(() => setTriggerIndices(p => [p[0], p[1], activeIndex]), 1400);
       return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    } else {
       setTriggerIndices([activeIndex, activeIndex, activeIndex]);
    }
  }, [activeIndex, isInitialLoad]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStack(prev => {
        const newStack = [...prev];
        newStack.shift();
        newStack.push({
          id: nextId.current++,
          slideIndex: (newStack[newStack.length - 1].slideIndex + 1) % slides.length
        });
        return newStack;
      });
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const renderDocument = (item: any, depthIndex: number) => {
    const slide = slides[item.slideIndex];
    
    return (
      <motion.div
        key={item.id}
        className="absolute bg-white shadow-xl flex flex-col overflow-hidden"
        style={{
          width: 340,
          height: 460,
          left: -60,
          bottom: 100, // BASE Y LEVEL FOR EVERYTHING
          transformOrigin: 'bottom left',
          border: '1px solid #e5e7eb',
          zIndex: 100 - depthIndex,
        }}
        initial={{ opacity: 0, y: depthIndex * -20 - 50, rotateX: -90 }}
        exit={{ opacity: 0, y: 50, scale: 1.05, rotateX: -90 }}
        animate={{
          x: 0, // No X stagger, keep them aligned on the same vertical column in 3D space
          y: depthIndex * -20 - 50, // Stagger along Y to create the isometric depth going Up-Left, and moved back 50px
          z: 0,
          opacity: depthIndex === 5 ? 0 : 1, // Parent is ALWAYS fully opaque white to prevent see-through
          rotateX: -90, 
        }}
        transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1], delay: isInitialLoad ? depthIndex * 0.25 : 0 }}
      >
        <div className="w-full h-full flex flex-col" style={{ opacity: 1 - depthIndex * 0.2 }}>
          {/* Corner Plus Signs */}
          <div className="absolute top-1 left-2 text-gray-400 font-light text-sm pointer-events-none">+</div>
          <div className="absolute top-1 right-2 text-gray-400 font-light text-sm pointer-events-none">+</div>
          <div className="absolute bottom-1 left-2 text-gray-400 font-light text-sm pointer-events-none">+</div>
          <div className="absolute bottom-1 right-2 text-gray-400 font-light text-sm pointer-events-none">+</div>

          <div className="relative p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="relative inline-block">
                 <motion.div
                    className="absolute -inset-y-1 -inset-x-2 border border-[#fe9d52] bg-[#fef2e9]/50 pointer-events-none"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={depthIndex === 0 ? { opacity: [0, 1, 0.5, 1], scale: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.3, delay: 1.2 }}
                 />
                 <h2 className="text-lg font-serif text-gray-900 leading-tight italic relative z-10">{slide.title}</h2>
              </div>
              <div className="text-[#F26522] text-[6px] font-bold font-mono mt-1">
                {slide.headerTag}
              </div>
            </div>
            
            <div className="relative inline-block mt-1">
               <motion.div
                  className="absolute -inset-y-0.5 -inset-x-1 border border-[#fe9d52] bg-[#fef2e9]/50 pointer-events-none"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={depthIndex === 0 ? { opacity: [0, 1, 0.5, 1], scale: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.3, delay: 1.25 }}
               />
               <p className="text-[5.5px] font-mono text-gray-500 uppercase tracking-widest relative z-10">{slide.subtitle}</p>
            </div>
          </div>

          <div className="p-4 flex-1 bg-white">
            <div className="relative p-1 -m-1 mb-4">

               {/* Title highlight */}
               <div className="relative inline-block mb-1 mx-1 mt-1">
                 <motion.div
                    className="absolute -inset-y-0.5 -inset-x-1 border border-[#fe9d52] bg-[#fef2e9]/50 pointer-events-none"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={depthIndex === 0 ? { opacity: [0, 1, 0.5, 1], scale: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.3, delay: 1.32 }}
                 />
                 <p className="font-bold border-b border-gray-200 pb-1 text-[7px] relative z-10 pr-2">{slide.contentTitle}</p>
               </div>

               {/* Content highlight */}
               <div className="relative mx-1 mt-1 z-10 text-[5.5px] leading-[10px] text-gray-800">
                 {slide.contentParagraphs.map((p: any, idx: any) => (
                    <div key={idx} className={`relative inline-block ${idx === 0 ? "mb-1.5" : ""}`}>
                       <motion.div
                          className="absolute -inset-y-0.5 -inset-x-1 border border-[#fe9d52] bg-[#fef2e9]/50 pointer-events-none"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={depthIndex === 0 ? { opacity: [0, 1, 0.5, 1], scale: 1 } : { opacity: 0 }}
                          transition={{ duration: 0.3, delay: 1.34 + (idx * 0.05) }}
                       />
                       <p className="relative z-10">{p}</p>
                    </div>
                 ))}
               </div>
            </div>

            <div className="relative p-1 -m-1 mb-4">
              <div className="relative inline-block mb-1">
                 <motion.div
                    className="absolute -inset-y-0.5 -inset-x-1 border border-[#fe9d52] bg-[#fef2e9]/50 pointer-events-none"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={depthIndex === 0 ? { opacity: [0, 1, 0.5, 1], scale: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.3, delay: 1.35 }}
                 />
                 <p className="font-bold border-b border-gray-200 pb-1 text-[7px] mt-2 relative z-10 pr-2">Authorization & Signatures</p>
              </div>
              <div className="relative">
                 <motion.div
                    className="absolute inset-y-0 -left-1 -right-1 border border-[#fe9d52] bg-[#fef2e9]/50 pointer-events-none"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={depthIndex === 0 ? { opacity: [0, 1, 0.5, 1], scale: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.3, delay: 1.4 }}
                 />
                 <div className="flex justify-between mt-2 text-[5px] text-gray-600 font-serif italic border-b border-gray-100 pb-2 relative z-10">
                    <div><span className="font-sans block mb-1">Authorized Signer Name</span>Karan H. Chen<br/>VP, Enterprise Partnerships</div>
                    <div className="text-right"><span className="font-sans block mb-1">Date of Execution</span>04 / 01 / 2024</div>
                 </div>
              </div>
            </div>

            <div className="relative inline-block mb-1">
               <motion.div
                  className="absolute -inset-y-0.5 -inset-x-1 border border-[#fe9d52] bg-[#fef2e9]/50 pointer-events-none"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={depthIndex === 0 ? { opacity: [0, 1, 0.5, 1], scale: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.3, delay: 1.45 }}
               />
               <p className="font-bold border-b border-gray-200 pb-1 text-[7px] relative z-10 pr-2">City-Level Market Indicators</p>
            </div>
            <div className="relative mt-2 border border-gray-200 rounded-sm overflow-hidden p-0.5">
               <motion.div
                  className="absolute inset-0 border border-[#fe9d52] bg-[#fef2e9]/50 pointer-events-none"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={depthIndex === 0 ? { opacity: [0, 1, 0.5, 1], scale: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.3, delay: 1.5 }}
               />
               
               <motion.div
                  className="absolute top-[2px] left-1 h-[12px] border border-[#fe9d52] bg-[#fef2e9] pointer-events-none origin-left"
                  initial={{ opacity: 0, width: 0 }}
                  animate={depthIndex === 0 ? { opacity: [0, 1, 0.5, 1], width: '95%' } : { opacity: 0, width: 0 }}
                  transition={{ duration: 0.3, delay: 1.52 }}
               />
               <motion.div
                  className="absolute top-[16px] left-1 h-[12px] border border-[#fe9d52] bg-[#fef2e9] pointer-events-none origin-left"
                  initial={{ opacity: 0, width: 0 }}
                  animate={depthIndex === 0 ? { opacity: [0, 1, 0.5, 1], width: '95%' } : { opacity: 0, width: 0 }}
                  transition={{ duration: 0.3, delay: 1.55 }}
               />
               <motion.div
                  className="absolute top-[30px] left-1 h-[12px] border border-[#fe9d52] bg-[#fef2e9] pointer-events-none origin-left"
                  initial={{ opacity: 0, width: 0 }}
                  animate={depthIndex === 0 ? { opacity: [0, 1, 0.5, 1], width: '95%' } : { opacity: 0, width: 0 }}
                  transition={{ duration: 0.3, delay: 1.58 }}
               />
               <motion.div
                  className="absolute top-[44px] left-1 h-[12px] border border-[#fe9d52] bg-[#fef2e9] pointer-events-none origin-left"
                  initial={{ opacity: 0, width: 0 }}
                  animate={depthIndex === 0 ? { opacity: [0, 1, 0.5, 1], width: '95%' } : { opacity: 0, width: 0 }}
                  transition={{ duration: 0.3, delay: 1.61 }}
               />

              <table className="w-full text-[5px] text-left relative z-10">
                <thead className="bg-gray-50 font-mono text-gray-500 uppercase">
                  <tr>
                    <th className="p-1.5 border-b">City</th>
                    <th className="p-1.5 border-b">Price 2024</th>
                    <th className="p-1.5 border-b">Growth</th>
                    <th className="p-1.5 border-b">Avg. Y/Y</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {slide.tableData.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100 last:border-0">
                      <td className="p-1.5 font-medium">{row.city}</td>
                      <td className="p-1.5">{row.price}</td>
                      <td className="p-1.5 text-green-600">{row.growth}</td>
                      <td className="p-1.5">{row.avgY}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative w-full h-full min-h-[720px] lg:h-full flex items-center justify-center pointer-events-none">
      <div className="relative w-full h-full z-10 shrink-0 scale-50 sm:scale-[0.55] lg:scale-[0.95] origin-center translate-x-[-105px] -translate-y-[85px]">
        {/* TRUE ORTHOGRAPHIC PROJECTION - No perspective */}
        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(55deg) rotateZ(-45deg) translateZ(-40px)', transformOrigin: '50% 50%' }}>
          
          {/* Static Hint Wireframes (Pages extending infinitely) */}
          <div className="absolute bg-transparent"
               style={{
                 width: 340, height: 460, left: -60, bottom: 100, transformOrigin: 'bottom left',
                 borderTop: '1px solid rgba(229, 231, 235, 0.8)',
                 borderLeft: '1px solid rgba(229, 231, 235, 0.8)',
                 transform: 'translateY(-150px) rotateX(-90deg)', 
                 zIndex: 94
               }}
          >
             <div className="absolute top-2 left-2 text-gray-300 font-light text-sm pointer-events-none">+</div>
          </div>
          <div className="absolute bg-transparent"
               style={{
                 width: 340, height: 460, left: -60, bottom: 100, transformOrigin: 'bottom left',
                 borderTop: '1px solid rgba(229, 231, 235, 0.3)',
                 borderLeft: '1px solid rgba(229, 231, 235, 0.3)',
                 transform: 'translateY(-170px) rotateX(-90deg)', 
                 zIndex: 93
               }}
          >
             <div className="absolute top-2 left-2 text-gray-200 font-light text-sm pointer-events-none">+</div>
          </div>

          <AnimatePresence>{[...stack].reverse().map((item) => {
              const depthIndex = stack.indexOf(item);
              return renderDocument(item, depthIndex);
            })}</AnimatePresence>


          {/* Pink Lines rendered at the Front Document's depth */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              width: 340,
              height: 460,
              left: -60,
              bottom: 100,
              transformStyle: 'preserve-3d',
              transformOrigin: 'bottom left',
              transform: 'translateY(-30px) translateZ(1px) rotateX(-90deg)', 
            }}
          >
             {/* Beam 1 (Header -> Top Left Card) */}
             <div className="absolute left-[60px] top-[122px] z-10 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 1.2 }} className="absolute left-0 top-0 w-2 h-2 bg-[#f98cc8] rounded-full shadow-[0_0_5px_rgba(249,110,174,0.5)] transform -translate-x-1/2 -translate-y-1/2" />
                <motion.div 
                  className="absolute left-0 top-0 w-[1.5px] bg-[#f98cc8] origin-top"
                  initial={{ height: 0 }} animate={{ height: '250px' }} transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut" }}
                  style={{ transform: 'rotateX(90deg)' }}
                />
             </div>

             {/* Beam 4 (Header -> Top Right Card) */}
             <div className="absolute left-[245px] top-[122px] z-10 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 1.4 }} className="absolute left-0 top-0 w-2 h-2 bg-[#f98cc8] rounded-full shadow-[0_0_5px_rgba(249,110,174,0.5)] transform -translate-x-1/2 -translate-y-1/2" />
                <motion.div 
                  className="absolute left-0 top-0 w-[1.5px] bg-[#f98cc8] origin-top"
                  initial={{ height: 0 }} animate={{ height: '250px' }} transition={{ duration: 1.5, delay: 1.4, ease: "easeInOut" }}
                  style={{ transform: 'rotateX(90deg)' }}
                />
             </div>

             {/* Beam 2 (Content -> Middle Left Card) */}
             <div className="absolute left-[60px] top-[248px] z-10 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 1.6 }} className="absolute left-0 top-0 w-2 h-2 bg-[#f98cc8] rounded-full shadow-[0_0_5px_rgba(249,110,174,0.5)] transform -translate-x-1/2 -translate-y-1/2" />
                <motion.div 
                  className="absolute left-0 top-0 w-[1.5px] bg-[#f98cc8] origin-top"
                  initial={{ height: 0 }} animate={{ height: '250px' }} transition={{ duration: 1.5, delay: 1.6, ease: "easeInOut" }}
                  style={{ transform: 'rotateX(90deg)' }}
                />
             </div>

             {/* Beam 3 (Table -> Bottom Left Card) */}
             <div className="absolute left-[60px] top-[374px] z-10 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 1.8 }} className="absolute left-0 top-0 w-2 h-2 bg-[#f98cc8] rounded-full shadow-[0_0_5px_rgba(249,110,174,0.5)] transform -translate-x-1/2 -translate-y-1/2" />
                <motion.div 
                  className="absolute left-0 top-0 w-[1.5px] bg-[#f98cc8] origin-top"
                  initial={{ height: 0 }} animate={{ height: '250px' }} transition={{ duration: 1.5, delay: 1.8, ease: "easeInOut" }}
                  style={{ transform: 'rotateX(90deg)' }}
                />
             </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: isInitialLoad ? 0 : 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: isInitialLoad ? 2.7 : 0 }}
            className="absolute bg-[#ffca99]/30 border-[1.5px] border-[#fd9746] backdrop-blur-[2px]"
            style={{
              width: 445,
              height: 435,
              left: -140,
              bottom: 90,
              transformStyle: 'preserve-3d',
              transformOrigin: 'bottom left',
              transform: 'translateY(240px) translateZ(81px) rotateX(-90deg)', 
            }}
          >
             {/* Floating Parsing Banner outside and above the Cards wall */}
             <div className="absolute left-0 right-0 top-[0px] z-20 pointer-events-none flex justify-center">
                <div className="bg-pink-50/95 backdrop-blur-sm border border-[#f98cc8] px-4 py-1.5 flex items-center gap-3 shadow-lg"
                     style={{ transform: 'translateY(-45px)' }}>
                   <div className="flex gap-[2px]">
                      <motion.div className="w-1 h-2.5 bg-[#f98cc8]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} />
                      <motion.div className="w-1 h-2.5 bg-[#f98cc8]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} />
                      <motion.div className="w-1 h-2.5 bg-[#f98cc8]" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} />
                   </div>
                   <span className="text-[#f98cc8] font-serif italic text-[10px] tracking-widest font-bold">PARSING THE DOCUMENT...</span>
                </div>
             </div>
             


             {/* Cards (Persistent Structure with Inner Content Crossfade) */}
             <div className="absolute inset-0" style={{ transform: 'translateZ(2px)' }}>
               <div className="relative w-full h-full flex flex-row gap-2 px-2 py-6 items-start justify-center pt-8">
                  {/* Left Column */}
                  <div className="flex flex-col gap-3 flex-1 translate-x-[30px]">
                     {[0, 1, 2].map((i) => {
                        const triggerIdx = triggerIndices[i];
                        const c = slides[triggerIdx].cardsData.left[i];
                        return (
                           <div key={i} className="h-[140px] bg-white border-[1px] border-[#f98cc8] p-2 shadow-[-8px_-8px_0_#ffcb9b] flex flex-col relative overflow-hidden">
                                <motion.div
                                   key={triggerIdx}
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   transition={{ duration: 0.3, delay: isInitialLoad ? 2.7 + i * 0.3 : 0, ease: "linear" }}
                                   className="flex-1 flex flex-col h-full"
                                >
                                   <div className="text-gray-900 font-serif text-[12px] mb-2 flex justify-between italic font-semibold tracking-tight relative z-10">
                                      <DecodeText value={c.title} duration={500} />
                                   </div>
                                   {renderCardContent(c)}
                                   {c.footer && (
                                      <div className="flex justify-between mt-1.5 text-[8px] text-[#f98cc8] font-mono relative z-10">
                                        <span>{c.footer[0]}</span>
                                        <span>{c.footer[1]}</span>
                                      </div>
                                   )}
                                </motion.div>
                           </div>
                        );
                     })}
                  </div>
                  
                  {/* Right Column */}
                  <div className="flex flex-col gap-3 flex-1 translate-x-[35px]">
                     {[0, 1, 2].map((i) => {
                        const triggerIdx = triggerIndices[i];
                        const c = slides[triggerIdx].cardsData.right[i];
                        return (
                           <div key={i} className="h-[140px] bg-white border-[1px] border-[#f96eae] p-2 shadow-[-8px_-8px_0_#ffcb9b] flex flex-col relative overflow-hidden">
                                <motion.div
                                   key={triggerIdx}
                                   initial={{ opacity: 0 }}
                                   animate={{ opacity: 1 }}
                                   transition={{ duration: 0.3, delay: isInitialLoad ? 2.7 + i * 0.3 : 0, ease: "linear" }}
                                   className="flex-1 flex flex-col h-full"
                                >
                                   <div className="text-gray-900 font-serif text-[12px] mb-2 flex justify-between italic font-semibold tracking-tight relative z-10">
                                      <DecodeText value={c.title} duration={500} />
                                   </div>
                                   {renderCardContent(c)}
                                </motion.div>
                           </div>
                        );
                     })}
                  </div>
                  
               </div>
               
               {/* Floating Tags - Fixed Position with Blink Animation on Data Change Staggered */}
               <div className="absolute right-[-120px] top-[-28px] bottom-0 py-4 pt-8 flex flex-col gap-4 justify-start pointer-events-none translate-x-[40px]">
                  {[0, 1, 2].map((rowIdx) => {
                     const triggerIdx = triggerIndices[rowIdx];
                     const rowTags = slides[triggerIdx].cardsData.tags[rowIdx];
                     return (
                     <motion.div 
                        key={`tags-${triggerIdx}-${rowIdx}`}
                        className="h-[160px] flex flex-col justify-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0, 1] }}
                        transition={{ duration: 0.3, delay: isInitialLoad ? 2.7 + rowIdx * 0.3 : 0, ease: "linear" }}
                     >
                        {rowTags.map((t: any, i: any) => (
                           <div key={i} className="border-[1.5px] border-[#f96eae] text-gray-700 text-[13px] font-serif px-3.5 py-1.5 bg-white flex items-center gap-2.5 italic font-medium tracking-wide shadow-sm">
                              <span className="text-[#f96eae]"><TagIcon name={t} /></span> {t}
                           </div>
                        ))}
                     </motion.div>
                     );
                  })}
               </div>
             </div>

             {/* Removed Double Orange Shadows */}
           </motion.div>

        </div>
      </div>
    </div>
  );
}
