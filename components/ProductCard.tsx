"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import VerifiedBadge from "./VerifiedBadge";
import BuyButton from "./BuyButton";

interface ProductProps {
  id: string;
  title: string;
  price: number;
  institution: string;
  imageUrl?: string;
  isVerified?: boolean;
  isSold?: boolean;
  whatsappLink?: string;
  sellerPhone?: string;
  createdAt?: string;
}

export default function ProductCard({ id, title, price, institution, imageUrl, isVerified, isSold, whatsappLink, sellerPhone, createdAt }: ProductProps) {
  const router = useRouter();
  const isNew = createdAt ? (new Date().getTime() - new Date(createdAt).getTime()) < (3 * 24 * 60 * 60 * 1000) : false;

  return (
    <div onClick={() => router.push(`/product/${id}`)} className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 group cursor-pointer flex flex-col relative ${isSold ? "opacity-75" : "hover:border-indigo-500 dark:hover:border-indigo-500 hover:-translate-y-1"}`}>
      {isSold && (
        <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center backdrop-blur-[2px]">
          <span className="bg-red-600 text-white font-bold px-3 py-1 md:px-4 md:py-2 rounded-lg rotate-[-10deg] shadow-lg text-sm md:text-xl">SOLD</span>
        </div>
      )}
      <div className="aspect-square bg-slate-100 dark:bg-slate-950 relative overflow-hidden m-1.5 md:m-2 rounded-xl md:rounded-[1.5rem]">
        {isNew && !isSold && <span className="absolute top-2 left-2 md:top-3 md:left-3 bg-amber-400 text-amber-950 text-[10px] md:text-xs font-extrabold px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-md z-20 shadow-md tracking-wide">NEW</span>}
        {imageUrl ? <img src={imageUrl} alt={title} className={`object-contain w-full h-full p-2 ${!isSold && "group-hover:scale-105"} transition-transform duration-500`} /> : <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm">No Image</div>}
      </div>
      <div className="px-3 pb-3 pt-1 md:px-4 md:pb-5 md:pt-2 flex flex-col flex-grow">
        <h3 className="font-extrabold text-sm md:text-lg text-slate-900 dark:text-white truncate tracking-tight">{title}</h3>
        <p className="text-base md:text-xl font-extrabold text-amber-500 mt-0.5 md:mt-1">GH₵ {price.toFixed(2)}</p>
        <div className="mt-1.5 md:mt-3 flex flex-col gap-1 md:gap-2 mb-2 md:mb-4">
          <div className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400"><MapPin className="w-2.5 h-2.5 md:w-3 md:h-3" /><span className="truncate">{institution}</span></div>
          {isVerified && <div className="scale-90 origin-left"><VerifiedBadge /></div>}
        </div>
        <div onClick={(e) => e.stopPropagation()} className="mt-auto">
          <BuyButton productId={id} whatsappLink={whatsappLink || "#"} sellerPhone={sellerPhone || ""} productTitle={title} isSold={isSold || false} />
        </div>
      </div>
    </div>
  );
}