"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, ArrowLeft, Home } from "lucide-react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  moduleName?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorId: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `err-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(`[UI_ERROR_BOUNDARY_CAUGHT] in ${this.props.moduleName || "General Module"}: ${error.message}`, {
      module: this.props.moduleName || "General",
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorId: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[360px] p-6 sm:p-8 rounded-3xl bg-[#13141B] border border-white/10 text-white flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shadow-inner">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-1 max-w-md">
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {this.props.fallbackTitle || "Something went wrong in this section"}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We encountered an unexpected issue while loading this component. Your data is safe.
            </p>
          </div>

          {this.state.errorId && (
            <div className="px-3 py-1 rounded-lg bg-black/40 border border-white/5 text-[10px] font-mono text-slate-500">
              Ref ID: {this.state.errorId}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-[#D7FC51] hover:bg-[#E9FFA4] text-[#13141B] text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>

            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: { moduleName?: string; fallbackTitle?: string } = {}
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary moduleName={options.moduleName} fallbackTitle={options.fallbackTitle}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;
