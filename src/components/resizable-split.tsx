"use client";

import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

const MIN_RATIO = 0.2;
const MAX_RATIO = 0.8;
const KEYBOARD_STEP = 0.05;

function clampRatio(ratio: number) {
  return Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio));
}

export function ResizableSplit({ left, right }: { left: ReactNode; right: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [ratio, setRatio] = useState(0.5);

  const handlePointerMove = useCallback((e: globalThis.PointerEvent) => {
    if (!draggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setRatio(clampRatio((e.clientX - rect.left) / rect.width));
  }, []);

  const stopDragging = useCallback(() => {
    draggingRef.current = false;
    document.body.style.removeProperty("cursor");
    document.body.style.removeProperty("user-select");
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopDragging);
    window.removeEventListener("pointercancel", stopDragging);
  }, [handlePointerMove]);

  const startDragging = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      draggingRef.current = true;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", stopDragging);
      window.addEventListener("pointercancel", stopDragging);
    },
    [handlePointerMove, stopDragging],
  );

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setRatio((r) => clampRatio(r - KEYBOARD_STEP));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setRatio((r) => clampRatio(r + KEYBOARD_STEP));
    } else if (e.key === "Home") {
      e.preventDefault();
      setRatio(MIN_RATIO);
    } else if (e.key === "End") {
      e.preventDefault();
      setRatio(MAX_RATIO);
    }
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-0">
      <div className="min-w-0 sm:pr-2" style={{ flexBasis: `calc(${ratio * 100}% - 3px)` }}>
        {left}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Redimensionar painéis"
        tabIndex={0}
        onPointerDown={startDragging}
        onKeyDown={handleKeyDown}
        className="hidden w-1.5 shrink-0 cursor-col-resize touch-none items-stretch justify-center rounded-full outline-none sm:flex focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="w-px bg-border" />
      </div>
      <div className="min-w-0 sm:pl-2" style={{ flexBasis: `calc(${(1 - ratio) * 100}% - 3px)` }}>
        {right}
      </div>
    </div>
  );
}
