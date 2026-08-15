"use client";
import React, { useEffect, useRef, useState } from 'react';
import styles from '@/app/page.module.css';

const CAROUSEL = [
    {
        left: { id: '30012128618', location: 'ROCKEFELLER CENTER,\nMANHATTAN, NEW YORK 10020,\nUSA\n(40.7587, -73.9787)' },
        right: { merchant: 'DoorDash', logo: 'https://www.google.com/s2/favicons?domain=doordash.com&sz=128', date: '2025-09-27 09:23:16', amount: '-$349.00' },
    },
    {
        left: { id: '59920194882', location: 'PIER 39,\nTHE EMBARCADERO, SAN FRANCISCO 94133,\nUSA\n(37.8087, -122.4098)' },
        right: { merchant: 'Uber Eats', logo: 'https://www.google.com/s2/favicons?domain=ubereats.com&sz=128', date: '2025-09-28 14:10:05', amount: '-$520.00' },
    },
    {
        left: { id: '88204910294', location: 'HUDSON YARDS,\nNEW YORK, NY 10001,\nUSA\n(40.7538, -74.0022)' },
        right: { merchant: 'Chase Bank', logo: 'https://www.google.com/s2/favicons?domain=chase.com&sz=128', date: '2025-09-29 16:45:22', amount: '-$12,500.00' },
    },
];

const HEADLINE_WORDS = ['We add behavioural intelligence', 'to financial data.'];

export default function SpadeSection() {
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
                <h2 className={styles.spadeHeadline}>
                    {HEADLINE_WORDS.map((w, i) => (
                        <span key={i} className={styles.spadeWord} style={{ animationDelay: `${i * 65}ms`, display: 'block' }}>
                            {w}
                        </span>
                    ))}
                </h2>
            </div>

            {/* ── Stage ─────────────────────────────────────────────── */}
            <div className={styles.spadeStage}>

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
            </div>

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
