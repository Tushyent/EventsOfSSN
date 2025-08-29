import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ApprovalList from "./ApprovalList";

export const dynamic = 'force-dynamic';

export default async function ApprovalsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "super_admin") {
    redirect("/"); 
  }

  const { data: pendingEvents, error } = await supabase
    .from("events")
    .select("id, title, description, category, venue, event_date, registration_deadline, poster_url, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
        Approval Queue
      </h1>
      <p className="text-gray-400 mb-8">Review and approve or reject pending events submitted by Club Admins.</p>

      {error ? (
        <div className="bg-red-500/20 text-red-200 p-4 rounded-xl border border-red-500/50">
          Failed to load events: {error.message}
        </div>
      ) : (
        <ApprovalList events={pendingEvents || []} />
      )}
    </div>
  );
}
