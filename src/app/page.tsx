import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Sparkles, Filter } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import EventCard from "@/components/EventCard";

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string, type?: string }> }) {
  const supabase = await createClient();
  const { category, type } = await searchParams;
  
  // Fetch approved events
  let query = supabase
    .from("events")
    .select("id, title, category, venue, event_date, event_time, poster_url, registration_fee")
    .eq("status", "approved")
    .order("event_date", { ascending: true });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data: events, error } = await query;

  // Manual filter for free vs paid since it's text-based
  let filteredEvents = events || [];
  if (type === 'free') {
    filteredEvents = filteredEvents.filter(e => !e.registration_fee || e.registration_fee.toLowerCase() === 'free' || e.registration_fee === '0');
  } else if (type === 'paid') {
    filteredEvents = filteredEvents.filter(e => e.registration_fee && e.registration_fee.toLowerCase() !== 'free' && e.registration_fee !== '0');
  }

  // Fetch bookmarks
  const { data: { user } } = await supabase.auth.getUser();
  const bookmarkedEventIds = new Set<string>();
  
  if (user && filteredEvents.length > 0) {
    const { data: bookmarks } = await supabase
      .from("event_bookmarks")
      .select("event_id")
      .eq("user_id", user.id)
      .in("event_id", filteredEvents.map(e => e.id as string));
      
    if (bookmarks) {
      bookmarks.forEach(b => bookmarkedEventIds.add(b.event_id as string));
    }
  }

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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h2 className="text-3xl font-bold text-white">Upcoming Events</h2>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
            <Filter className="w-4 h-4 text-gray-400 ml-2" />
            
            <div className="flex gap-2">
              <Link href={`/?category=all&type=${type || 'all'}#events`} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${!category || category === 'all' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>All</Link>
              <Link href={`/?category=Tech Events&type=${type || 'all'}#events`} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${category === 'Tech Events' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Tech</Link>
              <Link href={`/?category=Non-Tech Events&type=${type || 'all'}#events`} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${category === 'Non-Tech Events' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Non-Tech</Link>
              <Link href={`/?category=Workshops&type=${type || 'all'}#events`} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${category === 'Workshops' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Workshops</Link>
            </div>

            <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block"></div>

            <div className="flex gap-2">
              <Link href={`/?category=${category || 'all'}&type=all#events`} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${!type || type === 'all' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Any Price</Link>
              <Link href={`/?category=${category || 'all'}&type=free#events`} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${type === 'free' ? 'bg-green-500/20 text-green-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Free</Link>
              <Link href={`/?category=${category || 'all'}&type=paid#events`} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${type === 'paid' ? 'bg-yellow-500/20 text-yellow-300' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Paid</Link>
            </div>
          </div>
        </div>

        {error ? (
          <div className="p-4 bg-red-500/20 text-red-200 rounded-xl border border-red-500/50">
            Failed to load events. Please try again later.
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id as string} event={event as any} isBookmarked={bookmarkedEventIds.has(event.id as string)} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
            <p className="text-gray-400">Try adjusting your filters or check back later.</p>
            <Link href="/" className="mt-4 inline-block text-purple-400 hover:text-purple-300">Clear all filters</Link>
          </div>
        )}
      </div>
    </div>
  );
}
