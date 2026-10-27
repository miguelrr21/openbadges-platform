"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
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
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Printer,
  QrCode,
  Share2,
  ShieldCheck,
  Check,
  Code2,
  Calendar,
  Sparkles,
  Trophy,
  Users,
  Eye,
  Info
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
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showOpenBadgesModal, setShowOpenBadgesModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [activeTheme, setActiveTheme] = useState<"gdg" | "hackathon">(
    badge.theme === "hackathon" ? "hackathon" : "gdg"
  );
  const [simulatedUser, setSimulatedUser] = useState<string | null>(null);

  const certUrl = typeof window !== "undefined"
    ? `${window.location.origin}/cert/${assertion.id}`
    : `http://${host}/cert/${assertion.id}`;

  const assertionApiUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/badges/assertion/${assertion.id}`
    : `http://${host}/api/badges/assertion/${assertion.id}`;

  const badgeApiUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/badges/class/${badge.id}`
    : `http://${host}/api/badges/class/${badge.id}`;

  const issuerApiUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/badges/issuer`
    : `http://${host}/api/badges/issuer`;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : `http://${host}`;

  const linkedInUrl = generateLinkedInCertUrl(
    badge.name,
    issuer.name,
    assertion.id,
    assertion.issuedOn,
    baseUrl
  );
  const badgeCheckUrl = generateBadgeCheckUrl(assertion.id, baseUrl);

  // Trigger confetti once on initial load
  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    // Check stored user session from localStorage
    try {
      const stored = localStorage.getItem("openbadges_user_email");
      if (stored) {
        setSimulatedUser(stored);
      }
    } catch {
      // ignore
    }

    // Generate QR code
    QRCode.toDataURL(certUrl, { width: 280, margin: 2 })
      .then(setQrCodeDataUrl)
      .catch((err) => console.error("Error generating QR:", err));
  }, [certUrl]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClaimOrLogin = () => {
    if (assertion.recipient.email) {
      localStorage.setItem("openbadges_user_email", assertion.recipient.email);
      setSimulatedUser(assertion.recipient.email);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("openbadges_user_email");
    setSimulatedUser(null);
  };

  const isOwner =
    simulatedUser &&
    assertion.recipient.email &&
    simulatedUser.toLowerCase() === assertion.recipient.email.toLowerCase();

  const formattedDate = new Date(assertion.issuedOn).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const assertionJsonPreview = {
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      {/* Top Banner: Verification & Association Bar */}
      <div className="max-w-4xl mx-auto mb-6 print:hidden">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Open Badges v2 HostedBadge</span>
                <span className="text-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-medium px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  Verificado Oficialmente
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Emitido por <span className="font-medium text-slate-700 dark:text-slate-300">{issuer.name}</span>
              </p>
            </div>
          </div>

          {/* User state / Quick action */}
          <div className="flex items-center gap-2 text-xs">
            {isOwner ? (
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Asociado a tu cuenta ({simulatedUser})</span>
                <button
                  onClick={handleLogout}
                  className="underline hover:text-blue-800 ml-1 text-[11px]"
                >
                  (Cerrar sesión)
                </button>
              </div>
            ) : (
              <button
                onClick={handleClaimOrLogin}
                className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                title="Simula la sesión del participante titular"
              >
                <span>¿Es tu certificado?</span>
                <span className="text-blue-600 dark:text-blue-400 underline">Iniciar sesión</span>
              </button>
            )}

            {/* Theme switcher */}
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800">
              <button
                onClick={() => setActiveTheme("gdg")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeTheme === "gdg"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Estilo GDG
              </button>
              <button
                onClick={() => setActiveTheme("hackathon")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeTheme === "hackathon"
                    ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Estilo Hackathon
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Certificate Box */}
      <div className="max-w-4xl mx-auto">
        <div
          id="certificate-container"
          className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 ${
            activeTheme === "hackathon"
              ? "border-amber-200 dark:border-amber-900/50"
              : "border-slate-200 dark:border-slate-800"
          }`}
        >
          {/* Top Google Quad-color stripe */}
          <div className="h-2 w-full flex">
            <div className="h-full w-1/4 bg-[#4285F4]"></div>
            <div className="h-full w-1/4 bg-[#EA4335]"></div>
            <div className="h-full w-1/4 bg-[#FBBC05]"></div>
            <div className="h-full w-1/4 bg-[#34A853]"></div>
          </div>

          {/* Certificate Inner Padding */}
          <div className="p-8 sm:p-12 md:p-16 relative">
            {/* Background watermark / decorative seal */}
            <div className="absolute right-6 top-8 opacity-5 pointer-events-none">
              <Award className="w-72 h-72 text-slate-900 dark:text-white" />
            </div>

            {/* Header: Issuer Logo & Identification */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-8 mb-8">
              <div className="flex items-center gap-4">
                {/* Issuer Logo */}
                <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1.5 shadow-xs">
                  <img
                    src="/logo/logo.svg"
                    alt={issuer.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-tight">
                    {issuer.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Credencial Oficial Verificada • Open Badges Standard
                  </p>
                </div>
              </div>

              {/* Status / Achievement Pill */}
              <div>
                {activeTheme === "hackathon" ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-xs uppercase tracking-wide">
                    <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Event Achievement
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Participation
                  </span>
                )}
              </div>
            </div>

            {/* Center: Awarded Body */}
            <div className="text-center my-6">
              {/* Event Title */}
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
                {badge.name}
              </h1>

              {/* Dates */}
              <div className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{badge.eventDates || formattedDate}</span>
              </div>

              {/* Ceremony Salutation */}
              <p className="text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold mb-3">
                {activeTheme === "hackathon" ? "This is awarded to" : "This certificate is proudly presented to"}
              </p>

              {/* Recipient Full Name */}
              <div className="mb-6">
                <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-slate-900 dark:text-white border-b-2 border-slate-200 dark:border-slate-800 pb-3 max-w-xl mx-auto">
                  {assertion.recipient.name || "Recipient"}
                </h2>
              </div>

              {/* Narrative / Description */}
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
                {badge.description}
              </p>

              {/* Badges / Extra Metadata (Rank, Group, Role) */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
                {assertion.metadata?.rank && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                    <span>Rank: {assertion.metadata.rank}</span>
                  </div>
                )}
                {assertion.metadata?.group && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Group: {assertion.metadata.group}</span>
                  </div>
                )}
                {assertion.metadata?.role && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                    <span>Role: {assertion.metadata.role}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Signatures Section */}
            <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto pt-4 border-t border-slate-100 dark:border-slate-800/80 mb-8">
              {/* Signer 1: President */}
              <div className="text-center">
                <div className="h-12 flex items-center justify-center">
                  {/* Stylized Signature SVG */}
                  <span className="font-serif italic text-xl text-blue-600 dark:text-blue-400 select-none tracking-wider">
                    J. Arbeláez
                  </span>
                </div>
                <div className="w-36 h-px bg-slate-300 dark:bg-slate-700 mx-auto my-1"></div>
                <p className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  José Arbeláez Nieto
                </p>
                <p className="text-[11px] text-slate-400">President</p>
              </div>

              {/* Signer 2: Vicepresident */}
              <div className="text-center">
                <div className="h-12 flex items-center justify-center">
                  {/* Stylized Signature SVG */}
                  <span className="font-serif italic text-xl text-emerald-600 dark:text-emerald-400 select-none tracking-wider">
                    H. Tablero
                  </span>
                </div>
                <div className="w-36 h-px bg-slate-300 dark:bg-slate-700 mx-auto my-1"></div>
                <p className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  Héctor Tablero Díaz
                </p>
                <p className="text-[11px] text-slate-400">Vicepresident</p>
              </div>
            </div>

            {/* Certificate ID & Verification Info Footer */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
              <div className="flex items-center gap-2">
                <span>Certificate ID:</span>
                <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-700 dark:text-slate-300 font-semibold select-all">
                  {assertion.id}
                </code>
                <button
                  onClick={() => handleCopy(assertion.id)}
                  className="p-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  title="Copiar ID del certificado"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span>Issued on: {formattedDate}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Hosted Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
          {/* Add to LinkedIn */}
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#0077B5] hover:bg-[#006396] text-white px-4 py-3 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md active:scale-98"
          >
            <LinkedInIcon className="w-4 h-4 fill-white" />
            <span>Añadir a LinkedIn</span>
          </a>

          {/* Open Badges / Backpack */}
          <button
            onClick={() => setShowOpenBadgesModal(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md active:scale-98"
          >
            <Award className="w-4 h-4" />
            <span>Cartera OpenBadges</span>
          </button>

          {/* Print / PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-3 rounded-xl font-medium text-sm transition-all shadow-xs hover:shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>

          {/* Inspect Open Badges JSON */}
          <button
            onClick={() => setShowJsonModal(true)}
            className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-3 rounded-xl font-medium text-sm transition-all shadow-xs hover:shadow-sm"
          >
            <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Ver JSON Oficial</span>
          </button>
        </div>

        {/* Secondary Actions: QR & Share */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 print:hidden">
          <button
            onClick={() => setShowQrModal(true)}
            className="inline-flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>Ver código QR de verificación</span>
          </button>
          <span>•</span>
          <button
            onClick={() => handleCopy(certUrl)}
            className="inline-flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? "¡Enlace copiado!" : "Copiar enlace para compartir"}</span>
          </button>
          <span>•</span>
          <a
            href={badgeCheckUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Validar en BadgeCheck.io</span>
          </a>
        </div>
      </div>

      {/* MODAL 1: Open Badges / Backpack Dialog */}
      {showOpenBadgesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base">Cartera de Open Badges</h3>
              </div>
              <button
                onClick={() => setShowOpenBadgesModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              Open Badges es el estándar universal e interoperable para credenciales digitales verificables. Puedes añadir esta insignia a cualquiera de tus carteras digitales (backpacks):
            </p>

            <div className="space-y-3 mb-6">
              {/* Option 1: BadgeCheck Validation */}
              <a
                href={badgeCheckUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs group-hover:text-indigo-600">
                      Validador Oficial (BadgeCheck.io)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Comprueba la autenticidad técnica y criptográfica del badge
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </a>

              {/* Option 2: Badgr / Canvas Badges */}
              <a
                href={`https://badgr.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs group-hover:text-indigo-600">
                      Canvas Badges / Badgr Backpack
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Pega la URL del Assertion en tu mochila de badges
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </a>

              {/* Option 3: Download Assertion JSON file */}
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(assertionJsonPreview, null, 2)], {
                    type: "application/json"
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `openbadge-${assertion.id}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs group-hover:text-indigo-600">
                      Descargar archivo .JSON Open Badges
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Descarga el JSON crudo de la Assertion para importarlo manualmente
                    </p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">URL del Assertion:</span>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-[11px] text-slate-600 dark:text-slate-400 truncate flex-1 bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800">
                  {assertionApiUrl}
                </code>
                <button
                  onClick={() => handleCopy(assertionApiUrl)}
                  className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2.5 py-1.5 rounded font-medium hover:bg-indigo-100 transition-colors"
                >
                  {copied ? "¡Copiado!" : "Copiar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: JSON Inspector (Open Badges Hosted Endpoints) */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base">Endpoints Open Badges v2.0 (Hosted Verification)</h3>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <div className="text-xs text-slate-500 mb-3 space-y-1">
              <p>
                Como tú alojas los datos, los validadores de Open Badges confirman la autenticidad del certificado consultando estos 3 endpoints estándar:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={issuerApiUrl}
                  target="_blank"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  1. /api/badges/issuer <ExternalLink className="w-3 h-3" />
                </a>
                <span>•</span>
                <a
                  href={badgeApiUrl}
                  target="_blank"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  2. /api/badges/class/:id <ExternalLink className="w-3 h-3" />
                </a>
                <span>•</span>
                <a
                  href={assertionApiUrl}
                  target="_blank"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  3. /api/badges/assertion/:id <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Code Block */}
            <div className="bg-slate-950 text-slate-200 p-4 rounded-xl overflow-auto text-xs font-mono flex-1 border border-slate-800">
              <pre>{JSON.stringify(assertionJsonPreview, null, 2)}</pre>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">
                Verification type: HostedBadge (RFC / IMS Global Standard)
              </span>
              <button
                onClick={() => handleCopy(JSON.stringify(assertionJsonPreview, null, 2))}
                className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: QR Code Verification */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm">Escanea para verificar</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 inline-block mb-4 shadow-sm">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="Certificate QR Code" className="w-56 h-56 mx-auto" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                  Generando QR...
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 mb-2 font-mono break-all select-all">
              {certUrl}
            </p>

            <button
              onClick={() => handleCopy(certUrl)}
              className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              {copied ? "¡Enlace copiado!" : "Copiar enlace del certificado"}
            </button>
          </div>
        </div>
      )}

      {/* Print-specific stylesheet */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
          }
          #certificate-container {
            border: 2px solid #cbd5e1 !important;
            box-shadow: none !important;
            margin: 0 !important;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
