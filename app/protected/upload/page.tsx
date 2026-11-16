"use client";

import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import { ImagePlus, X, MapPin, Loader2 } from "lucide-react";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Books");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        if (profile?.role !== 'seller') router.push("/protected/profile");
      }
    };
    checkRole();
  }, [router, supabase]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (imageFiles.length + files.length > 5) { toast.error("You can only upload up to 5 images."); return; }
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleGetLocation = () => {
    setGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          toast.success("Location captured!");
          setGettingLocation(false);
        },
        (error) => { toast.error("Could not get location."); setGettingLocation(false); }
      );
    } else { toast.error("Geolocation is not supported."); setGettingLocation(false); }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) { toast.error("Please upload at least one image."); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("You must be logged in."); router.push("/auth/login"); return; }

    const uploadedUrls: string[] = [];
    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, file);
      if (uploadError) { toast.error("Error uploading image: " + uploadError.message); setLoading(false); return; }
      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
      uploadedUrls.push(publicUrl);
    }

    const { error } = await supabase.from("products").insert({
      seller_id: user.id, title, description, price: parseFloat(price), category,
      image_url: uploadedUrls[0], image_urls: uploadedUrls, latitude: latitude, longitude: longitude,
    });

    if (error) { toast.error("Error uploading product: " + error.message); setLoading(false); }
    else {
      toast.success("Product posted successfully!");
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#2563eb', '#facc15', '#16a34a'] });
      router.push("/protected"); router.refresh();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#e8f0fe] dark:bg-slate-950 transition-colors">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-300 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-indigo-300 dark:bg-indigo-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-purple-300 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 mt-8">
          <div className="bg-[#f0f4f8] dark:bg-slate-900 p-8 sm:p-10 rounded-[2rem] shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#020617,-8px_-8px_16px_#1e293b] transition-colors">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Sell an Item</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-8">Post to the marketplace</p>
            
            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Product Images (Max 5)</label>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-[inset_2px_2px_5px_#020617,inset_-2px_-2px_5px_#1e293b]">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  {imageFiles.length < 5 && (
                    <label className="flex flex-col items-center justify-center aspect-square rounded-2xl cursor-pointer bg-[#f0f4f8] dark:bg-slate-800 shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-[inset_2px_2px_5px_#020617,inset_-2px_-2px_5px_#1e293b] hover:bg-[#e2e8f0] dark:hover:bg-slate-700 transition-all border-2 border-dashed border-slate-300 dark:border-slate-600">
                      <ImagePlus className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Add Photo</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageChange} className="sr-only" />
                    </label>
                  )}
                </div>
              </div>
              <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Item Title</label><input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-5 py-3.5 bg-[#f0f4f8] dark:bg-slate-800 rounded-xl border border-white/50 dark:border-slate-700 text-slate-900 dark:text-white outline-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-[inset_2px_2px_5px_#020617,inset_-2px_-2px_5px_#1e293b] focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="e.g. HP Laptop (Used)" /></div>
              <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Price (GH₵)</label><input type="number" required step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-5 py-3.5 bg-[#f0f4f8] dark:bg-slate-800 rounded-xl border border-white/50 dark:border-slate-700 text-slate-900 dark:text-white outline-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-[inset_2px_2px_5px_#020617,inset_-2px_-2px_5px_#1e293b] focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="e.g. 2500" /></div>
              <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-5 py-3.5 bg-[#f0f4f8] dark:bg-slate-800 rounded-xl border border-white/50 dark:border-slate-700 text-slate-900 dark:text-white outline-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-[inset_2px_2px_5px_#020617,inset_-2px_-2px_5px_#1e293b] focus:ring-2 focus:ring-indigo-500/20 transition-all"><option value="Books">Books & Stationery</option><option value="Electronics">Electronics</option><option value="Fashion">Fashion & Clothing</option><option value="Hostel">Hostel Essentials</option><option value="Other">Other</option></select></div>
              <div><label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label><textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-5 py-3.5 bg-[#f0f4f8] dark:bg-slate-800 rounded-xl border border-white/50 dark:border-slate-700 text-slate-900 dark:text-white outline-none shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:shadow-[inset_2px_2px_5px_#020617,inset_-2px_-2px_5px_#1e293b] focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="Describe the condition of the item..." /></div>
              
              <div className="pt-6 border-t border-white/60 dark:border-slate-700">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Meeting Location (Optional)</label>
                <button type="button" onClick={handleGetLocation} disabled={gettingLocation} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#f0f4f8] dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#020617,-4px_-4px_8px_#1e293b] hover:shadow-[inset_2px_2px_5px_#d1d9e6,inset_-2px_-2px_5px_#ffffff] dark:hover:shadow-[inset_2px_2px_5px_#020617,inset_-2px_-2px_5px_#1e293b] transition-all w-full">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                  {gettingLocation ? "Getting location..." : latitude ? "Location Set ✅" : "Tag My Current Location"}
                </button>
              </div>
              <button type="submit" disabled={loading} className="w-full relative flex items-center justify-center py-4 mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-[0_10px_20px_-5px_rgba(79,70,229,0.5)] hover:shadow-[0_15px_25px_-5px_rgba(79,70,229,0.6)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span className="relative z-10">Post Item</span>}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}