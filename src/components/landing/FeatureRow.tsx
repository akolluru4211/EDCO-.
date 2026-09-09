import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface FeatureRowProps {
  pillLabel: string;
  title: string;
  description: string;
  bullets: string[];
  ctaLabel?: string;
  ctaHref?: string;
  previewVisual: React.ReactNode;
  reversed?: boolean;
}

export const FeatureRow: React.FC<FeatureRowProps> = ({
  pillLabel,
  title,
  description,
  bullets,
  ctaLabel,
  ctaHref,
  previewVisual,
  reversed = false
}) => {
  return (
    <div className={`flex flex-col ${reversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-8 lg:gap-14 py-8`}>
      {/* Content Col */}
      <div className="flex-1 space-y-4">
        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-forest/10 text-forest border border-forest/20">
          {pillLabel}
        </span>
        <h3 className="text-2xl sm:text-3xl font-bold font-display text-ink tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-ink-soft leading-relaxed">
          {description}
        </p>

        <ul className="space-y-2.5 pt-2">
          {bullets.map((b, idx) => (
            <li key={idx} className="text-xs text-ink flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {ctaLabel && ctaHref && (
          <div className="pt-3">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:text-forest-dark hover:underline"
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Visual Col */}
      <div className="flex-1 w-full max-w-lg">
        <div className="bg-paper-raised rounded-3xl p-6 border border-line shadow-lg">
          {previewVisual}
        </div>
      </div>
    </div>
  );
};

export default FeatureRow;
