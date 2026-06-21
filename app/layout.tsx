import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

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
      <body className="min-h-full flex flex-col">

        {/* ===== GOOGLE TAG MANAGER (BODY) ===== */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MJ2Q365N"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* ===== GOOGLE TAG MANAGER (SCRIPT) ===== */}
        <Script id="gtm" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({
                'gtm.start': new Date().getTime(),
                event:'gtm.js'
              });

              var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),
                  dl=l!='dataLayer' ? '&l='+l : '';

              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;

              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-MJ2Q365N');
          `}
        </Script>
        
        {children}

      </body>
    </html>
  );
}
