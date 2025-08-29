import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, MapPin, ExternalLink, Tag } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import CountdownTimer from "@/components/CountdownTimer";

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

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Col: Poster & Quick Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/50 shadow-2xl shadow-purple-500/10">
            {event.poster_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={event.poster_url} alt={event.title} className="w-full object-cover aspect-[4/5]" />
            ) : (
              <div className="w-full aspect-[4/5] flex items-center justify-center text-gray-500">No Poster</div>
            )}
          </div>
          
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4">Event Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-gray-300">
                <CalendarIcon className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Date & Time</p>
                  <p className="text-sm">{format(new Date(event.event_date), "PPPP p")}</p>
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

          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
            <h2 className="text-2xl font-bold text-white mb-2">Registration</h2>
            <p className="text-gray-400 mb-6">Secure your spot before the deadline.</p>
            
            {event.registration_link ? (
              <a href={event.registration_link} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "lg", className: "w-full sm:w-auto h-14 px-8 bg-white text-black hover:bg-gray-200 text-lg font-semibold rounded-xl transition-all hover:scale-105" })}>
                Register Now
                <ExternalLink className="w-5 h-5 ml-2" />
              </a>
            ) : (
              <Button size="lg" disabled className="w-full sm:w-auto h-14 px-8 bg-white/10 text-gray-400 text-lg font-semibold rounded-xl border border-white/5 cursor-not-allowed">
                Registration Closed
              </Button>
            )}

            <CountdownTimer targetDate={event.registration_deadline} />
          </div>
        </div>
      </div>
    </div>
  );
}
