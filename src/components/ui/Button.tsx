"use client";

import React from "react";
import Link from "next/link";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "neumorphic" | "dark";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  href?: string;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  href,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: "px-4 py-2 text-xs gap-1.5",
    md: "px-5 py-2.5 text-xs sm:text-sm gap-2",
    lg: "px-7 py-3.5 text-sm sm:text-base gap-2.5",
  }[size];

  const variantStyles = {
    primary:
      "bg-forest hover:bg-forest-dark text-white shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-forest active:scale-[0.98]",
    secondary:
      "bg-paper-raised text-ink border border-line hover:border-ink-soft hover:bg-paper-soft shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink active:scale-[0.98]",
    ghost:
      "bg-transparent text-ink hover:text-forest hover:bg-forest/5 border border-transparent focus-visible:ring-2 focus-visible:ring-forest",
    outline:
      "bg-transparent text-forest border-2 border-forest hover:bg-forest hover:text-white focus-visible:ring-2 focus-visible:ring-forest active:scale-[0.98]",
    neumorphic:
      "bg-slate-900 text-white hover:bg-slate-800 shadow-md active:scale-[0.98]",
    dark:
      "bg-slate-950 hover:bg-slate-900 text-white shadow-lg active:scale-[0.98]",
  }[variant];

  const baseClasses = `
    inline-flex items-center justify-center font-bold tracking-tight rounded-xl
    transition-all duration-150 ease-out outline-none
    disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100
    ${sizeStyles}
    ${variantStyles}
    ${className}
  `.trim();

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {children}
        {icon && <span className="shrink-0">{icon}</span>}
      </Link>
    );
  }

  return (
    <button className={baseClasses} disabled={disabled} {...props}>
      {children}
      {icon && <span className="shrink-0">{icon}</span>}
    </button>
  );
};

export default Button;
