"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";

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

const statusConfig: Record<GuestStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Ciornă", color: "text-gray-600", bg: "bg-gray-100 border-gray-400" },
  invitation_sent: { label: "Invitație trimisă", color: "text-blue-700", bg: "bg-blue-50 border-blue-400" },
  invitation_received: { label: "Invitație primită", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-500" },
  confirmed: { label: "Confirmat", color: "text-green-700", bg: "bg-green-50 border-green-500" },
  declined: { label: "Refuzat", color: "text-red-700", bg: "bg-red-50 border-red-500" },
};

const statusOrder: GuestStatus[] = ["draft", "invitation_sent", "invitation_received", "confirmed", "declined"];

const menuLabels: Record<string, string> = {
  normal: "Normal",
  "vegetarian-cu-peste": "Vegetarian cu pește",
  "vegetarian-fara-peste": "Vegetarian fără pește",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  copii: "Meniu copii",
};

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
      else setAuthError("Parolă incorectă.");
    } catch { setAuthError("Eroare de conexiune."); }
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
      const data = await res.json();
      if (res.ok) {
        setAddSuccess(`Invitatul "${newName}" a fost adăugat cu succes!`);
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
    if (!confirm("Sigur doriți să ștergeți acest invitat și toate datele asociate?")) return;
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

  function exportExcel() {
    const rows = guests.map((g) => {
      const menus = parseMenus(g.rsvp_menu);
      const menuPerPerson: Record<string, string> = {};
      menus.forEach((m, i) => {
        menuPerPerson[`Meniu Persoana ${i + 1}`] = menuLabels[m] || m;
      });
      const special = menus.some((m) => m !== "normal");

      return {
        "Nume Invitat": g.guest_name || "",
        "Status": statusConfig[g.status]?.label || g.status,
        "Telefon": g.phone || "",
        "Participă": g.rsvp_attending === 1 ? "Da" : g.rsvp_attending === 0 ? "Nu" : "Necompletat",
        "Nr. Persoane": g.rsvp_persons || "",
        "Cazare": g.rsvp_accommodation ? "DA" : g.rsvp_attending === 1 ? "Nu" : "",
        "Meniu Special": special ? "DA" : g.rsvp_attending === 1 ? "Nu" : "",
        ...menuPerPerson,
        "Biserică": g.rsvp_church ? "Da" : g.rsvp_attending === 1 ? "Nu" : "",
        "Petrecere": g.rsvp_party ? "Da" : g.rsvp_attending === 1 ? "Nu" : "",
        "Masă": g.rsvp_table || "",
        "Telefon RSVP": g.rsvp_phone || "",
        "Mesaj": g.rsvp_message || "",
        "Data RSVP": g.rsvp_date?.split("T")[0] || g.rsvp_date?.split(" ")[0] || "",
        "Note Admin": g.notes || "",
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
    XLSX.utils.book_append_sheet(wb, ws, "Invitați");

    // Stats sheet
    const confirmed = guests.filter((g) => g.rsvp_attending === 1);
    const statsRows = [
      { "Statistică": "Total invitații", "Valoare": guests.length },
      { "Statistică": "Confirmați", "Valoare": guests.filter((g) => g.status === "confirmed").length },
      { "Statistică": "Refuzați", "Valoare": guests.filter((g) => g.status === "declined").length },
      { "Statistică": "În așteptare", "Valoare": guests.filter((g) => !["confirmed", "declined"].includes(g.status)).length },
      { "Statistică": "Total persoane confirmate", "Valoare": confirmed.reduce((s, g) => s + (g.rsvp_persons || 0), 0) },
      { "Statistică": "Persoane la biserică", "Valoare": guests.filter((g) => g.rsvp_church).reduce((s, g) => s + (g.rsvp_persons || 0), 0) },
      { "Statistică": "Persoane la petrecere", "Valoare": guests.filter((g) => g.rsvp_party).reduce((s, g) => s + (g.rsvp_persons || 0), 0) },
      { "Statistică": "Au nevoie de cazare", "Valoare": guests.filter((g) => g.rsvp_accommodation).length },
      { "Statistică": "Meniu Vegetarian (persoane)", "Valoare": confirmed.reduce((s, g) => s + parseMenus(g.rsvp_menu).filter((m) => m === "vegetarian").length, 0) },
      { "Statistică": "Meniu Vegan (persoane)", "Valoare": confirmed.reduce((s, g) => s + parseMenus(g.rsvp_menu).filter((m) => m === "vegan").length, 0) },
      { "Statistică": "Meniu Normal (persoane)", "Valoare": confirmed.reduce((s, g) => s + parseMenus(g.rsvp_menu).filter((m) => m === "normal").length, 0) },
    ];
    const wsStats = XLSX.utils.json_to_sheet(statsRows);
    wsStats["!cols"] = [{ wch: 30 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsStats, "Statistici");

    XLSX.writeFile(wb, "invitati_nunta_alina_gabriel.xlsx");
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

        <div className="max-w-sm w-full bg-white rounded-sm shadow-sm p-10 gold-border">
          <div className="text-center mb-6">
            <span className="text-[#C4BDB3] text-2xl">☘</span>
          </div>
          <h1 className="font-playfair text-[#9B8557] text-3xl text-center mb-2">Panou Admin</h1>
          <p className="font-lato text-[#7A7268] text-sm text-center mb-8">Alina &amp; Gabriel – 26 Iulie 2026</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parolă"
              className="w-full bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-3 font-lato text-[#4A4540] placeholder-[#7A7268] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#9B8557] mb-4 transition"
            />
            {authError && <p className="font-lato text-red-600 text-sm mb-3 text-center">{authError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#9B8557] text-white font-lato tracking-[0.2em] uppercase text-sm py-3 hover:bg-[#7A6B42] transition-colors font-bold disabled:opacity-60"
            >
              {loading ? "Se verifică..." : "Intră"}
            </button>
          </form>
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
            <h1 className="font-playfair text-[#9B8557] text-2xl">Panou Admin</h1>
            <p className="font-lato text-[#7A7268] text-xs mt-0.5">Alina &amp; Gabriel – 26 Iulie 2026</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={fetchGuests} className="border border-[#9B8557] border-opacity-40 text-[#9B8557] font-lato text-xs px-4 py-2 rounded-sm hover:bg-[#9B8557] hover:text-white transition-colors">
              ↻ Actualizează
            </button>
            <button onClick={exportExcel} className="border border-[#9B8557] border-opacity-40 text-[#9B8557] font-lato text-xs px-4 py-2 rounded-sm hover:bg-[#9B8557] hover:text-white transition-colors">
              📥 Export Excel
            </button>
            <Link href="/" className="border border-[#9B8557] border-opacity-40 text-[#9B8557] font-lato text-xs px-4 py-2 rounded-sm hover:bg-[#9B8557] hover:text-white transition-colors">
              🏠 Site
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total invitații", value: totalInvitations, color: "border-[#9B8557]" },
            { label: "Confirmați", value: totalConfirmed, color: "border-green-600" },
            { label: "Refuzați", value: totalDeclined, color: "border-red-600" },
            { label: "În așteptare", value: totalPending, color: "border-yellow-600" },
            { label: "Total persoane", value: totalGuests, color: "border-[#9B8557]" },
            { label: "La biserică", value: totalChurch, color: "border-purple-600" },
            { label: "La petrecere", value: totalParty, color: "border-pink-600" },
            { label: "Cazare", value: totalAccommodation, color: "border-blue-600" },
            { label: "Meniu Vegetarian", value: totalVegetarian, color: "border-lime-600" },
            { label: "Meniu Vegan", value: totalVegan, color: "border-emerald-600" },
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
            👥 Lista Invitaților ({totalInvitations})
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`font-lato text-sm px-6 py-2.5 rounded-sm transition-colors ${activeTab === "add" ? "bg-[#9B8557] text-white font-bold" : "border border-[#9B8557] border-opacity-40 text-[#9B8557] hover:bg-[#9B8557] hover:text-white"}`}
          >
            ➕ Adaugă Invitat
          </button>
        </div>

        {/* Add Guest Tab */}
        {activeTab === "add" && (
          <div className="max-w-lg">
            <div className="bg-white rounded-sm p-6 gold-border shadow-sm">
              <h2 className="font-playfair text-[#9B8557] text-xl mb-6">Adaugă Invitat Nou</h2>
              <form onSubmit={handleAddGuest} className="space-y-4">
                <div>
                  <label className="block font-lato text-[#9B8557] text-xs font-bold mb-1.5 tracking-[0.2em] uppercase">Numele invitatului *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="ex: Gabriel Molocea sau Familia Molocea"
                    className="w-full bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-2.5 font-lato text-[#4A4540] text-sm placeholder-[#7A7268] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#9B8557] transition"
                  />
                </div>
                <div>
                  <label className="block font-lato text-[#9B8557] text-xs font-bold mb-1.5 tracking-widest uppercase">Telefon</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="07xx xxx xxx"
                    className="w-full bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-2.5 font-lato text-[#4A4540] text-sm placeholder-[#7A7268] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#9B8557] transition"
                  />
                </div>
                <div>
                  <label className="block font-lato text-[#9B8557] text-xs font-bold mb-1.5 tracking-[0.2em] uppercase">Note</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Note interne..."
                    rows={2}
                    className="w-full bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-4 py-2.5 font-lato text-[#4A4540] text-sm placeholder-[#7A7268] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#9B8557] transition resize-none"
                  />
                </div>

                {addSuccess && (
                  <div className="bg-green-50 border border-green-400 rounded-xl p-3 text-center">
                    <p className="font-lato text-green-700 text-sm font-bold">{addSuccess}</p>
                    <p className="font-lato text-green-600 text-xs mt-1 opacity-80">Invitatul își va putea confirma prezența căutându-și numele</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={addLoading}
                  className="w-full bg-[#9B8557] text-white font-lato tracking-[0.2em] uppercase text-sm py-3 hover:bg-[#7A6B42] transition-colors font-bold disabled:opacity-60"
                >
                  {addLoading ? "Se adaugă..." : "Adaugă Invitat"}
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
                { key: "all" as const, label: "Toți", count: totalInvitations },
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
              <div className="text-center py-20 font-lato text-[#9B8557] opacity-60">Se încarcă...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 font-lato text-[#9B8557] opacity-40">
                Nu există invitați{filterStatus !== "all" ? ` cu statusul "${statusConfig[filterStatus as GuestStatus]?.label}"` : ""}.
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
                              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 border border-blue-400 text-blue-700" title="Nevoie de cazare">🏨</span>
                            ) : null}
                            {special ? (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-orange-50 border border-orange-400 text-orange-700" title="Meniu special">🥗</span>
                            ) : null}
                          </div>
                        )}

                        {/* Persons */}
                        {g.rsvp_persons ? (
                          <span className="font-lato text-[#9B8557] text-xs shrink-0">{g.rsvp_persons} pers.</span>
                        ) : null}

                        {/* Quick RSVP indicator */}
                        {g.used ? (
                          <span className={`text-xs font-lato font-bold shrink-0 ${g.rsvp_attending === 1 ? "text-green-700" : "text-red-600"}`}>
                            {g.rsvp_attending === 1 ? "✓ Participă" : "✗ Nu participă"}
                          </span>
                        ) : (
                          <span className="text-xs font-lato text-gray-500 shrink-0">Necompletat</span>
                        )}
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-[#9B8557] border-opacity-10 px-4 py-4 bg-[#F5F0EA]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Guest Info & Status Control */}
                            <div className="space-y-4">
                              <h4 className="font-lato text-[#9B8557] text-xs font-bold tracking-[0.2em] uppercase">Informații Invitat</h4>

                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="font-lato text-[#9B8557] text-xs opacity-60">Telefon:</span>
                                  <p className="font-lato text-[#4A4540] text-sm">{g.phone || "–"}</p>
                                </div>
                                <div>
                                  <span className="font-lato text-[#9B8557] text-xs opacity-60">Creat:</span>
                                  <p className="font-lato text-[#4A4540] text-sm">{g.created_at?.split("T")[0] || g.created_at?.split(" ")[0]}</p>
                                </div>
                              </div>

                              {g.notes && (
                                <div>
                                  <span className="font-lato text-[#9B8557] text-xs opacity-60">Note:</span>
                                  <p className="font-lato text-[#4A4540] text-sm italic opacity-80">{g.notes}</p>
                                </div>
                              )}

                              {/* Status Changer */}
                              <div>
                                <span className="font-lato text-[#9B8557] text-xs font-bold tracking-[0.2em] uppercase block mb-2">Schimbă Status</span>
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
                                <span className="font-lato text-[#9B8557] text-xs font-bold tracking-[0.2em] uppercase block mb-1.5">Masă</span>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min={1}
                                    placeholder={g.rsvp_table ? String(g.rsvp_table) : "–"}
                                    defaultValue={g.rsvp_table || ""}
                                    onBlur={(e) => updateTable(g.id, e.target.value)}
                                    className="w-20 bg-[#F5F0EA] border border-[#9B8557] border-opacity-30 rounded-sm px-3 py-1.5 text-sm font-lato text-[#4A4540] focus:outline-none focus:ring-1 focus:ring-[#9B8557]"
                                  />
                                  {g.rsvp_table && <span className="font-lato text-[#9B8557] text-xs">Masa {g.rsvp_table}</span>}
                                </div>
                              </div>

                              {/* Delete */}
                              <button
                                onClick={() => deleteGuest(g.id)}
                                className="font-lato text-red-600 text-xs hover:text-red-500 transition-colors mt-2"
                              >
                                🗑 Șterge invitatul
                              </button>


                            </div>

                            {/* Right: RSVP Response */}
                            <div className="space-y-4">
                              <h4 className="font-lato text-[#9B8557] text-xs font-bold tracking-[0.2em] uppercase">Răspuns RSVP</h4>
                              {!g.used ? (
                                <p className="font-lato text-[#7A7268] text-sm italic">Invitatul nu a completat formularul RSVP încă.</p>
                              ) : (
                                <div className="space-y-3 text-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <span className="font-lato text-[#9B8557] text-xs opacity-60">Nume completat:</span>
                                      <p className="font-lato text-[#4A4540]">{g.rsvp_name || "–"}</p>
                                      {g.rsvp_name && g.guest_name && g.rsvp_name.trim().toLowerCase() !== g.guest_name.trim().toLowerCase() && (
                                        <div className="mt-1 bg-yellow-50 border border-yellow-400 rounded-sm px-2 py-1">
                                          <p className="font-lato text-yellow-700 text-xs">
                                            ✎ Numele a fost modificat
                                          </p>
                                          <p className="font-lato text-[#7A7268] text-xs">
                                            Nume original: <span className="line-through">{g.guest_name}</span>
                                          </p>
                                          <p className="font-lato text-[#4A4540] text-xs font-bold">
                                            Nume nou: {g.rsvp_name}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <span className="font-lato text-[#9B8557] text-xs opacity-60">Participă:</span>
                                      <p className={`font-lato font-bold ${g.rsvp_attending === 1 ? "text-green-700" : "text-red-600"}`}>
                                        {g.rsvp_attending === 1 ? "Da" : "Nu"}
                                      </p>
                                    </div>
                                    {g.rsvp_attending === 1 && (
                                      <>
                                        <div>
                                          <span className="font-lato text-[#9B8557] text-xs opacity-60">Nr. persoane:</span>
                                          <p className="font-lato text-[#4A4540]">{g.rsvp_persons}</p>
                                        </div>
                                        <div>
                                          <span className="font-lato text-[#9B8557] text-xs opacity-60">Telefon RSVP:</span>
                                          <p className="font-lato text-[#4A4540]">{g.rsvp_phone || "–"}</p>
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  {/* Accommodation - prominent */}
                                  {g.rsvp_attending === 1 && (
                                    <div className={`rounded-sm p-3 border ${g.rsvp_accommodation ? "bg-blue-50 border-blue-300" : "bg-[#F5F0EA] border-[#9B8557] border-opacity-10"}`}>
                                      <span className="font-lato text-[#9B8557] text-xs font-bold tracking-[0.2em] uppercase">Cazare:</span>
                                      <p className={`font-lato font-bold text-sm mt-0.5 ${g.rsvp_accommodation ? "text-blue-600" : "text-[#4A4540] opacity-60"}`}>
                                        {g.rsvp_accommodation ? "🏨 DA – Au nevoie de cazare" : "Nu au nevoie de cazare"}
                                      </p>
                                    </div>
                                  )}

                                  {/* Per-person menu breakdown - prominent */}
                                  {g.rsvp_attending === 1 && menus.length > 0 && (
                                    <div className={`rounded-sm p-3 border ${special ? "bg-orange-50 border-orange-300" : "bg-[#F5F0EA] border-[#9B8557] border-opacity-10"}`}>
                                      <span className="font-lato text-[#9B8557] text-xs font-bold tracking-[0.2em] uppercase">
                                        Meniu per persoană {special && <span className="text-orange-600 ml-1">⚠ MENIU SPECIAL</span>}
                                      </span>
                                      <div className="mt-2 space-y-1">
                                        {menus.map((m, i) => {
                                          const isSpecialItem = m !== "normal";
                                          return (
                                            <div key={i} className="flex items-center gap-2">
                                              <span className="font-lato text-[#9B8557] text-xs min-w-[80px]">Persoana {i + 1}:</span>
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
                                        <span className="font-lato text-[#9B8557] text-xs opacity-60">Biserică:</span>
                                        <p className="font-lato text-[#4A4540]">{g.rsvp_church ? "✓ Da" : "✗ Nu"}</p>
                                      </div>
                                      <div>
                                        <span className="font-lato text-[#9B8557] text-xs opacity-60">Petrecere:</span>
                                        <p className="font-lato text-[#4A4540]">{g.rsvp_party ? "✓ Da" : "✗ Nu"}</p>
                                      </div>
                                    </div>
                                  )}

                                  {g.rsvp_message && (
                                    <div>
                                      <span className="font-lato text-[#9B8557] text-xs opacity-60">Mesaj:</span>
                                      <p className="font-lato text-[#4A4540] text-sm italic bg-[#F5F0EA] rounded-sm p-2 mt-1">
                                        &ldquo;{g.rsvp_message}&rdquo;
                                      </p>
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-lato text-[#9B8557] text-xs opacity-60">Data RSVP:</span>
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
