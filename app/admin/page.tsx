"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  PlusCircle,
  Users,
  Building,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Send,
  Sparkles,
  Trophy,
  Copy,
  Check
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"issue" | "create_badge" | "issued_list">("issue");
  const [badges, setBadges] = useState<any[]>([]);
  const [assertions, setAssertions] = useState<any[]>([]);
  const [issuer, setIssuer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for issuing
  const [selectedBadgeId, setSelectedBadgeId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [rank, setRank] = useState("");
  const [group, setGroup] = useState("");
  const [role, setRole] = useState("Attendee");
  const [issueStatus, setIssueStatus] = useState<string | null>(null);

  // Form states for creating badge class
  const [badgeName, setBadgeName] = useState("");
  const [badgeDesc, setBadgeDesc] = useState("");
  const [badgeCriteria, setBadgeCriteria] = useState("");
  const [badgeTheme, setBadgeTheme] = useState<"gdg" | "hackathon">("gdg");
  const [eventDates, setEventDates] = useState("");
  const [createBadgeStatus, setCreateBadgeStatus] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/badges/issue");
      const data = await res.json();
      setBadges(data.badges || []);
      setAssertions(data.assertions || []);
      setIssuer(data.issuer || null);
      if (data.badges?.length > 0 && !selectedBadgeId) {
        setSelectedBadgeId(data.badges[0].id);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssueAssertion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssueStatus("Emitiendo certificado...");
    try {
      const res = await fetch("/api/badges/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "issue_assertion",
          badgeClassId: selectedBadgeId,
          recipientName,
          recipientEmail,
          rank: rank || undefined,
          group: group || undefined,
          role: role || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIssueStatus(`¡Certificado emitido con éxito! ID: ${data.assertion.id}`);
        setRecipientName("");
        setRecipientEmail("");
        setRank("");
        setGroup("");
        loadData();
      } else {
        setIssueStatus(`Error: ${data.error || "No se pudo emitir"}`);
      }
    } catch (err: any) {
      setIssueStatus(`Error de conexión: ${err.message}`);
    }
  };

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateBadgeStatus("Creando insignia...");
    try {
      const res = await fetch("/api/badges/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_badge",
          name: badgeName,
          description: badgeDesc,
          criteriaNarrative: badgeCriteria,
          theme: badgeTheme,
          eventDates
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCreateBadgeStatus(`¡Insignia creada con éxito! ID: ${data.badge.id}`);
        setBadgeName("");
        setBadgeDesc("");
        setBadgeCriteria("");
        setEventDates("");
        loadData();
      } else {
        setCreateBadgeStatus(`Error: ${data.error || "No se pudo crear"}`);
      }
    } catch (err: any) {
      setCreateBadgeStatus(`Error: ${err.message}`);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            ← Volver al portal
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/my-badges"
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors"
            >
              Cartera del Asistente
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Panel Emisor Open Badges (Issuer Management)
              </h1>
              <p className="text-xs text-slate-500">
                Emisor activo: <strong className="text-slate-700 dark:text-slate-300">{issuer?.name || "Cargando..."}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/badges/issuer"
              target="_blank"
              className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium hover:underline"
            >
              <span>Ver JSON Issuer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab("issue")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "issue"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Emitir Certificado a Asistente</span>
          </button>
          <button
            onClick={() => setActiveTab("create_badge")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "create_badge"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Crear Nueva Insignia (BadgeClass)</span>
          </button>
          <button
            onClick={() => setActiveTab("issued_list")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "issued_list"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Certificados Emitidos ({assertions.length})</span>
          </button>
        </div>

        {/* TAB 1: Issue Assertion to Recipient */}
        {activeTab === "issue" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              Emitir Certificado Oficial Hosted Open Badges
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              El certificado se genera inmediatamente y queda alojado bajo la ruta canónica <code>/cert/[id]</code> con verificación criptográfica SHA-256 de Open Badges v2.0.
            </p>

            <form onSubmit={handleIssueAssertion} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Insignia / Evento (BadgeClass)
                </label>
                <select
                  value={selectedBadgeId}
                  onChange={(e) => setSelectedBadgeId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {badges.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.theme === "hackathon" ? "Hackathon" : "Estilo GDG"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre del Asistente
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Ej. Carmen Gómez Sánchez"
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email del Asistente (se hashea en sha256)
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="carmen@uam.es"
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rol
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Attendee, Speaker..."
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rank / Medalla (opcional)
                  </label>
                  <input
                    type="text"
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    placeholder="Gold Medal, 1st Place..."
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Grupo / Equipo (opcional)
                  </label>
                  <input
                    type="text"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    placeholder="Alpha Devs..."
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {issueStatus && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-700 dark:text-blue-300 font-medium">
                  {issueStatus}
                </div>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Emitir Certificado Open Badges</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: Create Badge Class */}
        {activeTab === "create_badge" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              Crear Nuevo BadgeClass
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Define el tipo de insignia u evento (Hackathon, taller, ciclo de charlas). Luego podrás emitir certificados a todos los participantes con este badge.
            </p>

            <form onSubmit={handleCreateBadge} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Evento / Insignia
                </label>
                <input
                  type="text"
                  value={badgeName}
                  onChange={(e) => setBadgeName(e.target.value)}
                  placeholder="Ej. IA Generativa & Cloud Workshop 2026"
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={badgeDesc}
                  onChange={(e) => setBadgeDesc(e.target.value)}
                  placeholder="Descripción de los logros o actividades realizadas..."
                  rows={3}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tema visual del certificado
                  </label>
                  <select
                    value={badgeTheme}
                    onChange={(e: any) => setBadgeTheme(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
                  >
                    <option value="gdg">Estilo Original GDG (Limpio / Google Quad-color)</option>
                    <option value="hackathon">Estilo Hackathon (Medallas / Achievement)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fechas del evento
                  </label>
                  <input
                    type="text"
                    value={eventDates}
                    onChange={(e) => setEventDates(e.target.value)}
                    placeholder="Ej. October 27, 2026"
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Criterios de obtención (criteria.narrative)
                </label>
                <input
                  type="text"
                  value={badgeCriteria}
                  onChange={(e) => setBadgeCriteria(e.target.value)}
                  placeholder="Certificate awarded for completing all workshop sessions."
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100"
                />
              </div>

              {createBadgeStatus && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  {createBadgeStatus}
                </div>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Crear Insignia</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: List of All Issued Assertions */}
        {activeTab === "issued_list" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm overflow-hidden">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
              Certificados Emitidos en la Plataforma
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 px-2">ID</th>
                    <th className="pb-3 px-2">Destinatario</th>
                    <th className="pb-3 px-2">Email</th>
                    <th className="pb-3 px-2">Insignia</th>
                    <th className="pb-3 px-2">Fecha</th>
                    <th className="pb-3 px-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {assertions.map((a) => {
                    const badge = badges.find((b) => b.id === a.badgeClassId);
                    return (
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-2 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <span>{a.id.slice(0, 10)}...</span>
                            <button
                              onClick={() => copyToClipboard(a.id, a.id)}
                              className="text-slate-400 hover:text-slate-600"
                              title="Copiar ID"
                            >
                              {copiedId === a.id ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-2 font-semibold text-slate-900 dark:text-slate-100">
                          {a.recipient.name || "Participante"}
                        </td>
                        <td className="py-3 px-2 text-slate-500">
                          {a.recipient.email || a.recipient.identity.slice(0, 16) + "..."}
                        </td>
                        <td className="py-3 px-2 text-slate-700 dark:text-slate-300">
                          {badge?.name || a.badgeClassId}
                        </td>
                        <td className="py-3 px-2 text-slate-400">
                          {new Date(a.issuedOn).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/cert/${a.id}`}
                              target="_blank"
                              className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>Ver web</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                            <span>•</span>
                            <a
                              href={`/api/badges/assertion/${a.id}`}
                              target="_blank"
                              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 inline-flex items-center gap-0.5"
                            >
                              <span>JSON</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
