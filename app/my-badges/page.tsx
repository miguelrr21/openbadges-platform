"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ExternalLink,
  ShieldCheck,
  Calendar,
  User,
  ArrowRight
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
    const demoEmail = "asistente@alu.uhu.es";
    setInputEmail(demoEmail);
    setEmail(demoEmail);
    fetchUserBadges(demoEmail);
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
          name: b.name || "Certificado GDGoC UHU",
          organizationName: issuer?.name || "GDGoC Universidad de Huelva",
          issueYear: year.toString(),
          issueMonth: month.toString(),
          certUrl: typeof window !== "undefined" ? `${window.location.origin}${certUrl}` : certUrl,
          certId: a.id
        });

        return {
          id: a.id,
          badgeName: b.name || "Certificado",
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.trim()) return;
    setEmail(inputEmail.trim());
    fetchUserBadges(inputEmail.trim());
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6 text-xs">
          <Link href="/" className="text-slate-500 hover:text-slate-900 font-medium">
            ← Volver al inicio
          </Link>
          <Link
            href="/admin"
            className="text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 font-medium"
          >
            Emitir Certificados
          </Link>
        </div>

        {/* Search by email */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs mb-6">
          <h1 className="text-xl font-bold text-slate-900 mb-1">
            Certificados del Asistente
          </h1>
          <p className="text-xs text-slate-500 mb-4">
            Introduce tu correo de la Universidad de Huelva para ver tus insignias:
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="alumno@alu.uhu.es"
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Results */}
        <div>
          {loading ? (
            <p className="text-center text-xs text-slate-400 py-8">Cargando certificados...</p>
          ) : badges.length === 0 ? (
            <div className="text-center py-8 bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
              No se han encontrado certificados asociados a {email}.
            </div>
          ) : (
            <div className="space-y-3">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">{b.badgeName}</h3>
                    <p className="text-xs text-slate-500">
                      Titular: <strong className="text-slate-700">{b.recipientName}</strong> • {new Date(b.issuedOn).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={b.certUrl}
                      className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                    >
                      <span>Ver</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <a
                      href={b.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#0077b5] hover:bg-[#006396] text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                    >
                      <LinkedInIcon className="w-3.5 h-3.5 fill-white" />
                      <span>Añadir a LinkedIn</span>
                    </a>
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
