export function SetupNotice() {
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
      <p className="font-bold">Supabase n'est pas configuré.</p>
      <ol className="mt-2 list-decimal space-y-1 pl-5">
        <li>Créez un projet Supabase et exécutez <code>supabase/schema.sql</code>.</li>
        <li>Copiez <code>.env.example</code> en <code>.env.local</code> et renseignez les clés.</li>
        <li>Relancez le serveur, puis créez le premier super administrateur (voir README).</li>
      </ol>
    </div>
  );
}
