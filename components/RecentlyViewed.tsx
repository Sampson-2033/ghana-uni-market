"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RecentlyViewed() {
  const [recentItems, setRecentItems] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("recentlyViewed");
    if (saved) setRecentItems(JSON.parse(saved));
  }, []);

  if (recentItems.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-xl font-extrabold text-indigo-900 dark:text-indigo-400 mb-4 tracking-tight">Recently Viewed</h2>
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
        {recentItems.map((item) => (
          <Link key={item.id} href={`/product/${item.id}`} className="flex-shrink-0 w-40 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-indigo-500 dark:hover:border-indigo-500 hover:-translate-y-1 transition-all duration-300 group">
            <div className="aspect-square bg-slate-100 dark:bg-slate-900 relative overflow-hidden">
              {item.image_url ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-slate-400">No Img</div>}
            </div>
            <div className="p-3">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate">{item.title}</h3>
              <p className="text-amber-500 dark:text-amber-400 font-extrabold text-sm mt-1">GH₵ {item.price.toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}