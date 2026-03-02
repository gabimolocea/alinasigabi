import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F5F0EA]">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-between text-center px-4 py-[env(safe-area-inset-top,0px)] overflow-x-clip">
        {/* Double border frame */}
        <div className="absolute inset-4 sm:inset-10 border-[1.5px] border-[#9B8557] lg:left-0 lg:right-0 lg:max-w-[960px] lg:mx-auto" />
        <div className="absolute inset-[20px] sm:inset-[46px] border-[1.5px] border-[#9B8557] lg:left-0 lg:right-0 lg:max-w-[948px] lg:mx-auto" />

        <div className="relative z-10 max-w-2xl mx-auto px-4 flex flex-col items-center justify-evenly h-full py-10 sm:py-16">
          <p className="font-lato shiny-gold tracking-[0.35em] uppercase text-sm sm:text-sm">
            26 Iulie 2026
          </p>

          <h1 className="font-playfair shiny-gold text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.15em] leading-[1.05]">
            <span className="block">ALINA</span>
            <span className="font-greatvibes text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-normal block my-0.5 sm:my-2">&amp;</span>
            <span className="block">GABRIEL</span>
          </h1>

          <div className="space-y-3 sm:space-y-5">
            <div className="space-y-1.5 sm:space-y-4">
              <p className="font-lato text-[#4A4540] tracking-[0.2em] uppercase text-base sm:text-base">
                Împreună cu părinții,
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
                Și nașii,
              </p>
              <p className="font-lato shiny-gold text-[16px] sm:text-base md:text-lg font-bold tracking-wide">
                Diana și George Stamati
              </p>
            </div>
          </div>

          <p className="font-lato text-[#4A4540] text-base sm:text-base md:text-lg tracking-[0.15em] uppercase leading-relaxed max-w-md mx-auto">
            Vă așteptăm cu mare drag<br />
            la acest moment important<br />
            din viața noastră.
          </p>

          {/* Event Details */}
          <div className="space-y-1 sm:space-y-2">
            <a href="https://maps.app.goo.gl/QHfQv6YJXnMKxjbX8" target="_blank" rel="noopener noreferrer" className="block font-lato text-[#4A4540] text-base sm:text-base md:text-lg tracking-[0.1em] uppercase hover:text-[#9B8557] transition-colors">
              Biserica &ldquo;Sf. Ștefan&rdquo; – <strong className="shiny-gold">12:30</strong>
            </a>
            <a href="https://maps.app.goo.gl/YQb3kN2VVvJn8NYUA" target="_blank" rel="noopener noreferrer" className="block font-lato text-[#4A4540] text-base sm:text-base md:text-lg tracking-[0.1em] uppercase hover:text-[#9B8557] transition-colors">
              Hotel Pleiada &ldquo;Sala Atlas&rdquo; – <strong className="shiny-gold">17:00</strong>
            </a>
          </div>

          <Link
            href="/rsvp"
            className="inline-block btn-shiny-gold font-lato tracking-[0.2em] uppercase text-sm sm:text-sm px-10 sm:px-14 py-3 sm:py-4 font-bold"
          >
            Confirmă prezența
          </Link>

          {/* Small clover ornament */}
          <span className="text-[#C4BDB3] text-xl sm:text-2xl">☘</span>
        </div>

      </section>
    </main>
  );
}
