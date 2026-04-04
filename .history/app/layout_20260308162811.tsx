import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "22 cofres de cumpleaños",
  description: "Sorpresa gamer de cumpleaños",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}