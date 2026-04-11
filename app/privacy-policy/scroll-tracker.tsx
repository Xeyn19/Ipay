"use client";

import { useEffect, useRef } from "react";

export function PrivacyPolicyScrollTracker() {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          sessionStorage.setItem("ipp_privacy_read", "true");
          // Dispatch a custom event in case they have multiple tabs or we want to listen to it
          window.dispatchEvent(new Event("ipp_privacy_read"));
          observer.disconnect(); // Stop observing once reached to save resources
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, []);

  return <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />;
}
