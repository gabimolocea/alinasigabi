"use client";

import { useEffect } from "react";

export function LoadingScreenRemover() {
  useEffect(() => {
    // This runs after React has hydrated, so it's safe to manipulate the DOM
    const el = document.getElementById("loading-screen");
    if (el) {
      // Small delay so the splash feels intentional
      setTimeout(() => {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
        el.style.pointerEvents = "none";
        // Hide completely after fade-out (never remove — React owns this node)
        setTimeout(() => {
          el.style.display = "none";
        }, 900);
      }, 300);
    }
  }, []);

  return null;
}
