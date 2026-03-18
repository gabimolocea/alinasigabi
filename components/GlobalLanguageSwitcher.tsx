"use client";

import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { usePreferredLanguage } from "@/lib/language";

export function GlobalLanguageSwitcher() {
  const { language, setLanguage } = usePreferredLanguage();

  return (
    <div className="fixed right-3 top-[max(env(safe-area-inset-top),12px)] z-[60] sm:right-6">
      <div className="rounded-full border border-[#9B8557]/25 bg-[#F5F0EA]/90 p-1 shadow-sm backdrop-blur-sm">
        <LanguageSwitcher language={language} onChange={setLanguage} />
      </div>
    </div>
  );
}
