"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type MenuPref = "normal" | "vegetarian" | "vegan";

interface FormData {
  name: string;
  attending: string;
  num_persons: number;
  menu_preferences: MenuPref[];
  need_accommodation: boolean;
  attending_church: boolean;
  attending_party: boolean;
  phone: string;
  message: string;
}

const menuLabels: Record<MenuPref, string> = {
  normal: "Normal",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
};

export default function RSVPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#3D0F1E] via-[#6B1024] to-[#2D0710] flex items-center justify-center">
        <p className="font-lato text-[#D4A843]">Se încarcă...</p>
      </div>
    }>
      <RSVPContent />
    </Suspense>
  );
}

function RSVPContent() {
  const searchParams = useSearchParams();

  // Invitation code step
  const [invitationCode, setInvitationCode] = useState("");
  const [codeValidated, setCodeValidated] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState("");

  const [form, setForm] = useState<FormData>({
    name: "",
    attending: "yes",
    num_persons: 1,
    menu_preferences: ["normal"],
    need_accommodation: false,
    attending_church: true,
    attending_party: true,
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-fill code from URL param (for QR code scanning)
  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam && !codeValidated && !invitationCode) {
      setInvitationCode(codeParam.toUpperCase());
      // Auto-validate
      (async () => {
        setCodeLoading(true);
        setCodeError("");
        try {
          const res = await fetch("/api/rsvp/validate-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: codeParam.trim().toUpperCase() }),
          });
          const data = await res.json();
          if (res.ok && data.valid) {
            if (data.guest_name) {
              setForm((f) => ({ ...f, name: data.guest_name }));
            }
            setCodeValidated(true);
          } else {
            setCodeError(data.error || "Cod invalid.");
          }
        } catch {
          setCodeError("Eroare de conexiune. Încercați din nou.");
        } finally {
          setCodeLoading(false);
        }
      })();
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  async function validateCode(e: React.FormEvent) {
    e.preventDefault();
    setCodeLoading(true);
    setCodeError("");
    try {
      const res = await fetch("/api/rsvp/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: invitationCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCodeError(data.error || "Cod invalid.");
        return;
      }
      if (data.guest_name) {
        setForm((f) => ({ ...f, name: data.guest_name }));
      }
      setCodeValidated(true);
    } catch {
      setCodeError("Eroare de conexiune. Încercați din nou.");
    } finally {
      setCodeLoading(false);
    }
  }

  function handleNumPersons(n: number) {
    const clamped = Math.max(1, Math.min(20, n));
    const prefs = [...form.menu_preferences];
    while (prefs.length < clamped) prefs.push("normal");
    setForm((f) => ({ ...f, num_persons: clamped, menu_preferences: prefs.slice(0, clamped) }));
  }

  function handleMenuPref(idx: number, val: MenuPref) {
    const prefs = [...form.menu_preferences];
    prefs[idx] = val;
    setForm((f) => ({ ...f, menu_preferences: prefs }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          attending: form.attending === "yes" ? 1 : 0,
          need_accommodation: form.need_accommodation ? 1 : 0,
          attending_church: form.attending_church ? 1 : 0,
          attending_party: form.attending_party ? 1 : 0,
          menu_preferences: JSON.stringify(form.menu_preferences),
          invitation_code: invitationCode.trim().toUpperCase(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Eroare la trimiterea formularului.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "A apărut o eroare. Vă rugăm încercați din nou.");
    } finally {
      setLoading(false);
    }
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#3D0F1E] via-[#6B1024] to-[#2D0710] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#4A0B18] bg-opacity-80 rounded-3xl shadow-lg p-10 text-center gold-border">
          <div className="text-5xl mb-6">☘</div>
          <h2 className="font-playfair shiny-gold text-3xl mb-4">Mulțumim!</h2>
          <p className="font-lato text-[#F5E6D3] text-base leading-relaxed mb-8">
            Răspunsul vostru a fost înregistrat cu succes. Ne bucurăm să vă avem alături în ziua noastră specială!
          </p>
          <Link
            href="/"
            className="inline-block bg-[#D4A843] text-[#4A0B18] font-lato tracking-widest uppercase text-sm px-8 py-3 rounded-full hover:bg-[#F0D78C] transition-colors font-bold"
          >
            Înapoi acasă
          </Link>
        </div>
      </div>
    );
  }

  // Code validation step
  if (!codeValidated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#3D0F1E] via-[#6B1024] to-[#2D0710] flex items-center justify-center px-4">
        {/* Gold corner ornaments */}
        <div className="fixed top-6 left-6 w-20 h-20 border-t-2 border-l-2 border-[#D4A843] opacity-30 rounded-tl-lg" />
        <div className="fixed top-6 right-6 w-20 h-20 border-t-2 border-r-2 border-[#D4A843] opacity-30 rounded-tr-lg" />
        <div className="fixed bottom-6 left-6 w-20 h-20 border-b-2 border-l-2 border-[#D4A843] opacity-30 rounded-bl-lg" />
        <div className="fixed bottom-6 right-6 w-20 h-20 border-b-2 border-r-2 border-[#D4A843] opacity-30 rounded-br-lg" />

        <div className="max-w-md w-full text-center">
          <Link href="/" className="font-lato text-[#D4A843] text-sm tracking-widest uppercase hover:text-[#F0D78C] transition-colors">
            ← Înapoi
          </Link>

          <div className="mt-8 mb-6">
            <span className="text-[#D4A843] text-3xl">☘</span>
          </div>

          <h1 className="font-greatvibes shiny-gold text-5xl md:text-6xl mb-3">Confirmare Prezență</h1>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-[#D4A843] opacity-50" />
            <span className="text-[#D4A843] text-xl">✦</span>
            <div className="h-px w-16 bg-[#D4A843] opacity-50" />
          </div>

          <p className="font-lato text-[#F5E6D3] text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Introduceți codul de pe invitația dumneavoastră pentru a confirma prezența.
          </p>

          <form onSubmit={validateCode} className="bg-[#4A0B18] bg-opacity-60 rounded-3xl p-8 gold-border">
            <label className="block font-lato text-[#D4A843] text-xs font-bold mb-3 tracking-widest uppercase">
              Cod Invitație
            </label>
            <input
              type="text"
              required
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
              placeholder="Introduceți codul"
              className="w-full bg-[#2D0710] border border-[#D4A843] border-opacity-40 rounded-xl px-4 py-3 font-lato text-[#F5E6D3] placeholder-[#F5E6D3] placeholder-opacity-30 focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent transition text-center text-lg tracking-widest uppercase"
            />
            
            {codeError && (
              <p className="font-lato text-red-400 text-sm mt-3">{codeError}</p>
            )}

            <button
              type="submit"
              disabled={codeLoading}
              className="mt-6 w-full bg-[#D4A843] text-[#4A0B18] font-lato tracking-widest uppercase text-sm py-4 rounded-full hover:bg-[#F0D78C] transition-colors duration-300 shadow-lg font-bold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {codeLoading ? "Se verifică..." : "Verifică Codul"}
            </button>
          </form>

          <p className="font-lato text-[#F5E6D3] text-xs mt-6 opacity-50">
            Confirmarea prezenței până la 26 Iunie 2026
          </p>
        </div>
      </div>
    );
  }

  // Main RSVP form
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3D0F1E] via-[#6B1024] to-[#2D0710] py-12 px-4">
      {/* Gold corner ornaments */}
      <div className="fixed top-6 left-6 w-20 h-20 border-t-2 border-l-2 border-[#D4A843] opacity-30 rounded-tl-lg" />
      <div className="fixed top-6 right-6 w-20 h-20 border-t-2 border-r-2 border-[#D4A843] opacity-30 rounded-tr-lg" />
      <div className="fixed bottom-6 left-6 w-20 h-20 border-b-2 border-l-2 border-[#D4A843] opacity-30 rounded-bl-lg" />
      <div className="fixed bottom-6 right-6 w-20 h-20 border-b-2 border-r-2 border-[#D4A843] opacity-30 rounded-br-lg" />

      {/* Header */}
      <div className="text-center mb-10">
        <Link href="/" className="font-lato text-[#D4A843] text-sm tracking-widest uppercase hover:text-[#F0D78C] transition-colors">
          ← Înapoi
        </Link>
        <div className="mt-6 mb-3">
          <span className="text-[#D4A843] text-2xl">☘</span>
        </div>
        <h1 className="font-greatvibes shiny-gold text-4xl md:text-5xl mb-3">Confirmare Prezență</h1>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-16 bg-[#D4A843] opacity-50" />
          <span className="text-[#D4A843] text-xl">✦</span>
          <div className="h-px w-16 bg-[#D4A843] opacity-50" />
        </div>
        <p className="font-lato text-[#F5E6D3] max-w-md mx-auto text-sm leading-relaxed opacity-80">
          Vă rugăm să completați formularul de mai jos până pe <strong className="text-[#F0D78C]">26 Iunie 2026</strong>.
        </p>
        <p className="font-lato text-[#D4A843] text-xs mt-2 tracking-widest">
          COD: {invitationCode.trim().toUpperCase()}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-[#4A0B18] bg-opacity-60 rounded-3xl shadow-lg p-8 md:p-12 gold-border">
        {/* Name */}
        <div className="mb-6">
          <label className="block font-lato text-[#D4A843] text-xs font-bold mb-2 tracking-widest uppercase">
            Numele dvs. *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Prenume Nume"
            className="w-full bg-[#2D0710] border border-[#D4A843] border-opacity-30 rounded-xl px-4 py-3 font-lato text-[#F5E6D3] placeholder-[#F5E6D3] placeholder-opacity-30 focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent transition"
          />
        </div>

        {/* Attending */}
        <div className="mb-6">
          <label className="block font-lato text-[#D4A843] text-xs font-bold mb-3 tracking-widest uppercase">
            Veți participa? *
          </label>
          <div className="flex gap-6">
            {[
              { val: "yes", label: "Da, voi fi prezent(ă)" },
              { val: "no", label: "Nu pot participa" },
            ].map(({ val, label }) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer font-lato text-[#F5E6D3] text-sm">
                <input
                  type="radio"
                  name="attending"
                  value={val}
                  checked={form.attending === val}
                  onChange={() => setForm((f) => ({ ...f, attending: val }))}
                  className="accent-[#D4A843] w-4 h-4"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {form.attending === "yes" && (
          <>
            {/* Num persons */}
            <div className="mb-6">
              <label className="block font-lato text-[#D4A843] text-xs font-bold mb-2 tracking-widest uppercase">
                Număr de persoane *
              </label>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={form.num_persons}
                onChange={(e) => handleNumPersons(parseInt(e.target.value) || 1)}
                className="w-32 bg-[#2D0710] border border-[#D4A843] border-opacity-30 rounded-xl px-4 py-3 font-lato text-[#F5E6D3] focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent transition"
              />
            </div>

            {/* Menu preferences */}
            <div className="mb-6">
              <label className="block font-lato text-[#D4A843] text-xs font-bold mb-3 tracking-widest uppercase">
                Preferințe meniu *
              </label>
              <div className="space-y-3">
                {Array.from({ length: form.num_persons }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-[#2D0710] bg-opacity-60 rounded-xl px-4 py-3">
                    <span className="font-lato text-[#F0D78C] text-sm min-w-[80px]">
                      Persoana {idx + 1}:
                    </span>
                    <div className="flex gap-4 flex-wrap">
                      {(["normal", "vegetarian", "vegan"] as MenuPref[]).map((opt) => (
                        <label key={opt} className="flex items-center gap-1.5 cursor-pointer font-lato text-[#F5E6D3] text-sm">
                          <input
                            type="radio"
                            name={`menu_${idx}`}
                            value={opt}
                            checked={form.menu_preferences[idx] === opt}
                            onChange={() => handleMenuPref(idx, opt)}
                            className="accent-[#D4A843] w-3.5 h-3.5"
                          />
                          {menuLabels[opt]}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Church */}
            <div className="mb-6">
              <label className="block font-lato text-[#D4A843] text-xs font-bold mb-3 tracking-widest uppercase">
                Participați la cununia religioasă?
              </label>
              <div className="flex gap-6">
                {[true, false].map((val) => (
                  <label key={String(val)} className="flex items-center gap-2 cursor-pointer font-lato text-[#F5E6D3] text-sm">
                    <input
                      type="radio"
                      name="attending_church"
                      checked={form.attending_church === val}
                      onChange={() => setForm((f) => ({ ...f, attending_church: val }))}
                      className="accent-[#D4A843] w-4 h-4"
                    />
                    {val ? "Da" : "Nu"}
                  </label>
                ))}
              </div>
              <p className="font-lato text-[#F5E6D3] opacity-40 text-xs mt-1">Biserica „Sf. Sava", ora 12:30</p>
            </div>

            {/* Party */}
            <div className="mb-6">
              <label className="block font-lato text-[#D4A843] text-xs font-bold mb-3 tracking-widest uppercase">
                Participați la petrecere?
              </label>
              <div className="flex gap-6">
                {[true, false].map((val) => (
                  <label key={String(val)} className="flex items-center gap-2 cursor-pointer font-lato text-[#F5E6D3] text-sm">
                    <input
                      type="radio"
                      name="attending_party"
                      checked={form.attending_party === val}
                      onChange={() => setForm((f) => ({ ...f, attending_party: val }))}
                      className="accent-[#D4A843] w-4 h-4"
                    />
                    {val ? "Da" : "Nu"}
                  </label>
                ))}
              </div>
              <p className="font-lato text-[#F5E6D3] opacity-40 text-xs mt-1">Hotel Pleiada &quot;Sala Atlas&quot;, ora 16:00</p>
            </div>

            {/* Accommodation */}
            <div className="mb-6">
              <label className="block font-lato text-[#D4A843] text-xs font-bold mb-3 tracking-widest uppercase">
                Aveți nevoie de cazare?
              </label>
              <div className="flex gap-6">
                {[true, false].map((val) => (
                  <label key={String(val)} className="flex items-center gap-2 cursor-pointer font-lato text-[#F5E6D3] text-sm">
                    <input
                      type="radio"
                      name="need_accommodation"
                      checked={form.need_accommodation === val}
                      onChange={() => setForm((f) => ({ ...f, need_accommodation: val }))}
                      className="accent-[#D4A843] w-4 h-4"
                    />
                    {val ? "Da" : "Nu"}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Phone */}
        <div className="mb-6">
          <label className="block font-lato text-[#D4A843] text-xs font-bold mb-2 tracking-widest uppercase">
            Număr de telefon (opțional)
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="07xx xxx xxx"
            className="w-full bg-[#2D0710] border border-[#D4A843] border-opacity-30 rounded-xl px-4 py-3 font-lato text-[#F5E6D3] placeholder-[#F5E6D3] placeholder-opacity-30 focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent transition"
          />
        </div>

        {/* Message */}
        <div className="mb-8">
          <label className="block font-lato text-[#D4A843] text-xs font-bold mb-2 tracking-widest uppercase">
            Mesaj pentru miri (opțional)
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Un gând frumos pentru Alina și Gabriel..."
            rows={4}
            className="w-full bg-[#2D0710] border border-[#D4A843] border-opacity-30 rounded-xl px-4 py-3 font-lato text-[#F5E6D3] placeholder-[#F5E6D3] placeholder-opacity-30 focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent transition resize-none"
          />
        </div>

        {error && (
          <p className="font-lato text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#D4A843] text-[#4A0B18] font-lato tracking-widest uppercase text-sm py-4 rounded-full hover:bg-[#F0D78C] transition-colors duration-300 shadow-lg font-bold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Se trimite..." : "Trimite Confirmarea"}
        </button>
      </form>

      <div className="text-center mt-8">
        <p className="font-greatvibes text-[#D4A843] text-2xl opacity-70">
          Alina &amp; Gabriel ☘
        </p>
      </div>
    </div>
  );
}
