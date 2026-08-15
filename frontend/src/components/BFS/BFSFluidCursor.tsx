'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

// EMIL DESIGN ENG: Optimized Particle Pool
const TRAIL_COUNT = 15;

export default function BFSFluidCursor() {
    const containerRef = useRef<HTMLDivElement>(null);
    const trailsRef = useRef<(HTMLDivElement | null)[]>([]);
    const feOffsetRedRef = useRef<SVGFEOffsetElement>(null);
    const feOffsetBlueRef = useRef<SVGFEOffsetElement>(null);
    
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    
    // Snappy, highly responsive spring config
    const springConfig = { damping: 20, stiffness: 400, mass: 0.2 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);
    
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Particle system variables for Trails
    const particles = useRef(Array.from({ length: TRAIL_COUNT }, () => ({
        x: 0, y: 0, scale: 0, active: false, age: 0, size: 0
    })));
    const particleIndex = useRef(0);
    const lastMouse = useRef({ x: 0, y: 0 });
    const isInitialized = useRef(false);

    // Velocity tracking for Prism Split
    const smoothedVelocity = useRef({ x: 0, y: 0 });

    // Particle physics loop (Trails fading/shrinking)
    useEffect(() => {
        let rafId: number;
        let lastTime = performance.now();

        const updateTrails = (time: number) => {
            const dt = (time - lastTime) / 1000;
            lastTime = time;

            // EMIL DESIGN ENG: Fix "choppy" movement by calculating velocity directly from 
            // Framer Motion's smooth 60fps spring, completely bypassing erratic mousemove events!
            const vx = springX.getVelocity() || 0;
            const vy = springY.getVelocity() || 0;

            // Smooth the output for the prism effect (gives a silky fluid feeling to the color split)
            smoothedVelocity.current.x += (vx - smoothedVelocity.current.x) * 0.1;
            smoothedVelocity.current.y += (vy - smoothedVelocity.current.y) * 0.1;

            // Dynamic Chromatic Aberration via SVG Filters
            if (feOffsetRedRef.current && feOffsetBlueRef.current) {
                // Adjust scale because spring velocity is in pixels/sec (e.g. can reach 2000+)
                const split = 0.005; 
                feOffsetRedRef.current.setAttribute('dx', `${-smoothedVelocity.current.x * split}`);
                feOffsetRedRef.current.setAttribute('dy', `${-smoothedVelocity.current.y * split}`);
                feOffsetBlueRef.current.setAttribute('dx', `${smoothedVelocity.current.x * split}`);
                feOffsetBlueRef.current.setAttribute('dy', `${smoothedVelocity.current.y * split}`);
            }

            // Update trails manually bypassing React
            particles.current.forEach((p, i) => {
                if (!p.active) return;
                p.age += dt;
                
                // Trail lifetime = 0.6 seconds
                const life = 1.0 - (p.age / 0.6);
                if (life <= 0) {
                    p.active = false;
                    if (trailsRef.current[i]) {
                        trailsRef.current[i]!.style.opacity = '0';
                    }
                    return;
                }

                if (trailsRef.current[i]) {
                    // Smoothly shrink and fade via CSS transform (GPU accelerated)
                    const scale = life * p.scale;
                    trailsRef.current[i]!.style.transform = `translate(${p.x}px, ${p.y}px) scale(${scale})`;
                    trailsRef.current[i]!.style.opacity = `${life * 0.8}`;
                }
            });

            rafId = requestAnimationFrame(updateTrails);
        };

        rafId = requestAnimationFrame(updateTrails);
        return () => cancelAnimationFrame(rafId);
    }, [springX, springY]);

    // Mouse tracking loop
    useEffect(() => {
        let rafId: number;
        const startTime = Date.now();

        if (typeof window !== 'undefined' && !isInitialized.current) {
            lastMouse.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            isInitialized.current = true;
        }

        const handleMove = (x: number, y: number) => {
            const dx = x - lastMouse.current.x;
            const dy = y - lastMouse.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            mouseX.set(x - 100);
            mouseY.set(y - 100);
            
            // Spawn trail if moving fast enough
            if (!isMobile && dist > 15) {
                const idx = particleIndex.current;
                const p = particles.current[idx];
                
                const size = Math.min(120, 60 + dist * 2);
                p.x = x - size / 2;
                p.y = y - size / 2;
                p.scale = 1.0;
                p.active = true;
                p.age = 0;
                p.size = size;

                if (trailsRef.current[idx]) {
                    trailsRef.current[idx]!.style.width = `${size}px`;
                    trailsRef.current[idx]!.style.height = `${size}px`;
                }

                particleIndex.current = (idx + 1) % TRAIL_COUNT;
            }
            
            lastMouse.current.x = x;
            lastMouse.current.y = y;
        };

        if (isMobile) {
            const updateMobile = () => {
                const elapsed = (Date.now() - startTime) * 0.001;
                const cw = containerRef.current?.offsetWidth || window.innerWidth;
                const ch = containerRef.current?.offsetHeight || window.innerHeight;
                
                const w = Math.min(600, cw * 0.4);
                const h = Math.min(300, ch * 0.2);
                
                const x = cw / 2 + w * Math.sin(elapsed * 1.5);
                const y = ch / 2 + h * Math.sin(elapsed * 3.0) / 2;
                
                lastMouse.current.x = x;
                lastMouse.current.y = y;
                
                mouseX.set(x - 100);
                mouseY.set(y - 100);
                rafId = requestAnimationFrame(updateMobile);
            };
            rafId = requestAnimationFrame(updateMobile);
        } else {
            const onMouseMove = (e: MouseEvent) => {
                // Prevent tracking if container doesn't exist
                if (!containerRef.current) return;
                
                // EMIL DESIGN ENG: Track relative to the card bounds, NOT the window viewport!
                // This ensures the cursor stays contained perfectly within the waitlist modal.
                const rect = containerRef.current.getBoundingClientRect();
                const relativeX = e.clientX - rect.left;
                const relativeY = e.clientY - rect.top;
                
                handleMove(relativeX, relativeY);
            };
            
            const onTouchMove = (e: TouchEvent) => {
                if (e.touches.length > 0 && containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const relativeX = e.touches[0].clientX - rect.left;
                    const relativeY = e.touches[0].clientY - rect.top;
                    handleMove(relativeX, relativeY);
                }
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('touchmove', onTouchMove, { passive: true });
            
            return () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('touchmove', onTouchMove);
            };
        }

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [isMobile, mouseX, mouseY]);

    const blobPaths = [
        'M100,50 C120,30 180,30 200,50 C220,70 220,130 200,150 C180,170 120,170 100,150 C80,130 80,70 100,50',
        'M100,40 C130,25 170,25 200,50 C225,75 225,125 200,150 C170,175 130,175 100,150 C75,125 75,75 100,40',
        'M100,45 C125,20 175,20 200,45 C225,70 230,130 200,155 C175,180 125,180 100,155 C70,130 75,70 100,45',
        'M100,35 C135,20 165,20 200,50 C230,80 230,120 200,150 C165,180 135,180 100,150 C70,120 70,80 100,35',
    ];

    return (
        <div
            ref={containerRef}
            // EMIL DESIGN ENG: Changed from 'fixed' to 'absolute' to contain it within the Card.
            // Added 'overflow-hidden' and 'z-0' so it sits neatly behind the form.
            className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
        >
            {/* SVG Filters for Gooey & Prism Split Effect */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id="goo-prism" x="-50%" y="-50%" width="200%" height="200%">
                        {/* 1. Goo Effect */}
                        <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -7"
                            result="goo"
                        />
                        
                        {/* 2. Prism Split (Chromatic Aberration) */}
                        <feColorMatrix in="goo" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
                        <feOffset ref={feOffsetRedRef} in="red" dx="0" dy="0" result="red_shifted" />
                        
                        <feColorMatrix in="goo" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
                        
                        <feColorMatrix in="goo" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
                        <feOffset ref={feOffsetBlueRef} in="blue" dx="0" dy="0" result="blue_shifted" />
                        
                        {/* Combine using Screen Blend Mode to create the chromatic fringes */}
                        <feBlend in="red_shifted" in2="green" mode="screen" result="rg" />
                        <feBlend in="rg" in2="blue_shifted" mode="screen" result="rgb_split" />

                        {/* EMIL DESIGN ENG: Place the original solid white blob ON TOP of the split colors.
                            This creates a solid white core with gorgeous prism light fringes! */}
                        <feMerge>
                            <feMergeNode in="rgb_split" />
                            <feMergeNode in="goo" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>

            {/* Container with goo-prism filter applied */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    filter: isMobile ? 'none' : 'url(#goo-prism)',
                    mixBlendMode: 'difference' 
                }}
            >
                {/* Trail Particles */}
                {!isMobile && Array.from({ length: TRAIL_COUNT }).map((_, i) => (
                    <div
                        key={i}
                        ref={(el) => { trailsRef.current[i] = el; }}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            borderRadius: '50%',
                            backgroundColor: 'white', 
                            opacity: 0,
                            pointerEvents: 'none',
                            willChange: 'transform, opacity',
                        }}
                    />
                ))}

                {/* Main Blob */}
                <motion.div
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        x: isMobile ? mouseX : springX,
                        y: isMobile ? mouseY : springY,
                        width: 200,
                        height: 200,
                        willChange: 'transform',
                    }}
                >
                    <svg
                        width="200"
                        height="200"
                        viewBox="0 0 200 200"
                        style={{ overflow: 'visible' }}
                    >
                        <motion.path
                            fill="white"
                            d={blobPaths[0]}
                            animate={{ d: blobPaths }}
                            transition={{
                                duration: 3.2,
                                ease: 'easeInOut',
                                repeat: Infinity,
                                repeatType: 'mirror'
                            }}
                        />
                    </svg>
                </motion.div>
            </div>
        </div>
    );
}
