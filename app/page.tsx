import Link from "next/link";
import CountdownTimer from "@/components/CountdownTimer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf7f2]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 py-20 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50 via-amber-50 to-[#faf7f2] opacity-80" />
        
        {/* Floral decorations */}
        <div className="absolute top-0 left-0 w-64 h-64 opacity-20 text-rose-300 text-9xl select-none pointer-events-none">❀</div>
        <div className="absolute top-0 right-0 w-64 h-64 opacity-20 text-rose-300 text-9xl select-none pointer-events-none flex items-start justify-end">❀</div>
        <div className="absolute bottom-10 left-10 opacity-15 text-green-400 text-8xl select-none pointer-events-none">✿</div>
        <div className="absolute bottom-10 right-10 opacity-15 text-green-400 text-8xl select-none pointer-events-none">✿</div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="font-lato text-[#b76e79] tracking-[0.3em] uppercase text-sm md:text-base mb-6">
            Vă invităm la nunta noastră
          </p>
          
          <div className="mb-4">
            <span className="text-[#b76e79] text-4xl">✦</span>
          </div>

          <h1 className="font-playfair text-6xl md:text-8xl lg:text-9xl text-[#3d2b1f] mb-4 leading-tight">
            Alina
            <span className="block text-[#b76e79] text-5xl md:text-6xl my-2">&amp;</span>
            Gabi
          </h1>

          <div className="flex items-center justify-center gap-4 my-8">
            <div className="h-px w-24 bg-[#b76e79] opacity-50" />
            <span className="text-[#b76e79] text-2xl">✦</span>
            <div className="h-px w-24 bg-[#b76e79] opacity-50" />
          </div>

          <p className="font-playfair text-xl md:text-2xl text-[#5c4033] italic mb-3">
            16 August 2025
          </p>
          <p className="font-lato text-[#87a878] tracking-widest uppercase text-sm">
            Bacău, România
          </p>

          <div className="mt-12">
            <CountdownTimer targetDate="2025-08-16T16:00:00" />
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/rsvp"
              className="inline-block bg-[#b76e79] text-white font-lato tracking-widest uppercase text-sm px-10 py-4 rounded-full hover:bg-[#a05c67] transition-colors duration-300 shadow-lg"
            >
              Confirmă Prezența
            </Link>
            <a
              href="#detalii"
              className="inline-block border border-[#b76e79] text-[#b76e79] font-lato tracking-widest uppercase text-sm px-10 py-4 rounded-full hover:bg-rose-50 transition-colors duration-300"
            >
              Detalii Eveniment
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#b76e79] opacity-60 animate-bounce">
          <span className="text-xs font-lato tracking-widest uppercase">Scroll</span>
          <span className="text-xl">↓</span>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-lato text-[#b76e79] tracking-[0.3em] uppercase text-sm mb-4">Povestea noastră</p>
          <h2 className="font-playfair text-4xl md:text-5xl text-[#3d2b1f] mb-6">Cum ne-am întâlnit</h2>
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px w-16 bg-[#87a878] opacity-50" />
            <span className="text-[#87a878] text-xl">✿</span>
            <div className="h-px w-16 bg-[#87a878] opacity-50" />
          </div>
          
          <p className="font-lato text-[#5c4033] text-lg leading-relaxed max-w-2xl mx-auto mb-8">
            Doi suflete care s-au găsit unul pe celălalt în mijlocul vieții de zi cu zi. 
            Cu zâmbete sincere, momente prețioase și dragoste care a crescut pas cu pas, 
            am ales să mergem împreună pe același drum al vieții.
          </p>
          <p className="font-lato text-[#5c4033] text-lg leading-relaxed max-w-2xl mx-auto">
            Acum, cu inima plină de bucurie, vă invităm să fiți alături de noi în ziua cea mai 
            specială din viața noastră – ziua în care devenim o familie.
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "💍", title: "Logodna", text: "Un moment magic care a pus bazele promisiunii noastre de viitor" },
              { icon: "💌", title: "Invitația", text: "Vă chemăm cu drag să fiți martori ai iubirii noastre" },
              { icon: "🥂", title: "Nunta", text: "16 August 2025 – ziua în care povestea noastră capătă un nou capitol" },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-rose-50">
                <span className="text-4xl">{item.icon}</span>
                <h3 className="font-playfair text-xl text-[#3d2b1f]">{item.title}</h3>
                <p className="font-lato text-[#5c4033] text-sm text-center leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Details Section */}
      <section id="detalii" className="py-24 px-4 bg-[#faf7f2]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-lato text-[#b76e79] tracking-[0.3em] uppercase text-sm mb-4">Programul zilei</p>
            <h2 className="font-playfair text-4xl md:text-5xl text-[#3d2b1f] mb-6">Detalii Eveniment</h2>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-[#b76e79] opacity-50" />
              <span className="text-[#b76e79] text-xl">✦</span>
              <div className="h-px w-16 bg-[#b76e79] opacity-50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Church */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-rose-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">⛪</span>
              </div>
              <p className="font-lato text-[#b76e79] tracking-widest uppercase text-xs mb-3">Cununia Religioasă</p>
              <h3 className="font-playfair text-2xl text-[#3d2b1f] mb-4">Catedrala Sf. Nicolae</h3>
              <div className="h-px w-12 bg-rose-200 mb-4" />
              <p className="font-lato text-[#5c4033] text-sm mb-2">📍 Bacău, România</p>
              <p className="font-lato text-[#5c4033] text-sm mb-2">📅 16 August 2025</p>
              <p className="font-lato text-[#5c4033] text-sm mb-6">🕓 Ora 16:00</p>
              <p className="font-lato text-[#87a878] text-sm italic">
                Vă așteptăm să fiți alături de noi în momentul binecuvântării căsătoriei noastre.
              </p>
            </div>

            {/* Party */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-green-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">🌿</span>
              </div>
              <p className="font-lato text-[#87a878] tracking-widest uppercase text-xs mb-3">Petrecerea</p>
              <h3 className="font-playfair text-2xl text-[#3d2b1f] mb-4">Grădina Eden</h3>
              <div className="h-px w-12 bg-green-200 mb-4" />
              <p className="font-lato text-[#5c4033] text-sm mb-2">📍 Bacău, România</p>
              <p className="font-lato text-[#5c4033] text-sm mb-2">📅 16 August 2025</p>
              <p className="font-lato text-[#5c4033] text-sm mb-6">🕗 Ora 19:00</p>
              <p className="font-lato text-[#87a878] text-sm italic">
                Vă invităm la o seară plină de bucurie, muzică și dans alături de cei dragi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-rose-100 via-amber-50 to-green-50">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-lato text-[#b76e79] tracking-[0.3em] uppercase text-sm mb-4">Confirmarea prezenței</p>
          <h2 className="font-playfair text-4xl md:text-5xl text-[#3d2b1f] mb-6">
            Ne bucurăm să vă avem alături
          </h2>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-[#b76e79] opacity-50" />
            <span className="text-[#b76e79] text-xl">✦</span>
            <div className="h-px w-16 bg-[#b76e79] opacity-50" />
          </div>
          <p className="font-lato text-[#5c4033] text-lg leading-relaxed mb-10">
            Vă rugăm să confirmați prezența până pe <strong>1 August 2025</strong>. 
            Prezența voastră este cel mai frumos cadou pentru noi.
          </p>
          <Link
            href="/rsvp"
            className="inline-block bg-[#b76e79] text-white font-lato tracking-widest uppercase text-sm px-12 py-5 rounded-full hover:bg-[#a05c67] transition-colors duration-300 shadow-lg"
          >
            Confirmă Prezența
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#3d2b1f] text-center">
        <p className="font-playfair text-[#b76e79] text-2xl mb-2">Alina &amp; Gabi</p>
        <p className="font-lato text-amber-200 text-sm opacity-70">16 August 2025 · Bacău, România</p>
        <div className="mt-4 text-amber-200 opacity-40 text-sm font-lato">
          <span>❀</span>
        </div>
      </footer>
    </main>
  );
}
