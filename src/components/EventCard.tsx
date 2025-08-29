import Link from "next/link";
import { format } from "date-fns";
import { CalendarIcon, MapPin } from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    category: string;
    venue: string;
    event_date: string;
    poster_url: string;
  };
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/events/${event.id}`} className="group block">
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col h-full">
        <div className="relative h-48 w-full bg-black/50 overflow-hidden">
          {event.poster_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={event.poster_url} 
              alt={event.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
          )}
          <div className="absolute top-3 left-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 uppercase tracking-wider shadow-xl">
              {event.category}
            </span>
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-1 group-hover:text-purple-300 transition-colors">
            {event.title}
          </h3>
          
          <div className="space-y-2 mt-auto text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-purple-400" />
              <span>{format(new Date(event.event_date), "PPP")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
