import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { supabaseConfigured } from "@/lib/config";
import { SetupNotice } from "../SetupNotice";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Connexion — Administration", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  return (
    <div className="grid min-h-screen place-items-center bg-soft px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl">Espace rédaction</h1>
          <p className="mb-6 mt-1 text-sm text-gray-600">Connectez-vous pour accéder à l'administration.</p>
          {!supabaseConfigured ? (
            <SetupNotice />
          ) : (
            <>
              {e === "acces" && (
                <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-brand">
                  Ce compte n'a pas accès à l'administration.
                </p>
              )}
              <LoginForm />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
