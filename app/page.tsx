"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Award,
  ExternalLink
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo/logo.svg" alt="GDGoC UHU" className="h-9 w-auto" />
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
              Open Badges v2
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <Link
              href="/my-badges"
              className="text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded transition-colors"
            >
              Mis Certificados
            </Link>
            <Link
              href="/admin"
              className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg transition-colors"
            >
              Emitir Certificados
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-4 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verificación Oficial GDGoC Universidad de Huelva</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            Validador de Certificados GDGoC UHU
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Comprueba la validez de los certificados emitidos para eventos, talleres y hackathons universitarios.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12">
          <div className="flex items-center border border-slate-300 bg-white rounded-xl shadow-xs overflow-hidden focus-within:border-blue-600">
            <Search className="w-5 h-5 text-slate-400 ml-3.5" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Introduce el ID del certificado (ej. 69679d9fa12d24f4a673b54b)..."
              className="flex-1 px-3 py-3 text-xs sm:text-sm bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-3 transition-colors"
            >
              Comprobar
            </button>
          </div>
        </form>

        {/* Sample Certificates */}
        <div className="max-w-xl mx-auto">
          <h2 className="text-xs uppercase font-semibold text-slate-600 mb-3 tracking-wider">
            Ejemplos de certificados disponibles
          </h2>

          <div className="space-y-3">
            {/* Cert 1 */}
            <Link
              href="/cert/69679d9fa12d24f4a673b54b"
              className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mb-1">
                    Hackathon • Primer Puesto
                  </span>
                  <h3 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    Hackathon GDGoC UHU
                  </h3>
                  <p className="text-xs text-slate-500">
                    Destinatario: Alejandro Rodríguez (Equipo UHU Tech)
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </Link>

            {/* Cert 2 */}
            <Link
              href="/cert/6ae00a61a65e3dd2d40bcb0f"
              className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mb-1">
                    Jornadas & Workshops
                  </span>
                  <h3 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    Jornadas de Desarrollo & Cloud GDGoC UHU
                  </h3>
                  <p className="text-xs text-slate-500">
                    Destinatario: Alejandro Rodríguez (Asistente)
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-600">
        Google Developer Group on Campus - Universidad de Huelva (GDGoC UHU)
      </footer>
    </div>
  );
}
