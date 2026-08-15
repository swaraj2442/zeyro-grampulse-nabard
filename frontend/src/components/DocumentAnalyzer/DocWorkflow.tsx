"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Caveat } from 'next/font/google';
import IsometricCube from './graphics/IsometricCube';
import PixelCube from './graphics/PixelCube';

const caveat = Caveat({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

const ParserFloor = ({
  colorScheme = 'pink',
  label = 'PARSING',
  translateZ = 0,
  scale = 1,
  hideSlit = false,
  hidePlate = false,
  hideCube = false,
  hideDashes = false,
  hidePluses = false,
  slitColor,
  slitStyle,
  customContent,
  floorThickness,
  bottomScale = 1
}: {
  colorScheme?: 'pink' | 'gray',
  label?: string,
  translateZ?: number,
  scale?: number,
  hideSlit?: boolean,
  hidePlate?: boolean,
  hideCube?: boolean,
  hideDashes?: boolean,
  hidePluses?: boolean,
  slitColor?: 'pink' | 'gray' | 'amber',
  slitStyle?: React.CSSProperties,
  customContent?: React.ReactNode,
  floorThickness?: number,
  bottomScale?: number
}) => {
  const colors = colorScheme === 'pink' ? {
    plateBg: 'from-pink-200/40 to-pink-200/60',
    plateBorder: 'border-pink-300',
    cubeFillTop: '#f9a8d4',
    cubeFillFront: '#f9a8d4',
    cubeStroke: '#f472b6',
    slitBg: 'bg-pink-200/60',
    slitBorder: 'border-pink-300/80',
    slitText: 'text-black-400',
    dashTop: '#df0676',
    dashBottom: '#f472b6',
    plusText: 'text-pink-300'
  } : {
    plateBg: 'from-gray-200/40 to-gray-200/50',
    plateBorder: 'border-gray-400',
    cubeFillTop: '#d1d5db',
    cubeFillFront: '#d1d5db',
    cubeStroke: '#9ca3af',
    slitBg: 'bg-gray-300/40',
    slitBorder: 'border-gray-400/80',
    slitText: 'text-gray-800',
    dashTop: '#4b5563',
    dashBottom: '#9ca3af',
    plusText: 'text-gray-400'
  };

  const effectiveSlitColor = slitColor || colorScheme;
  const resolvedSlitColors = effectiveSlitColor === 'pink' ? {
    slitBg: 'bg-pink-200/60',
    slitBorder: 'border-pink-300/80',
    slitText: 'text-black-400',
  } : effectiveSlitColor === 'amber' ? {
    slitBg: 'bg-[#FFE1D6]/60',
    slitBorder: 'border-gray-500/60',
    slitText: 'text-black-400',
  } : {
    slitBg: 'bg-gray-200/60',
    slitBorder: 'border-gray-400/80',
    slitText: 'text-gray-800',
  };

  return (
    <div className="absolute top-1/2 left-1/2 w-[360px] h-[5px]" style={{ transform: `translate(-50%, -50%) translateZ(${translateZ}px) rotateX(-20deg) scale(${scale})`, transformStyle: 'preserve-3d' }}>
      {/* Plate */}
      {!hidePlate && (
        <div className="absolute top-3 left-3 right-3 h-[120px]" style={{ transformStyle: 'preserve-3d' }}>
          <svg width="336" height="120" viewBox="0 0 336 120" className="absolute inset-0 pointer-events-none">
            <defs>
              <linearGradient id={`plateGrad-${colorScheme}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colorScheme === 'pink' ? 'rgba(249, 168, 212, 0.4)' : 'rgba(229, 231, 235, 0.4)'} />
                <stop offset="100%" stopColor={colorScheme === 'pink' ? 'rgba(249, 168, 212, 0.6)' : 'rgba(229, 231, 235, 0.5)'} />
              </linearGradient>
            </defs>
            <polygon
              points="13.5,0.5 322.5,0.5 335.5,119.5 0.5,119.5"
              fill={`url(#plateGrad-${colorScheme})`}
              stroke={colorScheme === 'pink' ? '#f472b6' : '#9ca3af'}
              strokeWidth="1"
            />
          </svg>
        </div>
      )}

      {/* Central cube and vertical line */}
      {!hideCube && (
        <div className="absolute top-[80px] left-1/2" style={{ transform: 'translate(-50%, -50%)', transformStyle: 'preserve-3d' }}>
          {/* Fake 2D Cube (Isometric SVG) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transformOrigin: 'center', transform: 'translateZ(-8px) rotateX(-79deg) scale(.9)' }}>
            <svg width="22" height="22" viewBox="0 0 28 28" className="overflow-visible">
              {/* Top Face (Trapezoid) */}
              <polygon points="3,1 19,1 21,6 1,6" fill={colors.cubeFillTop} stroke={colors.cubeStroke} strokeWidth="1.5" strokeLinejoin="round" />
              {/* Front Face (Square) */}
              <rect x="1" y="6" width="20" height="20" fill={colors.cubeFillFront} stroke={colors.cubeStroke} strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}

      {/* Parser Slit (Extracting style banner) */}
      {!hideSlit && (
        <div className={`absolute flex items-center px-3 ${resolvedSlitColors.slitBg} border ${resolvedSlitColors.slitBorder}`} style={{ top: '150px', left: '16px', right: '16px', height: '16px', transformOrigin: 'top', transform: 'rotateX(-60deg)', justifyContent: customContent ? 'space-between' : 'center', ...slitStyle }}>
          {customContent ? customContent : (
            <div className={`font-mono text-[10px] font-medium ${resolvedSlitColors.slitText}`}>
              [{label}]
            </div>
          )}
        </div>
      )}

      {/* Dashed Bounding Box & Pluses */}
      {(() => {
        const boundingBoxAndPluses = (
          <>
            {!hideDashes && (
              <>
                <div className="absolute top-[5px] left-[28px] right-[28px] h-[1.5px] pointer-events-none" style={{ transform: 'translateZ(-0.1px)', backgroundImage: `repeating-linear-gradient(to right, ${colors.dashTop} 0, ${colors.dashTop} 4px, transparent 4px, transparent 8px)` }}></div>
                <div className="absolute top-[140px] left-[15px] right-[15px] h-[1.5px] pointer-events-none" style={{ transform: 'translateZ(-0.1px)', backgroundImage: `repeating-linear-gradient(to right, ${colors.dashBottom} 0, ${colors.dashBottom} 4px, transparent 4px, transparent 8px)` }}></div>
                <div className="absolute top-[25px] left-[17.2px] w-[1.5px] h-[96px] pointer-events-none" style={{ transformOrigin: 'top left', transform: 'translateZ(-0.1px) rotateZ(5.67deg)', backgroundImage: `repeating-linear-gradient(to bottom, ${colors.dashBottom} 0, ${colors.dashBottom} 8px, transparent 8px, transparent 14px)` }}></div>
                <div className="absolute top-[25px] right-[17.2px] w-[1.5px] h-[96px] pointer-events-none" style={{ transformOrigin: 'top right', transform: 'translateZ(-0.1px) rotateZ(-5.67deg)', backgroundImage: `repeating-linear-gradient(to bottom, ${colors.dashBottom} 0, ${colors.dashBottom} 8px, transparent 8px, transparent 14px)` }}></div>
              </>
            )}
            {!hidePluses && (
              <>
                <div className={`absolute top-[-6px] left-[11.5px] ${colors.plusText} font-mono text-[16px] leading-none pointer-events-none`} style={{ transformOrigin: 'center', transform: 'rotateX(-69deg)' }}>+</div>
                <div className={`absolute top-[-6px] right-[11.5px] ${colors.plusText} font-mono text-[16px] leading-none pointer-events-none`} style={{ transformOrigin: 'center', transform: 'rotateX(-69deg)' }}>+</div>
                <div className={`absolute top-[130.5px] left-[3px] ${colors.plusText} font-mono text-[16px] leading-none pointer-events-none`} style={{ transformOrigin: 'center', transform: 'rotateX(-69deg)' }}>+</div>
                <div className={`absolute top-[130.5px] right-[3px] ${colors.plusText} font-mono text-[16px] leading-none pointer-events-none`} style={{ transformOrigin: 'center', transform: 'rotateX(-69deg)' }}>+</div>
              </>
            )}
          </>
        );

        return (
          <>
            {boundingBoxAndPluses}
            {floorThickness && floorThickness > 0 && (
              <div style={{ transform: `rotateX(20deg) translateZ(-${floorThickness}px) rotateX(-20deg) scale(${bottomScale})`, transformStyle: 'preserve-3d' }} className="absolute inset-0 pointer-events-none">
                {boundingBoxAndPluses}
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
};



function DecodeText({ value, trigger, duration = 900, delay = 0, className = '' }: { value: string; trigger: boolean; duration?: number; delay?: number; className?: string }) {
  const [resolvedCount, setResolvedCount] = useState(trigger ? 0 : value.length);
  const [scrambledTail, setScrambledTail] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (trigger) {
      hasTriggeredRef.current = true;
    }
    if (!trigger && !hasTriggeredRef.current) {
      setResolvedCount(value.length);
      setScrambledTail('');
      return;
    }
    if (!trigger && hasTriggeredRef.current) {
      return; // Stay decoded once triggered!
    }

    const chars = value.split('');
    setResolvedCount(0);

    const generateTail = (fromIdx: number) => {
      const remaining = chars.slice(fromIdx);
      const totalRem = remaining.length;
      return remaining.map((ch, idx) => {
        if (ch === ' ' || ch === '\t') return ch;
        // Gradient pixel effect: textured blocks near resolved text, dissolving to light dots at the tail
        const ratio = idx / Math.max(1, totalRem);
        if (ratio < 0.35) return ['▓', '▒', '▓'][Math.floor(Math.random() * 3)];
        if (ratio < 0.70) return ['▒', '░', '▒'][Math.floor(Math.random() * 3)];
        return ['░', '·', '░', '·'][Math.floor(Math.random() * 4)];
      }).join('');
    };

    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed < delay) {
        setResolvedCount(0);
        setScrambledTail(generateTail(0));
      } else if (elapsed < delay + duration) {
        const progress = (elapsed - delay) / duration;
        const count = Math.min(value.length, Math.floor(progress * value.length));
        setResolvedCount(count);
        setScrambledTail(generateTail(count));
      } else {
        setResolvedCount(value.length);
        setScrambledTail('');
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    };

    tick();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, 15); // 15ms (~66 FPS) for ultra-fast, live static pixel glitching

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [value, trigger, duration, delay]);

  const resolvedText = value.slice(0, resolvedCount);

  return (
    <span className={className}>
      {resolvedText}
      {scrambledTail && (
        <span className="text-[#ff70a9] font-mono font-bold select-none tracking-tighter opacity-100 drop-shadow-[0_0_8px_rgba(255,77,148,0.8)]">
          {scrambledTail}
        </span>
      )}
    </span>
  );
}

export default function DocWorkflow() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [row1Visible, setRow1Visible] = useState(false);
  const [row3Visible, setRow3Visible] = useState(false);
  const [lineProgress, setLineProgress] = useState(0);

  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const row3Ref = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const grayLineRef = useRef<HTMLDivElement>(null);
  const grayCubeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (row1Ref.current) {
        const rect = row1Ref.current.getBoundingClientRect();
        const startY = 260; // Start growing as Figure 1 comes into view
        const endY = -280;
        let prog = (startY - rect.top) / (startY - endY);
        prog = Math.max(0, Math.min(1, prog));

        if (lineRef.current) {
          lineRef.current.style.height = `${(Math.min(549, prog * 570)).toFixed(1)}px`;
          lineRef.current.style.opacity = prog > 0.005 ? '1' : '0';
        }
        if (cubeRef.current) {
          let cubeOpacity = Math.max(0, Math.min(1, (prog - 0.18) / 0.08));
          let scaleVal = 0.85 + Math.pow(1 - prog, 1.5) * 0.35;
          if (prog > 0.96) {
            cubeOpacity = Math.min(cubeOpacity, Math.max(0, (1.0 - prog) / 0.04));
            scaleVal = Math.max(0, 0.85 * (1 - (prog - 0.96) / 0.04));
          }
          cubeRef.current.style.opacity = cubeOpacity.toFixed(2);
          cubeRef.current.style.transform = `scale(${scaleVal.toFixed(3)})`;
        }
      }

      if (row2Ref.current) {
        const rect2 = row2Ref.current.getBoundingClientRect();
        const startY2 = 280; // Start growing as Figure 2 comes into view
        const endY2 = -260;
        let prog2 = (startY2 - rect2.top) / (startY2 - endY2);
        prog2 = Math.max(0, Math.min(1, prog2));

        if (grayLineRef.current) {
          grayLineRef.current.style.height = `${(Math.min(444, prog2 * 462)).toFixed(1)}px`;
          grayLineRef.current.style.opacity = prog2 > 0.005 ? '1' : '0';
        }
        if (grayCubeRef.current) {
          let grayCubeOpacity = Math.max(0, Math.min(1, (prog2 - 0.18) / 0.08));
          let scaleVal2 = 1.30 + Math.pow(1 - prog2, 1.5) * 0.35;
          if (prog2 > 0.96) {
            grayCubeOpacity = Math.min(grayCubeOpacity, Math.max(0, (1.0 - prog2) / 0.04));
            scaleVal2 = Math.max(0, 1.30 * (1 - (prog2 - 0.96) / 0.04));
          }
          grayCubeRef.current.style.opacity = grayCubeOpacity.toFixed(2);
          grayCubeRef.current.style.transform = `scale(${scaleVal2.toFixed(3)})`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === row1Ref.current) setActiveIndex(0);
            if (entry.target === row2Ref.current) setActiveIndex(1);
            if (entry.target === row3Ref.current) setActiveIndex(2);
          }
        });
      },
      { rootMargin: '-30% 0px -50% 0px', threshold: 0 }
    );

    const visObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === row1Ref.current) {
            setRow1Visible(entry.isIntersecting);
          }
          if (entry.target === row3Ref.current) {
            if (entry.isIntersecting) {
              setRow3Visible(true);
            }
          }
        });
      },
      { threshold: 0.15 } // Trigger when 15% visible to avoid disappearing on smaller screens
    );

    if (row1Ref.current) {
      observer.observe(row1Ref.current);
      visObserver.observe(row1Ref.current);
    }
    if (row2Ref.current) observer.observe(row2Ref.current);
    if (row3Ref.current) {
      observer.observe(row3Ref.current);
      visObserver.observe(row3Ref.current);
    }

    return () => {
      observer.disconnect();
      visObserver.disconnect();
    };
  }, []);

  const getCardStyle = (baseTransform: string, index: number) => ({
    opacity: row1Visible ? 1 : 0,
    transform: baseTransform,
    transition: row1Visible ? `opacity 0.3s ease-in-out ${index * 0.2}s` : 'none',
    transformStyle: 'preserve-3d' as const
  });

  const getContentStyle = (index: number) => ({
    clipPath: row1Visible ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)',
    transition: row1Visible ? `clip-path 1.0s ease-out ${(index * 0.2) + 0.3}s` : 'none'
  });


  return (
    <section className="bg-white font-sans">
      <div className="max-w-[1300px] mx-auto pt-14 pb-0 border-x border-b border-gray-200">

        {/* Header */}
        <div className="px-8 md:px-12 py-12 md:pb-8 text-left max-w-4xl">
          <div className="font-mono text-[14px] uppercase tracking-wider text-[#5c5c5c] mb-8">
            [ WORKFLOW ]
          </div>
          <h2 className="text-[40px] md:text-[48px] xl:text-[48px] leading-[1.05] font-medium tracking-tight text-[#111] max-w-2xl">
            From raw document to<br />LLM-ready data.
          </h2>
        </div>

        {/* 2-Column Index & Graphics Layout */}
        <div className="px-8 md:px-12 grid grid-cols-1 md:grid-cols-[1.2fr_1.3fr] gap-12 md:gap-12 mt-8">

          {/* Left Column (Index Container) */}
          <div className="border-r border-gray-200/60 pr-8 md:pr-12">
            <div className="md:sticky top-[52px] pt-2 overflow-visible z-10">
              <div className="flex flex-col gap-1">
                <h3 className={`text-[28px] font-medium tracking-tight transition-colors duration-500 ${activeIndex === 0 ? 'text-[#111]' : 'text-gray-300'}`}>
                  Connect any source.
                </h3>
                <h3 className={`text-[28px] font-medium tracking-tight transition-colors duration-500 ${activeIndex === 1 ? 'text-[#111]' : 'text-gray-300'}`}>
                  Run parse, extract, or split.
                </h3>
                <h3 className={`text-[28px] font-medium tracking-tight transition-colors duration-500 ${activeIndex === 2 ? 'text-[#111]' : 'text-gray-300'}`}>
                  Ship to production.
                </h3>
              </div>
            </div>
          </div>

          {/* Right Column (Graphics Display) */}
          <div className="flex flex-col w-full relative z-20">

            {/* --- ROW 1 --- */}
            <div ref={row1Ref} className="relative z-[30] flex flex-col gap-22 mb-44">
              <p className="text-[14px] text-gray-500 leading-relaxed max-w-md pt-3 relative z-10">
                S3, SharePoint, Drive, Snowflake, your DMS. We sit on top of where your data already lives.
              </p>

              {/* Graphic 1: Scattered Documents */}
              <div className="relative w-full aspect-square md:aspect-[4/3] flex items-center justify-center perspective-[2400px] -mt-16">
                <div className="transform scale-[0.45] sm:scale-[0.55] md:scale-[0.70] origin-center flex justify-center items-center">
                  <div
                    className="relative w-[380px] h-[480px] md:w-[420px] md:h-[540px]"
                    style={{ transform: 'rotateX(49deg) rotateY(-2deg) rotateZ(-42deg) skewX(4deg)', transformStyle: 'preserve-3d' }}
                  >
                  {/* Card 6 (Z=-20): Generic (Top Right) */}
                  <div
                    className="absolute top-1/2 left-1/4 bg-gradient-to-b from-gray-50 to-white border border-gray-600 flex flex-col p-6"
                    style={{ width: '340px', height: '500px', ...getCardStyle('translate(-50%, -50%) translateZ(-20px) translate(40px, -40px)', 0) }}
                  >
                    <div className="absolute top-1 left-2 text-gray-400 font-mono text-xl">+</div><div className="absolute top-1 right-2 text-gray-400 font-mono text-xl">+</div>
                    <div className="absolute bottom-1 left-2 text-gray-400 font-mono text-xl">+</div><div className="absolute bottom-1 right-2 text-gray-400 font-mono text-xl">+</div>
                    <div className="absolute top-[22px] bottom-[22px] left-[14.5px] w-[1.5px] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, #d1d5db 50%, transparent 50%)', backgroundSize: '100% 14px' }}></div>
                    <div className="absolute top-[22px] bottom-[22px] right-[14.5px] w-[1.5px] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, #d1d5db 50%, transparent 50%)', backgroundSize: '100% 14px' }}></div>
                    <div className="flex-1 flex flex-col relative w-full h-full">
                      <div style={getContentStyle(0)}>
                        <div className="font-bold text-gray-800 text-xs mb-1">Annual Revenue</div>
                        <div className="text-[9px] text-gray-400 mb-4 border-b border-gray-100 pb-2">Fiscal Year 2024 Performance metrics.</div>
                      </div>

                      {/* Bar Chart */}
                      <div className="w-full flex-1 relative flex items-end justify-between px-2 gap-2 mt-2">
                        <div className="w-full bg-gray-200 rounded-t-sm" style={{ height: '40%' }}></div>
                        <div className="w-full bg-gray-300 rounded-t-sm" style={{ height: '65%' }}></div>
                        <div className="w-full bg-gray-400 rounded-t-sm" style={{ height: '30%' }}></div>
                        <div className="w-full bg-gray-300 rounded-t-sm" style={{ height: '80%' }}></div>
                        <div className="w-full bg-gray-400 rounded-t-sm" style={{ height: '55%' }}></div>
                        <div className="w-full bg-gray-200 rounded-t-sm" style={{ height: '90%' }}></div>
                        <div className="w-full bg-gray-500 rounded-t-sm" style={{ height: '45%' }}></div>
                      </div>

                      {/* Summary Text */}
                      <div style={getContentStyle(0)} className="mt-6 flex flex-col gap-1 text-[8px] text-gray-500">
                        <div className="font-semibold text-gray-700 mb-1">Key Highlights</div>
                        <div>• Q3 saw highest YoY growth at 24%</div>
                        <div>• Cloud services remain top revenue driver</div>
                        <div>• Operational costs decreased by 4.2%</div>
                      </div>
                    </div>
                  </div>

                  {/* Card 5 (Z=10): Audit Log */}
                  <div
                    className="absolute top-1/2 left-1/2 bg-gradient-to-b from-gray-50 to-white border border-gray-600 flex flex-col p-6"
                    style={{ width: '380px', height: '470px', ...getCardStyle('translate(-50%, -50%) translateZ(-10px) translate(90px, -75px)', 1) }}
                  >
                    <div className="absolute top-1 left-2 text-gray-400 font-mono text-xl">+</div><div className="absolute top-1 right-2 text-gray-400 font-mono text-xl">+</div>
                    <div className="absolute bottom-1 left-2 text-gray-400 font-mono text-xl">+</div><div className="absolute bottom-1 right-2 text-gray-400 font-mono text-xl">+</div>
                    <div className="absolute top-[22px] bottom-[22px] left-[14.5px] w-[1.5px] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, #d1d5db 50%, transparent 50%)', backgroundSize: '100% 14px' }}></div>
                    <div className="absolute top-[22px] bottom-[22px] right-[14.5px] w-[1.5px] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, #d1d5db 50%, transparent 50%)', backgroundSize: '100% 14px' }}></div>
                    <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
                      <div style={getContentStyle(1)} className="font-bold text-gray-900 text-xs tracking-tight mb-3 uppercase border-b border-gray-200 pb-2">System Audit Log</div>
                      <div className="flex-1 overflow-hidden font-mono text-[5px] leading-[6px] text-gray-500 space-y-1">
                        {[...Array(40)].map((_, i) => (
                          <div key={i} className="flex gap-2 whitespace-nowrap">
                            <span className="text-gray-400 opacity-60">0{i % 10}:{10 + i}:2{i % 9}</span>
                            <span className={i % 3 === 0 ? 'text-gray-700' : 'text-gray-400'}>
                              [SYS.0x00{i}FA92] {i % 2 === 0 ? 'Executing trace dump' : 'Validating token payload'} ... {i % 4 === 0 ? 'OK' : 'PASS'}
                              {i % 5 === 0 ? ' -> Connection established. Routing metric...' : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 4 (Z=0): Generic (Top Left) */}
                  <div
                    className="absolute top-1/2 left-1/2 bg-gradient-to-b from-gray-50 to-white border border-gray-600 flex flex-col p-6"
                    style={{ width: '380px', height: '560px', ...getCardStyle('translate(-50%, -50%) translateZ(0px) translate(140px, -180px)', 2) }}
                  >
                    <div className="absolute top-1 left-2 text-gray-400 font-mono text-xl">+</div><div className="absolute top-1 right-2 text-gray-400 font-mono text-xl">+</div>
                    <div className="absolute bottom-1 left-2 text-gray-400 font-mono text-xl">+</div><div className="absolute bottom-1 right-2 text-gray-400 font-mono text-xl">+</div>
                    <div className="absolute top-[22px] bottom-[22px] left-[14.5px] w-[1.5px] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, #d1d5db 50%, transparent 50%)', backgroundSize: '100% 14px' }}></div>
                    <div className="absolute top-[22px] bottom-[22px] right-[14.5px] w-[1.5px] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, #d1d5db 50%, transparent 50%)', backgroundSize: '100% 14px' }}></div>
                    <div style={getContentStyle(2)} className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
                      <div className="font-bold text-gray-900 text-xs tracking-tight mb-3 uppercase border-b border-gray-200 pb-2">Privacy & Terms Addendum</div>
                      <div className="flex-1 overflow-hidden" style={{ columnCount: 2, columnGap: '1rem' }}>
                        <div className="text-[6px] leading-[9px] text-gray-500 text-justify space-y-2 opacity-80">
                          <p><strong>1.1 OVERVIEW.</strong> This Addendum ("Addendum") forms a part of the Master Service Agreement (the "Agreement") by and between the Customer and Provider. The purpose of this Addendum is to reflect the parties' agreement with regard to the processing of Personal Data in accordance with the requirements of Data Protection Laws and Regulations.</p>
                          <p><strong>1.2 DEFINITIONS.</strong> "Personal Data" means any information relating to an identified or identifiable natural person; an identifiable natural person is one who can be identified, directly or indirectly, in particular by reference to an identifier such as a name, an identification number, location data, an online identifier or to one or more factors specific to the physical, physiological, genetic, mental, economic, cultural or social identity of that natural person. "Processing" means any operation or set of operations which is performed on Personal Data or on sets of Personal Data, whether or not by automated means, such as collection, recording, organization, structuring, storage, adaptation or alteration, retrieval, consultation, use, disclosure by transmission, dissemination or otherwise making available, alignment or combination, restriction, erasure or destruction.</p>
                          <p><strong>2.1 SCOPE.</strong> This Addendum applies where and only to the extent that Provider processes Personal Data on behalf of the Customer in the course of providing the Services and such Personal Data is subject to Data Protection Laws of the European Union, the European Economic Area and/or their member states, Switzerland and/or the United Kingdom.</p>
                          <p><strong>3.1 OBLIGATIONS.</strong> Provider shall process Personal Data only on documented instructions from Customer, unless required to do so by applicable law to which Provider is subject. In such a case, Provider shall inform Customer of that legal requirement before processing, unless that law prohibits such information on important grounds of public interest. Provider shall ensure that persons authorized to process the Personal Data have committed themselves to confidentiality or are under an appropriate statutory obligation of confidentiality.</p>
                          <p><strong>4.1 SECURITY.</strong> Taking into account the state of the art, the costs of implementation and the nature, scope, context and purposes of processing as well as the risk of varying likelihood and severity for the rights and freedoms of natural persons, Provider shall implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including inter alia as appropriate: (a) the pseudonymization and encryption of Personal Data; (b) the ability to ensure the ongoing confidentiality, integrity, availability and resilience of processing systems and services; (c) the ability to restore the availability and access to Personal Data in a timely manner in the event of a physical or technical incident.</p>
                          <p><strong>5.1 SUBPROCESSORS.</strong> Customer acknowledges and agrees that Provider may engage third-party Subprocessors in connection with the provision of the Services. Provider shall enter into a written agreement with each Subprocessor containing data protection obligations not less protective than those in this Agreement with respect to the protection of Customer Data to the extent applicable to the nature of the Services provided by such Subprocessor.</p>
                          <p><strong>6.1 DATA SUBJECT RIGHTS.</strong> Provider shall, to the extent legally permitted, promptly notify Customer if Provider receives a request from a Data Subject to exercise the Data Subject's right of access, right to rectification, restriction of Processing, erasure ("right to be forgotten"), data portability, object to the Processing, or its right not to be subject to an automated individual decision making, each such request being a "Data Subject Request". Taking into account the nature of the Processing, Provider shall assist Customer by appropriate technical and organizational measures, insofar as this is possible, for the fulfilment of Customer's obligation to respond to a Data Subject Request under Data Protection Laws and Regulations.</p>
                          <p><strong>7.1 AUDITS.</strong> Provider shall make available to Customer all information necessary to demonstrate compliance with the obligations laid down in this Addendum and allow for and contribute to audits, including inspections, conducted by Customer or another auditor mandated by Customer.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3 (Z=20): Data Table (Bottom Right) */}
                  <div
                    className="absolute top-1/2 left-1/2 bg-gradient-to-b from-gray-50 to-white border border-gray-600 flex flex-col p-6"
                    style={{ width: '360px', height: '520px', ...getCardStyle('translate(-50%, -50%) translateZ(10px) translate(40px, 10px)', 3) }}
                  >
                    <div className="absolute top-1 left-2 text-gray-400 font-mono text-xl">+</div><div className="absolute top-1 right-2 text-gray-400 font-mono text-xl">+</div>
                    <div className="absolute bottom-1 left-2 text-gray-400 font-mono text-xl">+</div><div className="absolute bottom-1 right-2 text-gray-400 font-mono text-xl">+</div>
                    <div className="absolute top-[22px] bottom-[22px] left-[14.5px] w-[1.5px] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, #d1d5db 50%, transparent 50%)', backgroundSize: '100% 14px' }}></div>
                    <div className="absolute top-[22px] bottom-[22px] right-[14.5px] w-[1.5px] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, #d1d5db 50%, transparent 50%)', backgroundSize: '100% 14px' }}></div>
                    <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
                      <div style={getContentStyle(3)}>
                        <div className="font-bold text-gray-800 text-xs mb-1">User Growth</div>
                        <div className="text-[9px] text-gray-400 mb-4 border-b border-gray-100 pb-2">Active user metrics Q1-Q4.</div>
                      </div>

                      {/* Bar Graph */}
                      <div className="w-full h-[60px] relative flex items-end justify-between px-4 gap-3 mt-2 border-b border-gray-200 pb-1">
                        <div className="w-full bg-gray-200 flex flex-col justify-end rounded-t-sm" style={{ height: '30%' }}><span className="text-[6px] text-center mb-1 text-gray-600">3k</span></div>
                        <div className="w-full bg-gray-300 flex flex-col justify-end rounded-t-sm" style={{ height: '45%' }}><span className="text-[6px] text-center mb-1 text-gray-700">4.5k</span></div>
                        <div className="w-full bg-gray-400 flex flex-col justify-end rounded-t-sm" style={{ height: '60%' }}><span className="text-[6px] text-center mb-1 text-gray-800">6k</span></div>
                        <div className="w-full bg-gray-500 flex flex-col justify-end rounded-t-sm" style={{ height: '85%' }}><span className="text-[6px] text-center mb-1 text-white">8.5k</span></div>
                      </div>
                      <div className="w-full flex justify-between px-4 mt-1 text-[6px] text-gray-400 mb-4">
                        <span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span>
                      </div>

                      {/* Summary Paragraph */}
                      <div style={getContentStyle(3)} className="text-[7px] leading-relaxed text-gray-500 text-justify mb-4">
                        The current fiscal year demonstrates consistent upward momentum across all primary demographics.
                        User retention rates have stabilized following the Q2 platform migration, leading to compounding
                        DAU increases in North America and Asia Pacific.
                      </div>

                      {/* Table */}
                      <div className="w-full flex-1 overflow-hidden flex flex-col">
                        <div className="flex justify-between border-b border-gray-300 pb-1 mb-2 text-[7px] font-bold text-gray-600">
                          <div className="w-1/3">Region / Country</div>
                          <div className="w-1/3 text-right">Active Users</div>
                          <div className="w-1/3 text-right">Growth (YoY)</div>
                        </div>
                        <div className="flex-1 flex flex-col gap-[3px]">
                          {[
                            ['North America', '12,450', '+14.2%'],
                            ['Europe (West)', '8,230', '+8.1%'],
                            ['Asia Pacific', '15,800', '+22.4%'],
                            ['Latin America', '3,100', '+2.5%'],
                            ['Middle East', '4,520', '+18.7%'],
                            ['Africa (Sub)', '1,890', '+34.2%'],
                            ['Scandinavia', '2,450', '+4.1%'],
                            ['Eastern Europe', '3,780', '+11.8%'],
                            ['South Asia', '18,900', '+28.5%'],
                            ['Southeast Asia', '11,240', '+24.3%'],
                            ['Oceania', '1,950', '+5.6%'],
                            ['Central America', '1,420', '+7.9%'],
                            ['Caribbean', '850', '+3.2%'],
                            ['East Asia', '22,400', '+15.4%'],
                            ['Central Asia', '1,100', '+19.8%'],
                            ['North Africa', '2,100', '+21.5%'],
                            ['Global Roaming', '5,600', '+42.1%'],
                          ].map((row, i) => (
                            <div key={i} className="flex justify-between border-b border-gray-100 pb-[2px] text-[7px] text-gray-500">
                              <div className="w-1/3 font-medium text-gray-600 truncate pr-2">{row[0]}</div>
                              <div className="w-1/3 text-right font-mono">{row[1]}</div>
                              <div className="w-1/3 text-right font-mono text-gray-700">{row[2]}</div>
                            </div>
                          ))}
                        </div>
                      </div>


                    </div>

                  </div>

                  {/* Card 2.1 (Z=20): Data Table (Bottom Right) */}
                  <div
                    className="absolute top-1/2 left-1/2 bg-gradient-to-b from-gray-50 to-white border border-gray-600 flex flex-col p-6"
                    style={{ width: '340px', height: '200px', ...getCardStyle('translate(-50%, -50%) translateZ(20px) translate(-40px, -300px)', 4) }}
                  >
                    <div className="absolute top-1 left-2 text-gray-400 font-mono text-xl">+</div><div className="absolute top-1 right-2 text-gray-400 font-mono text-xl">+</div>
                    <div className="absolute bottom-1 left-2 text-gray-400 font-mono text-xl">+</div><div className="absolute bottom-1 right-2 text-gray-400 font-mono text-xl">+</div>
                    <div className="absolute top-[22px] bottom-[22px] left-[14.5px] w-[1.5px] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, #d1d5db 50%, transparent 50%)', backgroundSize: '100% 14px' }}></div>
                    <div className="absolute top-[22px] bottom-[22px] right-[14.5px] w-[1.5px] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, #d1d5db 50%, transparent 50%)', backgroundSize: '100% 14px' }}></div>
                    <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
                      <div className="w-full h-full flex flex-col">
                        <div style={getContentStyle(4)} className="font-bold text-gray-800 text-[8px] mb-2 border-b border-gray-200 pb-1 uppercase tracking-wider">Transaction Ledger</div>
                        <div className="flex justify-between border-b border-gray-300 pb-1 mb-1 text-[6px] font-bold text-gray-600">
                          <div className="w-1/5">ID</div>
                          <div className="w-1/5">Date</div>
                          <div className="w-1/5 text-right">Amount</div>
                          <div className="w-1/5 text-right">Status</div>
                          <div className="w-1/5 text-right">Hash</div>
                        </div>
                        <div className="flex-1 overflow-hidden flex flex-col gap-[3px]">
                          {[
                            ['TX-9901', '12/01', '$1,402.50', 'Cleared', '0x8f...2a1'],
                            ['TX-9902', '12/02', '$890.00', 'Pending', '0x2c...4b9'],
                            ['TX-9903', '12/02', '$12,450.00', 'Cleared', '0x9a...7c3'],
                            ['TX-9904', '12/03', '$45.00', 'Failed', '0x1e...8d4'],
                            ['TX-9905', '12/05', '$3,200.75', 'Cleared', '0x5f...9e5'],
                            ['TX-9906', '12/06', '$150.25', 'Cleared', '0x3b...1f6'],
                          ].map((row, i) => (
                            <div key={i} className="flex justify-between border-b border-gray-100 pb-[2px] text-[6px] text-gray-500">
                              <div className="w-1/5 font-mono">{row[0]}</div>
                              <div className="w-1/5">{row[1]}</div>
                              <div className="w-1/5 text-right font-medium">{row[2]}</div>
                              <div className="w-1/5 text-right">{row[3]}</div>
                              <div className="w-1/5 text-right font-mono opacity-60">{row[4]}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2.2 (Z=45): Generic (Bottom Right Peek) */}
                  <div
                    className="absolute top-1/2 left-1/2 bg-gradient-to-b from-gray-50 to-white border border-gray-600 flex flex-col p-6"
                    style={{ width: '320px', height: '260px', ...getCardStyle('translate(-50%, -50%) translateZ(20px) translate(-200px, 40px)', 5) }}
                  >
                    <div className="absolute top-1 left-2 text-gray-400 font-mono text-xl">+</div><div className="absolute top-1 right-2 text-gray-400 font-mono text-xl">+</div>
                    <div className="absolute bottom-1 left-2 text-gray-400 font-mono text-xl">+</div><div className="absolute bottom-1 right-2 text-gray-400 font-mono text-xl">+</div>
                    <div className="absolute top-[22px] bottom-[22px] left-[14.5px] w-[1.5px] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, #d1d5db 50%, transparent 50%)', backgroundSize: '100% 14px' }}></div>
                    <div className="absolute top-[22px] bottom-[22px] right-[14.5px] w-[1.5px] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, #d1d5db 50%, transparent 50%)', backgroundSize: '100% 14px' }}></div>
                    <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
                      <div style={getContentStyle(5)}>
                        {/* Header */}
                        <div className="flex justify-between items-end mb-2">
                          <div className="font-bold text-gray-800 text-[8px]">Morgan Stanley</div>
                          <div className="text-gray-400 text-[5px] font-medium tracking-wide uppercase">Market Research</div>
                        </div>

                        {/* Title */}
                        <div className="text-[5px] text-gray-500 font-bold mb-1 uppercase">Key Trends:</div>
                        <div className="text-[6px] font-bold text-gray-700 leading-tight mb-2">
                          Global sportswear brand peers inventories and wholesale channel inventories have turned healthier since the peak in mid-2022
                        </div>

                        {/* Legend */}
                        <div className="flex justify-end gap-3 mb-1 pr-2">
                          <div className="flex items-center gap-1">
                            <div className="w-[6px] h-[6px] bg-gray-300 border border-gray-400"></div>
                            <span className="text-[4px] text-gray-500">Brands</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-[6px] h-[6px] bg-gray-200 border border-gray-300"></div>
                            <span className="text-[4px] text-gray-500">Wholesale</span>
                          </div>
                        </div>

                      </div>
                      {/* Big Area Chart */}
                      <div className="flex-1 w-full relative">
                        <svg className="absolute inset-0 w-full h-full block" preserveAspectRatio="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                          {/* Grid lines (horizontal) */}
                          <line x1="12" y1="20" x2="100" y2="20" stroke="#f3f4f6" strokeWidth={0.5} />
                          <line x1="12" y1="40" x2="100" y2="40" stroke="#f3f4f6" strokeWidth={0.5} />
                          <line x1="12" y1="60" x2="100" y2="60" stroke="#f3f4f6" strokeWidth={0.5} />
                          <line x1="12" y1="80" x2="100" y2="80" stroke="#f3f4f6" strokeWidth={0.5} />

                          {/* Y-axis Labels */}
                          <text x="0" y="21" fontSize="4" fill="#9ca3af">30,000</text>
                          <text x="0" y="41" fontSize="4" fill="#9ca3af">25,000</text>
                          <text x="0" y="61" fontSize="4" fill="#9ca3af">20,000</text>
                          <text x="0" y="81" fontSize="4" fill="#9ca3af">15,000</text>

                          {/* Series 1 Area */}
                          <path d="M15,80 L30,60 L45,55 L60,30 L75,35 L90,25 L100,40 L100,90 L15,90 Z" fill="#e5e7eb" opacity="0.8" />
                          {/* Series 1 Line */}
                          <path d="M15,80 L30,60 L45,55 L60,30 L75,35 L90,25 L100,40" fill="none" stroke="#9ca3af" strokeWidth={1} />

                          {/* Series 1 Dots */}
                          <circle cx="15" cy="80" r="1" fill="#fff" stroke="#9ca3af" strokeWidth={0.5} />
                          <circle cx="30" cy="60" r="1" fill="#fff" stroke="#9ca3af" strokeWidth={0.5} />
                          <circle cx="45" cy="55" r="1" fill="#fff" stroke="#9ca3af" strokeWidth={0.5} />
                          <circle cx="60" cy="30" r="1" fill="#fff" stroke="#9ca3af" strokeWidth={0.5} />
                          <circle cx="75" cy="35" r="1" fill="#fff" stroke="#9ca3af" strokeWidth={0.5} />
                          <circle cx="90" cy="25" r="1" fill="#fff" stroke="#9ca3af" strokeWidth={0.5} />
                          <circle cx="100" cy="40" r="1" fill="#fff" stroke="#9ca3af" strokeWidth={0.5} />

                          {/* Series 2 Area */}
                          <path d="M15,85 L30,70 L45,65 L60,45 L75,40 L90,35 L100,50 L100,90 L15,90 Z" fill="#d1d5db" fillOpacity={0.6} />
                          {/* Series 2 Line */}
                          <path d="M15,85 L30,70 L45,65 L60,45 L75,40 L90,35 L100,50" fill="none" stroke="#6b7280" strokeWidth={0.5} />

                          {/* Series 2 Dots */}
                          <circle cx="15" cy="85" r="0.8" fill="#fff" stroke="#6b7280" strokeWidth={0.3} />
                          <circle cx="30" cy="70" r="0.8" fill="#fff" stroke="#6b7280" strokeWidth={0.3} />
                          <circle cx="45" cy="65" r="0.8" fill="#fff" stroke="#6b7280" strokeWidth={0.3} />
                          <circle cx="60" cy="45" r="0.8" fill="#fff" stroke="#6b7280" strokeWidth={0.3} />
                          <circle cx="75" cy="40" r="0.8" fill="#fff" stroke="#6b7280" strokeWidth={0.3} />
                          <circle cx="90" cy="35" r="0.8" fill="#fff" stroke="#6b7280" strokeWidth={0.3} />
                          <circle cx="100" cy="50" r="0.8" fill="#fff" stroke="#6b7280" strokeWidth={0.3} />

                          {/* X-axis Line */}
                          <line x1="12" y1="90" x2="100" y2="90" stroke="#9ca3af" strokeWidth={0.5} />

                          {/* X-axis Labels */}
                          <text x="15" y="96" fontSize="4" fill="#9ca3af" textAnchor="middle">2018</text>
                          <text x="30" y="96" fontSize="4" fill="#9ca3af" textAnchor="middle">2019</text>
                          <text x="45" y="96" fontSize="4" fill="#9ca3af" textAnchor="middle">2020</text>
                          <text x="60" y="96" fontSize="4" fill="#9ca3af" textAnchor="middle">2021</text>
                          <text x="75" y="96" fontSize="4" fill="#9ca3af" textAnchor="middle">2022</text>
                          <text x="90" y="96" fontSize="4" fill="#9ca3af" textAnchor="middle">2023</text>
                          <text x="100" y="96" fontSize="4" fill="#9ca3af" textAnchor="end">2024</text>
                        </svg>
                      </div>

                      <div style={getContentStyle(5)} className="text-[5px] text-gray-400 mt-2 text-center">Source: Company data, Morgan Stanley Research</div>
                    </div>
                  </div>

                  {/* Card 1 (Z=45): Generic (Bottom Right Peek) */}
                  <div
                    className="absolute top-1/2 left-1/2 bg-gradient-to-b from-gray-50 to-white border border-gray-600 flex flex-col p-6"
                    style={{ width: '360px', height: '580px', ...getCardStyle('translate(-50%, -50%) translateZ(25px) translate(190px, -200px)', 6) }}
                  >
                    <div className="absolute top-1 left-2 text-gray-400 font-mono text-xl">+</div><div className="absolute top-1 right-2 text-gray-400 font-mono text-xl">+</div>
                    <div className="absolute bottom-1 left-2 text-gray-400 font-mono text-xl">+</div><div className="absolute bottom-1 right-2 text-gray-400 font-mono text-xl">+</div>
                    <div className="absolute top-[22px] bottom-[22px] left-[14.5px] w-[1.5px] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, #d1d5db 50%, transparent 50%)', backgroundSize: '100% 14px' }}></div>
                    <div className="absolute top-[22px] bottom-[22px] right-[14.5px] w-[1.5px] pointer-events-none" style={{ backgroundImage: 'linear-gradient(to bottom, #d1d5db 50%, transparent 50%)', backgroundSize: '100% 14px' }}></div>
                    {/* Inner Content - Rough Notes */}
                    <div className="flex-1 w-full h-full relative p-2 overflow-visible flex flex-col" style={{ ...getContentStyle(6), fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', cursive", color: '#374151' }}>

                      {/* Date */}
                      <div className="absolute top-0 right-4 text-[10px] tracking-wide" style={{ transform: 'rotate(-2deg)' }}>
                        <span className="border-b-2 border-gray-400 pb-[1px]">DATE: 04/29/2025</span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold mb-2 inline-block border-b-[3px] border-gray-600 pb-1 w-max" style={{ transform: 'rotate(-1deg)' }}>Analysis Notes</h2>

                      <div className="flex flex-col flex-1 gap-[2px] text-[10px] leading-snug pb-1 mt-1 relative">

                        {/* 1. Initial Observation */}
                        <div className="relative">
                          <div className="font-bold text-[12px] mb-[2px] relative inline-block">
                            - Initial observation:
                            {/* Messy underline */}
                            <svg className="absolute -bottom-1 left-0 w-full h-[6px] opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                              <path d="M0,5 Q20,2 40,7 T80,4 T100,6" fill="none" stroke="#4b5563" strokeWidth="1.5" />
                              <path d="M5,7 Q25,3 45,8 T85,5 T95,7" fill="none" stroke="#4b5563" strokeWidth="1" opacity="0.5" />
                            </svg>
                          </div>
                          <ul className="pl-6 space-y-[2px] relative z-10">
                            <li>Abnormal results in phase 2 simulations</li>
                            <li>Unexpected fluctuations in data sets</li>
                            <li className="relative">
                              Possible anomalies linked to variable Y?
                              {/* Frantic circling */}
                              <svg className="absolute -top-1 -left-2 w-[110%] h-[140%] opacity-40 pointer-events-none" viewBox="0 0 100 20" preserveAspectRatio="none">
                                <path d="M10,10 C15,0 85,-5 90,10 C95,25 20,25 15,10 C10,-5 80,0 85,10" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                              </svg>
                            </li>
                            <li>Check calibration of equipment?</li>
                          </ul>

                          {/* Sketchy 3D Cube (Messy) */}
                          <svg className="absolute -top-2 right-10 w-[55px] h-[55px] opacity-60 transform -rotate-3" viewBox="0 0 100 100" fill="none" stroke="#374151" strokeWidth="1.5">
                            {/* Face 1 */}
                            <path d="M38,22 Q55,12 72,8 M38,22 L70,12 M35,20 L68,9" opacity="0.6" />
                            <path d="M72,8 Q85,18 92,32 M70,12 L90,30 M68,14 L88,28" opacity="0.6" />
                            <path d="M92,32 Q75,42 58,42 M90,30 L60,40 M94,34 L62,43" opacity="0.6" />
                            <path d="M58,42 Q45,32 38,22 M60,40 L40,20 M55,44 L35,24" opacity="0.6" />
                            {/* Vertical lines */}
                            <path d="M38,22 Q42,42 38,62 M40,20 L40,60" opacity="0.6" />
                            <path d="M58,42 Q62,62 58,82 M60,40 L60,80" opacity="0.6" />
                            <path d="M92,32 Q90,52 88,72 M90,30 L90,70" opacity="0.6" />
                            {/* Bottom face */}
                            <path d="M38,62 Q55,75 58,82 M40,60 L60,80 M35,65 L55,85" opacity="0.6" />
                            <path d="M58,82 Q75,75 88,72 M60,80 L90,70 M62,83 L92,68" opacity="0.6" />
                            {/* Dashed back lines (messy) */}
                            <path d="M38,62 Q55,50 68,52" strokeDasharray="4,3" opacity="0.5" />
                            <path d="M68,52 Q80,62 88,72" strokeDasharray="3,4" opacity="0.5" />
                            <path d="M72,8 Q70,30 68,52" strokeDasharray="4,4" opacity="0.5" />
                            {/* Scribble shading */}
                            <path d="M42,25 L55,38 M45,28 L58,41 M48,31 L61,44" strokeWidth="0.5" opacity="0.4" />
                          </svg>

                          {/* Messy Variable Y Flow */}
                          <svg className="absolute top-1 -right-6 w-[90px] h-[80px] opacity-70" viewBox="0 0 100 100" fill="none" stroke="#374151" strokeWidth="1.5">
                            {/* Wobbly Y? */}
                            <text x="2" y="25" fontSize="16" strokeWidth="1" fontFamily="'Comic Sans MS', cursive">Y?</text>
                            {/* Sketchy circle around Y? */}
                            <path d="M8,15 C-2,10 -5,30 10,32 C25,34 30,15 20,10 C15,5 5,12 8,20" strokeDasharray="2,3" opacity="0.7" />

                            {/* Wobbly arrow */}
                            <path d="M22,22 Q30,18 40,22" />
                            <path d="M35,17 L40,22 L33,26" />

                            {/* Sketchy circle for Y */}
                            <path d="M45,15 C38,10 38,30 48,30 C58,30 60,10 50,12 C45,10 40,18 48,25" opacity="0.8" />
                            <text x="46" y="24" fontSize="14" strokeWidth="1" fontFamily="'Comic Sans MS', cursive">Y</text>

                            {/* Arrow from ?? */}
                            <path d="M42,5 Q48,10 48,15" />
                            <path d="M43,10 L48,15 L50,8" />
                            <text x="32" y="8" fontSize="12" strokeWidth="1" opacity="0.8">??</text>

                            {/* Arrows to exp? */}
                            <path d="M55,18 Q65,10 72,12" />
                            <path d="M68,8 L72,12 L65,15" />
                            <path d="M52,28 Q60,35 68,32" />
                            <path d="M62,35 L68,32 L65,28" />

                            {/* Scribbly boxes for exp? */}
                            <path d="M70,5 L95,7 L92,20 L68,18 Z" opacity="0.7" />
                            <path d="M72,3 L97,6 L94,22 L66,19 Z" opacity="0.4" strokeWidth="1" />
                            <text x="73" y="15" fontSize="10" strokeWidth="0">exp?</text>

                            <path d="M68,25 L92,24 L94,38 L70,39 Z" opacity="0.7" />
                            <path d="M66,23 L94,22 L96,40 L68,41 Z" opacity="0.4" strokeWidth="1" />
                            <text x="71" y="36" fontSize="10" strokeWidth="0">exp?</text>

                            {/* Arrow to re-check */}
                            <path d="M42,32 Q45,45 40,48" />
                            <path d="M45,42 L40,48 L48,48" />

                            {/* Scribbly pill for re-check */}
                            <path d="M28,45 Q40,40 55,48 Q60,55 50,60 Q35,62 25,55 Q18,48 28,45 Z" opacity="0.7" />
                            <path d="M25,48 Q40,42 58,50 Q62,58 48,62 Q30,64 22,58 Q15,45 30,48" opacity="0.4" strokeWidth="1" />
                            <text x="32" y="55" fontSize="9" strokeWidth="0">re-check</text>

                            {/* B-t-s box dashed and messy */}
                            <path d="M65,45 L90,48 L88,62 L62,58 Z" strokeDasharray="3,3" opacity="0.7" />
                            <text x="68" y="56" fontSize="10" strokeWidth="0">B-t-s</text>
                            {/* Dashed line connecting B-t-s to exp? */}
                            <path d="M82,45 Q85,38 82,39" strokeDasharray="2,3" opacity="0.6" />
                          </svg>
                        </div>

                        {/* 2. Data Analysis */}
                        <div className="relative mt-2 z-10 flex">
                          <div className="flex-1">
                            <div className="font-bold text-[12px] mb-[2px]">- Data Analysis</div>
                            <div className="pl-6 space-y-[2px]">
                              <div>Review sets A, B, C &rarr; focus on discrepancies</div>
                              <div>Statistical outliers need deeper analysis:</div>
                              <div className="pl-4 text-[9px] font-mono mt-1 relative">
                                16.4 &plusmn; 0.7 &rarr; 22.5
                                {/* Cross out */}
                                <svg className="absolute top-[4px] left-0 w-[80px] h-[10px] opacity-70" viewBox="0 0 100 10" preserveAspectRatio="none">
                                  <path d="M0,5 Q50,0 100,7 M5,7 Q55,10 95,3" fill="none" stroke="#ef4444" strokeWidth="2" />
                                </svg>
                              </div>
                              <div className="pl-4 text-[9px] font-mono">45.9 &plusmn; 3.2 &rarr; <span className="border border-gray-400 rounded-full px-1">?</span></div>
                            </div>
                          </div>

                          {/* Messy First Banner */}
                          <div className="w-[130px] h-[55px] relative transform rotate-3">
                            <svg viewBox="0 0 200 60" fill="none" stroke="#1f2937" strokeWidth="2" className="w-full h-full opacity-80">
                              {/* Multiple messy outlines */}
                              <path d="M20,10 Q100,2 180,12 L170,30 L188,48 Q100,40 12,42 L28,25 Z" fill="#f9fafb" />
                              <path d="M18,12 Q98,5 182,15 L172,28 L185,45 Q98,38 15,40 L25,28 Z" strokeWidth="1" opacity="0.5" />
                              <path d="M22,8 Q102,0 178,10 L168,32 L190,50 Q102,42 10,44 L30,22 Z" strokeWidth="1" opacity="0.3" />
                              {/* Scribble shading inside banner */}
                              <path d="M25,15 L35,40 M40,12 L50,38 M150,15 L160,40 M165,18 L175,42" strokeWidth="0.5" opacity="0.4" />

                              <text x="100" y="32" textAnchor="middle" fontSize="13" fontWeight="bold" strokeWidth="0" fontFamily="'Marker Felt', cursive">TEST NULL HYPOTHESIS!</text>
                            </svg>
                            <svg className="absolute -bottom-6 left-0 w-[90px] h-[35px] opacity-70" viewBox="0 0 100 50">
                              <path d="M20,35 Q50,-5 85,15" fill="none" stroke="#4b5563" strokeWidth="1.5" />
                              <path d="M75,10 L85,15 L78,22" fill="none" stroke="#4b5563" strokeWidth="1.5" />
                              <text x="50" y="45" textAnchor="middle" fontSize="9" strokeWidth="0">independent validation necessary</text>
                            </svg>
                          </div>
                        </div>

                        {/* 3. Possible Causes */}
                        <div className="relative mt-3">
                          <div className="font-bold text-[12px] mb-[2px]">- Possible Causes (re: var Y)</div>
                          <ul className="pl-6 space-y-[2px]">
                            <li>Noise interference?</li>
                            <li>Sensor malfunction?</li>
                            <li className="font-bold relative">
                              External factors?
                              {/* Multiple underlines */}
                              <svg className="absolute -bottom-1 left-0 w-full h-[6px] opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0,5 Q50,0 100,5 M5,8 Q45,2 95,8" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                              </svg>
                            </li>
                            <li>Algorithmic error?</li>
                          </ul>
                        </div>

                        {/* 4. Further Research & 5. Options for Experiments */}
                        <div className="relative mt-2 flex gap-2">
                          <div className="flex-1">
                            <div className="font-bold text-[12px] mb-[2px]">- Options for Experiments:</div>
                            <ul className="pl-6 space-y-[2px]">
                              <li>Test conditions in new environment</li>
                              <li>Increase sample size</li>
                              <li>Run parallel tests to cross-check results</li>
                              <li>Adjust parameters X &amp; Z &rarr; isolate var Y's influence</li>
                            </ul>

                            {/* Second Messy Banner */}
                            <div className="w-[130px] h-[45px] mt-2 ml-2 transform -rotate-3">
                              <svg viewBox="0 0 200 60" fill="none" stroke="#1f2937" strokeWidth="2" className="w-full h-full opacity-70">
                                <path d="M15,12 Q100,0 185,10 L175,28 L190,48 Q100,38 10,40 L25,25 Z" fill="#f9fafb" />
                                <path d="M18,15 Q98,3 182,13 L172,30 L188,45 Q98,40 12,42 L22,28 Z" strokeWidth="1" opacity="0.5" />
                                <text x="100" y="32" textAnchor="middle" fontSize="13" fontWeight="bold" strokeWidth="0" fontFamily="'Marker Felt', cursive">TEST NULL HYPOTHESIS!</text>
                              </svg>
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="font-bold text-[12px] mb-[2px]">- Further Research:</div>
                            <ul className="pl-4 space-y-[2px]">
                              <li>Review Smith-Jones Model (1999)</li>
                              <li>Explore Johnson Hypothesis (2015) for relevance</li>
                            </ul>

                            {/* Sketchy Cloud & Process Diagram */}
                            <div className="mt-2 flex items-center justify-center relative">
                              <svg className="w-[50px] h-[30px] opacity-70" viewBox="0 0 60 30" fill="none" stroke="#374151" strokeWidth="1.5">
                                <text x="5" y="20" fontSize="14" fontFamily="'Comic Sans MS', cursive">1</text>
                                <path d="M15,15 Q20,12 28,16" />
                                <path d="M22,12 L28,16 L24,20" />
                                <text x="32" y="20" fontSize="14" fontFamily="'Comic Sans MS', cursive">?</text>
                                <path d="M42,15 Q48,18 55,14" />
                                <path d="M50,10 L55,14 L52,18" />
                                <text x="58" y="20" fontSize="14" fontFamily="'Comic Sans MS', cursive">2</text>
                              </svg>

                              <div className="relative w-[80px] h-[60px] opacity-80 ml-2">
                                <svg viewBox="0 0 120 80" fill="none" stroke="#374151" strokeWidth="1.5" className="w-full h-full">
                                  {/* Frantic scribbled cloud */}
                                  <path d="M40,30 C30,0 60,10 70,5 C80,0 90,20 100,15 C110,10 115,40 105,45 C115,50 100,75 85,70 C70,65 75,85 50,75 C25,85 20,60 30,55 C10,50 15,20 25,35 C35,50 50,20 40,30" fill="#f3f4f6" />
                                  <path d="M45,35 C35,5 65,15 75,10 C85,5 95,25 105,20 C115,15 120,45 110,50 C120,55 105,80 90,75 C75,70 80,90 55,80 C30,90 25,65 35,60 C15,55 20,25 30,40 C40,55 55,25 45,35" strokeWidth="1" opacity="0.5" />
                                  <text x="60" y="45" textAnchor="middle" fontSize="20" fontFamily="'Comic Sans MS', cursive" strokeWidth="0">test</text>
                                  {/* Squiggly underline inside cloud */}
                                  <path d="M40,50 Q50,45 60,52 T80,48" strokeWidth="1.5" />
                                </svg>
                                <div className="absolute -bottom-2 w-full text-center text-[10px] font-bold opacity-80" style={{ transform: 'rotate(2deg)' }}>ref: AX-703</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Background frantic scribbles across the whole card */}
                        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] -z-10" viewBox="0 0 400 600">
                          <path d="M10,10 Q50,150 100,50 T300,200 T150,400 T350,550 T50,580" fill="none" stroke="#000" strokeWidth="3" />
                          <path d="M380,20 C300,80 150,20 200,100 C250,180 50,250 100,350 C150,450 350,300 300,500 C250,700 50,450 20,550" fill="none" stroke="#000" strokeWidth="2" />
                        </svg>

                      </div>

                      {/* Defs for arrow marker */}
                      <svg width="0" height="0">
                        <defs>
                          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                            <path d="M0,0 L0,6 L6,3 Z" fill="currentColor" stroke="none" />
                          </marker>
                        </defs>
                      </svg>
                    </div>

                  </div>
                </div>
              </div>

                {/* Connecting Dashed Line & 3D Cube from Figure 1 center */}
                <div className="absolute top-[56%] left-[44.8%] -translate-x-1/2 flex flex-col items-center pointer-events-none z-[50]">
                  {/* Vertical Dashed Pink Line */}
                  <div ref={lineRef} className="w-[0.5px]" style={{ height: '0px', backgroundImage: 'repeating-linear-gradient(to bottom, #ff4d99 0px, #ff4d99 10px, transparent 10px, transparent 18px)' }} />
                  {/* 3D Isometric Cube at tip, joined by top corner */}
                  <div ref={cubeRef} className="-mt-[2px]" style={{ opacity: 0, transform: 'scale(1.20)', transformOrigin: 'top center' }}>
                    <IsometricCube />
                  </div>
                </div>
              </div>
            </div>

            {/* --- ROW 2 --- */}
            <div ref={row2Ref} className="relative z-[20] flex flex-col gap-0 mb-44">
              <p className="text-[14px] text-gray-500 leading-relaxed max-w-md pt-3 relative z-10">
                Configure schemas, prompts, and confidence thresholds. Or chain <br></br>all three.
              </p>

              {/* --- FIGURE 2 --- */}
              <div className="relative w-full aspect-square md:aspect-video flex items-center justify-center perspective-[800px] scale-[0.90] -translate-x-8 md:-translate-x-8 -mt-18">
                <div style={{ transform: 'rotateX(81deg)', transformStyle: 'preserve-3d' }} className="relative w-[450px] h-[450px]">

                  {/* --- PARSER LAYER (3 Floors) --- */}
                  <ParserFloor colorScheme="pink" label="PARSING" translateZ={112.5} scale={1.018} floorThickness={23} bottomScale={1.001} />
                  <ParserFloor colorScheme="gray" label="SPLITTER" translateZ={30.5} scale={1.022} floorThickness={26} bottomScale={1.001} />
                  <ParserFloor colorScheme="gray" label="EXTRACTOR" translateZ={-69} scale={1.042} floorThickness={28} bottomScale={1.001} />

                  {/* Vertical Rails Connecting the Slits */}
                  <div className="absolute top-1/2 left-1/2 w-[360px] h-[5px] pointer-events-none" style={{ transform: 'translate(-50%, -50%) rotateX(-20deg) scale(1.03)', transformStyle: 'preserve-3d' }}>
                    <div className="absolute bg-black/30" style={{ left: '23.5px', top: '150px', width: '1px', height: '161.5px', transformOrigin: 'top', transform: 'translateZ(119.5px) rotateX(-63.5deg)' }} />
                    <div className="absolute bg-black/30" style={{ right: '23.5px', top: '150px', width: '1px', height: '161.5px', transformOrigin: 'top', transform: 'translateZ(119.5px) rotateX(-63.5deg)' }} />
                  </div>

                  <ParserFloor
                    slitColor="amber"
                    slitStyle={{ width: '480px', height: '48px', right: 'auto', left: '50%', transform: 'translateX(-50%) rotateX(-60deg)', transformStyle: 'preserve-3d', padding: '0 6px' }}
                    hideDashes hidePluses hidePlate hideCube translateZ={48} scale={1.023}
                    customContent={
                      <>
                        {/* Scanner Animation */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[1px]">
                          <div className="absolute top-0 bottom-0 w-[150px] bg-gradient-to-r from-transparent via-[#d97706]/30 to-transparent blur-[2px]" style={{ animation: 'slitScanner 3s linear infinite' }} />
                        </div>
                        <div className="text-black/80 font-mono text-[14px] font-light tracking-wider z-10">
                          <span className="text-black/30">[</span>ZeyroAI<span className="text-black/30">]</span>
                        </div>
                        <div className="flex items-center gap-1 z-10">
                          <span className="text-amber-600/80 font-mono text-[12px] uppercase font-medium tracking-wider">PARSING DATA...</span>
                          <div className="flex items-center gap-[1.5px]">
                            <style>{`
                              @keyframes slitScanner {
                                0% { transform: translateX(-150px); }
                                100% { transform: translateX(500px); }
                              }
                              @keyframes fillBar0 { 0%, 100% { background-color: transparent; } 0.1%, 99% { background-color: rgba(238, 130, 7, 0.8); } }
                              @keyframes fillBar1 { 0%, 16% { background-color: transparent; } 16.1%, 99% { background-color: rgba(238, 130, 7, 0.8); } }
                              @keyframes fillBar2 { 0%, 33% { background-color: transparent; } 33.1%, 99% { background-color: rgba(238, 130, 7, 0.8); } }
                              @keyframes fillBar3 { 0%, 50% { background-color: transparent; } 50.1%, 99% { background-color: rgba(238, 130, 7, 0.8); } }
                              @keyframes fillBar4 { 0%, 66% { background-color: transparent; } 66.1%, 99% { background-color: rgba(238, 130, 7, 0.8); } }
                              @keyframes fillBar5 { 0%, 83% { background-color: transparent; } 83.1%, 99% { background-color: rgba(238, 130, 7, 0.8); } }
                            `}</style>
                            {[...Array(6)].map((_, i) => (
                              <div
                                key={i}
                                className="w-[5px] h-[12px] border border-amber-600/40 rounded-[1px]"
                                style={{
                                  animation: `fillBar${i} 1.2s infinite`
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        {/* Front Plate Bounding Box Lines */}
                        <div className="absolute top-[-6px] left-[2px] right-[3px] h-[1px] bg-black/40 pointer-events-none" />
                        <div className="absolute bottom-[-6px] left-[2px] right-[3px] h-[1px] bg-black/40 pointer-events-none" />
                        <div className="absolute top-[2px] bottom-[2px] left-[-6px] w-[1px] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.4) 0, rgba(0,0,0,0.4) 6px, transparent 6px, transparent 10px)' }} />
                        <div className="absolute top-[2px] bottom-[2px] right-[-6px] w-[1px] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.4) 0, rgba(0,0,0,0.4) 6px, transparent 6px, transparent 10px)' }} />
                        {/* Front Corner Pluses */}
                        <div className="absolute -top-[15px] -left-[10.5px] text-black/60 font-mono text-[18px] leading-none pointer-events-none">+</div>
                        <div className="absolute -top-[15px] -right-[10.5px] text-black/60 font-mono text-[18px] leading-none pointer-events-none">+</div>
                        <div className="absolute -bottom-[13px] -left-[10.5px] text-black/60 font-mono text-[18px] leading-none pointer-events-none">+</div>
                        <div className="absolute -bottom-[13px] -right-[10.5px] text-black/60 font-mono text-[18px] leading-none pointer-events-none">+</div>
                        {/* Left Plate (Depth) */}
                        <div className="absolute top-[-24px] bottom-[-24px] left-[-6px] w-[615px] pointer-events-none" style={{ transformOrigin: 'left', transform: 'rotateY(102.6deg) skewY(-13.5deg)' }}>
                          <div className="absolute left-0 w-[500px] h-[1px]" style={{ top: '19px', transformOrigin: 'left', transform: 'rotateZ(-1.24deg)' }}>
                            <div className="absolute inset-y-0 left-[28px] right-[60px] bg-black/60" />
                          </div>
                          <div className="absolute left-0 w-[500px] h-[1px]" style={{ top: '77px', transformOrigin: 'left', transform: 'rotateZ(2.44deg)' }}>
                            <div className="absolute inset-y-0 left-[28px] right-[60px] bg-black/60" />
                          </div>
                        </div>
                        {/* Right Plate (Depth) */}
                        <div className="absolute top-[-24px] bottom-[-24px] right-[-5px] w-[615px] pointer-events-none" style={{ transformOrigin: 'right', transform: 'rotateY(-102.7deg) skewY(13.5deg)' }}>
                          <div className="absolute right-0 w-[500px] h-[1px]" style={{ top: '19px', transformOrigin: 'right', transform: 'rotateZ(1.24deg)' }}>
                            <div className="absolute inset-y-0 right-[28px] left-[60px] bg-black/60" />
                          </div>
                          <div className="absolute right-0 w-[500px] h-[1px]" style={{ top: '77px', transformOrigin: 'right', transform: 'rotateZ(-2.44deg)' }}>
                            <div className="absolute inset-y-0 right-[28px] left-[60px] bg-black/60" />
                          </div>
                        </div>
                        {/* Back Plate Bounding Box Lines (Scaled to perspective width) */}
                        <div className="absolute left-[-140px] right-[-140px] top-[-24px] bottom-[-24px] pointer-events-none" style={{ transform: 'translateZ(-600px) translateY(-124px)' }}>
                          <div className="absolute top-[-3px] left-[2px] w-[45.5px] h-[1.8px] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(to right, rgba(0,0,0,0.4) 0, rgba(0,0,0,0.4) 10.5px, transparent 10.5px, transparent 17.5px)' }} />
                          <div className="absolute top-[-3px] right-[3px] w-[45.5px] h-[1.8px] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(to left, rgba(0,0,0,0.4) 0, rgba(0,0,0,0.4) 10.5px, transparent 10.5px, transparent 17.5px)' }} />
                          <div className="absolute bottom-[-5.5px] left-[2px] right-[3px] h-[1.8px] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(to right, rgba(43, 43, 43, 0.2) 0, rgba(43, 43, 43, 0.2) 10.5px, transparent 10.5px, transparent 17.5px)' }} />
                          <div className="absolute top-[7.97px] bottom-[3px] left-[-9.5px] w-[1.8px] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.4) 0, rgba(0,0,0,0.4) 10.5px, transparent 10.5px, transparent 17.5px)' }} />
                          <div className="absolute top-[7.97px] bottom-[3px] right-[-8.5px] w-[1.8px] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.4) 0, rgba(0,0,0,0.4) 10.5px, transparent 10.5px, transparent 17.5px)' }} />
                          {/* Back Corner Pluses */}
                          <div className="absolute -top-[16px] -left-[16px] text-black/60 font-mono text-[26px] leading-none pointer-events-none">+</div>
                          <div className="absolute -top-[16px] -right-[15px] text-black/60 font-mono text-[26px] leading-none pointer-events-none">+</div>
                          <div className="absolute -bottom-[16px] -left-[16px] text-black/40 font-mono text-[26px] leading-none pointer-events-none">+</div>
                        </div>
                      </>
                    }
                  />
                </div>
                {/* Connecting Dashed Gray Line & 3D Cube from 3rd Extractor Gray Cube to Figure 3 */}
                <div className="absolute top-[74%] left-[49.6%] -translate-x-1/2 flex flex-col items-center pointer-events-none z-[50]">
                  {/* Vertical Solid Gray Line */}
                  <div ref={grayLineRef} className="w-[0.5px] bg-[#9ca3af]" style={{ height: '0px' }} />
                  {/* Glowing Pink Pixelated Data Block at tip */}
                  <div ref={grayCubeRef} className="-mt-[1px] drop-shadow-[0_0_10px_rgba(255,77,148,0.8)]" style={{ opacity: 0, transform: 'scale(1.30)', transformOrigin: 'top center' }}>
                    <PixelCube />
                  </div>
                </div>
              </div>
            </div>

            {/* --- ROW 3 --- */}
            <div ref={row3Ref} className="relative z-[10] flex flex-col gap-10">
              <p className="text-[14px] text-gray-500 leading-relaxed max-w-md pt-3 relative z-10">
                JSON, Markdown, or structured fields into your LLM, AI Agents,<br></br> vector DB, or warehouse.
              </p>

              <div className="w-full flex flex-col items-center justify-center mt-2 scale-[0.8] origin-top -translate-x-8 md:-translate-x-8 -mb-14 md:-mb-12">
                <div className="bg-white border border-[#ff4d99] font-mono text-sm relative overflow-hidden w-[660px] max-w-[800px] pt-10 pb-4">
                  {/* Pink Header */}
                  <div className="absolute top-0 left-0 w-full bg-pink-200/40 text-black py-3 text-center font-space-grotesk font-bold tracking-widest text-sm flex justify-between px-2 items-center z-10">
                    <div className="w-2 h-2 rounded-full bg-white" />
                    <span className="font-space-grotesk font-bold tracking-widest">[ STRUCTURED OUTPUT ]</span>
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>

                  {/* Full-height Gutter Background */}
                  <div className="absolute top-10 bottom-0 left-0 w-10 bg-gray-50 border-r border-gray-200 pointer-events-none" />

                  <div className="flex mt-2 text-[14px] leading-[1.6] relative z-10">
                    {/* Line numbers */}
                    <div className="bg-gray-50 border-r border-gray-200 text-gray-400 text-right pr-3 pl-2 select-none shrink-0 w-10 mr-4">
                      {[...Array(19)].map((_, i) => <div key={i}>{i + 1}</div>)}
                    </div>

                    {/* Code */}
                    <div className="text-gray-800 overflow-x-auto w-full pr-8">
                      <div>{"{"}</div>
                      <div className="pl-6"><span className="text-gray-500"><DecodeText trigger={row3Visible} delay={50} value='"title":' /></span> <DecodeText trigger={row3Visible} delay={120} value='"Sales Report",' /></div>
                      <div className="pl-6"><span className="text-gray-500"><DecodeText trigger={row3Visible} delay={200} value='"period":' /></span> <DecodeText trigger={row3Visible} delay={280} value='"Q1 2025",' /></div>
                      <div className="pl-6"><span className="text-gray-500"><DecodeText trigger={row3Visible} delay={360} value='"date":' /></span> <DecodeText trigger={row3Visible} delay={440} value='"2025-04-01",' /></div>
                      <div className="pl-6"><span className="text-gray-500"><DecodeText trigger={row3Visible} delay={520} value='"rows":' /></span> [</div>

                      {[
                        ['"NY"', '720, 890, 24, 38, 820', '"High"', true],
                        ['"LA"', '680, 820, 21, 38, 710', '"High"', true],
                        ['"MI"', '310, 610, 49, 38, 530', '"Hot"', true],
                        ['"CH"', '295, 370, 19, 38, 240', '"Mid"', true],
                        ['"AU"', '580, 490, 66, 38, 310', '"Down"', true],
                        ['"SE"', '630, 650, 12, 38, 560', '"High"', true],
                        ['"BO"', '390, 740, 17, 38, 690', '"Up"', false]
                      ].map(([city, nums, status, hasComma], idx) => (
                        <div key={idx} className="pl-12">
                          <DecodeText trigger={row3Visible} delay={600 + idx * 120} value={`[${city}, `} />
                          <span className="text-[#ff4d99]"><DecodeText trigger={row3Visible} delay={640 + idx * 120} value={nums as string} /></span>
                          <DecodeText trigger={row3Visible} delay={680 + idx * 120} value={`, ${status}]${hasComma ? ',' : ''}`} />
                        </div>
                      ))}

                      <div className="pl-6">],</div>
                      <div className="pl-6"><span className="text-gray-500"><DecodeText trigger={row3Visible} delay={1500} value='"columns":' /></span> [</div>
                      <div className="pl-12"><DecodeText trigger={row3Visible} delay={1600} value='"city", "p20", "p25", "gr",' /></div>
                      <div className="pl-12"><DecodeText trigger={row3Visible} delay={1700} value='"dom", "psf", "st"' /></div>
                      <div className="pl-6">]</div>
                      <div>{"}"}</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Buttons */}
                <div className="flex gap-2 mt-4">
                  <button className="font-mono text-[14px] px-6 py-2 text-white bg-[#ff8cc6]">JSON</button>
                  <button className="font-mono text-[14px] border border-gray-300 px-6 py-2 text-black bg-white hover:bg-gray-50">Markdown</button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
