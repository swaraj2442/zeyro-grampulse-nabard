"use client";

import React from "react";
import { motion } from "framer-motion";
import Book3D from "./Book3D";
import type { Book3D as Book3DType } from "@/data/bookshelfData";
import { palette } from "@/data/bookshelfData";

// A group is either standing books or a flat stack
type BookGroup =
  | { type: "standing"; books: Book3DType[] }
  | { type: "flat"; books: Book3DType[] };

export default function Shelf3D({
  books,
  delay = 0,
  onSelect,
  leftDecor,
  rightDecor,
  decorations = {},
}: {
  books: Book3DType[];
  delay?: number;
  onSelect?: (id: string) => void;
  leftDecor?: React.ReactNode;
  rightDecor?: React.ReactNode;
  decorations?: Record<number, React.ReactNode>;
}) {
  // Split into groups based on orientation flag
  const groups: BookGroup[] = [];
  let currentStanding: Book3DType[] = [];
  let globalBookIndex = 0;

  for (const book of books) {
    if (book.width >= book.height) {
      // flat book — flush current standing group, start flat group
      if (currentStanding.length > 0) {
        groups.push({ type: "standing", books: currentStanding });
        currentStanding = [];
      }
      // collect consecutive flat books
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.type === "flat") {
        lastGroup.books.push(book);
      } else {
        groups.push({ type: "flat", books: [book] });
      }
    } else {
      currentStanding.push(book);
    }
  }
  if (currentStanding.length > 0) {
    groups.push({ type: "standing", books: currentStanding });
  }

  let renderIndex = 0;

  return (
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {/* Books Row */}
      <div className="relative z-10 flex items-end justify-center gap-6 px-6 pb-0 flex-nowrap pointer-events-none">
        
        {/* Left Decoration */}
        {leftDecor && (
          <div className="pointer-events-auto flex-shrink-0">
            {leftDecor}
          </div>
        )}

        {/* Books Groups */}
        <div className="flex items-end justify-center gap-3">
          {groups.map((group, gi) => {
            if (group.type === "flat") {
              // Flat stack on the right — books stacked vertically
              return (
                <div
                  key={`flat-${gi}`}
                  className="flex flex-col-reverse items-center justify-start gap-0 pointer-events-auto self-end"
                >
                  {group.books.map((book) => {
                    const currentIndex = renderIndex++;
                    return (
                      <React.Fragment key={book.id}>
                        <Book3D {...book} onSelect={onSelect} calculatedMarginLeft={0} />
                        {decorations[currentIndex] && (
                          <div className="pointer-events-auto flex-shrink-0 self-center z-20">
                            {decorations[currentIndex]}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              );
            }

            // Standing group — calculate per-book margin to prevent overlaps
            return (
              <div
                key={`standing-${gi}`}
                className="flex items-end justify-center gap-0 pointer-events-auto"
              >
                {group.books.map((book, i) => {
                  const currentIndex = renderIndex++;
                  const lean = book.leaning || 0;
                  const prevLean = i > 0 ? (group.books[i - 1].leaning || 0) : 0;
                  const prevHeight = i > 0 ? group.books[i - 1].height : 0;

                  // How far the previous book's top hangs over to the right
                  const prevOverhang = Math.tan((prevLean * Math.PI) / 180) * prevHeight;
                  // How far this book's top hangs over to the left
                  const myOverhang = Math.tan((lean * Math.PI) / 180) * book.height;

                  // Push base out only enough to prevent overlap at the widest point
                  const calculatedMarginLeft = Math.max(0, prevOverhang - myOverhang);

                  return (
                    <React.Fragment key={book.id}>
                      <Book3D
                        {...book}
                        onSelect={onSelect}
                        calculatedMarginLeft={calculatedMarginLeft}
                      />
                      {decorations[currentIndex] && (
                        <div className="pointer-events-auto flex-shrink-0 ml-4 mr-2">
                          {decorations[currentIndex]}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Right Decoration */}
        {rightDecor && (
          <div className="pointer-events-auto flex-shrink-0">
            {rightDecor}
          </div>
        )}
      </div>

      {/* ── 3D GLASS SHELF ────────────────────────────────── */}
      <div className="relative w-full" style={{ height: 40, marginTop: -15, zIndex: 0 }}>
        <svg viewBox="0 0 1000 40" preserveAspectRatio="none" className="w-full h-full drop-shadow-xl" style={{ filter: 'drop-shadow(0px 20px 15px rgba(0,0,0,0.1))' }}>
          <defs>
            {/* Top Surface Gradient */}
            <linearGradient id="topGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f1f5f9" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#cffafe" stopOpacity="0.8" />
            </linearGradient>
            {/* Front Face Gradient */}
            <linearGradient id="frontGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="15%" stopColor="#22d3ee" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.95" />
            </linearGradient>
            {/* Left Side Gradient */}
            <linearGradient id="leftSideGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#164e63" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>
            {/* Right Side Gradient */}
            <linearGradient id="rightSideGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#164e63" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Left Side Thickness */}
          <path d="M 0,24 L 30,0 L 30,16 L 0,40 Z" fill="url(#leftSideGrad)" />
          
          {/* Right Side Thickness */}
          <path d="M 1000,24 L 970,0 L 970,16 L 1000,40 Z" fill="url(#rightSideGrad)" />

          {/* Top Surface */}
          <path d="M 30,0 L 970,0 L 1000,24 L 0,24 Z" fill="url(#topGrad)" />
          
          {/* Top Surface Back Highlight Line */}
          <line x1="30" y1="0" x2="970" y2="0" stroke="#e2e8f0" strokeWidth="2" />

          {/* Front Face */}
          <path d="M 0,24 L 1000,24 L 1000,40 L 0,40 Z" fill="url(#frontGrad)" />
          
          {/* Front Face Bottom Shadow Line */}
          <line x1="0" y1="40" x2="1000" y2="40" stroke="#164e63" strokeWidth="2" opacity="0.6" />

          {/* Glass Glare Highlights on Front Face */}
          <polygon points="100,24 160,24 140,40 80,40" fill="#ffffff" opacity="0.3" />
          <polygon points="850,24 880,24 860,40 830,40" fill="#ffffff" opacity="0.2" />
        </svg>
      </div>
    </motion.div>
  );
}
