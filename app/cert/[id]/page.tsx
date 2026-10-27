import React from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getAssertion, getBadgeClass, getIssuer } from "@/lib/db";
import CertificateViewer from "./CertificateViewer";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface CertPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CertPageProps): Promise<Metadata> {
  const { id } = await params;
  const assertion = getAssertion(id);
  if (!assertion) {
    return { title: "Certificado no encontrado" };
  }
  const badge = getBadgeClass(assertion.badgeClassId);
  const issuer = getIssuer();
  const recipientName = assertion.recipient.name || "Participante";
  const badgeName = badge?.name || "Insignia";

  return {
    title: `${badgeName} - Certificate - ${recipientName} | ${issuer.name}`,
    description: `Certificado oficial emitido a ${recipientName} por ${issuer.name}. Verificado por Open Badges v2.0.`,
    openGraph: {
      title: `${badgeName} - Certificado de ${recipientName}`,
      description: `Certificado verificado emitido por ${issuer.name}.`,
      images: [badge?.image || issuer.image]
    }
  };
}

export default async function CertPage({ params }: CertPageProps) {
  const { id } = await params;
  const assertion = getAssertion(id);

  if (!assertion) {
    notFound();
  }

  const badge = getBadgeClass(assertion.badgeClassId);
  if (!badge) {
    notFound();
  }

  const issuer = getIssuer();
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";

  return (
    <CertificateViewer
      assertion={assertion}
      badge={badge}
      issuer={issuer}
      host={host}
    />
  );
}
