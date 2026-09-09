"use client";

import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import EdworldLogo from "@/components/ui/EdworldLogo";
import { Compass, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-brand-600 flex items-center justify-center mx-auto shadow-md shadow-brand-500/10">
          <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: "12s" }} />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
            Error 404 &bull; Page Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Off the Career Path
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The page or module you&apos;re looking for has moved or doesn&apos;t exist. Let&apos;s get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            href="/dashboard"
            variant="primary"
            size="md"
            icon={<Home className="w-4 h-4 shrink-0" />}
          >
            <span>Open Dashboard</span>
          </Button>

          <Button
            href="/"
            variant="neumorphic"
            size="md"
            icon={<ArrowLeft className="w-4 h-4 shrink-0" />}
          >
            <span>Go to Home</span>
          </Button>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
          <EdworldLogo size="sm" showText={true} />
        </div>
      </div>
    </div>
  );
}
