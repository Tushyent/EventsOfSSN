"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function registerForEventAction(eventId: string) {
  try {
    const supabase = await createClient();
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: "You must be logged in to register for an event." };
    }

    // Check if already registered
    const { data: existingReg } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', eventId)
      .single();

    if (existingReg) {
      return { error: "You are already registered for this event." };
    }

    // Insert registration
    const { error: insertError } = await supabase
      .from('event_registrations')
      .insert({
        user_id: user.id,
        event_id: eventId,
        status: 'registered'
      });

    if (insertError) {
      return { error: `Registration failed: ${insertError.message}` };
    }

    revalidatePath(`/events/${eventId}`);
    return { success: true };
    
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "An unexpected error occurred." };
  }
}
