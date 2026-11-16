"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TrackProfileView({ profileId, currentUserId }: { profileId: string, currentUserId: string }) {
  useEffect(() => {
    const logView = async () => {
      if (typeof profileId !== 'string' || profileId.trim() === '' || typeof currentUserId !== 'string' || currentUserId.trim() === '') return;
      if (profileId === currentUserId) return;

      const supabase = createClient();
      const { error } = await supabase.from("profile_views").upsert(
        { viewer_id: currentUserId, viewed_id: profileId, created_at: new Date().toISOString() },
        { onConflict: 'viewer_id,viewed_id' }
      );

      if (error) console.error("Error logging view:", error.message);
    };

    const timer = setTimeout(() => { logView(); }, 1000);
    return () => clearTimeout(timer);
  }, [profileId, currentUserId]);

  return null;
}