"use client";

import { useState } from "react";
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

  function handleNumPersons(n: number) {
    const clamped = Math.max(1, Math.min(10, n));
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
        }),
      });
      if (!res.ok) throw new Error("Eroare la trimiterea formularului.");
      setSubmitted(true);
    } catch {
      setError("A apărut o eroare. Vă rugăm încercați din nou.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-10 text-center border border-rose-100">
          <div className="text-6xl mb-6">🌸</div>
          <h2 className="font-playfair text-3xl text-[#3d2b1f] mb-4">Mulțumim!</h2>
          <p className="font-lato text-[#5c4033] text-base leading-relaxed mb-8">
            Răspunsul vostru a fost înregistrat cu succes. Ne bucurăm să vă avem alături în ziua noastră specială!
          </p>
          <Link
            href="/"
            className="inline-block bg-[#b76e79] text-white font-lato tracking-widest uppercase text-sm px-8 py-3 rounded-full hover:bg-[#a05c67] transition-colors"
          >
            Înapoi acasă
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] py-16 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <Link href="/" className="font-lato text-[#b76e79] text-sm tracking-widest uppercase hover:underline">
          ← Înapoi
        </Link>
        <p className="font-lato text-[#b76e79] tracking-[0.3em] uppercase text-sm mt-6 mb-3">Invitație</p>
        <h1 className="font-playfair text-4xl md:text-5xl text-[#3d2b1f] mb-4">Confirmare Prezență</h1>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-16 bg-[#b76e79] opacity-50" />
          <span className="text-[#b76e79] text-xl">✦</span>
          <div className="h-px w-16 bg-[#b76e79] opacity-50" />
        </div>
        <p className="font-lato text-[#5c4033] max-w-md mx-auto text-sm leading-relaxed">
          Vă rugăm să completați formularul de mai jos până pe <strong>1 August 2025</strong>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg p-8 md:p-12 border border-rose-100">
        {/* Name */}
        <div className="mb-6">
          <label className="block font-lato text-[#3d2b1f] text-sm font-bold mb-2 tracking-wide">
            Numele dvs. *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Prenume Nume"
            className="w-full border border-rose-200 rounded-xl px-4 py-3 font-lato text-[#3d2b1f] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b76e79] focus:border-transparent transition"
          />
        </div>

        {/* Attending */}
        <div className="mb-6">
          <label className="block font-lato text-[#3d2b1f] text-sm font-bold mb-3 tracking-wide">
            Veți participa? *
          </label>
          <div className="flex gap-6">
            {[
              { val: "yes", label: "Da, voi fi prezent(ă)" },
              { val: "no", label: "Nu pot participa" },
            ].map(({ val, label }) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer font-lato text-[#5c4033] text-sm">
                <input
                  type="radio"
                  name="attending"
                  value={val}
                  checked={form.attending === val}
                  onChange={() => setForm((f) => ({ ...f, attending: val }))}
                  className="accent-[#b76e79] w-4 h-4"
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
              <label className="block font-lato text-[#3d2b1f] text-sm font-bold mb-2 tracking-wide">
                Număr de persoane *
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={form.num_persons}
                onChange={(e) => handleNumPersons(parseInt(e.target.value) || 1)}
                className="w-32 border border-rose-200 rounded-xl px-4 py-3 font-lato text-[#3d2b1f] focus:outline-none focus:ring-2 focus:ring-[#b76e79] focus:border-transparent transition"
              />
            </div>

            {/* Menu preferences */}
            <div className="mb-6">
              <label className="block font-lato text-[#3d2b1f] text-sm font-bold mb-3 tracking-wide">
                Preferințe meniu *
              </label>
              <div className="space-y-3">
                {Array.from({ length: form.num_persons }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-rose-50 rounded-xl px-4 py-3">
                    <span className="font-lato text-[#5c4033] text-sm min-w-[80px]">
                      Persoana {idx + 1}:
                    </span>
                    <div className="flex gap-4 flex-wrap">
                      {(["normal", "vegetarian", "vegan"] as MenuPref[]).map((opt) => (
                        <label key={opt} className="flex items-center gap-1.5 cursor-pointer font-lato text-[#5c4033] text-sm">
                          <input
                            type="radio"
                            name={`menu_${idx}`}
                            value={opt}
                            checked={form.menu_preferences[idx] === opt}
                            onChange={() => handleMenuPref(idx, opt)}
                            className="accent-[#b76e79] w-3.5 h-3.5"
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
              <label className="block font-lato text-[#3d2b1f] text-sm font-bold mb-3 tracking-wide">
                Participați la cununia religioasă?
              </label>
              <div className="flex gap-6">
                {[true, false].map((val) => (
                  <label key={String(val)} className="flex items-center gap-2 cursor-pointer font-lato text-[#5c4033] text-sm">
                    <input
                      type="radio"
                      name="attending_church"
                      checked={form.attending_church === val}
                      onChange={() => setForm((f) => ({ ...f, attending_church: val }))}
                      className="accent-[#b76e79] w-4 h-4"
                    />
                    {val ? "Da" : "Nu"}
                  </label>
                ))}
              </div>
              <p className="font-lato text-gray-400 text-xs mt-1">Catedrala Sf. Nicolae, ora 16:00</p>
            </div>

            {/* Party */}
            <div className="mb-6">
              <label className="block font-lato text-[#3d2b1f] text-sm font-bold mb-3 tracking-wide">
                Participați la petrecere?
              </label>
              <div className="flex gap-6">
                {[true, false].map((val) => (
                  <label key={String(val)} className="flex items-center gap-2 cursor-pointer font-lato text-[#5c4033] text-sm">
                    <input
                      type="radio"
                      name="attending_party"
                      checked={form.attending_party === val}
                      onChange={() => setForm((f) => ({ ...f, attending_party: val }))}
                      className="accent-[#b76e79] w-4 h-4"
                    />
                    {val ? "Da" : "Nu"}
                  </label>
                ))}
              </div>
              <p className="font-lato text-gray-400 text-xs mt-1">Grădina Eden, ora 19:00</p>
            </div>

            {/* Accommodation */}
            <div className="mb-6">
              <label className="block font-lato text-[#3d2b1f] text-sm font-bold mb-3 tracking-wide">
                Aveți nevoie de cazare?
              </label>
              <div className="flex gap-6">
                {[true, false].map((val) => (
                  <label key={String(val)} className="flex items-center gap-2 cursor-pointer font-lato text-[#5c4033] text-sm">
                    <input
                      type="radio"
                      name="need_accommodation"
                      checked={form.need_accommodation === val}
                      onChange={() => setForm((f) => ({ ...f, need_accommodation: val }))}
                      className="accent-[#b76e79] w-4 h-4"
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
          <label className="block font-lato text-[#3d2b1f] text-sm font-bold mb-2 tracking-wide">
            Număr de telefon (opțional)
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="07xx xxx xxx"
            className="w-full border border-rose-200 rounded-xl px-4 py-3 font-lato text-[#3d2b1f] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b76e79] focus:border-transparent transition"
          />
        </div>

        {/* Message */}
        <div className="mb-8">
          <label className="block font-lato text-[#3d2b1f] text-sm font-bold mb-2 tracking-wide">
            Mesaj pentru miri (opțional)
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Un gând frumos pentru Alina și Gabi..."
            rows={4}
            className="w-full border border-rose-200 rounded-xl px-4 py-3 font-lato text-[#3d2b1f] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b76e79] focus:border-transparent transition resize-none"
          />
        </div>

        {error && (
          <p className="font-lato text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#b76e79] text-white font-lato tracking-widest uppercase text-sm py-4 rounded-full hover:bg-[#a05c67] transition-colors duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Se trimite..." : "Trimite Confirmarea"}
        </button>
      </form>

      <div className="text-center mt-8">
        <p className="font-lato text-[#5c4033] text-sm opacity-60">
          Cu drag, Alina &amp; Gabi 🌸
        </p>
      </div>
    </div>
  );
}
