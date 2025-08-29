"use client";

import { useState } from "react";
import { approveEventAction, rejectEventAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Check, X, Loader2, Calendar as CalendarIcon, MapPin } from "lucide-react";

export default function ApprovalList({ events }: { events: Record<string, unknown>[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    await approveEventAction(id);
    setLoadingId(null);
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this event?")) return;
    setLoadingId(id);
    await rejectEventAction(id);
    setLoadingId(null);
  };

  if (events.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 p-12 rounded-2xl flex flex-col items-center justify-center text-center">
        <Check className="w-12 h-12 text-green-400 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
        <p className="text-gray-400">There are no pending events waiting for approval.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event) => (
        <div key={event.id as string} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row gap-6 hover:bg-white/10 transition-colors">
          <div className="w-full md:w-48 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-black/50 border border-white/10">
            {event.poster_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={event.poster_url as string} alt={event.title as string} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
            )}
          </div>
          
          <div className="flex-grow flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                {event.category as string}
              </span>
              <span className="text-xs text-gray-400">
                Submitted on {format(new Date(event.created_at as string), "MMM d, yyyy")}
              </span>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">{event.title as string}</h3>
            
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                {format(new Date(event.event_date as string), "PPP")}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {event.venue as string}
              </span>
            </div>
            
            <p className="text-gray-300 text-sm line-clamp-2">{event.description as string}</p>
          </div>
          
          <div className="flex flex-row md:flex-col items-center justify-center gap-3 min-w-[140px]">
            <Button
              onClick={() => handleApprove(event.id as string)}
              disabled={loadingId !== null}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium shadow-lg shadow-green-500/20 transition-all"
            >
              {loadingId === event.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Approve</>}
            </Button>
            <Button
              onClick={() => handleReject(event.id as string)}
              disabled={loadingId !== null}
              variant="outline"
              className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
            >
              {loadingId === event.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-2" /> Reject</>}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
