"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, CheckCircle2, Loader2 } from "lucide-react";
import { toggleBookmarkAction, logEventMetricAction } from "@/actions/engagement";
import { registerForEventAction } from "@/actions/registration";

export default function EventActions({ 
  eventId, 
  initialBookmark,
  initialRegistered
}: { 
  eventId: string, 
  initialBookmark: boolean,
  initialRegistered: boolean
}) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmark);
  const [isRegistered, setIsRegistered] = useState(initialRegistered);
  const [loadingBookmark, setLoadingBookmark] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const handleBookmark = async () => {
    setLoadingBookmark(true);
    const res = await toggleBookmarkAction(eventId);
    setLoadingBookmark(false);
    if (res.error) {
      alert(res.error);
    } else {
      setIsBookmarked(res.bookmarked as boolean);
    }
  };

  const handleRegisterClick = async () => {
    setLoadingRegister(true);
    setRegisterError("");
    logEventMetricAction(eventId, 'click'); // Log intent

    const res = await registerForEventAction(eventId);
    
    setLoadingRegister(false);
    if (res.error) {
      setRegisterError(res.error);
    } else {
      setIsRegistered(true);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {isRegistered ? (
          <Button size="lg" disabled className="w-full sm:w-auto h-14 px-8 bg-green-500/20 text-green-400 border border-green-500/30 text-lg font-semibold rounded-xl cursor-default">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Registered
          </Button>
        ) : (
          <Button 
            onClick={handleRegisterClick} 
            disabled={loadingRegister}
            size="lg"
            className="w-full sm:w-auto h-14 px-8 bg-white text-black hover:bg-gray-200 text-lg font-semibold rounded-xl transition-all hover:scale-105"
          >
            {loadingRegister ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Registering...</>
            ) : (
              "Register Now"
            )}
          </Button>
        )}

        <Button 
          type="button"
          onClick={handleBookmark}
          disabled={loadingBookmark}
          variant="outline" 
          size="lg" 
          className={`w-full sm:w-auto h-14 px-6 rounded-xl border-white/20 transition-all ${isBookmarked ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30' : 'bg-white/5 text-white hover:bg-white/10'}`}
        >
          <Bookmark className={`w-5 h-5 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
          {isBookmarked ? 'Saved' : 'Save Event'}
        </Button>
      </div>

      {registerError && (
        <p className="text-sm text-red-400">{registerError}</p>
      )}
    </div>
  );
}
