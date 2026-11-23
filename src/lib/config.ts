export const SITE = {
  name: "NENO ACTU",
  tagline: "L'information qui vous rapproche.",
  description:
    "NENO ACTU, le média numérique de l'actualité congolaise : RDC, politique, société, économie, sports et culture, pour la RDC et la diaspora.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nenoactu.cd").replace(/\/$/, ""),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@nenoactu.cd",
  locale: "fr_CD",
  /** Renseignées par variables d'environnement ; les réseaux absents ne s'affichent pas. */
  social: {
    Facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL,
    X: process.env.NEXT_PUBLIC_X_URL,
    YouTube: process.env.NEXT_PUBLIC_YOUTUBE_URL,
  } as Record<string, string | undefined>,
} as const;

/** Rubriques utilisées quand la base n'est pas encore configurée. */
export const DEFAULT_CATEGORIES = [
  { name: "RDC", slug: "rdc", description: "Actualités des provinces et institutions congolaises." },
  { name: "Politique", slug: "politique", description: "Institutions, gouvernance, élections et décisions publiques." },
  { name: "Sécurité", slug: "securite", description: "Sécurité, prévention et informations humanitaires vérifiées." },
  { name: "Société", slug: "societe", description: "Vie quotidienne, santé, environnement et faits de société." },
  { name: "Économie", slug: "economie", description: "Commerce, entreprises, finances et développement." },
  { name: "Éducation", slug: "education", description: "Écoles, universités, bourses et formations." },
  { name: "Afrique & International", slug: "afrique-international", description: "Actualités africaines et mondiales." },
  { name: "Technologie", slug: "technologie", description: "Innovation, numérique et télécommunications." },
  { name: "Sports", slug: "sports", description: "Football et autres disciplines sportives." },
  { name: "Culture", slug: "culture", description: "Musique, arts, patrimoine et événements." },
  { name: "Vidéos", slug: "videos", description: "Reportages, interviews et formats vidéo." },
  { name: "Opinions", slug: "opinions", description: "Chroniques et tribunes clairement identifiées comme telles." },
] as const;

export const PAGE_SIZE = 12;

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
