"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: string;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        clearInterval(interval);
        setIsExpired(true);
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, mounted]);

  if (!mounted) return null;

  if (isExpired) {
    return (
      <div className="bg-red-500/20 text-red-200 border border-red-500/30 px-6 py-4 rounded-xl text-center font-semibold mt-6">
        Registration has ended.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="text-sm text-gray-400 mb-3 font-medium uppercase tracking-wider">Registration Closes In:</p>
      <div className="flex gap-4">
        {[
          { label: "Days", value: timeLeft.days },
          { label: "Hours", value: timeLeft.hours },
          { label: "Mins", value: timeLeft.minutes },
          { label: "Secs", value: timeLeft.seconds },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center justify-center bg-white/5 border border-white/10 w-20 h-20 rounded-xl backdrop-blur-sm shadow-xl shadow-black/50">
            <span className="text-2xl font-bold text-white">{item.value.toString().padStart(2, "0")}</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
