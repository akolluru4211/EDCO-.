"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Sparkles, 
  Smile, 
  Meh, 
  Frown, 
  Heart, 
  Lock, 
  Plus, 
  Calendar 
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function GrowthJournalPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [newContent, setNewContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("inspired");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadJournal() {
      if (!user) return;
      const { data } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.uid)
        .order("created_at", { ascending: false });
      if (data) setEntries(data);
      setLoading(false);
    }
    loadJournal();
  }, [user]);

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newContent.trim()) return;
    setSaving(true);

    try {
      const { data, error } = await supabase.from("journal_entries").insert({
        user_id: user.uid,
        content: newContent,
        mood: selectedMood,
        created_at: new Date().toISOString(),
      }).select().single();

      if (data) {
        setEntries([data, ...entries]);
        setNewContent("");
      }
    } catch (e) {
      console.warn("Journal save note:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-paper p-4 sm:p-8 text-ink">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/school" className="text-xs font-bold text-ink-soft hover:text-ink flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to School Hub</span>
          </Link>
          <div className="flex items-center gap-1 text-[11px] font-bold text-forest bg-forest/10 border border-forest/20 px-3 py-1 rounded-full">
            <Lock className="w-3.5 h-3.5" />
            <span>Private Reflective Space</span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-paper-raised rounded-3xl p-8 border border-line shadow-sm space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-ink">Growth &amp; Reflection Journal</h1>
            <p className="text-xs text-ink-soft leading-relaxed">
              A private, low-pressure space to reflect on what you learned, challenges you navigated, and ideas you want to explore.
              <strong className="text-ink"> Not scored or measured.</strong>
            </p>
          </div>

          <form onSubmit={handleSaveEntry} className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-ink-soft">Today&apos;s Mood:</span>
              {[
                { id: "inspired", label: "Inspired", icon: Sparkles },
                { id: "curious", label: "Curious", icon: Heart },
                { id: "steady", label: "Steady", icon: Smile },
                { id: "thoughtful", label: "Thoughtful", icon: Meh },
              ].map(m => {
                const Icon = m.icon;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setSelectedMood(m.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      selectedMood === m.id
                        ? "bg-forest text-white shadow-sm"
                        : "bg-paper-soft border border-line text-ink-soft hover:text-ink"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            <textarea
              rows={4}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="What sparked your curiosity today? What concept felt difficult at first but made sense later?"
              className="w-full p-4 rounded-2xl border border-line text-xs text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-forest"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || !newContent.trim()}
                className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{saving ? "Saving..." : "Save Reflection"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Previous Entries */}
        <div className="space-y-4">
          <h2 className="text-base font-bold font-display text-ink">Your Past Reflections</h2>
          {entries.length === 0 ? (
            <div className="bg-paper-raised rounded-3xl p-8 border border-line text-center text-xs text-ink-muted shadow-sm">
              No journal entries yet. Write your first reflection above!
            </div>
          ) : (
            entries.map(ent => (
              <div key={ent.id} className="bg-paper-raised rounded-2xl p-6 border border-line shadow-sm space-y-2">
                <div className="flex items-center justify-between text-[11px] text-ink-muted">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(ent.created_at).toLocaleDateString()}
                  </span>
                  <span className="uppercase font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-md border border-forest/20">
                    {ent.mood}
                  </span>
                </div>
                <p className="text-xs text-ink leading-relaxed whitespace-pre-wrap">{ent.content}</p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
