import { DEFAULT_CATEGORIES } from "./config";
import type { Article, Author, Category } from "./types";

/**
 * Contenu de démonstration, affiché tant que Supabase n'est pas configuré.
 * Ce sont des textes génériques et fictifs, sans lien avec des événements réels.
 */

export const DEMO_CATEGORIES: Category[] = DEFAULT_CATEGORIES.map((c, i) => ({
  id: `demo-cat-${c.slug}`,
  name: c.name,
  slug: c.slug,
  description: c.description,
  sort_order: i + 1,
}));

const cat = (slug: string) => DEMO_CATEGORIES.find((c) => c.slug === slug)!;

export const DEMO_AUTHORS: Author[] = [
  { id: "demo-a1", name: "Rédaction NENO ACTU", slug: "redaction", bio: "Le collectif de la rédaction de NENO ACTU : enquêtes, reportages et suivi de l'actualité.", avatar_url: null },
  { id: "demo-a2", name: "Desk Économie", slug: "desk-economie", bio: "Commerce, entreprises, finances et développement : le regard de la rubrique économique.", avatar_url: null },
  { id: "demo-a3", name: "Desk Sports", slug: "desk-sports", bio: "Football et autres disciplines : résultats, analyses et portraits.", avatar_url: null },
];

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

interface Seed {
  title: string;
  cat: string;
  author: number;
  hours: number;
  excerpt: string;
  body: string;
  flash?: boolean;
  featured?: boolean;
  opinion?: boolean;
  video?: string;
  tags?: string[];
}

const LOREM_SOURCES = "Contenu de démonstration — aucune source réelle.";

const seeds: Seed[] = [
  {
    title: "Rentrée scolaire : les points à vérifier avant d'inscrire son enfant",
    cat: "education",
    author: 0,
    hours: 2,
    featured: true,
    excerpt:
      "Frais, documents, calendrier, transport : une check-list pratique pour les parents afin d'aborder la rentrée sereinement.",
    body: `Chaque année, la rentrée scolaire met les familles sous pression. Anticiper les démarches évite bien des difficultés.

## Les documents à rassembler

Acte de naissance, bulletin de l'année précédente, photos d'identité et carnet de vaccination figurent presque toujours sur la liste. Prévoyez des copies de chaque pièce.

## Comprendre les frais

Demandez à l'établissement le détail écrit des frais : inscription, fournitures, uniformes, activités. Conservez les reçus.

> Un budget détaillé dès le départ permet d'éviter les mauvaises surprises en cours d'année.

## Préparer le quotidien

- Trajet et transport : testez-le avant le premier jour
- Repas : renseignez-vous sur les possibilités sur place
- Santé : signalez toute allergie ou information importante

*Ce texte est un contenu de démonstration.*`,
    tags: ["Rentrée", "Famille"],
  },
  {
    title: "Petits commerçants : comment mieux suivre ses ventes avec un simple carnet numérique",
    cat: "economie",
    author: 1,
    hours: 4,
    excerpt:
      "Enregistrer chaque vente, suivre le stock et les crédits clients : les bases d'une gestion qui fait la différence.",
    body: `Pour un petit commerce, savoir ce qui se vend vraiment est la première condition pour grandir.

## Trois chiffres à suivre chaque semaine

Le chiffre d'affaires, le coût d'achat des marchandises et les sommes dues par les clients. Ces trois repères donnent une image fidèle de la santé de la boutique.

## Éviter les ruptures de stock

Notez les produits qui partent vite et fixez un seuil d'alerte. Réapprovisionner avant la rupture évite de perdre des ventes.

## Les crédits clients

Inscrivez chaque crédit avec une date et un montant. Un suivi régulier limite les impayés tout en préservant la relation avec les clients.

*Ce texte est un contenu de démonstration.*`,
    tags: ["Commerce", "Gestion"],
  },
  {
    title: "Football : ce que l'on attend des prochaines rencontres de championnat",
    cat: "sports",
    author: 2,
    hours: 6,
    excerpt: "Forme des équipes, enjeux du classement et joueurs à suivre : notre grille de lecture avant le coup d'envoi.",
    body: `La saison entre dans une phase décisive. Voici les éléments à surveiller.

## Les enjeux du classement

Plusieurs équipes se tiennent en quelques points. Chaque rencontre peut bouleverser la hiérarchie.

## Les joueurs à suivre

Les performances individuelles feront la différence, en particulier sur les phases arrêtées.

*Ce texte est un contenu de démonstration.*`,
    tags: ["Football"],
  },
  {
    title: "Connexion mobile : cinq réflexes pour économiser ses données au quotidien",
    cat: "technologie",
    author: 0,
    hours: 9,
    excerpt: "Mises à jour automatiques, vidéos en haute définition, applications en arrière-plan : où part votre forfait.",
    body: `Un forfait mobile se vide vite quand on ne sait pas où il part.

## Les réglages qui comptent

- Désactiver la lecture automatique des vidéos
- Télécharger les mises à jour uniquement en Wi-Fi
- Limiter les données en arrière-plan pour les applications peu utilisées

## Choisir la bonne qualité vidéo

Passer de la haute à la moyenne définition divise souvent la consommation par deux.

*Ce texte est un contenu de démonstration.*`,
    tags: ["Mobile", "Numérique"],
  },
  {
    title: "Santé : bien conserver ses médicaments en saison chaude",
    cat: "societe",
    author: 0,
    hours: 11,
    excerpt: "Chaleur, humidité, lumière : les erreurs fréquentes de stockage et les gestes simples pour les éviter.",
    body: `Un médicament mal conservé peut perdre en efficacité.

## Les bons gestes

Rangez les médicaments à l'abri de la lumière et de l'humidité, dans leur emballage d'origine. Évitez la salle de bain.

## En cas de doute

Demandez conseil à un pharmacien avant d'utiliser un produit dont l'aspect a changé.

*Ce texte est un contenu de démonstration.*`,
    tags: ["Santé"],
  },
  {
    title: "Festival de musique : un programme qui mêle rumba, hip-hop et créations nouvelles",
    cat: "culture",
    author: 0,
    hours: 14,
    excerpt: "Trois soirées, des artistes de plusieurs générations et des ateliers ouverts au public.",
    body: `La scène musicale continue de se renouveler.

## Un programme varié

Les organisateurs annoncent des soirées consacrées à la rumba, au hip-hop et aux jeunes créateurs.

## Des ateliers pour tous

Des ateliers d'initiation sont prévus en journée, ouverts au public.

*Ce texte est un contenu de démonstration.*`,
    tags: ["Musique"],
  },
  {
    title: "Climat et agriculture : les cultivateurs adaptent leurs calendriers",
    cat: "rdc",
    author: 0,
    hours: 18,
    excerpt: "Pluies irrégulières, semis décalés : des producteurs racontent comment ils s'ajustent.",
    body: `Dans plusieurs zones agricoles, le calendrier des semis n'est plus aussi prévisible.

## S'adapter saison après saison

Les cultivateurs échangent sur les variétés à cycle court et les techniques de conservation de l'eau.

*Ce texte est un contenu de démonstration.*`,
    tags: ["Agriculture", "Climat"],
  },
  {
    title: "Institutions : comprendre le rôle de chaque organe public en cinq minutes",
    cat: "politique",
    author: 0,
    hours: 22,
    excerpt: "Pouvoir exécutif, législatif, judiciaire : un guide pédagogique pour s'y retrouver.",
    body: `Savoir qui décide de quoi aide à mieux suivre l'actualité publique.

## Trois pouvoirs, trois missions

L'exécutif met en œuvre les politiques publiques, le législatif vote les lois et contrôle l'action du gouvernement, le judiciaire tranche les litiges.

*Ce texte est un contenu de démonstration.*`,
    tags: ["Institutions"],
  },
  {
    title: "Sécurité routière : les règles de prudence à rappeler avant les départs en voyage",
    cat: "securite",
    author: 0,
    hours: 26,
    excerpt: "Vérifications du véhicule, repos du conducteur, ceintures : l'essentiel à retenir.",
    body: `Avant un long trajet, quelques minutes de vérification peuvent éviter l'accident.

## Le véhicule

Pneus, freins, éclairage et niveaux : un contrôle rapide suffit.

## Le conducteur

Dormez suffisamment et faites une pause toutes les deux heures.

*Ce texte est un contenu de démonstration.*`,
    tags: ["Prévention"],
  },
  {
    title: "Commerce régional : pourquoi la fluidité des échanges transfrontaliers compte",
    cat: "afrique-international",
    author: 1,
    hours: 30,
    excerpt: "Délais, formalités, coûts : les freins que les commerçants citent le plus souvent.",
    body: `Les échanges entre pays voisins sont un moteur pour de nombreux commerçants.

## Trois freins fréquents

Les délais aux frontières, la multiplicité des formalités et le coût du transport.

*Ce texte est un contenu de démonstration.*`,
    tags: ["Commerce régional"],
  },
  {
    title: "Tribune : pourquoi la vérification des faits doit devenir un réflexe du lecteur",
    cat: "opinions",
    author: 0,
    hours: 34,
    opinion: true,
    excerpt: "Avant de partager une information, quelques secondes de vérification suffisent souvent à éviter une rumeur.",
    body: `Cette tribune engage son auteur et non la rédaction.

## Un geste simple

Qui parle ? Où est la source ? La date est-elle récente ? Ces trois questions écartent la plupart des fausses informations.

## Partager responsablement

Un message transféré sans vérification peut faire plus de mal qu'on ne l'imagine.

*Ce texte est un contenu de démonstration.*`,
    tags: ["Tribune"],
  },
  {
    title: "Reportage : une journée au marché, entre tradition et paiements mobiles",
    cat: "videos",
    author: 0,
    hours: 40,
    excerpt: "Immersion auprès de commerçantes qui ont adopté le paiement mobile sans renoncer à leurs habitudes.",
    body: `Reportage de démonstration : ce bloc accueille une vidéo YouTube, Vimeo ou un fichier MP4.

*Ce texte est un contenu de démonstration.*`,
    tags: ["Reportage"],
  },
  {
    title: "Flash : les services publics annoncent des horaires aménagés ce week-end",
    cat: "rdc",
    author: 0,
    hours: 1,
    flash: true,
    excerpt: "Information de démonstration pour illustrer le bandeau flash.",
    body: `Information de démonstration pour illustrer le bandeau flash.\n\n*Ce texte est un contenu de démonstration.*`,
  },
  {
    title: "Flash : point d'étape sur les travaux de réhabilitation des routes",
    cat: "societe",
    author: 0,
    hours: 3,
    flash: true,
    excerpt: "Information de démonstration pour illustrer le bandeau flash.",
    body: `Information de démonstration pour illustrer le bandeau flash.\n\n*Ce texte est un contenu de démonstration.*`,
  },
];

const slugOf = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const DEMO_ARTICLES: Article[] = seeds
  .map((s, i): Article => {
    const published = hoursAgo(s.hours);
    return {
      id: `demo-${i + 1}`,
      title: s.title,
      slug: slugOf(s.title),
      excerpt: s.excerpt,
      content: s.body,
      sources: LOREM_SOURCES,
      cover_url: null,
      cover_alt: "",
      status: "published",
      is_featured: Boolean(s.featured),
      is_flash: Boolean(s.flash),
      is_opinion: Boolean(s.opinion),
      video_url: s.video ?? null,
      seo_title: "",
      seo_description: "",
      published_at: published,
      updated_at: published,
      created_at: published,
      category: cat(s.cat),
      author: DEMO_AUTHORS[s.author],
      tags: (s.tags ?? []).map((t) => ({ name: t, slug: slugOf(t) })),
    };
  })
  .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
