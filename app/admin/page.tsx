"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface RSVP {
  id: number;
  name: string;
  attending: number;
  num_persons: number;
  menu_preferences: string;
  need_accommodation: number;
  attending_church: number;
  attending_party: number;
  phone: string | null;
  message: string | null;
  table_number: number | null;
  created_at: string;
}

const menuLabels: Record<string, string> = {
  normal: "Normal",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableInputs, setTableInputs] = useState<Record<number, string>>({});

  const fetchRSVPs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rsvp");
      const data = await res.json();
      setRsvps(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchRSVPs();
  }, [authenticated, fetchRSVPs]);

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
      if (res.ok) {
        setAuthenticated(true);
      } else {
        setAuthError("Parolă incorectă.");
      }
    } catch {
      setAuthError("Eroare de conexiune. Încercați din nou.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Sigur doriți să ștergeți această înregistrare?")) return;
    await fetch(`/api/rsvp/${id}`, { method: "DELETE" });
    fetchRSVPs();
  }

  async function handleAssignTable(id: number) {
    const tableNum = tableInputs[id];
    if (!tableNum) return;
    await fetch(`/api/rsvp/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table_number: parseInt(tableNum) }),
    });
    setTableInputs((prev) => ({ ...prev, [id]: "" }));
    fetchRSVPs();
  }

  function exportCSV() {
    const headers = ["ID", "Nume", "Participă", "Persoane", "Meniu", "Cazare", "Biserică", "Petrecere", "Telefon", "Masă", "Data"];
    const rows = rsvps.map((r) => {
      const menus = (() => {
        try { return (JSON.parse(r.menu_preferences) as string[]).map((m) => menuLabels[m] || m).join("; "); }
        catch { return r.menu_preferences; }
      })();
      return [
        r.id,
        `"${r.name}"`,
        r.attending ? "Da" : "Nu",
        r.num_persons,
        `"${menus}"`,
        r.need_accommodation ? "Da" : "Nu",
        r.attending_church ? "Da" : "Nu",
        r.attending_party ? "Da" : "Nu",
        r.phone || "",
        r.table_number || "",
        r.created_at,
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rsvp_nunta_alina_gabi.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  // Stats
  const attending = rsvps.filter((r) => r.attending);
  const totalGuests = attending.reduce((s, r) => s + r.num_persons, 0);
  const menuCounts = { normal: 0, vegetarian: 0, vegan: 0 };
  attending.forEach((r) => {
    try {
      (JSON.parse(r.menu_preferences) as string[]).forEach((m) => {
        if (m in menuCounts) menuCounts[m as keyof typeof menuCounts]++;
      });
    } catch { /* noop */ }
  });
  const accommodationCount = attending.filter((r) => r.need_accommodation).length;
  const churchCount = attending.filter((r) => r.attending_church).reduce((s, r) => s + r.num_persons, 0);
  const partyCount = attending.filter((r) => r.attending_party).reduce((s, r) => s + r.num_persons, 0);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-3xl shadow-lg p-10 border border-rose-100">
          <h1 className="font-playfair text-3xl text-[#3d2b1f] text-center mb-2">Admin</h1>
          <p className="font-lato text-[#5c4033] text-sm text-center mb-8">Alina &amp; Gabi – Nuntă 2025</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parolă"
              className="w-full border border-rose-200 rounded-xl px-4 py-3 font-lato text-[#3d2b1f] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#b76e79] mb-4 transition"
            />
            {authError && <p className="font-lato text-red-500 text-sm mb-3 text-center">{authError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#b76e79] text-white font-lato tracking-widest uppercase text-sm py-3 rounded-full hover:bg-[#a05c67] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Se verifică..." : "Intră"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-playfair text-3xl text-[#3d2b1f]">Panou Admin</h1>
            <p className="font-lato text-[#5c4033] text-sm mt-1">Alina &amp; Gabi – 16 August 2025</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={fetchRSVPs}
              className="border border-[#87a878] text-[#87a878] font-lato text-sm px-5 py-2 rounded-full hover:bg-green-50 transition-colors"
            >
              Actualizează
            </button>
            <button
              onClick={exportCSV}
              className="bg-[#87a878] text-white font-lato text-sm px-5 py-2 rounded-full hover:bg-[#6d8f60] transition-colors"
            >
              Export CSV
            </button>
            <Link
              href="/"
              className="border border-rose-200 text-[#b76e79] font-lato text-sm px-5 py-2 rounded-full hover:bg-rose-50 transition-colors"
            >
              Site principal
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Total RSVP-uri", value: rsvps.length, color: "bg-rose-50 border-rose-200" },
            { label: "Total invitați", value: totalGuests, color: "bg-amber-50 border-amber-200" },
            { label: "Meniu normal", value: menuCounts.normal, color: "bg-orange-50 border-orange-200" },
            { label: "Vegetarian", value: menuCounts.vegetarian, color: "bg-green-50 border-green-200" },
            { label: "Vegan", value: menuCounts.vegan, color: "bg-lime-50 border-lime-200" },
            { label: "Cazare necesară", value: accommodationCount, color: "bg-blue-50 border-blue-200" },
            { label: "La biserică", value: churchCount, color: "bg-purple-50 border-purple-200" },
            { label: "La petrecere", value: partyCount, color: "bg-pink-50 border-pink-200" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${color} border rounded-2xl p-4 text-center`}>
              <div className="font-playfair text-3xl text-[#3d2b1f] mb-1">{value}</div>
              <div className="font-lato text-[#5c4033] text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 font-lato text-[#5c4033]">Se încarcă...</div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-rose-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-rose-50">
                  <tr>
                    {["#", "Nume", "Part.", "Pers.", "Meniu", "Caz.", "Bis.", "Pet.", "Tel.", "Masă", "Data", "Acțiuni"].map((h) => (
                      <th key={h} className="font-lato text-[#3d2b1f] text-xs uppercase tracking-wider py-3 px-3 text-left font-bold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rsvps.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="text-center py-12 font-lato text-[#5c4033] opacity-60">
                        Nu există înregistrări încă.
                      </td>
                    </tr>
                  ) : (
                    rsvps.map((r) => {
                      const menus = (() => {
                        try {
                          return (JSON.parse(r.menu_preferences) as string[])
                            .map((m) => menuLabels[m] || m)
                            .join(", ");
                        } catch { return r.menu_preferences; }
                      })();
                      return (
                        <tr key={r.id} className="border-t border-rose-50 hover:bg-rose-50/30 transition-colors">
                          <td className="font-lato text-[#5c4033] text-xs py-3 px-3">{r.id}</td>
                          <td className="font-lato text-[#3d2b1f] text-sm py-3 px-3 font-semibold">{r.name}</td>
                          <td className="py-3 px-3">
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-lato ${r.attending ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {r.attending ? "Da" : "Nu"}
                            </span>
                          </td>
                          <td className="font-lato text-[#5c4033] text-sm py-3 px-3">{r.num_persons}</td>
                          <td className="font-lato text-[#5c4033] text-xs py-3 px-3 max-w-[120px]">{menus}</td>
                          <td className="py-3 px-3">
                            <span className={`text-xs ${r.need_accommodation ? "text-blue-600 font-semibold" : "text-gray-400"}`}>
                              {r.need_accommodation ? "Da" : "Nu"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`text-xs ${r.attending_church ? "text-purple-600 font-semibold" : "text-gray-400"}`}>
                              {r.attending_church ? "Da" : "Nu"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`text-xs ${r.attending_party ? "text-pink-600 font-semibold" : "text-gray-400"}`}>
                              {r.attending_party ? "Da" : "Nu"}
                            </span>
                          </td>
                          <td className="font-lato text-[#5c4033] text-xs py-3 px-3">{r.phone || "–"}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min={1}
                                placeholder={r.table_number ? String(r.table_number) : "–"}
                                value={tableInputs[r.id] ?? ""}
                                onChange={(e) => setTableInputs((prev) => ({ ...prev, [r.id]: e.target.value }))}
                                className="w-14 border border-rose-200 rounded-lg px-2 py-1 text-xs font-lato focus:outline-none focus:ring-1 focus:ring-[#b76e79]"
                              />
                              <button
                                onClick={() => handleAssignTable(r.id)}
                                disabled={!tableInputs[r.id]}
                                className="text-xs bg-[#b76e79] text-white px-2 py-1 rounded-lg hover:bg-[#a05c67] transition-colors disabled:opacity-40"
                              >
                                ✓
                              </button>
                            </div>
                          </td>
                          <td className="font-lato text-[#5c4033] text-xs py-3 px-3 whitespace-nowrap">
                            {r.created_at.split("T")[0]}
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="text-xs text-red-400 hover:text-red-600 transition-colors font-lato"
                            >
                              Șterge
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
