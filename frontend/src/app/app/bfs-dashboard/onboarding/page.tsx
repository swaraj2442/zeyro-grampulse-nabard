"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

// 5-wide × 7-tall pixel definitions for capital letters
function getCharPixels(char: string): [number, number][] {
  const glyphs: Record<string, [number, number][]> = {
    'B': [[0,0],[1,0],[2,0],[0,1],[3,1],[0,2],[1,2],[2,2],[0,3],[3,3],[0,4],[3,4],[0,5],[3,5],[0,6],[1,6],[2,6]],
    'E': [[0,0],[1,0],[2,0],[3,0],[0,1],[0,2],[1,2],[2,2],[0,3],[0,4],[0,5],[0,6],[1,6],[2,6],[3,6]],
    'P': [[0,0],[1,0],[2,0],[0,1],[3,1],[0,2],[3,2],[0,3],[1,3],[2,3],[0,4],[0,5],[0,6]],
    'O': [[1,0],[2,0],[0,1],[3,1],[0,2],[3,2],[0,3],[3,3],[0,4],[3,4],[0,5],[3,5],[1,6],[2,6]],
    'W': [[0,0],[4,0],[0,1],[4,1],[0,2],[2,2],[4,2],[0,3],[2,3],[4,3],[0,4],[1,4],[3,4],[4,4],[1,5],[3,5],[1,6],[3,6]],
    'R': [[0,0],[1,0],[2,0],[0,1],[3,1],[0,2],[3,2],[0,3],[1,3],[2,3],[0,4],[2,4],[0,5],[3,5],[0,6],[3,6]],
    'F': [[0,0],[1,0],[2,0],[3,0],[0,1],[0,2],[1,2],[2,2],[0,3],[0,4],[0,5],[0,6]],
    'U': [[0,0],[3,0],[0,1],[3,1],[0,2],[3,2],[0,3],[3,3],[0,4],[3,4],[0,5],[3,5],[1,6],[2,6]],
    'L': [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,6],[2,6],[3,6]],
    'I': [[0,0],[1,0],[2,0],[1,1],[1,2],[1,3],[1,4],[1,5],[0,6],[1,6],[2,6]],
    'N': [[0,0],[3,0],[0,1],[1,1],[3,1],[0,2],[2,2],[3,2],[0,3],[3,3],[0,4],[3,4],[0,5],[3,5],[0,6],[3,6]],
    'T': [[0,0],[1,0],[2,0],[3,0],[4,0],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6]],
    'G': [[1,0],[2,0],[3,0],[0,1],[0,2],[0,3],[2,3],[3,3],[0,4],[3,4],[0,5],[3,5],[1,6],[2,6]],
    'A': [[1,0],[2,0],[0,1],[3,1],[0,2],[3,2],[0,3],[1,3],[2,3],[3,3],[0,4],[3,4],[0,5],[3,5],[0,6],[3,6]],
    'C': [[1,0],[2,0],[3,0],[0,1],[0,2],[0,3],[0,4],[0,5],[1,6],[2,6],[3,6]],
    'S': [[1,0],[2,0],[3,0],[0,1],[0,2],[1,3],[2,3],[3,4],[3,5],[0,6],[1,6],[2,6]],
    'Y': [[0,0],[4,0],[0,1],[4,1],[1,2],[3,2],[2,3],[2,4],[2,5],[2,6]],
    'M': [[0,0],[4,0],[0,1],[1,1],[3,1],[4,1],[0,2],[2,2],[4,2],[0,3],[4,3],[0,4],[4,4],[0,5],[4,5],[0,6],[4,6]],
    'D': [[0,0],[1,0],[2,0],[0,1],[3,1],[0,2],[4,2],[0,3],[4,3],[0,4],[4,4],[0,5],[3,5],[0,6],[1,6],[2,6]],
    'K': [[0,0],[3,0],[0,1],[2,1],[0,2],[1,2],[0,3],[1,3],[0,4],[2,4],[0,5],[3,5],[0,6],[4,6]],
    'H': [[0,0],[3,0],[0,1],[3,1],[0,2],[3,2],[0,3],[1,3],[2,3],[3,3],[0,4],[3,4],[0,5],[3,5],[0,6],[3,6]],
    'V': [[0,0],[4,0],[0,1],[4,1],[0,2],[4,2],[1,3],[3,3],[1,4],[3,4],[2,5],[2,6]],
    ' ': [],
  };
  return glyphs[char] || glyphs['E'];
}

// Isometric 3D wireframe text art rendered as SVG
function IsometricText({ text, y, delay = 0 }: { text: string; y: number; delay?: number }) {
  const chars = text.toUpperCase().split('');
  const charWidth = 38;
  const skewX = 0.5;

  function renderChar(char: string, cx: number) {
    const segments: React.ReactNode[] = [];
    const pixels = getCharPixels(char);

    pixels.forEach(([px, py], i) => {
      const bx = cx + px * 7.5 * skewX + py * 0.5;
      const by = py * 8 - px * 0.8;

      segments.push(
        <polygon
          key={`${i}-top`}
          points={`${bx},${by} ${bx + 6},${by - 2.5} ${bx + 8.5},${by + 2} ${bx + 2.5},${by + 4.5}`}
          fill="none"
          stroke="#333"
          strokeWidth="0.5"
        />
      );
      segments.push(
        <polygon
          key={`${i}-right`}
          points={`${bx + 6},${by - 2.5} ${bx + 6},${by + 2.5} ${bx + 8.5},${by + 7} ${bx + 8.5},${by + 2}`}
          fill="none"
          stroke="#555"
          strokeWidth="0.5"
        />
      );
    });
    return segments;
  }

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
    >
      {chars.map((char, i) => (
        <g key={i} transform={`translate(${i * charWidth}, ${y})`}>
          {renderChar(char, 0)}
        </g>
      ))}
    </motion.g>
  );
}

function BlockArt() {
  const lines = [
    { text: 'BE POWERFUL', y: 0, delay: 0.1 },
    { text: 'INTELLIGENCE', y: 110, delay: 0.3 },
    { text: 'BE AMAZING', y: 220, delay: 0.5 },
  ];

  return (
    <svg
      viewBox="-10 -20 520 360"
      className="w-full h-full"
      style={{ maxWidth: '480px' }}
      preserveAspectRatio="xMidYMid meet"
    >
      {lines.map((line) => (
        <IsometricText key={line.text} text={line.text} y={line.y} delay={line.delay} />
      ))}
    </svg>
  );
}

// Arrow icon
function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

const slideVariants = {
  enter: { opacity: 0, x: 32 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -32 },
};

// ── Step 1 ────────────────────────────────────────────────────────────────────
function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      key="step-welcome"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col items-center gap-4 text-center"
    >
      <h1
        className="text-4xl font-semibold text-gray-900 tracking-tight"
        style={{ fontFamily: 'var(--font-syne, Georgia, serif)' }}
      >
        Zeyro Intelligence
      </h1>
      <p className="text-base text-gray-500 font-light max-w-[320px] text-center">
        Build explainable financial intelligence into your products.
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="mt-3 flex items-center gap-3 bg-gray-800 text-white px-8 py-3 rounded-md text-sm font-medium shadow-sm hover:bg-gray-900 transition-colors"
      >
        Set up workspace <ArrowRight />
      </motion.button>

      <p className="text-[12px] text-gray-500 mt-4 max-w-[320px] text-center">
        Your workspace includes a dedicated sandbox, test credentials and sample financial data.
      </p>

      <p className="text-[11px] text-gray-400 mt-2 font-light">
        By continuing, you agree to our{' '}
        <a href="#" className="underline hover:text-gray-600 transition-colors">Privacy Policy</a>
        {' '}and{' '}
        <a href="#" className="underline hover:text-gray-600 transition-colors">Terms of Service</a>
      </p>
    </motion.div>
  );
}

// ── Step 2 ────────────────────────────────────────────────────────────────────
function StepName({ onNext }: { onNext: (name: string) => void }) {
  const [name, setName] = useState('');

  return (
    <motion.div
      key="step-name"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col items-center gap-5 w-full max-w-[320px]"
    >
      <h2
        className="text-2xl font-semibold text-gray-900 tracking-tight text-center"
        style={{ fontFamily: 'var(--font-syne, Georgia, serif)' }}
      >
        What should we call you?
      </h2>
      <p className="text-[13px] text-gray-500 text-center mb-2">
        This name will appear in your workspace, team activity and implementation communications.
      </p>

      <div className="w-full flex flex-col gap-1.5">
        <label className="text-xs text-gray-500 font-medium pl-0.5">Full name</label>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && onNext(name.trim())}
          placeholder="e.g. Swaraj Chouriwar"
          className="w-full border border-gray-300 bg-white rounded-md px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => name.trim() && onNext(name.trim())}
        className="flex items-center gap-3 bg-gray-800 text-white px-8 py-3 rounded-md text-sm font-medium shadow-sm hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ opacity: name.trim() ? 1 : 0.5 }}
      >
        Continue <ArrowRight />
      </motion.button>
    </motion.div>
  );
}

// ── Step 3 ────────────────────────────────────────────────────────────────────
const roleOptions = [
  { id: '01', label: 'Founder or Executive' },
  { id: '02', label: 'Engineering' },
  { id: '03', label: 'Product' },
  { id: '04', label: 'Risk and Credit' },
  { id: '05', label: 'Data Science' },
  { id: '06', label: 'Solutions Architecture' },
  { id: '07', label: 'Business or Partnerships' },
  { id: '08', label: 'Other' },
];

function StepRole({ onNext }: { onNext: (choice: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [otherText, setOtherText] = useState('');

  const isOtherSelected = selected === '10';
  const canContinue = selected && (!isOtherSelected || (isOtherSelected && otherText.trim() !== ''));

  const handleContinue = () => {
    if (canContinue) {
      if (isOtherSelected) {
        onNext(otherText.trim());
      } else {
        const option = roleOptions.find(o => o.id === selected);
        onNext(option?.label || '');
      }
    }
  };

  return (
    <motion.div
      key="step-role"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col items-center gap-5 w-full max-w-[360px]"
    >
      <h2
        className="text-2xl font-semibold text-gray-900 tracking-tight text-center leading-snug"
        style={{ fontFamily: 'var(--font-syne, Georgia, serif)' }}
      >
        What best describes your role?
      </h2>
      <p className="text-[13px] text-gray-500 text-center mb-1">
        We’ll personalize your workspace, examples and documentation around your responsibilities.
      </p>

      <div className="w-full flex flex-col gap-2.5">
        {roleOptions.map((opt) => (
          <div key={opt.id} className="w-full">
            <button
              onClick={() => setSelected(opt.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-md border text-left text-sm transition-all duration-150 ${
                selected === opt.id
                  ? 'border-gray-700 bg-white shadow-sm text-gray-900'
                  : 'border-gray-300 bg-white/60 text-gray-600 hover:border-gray-400 hover:bg-white hover:text-gray-800'
              }`}
            >
              <span className="text-[11px] text-gray-400 font-mono w-5 shrink-0 select-none">{opt.id}</span>
              <span className="font-medium">{opt.label}</span>
            </button>
            {opt.id === '10' && selected === '10' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2"
              >
                <input
                  type="text"
                  autoFocus
                  placeholder="Specify your role"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  className="w-full border border-gray-300 bg-white rounded-md px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all"
                />
              </motion.div>
            )}
          </div>
        ))}
      </div>

      <motion.button
        whileHover={canContinue ? { scale: 1.02 } : {}}
        whileTap={canContinue ? { scale: 0.97 } : {}}
        onClick={handleContinue}
        className="flex items-center gap-3 bg-gray-800 text-white px-8 py-3 rounded-md text-sm font-medium shadow-sm transition-colors mt-2"
        style={{
          opacity: canContinue ? 1 : 0.45,
          cursor: canContinue ? 'pointer' : 'default',
          backgroundColor: canContinue ? '#1f2937' : '#9ca3af',
        }}
      >
        Continue <ArrowRight />
      </motion.button>
    </motion.div>
  );
}

// ── Step 4 ────────────────────────────────────────────────────────────────────
const stageOptions = [
  'Exploring', 'Building PoC', 'Developing MVP', 'Preparing pilot', 'Running pilot', 'Prep for prod', 'Scaling system'
];

function StepStage({ onNext }: { onNext: (choice: string) => void }) {
  const [selectedIndex, setSelectedIndex] = useState(1);

  return (
    <motion.div
      key="step-stage"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col items-center gap-2 w-full max-w-[640px]"
    >
      <h2
        className="text-[22px] font-semibold text-gray-900 tracking-tight text-center mb-1"
        style={{ fontFamily: 'var(--font-syne, Georgia, serif)' }}
      >
        Where are you in your implementation journey?
      </h2>
      <p className="text-[13px] text-gray-500 text-center mb-10 max-w-[400px]">
        We’ll tailor your setup and recommended next steps to your current stage.
      </p>

      <div className="w-full flex flex-col items-center relative mb-8">
        {/* Labels */}
        <div className="w-full flex justify-between items-center mb-6 relative z-10 px-0 h-8">
          {stageOptions.map((opt, i) => {
            const isSelected = i === selectedIndex;
            return (
              <button
                key={opt}
                onClick={() => setSelectedIndex(i)}
                className={`text-[11px] font-medium py-1.5 rounded-md transition-colors whitespace-normal leading-tight ${
                  isSelected
                    ? 'bg-[#eef2ff] text-blue-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                style={{
                  width: '80px',
                  textAlign: 'center',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Ruler Track */}
        <div className="w-full relative flex justify-between items-center mb-2 px-[40px] h-6">
          {Array.from({ length: 37 }).map((_, i) => {
            const isMajorTick = i % 6 === 0;
            const dist = Math.abs(i - selectedIndex * 6);
            
            let heightClass = isMajorTick ? 'h-3' : 'h-1.5';
            let colorClass = isMajorTick ? 'bg-gray-300' : 'bg-gray-200';

            if (dist === 0) {
              heightClass = 'h-5';
              colorClass = 'bg-blue-500';
            } else if (dist === 1) {
              heightClass = 'h-4';
              colorClass = 'bg-blue-400';
            } else if (dist === 2) {
              heightClass = 'h-3';
              colorClass = 'bg-blue-300';
            } else if (dist === 3) {
              heightClass = 'h-2';
              colorClass = 'bg-blue-200';
            }

            return (
              <div
                key={i}
                className={`w-px rounded-full transition-all duration-300 ${heightClass} ${colorClass}`}
              />
            );
          })}
        </div>

        {/* Selected Dot */}
        <div className="w-full relative h-2 px-[40px]">
          <motion.div
            className="absolute top-1 w-2 h-2 rounded-full bg-blue-500"
            initial={false}
            animate={{
              // 36 intervals total. Left position maps exactly to selectedIndex / 6
              left: `calc(40px + ${ (selectedIndex / 6) * 100 }% - ${ ((selectedIndex / 6) * 80) }px)` 
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ x: '-50%' }}
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onNext(stageOptions[selectedIndex])}
        className="flex items-center gap-2 bg-[#333] text-white px-8 py-2.5 rounded-md text-[13px] font-medium shadow-sm hover:bg-gray-900 transition-colors mt-6"
      >
        Next <ArrowRight />
      </motion.button>
    </motion.div>
  );
}

// ── Step 5 ────────────────────────────────────────────────────────────────────
function StepCreateCompany({ onNext, onBack }: { onNext: (companyName: string) => void, onBack: () => void }) {
  const [companyName, setCompanyName] = useState('');

  return (
    <motion.div
      key="step-create"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col w-full max-w-[380px]"
    >
      <h2
        className="text-[20px] font-semibold text-gray-900 tracking-tight mb-2"
        style={{ fontFamily: 'var(--font-syne, Georgia, serif)' }}
      >
        Set up your organization
      </h2>
      <p className="text-[13px] text-gray-500 mb-8">
        Your organization contains your workspaces, environments, API credentials, datasets and team access.
      </p>

      <div className="w-full flex flex-col gap-2 mb-8">
        <label className="text-[12px] font-medium text-gray-700">
          Organization name
        </label>
        <input
          type="text"
          autoFocus
          placeholder="e.g. Acme Financial"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && companyName.trim() && onNext(companyName.trim())}
          className="w-full border border-gray-300 bg-transparent rounded-lg px-4 py-3 text-[13px] text-gray-900 placeholder-gray-400 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-300 transition-all"
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => companyName.trim() && onNext(companyName.trim())}
          className="flex items-center justify-center gap-2 text-white/90 px-8 py-2.5 rounded-md text-[13px] font-medium transition-colors w-full"
          style={{
            background: 'linear-gradient(180deg, #555 0%, #333 100%)',
            border: '1px solid #222',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            opacity: companyName.trim() ? 1 : 0.5,
            cursor: companyName.trim() ? 'pointer' : 'default'
          }}
        >
          Create organization &rarr;
        </motion.button>
        
        <button 
          onClick={onBack}
          className="text-[12px] text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors"
        >
          Back
        </button>
      </div>

      <p className="text-[12px] text-gray-500 mt-6 text-center">
        Additional workspaces and team members can be added later.
      </p>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [chatOpen, setChatOpen] = useState(false);

  const [companyDesc, setCompanyDesc] = useState('');
  
  // API State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [agentResponse, setAgentResponse] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedQuestionOption, setSelectedQuestionOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');

  const handleChatSubmit = async () => {
    if (companyDesc.trim() && !isSubmitting) {
      setIsSubmitting(true);
      
      try {
        const userName = typeof window !== 'undefined' ? sessionStorage.getItem('bfs_user_name') || '' : '';
        const role = typeof window !== 'undefined' ? sessionStorage.getItem('bfs_role') || '' : '';
        const stage = typeof window !== 'undefined' ? sessionStorage.getItem('bfs_stage') || '' : '';
        const companyName = typeof window !== 'undefined' ? sessionStorage.getItem('bfs_company_name') || '' : '';
        
        const res = await fetch('/api/bfs/init-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userName, role, stage, companyName, companyDescription: companyDesc })
        });
        const data = await res.json();
        
        if (data.sessionId) setSessionId(data.sessionId);
        if (data.agentResponse) setAgentResponse(data.agentResponse);
        if (data.toolExecution?.questionData) {
          setCurrentQuestion(data.toolExecution.questionData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleAnswerSubmit = async () => {
    if (!sessionId || !currentQuestion || isSubmitting) return;
    
    // Validation based on question type
    if (currentQuestion.type === 'text' && !textAnswer.trim()) return;
    if (currentQuestion.type !== 'text' && !selectedQuestionOption) return;

    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/bfs/answer-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          selectedOptionIds: currentQuestion.type !== 'text' ? [selectedQuestionOption] : [],
          customAnswer: currentQuestion.type === 'text' ? textAnswer : ''
        })
      });
      const data = await res.json();
      
      if (data.status === 'completed' && data.dashboardRedirectUrl) {
        // Update user metadata in Supabase to mark onboarding as completed
        const supabase = createClient();
        await supabase.auth.updateUser({
          data: { onboarding_completed: true }
        });
        
        // Also call the new z-b2b /onboarding endpoint to save data to Postgres
        try {
          const userName = typeof window !== 'undefined' ? sessionStorage.getItem('bfs_user_name') || '' : '';
          const role = typeof window !== 'undefined' ? sessionStorage.getItem('bfs_role') || '' : '';
          const stage = typeof window !== 'undefined' ? sessionStorage.getItem('bfs_stage') || '' : '';
          const companyName = typeof window !== 'undefined' ? sessionStorage.getItem('bfs_company_name') || '' : '';
          
          await fetch('/api/b2b-proxy/onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ company_name: companyName, role, stage, preset_answers: {} }) // Mocking answers for now
          });
        } catch(e) { console.error("Failed to save to z-b2b", e); }

        router.push(data.dashboardRedirectUrl);
      } else if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
        setSelectedQuestionOption(null);
        setTextAnswer('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (step === 6) {
      const timer = setTimeout(() => {
        setChatOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleStep1Next = () => setStep(2);
  const handleStep2Next = (name: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bfs_user_name', name);
    }
    setStep(3);
  };
  const handleStep3Next = (choice: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bfs_role', choice);
    }
    setStep(4);
  };
  const handleStep4Next = (stage: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bfs_stage', stage);
    }
    setStep(5);
  };
  const handleStep5Next = async (companyName: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bfs_company_name', companyName);
    }
    setStep(6);
    
    setIsSubmitting(true);
    try {
      const userName = typeof window !== 'undefined' ? sessionStorage.getItem('bfs_user_name') || '' : '';
      const role = typeof window !== 'undefined' ? sessionStorage.getItem('bfs_role') || '' : '';
      const stage = typeof window !== 'undefined' ? sessionStorage.getItem('bfs_stage') || '' : '';
      
      const res = await fetch('/api/bfs/init-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, role, stage, companyName, companyDescription: '' })
      });
      const data = await res.json();
      
      if (data.sessionId) setSessionId(data.sessionId);
      if (data.agentResponse) setAgentResponse(data.agentResponse);
      if (data.toolExecution?.questionData) {
        setCurrentQuestion(data.toolExecution.questionData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex relative overflow-hidden"
      style={{ backgroundColor: '#ECF0F3', fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)' }}
    >
      {/* Top-left Log out */}
      <div className="absolute top-5 left-6 z-10">
        <button
          onClick={() => step > 1 ? setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5 | 6) : router.push('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {step > 1 ? 'Back' : 'Log out'}
        </button>
      </div>

      {/* Left — Decorative art */}
      <div className={`transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] relative ${step === 6 ? 'flex-1 flex items-center justify-center' : 'w-1/2 flex items-center justify-center pl-16 pr-8'}`}>
        <AnimatePresence mode="wait">
          {step === 6 ? (
            <motion.div
              key="center-stage"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.1 }}
              className="flex flex-col items-center justify-center absolute inset-0 pointer-events-none"
            >
              {/* Giant faint circle */}
              <div className="w-[500px] h-[500px] rounded-full border border-gray-200" />
              
              {/* Sunflower & Button centered */}
              <div className="absolute flex flex-col items-center gap-2 pointer-events-auto">
                <img src="/o3.png" alt="Agent Icon" className="w-16 h-16 object-contain drop-shadow-sm opacity-90 cursor-default mb-1" />
                <button className="bg-white px-5 py-2 rounded-xl text-[14px] text-gray-800 shadow-sm border border-gray-200" style={{ fontFamily: 'var(--font-syne, Georgia, serif)' }}>
                  Zeyro
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="blockart"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full flex justify-center items-center"
              style={{ maxWidth: '700px' }}
            >
              <img src="/o2.png" alt="Onboarding Art" className="w-full h-auto rounded-[10px] shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right — Animated step panel */}
      <AnimatePresence>
        {step < 6 && (
          <motion.div 
            className="w-1/2 flex flex-col items-center justify-center pr-8 lg:pr-16"
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <StepWelcome key="s1" onNext={handleStep1Next} />
              ) : step === 2 ? (
                <StepName key="s2" onNext={handleStep2Next} />
              ) : step === 3 ? (
                <StepRole key="s3" onNext={handleStep3Next} />
              ) : step === 4 ? (
                <StepStage key="s4" onNext={handleStep4Next} />
              ) : (
                <StepCreateCompany key="s5" onNext={handleStep5Next} onBack={() => setStep(4)} />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Slide-in Panel (Step 6) */}
      <AnimatePresence>
        {step === 6 && chatOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ width: 540, opacity: 1, margin: 16 }}
            exit={{ opacity: 0, x: 20 }}
            className="h-[calc(100vh-32px)] shadow-2xl border border-gray-100 overflow-hidden shrink-0 flex flex-col bg-[#fafafa] rounded-2xl"
          >
              <div className="w-[540px] h-full flex flex-col p-6 overflow-y-auto">
                 {/* Top header */}
                 <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                   <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-lg shadow-sm">📄</div>
                   <div>
                     <h3 className="text-[14px] font-semibold text-gray-900 leading-tight">Intelligence Setup</h3>
                     <p className="text-[12px] text-gray-500 mt-0.5">Sandbox environment · Zeyro Intelligence</p>
                   </div>
                 </div>

                 {/* Agent Chat bubble */}
                 <div className="flex flex-col gap-3 px-1 mb-6">
                   <div className="flex items-center gap-2">
                     <img src="/o3.png" alt="Agent Icon" className="w-5 h-5 object-contain drop-shadow-sm" />
                     <span className="text-[12px] font-semibold text-gray-700">Zeyro Copilot</span>
                   </div>

                   <p className="text-[13px] text-gray-800 leading-[1.6]">
                     {agentResponse || "Configuring your workspace..."}
                   </p>

                   <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono mt-2">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                     -o- Identifying relevant intelligence products
                   </div>
                   <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                     Waiting for your input
                   </div>
                 </div>

                 {/* Question Card */}
                 {currentQuestion && (
                   <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col p-5">
                     {/* Card Header */}
                     <div className="flex items-center justify-between mb-5">
                       <div className="flex items-center gap-3 text-[12px] font-medium text-gray-400">
                         <button className="hover:text-gray-900 transition-colors">&lt;</button>
                         <span>{currentQuestion.step}/{currentQuestion.totalSteps}</span>
                         <button className="hover:text-gray-900 transition-colors">&gt;</button>
                       </div>
                       <button className="text-gray-300 hover:text-gray-600 text-[18px] leading-none transition-colors">&times;</button>
                     </div>

                     <h4 className="text-[14px] font-semibold text-gray-900 mb-5 leading-snug">
                       {currentQuestion.question}
                     </h4>

                     <div className="flex flex-col gap-2 mb-6">
                       {currentQuestion.type === 'text' ? (
                         <textarea
                           value={textAnswer}
                           onChange={(e) => setTextAnswer(e.target.value)}
                           placeholder="Type your answer here..."
                           className="w-full min-h-[120px] p-4 text-[13px] border border-gray-200 rounded-xl outline-none focus:border-gray-800 transition-colors resize-none"
                         />
                       ) : (
                         <>
                           {currentQuestion.options?.map((opt: any) => (
                             <button 
                               key={opt.id}
                               onClick={() => setSelectedQuestionOption(opt.id)}
                               className={`text-left p-3.5 rounded-xl border transition-all flex justify-between items-start ${selectedQuestionOption === opt.id ? 'border-gray-800 bg-gray-50' : 'border-transparent hover:bg-gray-50 hover:border-gray-100'}`}
                             >
                               <div>
                                 <div className={`text-[13px] font-medium ${selectedQuestionOption === opt.id ? 'text-gray-900' : 'text-gray-700'}`}>{opt.title}</div>
                                 <div className="text-[12px] text-gray-500 mt-1">{opt.description}</div>
                               </div>
                               {opt.recommended && (
                                 <span className="bg-[#e8f0fe] text-[#1967d2] text-[10px] font-semibold px-2 py-0.5 rounded ml-3 shrink-0">Recommended</span>
                               )}
                             </button>
                           ))}
                           <button 
                             onClick={() => setSelectedQuestionOption('custom_other')}
                             className={`text-left p-3.5 rounded-xl border transition-all text-[13px] font-medium text-gray-500 ${selectedQuestionOption === 'custom_other' ? 'border-gray-800 bg-gray-50 text-gray-900' : 'border-transparent hover:bg-gray-50 hover:border-gray-100'}`}
                           >
                             Something else
                           </button>
                         </>
                       )}
                     </div>

                     {/* Card Footer */}
                     <div className="flex gap-3">
                       <button 
                         onClick={handleAnswerSubmit}
                         disabled={isSubmitting || (currentQuestion.type === 'text' ? !textAnswer.trim() : !selectedQuestionOption)}
                         className="flex-1 py-3 bg-[#f5f5f5] hover:bg-[#ebebeb] text-gray-700 text-[13px] font-medium rounded-xl transition-colors disabled:opacity-50"
                       >
                         {currentQuestion.type === 'text' ? 'Submit' : 'Decide this one'}
                       </button>
                     </div>
                   </div>
                 )}
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
