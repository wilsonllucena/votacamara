import React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Local utility to ensure the component is self-contained
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "brand" | "monochrome" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  asChild?: boolean;
}

/**
 * Vota Câmara Logo Component
 * 
 * Usage:
 * <Logo />
 * <Logo variant="monochrome" size="lg" />
 * <Logo className="text-primary" />
 */
export function Logo({
  className,
  variant = "default",
  size = "md",
  asChild = false,
  ...props
}: LogoProps) {
  
  // Size Definitions
  const sizes = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
    xl: "h-24",
  };

  // Base container classes
  const containerClasses = cn(
    "relative flex items-center justify-center select-none",
    sizes[size],
    className
  );

  // If we prioritize using the PNG file provided
  const logoSrc = "../logo.png"; // Relative path assumed based on structure

  if (variant === "monochrome") {
    // CSS Filter for grayscale/monochrome effect (using Shadcn CSS vars)
    // We strive to colorize the black parts with 'currentColor' if possible with mask, 
    // but standard img tags don't support fill. 
    // For a true monochrome logo, SVG is needed. 
    // Here we use grayscale filter as a fallback or assume the user wants the shape.
    return (
      <div className={containerClasses} {...props}>
        <img 
          src={logoSrc} 
          alt="Vota Câmara Logo" 
          className="h-full w-auto object-contain grayscale opacity-80" 
        />
      </div>
    );
  }

  return (
    <div className={containerClasses} {...props}>
      <img 
        src={logoSrc} 
        alt="Vota Câmara Logo" 
        className="h-full w-auto object-contain" 
      />
    </div>
  );
}

// ----------------------------------------------------------------------
// SVG Icon Version (Extracted Design)
// Use this if you want a pure code vector version without the PNG dependency.
// ----------------------------------------------------------------------

export function LogoIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-10 h-12 fill-primary stroke-primary-foreground", className)}
      {...props}
    >
      {/* 
        Approximated Vector Paths based on 'logo.png' design:
        1. Shield
        2. Dome
        3. Check/Circuit
      */}
      
      {/* Shield Outline */}
      <path 
        d="M50 2 
           C 50 2, 90 10, 95 30 
           C 95 60, 80 100, 50 118 
           C 20 100, 5 60, 5 30 
           C 10 10, 50 2, 50 2 Z" 
        className="fill-secondary/20 stroke-primary/80 stroke-[3]"
      />

      {/* Dome (simplified) */}
      <path 
        d="M25 45 A 25 25 0 0 1 75 45" 
        className="fill-none stroke-accent stroke-[3]" 
      />
      <path d="M50 26 L50 45" className="stroke-accent stroke-[2]" />
      
      {/* Circuit Box & Checkmark */}
      <rect x="35" y="45" width="30" height="30" rx="4" className="fill-primary stroke-none" />
      <path d="M40 60 L50 70 L60 50" className="fill-none stroke-white stroke-[4]" />

      {/* Decorative Circuit Dots (Left) */}
      <circle cx="28" cy="55" r="2" className="fill-primary" />
      <circle cx="24" cy="62" r="2" className="fill-primary" />
      <circle cx="30" cy="68" r="2" className="fill-primary" />
    </svg>
  );
}
