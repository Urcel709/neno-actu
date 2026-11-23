# NENO ACTU

> *L'information qui vous rapproche.*

Portail d'actualités pour la RDC et la diaspora, réalisé d'après le cahier des charges de novembre 2026.
Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (PostgreSQL, Auth, Storage) · Vercel.

## Démarrage rapide (mode démonstration)

Sans aucune configuration, le site fonctionne avec du contenu fictif :

```bash
npm install
npm run dev
```

Ouvrez <http://localhost:3000>. Un bandeau « Mode démonstration » le signale ; l'administration affiche
les étapes de configuration.

## Passer en production avec Supabase

1. **Projet Supabase** — créez-en un sur <https://supabase.com>.
2. **Schéma** — *SQL Editor* → collez et exécutez `supabase/schema.sql` (tables, RLS, rubriques, stockage).
3. **Variables** — copiez `.env.example` en `.env.local` et renseignez URL, clé `anon` et clé `service_role`.
4. **Désactivez les inscriptions publiques** — *Authentication → Sign In / Providers → Allow new users to sign up : off*.
   Les comptes de la rédaction sont créés depuis l'administration.
5. **Premier super administrateur** — *Authentication → Users → Add user* (e-mail + mot de passe), puis dans le SQL Editor :
   ```sql
   update public.profiles set role = 'super_admin', display_name = 'Votre nom'
   where id = (select id from auth.users where email = 'vous@exemple.com');
   ```
6. Connectez-vous sur `/admin`.

### Déploiement (Vercel)

Importez le dépôt, ajoutez les variables d'environnement du `.env.example`, déployez. Ajoutez le domaine
`nenoactu.cd` (si disponible) puis pointez le DNS (Cloudflare en option). Vérifiez ensuite le site dans
Google Search Console avec `https://nenoactu.cd/sitemap.xml`.

## Ce qui est livré (Version 1)

| Cahier des charges | Réalisation |
|---|---|
| Accueil : flash, à la une, dernières, rubriques, populaires, vidéos, newsletter | `src/app/page.tsx` |
| 12 rubriques, pagination, fil d'Ariane | `[category]`, `Pagination`, `Breadcrumb` |
| Article : chapô, auteur, dates, image/vidéo, sources, partage WhatsApp/Facebook/X, articles liés | `[category]/[slug]` |
| Recherche, auteur, vidéos, contact (anti-spam), à propos, rédaction, pages légales | pages dédiées |
| SEO : URLs lisibles, Open Graph, NewsArticle, sitemap, robots, canonical | `generateMetadata`, `sitemap.ts`, `robots.ts` |
| Administration : tableau de bord, articles, rubriques, utilisateurs, médiathèque, messages | `src/app/admin` |
| 6 rôles + permissions côté serveur **et** RLS | `lib/workflow.ts`, `supabase/schema.sql` |
| Circuit éditorial `draft → pending_review → approved → scheduled → published / rejected` avec historique | actions admin + trigger SQL |
| Programmation de publication | un article `scheduled` devient public à l'échéance, sans tâche planifiée |
| Journal d'audit (connexion, publication, suppression, rôles) | table `audit_logs` |
| Consultations sans donnée personnelle | `article_views` (compteur par jour) |

Les rôles sont **toujours lus en base** (jamais depuis le navigateur) ; un trigger SQL empêche toute
élévation de privilèges.

## À faire avant le lancement

- **Pages légales** (`mentions-legales`, `confidentialite`, `conditions`) : textes de base à compléter
  (directeur de la publication, enregistrement) et **à faire valider par un professionnel du droit en RDC**.
- **Domaine** `nenoactu.cd` : disponibilité à vérifier. Adresse de contact : variable `NEXT_PUBLIC_CONTACT_EMAIL`.
- **Réseaux sociaux** : variables `NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_X_URL`, `NEXT_PUBLIC_YOUTUBE_URL`.
- **Authentification à deux facteurs** pour les comptes privilégiés : à activer via Supabase MFA (TOTP) — non incluse dans cette version.
- **Limitation des tentatives de connexion** : Supabase Auth applique ses limites ; un limiteur local best-effort s'y ajoute.
- **Sauvegardes** : activer les sauvegardes Supabase (plan Pro pour la restauration à un instant donné) et tester une restauration.
- **Analyse d'audience** : brancher l'outil de votre choix (Plausible, Umami, GA4) dans `src/app/layout.tsx`.
- Tester le partage WhatsApp avec un vrai article publié (aperçu Open Graph).

## Feuille de route

- **V2** : commentaires modérés (table `comments` déjà créée), envoi de la newsletter, statistiques avancées, notifications.
- **V3** : PWA, publicité, abonnements, réseau de correspondants provinciaux.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm run typecheck` | Vérification TypeScript |
