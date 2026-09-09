import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface ForCardProps {
  audience: string;
  ageBadge: string;
  headline: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  isPopular?: boolean;
}

export const ForCard: React.FC<ForCardProps> = ({
  audience,
  ageBadge,
  headline,
  description,
  features,
  ctaLabel,
  ctaHref,
  isPopular
}) => {
  return (
    <div
      className={`card-quixel card-quixel-interactive relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-200 border ${
        isPopular
          ? "border-[#13141B] shadow-xl bg-white"
          : "border-[#E8ECF2] shadow-sm bg-white"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-[#13141B] text-[#D7FC51] text-[10px] font-black uppercase tracking-wider shadow-sm">
          Flagship Track
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-[#5E6573] uppercase tracking-wider">
            {audience}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F4F6FB] text-[#13141B] border border-[#E8ECF2]">
            {ageBadge}
          </span>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-black font-display text-[#13141B] tracking-tight">
            {headline}
          </h3>
          <p className="text-xs text-[#5E6573] leading-relaxed font-medium">
            {description}
          </p>
        </div>

        <ul className="space-y-2 pt-2 border-t border-[#E8ECF2]">
          {features.map((feat, idx) => (
            <li key={idx} className="text-xs text-[#13141B] font-medium flex items-start gap-2">
              <span className="text-[#13141B] font-bold">✓</span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-6">
        <Link
          href={ctaHref}
          className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
            isPopular
              ? "bg-[#13141B] hover:bg-black text-white"
              : "bg-[#F4F6FB] hover:bg-[#E8ECF2] text-[#13141B] border border-[#E8ECF2]"
          }`}
        >
          <span>{ctaLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default ForCard;
