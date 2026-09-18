"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Menu, 
  X, 
  ArrowRight, 
  LogIn, 
  UserPlus, 
  ShieldCheck
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function MobileLandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      {/* Header Bar */}
      <header className="w-full max-w-5xl mx-auto px-3 sm:px-6 pt-2.5 sm:pt-4 z-30 shrink-0">
        <div className="bg-[#0F1117] text-white rounded-2xl px-3.5 sm:px-5 py-2.5 shadow-md flex items-center justify-between border border-slate-800 transition-all">
          
          {/* Logo & Brand Title */}
          <Link 
            href="/" 
            className="flex items-center gap-2.5 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#D7FC51] rounded-xl"
            aria-label="Edworld Co. Home"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1A1C24] border border-white/10 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden shrink-0">
              <Image
                src="/images/edworld-logo.png"
                alt="Edworld Logo"
                width={24}
                height={24}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1 leading-none font-sans">
                Edworld <span className="text-[#D7FC51]">Co.</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 leading-none">
                Skills &amp; Career OS
              </span>
            </div>
          </Link>

          {/* Desktop Direct Actions (md+) */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/auth/login"
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all shadow-xs focus-visible:ring-2 focus-visible:ring-[#D7FC51]"
            >
              Sign In
            </Link>
            <Button
              href="/auth/signup"
              variant="primary"
              size="sm"
              className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-[#D7FC51] text-[#0F1117] hover:bg-[#E8FFA6] shadow-sm transition-all active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Mobile Menu Button (Below md) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#D7FC51]"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
          >
            {menuOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>

        </div>
      </header>

      {/* Mobile Drawer Menu & Backdrop */}
      {menuOpen && (
        <div 
          className="fixed inset-0 z-50 md:hidden flex justify-end animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          id="mobile-nav-drawer"
          aria-label="Mobile Navigation Menu"
        >
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-[85%] max-w-sm h-full bg-[#0F1117] border-l border-slate-800 text-white flex flex-col justify-between p-5 z-50 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-250 ease-out">
            
            <div className="space-y-6">
              
              {/* Drawer Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#1A1C24] border border-white/10 p-1 flex items-center justify-center">
                    <Image
                      src="/images/edworld-logo.png"
                      alt="Edworld Logo"
                      width={22}
                      height={22}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white">
                      Edworld <span className="text-[#D7FC51]">Co.</span>
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                      Mobile Portal
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#D7FC51]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Primary Auth Actions */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
                  Access Portal
                </span>
                
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-black flex items-center justify-between transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2.5">
                    <LogIn className="w-4 h-4 text-[#D7FC51]" />
                    <span>Sign In to Workspace</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/auth/signup"
                  onClick={() => setMenuOpen(false)}
                  className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-[#D7FC51] hover:bg-[#E8FFA6] text-[#0F1117] text-xs font-black flex items-center justify-between shadow-md transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2.5">
                    <UserPlus className="w-4 h-4 text-[#0F1117]" />
                    <span>Get Started Free</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#0F1117]" />
                </Link>
              </div>

              {/* Public Platform Links */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
                  Explore Edworld
                </span>

                <Link
                  href="/pricing"
                  onClick={() => setMenuOpen(false)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span>Pricing &amp; Plans</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>

                <Link
                  href="/colleges"
                  onClick={() => setMenuOpen(false)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span>For Colleges &amp; Placements</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span>Contact Support</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
              </div>

              {/* Compliance & Legal */}
              <div className="space-y-1 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
                  Legal &amp; Privacy
                </span>
                
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-medium text-slate-400">
                  <Link
                    href="/privacy"
                    onClick={() => setMenuOpen(false)}
                    className="min-h-[40px] px-3 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-colors flex items-center"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    onClick={() => setMenuOpen(false)}
                    className="min-h-[40px] px-3 py-2 rounded-lg hover:text-white hover:bg-white/5 transition-colors flex items-center"
                  >
                    Terms of Use
                  </Link>
                </div>
              </div>

            </div>

            {/* Drawer Bottom Safe Zone */}
            <div className="pt-6 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>DPDP Act &amp; Youth Privacy Protected</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">
                Zero telemetry leakage. Strict learner role boundaries enforced.
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
