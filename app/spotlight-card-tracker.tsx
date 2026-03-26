'use client'

import { useEffect } from "react";

type SpotlightCardTrackerProps = {
  containerSelector: string;
  cardSelector: string;
};

export default function SpotlightCardTracker({
  containerSelector,
  cardSelector,
}: SpotlightCardTrackerProps) {
  useEffect(() => {
    const container = document.querySelector<HTMLElement>(containerSelector);

    if (!container) {
      return;
    }

    const cards = Array.from(
      container.querySelectorAll<HTMLElement>(cardSelector),
    );

    if (cards.length === 0) {
      return;
    }

    const updateCards = (clientX: number, clientY: number) => {
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const dx = Math.max(rect.left - clientX, 0, clientX - rect.right);
        const dy = Math.max(rect.top - clientY, 0, clientY - rect.bottom);
        const distance = Math.hypot(dx, dy);
        const glowStrength = Math.max(0, 1 - distance / 120);

        card.style.setProperty("--x", `${x}px`);
        card.style.setProperty("--y", `${y}px`);
        card.style.setProperty("--glow-alpha", glowStrength.toFixed(3));
      });
    };

    const resetCards = () => {
      cards.forEach((card) => {
        card.style.setProperty("--x", "50%");
        card.style.setProperty("--y", "50%");
        card.style.setProperty("--glow-alpha", "0");
      });
    };

    const handleMouseMove = (event: MouseEvent) => {
      updateCards(event.clientX, event.clientY);
    };

    resetCards();
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", resetCards);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", resetCards);
    };
  }, [cardSelector, containerSelector]);

  return null;
}
