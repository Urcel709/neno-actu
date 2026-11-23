import { supabaseConfigured } from "@/lib/config";

export function DemoNotice() {
  if (supabaseConfigured) return null;
  return (
    <div className="bg-ink text-center text-xs text-gray-200">
      <p className="container-page py-2">
        <strong className="text-white">Mode démonstration</strong> — contenu fictif. Connectez Supabase (voir README) pour afficher les vraies publications.
      </p>
    </div>
  );
}
