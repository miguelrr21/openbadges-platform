"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  PlusCircle,
  Users,
  Copy,
  Check,
  Download,
  Lock,
  LogOut,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { isValidEmail, MAX_BULK_RECIPIENTS } from "@/lib/validation";

interface IssuedItem {
  id: string;
  name: string;
  email: string;
  certUrl: string;
  assertionUrl: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"bulk" | "individual" | "create_badge" | "issued_list">("bulk");
  const [badges, setBadges] = useState<any[]>([]);
  const [assertions, setAssertions] = useState<any[]>([]);
  const [issuer, setIssuer] = useState<any>(null);

  // Bulk Issuance state
  const [bulkBadgeId, setBulkBadgeId] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [defaultRole, setDefaultRole] = useState("Asistente");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState<IssuedItem[] | null>(null);
  const [copiedLinks, setCopiedLinks] = useState(false);

  // Single Issuance state
  const [singleBadgeId, setSingleBadgeId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [singleRole, setSingleRole] = useState("Asistente");
  const [singleRank, setSingleRank] = useState("");
  const [singleGroup, setSingleGroup] = useState("");
  const [singleStatus, setSingleStatus] = useState<string | null>(null);

  // Create badge state
  const [badgeName, setBadgeName] = useState("");
  const [badgeDesc, setBadgeDesc] = useState("");
  const [badgeCriteria, setBadgeCriteria] = useState("");
  const [badgeTheme, setBadgeTheme] = useState<"gdg" | "hackathon">("gdg");
  const [eventDates, setEventDates] = useState("");
  const [createStatus, setCreateStatus] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/auth");
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        loadData();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        setPasswordInput("");
        loadData();
      } else {
        setAuthError(data.error || "Clave incorrecta");
      }
    } catch {
      setAuthError("Error de conexión");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setIsAuthenticated(false);
  };

  const loadData = async () => {
    try {
      const res = await fetch("/api/badges/issue");
      const data = await res.json();
      const loadedBadges = data.badges || [];
      setBadges(loadedBadges);
      setAssertions(data.assertions || []);
      setIssuer(data.issuer || null);
      if (loadedBadges.length > 0) {
        setBulkBadgeId((prev) => prev || loadedBadges[0].id);
        setSingleBadgeId((prev) => prev || loadedBadges[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const parseBulkText = () => {
    const lines = bulkText.split("\n");
    const recipients: Array<{ name: string; email: string; role?: string; rank?: string; group?: string }> = [];
    let invalidCount = 0;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#") || line.toLowerCase().startsWith("nombre,")) continue;

      const parts = line.split(/[,;\t]/).map((p) => p.trim());
      if (parts.length >= 2) {
        const name = parts[0];
        const email = parts[1].toLowerCase();
        const role = parts[2] || defaultRole;
        const rank = parts[3] || undefined;
        const group = parts[4] || undefined;

        if (name && isValidEmail(email)) {
          recipients.push({ name, email, role, rank, group });
        } else {
          invalidCount++;
        }
      } else {
        invalidCount++;
      }
    }
    return { recipients, invalidCount };
  };

  const { recipients: parsedRecipients, invalidCount: invalidLinesCount } = parseBulkText();
  const isOverLimit = parsedRecipients.length > MAX_BULK_RECIPIENTS;

  const handleBulkIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedRecipients.length === 0 || isOverLimit) return;

    setBulkLoading(true);
    setBulkResults(null);

    try {
      const res = await fetch("/api/badges/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_issue_assertions",
          badgeClassId: bulkBadgeId,
          recipients: parsedRecipients
        })
      });

      const data = await res.json();
      if (res.ok) {
        setBulkResults(data.issued || []);
        loadData();
      } else {
        alert(`Error al emitir: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error de red: ${err.message}`);
    } finally {
      setBulkLoading(false);
    }
  };

  const copyAllLinks = () => {
    if (!bulkResults) return;
    const text = bulkResults
      .map((item) => `${item.name} (${item.email}): ${item.certUrl}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopiedLinks(true);
    setTimeout(() => setCopiedLinks(false), 2000);
  };

  const downloadCsv = () => {
    if (!bulkResults) return;
    const header = "Nombre,Email,CertificadoURL,AssertionJSON\n";
    const rows = bulkResults
      .map(
        (i) =>
          `"${i.name}","${i.email}","${i.certUrl}","${i.assertionUrl}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `certificados_emitidos_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSingleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(recipientEmail)) {
      setSingleStatus("Error: El correo electrónico no tiene un formato válido.");
      return;
    }

    setSingleStatus("Emitiendo...");
    try {
      const res = await fetch("/api/badges/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "issue_assertion",
          badgeClassId: singleBadgeId,
          recipientName,
          recipientEmail,
          rank: singleRank || undefined,
          group: singleGroup || undefined,
          role: singleRole || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSingleStatus(`Certificado emitido con éxito. ID: ${data.assertion.id}`);
        setRecipientName("");
        setRecipientEmail("");
        setSingleRank("");
        setSingleGroup("");
        loadData();
      } else {
        setSingleStatus(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setSingleStatus(`Error: ${err.message}`);
    }
  };

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateStatus("Creando...");
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
        setCreateStatus(`Insignia creada con éxito. ID: ${data.badge.id}`);
        setBadgeName("");
        setBadgeDesc("");
        setBadgeCriteria("");
        setEventDates("");
        loadData();
      } else {
        setCreateStatus(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setCreateStatus(`Error: ${err.message}`);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-xs text-slate-500">Comprobando acceso...</p>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-sm w-full shadow-md">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">
              Panel de Administración
            </h1>
            <p className="text-xs text-slate-500">
              GDGoC Universidad de Huelva
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clave de Acceso
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Introduce tu clave..."
                className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors shadow-xs"
            >
              {loginLoading ? "Comprobando..." : "Acceder al Panel"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link href="/" className="text-xs text-slate-500 hover:underline">
              ← Volver al portal público
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6 text-xs">
          <Link href="/" className="text-slate-500 hover:text-slate-900 font-medium">
            ← Volver al portal
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-slate-600">
              Sesión activa: <strong>Admin GDGoC UHU</strong>
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded border border-rose-200 bg-rose-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 mb-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("bulk")}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "bulk"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Reparto Masivo (Lote)</span>
          </button>
          <button
            onClick={() => setActiveTab("individual")}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "individual"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Emisión Individual</span>
          </button>
          <button
            onClick={() => setActiveTab("create_badge")}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "create_badge"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Crear Evento / Insignia</span>
          </button>
          <button
            onClick={() => setActiveTab("issued_list")}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === "issued_list"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Histórico ({assertions.length})
          </button>
        </div>

        {/* TAB 1: BULK ISSUANCE */}
        {activeTab === "bulk" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900">
                  Reparto Masivo de Certificados
                </h2>
                <p className="text-xs text-slate-500">
                  Pega la lista de asistentes (máximo {MAX_BULK_RECIPIENTS} por tanda) para emitir los certificados en un solo paso.
                </p>
              </div>

              {badges.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  Aún no has creado ningún evento o insignia. Ve a la pestaña{" "}
                  <button
                    onClick={() => setActiveTab("create_badge")}
                    className="font-bold underline text-amber-900"
                  >
                    Crear Evento / Insignia
                  </button>{" "}
                  para dar de alta el primer evento antes de emitir certificados.
                </div>
              ) : (
                <form onSubmit={handleBulkIssue} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Evento / Insignia
                      </label>
                      <select
                        value={bulkBadgeId}
                        onChange={(e) => setBulkBadgeId(e.target.value)}
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
                        Rol por defecto
                      </label>
                      <input
                        type="text"
                        value={defaultRole}
                        onChange={(e) => setDefaultRole(e.target.value)}
                        placeholder="Asistente, Participante..."
                        className="w-full border border-slate-300 rounded-lg p-2"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-700">
                        Lista de Asistentes (Formato: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">Nombre, Email, Rol, Puesto, Grupo</code>)
                      </label>
                      <div className="text-right">
                        <span className={`font-semibold ${isOverLimit ? "text-rose-600 font-bold" : "text-blue-600"}`}>
                          {parsedRecipients.length} / {MAX_BULK_RECIPIENTS} asistentes válidos
                        </span>
                        {invalidLinesCount > 0 && (
                          <span className="text-amber-600 text-[11px] ml-1.5">
                            ({invalidLinesCount} con formato inválido ignorados)
                          </span>
                        )}
                      </div>
                    </div>
                    <textarea
                      rows={8}
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      placeholder={`Carmen Gómez, carmen@alu.uhu.es\nDavid Moreno, david@alu.uhu.es\nElena Benítez, elena@alu.uhu.es`}
                      className="w-full border border-slate-300 rounded-lg p-3 font-mono text-[11px] leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-600"
                      required
                    />
                    {isOverLimit && (
                      <p className="text-xs text-rose-600 font-medium mt-1">
                        Has superado el límite de {MAX_BULK_RECIPIENTS} participantes por lote. Por favor, divide la lista en dos tandas para no superar el tiempo máximo de ejecución.
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1">
                      Puedes copiar y pegar directamente desde Excel o Google Sheets. Solo se procesarán correos electrónicos con formato válido.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={bulkLoading || parsedRecipients.length === 0 || isOverLimit}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-xs"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {bulkLoading
                          ? "Emitiendo certificados..."
                          : `Emitir certificados a los ${parsedRecipients.length} asistentes`}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {bulkResults && (
              <div className="bg-white border border-emerald-200 rounded-xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-sm text-emerald-800 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>¡{bulkResults.length} certificados emitidos con éxito!</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Todos los certificados están alojados y listos para compartir o enviar a los participantes.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyAllLinks}
                      className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    >
                      {copiedLinks ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLinks ? "¡Enlaces copiados!" : "Copiar todos los enlaces"}</span>
                    </button>

                    <button
                      onClick={downloadCsv}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar CSV</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="pb-2">Nombre</th>
                        <th className="pb-2">Email</th>
                        <th className="pb-2">Enlace de Certificado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bulkResults.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-2 font-medium text-slate-800">{item.name}</td>
                          <td className="py-2 text-slate-500">{item.email}</td>
                          <td className="py-2">
                            <a
                              href={item.certUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                            >
                              <span>/cert/{item.id.slice(0, 10)}...</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INDIVIDUAL ISSUANCE */}
        {activeTab === "individual" && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-xl">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              Emitir Certificado Individual
            </h2>

            {badges.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                Aún no has creado ningún evento o insignia. Crea uno primero en la pestaña{" "}
                <button
                  onClick={() => setActiveTab("create_badge")}
                  className="font-bold underline text-amber-900"
                >
                  Crear Evento / Insignia
                </button>.
              </div>
            ) : (
              <form onSubmit={handleSingleIssue} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Evento / Insignia
                  </label>
                  <select
                    value={singleBadgeId}
                    onChange={(e) => setSingleBadgeId(e.target.value)}
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
                    Email
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
                      value={singleRole}
                      onChange={(e) => setSingleRole(e.target.value)}
                      placeholder="Asistente..."
                      className="w-full border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Puesto / Medalla</label>
                    <input
                      type="text"
                      value={singleRank}
                      onChange={(e) => setSingleRank(e.target.value)}
                      placeholder="Opcional..."
                      className="w-full border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Grupo / Equipo</label>
                    <input
                      type="text"
                      value={singleGroup}
                      onChange={(e) => setSingleGroup(e.target.value)}
                      placeholder="Opcional..."
                      className="w-full border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                </div>

                {singleStatus && (
                  <div className={`p-3 rounded-lg ${singleStatus.startsWith("Error") ? "bg-rose-50 border border-rose-200 text-rose-700" : "bg-blue-50 border border-blue-200 text-blue-700"}`}>
                    {singleStatus}
                  </div>
                )}

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Emitir Certificado
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: CREATE BADGE */}
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
                  placeholder="Ej. Hackathon GDGoC UHU 2026"
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
                    placeholder="Ej. Marzo 2026"
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {createStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg">
                  {createStatus}
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

        {/* TAB 4: ISSUED LIST */}
        {activeTab === "issued_list" && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            {assertions.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">
                Aún no se ha emitido ningún certificado.
              </p>
            ) : (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">Destinatario</th>
                    <th className="pb-2">Email</th>
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
                            onClick={() => {
                              navigator.clipboard.writeText(a.id);
                              setCopiedId(a.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
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
                        <td className="py-2.5 text-slate-500">{a.recipient.email}</td>
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
