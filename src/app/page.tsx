import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import EventCard from "@/components/EventCard";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch approved events
  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, category, venue, event_date, poster_url")
    .eq("status", "approved")
    .order("event_date", { ascending: true });

  return (
    <div className="flex flex-col relative overflow-hidden min-h-[calc(100vh-4rem)] pb-24">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] -z-10 animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Hero Section */}
      <div className="text-center px-4 max-w-3xl mx-auto z-10 pt-20 pb-24">
        <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">1,400+ students · 20+ clubs · 15+ events/mo</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
          Your Campus Life, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Centralized.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Never miss a registration deadline again. The single source of truth for all symposiums, hackathons, and club events at SSN.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#events" className={buttonVariants({ size: "lg", className: "rounded-full px-8 h-12 bg-white text-black hover:bg-gray-200 transition-all hover:scale-105 w-full sm:w-auto text-base font-semibold" })}>
            Explore Events
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
          <Link href="/admin/events/new" className={buttonVariants({ size: "lg", variant: "outline", className: "rounded-full px-8 h-12 border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all hover:scale-105 w-full sm:w-auto text-base text-white" })}>
            Post an Event
          </Link>
        </div>
      </div>

      {/* Events Feed Section */}
      <div id="events" className="container mx-auto px-4 z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Upcoming Events</h2>
          {/* We can add filtering dropdowns here later */}
        </div>

        {error ? (
          <div className="p-4 bg-red-500/20 text-red-200 rounded-xl border border-red-500/50">
            Failed to load events. Please try again later.
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-2">No upcoming events</h3>
            <p className="text-gray-400">Check back later for new events on campus!</p>
          </div>
        )}
      </div>
    </div>
  );
}
