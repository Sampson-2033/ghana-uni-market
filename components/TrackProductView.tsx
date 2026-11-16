"use client";

import { useEffect } from "react";

export default function TrackProductView({ product }: { product: any }) {
  useEffect(() => {
    const saved = localStorage.getItem("recentlyViewed");
    let items = saved ? JSON.parse(saved) : [];
    items = items.filter((item: any) => item.id !== product.id);
    items.unshift({ id: product.id, title: product.title, price: product.price, image_url: product.image_url });
    items = items.slice(0, 5);
    localStorage.setItem("recentlyViewed", JSON.stringify(items));
  }, [product]);

  return null;
}