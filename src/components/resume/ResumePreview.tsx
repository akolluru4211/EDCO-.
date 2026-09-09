"use client";

import React from "react";
import { ResumeContent, ResumeTemplateId } from "@/lib/types";
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";

interface ResumePreviewProps {
  content: ResumeContent;
  templateId: ResumeTemplateId;
}

export default function ResumePreview({ content, templateId }: ResumePreviewProps) {
  const { contact, summary, experience, education, skills, projects } = content;

  return (
    <div
      id="resume-preview-document"
      className="bg-white text-slate-900 shadow-xl rounded-xl border border-slate-200 w-full min-h-[900px] p-8 sm:p-12 transition-all print-page font-sans text-xs leading-relaxed select-text"
    >
      {/* ========================================================================= */}
      {/* TEMPLATE 1: CLASSIC ATS (Traditional Standard) */}
      {/* ========================================================================= */}
      {templateId === "classic" && (
        <div className="space-y-5 font-serif">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-wide uppercase">
              {contact.fullName || "Your Full Name"}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-700 font-sans">
              {contact.email && <span>{contact.email}</span>}
              {contact.phone && <span>• {contact.phone}</span>}
              {contact.location && <span>• {contact.location}</span>}
              {contact.linkedin && <span>• {contact.linkedin}</span>}
              {contact.github && <span>• {contact.github}</span>}
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <div className="space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
                Professional Summary
              </h2>
              <p className="text-[11px] text-slate-800 font-sans leading-normal">{summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
                Work & Professional Experience
              </h2>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx} className="space-y-1">
                  <div className="flex items-baseline justify-between text-[11px] font-sans">
                    <span className="font-bold text-slate-900">
                      {exp.role} <span className="font-normal italic text-slate-700">— {exp.company}</span>
                    </span>
                    <span className="text-slate-600 text-[10px]">
                      {exp.startDate} {exp.startDate && (exp.endDate || exp.current) && "–"} {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  {exp.location && <p className="text-[10px] text-slate-500 font-sans">{exp.location}</p>}
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-[11px] text-slate-800 font-sans">
                    {exp.bullets.filter(Boolean).map((bullet, bIdx) => (
                      <li key={bIdx} className="leading-snug">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
                Key Technical Projects
              </h2>
              {projects.map((proj, idx) => (
                <div key={proj.id || idx} className="space-y-1">
                  <div className="flex items-baseline justify-between text-[11px] font-sans">
                    <span className="font-bold text-slate-900">
                      {proj.title} {proj.technologies.length > 0 && (
                        <span className="font-normal text-slate-600">({proj.technologies.join(", ")})</span>
                      )}
                    </span>
                    {proj.link && <span className="text-slate-500 text-[10px]">{proj.link}</span>}
                  </div>
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-[11px] text-slate-800 font-sans">
                    {proj.bullets.filter(Boolean).map((bullet, bIdx) => (
                      <li key={bIdx} className="leading-snug">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills && (
            <div className="space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
                Technical Skills & Tools
              </h2>
              <div className="text-[11px] font-sans space-y-0.5 text-slate-800">
                {skills.technical?.length > 0 && (
                  <p><strong>Languages & Frameworks:</strong> {skills.technical.join(", ")}</p>
                )}
                {skills.tools?.length > 0 && (
                  <p><strong>Developer Tools & Cloud:</strong> {skills.tools.join(", ")}</p>
                )}
                {skills.soft?.length > 0 && (
                  <p><strong>Core Competencies:</strong> {skills.soft.join(", ")}</p>
                )}
              </div>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
                Education
              </h2>
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="flex items-baseline justify-between text-[11px] font-sans">
                  <div>
                    <span className="font-bold text-slate-900">{edu.school}</span>
                    <span className="text-slate-700"> — {edu.degree} in {edu.fieldOfStudy}</span>
                    {edu.gpa && <span className="text-slate-500"> (GPA: {edu.gpa})</span>}
                  </div>
                  <span className="text-slate-600 text-[10px]">{edu.graduationDate}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEMPLATE 2: MODERN MINIMALIST */}
      {/* ========================================================================= */}
      {templateId === "modern" && (
        <div className="space-y-6 font-sans">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b-2 border-brand-600 pb-3 gap-2">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {contact.fullName || "Your Full Name"}
              </h1>
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mt-0.5">
                Career Candidate
              </p>
            </div>
            <div className="flex flex-col sm:items-end text-[10px] text-slate-600 space-y-0.5">
              {contact.email && <span>{contact.email}</span>}
              {contact.phone && <span>{contact.phone}</span>}
              {contact.location && <span>{contact.location}</span>}
              {contact.linkedin && <span>{contact.linkedin}</span>}
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <div className="space-y-1">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-800">
                About
              </h2>
              <p className="text-[11px] text-slate-700 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-1">
                Experience
              </h2>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx} className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-slate-900">{exp.role}</span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-brand-700">
                    {exp.company} {exp.location && <span className="text-slate-400 font-normal">| {exp.location}</span>}
                  </div>
                  <ul className="list-disc list-outside ml-4 space-y-1 text-[11px] text-slate-700 pt-0.5">
                    {exp.bullets.filter(Boolean).map((bullet, bIdx) => (
                      <li key={bIdx} className="leading-snug">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-1">
                Projects
              </h2>
              {projects.map((proj, idx) => (
                <div key={proj.id || idx} className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-slate-900">{proj.title}</span>
                    {proj.link && <span className="text-[10px] text-slate-400">{proj.link}</span>}
                  </div>
                  {proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 py-0.5">
                      {proj.technologies.map((t, i) => (
                        <span key={i} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[9px] font-semibold">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-[11px] text-slate-700">
                    {proj.bullets.filter(Boolean).map((bullet, bIdx) => (
                      <li key={bIdx} className="leading-snug">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Skills & Education side by side or stacked */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {skills && (
              <div className="space-y-1.5">
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-1">
                  Skills
                </h2>
                <div className="text-[11px] space-y-1 text-slate-700">
                  {skills.technical?.length > 0 && (
                    <p><strong className="text-slate-900">Tech:</strong> {skills.technical.join(", ")}</p>
                  )}
                  {skills.tools?.length > 0 && (
                    <p><strong className="text-slate-900">Tools:</strong> {skills.tools.join(", ")}</p>
                  )}
                </div>
              </div>
            )}

            {education && education.length > 0 && (
              <div className="space-y-1.5">
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-1">
                  Education
                </h2>
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="text-[11px] text-slate-700">
                    <p className="font-bold text-slate-900">{edu.school}</p>
                    <p>{edu.degree} &bull; {edu.graduationDate}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEMPLATE 3: TECH LINEAR (Skill & Architecture First) */}
      {/* ========================================================================= */}
      {templateId === "tech" && (
        <div className="space-y-5 font-mono text-xs">
          {/* Header */}
          <div className="border-l-4 border-slate-900 pl-4 py-1 space-y-1 font-sans">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {contact.fullName || "Your Full Name"}
            </h1>
            <div className="flex flex-wrap gap-x-3 text-[10px] text-slate-600 font-mono">
              {contact.email && <span>{contact.email}</span>}
              {contact.phone && <span>// {contact.phone}</span>}
              {contact.location && <span>// {contact.location}</span>}
              {contact.github && <span>// {contact.github}</span>}
            </div>
          </div>

          {/* Tech Matrix on Top */}
          {skills && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded font-sans space-y-1">
              <h2 className="text-[11px] font-mono font-bold uppercase text-slate-900">
                [SKILLS MATRIX]
              </h2>
              <div className="text-[11px] space-y-0.5 text-slate-800">
                <p><strong>LANGUAGES & FRAMEWORKS:</strong> {skills.technical.join(" | ")}</p>
                <p><strong>INFRASTRUCTURE & TOOLS:</strong> {skills.tools.join(" | ")}</p>
              </div>
            </div>
          )}

          {/* Summary */}
          {summary && (
            <div className="space-y-1 font-sans">
              <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900">
                // SUMMARY
              </h2>
              <p className="text-[11px] text-slate-800 leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Projects (Tech First) */}
          {projects && projects.length > 0 && (
            <div className="space-y-3 font-sans">
              <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900">
                // SYSTEM PROJECTS & ARCHITECTURE
              </h2>
              {projects.map((proj, idx) => (
                <div key={proj.id || idx} className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs font-mono">
                    <span className="font-bold text-slate-900">{proj.title}</span>
                    <span className="text-[10px] text-slate-500">{proj.technologies.join(", ")}</span>
                  </div>
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-[11px] text-slate-800 font-sans">
                    {proj.bullets.filter(Boolean).map((bullet, bIdx) => (
                      <li key={bIdx} className="leading-snug">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <div className="space-y-3 font-sans">
              <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900">
                // EXPERIENCE & IMPACT
              </h2>
              {experience.map((exp, idx) => (
                <div key={exp.id || idx} className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-slate-900">{exp.role} @ {exp.company}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {exp.startDate} - {exp.current ? "NOW" : exp.endDate}
                    </span>
                  </div>
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-[11px] text-slate-800 font-sans">
                    {exp.bullets.filter(Boolean).map((bullet, bIdx) => (
                      <li key={bIdx} className="leading-snug">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div className="space-y-1 font-sans">
              <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900">
                // EDUCATION
              </h2>
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="flex justify-between text-[11px]">
                  <span><strong>{edu.school}</strong> — {edu.degree} in {edu.fieldOfStudy}</span>
                  <span className="font-mono text-slate-500 text-[10px]">{edu.graduationDate}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
