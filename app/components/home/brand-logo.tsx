import Image from "next/image";
import logoLight from "@/public/img/ipaylogo.webp";
import logoDark from "@/public/img/ipaylogo-white.png";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  className = "",
  priority = false,
}: BrandLogoProps) {
  return (
    <span className={`brand-logo ${className}`.trim()}>
      <Image
        src={logoLight}
        alt="iPay logo"
        priority={priority}
        className="brand-logo-image brand-logo-image-light"
      />
      <Image
        src={logoDark}
        alt="iPay logo"
        priority={priority}
        className="brand-logo-image brand-logo-image-dark"
      />
    </span>
  );
}
