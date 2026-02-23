"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { QRCodeSVG } from "qrcode.react";

type GuestStatus = "draft" | "invitation_sent" | "invitation_received" | "confirmed" | "declined";

interface InvitationCode {
  id: number;
  code: string;
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
  draft: { label: "Ciornă", color: "text-gray-400", bg: "bg-gray-800/50 border-gray-600" },
  invitation_sent: { label: "Invitație trimisă", color: "text-blue-400", bg: "bg-blue-900/30 border-blue-700" },
  invitation_received: { label: "Invitație primită", color: "text-yellow-400", bg: "bg-yellow-900/30 border-yellow-700" },
  confirmed: { label: "Confirmat", color: "text-green-400", bg: "bg-green-900/30 border-green-700" },
  declined: { label: "Refuzat", color: "text-red-400", bg: "bg-red-900/30 border-red-700" },
};

const statusOrder: GuestStatus[] = ["draft", "invitation_sent", "invitation_received", "confirmed", "declined"];

const menuLabels: Record<string, string> = {
  normal: "Normal",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
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
  const [qrGuest, setQrGuest] = useState<InvitationCode | null>(null);

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
        setAddSuccess(`Cod generat: ${data.code}`);
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
        "Cod Invitație": g.code,
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

  function downloadQR(guest: InvitationCode) {
    const svg = document.getElementById(`qr-modal-${guest.id}`) || document.getElementById(`qr-inline-${guest.id}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 480;
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 400, 480);
        ctx.drawImage(img, 50, 20, 300, 300);
        ctx.fillStyle = "#4A0B18";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(guest.guest_name || "Invitat", 200, 350);
        ctx.font = "14px monospace";
        ctx.fillStyle = "#6B1024";
        ctx.fillText(guest.code, 200, 375);
        ctx.font = "12px sans-serif";
        ctx.fillStyle = "#999";
        ctx.fillText("Scanează pentru confirmare RSVP", 200, 405);
        ctx.fillText("Alina & Gabriel – 26 Iulie 2026", 200, 425);
      }
      const link = document.createElement("a");
      link.download = `QR_${guest.guest_name || guest.code}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }

  function getRsvpUrl(code: string) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/rsvp?code=${encodeURIComponent(code)}`;
    }
    return `/rsvp?code=${encodeURIComponent(code)}`;
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
      <div className="min-h-screen bg-gradient-to-b from-[#3D0F1E] via-[#6B1024] to-[#2D0710] flex items-center justify-center px-4">
        <div className="fixed top-6 left-6 w-20 h-20 border-t-2 border-l-2 border-[#D4A843] opacity-30 rounded-tl-lg" />
        <div className="fixed top-6 right-6 w-20 h-20 border-t-2 border-r-2 border-[#D4A843] opacity-30 rounded-tr-lg" />
        <div className="fixed bottom-6 left-6 w-20 h-20 border-b-2 border-l-2 border-[#D4A843] opacity-30 rounded-bl-lg" />
        <div className="fixed bottom-6 right-6 w-20 h-20 border-b-2 border-r-2 border-[#D4A843] opacity-30 rounded-br-lg" />

        <div className="max-w-sm w-full bg-[#4A0B18] bg-opacity-80 rounded-3xl shadow-lg p-10 gold-border">
          <div className="text-center mb-6">
            <span className="text-[#D4A843] text-2xl">☘</span>
          </div>
          <h1 className="font-playfair shiny-gold text-3xl text-center mb-2">Panou Admin</h1>
          <p className="font-lato text-[#F5E6D3] text-sm text-center mb-8 opacity-70">Alina &amp; Gabriel – 26 Iulie 2026</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parolă"
              className="w-full bg-[#2D0710] border border-[#D4A843] border-opacity-40 rounded-xl px-4 py-3 font-lato text-[#F5E6D3] placeholder-[#F5E6D3] placeholder-opacity-30 focus:outline-none focus:ring-2 focus:ring-[#D4A843] mb-4 transition"
            />
            {authError && <p className="font-lato text-red-400 text-sm mb-3 text-center">{authError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4A843] text-[#4A0B18] font-lato tracking-widest uppercase text-sm py-3 rounded-full hover:bg-[#F0D78C] transition-colors font-bold disabled:opacity-60"
            >
              {loading ? "Se verifică..." : "Intră"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a0a10] text-[#F5E6D3]">
      {/* Top Bar */}
      <div className="bg-[#2D0710] border-b border-[#D4A843] border-opacity-20 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-playfair shiny-gold text-2xl">Panou Admin</h1>
            <p className="font-lato text-[#D4A843] text-xs opacity-70 mt-0.5">Alina &amp; Gabriel – 26 Iulie 2026</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={fetchGuests} className="border border-[#D4A843] border-opacity-40 text-[#D4A843] font-lato text-xs px-4 py-2 rounded-full hover:bg-[#D4A843] hover:text-[#4A0B18] transition-colors">
              ↻ Actualizează
            </button>
            <button onClick={exportExcel} className="border border-[#D4A843] border-opacity-40 text-[#D4A843] font-lato text-xs px-4 py-2 rounded-full hover:bg-[#D4A843] hover:text-[#4A0B18] transition-colors">
              📥 Export Excel
            </button>
            <Link href="/" className="border border-[#D4A843] border-opacity-40 text-[#D4A843] font-lato text-xs px-4 py-2 rounded-full hover:bg-[#D4A843] hover:text-[#4A0B18] transition-colors">
              🏠 Site
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Total invitații", value: totalInvitations, color: "border-[#D4A843]" },
            { label: "Confirmați", value: totalConfirmed, color: "border-green-600" },
            { label: "Refuzați", value: totalDeclined, color: "border-red-600" },
            { label: "În așteptare", value: totalPending, color: "border-yellow-600" },
            { label: "Total persoane", value: totalGuests, color: "border-[#D4A843]" },
            { label: "La biserică", value: totalChurch, color: "border-purple-600" },
            { label: "La petrecere", value: totalParty, color: "border-pink-600" },
            { label: "Cazare", value: totalAccommodation, color: "border-blue-600" },
            { label: "Meniu Vegetarian", value: totalVegetarian, color: "border-lime-600" },
            { label: "Meniu Vegan", value: totalVegan, color: "border-emerald-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`bg-[#2D0710] ${color} border border-opacity-50 rounded-xl p-3 text-center`}>
              <div className="font-playfair text-2xl text-[#F0D78C]">{value}</div>
              <div className="font-lato text-[#F5E6D3] text-[10px] opacity-60 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("guests")}
            className={`font-lato text-sm px-6 py-2.5 rounded-full transition-colors ${activeTab === "guests" ? "bg-[#D4A843] text-[#4A0B18] font-bold" : "border border-[#D4A843] border-opacity-40 text-[#D4A843] hover:bg-[#D4A843] hover:text-[#4A0B18]"}`}
          >
            👥 Lista Invitaților ({totalInvitations})
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`font-lato text-sm px-6 py-2.5 rounded-full transition-colors ${activeTab === "add" ? "bg-[#D4A843] text-[#4A0B18] font-bold" : "border border-[#D4A843] border-opacity-40 text-[#D4A843] hover:bg-[#D4A843] hover:text-[#4A0B18]"}`}
          >
            ➕ Adaugă Invitat
          </button>
        </div>

        {/* Add Guest Tab */}
        {activeTab === "add" && (
          <div className="max-w-lg">
            <div className="bg-[#2D0710] rounded-2xl p-6 gold-border">
              <h2 className="font-playfair shiny-gold text-xl mb-6">Adaugă Invitat Nou</h2>
              <form onSubmit={handleAddGuest} className="space-y-4">
                <div>
                  <label className="block font-lato text-[#D4A843] text-xs font-bold mb-1.5 tracking-widest uppercase">Numele invitatului *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="ex: Familie Popescu"
                    className="w-full bg-[#1a0a10] border border-[#D4A843] border-opacity-30 rounded-xl px-4 py-2.5 font-lato text-[#F5E6D3] text-sm placeholder-[#F5E6D3] placeholder-opacity-30 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition"
                  />
                </div>
                <div>
                  <label className="block font-lato text-[#D4A843] text-xs font-bold mb-1.5 tracking-widest uppercase">Telefon</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="07xx xxx xxx"
                    className="w-full bg-[#1a0a10] border border-[#D4A843] border-opacity-30 rounded-xl px-4 py-2.5 font-lato text-[#F5E6D3] text-sm placeholder-[#F5E6D3] placeholder-opacity-30 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition"
                  />
                </div>
                <div>
                  <label className="block font-lato text-[#D4A843] text-xs font-bold mb-1.5 tracking-widest uppercase">Note</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Note interne..."
                    rows={2}
                    className="w-full bg-[#1a0a10] border border-[#D4A843] border-opacity-30 rounded-xl px-4 py-2.5 font-lato text-[#F5E6D3] text-sm placeholder-[#F5E6D3] placeholder-opacity-30 focus:outline-none focus:ring-2 focus:ring-[#D4A843] transition resize-none"
                  />
                </div>

                {addSuccess && (
                  <div className="bg-green-900/30 border border-green-700 rounded-xl p-3 text-center">
                    <p className="font-lato text-green-400 text-sm font-bold">{addSuccess}</p>
                    <p className="font-lato text-green-300 text-xs mt-1 opacity-70">Scrieți acest cod pe invitația fizică</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={addLoading}
                  className="w-full bg-[#D4A843] text-[#4A0B18] font-lato tracking-widest uppercase text-sm py-3 rounded-full hover:bg-[#F0D78C] transition-colors font-bold disabled:opacity-60"
                >
                  {addLoading ? "Se generează..." : "Generează Invitație"}
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
                  className={`font-lato text-xs px-3 py-1.5 rounded-full transition-colors ${filterStatus === key ? "bg-[#D4A843] text-[#4A0B18] font-bold" : "border border-[#D4A843] border-opacity-30 text-[#D4A843] hover:border-opacity-60"}`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-20 font-lato text-[#D4A843] opacity-60">Se încarcă...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 font-lato text-[#D4A843] opacity-40">
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
                    <div key={g.id} className="bg-[#2D0710] rounded-xl border border-[#D4A843] border-opacity-15 overflow-hidden">
                      {/* Guest Row Header */}
                      <div
                        className="flex items-center gap-2 sm:gap-3 px-4 py-3 cursor-pointer hover:bg-[#4A0B18] hover:bg-opacity-30 transition-colors"
                        onClick={() => setExpandedGuest(isExpanded ? null : g.id)}
                      >
                        <span className="text-[#D4A843] text-xs opacity-60">{isExpanded ? "▼" : "▶"}</span>

                        {/* Status Badge */}
                        <span className={`hidden sm:inline-flex items-center text-[10px] px-2.5 py-0.5 rounded-full border font-lato font-bold shrink-0 ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>

                        {/* Name */}
                        <span className="font-lato text-[#F5E6D3] text-sm font-semibold flex-1 truncate">
                          {g.guest_name || "–"}
                        </span>

                        {/* Quick indicators: accommodation, special menu */}
                        {g.rsvp_attending === 1 && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            {g.rsvp_accommodation ? (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-900/40 border border-blue-700/50 text-blue-300" title="Nevoie de cazare">🏨</span>
                            ) : null}
                            {special ? (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-orange-900/40 border border-orange-700/50 text-orange-300" title="Meniu special">🥗</span>
                            ) : null}
                          </div>
                        )}

                        {/* Code */}
                        <span className="font-mono text-[#D4A843] text-xs bg-[#1a0a10] px-2 py-0.5 rounded tracking-wider shrink-0">
                          {g.code}
                        </span>

                        {/* QR Button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setQrGuest(g); }}
                          className="text-xs px-2 py-0.5 rounded bg-[#D4A843]/20 border border-[#D4A843]/40 text-[#D4A843] hover:bg-[#D4A843]/40 transition-colors shrink-0"
                          title="Arată QR Code"
                        >
                          📱 QR
                        </button>

                        {/* Persons */}
                        {g.rsvp_persons ? (
                          <span className="font-lato text-[#F0D78C] text-xs shrink-0">{g.rsvp_persons} pers.</span>
                        ) : null}

                        {/* Quick RSVP indicator */}
                        {g.used ? (
                          <span className={`text-xs font-lato font-bold shrink-0 ${g.rsvp_attending === 1 ? "text-green-400" : "text-red-400"}`}>
                            {g.rsvp_attending === 1 ? "✓ Participă" : "✗ Nu participă"}
                          </span>
                        ) : (
                          <span className="text-xs font-lato text-gray-500 shrink-0">Necompletat</span>
                        )}
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-[#D4A843] border-opacity-10 px-4 py-4 bg-[#1a0a10] bg-opacity-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Guest Info & Status Control */}
                            <div className="space-y-4">
                              <h4 className="font-lato text-[#D4A843] text-xs font-bold tracking-widest uppercase">Informații Invitat</h4>

                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="font-lato text-[#D4A843] text-xs opacity-60">Cod:</span>
                                  <p className="font-mono text-[#F0D78C] text-sm">{g.code}</p>
                                </div>
                                <div>
                                  <span className="font-lato text-[#D4A843] text-xs opacity-60">Telefon:</span>
                                  <p className="font-lato text-[#F5E6D3] text-sm">{g.phone || "–"}</p>
                                </div>
                                <div>
                                  <span className="font-lato text-[#D4A843] text-xs opacity-60">Creat:</span>
                                  <p className="font-lato text-[#F5E6D3] text-sm">{g.created_at?.split("T")[0] || g.created_at?.split(" ")[0]}</p>
                                </div>
                              </div>

                              {g.notes && (
                                <div>
                                  <span className="font-lato text-[#D4A843] text-xs opacity-60">Note:</span>
                                  <p className="font-lato text-[#F5E6D3] text-sm italic opacity-80">{g.notes}</p>
                                </div>
                              )}

                              {/* Status Changer */}
                              <div>
                                <span className="font-lato text-[#D4A843] text-xs font-bold tracking-widest uppercase block mb-2">Schimbă Status</span>
                                <div className="flex gap-1.5 flex-wrap">
                                  {statusOrder.map((s) => (
                                    <button
                                      key={s}
                                      onClick={() => updateStatus(g.id, s)}
                                      disabled={g.status === s}
                                      className={`font-lato text-[10px] px-2.5 py-1 rounded-full border transition-colors ${g.status === s
                                        ? `${statusConfig[s].bg} ${statusConfig[s].color} font-bold`
                                        : "border-[#D4A843] border-opacity-20 text-[#F5E6D3] opacity-50 hover:opacity-100"
                                        }`}
                                    >
                                      {statusConfig[s].label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Table Assignment */}
                              <div>
                                <span className="font-lato text-[#D4A843] text-xs font-bold tracking-widest uppercase block mb-1.5">Masă</span>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min={1}
                                    placeholder={g.rsvp_table ? String(g.rsvp_table) : "–"}
                                    defaultValue={g.rsvp_table || ""}
                                    onBlur={(e) => updateTable(g.id, e.target.value)}
                                    className="w-20 bg-[#2D0710] border border-[#D4A843] border-opacity-30 rounded-lg px-3 py-1.5 text-sm font-lato text-[#F5E6D3] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
                                  />
                                  {g.rsvp_table && <span className="font-lato text-[#F0D78C] text-xs">Masa {g.rsvp_table}</span>}
                                </div>
                              </div>

                              {/* Delete */}
                              <button
                                onClick={() => deleteGuest(g.id)}
                                className="font-lato text-red-400 text-xs hover:text-red-300 transition-colors mt-2"
                              >
                                🗑 Șterge invitatul
                              </button>

                              {/* QR Code inline */}
                              <div className="mt-4 pt-4 border-t border-[#D4A843] border-opacity-10">
                                <span className="font-lato text-[#D4A843] text-xs font-bold tracking-widest uppercase block mb-2">QR Code</span>
                                <div className="bg-white rounded-xl p-3 inline-block">
                                  <QRCodeSVG
                                    id={`qr-inline-${g.id}`}
                                    value={getRsvpUrl(g.code)}
                                    size={120}
                                    bgColor="#FFFFFF"
                                    fgColor="#4A0B18"
                                    level="M"
                                  />
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => setQrGuest(g)}
                                    className="font-lato text-[#D4A843] text-xs hover:text-[#F0D78C] transition-colors"
                                  >
                                    🔍 Mărește
                                  </button>
                                  <button
                                    onClick={() => downloadQR(g)}
                                    className="font-lato text-[#D4A843] text-xs hover:text-[#F0D78C] transition-colors"
                                  >
                                    💾 Descarcă PNG
                                  </button>
                                </div>
                              </div>

                              {/* Delete */}
                              <button
                                onClick={() => deleteGuest(g.id)}
                                className="font-lato text-red-400 text-xs hover:text-red-300 transition-colors mt-2"
                              >
                                🗑 Șterge invitatul
                              </button>
                            </div>

                            {/* Right: RSVP Response */}
                            <div className="space-y-4">
                              <h4 className="font-lato text-[#D4A843] text-xs font-bold tracking-widest uppercase">Răspuns RSVP</h4>
                              {!g.used ? (
                                <p className="font-lato text-[#F5E6D3] text-sm opacity-40 italic">Invitatul nu a completat formularul RSVP încă.</p>
                              ) : (
                                <div className="space-y-3 text-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <span className="font-lato text-[#D4A843] text-xs opacity-60">Nume completat:</span>
                                      <p className="font-lato text-[#F5E6D3]">{g.rsvp_name || "–"}</p>
                                    </div>
                                    <div>
                                      <span className="font-lato text-[#D4A843] text-xs opacity-60">Participă:</span>
                                      <p className={`font-lato font-bold ${g.rsvp_attending === 1 ? "text-green-400" : "text-red-400"}`}>
                                        {g.rsvp_attending === 1 ? "Da" : "Nu"}
                                      </p>
                                    </div>
                                    {g.rsvp_attending === 1 && (
                                      <>
                                        <div>
                                          <span className="font-lato text-[#D4A843] text-xs opacity-60">Nr. persoane:</span>
                                          <p className="font-lato text-[#F5E6D3]">{g.rsvp_persons}</p>
                                        </div>
                                        <div>
                                          <span className="font-lato text-[#D4A843] text-xs opacity-60">Telefon RSVP:</span>
                                          <p className="font-lato text-[#F5E6D3]">{g.rsvp_phone || "–"}</p>
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  {/* Accommodation - prominent */}
                                  {g.rsvp_attending === 1 && (
                                    <div className={`rounded-lg p-3 border ${g.rsvp_accommodation ? "bg-blue-900/20 border-blue-700/50" : "bg-[#2D0710] border-[#D4A843] border-opacity-10"}`}>
                                      <span className="font-lato text-[#D4A843] text-xs font-bold tracking-widest uppercase">Cazare:</span>
                                      <p className={`font-lato font-bold text-sm mt-0.5 ${g.rsvp_accommodation ? "text-blue-300" : "text-[#F5E6D3] opacity-60"}`}>
                                        {g.rsvp_accommodation ? "🏨 DA – Au nevoie de cazare" : "Nu au nevoie de cazare"}
                                      </p>
                                    </div>
                                  )}

                                  {/* Per-person menu breakdown - prominent */}
                                  {g.rsvp_attending === 1 && menus.length > 0 && (
                                    <div className={`rounded-lg p-3 border ${special ? "bg-orange-900/20 border-orange-700/50" : "bg-[#2D0710] border-[#D4A843] border-opacity-10"}`}>
                                      <span className="font-lato text-[#D4A843] text-xs font-bold tracking-widest uppercase">
                                        Meniu per persoană {special && <span className="text-orange-400 ml-1">⚠ MENIU SPECIAL</span>}
                                      </span>
                                      <div className="mt-2 space-y-1">
                                        {menus.map((m, i) => {
                                          const isSpecialItem = m !== "normal";
                                          return (
                                            <div key={i} className="flex items-center gap-2">
                                              <span className="font-lato text-[#F0D78C] text-xs min-w-[80px]">Persoana {i + 1}:</span>
                                              <span className={`font-lato text-sm font-semibold ${isSpecialItem ? "text-orange-300" : "text-[#F5E6D3]"}`}>
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
                                        <span className="font-lato text-[#D4A843] text-xs opacity-60">Biserică:</span>
                                        <p className="font-lato text-[#F5E6D3]">{g.rsvp_church ? "✓ Da" : "✗ Nu"}</p>
                                      </div>
                                      <div>
                                        <span className="font-lato text-[#D4A843] text-xs opacity-60">Petrecere:</span>
                                        <p className="font-lato text-[#F5E6D3]">{g.rsvp_party ? "✓ Da" : "✗ Nu"}</p>
                                      </div>
                                    </div>
                                  )}

                                  {g.rsvp_message && (
                                    <div>
                                      <span className="font-lato text-[#D4A843] text-xs opacity-60">Mesaj:</span>
                                      <p className="font-lato text-[#F5E6D3] text-sm italic bg-[#2D0710] rounded-lg p-2 mt-1">
                                        &ldquo;{g.rsvp_message}&rdquo;
                                      </p>
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-lato text-[#D4A843] text-xs opacity-60">Data RSVP:</span>
                                    <p className="font-lato text-[#F5E6D3] text-xs">{g.rsvp_date?.split("T")[0] || g.rsvp_date?.split(" ")[0] || "–"}</p>
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

      {/* QR Code Modal */}
      {qrGuest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" onClick={() => setQrGuest(null)}>
          <div className="bg-[#2D0710] rounded-3xl p-8 gold-border max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-playfair shiny-gold text-xl mb-1">{qrGuest.guest_name || "Invitat"}</h3>
            <p className="font-mono text-[#D4A843] text-sm mb-4 tracking-widest">{qrGuest.code}</p>

            <div className="bg-white rounded-2xl p-6 inline-block mb-4">
              <QRCodeSVG
                id={`qr-modal-${qrGuest.id}`}
                value={getRsvpUrl(qrGuest.code)}
                size={220}
                bgColor="#FFFFFF"
                fgColor="#4A0B18"
                level="M"
              />
            </div>

            <p className="font-lato text-[#F5E6D3] text-xs opacity-60 mb-1">Scanează pentru confirmare RSVP</p>
            <p className="font-lato text-[#D4A843] text-xs opacity-40 mb-6 break-all">{getRsvpUrl(qrGuest.code)}</p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { if (qrGuest) downloadQR(qrGuest); }}
                className="bg-[#D4A843] text-[#4A0B18] font-lato tracking-widest uppercase text-xs px-6 py-2.5 rounded-full hover:bg-[#F0D78C] transition-colors font-bold"
              >
                💾 Descarcă PNG
              </button>
              <button
                onClick={() => setQrGuest(null)}
                className="border border-[#D4A843] border-opacity-40 text-[#D4A843] font-lato text-xs px-6 py-2.5 rounded-full hover:bg-[#D4A843] hover:text-[#4A0B18] transition-colors"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
