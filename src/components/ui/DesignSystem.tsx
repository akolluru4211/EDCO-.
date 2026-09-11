import React, { ButtonHTMLAttributes, InputHTMLAttributes, forwardRef } from "react";
import { Loader2, AlertCircle, AlertTriangle, CheckCircle2, Info, ArrowRight, FolderPlus } from "lucide-react";

// ==========================================
// 1. BUTTON PRIMITIVE
// ==========================================
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "subtle";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        "bg-slate-900 hover:bg-slate-800 text-white shadow-sm focus:ring-slate-900 active:scale-[0.98]",
      secondary:
        "bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400 active:scale-[0.98]",
      outline:
        "border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 focus:ring-slate-400 active:scale-[0.98]",
      ghost:
        "hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-300",
      destructive:
        "bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-600 active:scale-[0.98]",
      subtle:
        "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 focus:ring-slate-300"
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: "text-xs px-3 py-1.5 gap-1.5 min-h-[32px]",
      md: "text-sm px-4 py-2 gap-2 min-h-[40px]",
      lg: "text-base px-5 py-2.5 gap-2.5 min-h-[48px]",
      icon: "p-2 min-w-[40px] min-h-[40px]"
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = "Button";

// ==========================================
// 2. INPUT PRIMITIVE
// ==========================================
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full text-sm rounded-xl border bg-white px-3.5 py-2.5 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 disabled:text-slate-400 ${
              leftIcon ? "pl-9" : ""
            } ${rightElement ? "pr-10" : ""} ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-400"
                : "border-slate-300 focus:border-slate-900 focus:ring-slate-900"
            } ${className}`}
            {...props}
          />
          {rightElement && <div className="absolute right-3 flex items-center">{rightElement}</div>}
        </div>
        {error ? (
          <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : hint ? (
          <p className="text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

// ==========================================
// 3. CARD CONTAINER PRIMITIVE
// ==========================================
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "flat" | "elevated" | "interactive";
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "default",
  ...props
}) => {
  const variantStyles = {
    default: "bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm",
    flat: "bg-slate-50/80 border border-slate-200/70 rounded-2xl p-5",
    elevated: "bg-white border border-slate-200/80 rounded-2xl p-6 shadow-md",
    interactive:
      "bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 hover:shadow transition-all cursor-pointer"
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

// ==========================================
// 4. BADGE PRIMITIVE
// ==========================================
export type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "error";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = "",
  variant = "neutral",
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    brand: "bg-indigo-50 text-indigo-700 border-indigo-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    error: "bg-rose-50 text-rose-700 border-rose-200"
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// ==========================================
// 5. REAL EMPTY STATE PRIMITIVE
// ==========================================
export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionHref,
  className = ""
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm mb-4">
        {icon || <FolderPlus className="w-6 h-6 text-slate-400" />}
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        <div>
          {actionHref ? (
            <a
              href={actionHref}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          ) : (
            <Button size="sm" onClick={onAction} rightIcon={<ArrowRight className="w-4 h-4" />}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 6. SKELETON LOADER PRIMITIVE
// ==========================================
export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return <div className={`animate-pulse bg-slate-200/80 rounded-xl ${className}`} />;
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse max-w-7xl mx-auto p-4 sm:p-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
};

// ==========================================
// 7. REAL ERROR STATE PRIMITIVE
// ==========================================
export interface ErrorStateProps {
  title?: string;
  message?: string;
  statusCode?: 401 | 403 | 404 | 429 | 500;
  onRetry?: () => void;
  returnHref?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  statusCode = 500,
  onRetry,
  returnHref = "/auth/login"
}) => {
  const getErrorContent = () => {
    switch (statusCode) {
      case 401:
        return {
          title: title || "Authentication Required",
          message: message || "Your session has expired. Please sign in to continue.",
          icon: <AlertCircle className="w-8 h-8 text-amber-600" />
        };
      case 403:
        return {
          title: title || "Access Restricted",
          message: message || "You do not have the required permissions to access this area.",
          icon: <AlertTriangle className="w-8 h-8 text-rose-600" />
        };
      case 404:
        return {
          title: title || "Resource Not Found",
          message: message || "The requested resource could not be found or has been moved.",
          icon: <Info className="w-8 h-8 text-slate-600" />
        };
      case 429:
        return {
          title: title || "Rate Limit Exceeded",
          message: message || "Too many requests. Please wait a moment before trying again.",
          icon: <AlertTriangle className="w-8 h-8 text-amber-600" />
        };
      default:
        return {
          title: title || "System Error",
          message: message || "An unexpected error occurred. Please try again or contact support.",
          icon: <AlertCircle className="w-8 h-8 text-rose-600" />
        };
    }
  };

  const content = getErrorContent();

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
        {content.icon}
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-1">{content.title}</h2>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">{content.message}</p>
      <div className="flex items-center gap-3">
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        )}
        <a
          href={returnHref}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-all"
        >
          Return to Portal
        </a>
      </div>
    </div>
  );
};
