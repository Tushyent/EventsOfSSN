"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleBookmarkAction(eventId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be logged in to bookmark events." };
    }

    // Check if it already exists
    const { data: existing } = await supabase
      .from("event_bookmarks")
      .select("event_id")
      .eq("user_id", user.id)
      .eq("event_id", eventId)
      .single();

    if (existing) {
      // Remove bookmark
      const { error } = await supabase
        .from("event_bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("event_id", eventId);
      
      if (error) throw error;
      
      revalidatePath(`/events/${eventId}`);
      revalidatePath("/");
      return { success: true, bookmarked: false };
    } else {
      // Add bookmark
      const { error } = await supabase
        .from("event_bookmarks")
        .insert({ user_id: user.id, event_id: eventId });
        
      if (error) throw error;
      
      revalidatePath(`/events/${eventId}`);
      revalidatePath("/");
      return { success: true, bookmarked: true };
    }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Failed to toggle bookmark." };
  }
}

export async function logEventMetricAction(eventId: string, metricType: 'view' | 'click') {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fire and forget metric logging
    const { error } = await supabase
      .from("event_analytics")
      .insert({
        event_id: eventId,
        metric_type: metricType,
        user_id: user ? user.id : null,
      });

    if (error) console.error("Failed to log metric:", error);
    
    // We don't revalidate path here to avoid unnecessary server renders for simple tracking
    return { success: true };
  } catch (error) {
    console.error("Metric logging error:", error);
    return { error: "Failed to log metric" };
  }
}
