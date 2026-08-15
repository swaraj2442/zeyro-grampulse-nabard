'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';
import { SOCIAL_LINKS } from '@/constants/socialLinks';

export default function Footer() {
    const [showFooter, setShowFooter] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Get the CTA section position
            const ctaSection = document.querySelector('[data-cta-section]');
            if (ctaSection) {
                const ctaRect = ctaSection.getBoundingClientRect();
                const ctaBottom = ctaRect.bottom;

                // Show footer sooner (trigger when CTA bottom is within 500px of viewport bottom)
                setShowFooter(ctaBottom < window.innerHeight + 500);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check initial state

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);



    const handleHomeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', '/home');
    };

    return (
        <footer className={`${styles.footer} ${showFooter ? styles.footerVisible : styles.footerHidden}`}>
            <div className={styles.container}>
                {/* Credits Column (was Contact Information) */}
                <div className={styles.column}>
                    <p className={styles.disclaimer}>
                        Take the first step toward <br></br>a calmer financial life.
                    </p>

                    {/* Social Media Icons */}
                    <div className={styles.socialIcons}>
                        <Link href={SOCIAL_LINKS.LINKEDIN} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </Link>
                        <Link href={SOCIAL_LINKS.TWITTER} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="X (Twitter)">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </Link>
                        <Link href={SOCIAL_LINKS.INSTAGRAM} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </Link>
                    </div>
                    <p className={styles.reachout}>Reach out to us at <a href="mailto:connect@zeyro.in" className={styles.emailLink}>connect@zeyro.in</a></p>
                    <p className={styles.copyright}>© 2026 • Zeyro. • All rights reserved. <Link href="/terms" className={styles.termsLink}>Terms and Conditions</Link> <Link href="/privacy" className={styles.termsLink}>Privacy Policy</Link></p>
                    <p className={styles.corporateaddress}><span className={styles.corporatehead}>corporate address:</span> <br />Room CEP B4 007, DA-IICT Centre, Near Indroda Circle, <br /> Gandhinagar- 382007, Gujarat, INDIA</p>

                </div>

                {/* Navigation Links Column */}
                <div className={styles.column}>
                    <a href="/home" onClick={handleHomeClick} className={styles.navLink}>Home</a>
                    <Link href="/home#features" className={styles.navLink}>Features</Link>
                    <Link href="/home#security" className={styles.navLink}>Security</Link>
                    <Link href="/zeyroAi" className={styles.navLink}>AI Insights</Link>
                    <Link href="/aboutus" className={styles.navLink}>About Us</Link>
                    <Link href="/feedback" className={styles.navLink}>
                        Feedback
                        <span className={styles.newBadge}>NEW</span>
                    </Link>
                </div>
            </div>
            {/* Large Brand Name Section - Now at Bottom */}
            <div className={styles.brandSection}>
                <h2 className={styles.brandName}>ZEYRO</h2>
            </div>
        </footer>
    );
}
