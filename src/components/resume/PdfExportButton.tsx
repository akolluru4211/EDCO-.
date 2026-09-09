"use client";

import React, { useState } from "react";
import { Download, Printer, Loader2 } from "lucide-react";
import { ResumeContent, ResumeTemplateId } from "@/lib/types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface PdfExportButtonProps {
  resumeTitle?: string;
  resumeContent?: ResumeContent;
  templateId?: ResumeTemplateId;
  fileName?: string;
}

export default function PdfExportButton({
  resumeTitle,
  resumeContent,
  templateId = "classic",
  fileName,
}: PdfExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const cleanFileName = (
    fileName ||
    (resumeContent?.contact?.fullName
      ? `${resumeContent.contact.fullName.replace(/\s+/g, "_")}_ATS_Resume`
      : resumeTitle || "Resume")
  ).replace(/\s+/g, "_");

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById("resume-preview-document");
    if (!element) {
      window.print();
      return;
    }

    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${cleanFileName}.pdf`);
    } catch (e) {
      console.error("PDF Export failed, falling back to print dialog:", e);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 no-print">
      <button
        onClick={handlePrint}
        title="Print to PDF / Vector Print"
        className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
      >
        <Printer className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Print</span>
      </button>

      <button
        onClick={handleDownloadPdf}
        disabled={isExporting}
        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </>
        )}
      </button>
    </div>
  );
}
