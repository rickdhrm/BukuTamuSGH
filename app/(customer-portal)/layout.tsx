import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Portal — Buku Tamu SGH Tower",
  description:
    "Formulir pendaftaran tamu digital untuk SGH Tower. Silakan isi data diri Anda untuk melakukan check-in.",
};

export default function CustomerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
