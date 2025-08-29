import Link from "next/link";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Bookmark, IndianRupee } from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    category: string;
    venue: string;
    event_date: string;
    event_time?: string;
    poster_url: string;
    registration_fee?: string;
  };
  isBookmarked?: boolean;
}

export default function EventCard({ event, isBookmarked = false }: EventCardProps) {
  const isFree = !event.registration_fee || event.registration_fee.toLowerCase() === 'free' || event.registration_fee === '0';

  return (
    <Link href={`/events/${event.id}`} className="group block h-full">
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col h-full relative">
        
        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-start pointer-events-none">
          <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md ${isFree ? 'bg-green-500/80 text-white' : 'bg-blue-500/80 text-white'}`}>
            {isFree ? 'Free' : event.registration_fee}
          </div>
          
          {isBookmarked && (
            <div className="bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-lg">
              <Bookmark className="w-4 h-4 text-purple-400 fill-purple-400" />
            </div>
          )}
        </div>

        <div className="relative h-48 w-full bg-black/50 overflow-hidden">
          {event.poster_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={event.poster_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">No Poster</div>
          )}
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 capitalize border border-white/5">
              {event.category}
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
            {event.title}
          </h3>
          
          <div className="mt-auto space-y-2 pt-4">
            <div className="flex items-center text-sm text-gray-400">
              <CalendarIcon className="w-4 h-4 mr-2 text-purple-400 shrink-0" />
              <span className="truncate">
                {format(new Date(event.event_date), "MMM d, yyyy")} {event.event_time ? `• ${event.event_time}` : ''}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <MapPin className="w-4 h-4 mr-2 text-blue-400 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
