import { MapPin, ShieldAlert, Navigation, ChevronRight } from "lucide-react";
import MapWrapper from "@/components/MapWrapper";
import ProductChat from "@/components/ProductChat";
import TrackProductView from "@/components/TrackProductView";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import VerifiedBadge from "@/components/VerifiedBadge";
import WhatsAppButton from "@/components/WhatsAppButton";
import ReportButton from "@/components/ReportButton";
import ImageGallery from "@/components/ImageGallery";
import MarkAsSoldButton from "@/components/MarkAsSoldButton";
import { redirect } from "next/navigation";
import Link from "next/link";

async function ProductData({ id, chatWith }: { id: string, chatWith?: string }) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      profiles!products_seller_id_fkey (
        full_name,
        institution,
        whatsapp_number,
        is_verified
      )
    `)
    .eq("id", id)
    .single();

  if (!product) return <div className="text-center py-20 text-slate-500">Product not found.</div>;

  const seller: any = Array.isArray(product.profiles) ? product.profiles[0] : product.profiles;
  
  let whatsappNum = seller?.whatsapp_number || "";
  if (whatsappNum.startsWith("0")) whatsappNum = "233" + whatsappNum.slice(1);
  
  const message = `Hello, I'm interested in your listing "${product.title}" on Ghana UNI Market.`;
  const whatsappLink = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`;

  const displayImages = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls 
    : (product.image_url ? [product.image_url] : []);

  const isSeller = user.id === product.seller_id;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <TrackProductView product={product} />
      
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-4 bg-slate-50 dark:bg-slate-900">
          <ImageGallery images={displayImages} title={product.title} />
        </div>

        <div className="p-6 md:p-8 flex flex-col">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{product.title}</h1>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">GH₵ {product.price.toFixed(2)}</p>
          
          <div className="mt-4 flex flex-col gap-2 border-b border-slate-200 dark:border-slate-700 pb-4">
            <Link href={`/seller/${product.seller_id}`} className="flex items-center justify-between w-full p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all group">
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-bold">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white">{seller?.full_name || "Seller"}'s Profile</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{seller?.institution || "Unknown"}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </Link>
            {seller?.is_verified && <VerifiedBadge />}
          </div>

          <div className="mt-4 flex-grow">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Description</h3>
            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap mb-6">{product.description}</p>

            {product.latitude && product.longitude && (
              <div className="mt-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Meeting Location</h3>
                <MapWrapper lat={product.latitude} lng={product.longitude} title={product.title} />
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${product.latitude},${product.longitude}`} target="_blank" rel="noopener noreferrer" className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium py-2 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors">
                  <Navigation className="w-4 h-4" />
                  Get Directions on Google Maps
                </a>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            {isSeller ? (
              <>
                <MarkAsSoldButton productId={product.id} isSold={product.is_sold} />
                <ProductChat productId={product.id} sellerId={product.seller_id} currentUserId={user.id} buyerId={chatWith} />
              </>
            ) : product.is_sold ? (
              <div className="w-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium py-3 rounded-lg text-center">This item has already been sold.</div>
            ) : (
              <>
                <WhatsAppButton whatsappLink={whatsappLink} sellerPhone={seller?.whatsapp_number || ""} productTitle={product.title} />
                <ProductChat productId={product.id} sellerId={product.seller_id} currentUserId={user.id} buyerId={chatWith} />
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-xs p-3 rounded-lg flex items-start gap-2 border border-amber-200 dark:border-amber-900/50">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>Meet in a public place on campus, inspect items before paying, and never send money to someone you haven't met.</p>
                </div>
                <ReportButton productId={product.id} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProductDetailsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ chatWith?: string }>; }) {
  const { id } = await params;
  const { chatWith } = await searchParams;
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Suspense fallback={<div className="text-center py-20"><p className="text-slate-500 animate-pulse">Loading product details...</p></div>}>
          <ProductData id={id} chatWith={chatWith} />
        </Suspense>
      </main>
    </div>
  );
}