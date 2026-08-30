import type { Metadata, Viewport } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import OrganizationSchema from "@/components/seo/OrganizationSchema";
import FaqSchema from "@/components/seo/FaqSchema";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getLocaleFromRequest } from "@/i18n/server";
import { defaultLocale } from "@/i18n/dictionaries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Mariscos Quiroa | Pescados y Mariscos Frescos en Baja California",
  description:
    "Distribuidora de pescados y mariscos frescos en Playas de Rosarito, Baja California. Mayoreo y menudeo con entrega a domicilio. Pulpo, camarón, calamar, callo de hacha, almejas, ostiones y más.",
  keywords: [
    "mariscos",
    "pescados frescos",
    "mayoreo mariscos",
    "menudeo mariscos",
    "Rosarito",
    "Baja California",
    "Tijuana",
    "Ensenada",
    "Popotla",
    "pulpo",
    "camarón",
    "callo de hacha",
    "ostiones",
    "Mariscos Quiroa",
  ],
  authors: [{ name: "Mariscos Quiroa" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Mariscos Quiroa | Pescados y Mariscos Frescos en Baja California",
    description:
      "El sabor del Pacífico en cada pedido. Distribuidora de mariscos frescos en Rosarito, BC. Mayoreo y menudeo con entrega a domicilio.",
    siteName: "Mariscos Quiroa",
    locale: "es_MX",
    type: "website",
    url: "https://mariscosquiroa.com",
    images: [
      {
        url: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/198b130d5c30.jpg",
        width: 1200,
        height: 630,
        alt: "Mariscos Quiroa — Distribuidora de mariscos frescos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mariscos Quiroa | Pescados y Mariscos Frescos",
    description:
      "El sabor del Pacífico en cada pedido. Mayoreo y menudeo de mariscos frescos en Rosarito, Baja California.",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/198b130d5c30.jpg"],
  },
  manifest: "/manifest.json",
  category: "food",
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocaleFromRequest();
  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <I18nProvider initialLocale={locale}>
          <OrganizationSchema />
          <FaqSchema />
          {children}
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}

// Re-export para uso en otros módulos
export { defaultLocale };
