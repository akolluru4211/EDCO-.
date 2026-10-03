"use client";

import React, { useState } from "react";
import { 
  Sliders, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Check, 
  Layers, 
  Sparkles,
  GripVertical
} from "lucide-react";
import { 
  ALL_DASHBOARD_SECTIONS, 
  DashboardSectionConfig, 
  DashboardLayoutPreference 
} from "@/lib/dashboard/dashboard-layout-engine";

interface CustomizeDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentOrder: DashboardSectionConfig[];
  currentHidden: string[];
  onLayoutSaved: (newPreference: DashboardLayoutPreference) => void;
  onResetToDefaults: () => void;
}

export default function CustomizeDashboardModal({
  isOpen,
  onClose,
  userId,
  currentOrder,
  currentHidden,
  onLayoutSaved,
  onResetToDefaults,
}: CustomizeDashboardModalProps) {
  const [sections, setSections] = useState<DashboardSectionConfig[]>(currentOrder);
  const [hiddenIds, setHiddenIds] = useState<string[]>(currentHidden);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);
    setSections(newSections);
  };

  const toggleVisibility = (id: string) => {
    setHiddenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const newPref: DashboardLayoutPreference = {
      order: sections.map((s) => s.id),
      hidden: hiddenIds,
    };

    try {
      const res = await fetch("/api/profile/dashboard-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          preference: newPref,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        onLayoutSaved(newPref);
        setTimeout(() => {
          setSaveSuccess(false);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error("[Dashboard Customization Save Error]:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/profile/dashboard-layout?userId=${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onResetToDefaults();
        onClose();
      }
    } catch (err) {
      console.error("[Dashboard Customization Reset Error]:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 text-zinc-950">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSaving}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sliders className="w-5 h-5 text-[#00B49B]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-zinc-950">
              Customize Dashboard Layout
            </h3>
            <p className="text-xs text-zinc-500 font-medium">
              Reorder or hide sections to fit your personal workflow.
            </p>
          </div>
        </div>

        {/* Sections List */}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {sections.map((sec, idx) => {
            const isHidden = hiddenIds.includes(sec.id);
            const isFirst = idx === 0;
            const isLast = idx === sections.length - 1;

            return (
              <div
                key={sec.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isHidden 
                    ? "bg-zinc-100/60 border-zinc-200 opacity-60" 
                    : "bg-[#FCFCFB] border-[#EBECEF] hover:border-zinc-300 shadow-2xs"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-bold text-zinc-400 w-4 text-center">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-zinc-950 truncate">
                      {sec.label}
                    </h4>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {sec.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Reorder Buttons */}
                  <button
                    type="button"
                    onClick={() => moveSection(idx, "up")}
                    disabled={isFirst || isSaving}
                    title="Move up"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200 disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(idx, "down")}
                    disabled={isLast || isSaving}
                    title="Move down"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200 disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Visibility Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleVisibility(sec.id)}
                    disabled={isSaving}
                    title={isHidden ? "Show section" : "Hide section"}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isHidden 
                        ? "text-zinc-400 hover:text-zinc-700 bg-zinc-200/60" 
                        : "text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200"
                    }`}
                  >
                    {isHidden ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5 text-[#00B49B]" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-zinc-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Smart Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00D2B4]" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Layout</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
