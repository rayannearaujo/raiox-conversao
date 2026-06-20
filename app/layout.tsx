import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raio-X de Conversão | Ascenda Web",
  description:
    "Descubra por que seu site não está gerando os clientes que deveria. Análise gratuita de conversão, confiança e visibilidade em segundos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
