'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import logoLight from "@/public/img/ipaylogo.webp";
import logoDark from "@/public/img/ipaylogo-white.png";
import type { Theme } from "@/app/lib/theme";

type BrandLogoProps = {
  className?: string;
  initialTheme?: Theme;
  priority?: boolean;
  variant?: "auto" | "light" | "dark";
};

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function BrandLogo({
  className = "",
  initialTheme = "dark",
  priority = false,
  variant = "auto",
}: BrandLogoProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    const syncTheme = () => {
      setTheme(readTheme());
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const resolvedVariant = variant === "auto" ? theme : variant;

  return (
    <span className={`brand-logo ${className}`.trim()}>
      <Image
        src={resolvedVariant === "dark" ? logoDark : logoLight}
        alt="iPay logo"
        priority={priority}
        className="brand-logo-image"
      />
    </span>
  );
}
