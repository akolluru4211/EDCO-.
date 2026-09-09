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
      className={`card-quixel card-quixel-interactive relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-200 border ${
        isPopular
          ? "border-[#13141B] shadow-xl bg-white"
          : "border-[#E8ECF2] shadow-sm bg-white"
      }`}
    >
      {badge && (
        <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-[#13141B] text-[#D7FC51] text-[10px] font-black uppercase tracking-wider shadow-sm">
          {badge}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-black font-display text-[#13141B]">{name}</h3>
          <p className="text-xs text-[#5E6573] mt-0.5 font-medium">{description}</p>
        </div>

        <div className="flex items-baseline gap-1 py-1">
          <span className="text-3xl sm:text-4xl font-black font-mono text-[#13141B]">
            ₹{priceInr}
          </span>
          <span className="text-xs text-[#8F9CAE] font-medium">{period}</span>
        </div>

        <ul className="space-y-2.5 pt-3 border-t border-[#E8ECF2]">
          {features.map((feat, idx) => (
            <li key={idx} className="text-xs text-[#13141B] font-medium flex items-start gap-2.5">
              <Check className="w-3.5 h-3.5 text-[#13141B] shrink-0 mt-0.5 font-bold" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-6">
        <Button
          variant={isPopular ? "primary" : "secondary"}
          href={ctaHref}
          className={`w-full rounded-2xl ${
            isPopular 
              ? "bg-[#13141B] hover:bg-black text-white" 
              : "bg-[#F4F6FB] hover:bg-[#E8ECF2] text-[#13141B] border border-[#E8ECF2]"
          }`}
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
};

export default PricingCard;
