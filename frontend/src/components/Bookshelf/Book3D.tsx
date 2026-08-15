"use client";

import { motion } from "framer-motion";
import type { Book3D as Book3DType } from "@/data/bookshelfData";



export default function Book3D({
  id,
  title,
  coverColor,
  spineAccent,
  width,
  height,
  textColor,
  leaning = 0,
  calculatedMarginLeft = 0,
  onSelect,
}: Book3DType & { onSelect?: (id: string) => void; calculatedMarginLeft?: number }) {
  const isFlat = width >= height;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(id)}
      aria-label={`Open ${title}`}
      className="group block shrink-0 focus-visible:outline-none cursor-pointer relative transition-all duration-300 hover:brightness-125 hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
      style={{
        width,
        height,
        marginLeft: `${calculatedMarginLeft}px`,
      }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ originX: 0.5, originY: 1 }}
        initial={{ rotateZ: leaning }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {isFlat ? (
          /* ── FLAT / HORIZONTAL BOOK ─────────────────────────────── */
          <div className="relative w-full h-full">
            {/* Top face (lighter shade) */}
            <div
              className="absolute inset-x-0 top-0 rounded-t-[2px]"
              style={{
                height: Math.round(height * 0.35),
                background: `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0.08) 100%)`,
                backgroundColor: coverColor,
              }}
            />
            {/* Front face */}
            <div
              className="absolute inset-x-0 bottom-0 rounded-b-[2px] flex items-center justify-center overflow-hidden"
              style={{
                top: Math.round(height * 0.3),
                background: `linear-gradient(180deg, ${coverColor} 0%, rgba(0,0,0,0.18) 100%)`,
                backgroundColor: coverColor,
                boxShadow: "inset 0 2px 0 rgba(255,255,255,0.15)",
              }}
            >
              <span
                className="font-serif font-bold text-center block px-2"
                style={{ color: textColor, fontSize: Math.max(9, Math.min(12, height * 0.45)) }}
              >
                {title}
              </span>
            </div>
            {/* Right shadow edge */}
            <div className="absolute right-0 inset-y-0 w-[3px] rounded-r-[2px]" style={{ background: "rgba(0,0,0,0.22)" }} />
            {/* Shadow under */}
            <div className="absolute inset-x-0 -bottom-1 h-2 blur-sm opacity-30 bg-black rounded-full" />
          </div>
        ) : (
          /* ── STANDING BOOK ───────────────────────────────────────── */
          <div className="relative w-full h-full flex">
            {/* SPINE face */}
            <div
              className="relative flex-1 flex items-center justify-center overflow-hidden rounded-l-[2px]"
              style={{
                background: `linear-gradient(100deg, rgba(255,255,255,0.10) 0%, ${coverColor} 30%, rgba(0,0,0,0.12) 100%)`,
                backgroundColor: coverColor,
                boxShadow: "inset 2px 0 0 rgba(255,255,255,0.15)",
              }}
            >
              {/* Title along spine */}
              <span
                className="font-serif font-bold text-center leading-tight"
                style={{
                  color: textColor,
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  fontSize: Math.max(8, Math.min(11, (width) * 0.32)),
                  maxHeight: height - 24,
                  whiteSpace: "normal",
                  overflow: "hidden",
                  wordBreak: "break-word",
                  letterSpacing: "0.06em",
                  textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                }}
              >
                {title}
              </span>

              {/* Bottom accent band */}
              <div
                className="absolute bottom-0 inset-x-0"
                style={{ height: "14%", background: spineAccent, opacity: 0.9 }}
              />
              <div
                className="absolute bottom-[15%] inset-x-0"
                style={{ height: "3%", background: spineAccent, opacity: 0.5 }}
              />

              {/* Left-edge highlight */}
              <div className="absolute left-0 inset-y-0 w-[3px] rounded-l-[2px]" style={{ background: "rgba(255,255,255,0.18)" }} />
              {/* Right-edge shadow */}
              <div className="absolute right-0 inset-y-0 w-[3px]" style={{ background: "rgba(0,0,0,0.15)" }} />
            </div>

            {/* Right shadow edge */}
            <div className="absolute right-0 inset-y-0 w-[3px] rounded-r-[2px]" style={{ background: "rgba(0,0,0,0.25)" }} />
          </div>
        )}

        {/* Drop shadow on the shelf surface */}
        <div
          className="absolute -bottom-1 inset-x-0 h-2 opacity-25 blur-[3px] bg-black"
          style={{ borderRadius: "0 0 4px 4px" }}
        />
      </motion.div>
    </button>
  );
}
