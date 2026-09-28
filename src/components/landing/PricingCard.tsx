import React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

export interface PricingPlanData {
  id: string;
  name: string;
  priceInr: number;
  period?: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  isPopular?: boolean;
  badge?: string;
}

export const PricingCard: React.FC<PricingPlanData> = ({
  name,
  priceInr,
  period = "/ month",
  description,
  features,
  ctaLabel,
  ctaHref,
  isPopular,
  badge
}) => {
  return (
    <div
      className={`relative rounded-2xl p-7 flex flex-col justify-between transition-all duration-200 border ${
        isPopular
          ? "border-[#13141B] shadow-md bg-white ring-1 ring-[#13141B]"
          : "border-[#EBECEF] shadow-xs bg-white hover:border-[#D1D5DC]"
      }`}
    >
      {badge && (
        <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-[#13141B] text-[#00D2B4] text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
          {badge}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-extrabold font-sans text-[#13141B]">{name}</h3>
          <p className="text-xs text-[#5E6573] mt-1 font-medium">{description}</p>
        </div>

        <div className="flex items-baseline gap-1 py-1">
          <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#13141B]">
            ₹{priceInr}
          </span>
          <span className="text-xs text-[#5E6573] font-medium">{period}</span>
        </div>

        <ul className="space-y-2.5 pt-3 border-t border-[#EBECEF]">
          {features.map((feat, idx) => (
            <li key={idx} className="text-xs text-[#13141B] font-medium flex items-start gap-2.5">
              <Check className="w-3.5 h-3.5 text-[#00D2B4] shrink-0 mt-0.5 font-bold" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-6">
        <Button
          variant={isPopular ? "primary" : "secondary"}
          href={ctaHref}
          className={`w-full rounded-xl font-bold text-xs ${
            isPopular 
              ? "bg-[#13141B] hover:bg-black text-white shadow-xs" 
              : "bg-white hover:bg-slate-50 text-[#13141B] border border-[#EBECEF]"
          }`}
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
};

export default PricingCard;
