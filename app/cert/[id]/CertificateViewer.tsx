"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  AssertionRecord,
  BadgeClassDefinition,
  IssuerProfile
} from "@/lib/types";
import {
  generateLinkedInCertUrl,
  generateBadgeCheckUrl
} from "@/lib/urls";
import { LinkedInIcon } from "@/components/icons/LinkedInIcon";
import {
  Award,
  CheckCircle,
  Copy,
  Download,
  ExternalLink,
  Printer,
  QrCode,
  ShieldCheck,
  Check,
  Code2,
  Calendar,
  Share2,
  Trophy
} from "lucide-react";

interface CertificateViewerProps {
  assertion: AssertionRecord;
  badge: BadgeClassDefinition;
  issuer: IssuerProfile;
  host: string;
}

export default function CertificateViewer({
  assertion,
  badge,
  issuer,
  host
}: CertificateViewerProps) {
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : `http://${host}`;

  const certUrl = `${baseUrl}/cert/${assertion.id}`;
  const assertionApiUrl = `${baseUrl}/api/badges/assertion/${assertion.id}`;
  const badgeApiUrl = `${baseUrl}/api/badges/class/${badge.id}`;
  const issuerApiUrl = `${baseUrl}/api/badges/issuer`;

  const linkedInUrl = generateLinkedInCertUrl(
    badge.name,
    issuer.name,
    assertion.id,
    assertion.issuedOn,
    baseUrl
  );

  const badgeCheckUrl = generateBadgeCheckUrl(assertion.id, baseUrl);

  useEffect(() => {
    QRCode.toDataURL(certUrl, { width: 220, margin: 1 })
      .then(setQrCodeUrl)
      .catch(() => {});
  }, [certUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(certUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(assertion.issuedOn).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const isHackathon = badge.theme === "hackathon" || assertion.metadata?.rank;

  const rawAssertionJson = {
    "@context": "https://w3id.org/openbadges/v2",
    type: "Assertion",
    id: assertionApiUrl,
    recipient: {
      type: "email",
      hashed: true,
      identity: assertion.recipient.identity,
      salt: assertion.recipient.salt
    },
    issuedOn: assertion.issuedOn,
    verification: {
      type: "HostedBadge"
    },
    badge: badgeApiUrl
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Top bar: Nav + verification badge */}
        <div className="flex items-center justify-between mb-6 text-xs print:hidden">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-900 font-medium transition-colors flex items-center gap-1"
          >
            ← Inicio
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verificado por Open Badges v2 (Hosted)</span>
            </span>
          </div>
        </div>

        {/* Certificate Card */}
        <div
          id="certificate-print-area"
          className="bg-white rounded-xl shadow-md border border-slate-200 p-8 sm:p-14 relative overflow-hidden"
        >
          {/* Subtle top Google quad-color line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <div className="h-full w-1/4 bg-[#4285F4]" />
            <div className="h-full w-1/4 bg-[#EA4335]" />
            <div className="h-full w-1/4 bg-[#FBBC05]" />
            <div className="h-full w-1/4 bg-[#34A853]" />
          </div>

          {/* Header: Logo and Issuer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-8 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <img
                src="/logo/logo.svg"
                alt="GDGoC UHU"
                className="h-12 w-auto object-contain"
              />
            </div>
            <div className="text-right sm:text-right">
              <span className="text-xs uppercase tracking-wider text-slate-600 font-semibold block">
                {isHackathon ? "Certificado de Logro" : "Certificado de Participación"}
              </span>
              <span className="text-xs text-slate-500">
                {issuer.name}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="text-center my-8">
            <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold mb-2">
              Se certifica que
            </p>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mb-6 tracking-tight">
              {assertion.recipient.name || "Participante"}
            </h1>

            <p className="text-xs uppercase tracking-wider text-slate-600 font-medium mb-2">
              Ha participado satisfactoriamente en
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
              {badge.name}
            </h2>

            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed mb-6">
              {badge.description}
            </p>

            {/* Optional Badges (Rank, Group, Role) */}
            {(assertion.metadata?.rank || assertion.metadata?.group || assertion.metadata?.role) && (
              <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                {assertion.metadata?.rank && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                    {assertion.metadata.rank}
                  </span>
                )}
                {assertion.metadata?.group && (
                  <span className="px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                    Grupo: {assertion.metadata.group}
                  </span>
                )}
                {assertion.metadata?.role && (
                  <span className="px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                    Rol: {assertion.metadata.role}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 max-w-md mx-auto pt-6 border-t border-slate-100 mb-8 text-center">
            <div>
              <div className="h-10 flex items-center justify-center">
                <span className="font-serif italic text-lg text-slate-700 select-none">
                  Dirección GDGoC
                </span>
              </div>
              <div className="w-32 h-px bg-slate-300 mx-auto my-1" />
              <p className="text-xs font-semibold text-slate-800">
                Lead GDGoC UHU
              </p>
              <p className="text-[11px] text-slate-500">Google Developer Group on Campus</p>
            </div>

            <div>
              <div className="h-10 flex items-center justify-center">
                <span className="font-serif italic text-lg text-slate-700 select-none">
                  Coordinación UHU
                </span>
              </div>
              <div className="w-32 h-px bg-slate-300 mx-auto my-1" />
              <p className="text-xs font-semibold text-slate-800">
                Faculty Advisor
              </p>
              <p className="text-[11px] text-slate-500">Universidad de Huelva</p>
            </div>
          </div>

          {/* Certificate Metadata Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span>ID:</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold select-all">
                {assertion.id}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span>Fecha: {formattedDate}</span>
              <span>•</span>
              <span className="text-slate-600">Emisor: GDGoC Universidad de Huelva</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Clean & Direct */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 print:hidden">
          {/* Add to LinkedIn */}
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#0077b5] hover:bg-[#006396] text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <LinkedInIcon className="w-4 h-4 fill-white" />
            <span>Añadir a LinkedIn</span>
          </a>

          {/* Print / PDF */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Imprimir / Guardar PDF</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">¡Enlace copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-500" />
                <span>Copiar enlace</span>
              </>
            )}
          </button>

          {/* Show QR */}
          <button
            onClick={() => setShowQr(!showQr)}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <QrCode className="w-4 h-4 text-slate-500" />
            <span>Código QR</span>
          </button>

          {/* View Raw Open Badges JSON */}
          <button
            onClick={() => setShowJson(!showJson)}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Code2 className="w-4 h-4 text-slate-500" />
            <span>Ver JSON Open Badges</span>
          </button>
        </div>

        {/* QR Code view */}
        {showQr && qrCodeUrl && (
          <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 max-w-xs mx-auto text-center shadow-sm print:hidden">
            <img src={qrCodeUrl} alt="QR Code" className="w-44 h-44 mx-auto mb-2" />
            <p className="text-[11px] text-slate-500 font-mono break-all">{certUrl}</p>
          </div>
        )}

        {/* Open Badges Raw JSON view */}
        {showJson && (
          <div className="mt-4 p-4 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 text-xs font-mono shadow-sm print:hidden">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-slate-400">Endpoint: /api/badges/assertion/{assertion.id}</span>
              <a
                href={badgeCheckUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Validar en BadgeCheck.io</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <pre className="overflow-x-auto text-[11px] p-2 leading-tight">
              {JSON.stringify(rawAssertionJson, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
          }
          #certificate-print-area {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            margin: 0 !important;
            padding: 2.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
