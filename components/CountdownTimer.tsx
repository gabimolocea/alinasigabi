"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  zile: number;
  ore: number;
  minute: number;
  secunde: number;
}

function calcTimeLeft(targetDate: string): TimeLeft {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { zile: 0, ore: 0, minute: 0, secunde: 0 };
  return {
    zile: Math.floor(diff / (1000 * 60 * 60 * 24)),
    ore: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minute: Math.floor((diff / (1000 * 60)) % 60),
    secunde: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calcTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: "Zile", value: timeLeft.zile },
    { label: "Ore", value: timeLeft.ore },
    { label: "Minute", value: timeLeft.minute },
    { label: "Secunde", value: timeLeft.secunde },
  ];

  return (
    <div className="flex gap-4 md:gap-8 justify-center">
      {units.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-[#4A0B18] bg-opacity-80 rounded-2xl flex items-center justify-center shadow-md gold-border">
            <span className="font-playfair text-2xl md:text-3xl text-[#D4A843] font-bold">
              {String(value).padStart(2, "0")}
            </span>
          </div>
          <span className="font-lato text-[#F5E6D3] text-xs tracking-widest uppercase mt-2 opacity-80">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
