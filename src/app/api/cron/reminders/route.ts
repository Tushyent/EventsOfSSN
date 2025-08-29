import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { EventReminderEmail } from "@/components/emails/EventReminderEmail";
import { format } from "date-fns";

// Initialize Resend (with a fallback to prevent build failures if the env var is missing during Next.js static analysis)
const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key_for_build");

export async function GET(request: Request) {
  try {
    // Check for a secret authorization header to prevent public triggering (Vercel Cron provides this)
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use Service Role Key to bypass RLS for updating the events table and reading all bookmarks
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Find events where the deadline is within the next 2 hours, and reminder_sent is false
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, title, registration_deadline, venue")
      .eq("status", "approved")
      .eq("reminder_sent", false)
      .gt("registration_deadline", now.toISOString())
      .lt("registration_deadline", twoHoursFromNow.toISOString());

    if (eventsError) throw eventsError;
    
    if (!events || events.length === 0) {
      return NextResponse.json({ message: "No events require reminders at this time." });
    }

    const emailsSent = [];

    // 2. For each event, fetch bookmarked users and send emails
    for (const event of events) {
      const { data: bookmarks } = await supabase
        .from("event_bookmarks")
        .select("user_id")
        .eq("event_id", event.id);

      if (!bookmarks || bookmarks.length === 0) continue;

      const userIds = bookmarks.map(b => b.user_id);

      const { data: users } = await supabase
        .from("users")
        .select("email")
        .in("id", userIds);

      if (users && users.length > 0) {
        const emails = users.map(u => u.email);
        
        // Send email via Resend
        // Note: Free Resend accounts can only send to verified domains. In production, this works flawlessly.
        await resend.emails.send({
          from: "EventsOfSSN <reminders@eventsofssn.com>", // Replace with a verified domain in production
          to: emails,
          subject: `Reminder: Registration closing for ${event.title}`,
          react: EventReminderEmail({
            eventTitle: event.title,
            eventLink: `https://eventsofssn.com/events/${event.id}`,
            deadlineString: format(new Date(event.registration_deadline), "PPPP p"),
            venue: event.venue
          })
        });

        emailsSent.push({ event: event.title, count: emails.length });
      }

      // 3. Mark as reminder_sent
      await supabase
        .from("events")
        .update({ reminder_sent: true })
        .eq("id", event.id);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Reminders processed successfully.",
      details: emailsSent 
    });
    
  } catch (error: unknown) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
