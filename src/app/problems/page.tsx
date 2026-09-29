"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProblemsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/edfix");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FCFCFB] flex flex-col items-center justify-center p-6 text-center text-[#13141B]">
      <div className="w-8 h-8 border-2 border-[#00D2B4] border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-xs font-mono font-bold text-[#5E6573]">Redirecting to EdFix Problem Board...</p>
    </div>
  );
}
