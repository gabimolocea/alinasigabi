"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";

type MenuPref = "normal" | "vegetarian-cu-peste" | "vegetarian-fara-peste" | "vegan" | "copii";

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

interface GuestMatch {
  id: number;
  guest_name: string;
  max_persons: number;
}

const menuLabels: Record<MenuPref, string> = {
  normal: "Normal",
  "vegetarian-cu-peste": "Vegetarian cu pește",
  "vegetarian-fara-peste": "Vegetarian fără pește",
  vegan: "Vegan",
  copii: "Meniu copii",
};

export default function RSVPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F0EA] flex items-center justify-center">
        <p className="font-lato text-[#9B8557]">Se încarcă...</p>
      </div>
    }>
      <RSVPContent />
    </Suspense>
  );
}

function RSVPContent() {
  // Guest search step
  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState<GuestMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<GuestMatch | null>(null);
  const [guestConfirmed, setGuestConfirmed] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Debounced fuzzy search
  useEffect(() => {
    if (searchName.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      setSearchError("");
      try {
        const res = await fetch("/api/rsvp/find-guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: searchName.trim() }),
        });
        const data = await res.json();
        setSearchResults(data.guests || []);
      } catch {
        setSearchError("Eroare de conexiune.");
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchName]);

  function selectGuest(guest: GuestMatch) {
    setSelectedGuest(guest);
    setForm((f) => ({ ...f, name: guest.guest_name }));
    setGuestConfirmed(true);
    setSearchResults([]);
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
          guest_id: selectedGuest?.id || null,
          original_name: selectedGuest?.guest_name || null,
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
      <div className="min-h-screen bg-[#F5F0EA] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-sm shadow-sm p-10 text-center gold-border-double">
          <div className="text-4xl mb-6 text-[#C4BDB3]">☘</div>
          <h2 className="font-playfair text-3xl mb-4 shiny-gold">Mulțumim!</h2>
          <p className="font-lato text-[#4A4540] text-base leading-relaxed mb-8">
            {form.attending === "no"
              ? "Ne bucurăm că sunteți cu sufletul alături de noi în ziua noastră specială!"
              : "Ne bucurăm să vă avem alături în ziua noastră specială!"}
          </p>
          <Link
            href="/"
            className="inline-block btn-shiny-gold font-lato tracking-[0.2em] uppercase text-sm px-8 py-3 font-bold"
          >
            Înapoi acasă
          </Link>
        </div>
      </div>
    );
  }

  // Name search step
  if (!guestConfirmed) {
    return (
      <div className="min-h-screen bg-[#F5F0EA] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <Link href="/" className="font-lato text-[#9B8557] text-sm tracking-[0.2em] uppercase hover:text-[#7A6B42] transition-colors">
            ← Înapoi
          </Link>

          <div className="mt-8 mb-6">
            <span className="text-[#C4BDB3] text-3xl">☘</span>
          </div>

          <h1 className="font-playfair text-4xl md:text-5xl tracking-wide mb-3 shiny-gold">Confirmă prezența</h1>

          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-[#9B8557] opacity-40" />
            <span className="text-[#C4BDB3] text-lg">☘</span>
            <div className="h-px w-16 bg-[#9B8557] opacity-40" />
          </div>

          <p className="font-lato text-[#4A4540] text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Introduceți numele dumneavoastră pentru a vă identifica pe lista de invitați.
          </p>

          <div className="bg-white rounded-sm p-8 gold-border">
            <label className="block font-lato text-[#9B8557] text-xs font-bold mb-3 tracking-[0.2em] uppercase">
              Prenume și Nume
            </label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
                setSelectedGuest(null);
              }}
              placeholder="ex: Gabriel Molocea sau Familia Molocea"
              autoFocus
              className="w-full bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-3 font-lato text-[#4A4540] placeholder-[#7A7268] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#9B8557] focus:border-transparent transition text-center text-lg"
            />

            {searching && (
              <p className="font-lato text-[#9B8557] text-sm mt-4 opacity-60">Se caută...</p>
            )}

            {!searching && searchResults.length > 0 && (
              <div className="mt-6 text-center">
                <div className="bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-5">
                  <p className="font-lato text-[#7A7268] text-xs mb-2">Am găsit invitația pentru:</p>
                  <p className="font-playfair text-[#9B8557] text-xl mb-4">{searchResults[0].guest_name}</p>
                  <button
                    onClick={() => selectGuest(searchResults[0])}
                    className="btn-shiny-gold font-lato tracking-[0.2em] uppercase text-sm px-8 py-2.5 font-bold rounded-sm"
                  >
                    Confirmă identitatea
                  </button>
                </div>
              </div>
            )}

            {!searching && searchName.trim().length >= 2 && searchResults.length === 0 && (
              <p className="font-lato text-[#7A7268] text-sm mt-4">
                Nu am găsit niciun invitat cu acest nume. Verificați ortografia sau contactați mirii.
              </p>
            )}

            {searchError && (
              <p className="font-lato text-red-600 text-sm mt-3">{searchError}</p>
            )}
          </div>

          <p className="font-lato text-[#7A7268] text-xs mt-6">
            Confirmarea prezenței până la 26 Iunie 2026
          </p>
        </div>
      </div>
    );
  }

  // Main RSVP form
  return (
    <div className="min-h-screen bg-[#F5F0EA] py-12 px-4">
      <div className="text-center mb-10">
        <Link href="/" className="font-lato text-[#9B8557] text-sm tracking-[0.2em] uppercase hover:text-[#7A6B42] transition-colors">
          ← Înapoi
        </Link>
        <div className="mt-6 mb-3">
          <span className="text-[#C4BDB3] text-2xl">☘</span>
        </div>
        <h1 className="font-playfair text-3xl md:text-4xl tracking-wide mb-3 shiny-gold">Confirmă prezența</h1>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-16 bg-[#9B8557] opacity-40" />
          <span className="text-[#C4BDB3] text-lg">☘</span>
          <div className="h-px w-16 bg-[#9B8557] opacity-40" />
        </div>
        <p className="font-lato text-[#4A4540] max-w-md mx-auto text-sm leading-relaxed">
          Bun venit, <strong className="text-[#9B8557]">{selectedGuest?.guest_name}</strong>! Completează formularul de mai jos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-sm shadow-sm p-8 md:p-12 gold-border">
        {/* Name */}
        <div className="mb-6">
          <label className="block font-lato text-[#9B8557] text-xs font-bold mb-2 tracking-[0.2em] uppercase">
            Numele Dvs. / Nume Familie *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="ex: Gabriel Molocea sau Familia Molocea"
            className="w-full bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-3 font-lato text-[#4A4540] placeholder-[#7A7268] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#9B8557] focus:border-transparent transition"
          />
        </div>

        {/* Phone */}
        <div className="mb-6">
          <label className="block font-lato text-[#9B8557] text-xs font-bold mb-2 tracking-[0.2em] uppercase">
            Număr de telefon *
          </label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="07xx xxx xxx"
            className="w-full bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-3 font-lato text-[#4A4540] placeholder-[#7A7268] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#9B8557] focus:border-transparent transition"
          />
        </div>

        {/* Attending */}
        <div className="mb-6">
          <label className="block font-lato text-[#9B8557] text-xs font-bold mb-3 tracking-[0.2em] uppercase">
            Veți participa? *
          </label>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer font-lato text-[#4A4540] text-sm">
              <input
                type="checkbox"
                checked={form.attending_church}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setForm((f) => ({
                    ...f,
                    attending_church: checked,
                    attending: checked || f.attending_party ? "yes" : "no",
                  }));
                }}
                className="accent-[#9B8557] w-4 h-4"
              />
              Da, voi fi prezent(ă) la cununia religioasă
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-lato text-[#4A4540] text-sm">
              <input
                type="checkbox"
                checked={form.attending_party}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setForm((f) => ({
                    ...f,
                    attending_party: checked,
                    attending: f.attending_church || checked ? "yes" : "no",
                  }));
                }}
                className="accent-[#9B8557] w-4 h-4"
              />
              Da, voi fi prezent(ă) la petrecere
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-lato text-[#4A4540] text-sm">
              <input
                type="checkbox"
                checked={form.attending === "no"}
                onChange={(e) => {
                  if (e.target.checked) {
                    setForm((f) => ({
                      ...f,
                      attending: "no",
                      attending_church: false,
                      attending_party: false,
                      need_accommodation: false,
                    }));
                  }
                }}
                className="accent-[#9B8557] w-4 h-4"
              />
              Nu pot participa
            </label>
            {form.attending === "yes" && (
              <label className="flex items-center gap-2 cursor-pointer font-lato text-[#4A4540] text-sm mt-1">
                <input
                  type="checkbox"
                  checked={form.need_accommodation}
                  onChange={(e) => setForm((f) => ({ ...f, need_accommodation: e.target.checked }))}
                  className="accent-[#9B8557] w-4 h-4"
                />
                Am nevoie de cazare
              </label>
            )}
          </div>
        </div>

        {form.attending === "yes" && (
          <>
            <div className="mb-6">
              <label className="block font-lato text-[#9B8557] text-xs font-bold mb-2 tracking-[0.2em] uppercase">
                Alege număr de persoane (inclusiv copii) *
              </label>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={form.num_persons}
                onChange={(e) => handleNumPersons(parseInt(e.target.value) || 1)}
                className="w-32 bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-3 font-lato text-[#4A4540] focus:outline-none focus:ring-2 focus:ring-[#9B8557] focus:border-transparent transition"
              />
            </div>

            <div className="mb-6">
              <label className="block font-lato text-[#9B8557] text-xs font-bold mb-3 tracking-[0.2em] uppercase">
                Preferințe meniu *
              </label>
              <div className="space-y-3">
                {Array.from({ length: form.num_persons }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-[#F5F0EA] rounded-sm px-4 py-3">
                    <span className="font-lato text-[#9B8557] text-sm font-bold min-w-[80px]">
                      Persoana {idx + 1}:
                    </span>
                    <div className="relative flex-1">
                      <select
                        value={form.menu_preferences[idx]}
                        onChange={(e) => handleMenuPref(idx, e.target.value as MenuPref)}
                        className="w-full bg-white border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-2.5 font-lato text-[#4A4540] text-sm focus:outline-none focus:ring-2 focus:ring-[#9B8557] focus:border-transparent transition appearance-none cursor-pointer pr-10"
                      >
                        {(["normal", "vegetarian-cu-peste", "vegetarian-fara-peste", "vegan", "copii"] as MenuPref[]).map((opt) => (
                          <option key={opt} value={opt}>{menuLabels[opt]}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="h-4 w-4 text-[#9B8557]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Message */}
        <div className="mb-8">
          <label className="block font-lato text-[#9B8557] text-xs font-bold mb-2 tracking-[0.2em] uppercase">
            Mesaj pentru miri (opțional)
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Un gând frumos pentru Alina și Gabriel..."
            rows={4}
            className="w-full bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-3 font-lato text-[#4A4540] placeholder-[#7A7268] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#9B8557] focus:border-transparent transition resize-none"
          />
        </div>

        {error && (
          <p className="font-lato text-red-600 text-sm mb-4 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-shiny-gold font-lato tracking-[0.2em] uppercase text-sm py-4 font-bold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Se trimite..." : "Trimite Confirmarea"}
        </button>
      </form>

      <div className="text-center mt-8">
        <p className="font-playfair text-[#9B8557] text-xl tracking-wide">
          Alina &amp; Gabriel <span className="text-[#C4BDB3]">☘</span>
        </p>
      </div>
    </div>
  );
}
