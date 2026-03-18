"use client";

import Link from "next/link";
import { type Locale, usePreferredLanguage } from "@/lib/language";

const homeTranslations: Record<Locale, {
  date: string;
  togetherWithParents: string;
  andGodparents: string;
  invitationText: string;
  ceremonyLabel: string;
  receptionLabel: string;
  confirmPresence: string;
}> = {
  ro: {
    date: "26 Iulie 2026",
    togetherWithParents: "Împreună cu părinții,",
    andGodparents: "Și nașii,",
    invitationText: "Vă așteptăm cu mare drag|la acest moment important|din viața noastră.",
    ceremonyLabel: "Biserica “Sf. Ștefan”",
    receptionLabel: "Hotel Pleiada “Sala Atlas”",
    confirmPresence: "Confirmă prezența",
  },
  en: {
    date: "July 26, 2026",
    togetherWithParents: "Together with our parents,",
    andGodparents: "And our godparents,",
    invitationText: "We look forward to welcoming you|to this important moment|in our lives.",
    ceremonyLabel: "Church “Sf. Ștefan”",
    receptionLabel: "Hotel Pleiada “Sala Atlas”",
    confirmPresence: "Confirm attendance",
  },
  fr: {
    date: "26 Juillet 2026",
    togetherWithParents: "Avec nos parents,",
    andGodparents: "Et nos parrains de mariage,",
    invitationText: "Nous vous attendons avec joie|pour ce moment important|de notre vie.",
    ceremonyLabel: "Église “Sf. Ștefan”",
    receptionLabel: "Hotel Pleiada “Sala Atlas”",
    confirmPresence: "Confirmer la présence",
  },
};

export default function Home() {
  const { language } = usePreferredLanguage();
  const t = homeTranslations[language];
  const invitationLines = t.invitationText.split("|");

  return (
    <main className="min-h-screen bg-[#F5F0EA]">
      <section className="relative h-screen flex flex-col items-center justify-between text-center px-4 py-[env(safe-area-inset-top,0px)] overflow-x-clip">
        <div className="absolute inset-4 sm:inset-10 border-[1.5px] border-[#9B8557] lg:left-0 lg:right-0 lg:max-w-[960px] lg:mx-auto" />
        <div className="absolute inset-[20px] sm:inset-[46px] border-[1.5px] border-[#9B8557] lg:left-0 lg:right-0 lg:max-w-[948px] lg:mx-auto" />

        <div className="relative z-10 w-full max-w-2xl mx-auto px-4 flex flex-col items-center justify-evenly h-full py-10 sm:py-16">
          <p className="font-lato shiny-gold tracking-[0.35em] uppercase text-sm sm:text-sm">
            {t.date}
          </p>

          <h1 className="font-playfair shiny-gold text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.15em] leading-[1.05]">
            <span className="block">ALINA</span>
            <span className="font-greatvibes text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-normal block my-0.5 sm:my-2">&amp;</span>
            <span className="block">GABRIEL</span>
          </h1>

          <div className="space-y-3 sm:space-y-5">
            <div className="space-y-1.5 sm:space-y-4">
              <p className="font-lato text-[#4A4540] tracking-[0.2em] uppercase text-base sm:text-base">
                {t.togetherWithParents}
              </p>
              <div className="flex flex-row gap-8 sm:gap-16 justify-center">
                <div>
                  <p className="font-lato shiny-gold text-[16px] sm:text-base md:text-lg font-bold tracking-wide">Monica și Cătălin</p>
                  <p className="font-lato shiny-gold text-[16px] sm:text-base md:text-lg font-bold tracking-wide">Andronache</p>
                </div>
                <div>
                  <p className="font-lato shiny-gold text-[16px] sm:text-base md:text-lg font-bold tracking-wide">Angelica și Petru</p>
                  <p className="font-lato shiny-gold text-[16px] sm:text-base md:text-lg font-bold tracking-wide">Molocea</p>
                </div>
              </div>
            </div>

            <div>
              <p className="font-lato text-[#4A4540] tracking-[0.2em] uppercase text-base sm:text-base mb-0.5">
                {t.andGodparents}
              </p>
              <p className="font-lato shiny-gold text-[16px] sm:text-base md:text-lg font-bold tracking-wide">
                Diana și George Stamati
              </p>
            </div>
          </div>

          <p className="font-lato text-[#4A4540] text-base sm:text-base md:text-lg tracking-[0.15em] uppercase leading-relaxed max-w-md mx-auto">
            {invitationLines.map((line, index) => (
              <span key={`${language}-${index}`}>
                {line}
                {index < invitationLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>

          <div className="space-y-1 sm:space-y-2">
            <a href="https://www.google.com/maps/place/Saint+Stephen's+Church/@47.1728516,27.5713677,15.2z/data=!4m10!1m2!2m1!1sbiserica+sf+stefan+iasi!3m6!1s0x40cafb7df8d4a3ff:0x3dc42edce81504ce!8m2!3d47.1719789!4d27.5891902!15sChdiaXNlcmljYSBzZiBzdGVmYW4gaWFzaVoZIhdiaXNlcmljYSBzZiBzdGVmYW4gaWFzaZIBD29ydGhvZG94X2NodXJjaJoBJENoZERTVWhOTUc5blMwVkpRMEZuVFVSUmFYWlVObTFSUlJBQuABAPoBBAgAECI!16s%2Fg%2F1tj44dzr?entry=ttu&g_ep=EgoyMDI2MDMxNS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="block font-lato text-[#4A4540] text-base sm:text-base md:text-lg tracking-[0.1em] uppercase hover:text-[#9B8557] transition-colors">
              {t.ceremonyLabel} – <strong className="shiny-gold">12:30</strong>
            </a>
            <a href="https://www.google.com/maps/place/Pleiada+Boutique+Hotel+%26+Spa/@47.1348642,27.6049325,17z/data=!4m9!3m8!1s0x40cafbcf90a66b79:0x958842e2c5c99351!5m2!4m1!1i2!8m2!3d47.1348606!4d27.6075074!16s%2Fg%2F1q2w2jd2m?entry=ttu&g_ep=EgoyMDI2MDMxNS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="block font-lato text-[#4A4540] text-base sm:text-base md:text-lg tracking-[0.1em] uppercase hover:text-[#9B8557] transition-colors">
              {t.receptionLabel} – <strong className="shiny-gold">17:00</strong>
            </a>
          </div>

          <Link
            href="/rsvp"
            className="inline-block btn-shiny-gold font-lato tracking-[0.2em] uppercase text-sm sm:text-sm px-10 sm:px-14 py-3 sm:py-4 font-bold"
          >
            {t.confirmPresence}
          </Link>

          <span className="text-[#C4BDB3] text-xl sm:text-2xl">☘</span>
        </div>
      </section>
    </main>
  );
}
