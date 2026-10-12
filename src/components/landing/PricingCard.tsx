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
        <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-black text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs border border-neutral-800">
          {badge}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-extrabold font-sans text-black">{name}</h3>
          <p className="text-xs text-neutral-600 mt-1 font-medium">{description}</p>
        </div>

        <div className="flex items-baseline gap-1 py-1">
          <span className="text-3xl sm:text-4xl font-extrabold font-mono text-black">
            ₹{priceInr}
          </span>
          <span className="text-xs text-neutral-600 font-medium">{period}</span>
        </div>

        <ul className="space-y-2.5 pt-3 border-t border-neutral-200">
          {features.map((feat, idx) => (
            <li key={idx} className="text-xs text-black font-medium flex items-start gap-2.5">
              <Check className="w-3.5 h-3.5 text-black shrink-0 mt-0.5 font-bold" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-6">
        <Button
          variant={isPopular ? "primary" : "secondary"}
          href={ctaHref}
          className="w-full"
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
};

export default PricingCard;
