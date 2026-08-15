"use client";

import React, { forwardRef, useEffect, useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import styles from './Book.module.css';

// Import Pages
import CoverPage from './Pages/CoverPage';
import StateOfLogisticsPage from './Pages/StateOfLogisticsPage';
import IntelligentTrackingPage from './Pages/IntelligentTrackingPage';
import PredictiveMaintenancePage from './Pages/PredictiveMaintenancePage';
import RouteOptimizationPage from './Pages/RouteOptimizationPage';
import DriverSafetyPage from './Pages/DriverSafetyPage';
import SecurityCompliancePage from './Pages/SecurityCompliancePage';
import BusinessImpactPage from './Pages/BusinessImpactPage';
import FutureRoadmapPage from './Pages/FutureRoadmapPage';
import GlobalCoveragePage from './Pages/GlobalCoveragePage';
import FinalPage from './Pages/FinalPage';

const FlipBook = HTMLFlipBook as any;

const TOTAL_PAGES = 12;

const Page = forwardRef<HTMLDivElement, { children: React.ReactNode; number: number; isCover?: boolean; className?: string }>((props, ref) => {
  const isLeftPage = props.number % 2 === 0;
  
  let pageClass = `${styles.pageBase} text-white `;
  if (props.isCover) {
    pageClass += isLeftPage ? styles.coverLeft : styles.coverRight;
  } else {
    pageClass += isLeftPage ? styles.pageLeft : styles.pageRight;
  }
  
  if (props.className) {
    pageClass += ` ${props.className}`;
  }
  
  let shadowStr = '';
  
  if (!props.isCover) {
    let stackDepth = 0;
    const maxSheets = (TOTAL_PAGES - 2) / 2; // inner sheets = 5
    if (isLeftPage) {
      stackDepth = Math.max(0, (props.number - 2) / 2);
    } else {
      stackDepth = Math.max(0, maxSheets - Math.floor((props.number - 1) / 2));
    }
    
    const dirX = isLeftPage ? -1 : 1;
    shadowStr = isLeftPage 
      ? `inset -40px 0 50px -10px rgba(0,0,0,0.6), inset -10px 0 20px rgba(0,0,0,0.3), inset 2px 0 0px rgba(255,255,255,0.05)` 
      : `inset 40px 0 50px -10px rgba(0,0,0,0.6), inset 10px 0 20px rgba(0,0,0,0.3), inset -2px 0 0px rgba(255,255,255,0.05)`;
      
    // Scale depth visually (2 pixels per sheet for a chunkier book)
    const visualDepth = stackDepth * 2;
    
    for (let i = 1; i <= visualDepth; i++) {
      const color = i % 2 === 0 ? '#cfc6b5' : '#e0d8c8';
      shadowStr += `, ${i * dirX}px ${i}px 0px ${color}`;
    }
    
    // Hardcover edge & drop shadow
    const hcOffset = visualDepth + 1;
    shadowStr += `, ${hcOffset * dirX}px ${hcOffset}px 0px #0b1a17`;
    shadowStr += `, ${(hcOffset + 3) * dirX}px ${hcOffset + 3}px 15px rgba(0,0,0,0.4)`;
  }

  // Unique class name for this specific page number to apply the dynamic shadow
  const uniquePageClass = `dynamic-page-${props.number}`;
  pageClass += ` ${uniquePageClass}`;

  return (
    <div className={pageClass} ref={ref}>
      {!props.isCover && (
        <style>{`
          .${uniquePageClass} {
            box-shadow: ${shadowStr};
          }
        `}</style>
      )}
      <div className={styles.gloss}></div>
      <div className={styles.pageContent}>
        {props.children}
        {!props.isCover && (
          <div className={`absolute bottom-4 ${isLeftPage ? 'left-6' : 'right-6'} text-[10px] opacity-40 font-mono z-50`}>
            {props.number}
          </div>
        )}
      </div>
    </div>
  );
});
Page.displayName = 'Page';

export default function Book() {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 12;
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  let wrapperStateClass = styles.open;
  if (currentPage === 0) {
    wrapperStateClass = styles.closedFront;
  } else if (currentPage >= totalPages - 1) { 
    wrapperStateClass = styles.closedBack;
  }

  const handleFlip = (e: any) => {
    setCurrentPage(e.data);
  };

  const isActive = (pageNum: number) => {
    const idx = pageNum - 1;
    return currentPage === idx || currentPage + 1 === idx || (currentPage === 0 && idx === 0);
  };

  return (
    <div className={styles.bookSection}>
      <div className={`${styles.bookWrapper} w-full flex justify-center ${wrapperStateClass}`}>
        <FlipBook
          width={450}
          height={600}
          size="stretch"
          minWidth={315}
          maxWidth={1000}
          minHeight={400}
          maxHeight={1533}
          maxShadowOpacity={0.7}
          showCover={true}
          mobileScrollSupport={true}
          usePortrait={false}
          className={styles.flipBook}
          onFlip={handleFlip}
          useMouseEvents={true}
        >
          {/* Page 1: Cover */}
          <Page number={1} isCover={true} className="bg-[#0d1d1a]">
            <CoverPage isActive={isActive(1)} />
          </Page>

          {/* Page 2: State of Logistics */}
          <Page number={2} isCover={false}>
            <StateOfLogisticsPage isActive={isActive(2)} />
          </Page>

          {/* Page 3: Intelligent Tracking */}
          <Page number={3} isCover={false}>
            <IntelligentTrackingPage isActive={isActive(3)} />
          </Page>

          {/* Page 4: Predictive Maintenance */}
          <Page number={4} isCover={false}>
            <PredictiveMaintenancePage isActive={isActive(4)} />
          </Page>

          {/* Page 5: Route Optimization */}
          <Page number={5} isCover={false}>
            <RouteOptimizationPage isActive={isActive(5)} />
          </Page>

          {/* Page 6: Driver Safety */}
          <Page number={6} isCover={false}>
            <DriverSafetyPage isActive={isActive(6)} />
          </Page>

          {/* Page 7: Security & Compliance */}
          <Page number={7} isCover={false}>
            <SecurityCompliancePage isActive={isActive(7)} />
          </Page>

          {/* Page 8: Business Impact */}
          <Page number={8} isCover={false}>
            <BusinessImpactPage isActive={isActive(8)} />
          </Page>

          {/* Page 9: Future Roadmap */}
          <Page number={9} isCover={false}>
            <FutureRoadmapPage isActive={isActive(9)} />
          </Page>

          {/* Page 10: Global Coverage (Left Spread) */}
          <Page number={10} isCover={false} className="overflow-hidden">
            <GlobalCoveragePage isActive={isActive(10)} side="left" />
          </Page>

          {/* Page 11: Global Coverage (Right Spread) */}
          <Page number={11} isCover={false} className="overflow-hidden">
            <GlobalCoveragePage isActive={isActive(11)} side="right" />
          </Page>

          {/* Page 12: Back Cover */}
          <Page number={12} isCover={true} className="bg-[#0d1d1a]">
            <FinalPage isActive={isActive(12)} />
          </Page>
        </FlipBook>
      </div>
    </div>
  );
}
