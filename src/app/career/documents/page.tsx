"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { CareerDocumentItem } from "@/lib/types";
import { 
  FileText, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Lock, 
  Download, 
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function CareerDocumentsPage() {
  const { user } = useAuth();
  const isAdult = user?.ageBand === "18+";

  const [documents, setDocuments] = useState<CareerDocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState<CareerDocumentItem["document_type"]>("resume");
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDocs = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/career/documents?userId=${user.uid}`);
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdult) {
      fetchDocs();
    }
  }, [user, isAdult]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name || !fileUrl) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/career/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          name: name.trim(),
          document_type: documentType,
          file_url: fileUrl.trim(),
          file_size: 1024 * 250,
          file_type: "application/pdf"
        })
      });

      if (res.ok) {
        setName("");
        setFileUrl("");
        setIsModalOpen(false);
        fetchDocs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Are you sure you want to delete this document from your vault?")) return;
    try {
      const res = await fetch(`/api/career/documents?id=${id}&userId=${user.uid}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAdult && user) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center p-6">
        <div className="card-quixel max-w-md p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-[#FF7A50] mx-auto" />
          <h2 className="text-xl font-black text-[#181920]">Career Track Feature</h2>
          <p className="text-sm text-[#767E94]">The Career Document Vault is exclusively available for Career Track accounts (18+).</p>
          <Link href="/dashboard" className="btn-quixel-primary inline-block">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/dashboard" className="inline-flex items-center text-xs font-bold text-[#5C38FF] hover:underline mb-1">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE8FD] text-[#5C38FF] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#181920]">Career Documents Vault</h1>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#5C38FF] hover:bg-[#4D2CE0] text-white text-xs font-black shadow-lg flex items-center gap-2 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs text-[#767E94]">Loading document vault...</div>
        ) : documents.length === 0 ? (
          <div className="card-quixel p-12 text-center space-y-4">
            <FileText className="w-12 h-12 text-[#8E95A5] mx-auto opacity-50" />
            <h3 className="text-base font-black text-[#181920]">No Documents Stored</h3>
            <p className="text-xs text-[#767E94] max-w-sm mx-auto">
              Securely store your PDF resumes, signed offer letters, certificates, and reference letters.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#5C38FF] text-white text-xs font-bold shadow hover:bg-[#4D2CE0]"
            >
              Add First Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {documents.map(d => (
              <div key={d.id} className="card-quixel p-5 flex flex-col justify-between space-y-4 hover:border-[#5C38FF]/40 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#EDE8FD] text-[#5C38FF] px-2.5 py-1 rounded-full border border-[#5C38FF]/20">
                      {d.document_type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-bold text-[#767E94] flex items-center gap-1 bg-[#F4F6FB] px-2 py-0.5 rounded-full border border-[#E8ECF2]">
                      <Lock className="w-3 h-3" /> Private
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-[#181920] line-clamp-1">{d.name}</h3>
                    <span className="text-[11px] font-mono text-[#767E94]">PDF Document</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8ECF2] flex items-center justify-between text-xs">
                  <a
                    href={d.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#5C38FF] hover:underline flex items-center gap-1 font-bold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View File</span>
                  </a>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#E8ECF2] space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-3">
                <h2 className="text-lg font-black text-[#181920]">Add Document to Vault</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#181920] mb-1">Document Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe Offer Letter 2026.pdf"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs font-bold bg-[#F4F6FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181920] mb-1">Document Category</label>
                  <select
                    value={documentType}
                    onChange={e => setDocumentType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs font-bold bg-[#F4F6FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
                  >
                    <option value="resume">Resume PDF</option>
                    <option value="cover_letter">Cover Letter</option>
                    <option value="certificate">Certification / Degree</option>
                    <option value="experience_letter">Experience Letter</option>
                    <option value="offer_letter">Offer Letter</option>
                    <option value="portfolio_doc">Portfolio Document</option>
                    <option value="other">Other Career Doc</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#181920] mb-1">File Storage URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={fileUrl}
                    onChange={e => setFileUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E8ECF2] text-xs font-medium bg-[#F4F6FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C38FF]"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E8ECF2]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#767E94] hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-[#5C38FF] hover:bg-[#4D2CE0] text-white text-xs font-black shadow"
                  >
                    {submitting ? "Saving..." : "Store in Vault"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
