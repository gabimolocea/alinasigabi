"use client";

import { localeOptions, type Locale } from "@/lib/language";

export function LanguageSwitcher({
  language,
  onChange,
  className = "",
}: {
  language: Locale;
  onChange: (language: Locale) => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`.trim()}>
      {localeOptions.map(({ code, label }) => {
        const isActive = language === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => onChange(code)}
            className={`min-w-9 rounded-full border px-2.5 py-1 text-[10px] font-lato font-bold tracking-[0.16em] uppercase leading-none transition ${
              isActive
                ? "bg-[#9B8557] border-[#9B8557] text-white"
                : "bg-white/90 border-[#9B8557]/25 text-[#9B8557] hover:border-[#9B8557]"
            }`}
            aria-pressed={isActive}
            aria-label={label}
            title={label}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
