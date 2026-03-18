"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { CloverIcon } from "@/components/CloverIcon";
import { type Locale, usePreferredLanguage } from "@/lib/language";

type GuestStatus = "draft" | "invitation_sent" | "invitation_received" | "confirmed" | "declined";

interface InvitationCode {
  id: number;
  guest_name: string | null;
  max_persons: number;
  used: number;
  status: GuestStatus;
  phone: string | null;
  notes: string | null;
  created_at: string;
  rsvp_name: string | null;
  rsvp_attending: number | null;
  rsvp_persons: number | null;
  rsvp_menu: string | null;
  rsvp_accommodation: number | null;
  rsvp_church: number | null;
  rsvp_party: number | null;
  rsvp_phone: string | null;
  rsvp_message: string | null;
  rsvp_table: number | null;
  rsvp_date: string | null;
}

const statusStyles: Record<GuestStatus, { color: string; bg: string }> = {
  draft: { color: "text-gray-600", bg: "bg-gray-100 border-gray-400" },
  invitation_sent: { color: "text-blue-700", bg: "bg-blue-50 border-blue-400" },
  invitation_received: { color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-500" },
  confirmed: { color: "text-green-700", bg: "bg-green-50 border-green-500" },
  declined: { color: "text-red-700", bg: "bg-red-50 border-red-500" },
};

const statusOrder: GuestStatus[] = ["draft", "invitation_sent", "invitation_received", "confirmed", "declined"];

const statusLabelsByLocale: Record<Locale, Record<GuestStatus, string>> = {
  ro: {
    draft: "Ciornă",
    invitation_sent: "Invitație trimisă",
    invitation_received: "Invitație primită",
    confirmed: "Confirmat",
    declined: "Refuzat",
  },
  en: {
    draft: "Draft",
    invitation_sent: "Invitation sent",
    invitation_received: "Invitation received",
    confirmed: "Confirmed",
    declined: "Declined",
  },
  fr: {
    draft: "Brouillon",
    invitation_sent: "Invitation envoyée",
    invitation_received: "Invitation reçue",
    confirmed: "Confirmé",
    declined: "Refusé",
  },
};

const menuLabelsByLocale: Record<Locale, Record<string, string>> = {
  ro: {
    normal: "Normal",
    "vegetarian-cu-peste": "Vegetarian cu pește",
    "vegetarian-fara-peste": "Vegetarian fără pește",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    copii: "Meniu copii",
  },
  en: {
    normal: "Standard",
    "vegetarian-cu-peste": "Vegetarian with fish",
    "vegetarian-fara-peste": "Vegetarian without fish",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    copii: "Children's menu",
  },
  fr: {
    normal: "Standard",
    "vegetarian-cu-peste": "Végétarien avec poisson",
    "vegetarian-fara-peste": "Végétarien sans poisson",
    vegetarian: "Végétarien",
    vegan: "Vegan",
    copii: "Menu enfant",
  },
};

const adminTranslations = {
  ro: {
    title: "Panou Admin",
    subtitle: "Alina & Gabriel – 26 Iulie 2026",
    incorrectPassword: "Parolă incorectă.",
    connectionError: "Eroare de conexiune.",
    passwordPlaceholder: "Parolă",
    checking: "Se verifică...",
    enter: "Intră",
    refresh: "↻ Actualizează",
    exportExcel: "📥 Export Excel",
    site: "🏠 Site",
    stats: {
      totalInvitations: "Total invitații",
      confirmed: "Confirmați",
      declined: "Refuzați",
      pending: "În așteptare",
      totalGuests: "Total persoane",
      church: "La biserică",
      party: "La petrecere",
      accommodation: "Cazare",
      vegetarian: "Meniu Vegetarian",
      vegan: "Meniu Vegan",
    },
    guestListTab: (count: number) => `👥 Lista Invitaților (${count})`,
    addGuestTab: "➕ Adaugă Invitat",
    addGuestTitle: "Adaugă Invitat Nou",
    guestNameLabel: "Numele invitatului *",
    guestNameField: "Nume invitat",
    guestNamePlaceholder: "ex: Gabriel Molocea sau Familia Molocea",
    phone: "Telefon",
    phonePlaceholder: "07xx xxx xxx",
    notes: "Note",
    notesPlaceholder: "Note interne...",
    addGuestSuccess: (name: string) => `Invitatul "${name}" a fost adăugat cu succes!`,
    addGuestHint: "Invitatul își va putea confirma prezența căutându-și numele",
    adding: "Se adaugă...",
    addGuest: "Adaugă Invitat",
    all: "Toți",
    loading: "Se încarcă...",
    noGuests: (status?: string) => `Nu există invitați${status ? ` cu statusul "${status}"` : ""}.`,
    needsAccommodationTitle: "Nevoie de cazare",
    specialMenuTitle: "Meniu special",
    personsShort: "pers.",
    attendingShort: "✓ Participă",
    notAttendingShort: "✗ Nu participă",
    unfilled: "Necompletat",
    guestInfo: "Informații Invitat",
    created: "Creat",
    changeStatus: "Schimbă Status",
    table: "Masă",
    tableLabel: (table: number) => `Masa ${table}`,
    deleteConfirm: "Sigur doriți să ștergeți acest invitat și toate datele asociate?",
    deleteGuest: "🗑 Șterge invitatul",
    rsvpResponse: "Răspuns RSVP",
    noRsvpYet: "Invitatul nu a completat formularul RSVP încă.",
    filledName: "Nume completat",
    nameChanged: "✎ Numele a fost modificat",
    originalName: "Nume original:",
    newName: "Nume nou:",
    attending: "Participă",
    yes: "Da",
    no: "Nu",
    persons: "Nr. persoane",
    rsvpPhone: "Telefon RSVP",
    accommodation: "Cazare",
    accommodationYes: "🏨 DA – Au nevoie de cazare",
    accommodationNo: "Nu au nevoie de cazare",
    menuPerPerson: "Meniu per persoană",
    specialMenuWarning: "⚠ MENIU SPECIAL",
    person: "Persoana",
    church: "Biserică",
    party: "Petrecere",
    message: "Mesaj",
    rsvpDate: "Data RSVP",
    guestSheet: "Invitați",
    statsSheet: "Statistici",
    fileName: "invitati_nunta_alina_gabriel.xlsx",
    guestNameColumn: "Nume Invitat",
    statusColumn: "Status",
    phoneColumn: "Telefon",
    attendingColumn: "Participă",
    personsColumn: "Nr. Persoane",
    accommodationColumn: "Cazare",
    specialMenuColumn: "Meniu Special",
    menuPersonColumn: (index: number) => `Meniu Persoana ${index + 1}`,
    churchColumn: "Biserică",
    partyColumn: "Petrecere",
    tableColumn: "Masă",
    rsvpPhoneColumn: "Telefon RSVP",
    messageColumn: "Mesaj",
    rsvpDateColumn: "Data RSVP",
    adminNotesColumn: "Note Admin",
    statsRows: {
      totalInvitations: "Total invitații",
      confirmed: "Confirmați",
      declined: "Refuzați",
      pending: "În așteptare",
      totalConfirmedGuests: "Total persoane confirmate",
      churchGuests: "Persoane la biserică",
      partyGuests: "Persoane la petrecere",
      accommodationNeeded: "Au nevoie de cazare",
      vegetarianGuests: "Meniu Vegetarian (persoane)",
      veganGuests: "Meniu Vegan (persoane)",
      normalGuests: "Meniu Normal (persoane)",
    },
    statistic: "Statistică",
    value: "Valoare",
  },
  en: {
    title: "Admin Panel",
    subtitle: "Alina & Gabriel – July 26, 2026",
    incorrectPassword: "Incorrect password.",
    connectionError: "Connection error.",
    passwordPlaceholder: "Password",
    checking: "Checking...",
    enter: "Enter",
    refresh: "↻ Refresh",
    exportExcel: "📥 Export Excel",
    site: "🏠 Website",
    stats: {
      totalInvitations: "Total invitations",
      confirmed: "Confirmed",
      declined: "Declined",
      pending: "Pending",
      totalGuests: "Total guests",
      church: "At ceremony",
      party: "At reception",
      accommodation: "Accommodation",
      vegetarian: "Vegetarian menu",
      vegan: "Vegan menu",
    },
    guestListTab: (count: number) => `👥 Guest List (${count})`,
    addGuestTab: "➕ Add Guest",
    addGuestTitle: "Add New Guest",
    guestNameLabel: "Guest name *",
    guestNameField: "Guest name",
    guestNamePlaceholder: "e.g. Gabriel Molocea or Molocea Family",
    phone: "Phone",
    phonePlaceholder: "07xx xxx xxx",
    notes: "Notes",
    notesPlaceholder: "Internal notes...",
    addGuestSuccess: (name: string) => `Guest "${name}" was added successfully!`,
    addGuestHint: "The guest will be able to confirm attendance by searching for their name",
    adding: "Adding...",
    addGuest: "Add Guest",
    all: "All",
    loading: "Loading...",
    noGuests: (status?: string) => `There are no guests${status ? ` with status "${status}"` : ""}.`,
    needsAccommodationTitle: "Needs accommodation",
    specialMenuTitle: "Special menu",
    personsShort: "guests",
    attendingShort: "✓ Attending",
    notAttendingShort: "✗ Not attending",
    unfilled: "Not filled in",
    guestInfo: "Guest Information",
    created: "Created",
    changeStatus: "Change Status",
    table: "Table",
    tableLabel: (table: number) => `Table ${table}`,
    deleteConfirm: "Are you sure you want to delete this guest and all associated data?",
    deleteGuest: "🗑 Delete guest",
    rsvpResponse: "RSVP Response",
    noRsvpYet: "The guest has not filled in the RSVP form yet.",
    filledName: "Submitted name",
    nameChanged: "✎ The name was changed",
    originalName: "Original name:",
    newName: "New name:",
    attending: "Attending",
    yes: "Yes",
    no: "No",
    persons: "No. of guests",
    rsvpPhone: "RSVP phone",
    accommodation: "Accommodation",
    accommodationYes: "🏨 YES – Accommodation needed",
    accommodationNo: "No accommodation needed",
    menuPerPerson: "Menu per guest",
    specialMenuWarning: "⚠ SPECIAL MENU",
    person: "Guest",
    church: "Ceremony",
    party: "Reception",
    message: "Message",
    rsvpDate: "RSVP date",
    guestSheet: "Guests",
    statsSheet: "Statistics",
    fileName: "alina_gabriel_wedding_guests.xlsx",
    guestNameColumn: "Guest name",
    statusColumn: "Status",
    phoneColumn: "Phone",
    attendingColumn: "Attending",
    personsColumn: "Guests",
    accommodationColumn: "Accommodation",
    specialMenuColumn: "Special Menu",
    menuPersonColumn: (index: number) => `Guest Menu ${index + 1}`,
    churchColumn: "Ceremony",
    partyColumn: "Reception",
    tableColumn: "Table",
    rsvpPhoneColumn: "RSVP Phone",
    messageColumn: "Message",
    rsvpDateColumn: "RSVP Date",
    adminNotesColumn: "Admin Notes",
    statsRows: {
      totalInvitations: "Total invitations",
      confirmed: "Confirmed",
      declined: "Declined",
      pending: "Pending",
      totalConfirmedGuests: "Total confirmed guests",
      churchGuests: "Guests at ceremony",
      partyGuests: "Guests at reception",
      accommodationNeeded: "Need accommodation",
      vegetarianGuests: "Vegetarian menu (guests)",
      veganGuests: "Vegan menu (guests)",
      normalGuests: "Standard menu (guests)",
    },
    statistic: "Statistic",
    value: "Value",
  },
  fr: {
    title: "Panneau Admin",
    subtitle: "Alina & Gabriel – 26 Juillet 2026",
    incorrectPassword: "Mot de passe incorrect.",
    connectionError: "Erreur de connexion.",
    passwordPlaceholder: "Mot de passe",
    checking: "Vérification...",
    enter: "Entrer",
    refresh: "↻ Actualiser",
    exportExcel: "📥 Export Excel",
    site: "🏠 Site",
    stats: {
      totalInvitations: "Total invitations",
      confirmed: "Confirmés",
      declined: "Refusés",
      pending: "En attente",
      totalGuests: "Total personnes",
      church: "À la cérémonie",
      party: "À la réception",
      accommodation: "Hébergement",
      vegetarian: "Menu végétarien",
      vegan: "Menu vegan",
    },
    guestListTab: (count: number) => `👥 Liste des invités (${count})`,
    addGuestTab: "➕ Ajouter un invité",
    addGuestTitle: "Ajouter un nouvel invité",
    guestNameLabel: "Nom de l'invité *",
    guestNameField: "Nom invité",
    guestNamePlaceholder: "ex. Gabriel Molocea ou Famille Molocea",
    phone: "Téléphone",
    phonePlaceholder: "07xx xxx xxx",
    notes: "Notes",
    notesPlaceholder: "Notes internes...",
    addGuestSuccess: (name: string) => `L'invité "${name}" a été ajouté avec succès !`,
    addGuestHint: "L'invité pourra confirmer sa présence en recherchant son nom",
    adding: "Ajout...",
    addGuest: "Ajouter l'invité",
    all: "Tous",
    loading: "Chargement...",
    noGuests: (status?: string) => `Aucun invité${status ? ` avec le statut "${status}"` : ""}.`,
    needsAccommodationTitle: "Besoin d'hébergement",
    specialMenuTitle: "Menu spécial",
    personsShort: "pers.",
    attendingShort: "✓ Présent",
    notAttendingShort: "✗ Absent",
    unfilled: "Non rempli",
    guestInfo: "Informations invité",
    created: "Créé",
    changeStatus: "Changer le statut",
    table: "Table",
    tableLabel: (table: number) => `Table ${table}`,
    deleteConfirm: "Voulez-vous vraiment supprimer cet invité et toutes les données associées ?",
    deleteGuest: "🗑 Supprimer l'invité",
    rsvpResponse: "Réponse RSVP",
    noRsvpYet: "L'invité n'a pas encore rempli le formulaire RSVP.",
    filledName: "Nom saisi",
    nameChanged: "✎ Le nom a été modifié",
    originalName: "Nom original :",
    newName: "Nouveau nom :",
    attending: "Présence",
    yes: "Oui",
    no: "Non",
    persons: "Nb. de personnes",
    rsvpPhone: "Téléphone RSVP",
    accommodation: "Hébergement",
    accommodationYes: "🏨 OUI – Hébergement nécessaire",
    accommodationNo: "Pas besoin d'hébergement",
    menuPerPerson: "Menu par personne",
    specialMenuWarning: "⚠ MENU SPÉCIAL",
    person: "Personne",
    church: "Cérémonie",
    party: "Réception",
    message: "Message",
    rsvpDate: "Date RSVP",
    guestSheet: "Invités",
    statsSheet: "Statistiques",
    fileName: "invites_mariage_alina_gabriel.xlsx",
    guestNameColumn: "Nom invité",
    statusColumn: "Statut",
    phoneColumn: "Téléphone",
    attendingColumn: "Présence",
    personsColumn: "Personnes",
    accommodationColumn: "Hébergement",
    specialMenuColumn: "Menu spécial",
    menuPersonColumn: (index: number) => `Menu Personne ${index + 1}`,
    churchColumn: "Cérémonie",
    partyColumn: "Réception",
    tableColumn: "Table",
    rsvpPhoneColumn: "Téléphone RSVP",
    messageColumn: "Message",
    rsvpDateColumn: "Date RSVP",
    adminNotesColumn: "Notes Admin",
    statsRows: {
      totalInvitations: "Total invitations",
      confirmed: "Confirmés",
      declined: "Refusés",
      pending: "En attente",
      totalConfirmedGuests: "Total personnes confirmées",
      churchGuests: "Personnes à la cérémonie",
      partyGuests: "Personnes à la réception",
      accommodationNeeded: "Besoin d'hébergement",
      vegetarianGuests: "Menu végétarien (personnes)",
      veganGuests: "Menu vegan (personnes)",
      normalGuests: "Menu standard (personnes)",
    },
    statistic: "Statistique",
    value: "Valeur",
  },
} satisfies Record<Locale, unknown>;

function parseMenus(raw: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; }
  catch { return []; }
}

function hasSpecialMenu(raw: string | null): boolean {
  const menus = parseMenus(raw);
  return menus.some((m) => m !== "normal");
}

export default function AdminPage() {
  const { language } = usePreferredLanguage();
  const t = adminTranslations[language];
  const statusConfig = statusOrder.reduce((acc, status) => {
    acc[status] = {
      ...statusStyles[status],
      label: statusLabelsByLocale[language][status],
    };
    return acc;
  }, {} as Record<GuestStatus, { label: string; color: string; bg: string }>);
  const menuLabels = menuLabelsByLocale[language];

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [guests, setGuests] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"guests" | "add">("guests");
  const [filterStatus, setFilterStatus] = useState<GuestStatus | "all">("all");
  const [expandedGuest, setExpandedGuest] = useState<number | null>(null);

  // Add guest form
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState("");

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/codes");
      const data = await res.json();
      setGuests(data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchGuests();
  }, [authenticated, fetchGuests]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) setAuthenticated(true);
      else setAuthError(t.incorrectPassword);
    } catch { setAuthError(t.connectionError); }
    finally { setLoading(false); }
  }

  async function handleAddGuest(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    setAddSuccess("");
    try {
      const res = await fetch("/api/admin/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_name: newName,
          phone: newPhone,
          notes: newNotes,
        }),
      });
      await res.json();
      if (res.ok) {
        setAddSuccess(t.addGuestSuccess(newName));
        setNewName("");
        setNewPhone("");
        setNewNotes("");
        fetchGuests();
      }
    } catch { /* ignore */ }
    finally { setAddLoading(false); }
  }

  async function updateStatus(id: number, status: GuestStatus) {
    await fetch("/api/admin/codes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchGuests();
  }

  async function deleteGuest(id: number) {
    if (!confirm(t.deleteConfirm)) return;
    await fetch("/api/admin/codes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchGuests();
  }

  async function updateTable(id: number, tableNumber: string) {
    await fetch("/api/admin/codes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, table_number: tableNumber ? parseInt(tableNumber) : null }),
    });
    fetchGuests();
  }

  async function updateGuestName(id: number, guestName: string, originalName: string | null) {
    const trimmedName = guestName.trim();
    if (!trimmedName || trimmedName === (originalName || "").trim()) return;

    await fetch("/api/admin/codes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, guest_name: trimmedName }),
    });
    fetchGuests();
  }

  function exportExcel() {
    const rows = guests.map((g) => {
      const menus = parseMenus(g.rsvp_menu);
      const menuPerPerson: Record<string, string> = {};
      menus.forEach((m, i) => {
        menuPerPerson[t.menuPersonColumn(i)] = menuLabels[m] || m;
      });
      const special = menus.some((m) => m !== "normal");

      return {
        [t.guestNameColumn]: g.guest_name || "",
        [t.statusColumn]: statusConfig[g.status]?.label || g.status,
        [t.phoneColumn]: g.phone || "",
        [t.attendingColumn]: g.rsvp_attending === 1 ? t.yes : g.rsvp_attending === 0 ? t.no : t.unfilled,
        [t.personsColumn]: g.rsvp_persons || "",
        [t.accommodationColumn]: g.rsvp_accommodation ? t.yes.toUpperCase() : g.rsvp_attending === 1 ? t.no : "",
        [t.specialMenuColumn]: special ? t.yes.toUpperCase() : g.rsvp_attending === 1 ? t.no : "",
        ...menuPerPerson,
        [t.churchColumn]: g.rsvp_church ? t.yes : g.rsvp_attending === 1 ? t.no : "",
        [t.partyColumn]: g.rsvp_party ? t.yes : g.rsvp_attending === 1 ? t.no : "",
        [t.tableColumn]: g.rsvp_table || "",
        [t.rsvpPhoneColumn]: g.rsvp_phone || "",
        [t.messageColumn]: g.rsvp_message || "",
        [t.rsvpDateColumn]: g.rsvp_date?.split("T")[0] || g.rsvp_date?.split(" ")[0] || "",
        [t.adminNotesColumn]: g.notes || "",
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    if (rows.length > 0) {
      const colWidths = Object.keys(rows[0]).map((key) => {
        const maxLen = Math.max(key.length, ...rows.map((r) => String((r as Record<string, unknown>)[key] || "").length));
        return { wch: Math.min(maxLen + 2, 40) };
      });
      ws["!cols"] = colWidths;
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t.guestSheet);

    // Stats sheet
    const confirmed = guests.filter((g) => g.rsvp_attending === 1);
    const statsRows = [
      { [t.statistic]: t.statsRows.totalInvitations, [t.value]: guests.length },
      { [t.statistic]: t.statsRows.confirmed, [t.value]: guests.filter((g) => g.status === "confirmed").length },
      { [t.statistic]: t.statsRows.declined, [t.value]: guests.filter((g) => g.status === "declined").length },
      { [t.statistic]: t.statsRows.pending, [t.value]: guests.filter((g) => !["confirmed", "declined"].includes(g.status)).length },
      { [t.statistic]: t.statsRows.totalConfirmedGuests, [t.value]: confirmed.reduce((s, g) => s + (g.rsvp_persons || 0), 0) },
      { [t.statistic]: t.statsRows.churchGuests, [t.value]: guests.filter((g) => g.rsvp_church).reduce((s, g) => s + (g.rsvp_persons || 0), 0) },
      { [t.statistic]: t.statsRows.partyGuests, [t.value]: guests.filter((g) => g.rsvp_party).reduce((s, g) => s + (g.rsvp_persons || 0), 0) },
      { [t.statistic]: t.statsRows.accommodationNeeded, [t.value]: guests.filter((g) => g.rsvp_accommodation).length },
      { [t.statistic]: t.statsRows.vegetarianGuests, [t.value]: confirmed.reduce((s, g) => s + parseMenus(g.rsvp_menu).filter((m) => m === "vegetarian").length, 0) },
      { [t.statistic]: t.statsRows.veganGuests, [t.value]: confirmed.reduce((s, g) => s + parseMenus(g.rsvp_menu).filter((m) => m === "vegan").length, 0) },
      { [t.statistic]: t.statsRows.normalGuests, [t.value]: confirmed.reduce((s, g) => s + parseMenus(g.rsvp_menu).filter((m) => m === "normal").length, 0) },
    ];
    const wsStats = XLSX.utils.json_to_sheet(statsRows);
    wsStats["!cols"] = [{ wch: 30 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsStats, t.statsSheet);

    XLSX.writeFile(wb, t.fileName);
  }

  // Stats
  const filtered = filterStatus === "all" ? guests : guests.filter((g) => g.status === filterStatus);
  const totalInvitations = guests.length;
  const totalConfirmed = guests.filter((g) => g.status === "confirmed").length;
  const totalDeclined = guests.filter((g) => g.status === "declined").length;
  const totalPending = guests.filter((g) => !["confirmed", "declined"].includes(g.status)).length;
  const totalGuests = guests.filter((g) => g.rsvp_attending === 1).reduce((s, g) => s + (g.rsvp_persons || 0), 0);
  const totalChurch = guests.filter((g) => g.rsvp_church).reduce((s, g) => s + (g.rsvp_persons || 0), 0);
  const totalParty = guests.filter((g) => g.rsvp_party).reduce((s, g) => s + (g.rsvp_persons || 0), 0);
  const totalAccommodation = guests.filter((g) => g.rsvp_accommodation).length;

  const allMenus = guests.filter((g) => g.rsvp_attending === 1).flatMap((g) => parseMenus(g.rsvp_menu));
  const totalVegetarian = allMenus.filter((m) => m === "vegetarian").length;
  const totalVegan = allMenus.filter((m) => m === "vegan").length;

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#F5F0EA] flex items-center justify-center px-4">
        <div className="fixed inset-6 sm:inset-10 border border-[#9B8557] pointer-events-none" />
        <div className="fixed inset-[30px] sm:inset-[46px] border border-[#9B8557] pointer-events-none" />

        <div className="max-w-sm w-full">
          <div className="bg-white rounded-sm shadow-sm p-10 gold-border">
          <div className="text-center mb-6">
            <CloverIcon className="h-7 w-7 text-[#C4BDB3]" />
          </div>
          <h1 className="font-playfair text-[#9B8557] text-3xl text-center mb-2">{t.title}</h1>
          <p className="font-lato text-[#7A7268] text-sm text-center mb-8">{t.subtitle}</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              className="w-full bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-3 font-lato text-[#4A4540] placeholder-[#7A7268] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#9B8557] mb-4 transition"
            />
            {authError && <p className="font-lato text-red-600 text-sm mb-3 text-center">{authError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#9B8557] text-white font-lato tracking-[0.2em] uppercase text-sm py-3 hover:bg-[#7A6B42] transition-colors font-bold disabled:opacity-60"
            >
              {loading ? t.checking : t.enter}
            </button>
          </form>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0EA] text-[#4A4540]">
      {/* Top Bar */}
      <div className="bg-white border-b border-[#9B8557] border-opacity-20 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-playfair text-[#9B8557] text-2xl">{t.title}</h1>
            <p className="font-lato text-[#7A7268] text-xs mt-0.5">{t.subtitle}</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center justify-end">
            <button onClick={fetchGuests} className="border border-[#9B8557] border-opacity-40 text-[#9B8557] font-lato text-xs px-4 py-2 rounded-sm hover:bg-[#9B8557] hover:text-white transition-colors">
              {t.refresh}
            </button>
            <button onClick={exportExcel} className="border border-[#9B8557] border-opacity-40 text-[#9B8557] font-lato text-xs px-4 py-2 rounded-sm hover:bg-[#9B8557] hover:text-white transition-colors">
              {t.exportExcel}
            </button>
            <Link href="/" className="border border-[#9B8557] border-opacity-40 text-[#9B8557] font-lato text-xs px-4 py-2 rounded-sm hover:bg-[#9B8557] hover:text-white transition-colors">
              {t.site}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: t.stats.totalInvitations, value: totalInvitations, color: "border-[#9B8557]" },
            { label: t.stats.confirmed, value: totalConfirmed, color: "border-green-600" },
            { label: t.stats.declined, value: totalDeclined, color: "border-red-600" },
            { label: t.stats.pending, value: totalPending, color: "border-yellow-600" },
            { label: t.stats.totalGuests, value: totalGuests, color: "border-[#9B8557]" },
            { label: t.stats.church, value: totalChurch, color: "border-purple-600" },
            { label: t.stats.party, value: totalParty, color: "border-pink-600" },
            { label: t.stats.accommodation, value: totalAccommodation, color: "border-blue-600" },
            { label: t.stats.vegetarian, value: totalVegetarian, color: "border-lime-600" },
            { label: t.stats.vegan, value: totalVegan, color: "border-emerald-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`bg-white ${color} border border-opacity-50 rounded-sm p-3 text-center shadow-sm`}>
              <div className="font-playfair text-2xl text-[#9B8557]">{value}</div>
              <div className="font-lato text-[#7A7268] text-[10px] mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("guests")}
            className={`font-lato text-sm px-6 py-2.5 rounded-sm transition-colors ${activeTab === "guests" ? "bg-[#9B8557] text-white font-bold" : "border border-[#9B8557] border-opacity-40 text-[#9B8557] hover:bg-[#9B8557] hover:text-white"}`}
          >
            {t.guestListTab(totalInvitations)}
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`font-lato text-sm px-6 py-2.5 rounded-sm transition-colors ${activeTab === "add" ? "bg-[#9B8557] text-white font-bold" : "border border-[#9B8557] border-opacity-40 text-[#9B8557] hover:bg-[#9B8557] hover:text-white"}`}
          >
            {t.addGuestTab}
          </button>
        </div>

        {/* Add Guest Tab */}
        {activeTab === "add" && (
          <div className="max-w-lg">
            <div className="bg-white rounded-sm p-6 gold-border shadow-sm">
              <h2 className="font-playfair text-[#9B8557] text-xl mb-6">{t.addGuestTitle}</h2>
              <form onSubmit={handleAddGuest} className="space-y-4">
                <div>
                  <label className="block font-lato text-[#9B8557] text-xs font-bold mb-1.5 tracking-[0.2em] uppercase">{t.guestNameLabel}</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={t.guestNamePlaceholder}
                    className="w-full bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-2.5 font-lato text-[#4A4540] text-sm placeholder-[#7A7268] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#9B8557] transition"
                  />
                </div>
                <div>
                  <label className="block font-lato text-[#9B8557] text-xs font-bold mb-1.5 tracking-widest uppercase">{t.phone}</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    className="w-full bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-2.5 font-lato text-[#4A4540] text-sm placeholder-[#7A7268] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#9B8557] transition"
                  />
                </div>
                <div>
                  <label className="block font-lato text-[#9B8557] text-xs font-bold mb-1.5 tracking-[0.2em] uppercase">{t.notes}</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder={t.notesPlaceholder}
                    rows={2}
                    className="w-full bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-2.5 font-lato text-[#4A4540] text-sm placeholder-[#7A7268] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#9B8557] transition resize-none"
                  />
                </div>

                {addSuccess && (
                  <div className="bg-green-50 border border-green-400 rounded-xl p-3 text-center">
                    <p className="font-lato text-green-700 text-sm font-bold">{addSuccess}</p>
                    <p className="font-lato text-green-600 text-xs mt-1 opacity-80">{t.addGuestHint}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={addLoading}
                  className="w-full bg-[#9B8557] text-white font-lato tracking-[0.2em] uppercase text-sm py-3 hover:bg-[#7A6B42] transition-colors font-bold disabled:opacity-60"
                >
                  {addLoading ? t.adding : t.addGuest}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Guests List Tab */}
        {activeTab === "guests" && (
          <>
            {/* Status Filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {[
                { key: "all" as const, label: t.all, count: totalInvitations },
                ...statusOrder.map((s) => ({
                  key: s,
                  label: statusConfig[s].label,
                  count: guests.filter((g) => g.status === s).length,
                })),
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={`font-lato text-xs px-3 py-1.5 rounded-sm transition-colors ${filterStatus === key ? "bg-[#9B8557] text-white font-bold" : "border border-[#9B8557] border-opacity-30 text-[#9B8557] hover:border-opacity-60"}`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-20 font-lato text-[#9B8557] opacity-60">{t.loading}</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 font-lato text-[#9B8557] opacity-40">
                {t.noGuests(filterStatus !== "all" ? statusConfig[filterStatus as GuestStatus]?.label : undefined)}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((g) => {
                  const isExpanded = expandedGuest === g.id;
                  const sc = statusConfig[g.status] || statusConfig.draft;
                  const menus = parseMenus(g.rsvp_menu);
                  const special = hasSpecialMenu(g.rsvp_menu);

                  return (
                    <div key={g.id} className="bg-white rounded-sm border border-[#9B8557] border-opacity-15 overflow-hidden shadow-sm">
                      {/* Guest Row Header */}
                      <div
                        className="flex items-center gap-2 sm:gap-3 px-4 py-3 cursor-pointer hover:bg-[#F5F0EA] transition-colors"
                        onClick={() => setExpandedGuest(isExpanded ? null : g.id)}
                      >
                        <span className="text-[#9B8557] text-xs opacity-60">{isExpanded ? "▼" : "▶"}</span>

                        {/* Status Badge */}
                        <span className={`hidden sm:inline-flex items-center text-[10px] px-2.5 py-0.5 rounded-full border font-lato font-bold shrink-0 ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>

                        {/* Name */}
                        <span className="font-lato text-[#4A4540] text-sm font-semibold flex-1 truncate">
                          {g.guest_name || "–"}
                        </span>

                        {/* Quick indicators: accommodation, special menu */}
                        {g.rsvp_attending === 1 && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            {g.rsvp_accommodation ? (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 border border-blue-400 text-blue-700" title={t.needsAccommodationTitle}>🏨</span>
                            ) : null}
                            {special ? (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-orange-50 border border-orange-400 text-orange-700" title={t.specialMenuTitle}>🥗</span>
                            ) : null}
                          </div>
                        )}

                        {/* Persons */}
                        {g.rsvp_persons ? (
                          <span className="font-lato text-[#9B8557] text-xs shrink-0">{g.rsvp_persons} {t.personsShort}</span>
                        ) : null}

                        {/* Quick RSVP indicator */}
                        {g.used ? (
                          <span className={`text-xs font-lato font-bold shrink-0 ${g.rsvp_attending === 1 ? "text-green-700" : "text-red-600"}`}>
                            {g.rsvp_attending === 1 ? t.attendingShort : t.notAttendingShort}
                          </span>
                        ) : (
                          <span className="text-xs font-lato text-gray-500 shrink-0">{t.unfilled}</span>
                        )}
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-[#9B8557] border-opacity-10 px-4 py-4 bg-[#F5F0EA]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Guest Info & Status Control */}
                            <div className="space-y-4">
                              <h4 className="font-lato text-[#9B8557] text-xs font-bold tracking-[0.2em] uppercase">{t.guestInfo}</h4>

                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="col-span-2">
                                  <span className="font-lato text-[#9B8557] text-xs opacity-60">{t.guestNameField}:</span>
                                  <input
                                    type="text"
                                    defaultValue={g.guest_name || ""}
                                    onBlur={(e) => updateGuestName(g.id, e.target.value, g.guest_name)}
                                    className="mt-1 w-full bg-white border border-[#9B8557] border-opacity-30 rounded-sm px-3 py-2 text-sm font-lato text-[#4A4540] focus:outline-none focus:ring-1 focus:ring-[#9B8557]"
                                  />
                                </div>
                                <div>
                                  <span className="font-lato text-[#9B8557] text-xs opacity-60">{t.phone}:</span>
                                  <p className="font-lato text-[#4A4540] text-sm">{g.phone || "–"}</p>
                                </div>
                                <div>
                                  <span className="font-lato text-[#9B8557] text-xs opacity-60">{t.created}:</span>
                                  <p className="font-lato text-[#4A4540] text-sm">{g.created_at?.split("T")[0] || g.created_at?.split(" ")[0]}</p>
                                </div>
                              </div>

                              {g.notes && (
                                <div>
                                  <span className="font-lato text-[#9B8557] text-xs opacity-60">{t.notes}:</span>
                                  <p className="font-lato text-[#4A4540] text-sm italic opacity-80">{g.notes}</p>
                                </div>
                              )}

                              {/* Status Changer */}
                              <div>
                                <span className="font-lato text-[#9B8557] text-xs font-bold tracking-[0.2em] uppercase block mb-2">{t.changeStatus}</span>
                                <div className="flex gap-1.5 flex-wrap">
                                  {statusOrder.map((s) => (
                                    <button
                                      key={s}
                                      onClick={() => updateStatus(g.id, s)}
                                      disabled={g.status === s}
                                      className={`font-lato text-[10px] px-2.5 py-1 rounded-sm border transition-colors ${g.status === s
                                        ? `${statusConfig[s].bg} ${statusConfig[s].color} font-bold`
                                        : "border-[#9B8557] border-opacity-20 text-[#4A4540] opacity-50 hover:opacity-100"
                                        }`}
                                    >
                                      {statusConfig[s].label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Table Assignment */}
                              <div>
                                <span className="font-lato text-[#9B8557] text-xs font-bold tracking-[0.2em] uppercase block mb-1.5">{t.table}</span>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min={1}
                                    placeholder={g.rsvp_table ? String(g.rsvp_table) : "–"}
                                    defaultValue={g.rsvp_table || ""}
                                    onBlur={(e) => updateTable(g.id, e.target.value)}
                                    className="w-20 bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-3 py-1.5 text-sm font-lato text-[#4A4540] focus:outline-none focus:ring-1 focus:ring-[#9B8557]"
                                  />
                                  {g.rsvp_table && <span className="font-lato text-[#9B8557] text-xs">{t.tableLabel(g.rsvp_table)}</span>}
                                </div>
                              </div>

                              {/* Delete */}
                              <button
                                onClick={() => deleteGuest(g.id)}
                                className="font-lato text-red-600 text-xs hover:text-red-500 transition-colors mt-2"
                              >
                                {t.deleteGuest}
                              </button>


                            </div>

                            {/* Right: RSVP Response */}
                            <div className="space-y-4">
                              <h4 className="font-lato text-[#9B8557] text-xs font-bold tracking-[0.2em] uppercase">{t.rsvpResponse}</h4>
                              {!g.used ? (
                                <p className="font-lato text-[#7A7268] text-sm italic">{t.noRsvpYet}</p>
                              ) : (
                                <div className="space-y-3 text-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <span className="font-lato text-[#9B8557] text-xs opacity-60">{t.filledName}:</span>
                                      <p className="font-lato text-[#4A4540]">{g.rsvp_name || "–"}</p>
                                      {g.rsvp_name && g.guest_name && g.rsvp_name.trim().toLowerCase() !== g.guest_name.trim().toLowerCase() && (
                                        <div className="mt-1 bg-yellow-50 border border-yellow-400 rounded-sm px-2 py-1">
                                          <p className="font-lato text-yellow-700 text-xs">
                                            {t.nameChanged}
                                          </p>
                                          <p className="font-lato text-[#7A7268] text-xs">
                                            {t.originalName} <span className="line-through">{g.guest_name}</span>
                                          </p>
                                          <p className="font-lato text-[#4A4540] text-xs font-bold">
                                            {t.newName} {g.rsvp_name}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <span className="font-lato text-[#9B8557] text-xs opacity-60">{t.attending}:</span>
                                      <p className={`font-lato font-bold ${g.rsvp_attending === 1 ? "text-green-700" : "text-red-600"}`}>
                                        {g.rsvp_attending === 1 ? t.yes : t.no}
                                      </p>
                                    </div>
                                    {g.rsvp_attending === 1 && (
                                      <>
                                        <div>
                                          <span className="font-lato text-[#9B8557] text-xs opacity-60">{t.persons}:</span>
                                          <p className="font-lato text-[#4A4540]">{g.rsvp_persons}</p>
                                        </div>
                                        <div>
                                          <span className="font-lato text-[#9B8557] text-xs opacity-60">{t.rsvpPhone}:</span>
                                          <p className="font-lato text-[#4A4540]">{g.rsvp_phone || "–"}</p>
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  {/* Accommodation - prominent */}
                                  {g.rsvp_attending === 1 && (
                                    <div className={`rounded-sm p-3 border ${g.rsvp_accommodation ? "bg-blue-50 border-blue-300" : "bg-[#F5F0EA] border-[#9B8557] border-opacity-10"}`}>
                                      <span className="font-lato text-[#9B8557] text-xs font-bold tracking-[0.2em] uppercase">{t.accommodation}:</span>
                                      <p className={`font-lato font-bold text-sm mt-0.5 ${g.rsvp_accommodation ? "text-blue-600" : "text-[#4A4540] opacity-60"}`}>
                                        {g.rsvp_accommodation ? t.accommodationYes : t.accommodationNo}
                                      </p>
                                    </div>
                                  )}

                                  {/* Per-person menu breakdown - prominent */}
                                  {g.rsvp_attending === 1 && menus.length > 0 && (
                                    <div className={`rounded-sm p-3 border ${special ? "bg-orange-50 border-orange-300" : "bg-[#F5F0EA] border-[#9B8557] border-opacity-10"}`}>
                                      <span className="font-lato text-[#9B8557] text-xs font-bold tracking-[0.2em] uppercase">
                                        {t.menuPerPerson} {special && <span className="text-orange-600 ml-1">{t.specialMenuWarning}</span>}
                                      </span>
                                      <div className="mt-2 space-y-1">
                                        {menus.map((m, i) => {
                                          const isSpecialItem = m !== "normal";
                                          return (
                                            <div key={i} className="flex items-center gap-2">
                                              <span className="font-lato text-[#9B8557] text-xs min-w-[80px]">{t.person} {i + 1}:</span>
                                              <span className={`font-lato text-sm font-semibold ${isSpecialItem ? "text-orange-600" : "text-[#4A4540]"}`}>
                                                {isSpecialItem && "🥗 "}{menuLabels[m] || m}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Church & Party */}
                                  {g.rsvp_attending === 1 && (
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="font-lato text-[#9B8557] text-xs opacity-60">{t.church}:</span>
                                        <p className="font-lato text-[#4A4540]">{g.rsvp_church ? `✓ ${t.yes}` : `✗ ${t.no}`}</p>
                                      </div>
                                      <div>
                                        <span className="font-lato text-[#9B8557] text-xs opacity-60">{t.party}:</span>
                                        <p className="font-lato text-[#4A4540]">{g.rsvp_party ? `✓ ${t.yes}` : `✗ ${t.no}`}</p>
                                      </div>
                                    </div>
                                  )}

                                  {g.rsvp_message && (
                                    <div>
                                      <span className="font-lato text-[#9B8557] text-xs opacity-60">{t.message}:</span>
                                      <p className="font-lato text-[#4A4540] text-sm italic bg-[#F5F0EA] rounded-sm p-2 mt-1">
                                        &ldquo;{g.rsvp_message}&rdquo;
                                      </p>
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-lato text-[#9B8557] text-xs opacity-60">{t.rsvpDate}:</span>
                                    <p className="font-lato text-[#4A4540] text-xs">{g.rsvp_date?.split("T")[0] || g.rsvp_date?.split(" ")[0] || "–"}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>


    </div>
  );
}
