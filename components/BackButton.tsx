"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide the back button on the main marketplace page
  if (pathname === "/protected" || pathname === "/protected/") {
    return null;
  }

  return (
    <button
      onClick={() => router.back()}
      className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors group mr-2"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      Back
    </button>
  );
}