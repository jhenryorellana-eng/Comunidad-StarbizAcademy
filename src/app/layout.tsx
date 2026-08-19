import type { Metadata } from "next";
import { Inter, Lora, Sora } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/client";
import { siteUrl } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

// This app is fully data/session-driven — never prerender at build time
// (avoids hitting the database during `next build`).
export const dynamic = "force-dynamic";

// Base absoluta para las imágenes de Open Graph (miniaturas al compartir).
// La lógica vive en `lib/site.ts`: estaba duplicada aquí y en `lib/stripe.ts`,
// y esta copia usaba `??`, que no atrapa la cadena vacía — con la variable
// declarada pero vacía, `new URL("")` tiraba el layout raíz entero.
const base = siteUrl();

const TITLE = "StarbizAcademy — El Ecosistema Familiar";
const DESCRIPTION =
  "CEO Junior para adolescentes 14+ y Padres 3.0 para la familia. Un solo universo, dos plataformas sincronizadas, respaldadas por la metodología GÉNESIS i7™.";

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "StarbizAcademy",
    type: "website",
    locale: "es_ES",
    images: [{ url: "/og-image.jpg", width: 1024, height: 1024, alt: "StarbizAcademy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${inter.variable} ${lora.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
