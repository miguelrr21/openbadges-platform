"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  ShieldCheck,
  Search,
  ExternalLink,
  Sparkles,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Lock,
  Globe,
  Share2
} from "lucide-react";

export default function HomePage() {
  const [searchId, setSearchId] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchId.trim();
    if (!clean) return;
    router.push(`/cert/${clean}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <img src="/logo/logo.svg" alt="GDG on Campus" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                OpenBadges GDG
              </span>
              <span className="text-[10px] ml-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                v2.0 Hosted
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
            <Link
              href="/my-badges"
              className="px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Mi Cartera
            </Link>
            <Link
              href="/admin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
            >
              Panel Emisor
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-4 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Credenciales Digitales Criptográficamente Verificables</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            Demuestra tus logros con <span className="text-blue-600 dark:text-blue-400">Open Badges</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Plataforma de emisión y verificación conforme al estándar internacional Open Badges v2.0.
            Los asistentes pueden compartir su certificado en LinkedIn, mochilas digitales o descargar el documento formal.
          </p>
        </div>

        {/* Certificate Lookup Bar */}
        <div className="max-w-xl mx-auto mb-16">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus-within:border-blue-500 transition-all"
          >
            <Search className="w-5 h-5 text-slate-400 ml-3" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Ingresa el ID del certificado (ej. 69679d9fa12d24f4a673b54b)..."
              className="flex-1 px-2 py-2 text-xs sm:text-sm bg-transparent focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors"
            >
              Verificar
            </button>
          </form>
        </div>

        {/* Featured Sample Certificates from User Request */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Certificados de Demostración Disponibles
              </h2>
              <p className="text-xs text-slate-500">
                Los dos ejemplos preparados conforme a la solicitud del GDG:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cert 1: GDG Style */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    Estilo Original GDG
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">ID: 6ae00a...0f</span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                  Google Tech Summit & Workshop Series
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Otorgado a: <strong className="text-slate-700 dark:text-slate-300">Héctor Tablero Díaz</strong> (Attendee)
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Diploma de participación con diseño limpio, cabecera de 4 colores Google, verificación y firmas de presidencia.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  href="/cert/6ae00a61a65e3dd2d40bcb0f"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>Abrir certificado</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="/api/badges/assertion/6ae00a61a65e3dd2d40bcb0f"
                  target="_blank"
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <span>JSON Assertion</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Cert 2: Hackathon Style */}
            <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <Trophy className="w-3 h-3 text-amber-600" />
                    Estilo Hackathon (Medal)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">ID: 69679d...4b</span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                  Hackathon GDG x CEUAM
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Otorgado a: <strong className="text-slate-700 dark:text-slate-300">Héctor Tablero Díaz</strong> (Gold Medal • Test Group)
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Certificado de competición con medalla dorada, asignación de grupo, fechas del hackathon y enlaces de compartición directa.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  href="/cert/69679d9fa12d24f4a673b54b"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  <span>Abrir certificado</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="/api/badges/assertion/69679d9fa12d24f4a673b54b"
                  target="_blank"
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  <span>JSON Assertion</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* How Open Badges Hosted Verification Works */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold mb-4 border border-blue-500/30">
              <Globe className="w-3.5 h-3.5" />
              <span>Arquitectura Open Badges v2 Hosted</span>
            </div>

            <h3 className="text-2xl font-bold mb-3">
              ¿Por qué es infalsificable este sistema?
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
              Bajo la especificación de Open Badges, como la asociación aloja los datos directamente en su dominio web, cualquier validador internacional (BadgeCheck, Badgr, LinkedIn) comprueba que:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="font-bold text-blue-400 block mb-1">1. Issuer JSON</span>
                <p className="text-slate-400">
                  Identifica a la asociación oficialmente como emisor en <code className="text-slate-300">/api/badges/issuer</code>.
                </p>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="font-bold text-amber-400 block mb-1">2. BadgeClass JSON</span>
                <p className="text-slate-400">
                  Define el evento o taller con sus criterios específicos en <code className="text-slate-300">/api/badges/class/:id</code>.
                </p>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <span className="font-bold text-emerald-400 block mb-1">3. Assertion JSON</span>
                <p className="text-slate-400">
                  Asocia la insignia al asistente mediante hash SHA-256 en <code className="text-slate-300">/api/badges/assertion/:id</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-4 text-center text-xs text-slate-500">
        <p>
          Google Developer Group on Campus - Universidad Autónoma de Madrid • Open Badges System
        </p>
      </footer>
    </div>
  );
}
