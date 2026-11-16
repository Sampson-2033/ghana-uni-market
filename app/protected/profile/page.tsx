import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import { User, School, Phone, BadgeCheck, ShieldAlert, Users } from "lucide-react";
import VerifiedBadge from "@/components/VerifiedBadge";
import UpgradeToSeller from "@/components/UpgradeToSeller";
import AvatarUploader from "@/components/AvatarUploader";
import EditProfileForm from "@/components/EditProfileForm";
import EditWhatsApp from "@/components/EditWhatsApp";
import TrackProfileView from "@/components/TrackProfileView";

async function ProfileData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const { data: viewData } = await supabase.from("profile_views").select("viewer_id").eq("viewed_id", user.id).order("created_at", { ascending: false }).limit(10);

  let visitors: any[] = [];
  if (viewData && viewData.length > 0) {
    const viewerIds = viewData.map(v => v.viewer_id);
    const { data: profilesData } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", viewerIds);
    if (profilesData) visitors = profilesData;
  }

  const isAdmin = user.email === "sampsonantwi96@gmail.com";

  return (
    <>
      <TrackProfileView profileId={user.id} currentUserId={user.id} />
      <div className="bg-[#f0f4f8] dark:bg-slate-900 rounded-[2rem] shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#020617,-8px_-8px_16px_#1e293b] overflow-hidden transition-colors">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white flex items-center gap-4">
          <AvatarUploader userId={user.id} currentAvatarUrl={profile?.avatar_url} />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{profile?.full_name || "Student"}</h1>
            <p className="text-blue-100 text-sm">{user.email}</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {isAdmin && <div className="flex justify-end -mb-2"><EditProfileForm profile={profile} /></div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><School className="w-4 h-4 text-indigo-500"/> Institution</p>
              <p className="font-semibold text-slate-900 dark:text-white">{profile?.institution || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><User className="w-4 h-4 text-indigo-500"/> Student ID</p>
              <p className="font-semibold text-slate-900 dark:text-white">{profile?.student_id || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><Phone className="w-4 h-4 text-indigo-500"/> WhatsApp Number</p>
              <div className="flex items-center gap-3">
                <p className="font-semibold text-slate-900 dark:text-white">{profile?.whatsapp_number || "Not set"}</p>
                <EditWhatsApp userId={user.id} currentNumber={profile?.whatsapp_number || ""} />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><BadgeCheck className="w-4 h-4 text-indigo-500"/> Verification Status</p>
              {profile?.is_verified ? <VerifiedBadge /> : (
                <div className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                  <ShieldAlert className="w-3 h-3" /><span>Pending Verification</span>
                </div>
              )}
            </div>
          </div>

          {!profile?.is_verified && (
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm p-4 rounded-xl border border-blue-100 dark:border-blue-800 shadow-inner">
              <strong>How to get verified:</strong> Send a picture of your Student ID card to the Admin on WhatsApp. Once approved, your green badge will appear on all your listings!
            </div>
          )}

          <div className="mt-6 border-t border-white/60 dark:border-slate-700 pt-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Account Type</h3>
            <UpgradeToSeller userId={user.id} currentStatus={profile?.role || 'buyer'} />
          </div>

          <div className="mt-8 border-t border-white/60 dark:border-slate-700 pt-6">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-indigo-500" /> Recent Profile Visitors</h3>
            {!visitors || visitors.length === 0 ? (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No one has viewed your profile yet.</p>
            ) : (
              <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
                {visitors.map((visitor) => (
                  <div key={visitor.id} className="flex flex-col items-center gap-2 min-w-[70px]">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-[2px_2px_5px_#d1d9e6,-2px_-2px_5px_#ffffff] dark:shadow-none">
                      {visitor?.avatar_url ? <img src={visitor.avatar_url} alt="Visitor" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><User className="w-6 h-6" /></div>}
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center truncate w-full">{visitor?.full_name?.split(' ')[0] || "Student"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function ProfilePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#e8f0fe] dark:bg-slate-950 transition-colors">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-300 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-indigo-300 dark:bg-indigo-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-purple-300 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-12">
          <Suspense fallback={<div className="text-center py-20"><p className="text-slate-500 dark:text-slate-400 animate-pulse font-bold">Loading profile...</p></div>}>
            <ProfileData />
          </Suspense>
        </main>
      </div>
    </div>
  );
}