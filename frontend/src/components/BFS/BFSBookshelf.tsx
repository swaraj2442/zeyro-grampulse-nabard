"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Book from "@/components/Book/Book";
import Bookshelf from "@/components/Bookshelf/Bookshelf";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function BFSBookshelf() {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const guideRef = useRef<HTMLElement>(null);

  // Lock body scroll when book is open
  useEffect(() => {
    if (selectedBook) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedBook]);

  const openBook = useCallback((id: string) => {
    setSelectedBook(id);
    window.history.pushState({ bookOpen: id }, '', `#book-${id}`);
  }, []);

  const closeBook = useCallback(() => {
    if (window.location.hash.startsWith('#book-')) {
      window.history.back();
    } else {
      setSelectedBook(null);
    }
    setTimeout(() => {
      guideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (!window.location.hash.startsWith('#book-')) {
        setSelectedBook(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const customEaseOut = [0.23, 1, 0.32, 1] as const;

  return (
    <>
      <section ref={guideRef} className="py-24 relative overflow-hidden min-h-[90vh] flex flex-col justify-center bg-[#f5f5f5] border-t border-gray-50">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, transform: "scale(0.95)" }}
            whileInView={{ opacity: 1, transform: "scale(1)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: customEaseOut }}
          >
            <div className="text-left mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#17332e] tracking-tight text-balance">What is the Behavioural Financial Score?</h2>
              <p className="text-[#205b53]/80 mt-4 text-lg max-w-2xl font-medium">
                Unlike traditional credit scores that look backwards, BFS analyzes real-time behavioral patterns, operational logistics, and transaction signals to predict financial reliability with unprecedented accuracy. Read about it from our books on the shelf.
              </p>
            </div>
            <Bookshelf onSelect={openBook} />
          </motion.div>
        </div>
      </section>

      {/* Cinematic Book Overlay */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div
            key="book-overlay"
            className="fixed inset-0 z-[100] bg-[#f8f6f1] flex flex-col overflow-hidden"
            initial={{ clipPath: "circle(0% at 50% 50%)" }}
            animate={{ clipPath: "circle(150% at 50% 50%)" }}
            exit={{ clipPath: "circle(0% at 50% 50%)" }}
            transition={{ clipPath: { duration: 0.6, ease: customEaseOut } }}
          >
            <motion.div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, transparent 70%)" }}
              initial={{ opacity: 0.8, transform: "scale(0.5)" }}
              animate={{ opacity: 0, transform: "scale(2)" }}
              transition={{ duration: 0.5, ease: customEaseOut }}
            />

            <motion.div
              className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-black/5 bg-white/70 backdrop-blur-xl z-20"
              initial={{ opacity: 0, transform: "translateY(-60px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={{ opacity: 0, transform: "translateY(-60px)" }}
              transition={{ delay: 0.3, duration: 0.4, ease: customEaseOut }}
            >
              <button
                onClick={closeBook}
                className="group flex items-center gap-2 text-[#17332e] bg-white hover:bg-[#17332e] hover:text-white px-5 py-2.5 rounded-full font-bold shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 active:scale-[0.97]"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Shelf
              </button>
              <motion.span
                className="text-sm text-gray-400 font-medium bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100 shadow-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <span className="animate-pulse inline-block mr-1">👆</span> Drag corners or click edges to turn pages
              </motion.span>
            </motion.div>

            <motion.div
              className="flex-1 flex items-center justify-center overflow-hidden z-10"
              initial={{ opacity: 0, transform: "translateY(60px) scale(0.95)" }}
              animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
              exit={{ opacity: 0, transform: "translateY(40px) scale(0.96)" }}
              transition={{ delay: 0.25, duration: 0.5, ease: customEaseOut }}
            >
              <Book />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
