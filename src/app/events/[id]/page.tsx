import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Tag, CalendarPlus, Trophy, Phone, IndianRupee } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import CountdownTimer from "@/components/CountdownTimer";
import EventActions from "./EventActions";

export const dynamic = 'force-dynamic';

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event) {
    notFound();
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  let isBookmarked = false;
  if (user) {
    const { data: bookmark } = await supabase
      .from("event_bookmarks")
      .select("event_id")
      .eq("user_id", user.id)
      .eq("event_id", id)
      .single();
      
    if (bookmark) isBookmarked = true;
  }

  let isRegistered = false;
  if (user) {
    const { data: registration } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("user_id", user.id)
      .eq("event_id", id)
      .single();
      
    if (registration) isRegistered = true;
  }

  // Fire and forget view tracking
  supabase.from("event_analytics").insert({
    event_id: id,
    metric_type: 'view',
    user_id: user ? user.id : null,
  }).then();

  const startDateStr = new Date(event.event_date).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const endDateStr = new Date(new Date(event.event_date).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDateStr}/${endDateStr}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.venue)}`;

  const isFree = !event.registration_fee || event.registration_fee.toLowerCase() === 'free' || event.registration_fee === '0';

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Col: Poster & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/50 shadow-2xl shadow-purple-500/10 relative">
            <div className={`absolute top-4 left-4 z-10 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg backdrop-blur-md ${isFree ? 'bg-green-500/90 text-white' : 'bg-blue-500/90 text-white'}`}>
              {isFree ? 'Free Registration' : event.registration_fee}
            </div>
            {event.poster_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={event.poster_url} alt={event.title} className="w-full object-cover aspect-[4/5]" />
            ) : (
              <div className="w-full aspect-[4/5] flex items-center justify-center text-gray-500">No Poster</div>
            )}
          </div>
          
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm space-y-6">
            <h3 className="text-lg font-bold text-white mb-4">Event Info</h3>
            
            <div className="space-y-5">
              <div className="flex items-start gap-3 text-gray-300">
                <CalendarIcon className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Date & Time</p>
                  <p className="text-sm">{format(new Date(event.event_date), "PPPP")}</p>
                  {event.event_time && <p className="text-sm text-purple-200 mt-1">{event.event_time}</p>}
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-gray-300">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Venue</p>
                  <p className="text-sm">{event.venue}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-gray-300">
                <Tag className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Category</p>
                  <p className="text-sm capitalize">{event.category}</p>
                </div>
              </div>

              {!isFree && (
                <div className="flex items-start gap-3 text-gray-300">
                  <IndianRupee className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Registration Fee</p>
                    <p className="text-sm font-semibold text-green-300">{event.registration_fee}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Details & Registration */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-4">
              <span className={`w-2 h-2 rounded-full ${event.status === 'approved' ? 'bg-green-400' : event.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'}`}></span>
              <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">{event.status}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              {event.title}
            </h1>
            
            <div className="prose prose-invert max-w-none prose-lg">
              <p className="text-gray-300 whitespace-pre-wrap">{event.description}</p>
            </div>
          </div>

          {(event.prize_pool || event.coordinator_contact) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.prize_pool && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-5 rounded-2xl flex items-start gap-4">
                  <div className="bg-yellow-500/20 p-3 rounded-xl">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Prize Pool</h4>
                    <p className="text-yellow-200/80 text-sm whitespace-pre-wrap">{event.prize_pool}</p>
                  </div>
                </div>
              )}

              {event.coordinator_contact && (
                <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl flex items-start gap-4">
                  <div className="bg-blue-500/20 p-3 rounded-xl">
                    <Phone className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Contact Details</h4>
                    <p className="text-blue-200/80 text-sm whitespace-pre-wrap">{event.coordinator_contact}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
            <h2 className="text-2xl font-bold text-white mb-2">Registration & Actions</h2>
            <p className="text-gray-400 mb-6">Secure your spot and save to your calendar.</p>
            
            <div className="space-y-4">
              <EventActions 
                eventId={event.id} 
                initialBookmark={isBookmarked} 
                initialRegistered={isRegistered}
              />
              
              <div className="pt-2">
                <a 
                  href={googleCalendarUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={buttonVariants({ variant: "ghost", className: "text-gray-400 hover:text-white hover:bg-white/5" })}
                >
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Add to Google Calendar
                </a>
              </div>
            </div>

            <div className="mt-8">
              <CountdownTimer targetDate={event.registration_deadline} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
