export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://mariscosquiroa.com/#business",
    name: "Mariscos Quiroa",
    alternateName: "Distribuidora Mariscos Quiroa",
    description:
      "Distribuidora de pescados y mariscos frescos en Rosarito, Baja California. Mayoreo y menudeo con entrega a domicilio.",
    url: "https://mariscosquiroa.com",
    telephone: "+526636999689",
    email: "ventas@mariscosquiroa.com",
    image: "https://mariscosquiroa.com/logo.png",
    logo: "https://mariscosquiroa.com/logo.png",
    priceRange: "$$",
    currenciesAccepted: "MXN",
    paymentAccepted: "Efectivo, Transferencia, Tarjeta de crédito, Tarjeta de débito",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Carretera Tijuana-Ensenada (Libre), Terrazas del Pacífico, Popotla",
      addressLocality: "Playas de Rosarito",
      addressRegion: "Baja California",
      postalCode: "22716",
      addressCountry: "MX",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 32.284,
      longitude: -117.032,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "07:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "07:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "08:00",
        closes: "13:00",
      },
    ],
    areaServed: [
      { "@type": "City", name: "Rosarito" },
      { "@type": "City", name: "Tijuana" },
      { "@type": "City", name: "Ensenada" },
      { "@type": "City", name: "Mexicali" },
      { "@type": "City", name: "San Quintín" },
    ],
    sameAs: [
      "https://www.facebook.com/profile.php?id=61594028451624",
      "https://www.instagram.com/mariscos.quiroa/",
      "https://tiktok.com/@mariscosquiroa",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "3",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
