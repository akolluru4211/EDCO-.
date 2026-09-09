"use client";

import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", containerClassName = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`w-full space-y-1.5 ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-4 text-slate-400 pointer-events-none shrink-0">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`
              w-full border-none outline-none rounded-[15px] p-3.5
              bg-[#e2e8f0] text-slate-900 text-sm font-medium
              shadow-[inset_2px_4px_8px_rgba(15,23,42,0.15),inset_-2px_-2px_6px_rgba(255,255,255,0.8)]
              transition-all duration-300 ease-in-out
              placeholder:text-slate-400
              focus:bg-white focus:scale-[1.02] focus:shadow-[8px_8px_24px_rgba(148,163,184,0.4),-8px_-8px_24px_#ffffff]
              focus:ring-2 focus:ring-brand-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? "pl-11" : ""}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
