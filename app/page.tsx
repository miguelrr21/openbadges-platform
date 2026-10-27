"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShieldCheck
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
              Panel Administrador
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto px-4 py-16 w-full flex flex-col justify-center">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-4 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verificación Oficial GDGoC Universidad de Huelva</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
            Validador de Certificados
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Introduce el identificador de tu credencial para verificar la autenticidad del certificado emitido por el Google Developer Group on Campus UHU.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="w-full mb-6">
          <div className="flex items-center border border-slate-300 bg-white rounded-xl shadow-xs overflow-hidden focus-within:border-blue-600">
            <Search className="w-5 h-5 text-slate-400 ml-3.5" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Introduce el ID de tu certificado..."
              className="flex-1 px-3 py-3.5 text-xs sm:text-sm bg-transparent focus:outline-none"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-3.5 transition-colors"
            >
              Verificar
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-400">
          Credenciales verificables según la especificación internacional Open Badges v2 (Hosted Badge).
        </p>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Google Developer Group on Campus - Universidad de Huelva (GDGoC UHU)
      </footer>
    </div>
  );
}
