"use client";

import { useEffect, useState } from "react";

export function useCanHover() {
  const [canHover, setCanHover] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    function updateCanHover() {
      setCanHover(mediaQuery.matches);
    }

    updateCanHover();
    mediaQuery.addEventListener("change", updateCanHover);

    return () => {
      mediaQuery.removeEventListener("change", updateCanHover);
    };
  }, []);

  return canHover;
}
