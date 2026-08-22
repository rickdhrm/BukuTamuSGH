import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Backoffice — Buku Tamu SGH Tower",
  description:
    "Dashboard manajemen tamu untuk resepsionis dan staf keamanan SGH Tower.",
};

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
