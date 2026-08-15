'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import RomanFooter from '@/components/Home/RomanFooter';
import BFSGetStarted from '@/components/BFS/BFSGetStarted';
import styles from './page.module.css';
import { Activity, Gift, CheckCircle, FileText, MousePointer2, Loader2, Grab, Database } from 'lucide-react';
import { useInView, AnimatePresence } from 'framer-motion';


// ─── Spade carousel data ──────────────────────────────────────────────────────
const CAROUSEL = [
    {
        left: { id: '30012128618', location: 'BANDRA KURLA COMPLEX,\nMUMBAI, MAHARASHTRA 400051,\nINDIA\n(19.0664, 72.8654)' },
        right: { merchant: 'Zomato', logo: 'https://www.google.com/s2/favicons?domain=zomato.com&sz=128', date: '2025-09-27 09:23:16', amount: '-₹349.00' },
    },
    {
        left: { id: '59920194882', location: 'KORAMANGALA,\nBENGALURU, KARNATAKA 560034,\nINDIA\n(12.9279, 77.6271)' },
        right: { merchant: 'Swiggy', logo: 'https://www.google.com/s2/favicons?domain=swiggy.com&sz=128', date: '2025-09-28 14:10:05', amount: '-₹520.00' },
    },
    {
        left: { id: '88204910294', location: 'CONNAUGHT PLACE,\nNEW DELHI, DELHI 110001,\nINDIA\n(28.6304, 77.2177)' },
        right: { merchant: 'HDFC Bank', logo: 'https://www.google.com/s2/favicons?domain=hdfcbank.com&sz=128', date: '2025-09-29 16:45:22', amount: '-₹12,500.00' },
    },
];

const HEADLINE_WORDS = ['We add behavioural intelligence', 'to financial data.'];




// ─── Spade section ────────────────────────────────────────────────────────────
function SpadeSection() {
    const [idx, setIdx] = useState(0);
    const [cardKey, setCardKey] = useState(0);
    const [enterFrom, setEnterFrom] = useState<'left' | 'right'>('left');
    const [busy, setBusy] = useState(false);

    // Parallax ref for topo coin
    const parallaxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let raf: number;
        const handleScroll = () => {
            if (!parallaxRef.current) return;
            const rect = parallaxRef.current.getBoundingClientRect();
            // Calculate distance from center of viewport
            const centerOffset = (window.innerHeight / 2) - (rect.top + rect.height / 2);
            // Parallax factor: drifting slightly in the opposite direction of scroll
            const drift = centerOffset * -0.12;
            parallaxRef.current.style.transform = `translateY(${drift}px)`;
        };
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(handleScroll);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        handleScroll(); // Initial position
        return () => {
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(raf);
        };
    }, []);

    const go = (dir: 'prev' | 'next') => {
        if (busy) return;
        setBusy(true);
        // cards enter from opposite direction of navigation intent
        setEnterFrom(dir === 'next' ? 'right' : 'left');
        setTimeout(() => {
            setIdx(p => dir === 'next' ? (p + 1) % CAROUSEL.length : (p - 1 + CAROUSEL.length) % CAROUSEL.length);
            setCardKey(k => k + 1);
            setBusy(false);
        }, 220);
    };

    const data = CAROUSEL[idx];
    const leftClass = `${styles.terminalCard} ${enterFrom === 'right' ? styles.fromRight : styles.fromLeft}`;
    const rightClass = `${styles.merchantCard}  ${enterFrom === 'right' ? styles.fromRight : styles.fromLeft}`;

    return (
        <section className={styles.spadeSection}>

            {/* ── Headline ──────────────────────────────────────────── */}
            <div className={styles.spadeHeadlineWrap}>
                <motion.h2 
                    className={styles.spadeHeadline}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.065 } }
                    }}
                >
                    {HEADLINE_WORDS.map((w, i) => (
                        <motion.span 
                            key={i} 
                            className={styles.spadeWord} 
                            style={{ display: 'block' }}
                            variants={{
                                hidden: { opacity: 0, y: 22 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } }
                            }}
                        >
                            {w}
                        </motion.span>
                    ))}
                </motion.h2>
            </div>

            {/* ── Stage ─────────────────────────────────────────────── */}
            <motion.div 
                className={styles.spadeStage}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } }
                }}
            >

                {/* Left arrow */}
                <button className={`${styles.spadeArrow} ${styles.spadeArrowLeft}`} onClick={() => go('prev')} aria-label="Previous">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#000"><path d="M15 18l-6-6 6-6z" /></svg>
                </button>

                {/* Left terminal card */}
                <div className={styles.spadeCardWrap}>
                    <div key={`left-${cardKey}`} className={leftClass}>
                        <div className={styles.terminalBox}>
                            <div className={styles.terminalLabel}>
                                <svg width="4" height="6" viewBox="0 0 4 6" fill="#000"><path d="M0 0l4 3-4 3V0z" /></svg>
                                Transaction ID
                            </div>
                            <div className={styles.terminalValue}>{data.left.id}</div>
                        </div>
                        <div className={styles.terminalBox}>
                            <div className={styles.terminalLabel}>
                                <svg width="4" height="6" viewBox="0 0 4 6" fill="#000"><path d="M0 0l4 3-4 3V0z" /></svg>
                                Location
                            </div>
                            <div className={styles.terminalValue} style={{ whiteSpace: 'pre-line' }}>{data.left.location}</div>
                        </div>
                    </div>
                </div>

                {/* Central topo object with parallax ref */}
                <div className={styles.topoPerspective} ref={parallaxRef}>
                    <div className={styles.topoSpinner}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/tools_coin.png" alt="Zeyro Coin" className={styles.topoImg} />
                    </div>
                </div>

                {/* Right merchant card */}
                <div className={styles.spadeCardWrap}>
                    <div key={`right-${cardKey}`} className={rightClass}>
                        <div className={styles.merchantLogo}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={data.right.logo} alt={data.right.merchant} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div className={styles.merchantInfoRow}>
                            <div className={styles.merchantDetails}>
                                <div className={styles.merchantName}>{data.right.merchant}</div>
                                <div className={styles.merchantDate}>{data.right.date}</div>
                            </div>
                            <div className={styles.merchantAmount}>{data.right.amount}</div>
                        </div>
                    </div>
                </div>

                {/* Right arrow */}
                <button className={`${styles.spadeArrow} ${styles.spadeArrowRight}`} onClick={() => go('next')} aria-label="Next">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#000"><path d="M9 18l6-6-6-6z" /></svg>
                </button>
            </motion.div>

            {/* ── Dot indicators ────────────────────────────────────── */}
            <div className={styles.spadeDots}>
                {CAROUSEL.map((_, i) => (
                    <button
                        key={i}
                        className={`${styles.spadeDot} ${i === idx ? styles.spadeDotActive : ''}`}
                        onClick={() => { if (i !== idx) { setEnterFrom(i > idx ? 'right' : 'left'); setIdx(i); setCardKey(k => k + 1); } }}
                        aria-label={`Slide ${i + 1}`}
                    />
                ))}
            </div>

            {/* ── Sub-headline + CTA ────────────────────────────────── */}
            <div className={styles.spadeSubWrap}>
                <p className={styles.spadeSubheadline}>
                    We convert raw transactions into structured behavioral signals in real time.
                </p>
            </div>

        </section>
    );
}

// ─── Custom Hook for Responsiveness ──────────────────────────────────────────
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    return isMobile;
}

// ─── Infinite Marquee Section ─────────────────────────────────────────────────
const MARQUEE_LOGOS = [
    'FIS', 'Citizens Bank', 'Stripe', 'Cash App Pay', 'Square', 'Plaid', 'Chime', 'Affirm'
];

function MarqueeSection() {
    const [inView, setInView] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                observer.disconnect();
            }
        }, { threshold: 0.2 });

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    // We duplicate the logos array once to create the seamless infinite scroll effect
    const duplicatedLogos = [...MARQUEE_LOGOS, ...MARQUEE_LOGOS];

    return (
        <section
            ref={sectionRef}
            className={styles.marqueeSection}
            style={{ opacity: inView ? 1 : 0 }}
        >
            <div className={styles.marqueeText}>
                Enriching billions of transactions for category-defining fintechs &amp; Fortune 500 banks every month
            </div>
            <div className={styles.marqueeContainer}>
                <div className={styles.marqueeTrack}>
                    {/* The track must be exactly 200% width and translate to -50% to loop perfectly. */}
                    {duplicatedLogos.map((logo, i) => (
                        <div key={`${logo}-${i}`} className={styles.marqueeTextLogo}>
                            {logo}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Chaos Cards Data & Component ─────────────────────────────────────────────
type ChaosCardData =
    | { type: 'raw', label: string, content: string, startX: number, startY: number, endX: number, endY: number, delay: number }
    | { type: 'pill', title: string, category: string, amount: string, startX: number, startY: number, endX: number, endY: number, delay: number };

const CHAOS_CARDS: ChaosCardData[] = [
    // Top Center
    { type: 'raw', label: '► LOCATION', content: 'MUMBAI, MH 400001', startX: 0, startY: -600, endX: -50, endY: -280, delay: 0.02 },
    // Top Right
    { type: 'pill', title: 'AMAZON WEB SVCS*829', category: 'Cloud Services', amount: '-₹12,499.00', startX: 600, startY: -400, endX: 380, endY: -240, delay: 0.05 },
    // Mid Left
    { type: 'raw', label: '► CATEGORY', content: 'MCC: 7372\nAWS*BENGALURU', startX: -600, startY: -100, endX: -520, endY: -120, delay: 0.03 },
    // Mid Right
    { type: 'raw', label: '► LOCATION', content: 'BENGALURU, KA', startX: 600, startY: 0, endX: 480, endY: -80, delay: 0.07 },
    // Far Mid Right
    { type: 'raw', label: '► LOCATION', content: 'HYDERABAD, TS', startX: 800, startY: 100, endX: 600, endY: 60, delay: 0.06 },
    // Bottom Left Pill
    { type: 'pill', title: 'HPCL PUMP 5291', category: 'Fuel', amount: '-₹2,500.00', startX: -600, startY: 300, endX: -460, endY: 220, delay: 0.09 },
    // Bottom Left Raw
    { type: 'raw', label: '► CATEGORY', content: 'MCC: 2323\nCARD*9829', startX: -500, startY: 500, endX: -550, endY: 320, delay: 0.12 },
    // Bottom Center
    { type: 'raw', label: '► MERCHANT', content: 'RELIANCE SMART 288', startX: 0, startY: 600, endX: -50, endY: 320, delay: 0.1 },
    // Bottom Right Raw
    { type: 'raw', label: '► MERCHANT', content: 'PVR CINEMAS 428', startX: 500, startY: 500, endX: 420, endY: 260, delay: 0.14 },
    // Bottom Right Pill
    { type: 'pill', title: 'AMAZON PAY*IN', category: 'Shopping', amount: '-₹1,240.00', startX: 400, startY: 600, endX: 360, endY: 380, delay: 0.16 },
];

const RANDOM_AMOUNTS = ['-₹129.00', '-₹520.50', '-₹99.00', '-₹12,499.00', '-₹349.00', '-₹2,500.00', '-₹45.00', '-₹890.00', '-₹199.00', '-₹15,000.00'];
const RANDOM_IDS = ['HY24824', 'MG28323', 'JU24829', 'KL92830', 'XR88210', 'NM92810', 'TR48291', 'PL20394'];

import { useMotionValueEvent, useMotionValue } from 'framer-motion';

function ChaosCard({ card, scrollYProgress }: { card: ChaosCardData, scrollYProgress: any }) {
    // All cards fly in perfectly synchronized between 0.02 and 0.15 scroll progress
    const ANIM_START = 0.02;
    const ANIM_END = 0.15;

    const isMobile = useIsMobile();
    
    // Scale down horizontal displacement on mobile to prevent overflow
    const mobileEndLimit = 140; // max horizontal px from center
    const adjustedEndX = isMobile 
        ? Math.max(-mobileEndLimit, Math.min(mobileEndLimit, card.endX * 0.3)) 
        : card.endX;
    const adjustedEndY = isMobile ? card.endY * 0.8 : card.endY;

    const x = useTransform(scrollYProgress, [ANIM_START, ANIM_END], [card.startX * (isMobile ? 0.4 : 1), adjustedEndX]);
    const y = useTransform(scrollYProgress, [ANIM_START, ANIM_END], [card.startY * (isMobile ? 0.4 : 1), adjustedEndY]);
    const opacity = useTransform(scrollYProgress, [ANIM_START, ANIM_END - 0.05], [0, 1]);

    const [tick, setTick] = useState(0);

    useMotionValueEvent(scrollYProgress, "change", (latest: number) => {
        // Change tick every 0.005 scroll units to simulate fast streaming data
        const newTick = Math.floor(latest * 200);
        if (newTick !== tick) setTick(newTick);
    });

    const hash = Math.floor(card.delay * 100);
    const displayAmount = card.type === 'pill' ? RANDOM_AMOUNTS[(tick + hash) % RANDOM_AMOUNTS.length] : '';
    const displayId = RANDOM_IDS[(tick + hash + 3) % RANDOM_IDS.length];

    const displayRawContent = card.type === 'raw'
        ? card.content.replace(/STORE [A-Z0-9]+/, `STORE ${displayId}`).replace(/GAS STAT[0-9]+/, `GAS STAT${displayId.slice(0, 4)}`)
        : '';

    const displayPillTitle = card.type === 'pill'
        ? card.title.replace(/[A-Z0-9]{7}$/, displayId)
        : '';

    return (
        <motion.div style={{ x, y, opacity }} className={styles.chaosCardWrap}>
            {card.type === 'raw' ? (
                <div className={styles.chaosRawCard}>
                    <span className={styles.rawLabel}>{card.label}</span>
                    {displayRawContent}
                </div>
            ) : (
                <div className={styles.chaosPillCard}>
                    <div className={styles.pillIcon}><Activity size={16} /></div>
                    <div className={styles.pillContent}>
                        <div className={styles.pillTitle}>{displayPillTitle}</div>
                        <div className={styles.pillCategory}>{card.category}</div>
                    </div>
                    <div className={styles.pillAmount}>{displayAmount}</div>
                </div>
            )}
        </motion.div>
    );
}

// ─── Enrichment Scroll Sequence ────────────────────────────────────────────────
function EnrichmentScrollSequence() {
    const isMobile = useIsMobile();
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: rawScrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });
    const scrollYProgress = useSpring(rawScrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // ── Phase mappings ──

    // Background color: Dark Green -> Muted Sage -> Off-white Grid
    const bgColor = useTransform(
        scrollYProgress,
        [0.15, 0.3],
        ['#004170', '#F0F8FF']
    );

    // Chaos Phase (0.0 to 0.3)
    // Both text and cards hold at full opacity until 0.2, then both fade from 1 to 0 exactly together (0.2->0.3)
    const problemOpacity = useTransform(scrollYProgress, [0, 0.2, 0.3], [1, 1, 0]);
    const chaosOpacity = useTransform(scrollYProgress, [0, 0.05, 0.2, 0.3], [0, 1, 1, 0]);

    // Grid Transition (0.3 to 0.4)
    const gridOpacity = useTransform(scrollYProgress, [0.25, 0.35], [0, 1]);

    // Upward drift for chaos cards as they fade out (0.2 to 0.3)
    const chaosY = useTransform(scrollYProgress, [0.2, 0.3], [0, -150]);

    // Solution Phase (0.4 to 0.6)
    const solutionOpacity = useTransform(scrollYProgress, [0.35, 0.5], [0, 1]);
    const terminalOpacity = useTransform(scrollYProgress, [0.4, 0.5], [0, 1]);
    const terminalY = useTransform(scrollYProgress, [0.4, 0.5], [40, 0]);

    // Enrichment Sequences (0.6 to 0.9)
    const enrich1 = useTransform(scrollYProgress, [0.55, 0.6], [0, 1]);
    const enrich2 = useTransform(scrollYProgress, [0.6, 0.65], [0, 1]);
    const enrich3 = useTransform(scrollYProgress, [0.65, 0.7], [0, 1]);
    const enrich4 = useTransform(scrollYProgress, [0.7, 0.75], [0, 1]);
    const enrich5 = useTransform(scrollYProgress, [0.75, 0.8], [0, 1]);
    const enrich6 = useTransform(scrollYProgress, [0.8, 0.85], [0, 1]);

    // Card Layout Transition (0.35 to 0.5)
    const cardWidth = useTransform(scrollYProgress, [0.35, 0.5], ['88%', '100%']);
    const cardHeight = useTransform(scrollYProgress, [0.35, 0.5], ['82svh', '100svh']);
    const cardMaxWidth = useTransform(scrollYProgress, [0.35, 0.5], ['1400px', '100%']);
    const cardRadius = useTransform(scrollYProgress, [0.35, 0.5], [80, 0]);
    const cardShadow = useTransform(
        scrollYProgress,
        [0.35, 0.5],
        ['0 40px 100px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)', '0 0 0 rgba(0,0,0,0), 0 0 0 rgba(0,0,0,0)']
    );

    return (
        <section ref={containerRef} className={styles.enrichmentScrollContainer}>
            <div className={styles.enrichmentStickyCanvas}>
                <motion.div
                    className={styles.enrichmentCard}
                    style={{
                        backgroundColor: bgColor,
                        width: cardWidth,
                        height: cardHeight,
                        borderRadius: cardRadius,
                        boxShadow: cardShadow,
                        maxWidth: cardMaxWidth,
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    {/* Crosshatch Grid Background */}
                    <motion.div className={styles.enrichmentGrid} style={{ opacity: gridOpacity }} />

                    <div className={styles.enrichmentContentWrap}>

                        {/* Phase 1 & 2: Static Entry & Chaos */}
                        <motion.div className={styles.chaosLayer} style={{ opacity: chaosOpacity, y: chaosY }}>
                            {CHAOS_CARDS.map((card, i) => (
                                <ChaosCard key={i} card={card} scrollYProgress={scrollYProgress} />
                            ))}
                        </motion.div>

                        <motion.h2 className={styles.enrichmentProblem} style={{ opacity: problemOpacity }}>
                            <span style={{ color: '#fff' }}>Billions of transactions happen daily across global finance. </span>
                            <span style={{ color: '#d6ff3f' }}>But without structure, most of that data becomes noise.</span>
                        </motion.h2>

                        {/* Phase 4 & 5: Solution & Enrichment */}
                        <motion.h2 className={styles.enrichmentSolution} style={{ opacity: solutionOpacity }}>
                            Zeyro transforms fragmented financial data into structured, behavior-driven intelligence -
enabling institutions to move from reactive systems to predictive decision-making in real time. 

                        </motion.h2>

                        {/* API Workspace Overlay */}
                        <motion.div className={styles.apiWorkspace} style={{ opacity: terminalOpacity }}>
                            {/* JSON Terminal Input */}
                            <motion.div className={styles.jsonTerminal} style={{ y: terminalY }}>
                                <div className={styles.terminalHeader}>
                                    <div className={`${styles.macDot} ${styles.macRed}`} />
                                    <div className={`${styles.macDot} ${styles.macYellow}`} />
                                    <div className={`${styles.macDot} ${styles.macGreen}`} />
                                    <div className={styles.terminalTab}>cURL - POST /v1/enrich</div>
                                </div>
                                <div className={styles.terminalBody}>
                                    <span className={styles.jsonKey}>&quot;de43&quot;:</span> <span className={styles.jsonString}>&quot;AMAZON WEB SVCS*8291 BLR KA&quot;</span>,<br />
                                    <span className={styles.jsonKey}>&quot;userId&quot;:</span> <span className={styles.jsonString}>&quot;csv_11_0_1.csv.gz&quot;</span>,<br />
                                    <span className={styles.jsonKey}>&quot;amount&quot;:</span> <span className={styles.jsonString}>-12499.00</span>,<br />
                                    {/* The transactionId types in at the end (enrich6) */}
                                    <motion.span style={{ opacity: enrich6 }}>
                                        <span className={styles.jsonKey}>&quot;transactionId&quot;:</span> <span className={styles.jsonString}>&quot;38012128618&quot;</span>
                                    </motion.span>
                                    <span className={styles.jsonPulsingCursor} />
                                </div>
                            </motion.div>

                            {/* Enriched Outputs - Sequentially Revealed */}
                            <motion.div className={`${styles.enrichedNode} ${styles.nodeMerchant}`} style={{ opacity: enrich1 }}>
                                <span className={styles.nodeLabel}>► MERCHANT</span> AMAZON WEB SERVICES / AWS
                            </motion.div>

                            {!isMobile ? (
                                <>
                                    <motion.div className={`${styles.enrichedNode} ${styles.nodeLocation}`} style={{ opacity: enrich2 }}>
                                        <span className={styles.nodeLabel}>► LOCATION</span> ELECTRONIC CITY, BENGALURU, KA
                                    </motion.div>
                                    <motion.div className={`${styles.enrichedNode} ${styles.nodeCategory}`} style={{ opacity: enrich3 }}>
                                        <span className={styles.nodeLabel}>► CATEGORY</span> CLOUD COMPUTING
                                    </motion.div>
                                </>
                            ) : null}

                            {/* Center Resolved Card */}
                            <motion.div className={styles.nodeCard} style={{ opacity: enrich4 }}>
                                <div className={styles.merchantLogo}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=128" alt="AWS" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                                <div className={styles.merchantInfoRow}>
                                    <div className={styles.merchantDetails}>
                                        <div className={styles.merchantName}>AWS - Asia Pacific (Mumbai)</div>
                                        <div className={styles.merchantDate}>2025-09-27 09:23:16</div>
                                    </div>
                                    <div className={styles.merchantAmount}>-₹12,499.00</div>
                                </div>
                            </motion.div>

                            {/* Map Tile */}
                            <motion.div className={styles.nodeMap} style={{ opacity: enrich5 }}>
                                <div className={styles.mapPin}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                                </div>
                            </motion.div>

                            {/* API Key & Latency */}
                            <motion.div className={`${styles.enrichedNode} ${styles.nodeApiKey}`} style={{ opacity: enrich6 }}>
                                [API KEY] sk_live_8392...
                            </motion.div>

                            <motion.div className={`${styles.enrichedNode} ${styles.nodeLatency}`} style={{ opacity: enrich6 }}>
                                LATENCY ████████ 50MS
                            </motion.div>

                        </motion.div>

                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// ─── Rewards Section ──────────────────────────────────────────────────────────
const REWARDS_DATA = [
    {
        id: 1,
        merchant: 'Behavior Detected',
        logo: 'https://www.google.com/s2/favicons?domain=zomato.com&sz=128', // Indian food delivery
        amount: '₹180',
        date: '11:47 PM',
        behaviourTag: 'Stress-driven spend',
        pattern: 'Late-night transaction spike (4th instance this week)',
        payCycle: 'Mid-cycle (Day 18 of 30)',
        moodSignal: 'Elevated spend under high workload conditions',
        rewardSignal: 'Delay credit exposure',
        insight: 'Offer controlled-limit products or cooling-period nudges',
        active: true
    },
    {
        id: 2,
        merchant: 'Behavior Detected',
        logo: 'https://www.google.com/s2/favicons?domain=blinkit.com&sz=128', // Indian quick commerce
        amount: '₹340',
        date: 'Sunday 8:12 AM',
        behaviourTag: 'Routine anchor spend',
        pattern: 'Weekly grocery transactions (₹800–₹1,200 range)',
        payCycle: 'Post-salary stability phase (Day 5–7)',
        moodSignal: 'Consistent spend, low volatility, predictable cash flow',
        rewardSignal: 'High subscription affinity',
        insight: 'Enable recurring products or bundled financial services',
        active: false
    },
    {
        id: 3,
        merchant: 'Behavior Detected',
        logo: 'https://www.google.com/s2/favicons?domain=makemytrip.com&sz=128', // Indian high-value travel
        amount: '₹1,100',
        date: '26th of month',
        behaviourTag: 'Planned high-value spend',
        pattern: 'Post-salary accumulation followed by large transaction',
        payCycle: 'Peak liquidity phase (Day 2–3)',
        moodSignal: 'High intent, financially prepared, low hesitation',
        rewardSignal: 'Pre-approved credit or premium offering window',
        insight: 'Maximize LTV through timely upsell',
        active: false
    }
];

function RewardsSection() {
    const isMobile = useIsMobile();
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { amount: 0.1, once: false });
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (isInView) {
            setStep(1); // Cursor appears
            const t1 = setTimeout(() => setStep(2), 1000); // Picking up doc
            const t2 = setTimeout(() => setStep(3), 2000); // Dragging to card
            const t3 = setTimeout(() => setStep(4), 2800); // Dropping / Processing
            const t4 = setTimeout(() => setStep(5), 4500); // Generating results
            const t5 = setTimeout(() => setStep(6), 5100); // Amazon
            const t6 = setTimeout(() => setStep(7), 5700); // Uber
            return () => { 
                clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); 
                clearTimeout(t4); clearTimeout(t5); clearTimeout(t6);
            };
        } else {
            setStep(0);
        }
    }, [isInView]);

    return (
        <section ref={containerRef} className={styles.rewardsSection}>
            <div className={styles.rewardsContainer}>
                <div className={styles.rewardsHeader}>

                    <h2 className={styles.rewardsTitle}>
                        Transactions tell you what happened.<br />
                        <span style={{ color: '#003366' }}>zeyro tells you what’s next.</span>
                    </h2>
                    <p className={styles.rewardsSubtitle}>
                        Behavioral intelligence on top of financial data - so every transaction becomes a decision opportunity.
                    </p>
                    <p className={styles.rewardsSupporting}>
                        Zeyro maps every transaction to behavior - not just category. Know why they bought, when they&apos;ll buy again, what makes them stay. We see behavior where others see transactions.
                    </p>
                    <div className={styles.rewardsCtaWrap}>
                        <Link href="/home" className={styles.rewardsBtnPrimary}>
                            See the API →
                        </Link>
                        <Link href="/request-access" className={styles.rewardsBtnGhost}>
                            Book a demo
                        </Link>
                    </div>
                </div>

                <div className={styles.rewardsVisual}>
                    <div className={styles.rewardsGridBg} />

                    {/* Cursor and Document Interaction */}
                    <AnimatePresence>
                        {step >= 1 && step < 4 && (
                            <motion.div
                                initial={{ x: 300, y: 150, opacity: 0 }}
                                animate={{ 
                                    x: step === 1 ? (isMobile ? 80 : 200) : (step === 2 ? (isMobile ? 80 : 200) : 0), 
                                    y: step === 1 ? (isMobile ? 40 : 80) : (step === 2 ? (isMobile ? 40 : 80) : 0),
                                    opacity: 1 
                                }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 1, ease: "anticipate" }}
                                style={{ 
                                    position: 'absolute', 
                                    zIndex: 50, 
                                    pointerEvents: 'none',
                                    color: '#000',
                                    left: '50%',
                                    top: '20%'
                                }}
                            >
                                {step >= 2 ? <Grab size={32} fill="currentColor" /> : <MousePointer2 size={32} fill="currentColor" />}
                                {step >= 2 && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -10 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        style={{ position: 'absolute', top: 20, left: 10, color: '#1e7e34' }}
                                    >
                                        <FileText size={44} strokeWidth={1.5} />
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Split Border Data Input Card */}
                    <motion.div
                        className={styles.criteriaCard}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className={styles.criteriaContent}>
                            <h3>Zeyro Intelligence Engine</h3>
                            <AnimatePresence mode="wait">
                                {step < 4 ? (
                                    <motion.p 
                                        key="waiting"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        Awaiting input...
                                    </motion.p>
                                ) : step === 4 ? (
                                    <motion.div 
                                        key="processing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className={styles.processingStatus}
                                    >
                                        <span>Analyzing metadata...</span>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="done"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{ fontSize: '0.75rem', lineHeight: '1.4' }}
                                    >
                                        <p>● 30B+ transactions processed</p>
                                        <p>● Behavioral tagging in &lt;100ms</p>
                                        <div className={styles.dataStreamsStatus}>
                                            <div className={styles.statusDot} />
                                            <span>Real-time intent & pattern detection</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className={styles.criteriaIcon}>
                            <motion.div>
                                <Database size={24} color={step >= 5 ? "#d4af37" : "#ccc"} />
                            </motion.div>
                        </div>
                    </motion.div>

                    <div className={styles.upiStat}>
                        ₹4 Trillion in annual transaction volume in 2025. Zero of it behaviourally enriched — until now.
                    </div>

                    <div className={styles.connectingLines}>
                        <motion.div 
                            className={styles.lineVerticalTop} 
                            animate={{ opacity: step >= 5 ? 1 : 0 }}
                        />
                        <motion.div 
                            className={styles.lineHorizontal} 
                            animate={{ 
                                scaleX: step >= 5 ? 1 : 0,
                                opacity: step >= 5 ? 1 : 0
                            }}
                            style={{ originX: 0.5 }}
                        />
                        <motion.div 
                            className={styles.lineVerticalBottom} 
                            animate={{ opacity: step >= 6 ? 1 : 0 }}
                        />
                        <motion.div 
                            className={styles.lineVerticalBottomLeft} 
                            animate={{ opacity: step >= 5 ? 1 : 0 }}
                        />
                        <motion.div 
                            className={styles.lineVerticalBottomRight} 
                            animate={{ opacity: step >= 7 ? 1 : 0 }}
                        />
                    </div>

                    <div className={styles.merchantRewardsGrid}>
                        {REWARDS_DATA.map((item, idx) => {
                            const isActivated = step >= (5 + idx);
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ 
                                        opacity: isActivated ? 1 : 0, 
                                        y: isActivated ? 0 : 20,
                                        boxShadow: isActivated ? '0 12px 30px rgba(212, 175, 55, 0.2)' : '0 4px 12px rgba(0,0,0,0.05)'
                                    }}
                                    className={`${styles.rewardCard} ${isActivated ? styles.rewardCardActive : ''}`}
                                    style={{ transition: 'all 0.5s ease' }}
                                >
                                    <div className={styles.rewardCardTop}>
                                        <div className={styles.merchantLogo}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={item.logo} alt={item.merchant} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </div>
                                        <div className={styles.merchantRewardInfo}>
                                            <div className={styles.merchantRewardName}>{item.merchant}</div>
                                            <div className={styles.merchantRewardDate}>{item.date}</div>
                                        </div>
                                        <div className={styles.merchantRewardAmount}>{item.amount}</div>
                                    </div>
                                    <div className={`${styles.rewardPill} ${isActivated ? styles.rewardPillActive : ''}`} style={{ transition: 'all 0.5s' }}>
                                        <div className={styles.rewardPillLabel}>
                                            {isActivated ? 'Behaviour Enriched' : 'Transaction Verified'}
                                        </div>
                                        <div className={styles.rewardPillPoints}>
                                            {isActivated ? (
                                                <motion.span 
                                                    animate={{ opacity: [1, 0.4, 1] }} 
                                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                                    style={{ color: '#e67e22', fontSize: '1.2rem', fontWeight: 700 }}
                                                >
                                                    ↝
                                                </motion.span>
                                            ) : (
                                                <CheckCircle size={14} color="#999" />
                                            )}
                                        </div>
                                    </div>

                                    {isActivated && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className={styles.behaviourDetail}
                                        >
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Behavior Type</span>
                                                <span className={styles.detailValue}>{item.behaviourTag}</span>
                                            </div>
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Pattern</span>
                                                <span className={styles.detailValue}>{item.pattern}</span>
                                            </div>
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Financial Window</span>
                                                <span className={styles.detailValue}>{item.payCycle}</span>
                                            </div>
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>State Signal</span>
                                                <span className={styles.detailValue}>{item.moodSignal}</span>
                                            </div>
                                            
                                            <div className={styles.behaviourDivider} />

                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Decision Trigger</span>
                                                <span className={styles.detailValue} style={{ color: '#e67e22', fontWeight: 600 }}>{item.rewardSignal}</span>
                                            </div>
                                            <div className={styles.insightBox}>
                                                {item.insight}
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Decorative particles */}
                    {step >= 5 && [...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={styles.dataParticle}
                            initial={{
                                x: i % 2 === 0 ? -100 : 100,
                                y: 100 + i * 40,
                                opacity: 0
                            }}
                            animate={{
                                x: 0,
                                y: -200,
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                repeat: Infinity,
                                delay: i * 0.5,
                                ease: "easeOut"
                            }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Dispute Section ──────────────────────────────────────────────────────────

// ─── Custom Footer ────────────────────────────────────────────────────────────
function CustomFooter() {
    return (
        <footer className={styles.customFooter}>
            <div className={styles.footerMain}>
                {/* Left Side: Logo & Copyright */}
                <div className={styles.footerLeft}>
                    <div className={styles.footerLogo}>
                        zeyro
                    </div>
                    
                    <div className={styles.footerBottomLeft}>
                        <div className={styles.bottomLinks}>
                            <Link href="/privacy">Privacy Policy</Link>
                            <Link href="/terms">Terms of Service</Link>
                        </div>
                    </div>
                </div>

                {/* Right Side: CTA */}
                <div className={styles.footerRight}>
                    <div className={styles.footerCtaWrap}>
                        <h2 className={styles.footerCtaTitle}>See it running in your systems in no time.</h2>
                        <p className={styles.footerCtaDesc}>
                          You choose the pipeline. We turn it into behavioural intelligence - live, in your environment, in weeks not months.
                        </p>
                        <Link href="/request-access" className={styles.footerCtaBtn}>
                            REQUEST ACCESS
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BusinessPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Simple fade-in when video is ready — no RAF loop needed
    const handleCanPlay = () => {
        if (videoRef.current) videoRef.current.style.opacity = '1';
    };

    return (
        <div className={styles.page}>
            <Navigation dynamicBlend={true} />

            {/* ── Cinematic hero — video fills full viewport ─────────── */}
            <section className={styles.hero}>
                {/* background video — fades in once ready */}
                <video
                    ref={videoRef}
                    className={styles.heroVideo}
                    src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4"
                    autoPlay muted playsInline loop
                    onCanPlay={handleCanPlay}
                    style={{ opacity: 0 }}
                />
                {/* dark overlay for readability */}
                <div className={styles.heroOverlay} />

                {/* content above overlay */}
                <div className={styles.heroContent}>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/25 text-white text-xs font-bold uppercase tracking-[0.2em] mb-6 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        Coming Soon
                    </div>
                    <h1 className={`${styles.headline} ${styles.animFadeRise}`}>
                        The data & behavioural intelligence<br />
                        <span className={styles.headlineGray}>for financial institutions</span>
                    </h1>
                    <p className={`${styles.heroDescription} ${styles.animFadeRiseDelay}`}>
                        Zeyro transforms transaction data into real-time behavioral signals -  enabling banks, NBFCs, and fintechs to make smarter credit, risk, and engagement decisions.
                    </p>
                    <button onClick={() => setModalOpen(true)} className={`${styles.heroBtn} ${styles.animFadeRiseDelay2} cursor-pointer`}>
                        GET IN TOUCH
                    </button>
                </div>
            </section>

            {/* ── Homepage Roman Footer ─────────────────────────────────────── */}
            <div className="bg-[#6321d2] w-full">
                <RomanFooter />
            </div>

            <BFSGetStarted isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        </div>
    );
}

