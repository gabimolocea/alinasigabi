"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { CloverIcon } from "@/components/CloverIcon";
import { type Locale, usePreferredLanguage } from "@/lib/language";

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
  phone?: string;
}

const menuOptions: MenuPref[] = ["normal", "vegetarian-cu-peste", "vegetarian-fara-peste", "vegan", "copii"];

const translations: Record<Locale, {
  languageName: string;
  loading: string;
  back: string;
  backHome: string;
  confirmPresence: string;
  searchIntro: string;
  searchLabel: string;
  searchPlaceholder: string;
  searching: string;
  foundInviteFor: string;
  confirmIdentity: string;
  noGuestFound: string;
  connectionError: string;
  deadline: string;
  thankYou: string;
  attendingSuccess: string;
  notAttendingSuccess: string;
  welcome: string;
  fillForm: string;
  nameLabel: string;
  phoneLabel: string;
  phonePlaceholder: string;
  attendingLabel: string;
  churchOption: string;
  partyOption: string;
  cannotAttend: string;
  accommodation: string;
  personsLabel: string;
  menuLabel: string;
  personLabel: string;
  messageLabel: string;
  messagePlaceholder: string;
  sending: string;
  submit: string;
  submitError: string;
  genericError: string;
  menuLabels: Record<MenuPref, string>;
}> = {
  ro: {
    languageName: "Română",
    loading: "Se încarcă...",
    back: "← Înapoi",
    backHome: "Înapoi acasă",
    confirmPresence: "Confirmă prezența",
    searchIntro: "Introduceți numele dumneavoastră pentru a vă identifica pe lista de invitați.",
    searchLabel: "Prenume și Nume",
    searchPlaceholder: "ex: Ion Popescu sau Familia Popescu",
    searching: "Se caută...",
    foundInviteFor: "Am găsit invitația pentru:",
    confirmIdentity: "Confirmă identitatea",
    noGuestFound: "Nu am găsit niciun invitat cu acest nume. Verificați ortografia sau contactați mirii.",
    connectionError: "Eroare de conexiune.",
    deadline: "Confirmarea prezenței până la 26 Iunie 2026",
    thankYou: "Mulțumim!",
    attendingSuccess: "Ne bucurăm să vă avem alături în ziua noastră specială!",
    notAttendingSuccess: "Ne bucurăm că sunteți cu sufletul alături de noi în ziua noastră specială!",
    welcome: "Bun venit,",
    fillForm: "Completează formularul de mai jos.",
    nameLabel: "Numele Dvs. / Nume Familie *",
    phoneLabel: "Număr de telefon *",
    phonePlaceholder: "07xx xxx xxx",
    attendingLabel: "Veți participa? *",
    churchOption: "Da, voi fi prezent(ă) la cununia religioasă",
    partyOption: "Da, voi fi prezent(ă) la petrecere",
    cannotAttend: "Nu pot participa",
    accommodation: "Am nevoie de cazare",
    personsLabel: "Alege număr de persoane (inclusiv copii) *",
    menuLabel: "Preferințe meniu *",
    personLabel: "Persoana",
    messageLabel: "Mesaj pentru miri (opțional)",
    messagePlaceholder: "Un gând frumos pentru Alina și Gabriel...",
    sending: "Se trimite...",
    submit: "Trimite confirmarea",
    submitError: "Eroare la trimiterea formularului.",
    genericError: "A apărut o eroare. Vă rugăm încercați din nou.",
    menuLabels: {
      normal: "Normal",
      "vegetarian-cu-peste": "Vegetarian cu pește",
      "vegetarian-fara-peste": "Vegetarian fără pește",
      vegan: "Vegan",
      copii: "Meniu copii",
    },
  },
  en: {
    languageName: "English",
    loading: "Loading...",
    back: "← Back",
    backHome: "Back home",
    confirmPresence: "Confirm attendance",
    searchIntro: "Enter your name to identify yourself on the guest list.",
    searchLabel: "First and last name",
    searchPlaceholder: "e.g. Ion Popescu or Popescu Family",
    searching: "Searching...",
    foundInviteFor: "We found the invitation for:",
    confirmIdentity: "Confirm identity",
    noGuestFound: "We couldn't find any guest with this name. Please check the spelling or contact the couple.",
    connectionError: "Connection error.",
    deadline: "Please confirm attendance by June 26, 2026",
    thankYou: "Thank you!",
    attendingSuccess: "We are delighted to have you with us on our special day!",
    notAttendingSuccess: "We are grateful to have your love and support with us on our special day!",
    welcome: "Welcome,",
    fillForm: "Please complete the form below.",
    nameLabel: "Your name / family name *",
    phoneLabel: "Phone number *",
    phonePlaceholder: "07xx xxx xxx",
    attendingLabel: "Will you attend? *",
    churchOption: "Yes, I will attend the religious ceremony",
    partyOption: "Yes, I will attend the reception",
    cannotAttend: "I cannot attend",
    accommodation: "I need accommodation",
    personsLabel: "Choose number of guests (including children) *",
    menuLabel: "Menu preferences *",
    personLabel: "Guest",
    messageLabel: "Message for the couple (optional)",
    messagePlaceholder: "A lovely thought for Alina and Gabriel...",
    sending: "Sending...",
    submit: "Send confirmation",
    submitError: "Error submitting the form.",
    genericError: "An error occurred. Please try again.",
    menuLabels: {
      normal: "Standard",
      "vegetarian-cu-peste": "Vegetarian with fish",
      "vegetarian-fara-peste": "Vegetarian without fish",
      vegan: "Vegan",
      copii: "Children's menu",
    },
  },
  fr: {
    languageName: "Français",
    loading: "Chargement...",
    back: "← Retour",
    backHome: "Retour à l'accueil",
    confirmPresence: "Confirmer la présence",
    searchIntro: "Saisissez votre nom pour vous identifier sur la liste des invités.",
    searchLabel: "Prénom et nom",
    searchPlaceholder: "ex. Ion Popescu ou Famille Popescu",
    searching: "Recherche en cours...",
    foundInviteFor: "Nous avons trouvé l'invitation pour :",
    confirmIdentity: "Confirmer l'identité",
    noGuestFound: "Nous n'avons trouvé aucun invité avec ce nom. Vérifiez l'orthographe ou contactez les mariés.",
    connectionError: "Erreur de connexion.",
    deadline: "Merci de confirmer votre présence avant le 26 juin 2026",
    thankYou: "Merci !",
    attendingSuccess: "Nous sommes ravis de vous avoir à nos côtés pour notre journée spéciale !",
    notAttendingSuccess: "Nous sommes touchés de vous savoir avec nous par la pensée lors de notre journée spéciale !",
    welcome: "Bienvenue,",
    fillForm: "Veuillez remplir le formulaire ci-dessous.",
    nameLabel: "Votre nom / nom de famille *",
    phoneLabel: "Numéro de téléphone *",
    phonePlaceholder: "07xx xxx xxx",
    attendingLabel: "Serez-vous présent(e) ? *",
    churchOption: "Oui, je serai présent(e) à la cérémonie religieuse",
    partyOption: "Oui, je serai présent(e) à la réception",
    cannotAttend: "Je ne peux pas participer",
    accommodation: "J'ai besoin d'un hébergement",
    personsLabel: "Choisissez le nombre de personnes (enfants inclus) *",
    menuLabel: "Préférences de menu *",
    personLabel: "Personne",
    messageLabel: "Message pour les mariés (optionnel)",
    messagePlaceholder: "Une belle pensée pour Alina et Gabriel...",
    sending: "Envoi en cours...",
    submit: "Envoyer la confirmation",
    submitError: "Erreur lors de l'envoi du formulaire.",
    genericError: "Une erreur est survenue. Veuillez réessayer.",
    menuLabels: {
      normal: "Standard",
      "vegetarian-cu-peste": "Végétarien avec poisson",
      "vegetarian-fara-peste": "Végétarien sans poisson",
      vegan: "Vegan",
      copii: "Menu enfant",
    },
  },
};

export default function RSVPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F0EA] flex items-center justify-center">
        <p className="font-lato text-[#9B8557]">Loading...</p>
      </div>
    }>
      <RSVPContent />
    </Suspense>
  );
}

function RSVPContent() {
  const { language } = usePreferredLanguage();

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
  const t = translations[language];
  const maxSelectablePersons = Math.max(1, Math.min(selectedGuest?.max_persons ?? 20, 20));

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
        setSearchError(translations[language].connectionError);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchName, language]);

  function selectGuest(guest: GuestMatch) {
    setSelectedGuest(guest);
    setForm((f) => ({ ...f, name: guest.guest_name, phone: guest.phone || f.phone }));
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
        throw new Error(data.error || t.submitError);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError);
    } finally {
      setLoading(false);
    }
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F0EA] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-sm shadow-sm p-10 text-center gold-border-double">
          <div className="mb-6 flex justify-center">
            <CloverIcon className="h-10 w-10 text-[#C4BDB3]" />
          </div>
          <h2 className="font-playfair text-3xl mb-4 shiny-gold">{t.thankYou}</h2>
          <p className="font-lato text-[#4A4540] text-base leading-relaxed mb-8">
            {form.attending === "no"
              ? t.notAttendingSuccess
              : t.attendingSuccess}
          </p>
          <Link
            href="/"
            className="inline-block btn-shiny-gold font-lato tracking-[0.2em] uppercase text-sm px-8 py-3 font-bold"
          >
            {t.backHome}
          </Link>
        </div>
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
            {t.back}
          </Link>

          <div className="mt-8 mb-6">
            <CloverIcon className="h-8 w-8 text-[#C4BDB3]" />
          </div>

          <h1 className="font-playfair text-4xl md:text-5xl tracking-wide mb-3 shiny-gold">{t.confirmPresence}</h1>

          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-[#9B8557] opacity-40" />
            <CloverIcon className="h-5 w-5 text-[#C4BDB3]" />
            <div className="h-px w-16 bg-[#9B8557] opacity-40" />
          </div>

          <p className="font-lato text-[#4A4540] text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            {t.searchIntro}
          </p>

          <div className="bg-white rounded-sm p-8 gold-border">
            <label className="block font-lato text-[#9B8557] text-xs font-bold mb-3 tracking-[0.2em] uppercase">
              {t.searchLabel}
            </label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
                setSelectedGuest(null);
              }}
              placeholder={t.searchPlaceholder}
              autoFocus
              className="w-full bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-3 font-lato text-[#4A4540] placeholder-[#7A7268] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#9B8557] focus:border-transparent transition text-center text-lg"
            />

            {searching && (
              <p className="font-lato text-[#9B8557] text-sm mt-4 opacity-60">{t.searching}</p>
            )}

            {!searching && searchResults.length > 0 && (
              <div className="mt-6 text-center">
                <div className="bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-5">
                  <p className="font-lato text-[#7A7268] text-xs mb-2">{t.foundInviteFor}</p>
                  <p className="font-playfair text-[#9B8557] text-xl mb-4">{searchResults[0].guest_name}</p>
                  <button
                    onClick={() => selectGuest(searchResults[0])}
                    className="btn-shiny-gold font-lato tracking-[0.2em] uppercase text-sm px-8 py-2.5 font-bold rounded-sm"
                  >
                    {t.confirmIdentity}
                  </button>
                </div>
              </div>
            )}

            {!searching && searchName.trim().length >= 2 && searchResults.length === 0 && (
              <p className="font-lato text-[#7A7268] text-sm mt-4">
                {t.noGuestFound}
              </p>
            )}

            {searchError && (
              <p className="font-lato text-red-600 text-sm mt-3">{searchError}</p>
            )}
          </div>

          <p className="font-lato text-[#7A7268] text-xs mt-6">
            {t.deadline}
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
          {t.back}
        </Link>
        <div className="mt-6 mb-3">
          <CloverIcon className="h-7 w-7 text-[#C4BDB3]" />
        </div>
        <h1 className="font-playfair text-3xl md:text-4xl tracking-wide mb-3 shiny-gold">{t.confirmPresence}</h1>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-16 bg-[#9B8557] opacity-40" />
          <CloverIcon className="h-5 w-5 text-[#C4BDB3]" />
          <div className="h-px w-16 bg-[#9B8557] opacity-40" />
        </div>
        <p className="font-lato text-[#4A4540] max-w-md mx-auto text-sm leading-relaxed">
          {t.welcome} <strong className="text-[#9B8557]">{selectedGuest?.guest_name}</strong>! {t.fillForm}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-sm shadow-sm p-8 md:p-12 gold-border">
        {/* Name */}
        <div className="mb-6">
          <label className="block font-lato text-[#9B8557] text-xs font-bold mb-2 tracking-[0.2em] uppercase">
            {t.nameLabel}
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder={t.searchPlaceholder}
            className="w-full bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-3 font-lato text-[#4A4540] placeholder-[#7A7268] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#9B8557] focus:border-transparent transition"
          />
        </div>

        {/* Phone */}
        <div className="mb-6">
          <label className="block font-lato text-[#9B8557] text-xs font-bold mb-2 tracking-[0.2em] uppercase">
            {t.phoneLabel}
          </label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder={t.phonePlaceholder}
            className="w-full bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-3 font-lato text-[#4A4540] placeholder-[#7A7268] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#9B8557] focus:border-transparent transition"
          />
        </div>

        {/* Attending */}
        <div className="mb-6">
          <label className="block font-lato text-[#9B8557] text-xs font-bold mb-3 tracking-[0.2em] uppercase">
            {t.attendingLabel}
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
              {t.churchOption}
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
              {t.partyOption}
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
              {t.cannotAttend}
            </label>
            {form.attending === "yes" && (
              <label className="flex items-center gap-2 cursor-pointer font-lato text-[#4A4540] text-sm mt-1">
                <input
                  type="checkbox"
                  checked={form.need_accommodation}
                  onChange={(e) => setForm((f) => ({ ...f, need_accommodation: e.target.checked }))}
                  className="accent-[#9B8557] w-4 h-4"
                />
                {t.accommodation}
              </label>
            )}
          </div>
        </div>

        {form.attending === "yes" && (
          <>
            <div className="mb-6">
              <label className="block font-lato text-[#9B8557] text-xs font-bold mb-2 tracking-[0.2em] uppercase">
                {t.personsLabel}
              </label>
              <div className="relative w-40">
                <select
                  required
                  value={form.num_persons}
                  onChange={(e) => handleNumPersons(parseInt(e.target.value, 10) || 1)}
                  className="w-full appearance-none bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-3 pr-10 font-lato text-[#4A4540] focus:outline-none focus:ring-2 focus:ring-[#9B8557] focus:border-transparent transition"
                >
                  {Array.from({ length: maxSelectablePersons }, (_, idx) => idx + 1).map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-4 w-4 text-[#9B8557]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block font-lato text-[#9B8557] text-xs font-bold mb-3 tracking-[0.2em] uppercase">
                {t.menuLabel}
              </label>
              <div className="space-y-3">
                {Array.from({ length: form.num_persons }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-[#F5F0EA] rounded-sm px-4 py-3">
                    <span className="font-lato text-[#9B8557] text-sm font-bold min-w-[80px]">
                      {t.personLabel} {idx + 1}:
                    </span>
                    <div className="relative flex-1">
                      <select
                        value={form.menu_preferences[idx]}
                        onChange={(e) => handleMenuPref(idx, e.target.value as MenuPref)}
                        className="w-full bg-white border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-2.5 font-lato text-[#4A4540] text-sm focus:outline-none focus:ring-2 focus:ring-[#9B8557] focus:border-transparent transition appearance-none cursor-pointer pr-10"
                      >
                        {menuOptions.map((opt) => (
                          <option key={opt} value={opt}>{t.menuLabels[opt]}</option>
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
            {t.messageLabel}
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder={t.messagePlaceholder}
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
          {loading ? t.sending : t.submit}
        </button>
      </form>

      <div className="text-center mt-8">
        <p className="font-playfair text-[#9B8557] text-xl tracking-wide">
          <span className="inline-flex items-center gap-2">
            <span>Alina &amp; Gabriel</span>
            <CloverIcon className="h-4 w-4 text-[#C4BDB3]" />
          </span>
        </p>
      </div>
    </div>
  );
}
