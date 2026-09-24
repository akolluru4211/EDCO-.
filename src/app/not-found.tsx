"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import EdworldLogo from "@/components/ui/EdworldLogo";
import { Compass, Home, ArrowLeft, RotateCcw } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
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
            href="/"
            variant="primary"
            size="md"
            icon={<Home className="w-4 h-4 shrink-0" />}
            className="w-full sm:w-auto"
          >
            <span>Go to Home</span>
          </Button>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
          <EdworldLogo size="sm" showText={true} />
        </div>
      </div>
    </div>
  );
}
