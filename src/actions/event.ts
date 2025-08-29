"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export async function createEventAction(formData: FormData) {
  try {
    const supabase = await createClient();
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: "You must be logged in to create an event." };
    }

    // Extract basic fields
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const venue = formData.get("venue") as string;
    const event_date = formData.get("event_date") as string;
    const registration_deadline = formData.get("registration_deadline") as string;
    const registration_link = formData.get("registration_link") as string;
    const poster = formData.get("poster") as File;

    if (!title || !description || !category || !venue || !event_date || !registration_deadline || !poster) {
      return { error: "All required fields must be filled." };
    }

    // Upload poster to Supabase Storage
    const fileExt = poster.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('event-posters')
      .upload(fileName, poster, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return { error: `Failed to upload poster: ${uploadError.message}` };
    }

    // Get public URL of the uploaded poster
    const { data: publicUrlData } = supabase.storage
      .from('event-posters')
      .getPublicUrl(fileName);

    const poster_url = publicUrlData.publicUrl;

    // Insert into database
    const { error: dbError } = await supabase
      .from('events')
      .insert({
        title,
        description,
        category,
        venue,
        event_date,
        registration_deadline,
        registration_link: registration_link || null,
        poster_url,
        status: 'pending', // Requires Super Admin approval
        created_by: user.id
      });

    if (dbError) {
      return { error: `Database error: ${dbError.message}` };
    }

    revalidatePath("/events");
    return { success: true };
    
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "An unexpected error occurred." };
  }
}
