"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  Send,
  Award,
  Copy,
  Check
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"issue" | "create_badge" | "issued_list">("issue");
  const [badges, setBadges] = useState<any[]>([]);
  const [assertions, setAssertions] = useState<any[]>([]);
  const [issuer, setIssuer] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Issue form
  const [selectedBadgeId, setSelectedBadgeId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [rank, setRank] = useState("");
  const [group, setGroup] = useState("");
  const [role, setRole] = useState("Asistente");
  const [issueStatus, setIssueStatus] = useState<string | null>(null);

  // Create badge form
  const [badgeName, setBadgeName] = useState("");
  const [badgeDesc, setBadgeDesc] = useState("");
  const [badgeCriteria, setBadgeCriteria] = useState("");
  const [badgeTheme, setBadgeTheme] = useState<"gdg" | "hackathon">("gdg");
  const [eventDates, setEventDates] = useState("");
  const [createBadgeStatus, setCreateBadgeStatus] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetch("/api/badges/issue");
      const data = await res.json();
      setBadges(data.badges || []);
      setAssertions(data.assertions || []);
      setIssuer(data.issuer || null);
      if (data.badges?.length > 0 && !selectedBadgeId) {
        setSelectedBadgeId(data.badges[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssueAssertion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssueStatus("Emitiendo...");
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
        setIssueStatus(`Certificado emitido con éxito. ID: ${data.assertion.id}`);
        setRecipientName("");
        setRecipientEmail("");
        setRank("");
        setGroup("");
        loadData();
      } else {
        setIssueStatus(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setIssueStatus(`Error: ${err.message}`);
    }
  };

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateBadgeStatus("Creando...");
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
        setCreateBadgeStatus(`Insignia creada con éxito. ID: ${data.badge.id}`);
        setBadgeName("");
        setBadgeDesc("");
        setBadgeCriteria("");
        setEventDates("");
        loadData();
      } else {
        setCreateBadgeStatus(`Error: ${data.error}`);
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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 text-xs">
          <Link href="/" className="text-slate-500 hover:text-slate-900 font-medium">
            ← Volver al inicio
          </Link>
          <span className="text-slate-500">
            Emisor: <strong>{issuer?.name || "GDGoC Universidad de Huelva"}</strong>
          </span>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 border-b border-slate-200 mb-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("issue")}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === "issue"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Emitir Certificado
          </button>
          <button
            onClick={() => setActiveTab("create_badge")}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === "create_badge"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Crear Evento / Insignia
          </button>
          <button
            onClick={() => setActiveTab("issued_list")}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === "issued_list"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Certificados Emitidos ({assertions.length})
          </button>
        </div>

        {/* Tab 1: Issue */}
        {activeTab === "issue" && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-xl">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              Emitir Certificado a un Participante
            </h2>

            <form onSubmit={handleIssueAssertion} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Evento / Insignia
                </label>
                <select
                  value={selectedBadgeId}
                  onChange={(e) => setSelectedBadgeId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 text-slate-800"
                  required
                >
                  {badges.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Ej. Carmen Gómez"
                  className="w-full border border-slate-300 rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email (se almacena como SHA-256 en la credencial pública)
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="carmen@alu.uhu.es"
                  className="w-full border border-slate-300 rounded-lg p-2"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rol</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Asistente..."
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Puesto / Medalla</label>
                  <input
                    type="text"
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    placeholder="Opcional..."
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grupo / Equipo</label>
                  <input
                    type="text"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    placeholder="Opcional..."
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {issueStatus && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
                  {issueStatus}
                </div>
              )}

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Emitir Certificado
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Create Badge */}
        {activeTab === "create_badge" && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-xl">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              Crear Nuevo Tipo de Certificado
            </h2>

            <form onSubmit={handleCreateBadge} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre del Evento
                </label>
                <input
                  type="text"
                  value={badgeName}
                  onChange={(e) => setBadgeName(e.target.value)}
                  placeholder="Ej. Taller de Flutter & Firebase GDGoC UHU"
                  className="w-full border border-slate-300 rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={badgeDesc}
                  onChange={(e) => setBadgeDesc(e.target.value)}
                  placeholder="Descripción de la actividad..."
                  rows={2}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estilo</label>
                  <select
                    value={badgeTheme}
                    onChange={(e: any) => setBadgeTheme(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option value="gdg">Estilo GDG (Asistencia / Talleres)</option>
                    <option value="hackathon">Estilo Hackathon (Competición)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fechas</label>
                  <input
                    type="text"
                    value={eventDates}
                    onChange={(e) => setEventDates(e.target.value)}
                    placeholder="Ej. Noviembre 2026"
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {createBadgeStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg">
                  {createBadgeStatus}
                </div>
              )}

              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Crear Insignia
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: List */}
        {activeTab === "issued_list" && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Destinatario</th>
                  <th className="pb-2">Evento</th>
                  <th className="pb-2">Fecha</th>
                  <th className="pb-2 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assertions.map((a) => {
                  const b = badges.find((badge) => badge.id === a.badgeClassId);
                  return (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-mono text-slate-500">
                        <button
                          onClick={() => copyToClipboard(a.id, a.id)}
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{a.id.slice(0, 8)}...</span>
                          {copiedId === a.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400" />
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 font-semibold text-slate-800">
                        {a.recipient.name}
                      </td>
                      <td className="py-2.5 text-slate-600">{b?.name || a.badgeClassId}</td>
                      <td className="py-2.5 text-slate-400">
                        {new Date(a.issuedOn).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          href={`/cert/${a.id}`}
                          target="_blank"
                          className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Ver</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
