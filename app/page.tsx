import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#761124]">
      {/* Hero Section */}
      <section className="relative py-8 sm:py-16 flex flex-col items-center justify-center text-center px-4 overflow-x-clip">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-[#761124]" />
        
        {/* Gold corner ornaments */}
        <div className="absolute top-4 left-4 w-16 h-16 sm:w-24 sm:h-24 border-t-2 border-l-2 border-[#D4A843] opacity-40 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-16 h-16 sm:w-24 sm:h-24 border-t-2 border-r-2 border-[#D4A843] opacity-40 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-16 h-16 sm:w-24 sm:h-24 border-b-2 border-l-2 border-[#D4A843] opacity-40 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-16 h-16 sm:w-24 sm:h-24 border-b-2 border-r-2 border-[#D4A843] opacity-40 rounded-br-lg" />

        <div className="relative z-10 max-w-5xl mx-auto px-4">
          <p className="font-lato text-[#D4A843] tracking-[0.3em] uppercase text-xs sm:text-sm md:text-base mb-2">
            26 Iulie 2026
          </p>
          
          <div className="mb-1 sm:mb-2">
            <span className="text-[#D4A843] text-2xl sm:text-3xl">☘</span>
          </div>

          <h1 className="font-greatvibes shiny-gold text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] py-2 sm:py-4 px-6 sm:px-10 leading-[1.1]">
            <span className="block sm:hidden">Alina</span>
            <span className="block sm:hidden shiny-gold text-5xl">&amp;</span>
            <span className="block sm:hidden">Gabriel</span>
            <span className="hidden sm:inline whitespace-nowrap">Alina <span className="shiny-gold text-6xl md:text-7xl lg:text-8xl align-middle">&amp;</span> Gabriel</span>
          </h1>

          <div className="flex items-center justify-center gap-3 my-3 sm:my-5">
            <div className="h-px w-16 sm:w-24 bg-[#D4A843] opacity-50" />
            <span className="text-[#D4A843] text-xl sm:text-2xl">✦</span>
            <div className="h-px w-16 sm:w-24 bg-[#D4A843] opacity-50" />
          </div>

          <p className="font-lato text-[#F5E6D3] tracking-widest uppercase text-xs sm:text-sm mb-1">
            Împreună cu părinții
          </p>
          <div className="flex flex-row gap-6 sm:gap-8 justify-center mt-1.5 mb-3 sm:mb-4">
            <div>
              <p className="font-lato text-[#F0D78C] text-xs sm:text-sm font-bold">Monica și Cătălin</p>
              <p className="font-lato text-[#F0D78C] text-xs sm:text-sm font-bold">Andronache</p>
            </div>
            <div>
              <p className="font-lato text-[#F0D78C] text-xs sm:text-sm font-bold">Angelica și Petru</p>
              <p className="font-lato text-[#F0D78C] text-xs sm:text-sm font-bold">Molocea</p>
            </div>
          </div>

          <p className="font-lato text-[#F5E6D3] tracking-widest uppercase text-xs sm:text-sm mb-0.5">
            Și nașii,
          </p>
          <p className="font-lato text-[#F0D78C] text-xs sm:text-sm font-bold mb-3 sm:mb-4">
            Diana și George Stamati
          </p>

          <p className="font-playfair text-[#F5E6D3] text-sm sm:text-lg md:text-xl italic leading-snug max-w-md mx-auto mb-1">
            Vă așteptăm cu mare drag la acest moment important din viața noastră.
          </p>

          {/* Event Details - inline */}
          <div className="flex items-center justify-center gap-3 mt-4 sm:mt-6 mb-1">
            <div className="h-px w-10 bg-[#D4A843] opacity-40" />
            <span className="text-[#D4A843] text-sm sm:text-lg">✦</span>
            <div className="h-px w-10 bg-[#D4A843] opacity-40" />
          </div>

          <div className="space-y-1 my-3 sm:my-4">
            <p className="font-playfair text-[#F5E6D3] text-sm sm:text-lg md:text-xl tracking-wide">
              Biserica „Sf. Sava" – 12:30
            </p>
            <p className="font-playfair text-[#F5E6D3] text-sm sm:text-lg md:text-xl tracking-wide">
              Hotel Pleiada &quot;Sala Atlas&quot; – 16:00
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-5 sm:mb-6">
            <div className="h-px w-10 bg-[#D4A843] opacity-40" />
            <span className="text-[#D4A843] text-sm sm:text-lg">✦</span>
            <div className="h-px w-10 bg-[#D4A843] opacity-40" />
          </div>

          <Link
            href="/rsvp"
            className="inline-block bg-[#D4A843] text-[#4A0B18] font-lato tracking-widest uppercase text-xs sm:text-sm px-8 sm:px-10 py-3 sm:py-4 rounded-full hover:bg-[#F0D78C] transition-colors duration-300 shadow-lg font-bold"
          >
            Confirmă Prezența
          </Link>
        </div>

      </section>

      {/* RSVP CTA Section */}
      <section className="py-24 px-4 bg-[#761124]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-lato text-[#D4A843] tracking-[0.3em] uppercase text-sm mb-4">Confirmarea prezenței</p>
          <h2 className="font-playfair shiny-gold text-4xl md:text-5xl mb-6">
            Ne bucurăm să vă avem alături
          </h2>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-[#D4A843] opacity-50" />
            <span className="text-[#D4A843] text-xl">✦</span>
            <div className="h-px w-16 bg-[#D4A843] opacity-50" />
          </div>
          <p className="font-lato text-[#F5E6D3] text-lg leading-relaxed mb-10">
            Vă rugăm să confirmați prezența până pe <strong className="text-[#F0D78C]">26 Iunie 2026</strong>. 
            Prezența voastră este cel mai frumos cadou pentru noi.
          </p>
          <Link
            href="/rsvp"
            className="inline-block bg-[#D4A843] text-[#4A0B18] font-lato tracking-widest uppercase text-sm px-12 py-5 rounded-full hover:bg-[#F0D78C] transition-colors duration-300 shadow-lg font-bold"
          >
            Confirmă Prezența
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#761124] text-center border-t border-[#D4A843] border-opacity-20">
        <p className="font-greatvibes shiny-gold text-3xl mb-2">Alina &amp; Gabriel</p>
        <p className="font-lato text-[#D4A843] text-sm opacity-70">26 Iulie 2026 · Iași, România</p>
        <div className="mt-4 text-[#D4A843] opacity-40 text-sm font-lato">
          <span>❧</span>
        </div>
      </footer>
    </main>
  );
}
