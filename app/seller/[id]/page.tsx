import TrackProfileView from "@/components/TrackProfileView";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { MapPin, Calendar } from "lucide-react";
import { redirect } from "next/navigation";
import VerifiedBadge from "@/components/VerifiedBadge";

async function SellerData({ id }: { id: string }) {
  const supabase = await createClient();
  
  // Get current user (the viewer)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // 1. Fetch the seller's profile
  const { data: seller } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!seller) {
    return <div className="text-center py-20 text-slate-500">Seller not found.</div>;
  }

  // 2. Fetch all items listed by this seller
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      {/* Track the profile view silently in the background */}
      <TrackProfileView profileId={seller.id} currentUserId={user.id} />

      {/* Seller Header Card - 3D Style */}
      <div className="bg-[#f0f4f8] dark:bg-slate-900 rounded-[2rem] shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#020617,-8px_-8px_16px_#1e293b] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 transition-colors">
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-md flex-shrink-0">
          {seller.avatar_url ? (
            <img src={seller.avatar_url} alt={seller.full_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-extrabold text-4xl">
              {seller.full_name?.charAt(0) || "S"}
            </div>
          )}
        </div>
        
        <div className="text-center sm:text-left flex-grow">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{seller.full_name}</h1>
          
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-indigo-500" /> {seller.institution}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-500" /> Joined {new Date(seller.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div>
          {seller.is_verified ? (
            <VerifiedBadge />
          ) : (
            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">Unverified</span>
          )}
        </div>
      </div>

      {/* Seller's Products */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">Items from {seller.full_name?.split(' ')[0]}</h2>
        
        {!products || products.length === 0 ? (
          <div className="text-center py-16 bg-[#f0f4f8] dark:bg-slate-900 rounded-[2rem] shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-[inset_2px_2px_5px_#020617,inset_-2px_-2px_5px_#1e293b]">
            <p className="text-slate-500 dark:text-slate-400 font-medium">This seller hasn't posted any items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => {
              let phone = seller?.whatsapp_number || "";
              if (phone.startsWith("0")) phone = "233" + phone.slice(1);
              
              const whatsappLink = phone 
                ? `https://wa.me/${phone}?text=${encodeURIComponent(`Hello, I'm interested in your listing "${product.title}" on Ghana UNI Market.`)}`
                : "#";

              return (
                <ProductCard 
                  key={product.id} 
                  id={product.id} 
                  title={product.title} 
                  price={product.price} 
                  institution={seller.institution || "Unknown"} 
                  imageUrl={product.image_url || undefined}
                  isVerified={seller.is_verified || false}
                  isSold={product.is_sold || false}
                  whatsappLink={whatsappLink}
                  sellerPhone={seller.whatsapp_number || ""}
                  createdAt={product.created_at}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#e8f0fe] dark:bg-slate-950 transition-colors">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-300 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-indigo-300 dark:bg-indigo-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-purple-300 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

      <div className="relative z-10">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Suspense fallback={
            <div className="text-center py-20">
              <p className="text-slate-500 dark:text-slate-400 animate-pulse font-bold text-lg">Loading seller profile...</p>
            </div>
          }>
            <SellerData id={id} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}