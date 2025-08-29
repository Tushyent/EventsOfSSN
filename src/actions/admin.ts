"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { SupabaseClient } from "@supabase/supabase-js";

// Helper to ensure the user is a super admin
async function requireSuperAdmin(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || data?.role !== "super_admin") {
    throw new Error("Forbidden: Super Admin access required.");
  }
}

export async function approveEventAction(eventId: string) {
  try {
    const supabase = await createClient();
    await requireSuperAdmin(supabase);

    const { error } = await supabase
      .from("events")
      .update({ status: "approved" })
      .eq("id", eventId);

    if (error) throw error;
    
    revalidatePath("/admin/events/approvals");
    revalidatePath("/");
    revalidatePath("/events");
    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function rejectEventAction(eventId: string) {
  try {
    const supabase = await createClient();
    await requireSuperAdmin(supabase);

    const { error } = await supabase
      .from("events")
      .update({ status: "rejected" })
      .eq("id", eventId);

    if (error) throw error;
    
    revalidatePath("/admin/events/approvals");
    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}
