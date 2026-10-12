"use client";

import React from "react";
import Link from "next/link";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "neumorphic" | "dark";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  href?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  href,
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5 rounded-lg",
    md: "px-5 py-2.5 text-xs sm:text-sm gap-2 rounded-xl",
    lg: "px-7 py-3.5 text-sm sm:text-base gap-2.5 rounded-xl font-bold",
  }[size];

  // Figma Master Monochrome Button Design System
  const variantStyles = {
    primary:
      "bg-black hover:bg-neutral-800 text-white border border-black shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black",
    secondary:
      "bg-white text-black border border-neutral-200 hover:border-black hover:bg-neutral-50 shadow-2xs hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black",
    ghost:
      "bg-transparent text-black hover:bg-neutral-100 border border-transparent active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-black",
    outline:
      "bg-white text-black border border-neutral-300 hover:border-black hover:bg-neutral-50 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-black",
    neumorphic:
      "bg-black hover:bg-neutral-800 text-white border border-black shadow-xs hover:shadow-md active:scale-[0.98]",
    dark:
      "bg-black hover:bg-neutral-900 text-white border border-neutral-800 shadow-md active:scale-[0.98]",
  }[variant];

  const baseClasses = `
    inline-flex items-center justify-center font-bold tracking-tight
    transition-all duration-150 ease-out outline-none select-none
    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:shadow-none
    ${sizeStyles}
    ${variantStyles}
    ${className}
  `.trim();

  const loadingSpinner = (
    <svg
      className="animate-spin -ml-0.5 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {isLoading ? loadingSpinner : icon && <span className="shrink-0">{icon}</span>}
        {children}
      </Link>
    );
  }

  return (
    <button className={baseClasses} disabled={disabled || isLoading} {...props}>
      {isLoading ? loadingSpinner : icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
