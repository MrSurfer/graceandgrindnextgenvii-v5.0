"use client";

import { useRef, useState, useEffect, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  children: ReactNode;
  className?: string;
  cardWidth?: number; // approx width of each card for scroll-by amount
  showArrows?: boolean;
  showGradients?: boolean;
}

export default function HorizontalScroll({
  children,
  className = "",
  cardWidth = 320,
  showArrows = true,
  showGradients = true,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function checkScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, []);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -cardWidth : cardWidth, behavior: "smooth" });
  }

  return (
    <div className={`relative group/scroll ${className}`}>
      {/* Gradient Masks */}
      {showGradients && canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none" />
      )}
      {showGradients && canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none" />
      )}

      {/* Arrow Buttons */}
      {showArrows && canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-gray-900/90 border border-gray-700 text-gray-300 hover:text-white hover:border-amber-500/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-all shadow-lg"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {showArrows && canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-gray-900/90 border border-gray-700 text-gray-300 hover:text-white hover:border-amber-500/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-all shadow-lg"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scroll-hide snap-x snap-mandatory pb-2"
        style={{ scrollPaddingLeft: "0.5rem" }}
      >
        {children}
      </div>
    </div>
  );
}
