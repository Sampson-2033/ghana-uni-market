import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

async function InboxData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Mark all received messages as read when the user opens the inbox
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("receiver_id", user.id)
    .eq("is_read", false);

  // Fetch all messages where the current user is the receiver
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      *,
      profiles!messages_sender_id_fkey ( full_name, avatar_url ),
      products ( title, id )
    `)
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false });

  if (!messages || messages.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No messages yet</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">When buyers ask about your items, their messages will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => {
        const sender: any = Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles;
        const product: any = Array.isArray(msg.products) ? msg.products[0] : msg.products;

        return (
          <Link 
            href={`/product/${product?.id}?chatWith=${msg.sender_id}`} 
            key={msg.id} 
            className="block bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                {sender?.avatar_url ? <img src={sender.avatar_url} className="w-full h-full object-cover" /> : null}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {sender?.full_name || "Student"}
                  </h3>
                  <span className="text-xs text-slate-400">{new Date(msg.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">Regarding: {product?.title}</p>
                <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-sm">{msg.content}</p>
                <p className="text-xs text-blue-500 mt-2 font-medium">Click to reply in chat →</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function InboxPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">My Inbox</h1>
        <Suspense fallback={<p className="text-center text-slate-500 animate-pulse">Loading messages...</p>}>
          <InboxData />
        </Suspense>
      </main>
    </div>
  );
}