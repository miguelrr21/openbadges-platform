"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  ExternalLink,
  ShieldCheck,
  Calendar,
  User,
  ArrowRight,
  LogOut,
  Sparkles,
  Trophy
} from "lucide-react";
import { LinkedInIcon } from "@/components/icons/LinkedInIcon";

interface AssertionSummary {
  id: string;
  badgeName: string;
  badgeTheme: string;
  recipientName: string;
  issuedOn: string;
  certUrl: string;
  linkedInUrl: string;
}

export default function MyBadgesPage() {
  const [email, setEmail] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [badges, setBadges] = useState<AssertionSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("openbadges_user_email");
    if (stored) {
      setEmail(stored);
      fetchUserBadges(stored);
    } else {
      // Default to the demo attendee email
      const demoEmail = "hector.tablero@gdguam.es";
      setInputEmail(demoEmail);
      setEmail(demoEmail);
      fetchUserBadges(demoEmail);
    }
  }, []);

  const fetchUserBadges = async (targetEmail: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/badges/issue?email=${encodeURIComponent(targetEmail)}`);
      const data = await res.json();
      
      const badgeMap = new Map((data.badges || []).map((b: any) => [b.id, b]));
      const issuer = data.issuer;

      const formatted: AssertionSummary[] = (data.assertions || []).map((a: any) => {
        const b: any = badgeMap.get(a.badgeClassId) || {};
        const date = new Date(a.issuedOn);
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const certUrl = `/cert/${a.id}`;

        const linkedInParams = new URLSearchParams({
          startTask: "CERTIFICATION_NAME",
          name: b.name || "Certificado",
          organizationName: issuer?.name || "Organización",
          issueYear: year.toString(),
          issueMonth: month.toString(),
          certUrl: typeof window !== "undefined" ? `${window.location.origin}${certUrl}` : certUrl,
          certId: a.id
        });

        return {
          id: a.id,
          badgeName: b.name || "Certificado de Asistencia",
          badgeTheme: b.theme || "gdg",
          recipientName: a.recipient?.name || "Participante",
          issuedOn: a.issuedOn,
          certUrl,
          linkedInUrl: `https://www.linkedin.com/profile/add?${linkedInParams.toString()}`
        };
      });

      setBadges(formatted);
    } catch (err) {
      console.error("Error fetching badges:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.trim()) return;
    localStorage.setItem("openbadges_user_email", inputEmail.trim());
    setEmail(inputEmail.trim());
    fetchUserBadges(inputEmail.trim());
  };

  const handleLogout = () => {
    localStorage.removeItem("openbadges_user_email");
    setEmail("");
    setBadges([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
              href="/admin"
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors"
            >
              Panel Organizador / Emitir
            </Link>
          </div>
        </div>

        {/* User Session Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Cartera de Certificados del Asistente
                </h1>
                <p className="text-xs text-slate-500">
                  {email ? (
                    <>
                      Sesión activa: <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>
                    </>
                  ) : (
                    "Ingresa tu correo para ver tus insignias y asociarlas"
                  )}
                </p>
              </div>
            </div>

            {email ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar sesión</span>
              </button>
            ) : null}
          </div>

          {/* Change or Enter Email */}
          <form onSubmit={handleLogin} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-lg">
            <input
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="tu-correo@universidad.es"
              className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs"
            >
              Consultar mis certificados
            </button>
          </form>
        </div>

        {/* Badges List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span>Insignias encontradas ({badges.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Cargando insignias...</div>
          ) : badges.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
              <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                No se encontraron certificados para {email || "este correo"}.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Prueba con <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">hector.tablero@gdguam.es</code> para ver las credenciales de demostración.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          b.badgeTheme === "hackathon"
                            ? "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
                            : "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
                        }`}
                      >
                        {b.badgeTheme === "hackathon" ? "Hackathon Achievement" : "Participation"}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        HostedBadge
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-1 leading-snug">
                      {b.badgeName}
                    </h3>
                    <p className="text-xs text-slate-500 mb-2">Otorgado a: <strong className="text-slate-700 dark:text-slate-300">{b.recipientName}</strong></p>
                    
                    <div className="flex items-center gap-1 text-xs text-slate-400 mb-4">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(b.issuedOn).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={b.certUrl}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold py-2 rounded-xl transition-colors"
                      >
                        <span>Ver Certificado</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <a
                        href={b.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 bg-[#0077B5] hover:bg-[#006396] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                        title="Añadir a mis certificaciones de LinkedIn"
                      >
                        <LinkedInIcon className="w-3.5 h-3.5 fill-white" />
                        <span className="hidden sm:inline">LinkedIn</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
