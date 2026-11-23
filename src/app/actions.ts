"use server";

import { supabaseConfigured } from "@/lib/config";
import { publicClient } from "@/lib/supabase/clients";

export interface FormState {
  ok: boolean;
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeNewsletter(_prev: FormState, formData: FormData): Promise<FormState> {
  // Champ piège : un robot le remplit, un humain ne le voit pas.
  if (String(formData.get("website") ?? "")) return { ok: true, message: "Merci !" };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) return { ok: false, message: "Adresse e-mail invalide." };
  if (formData.get("consent") !== "on") return { ok: false, message: "Veuillez accepter de recevoir la newsletter." };

  if (!supabaseConfigured) return { ok: true, message: "Mode démonstration : inscription non enregistrée." };

  const { error } = await publicClient().from("newsletter_subscribers").insert({ email, consent: true });
  if (error && error.code !== "23505") {
    console.error("[newsletter]", error.message);
    return { ok: false, message: "Inscription impossible pour le moment. Réessayez plus tard." };
  }
  // 23505 = déjà inscrit : on répond pareil pour ne pas révéler les adresses connues.
  return { ok: true, message: "Merci ! Vous êtes inscrit(e) à la newsletter." };
}

export async function sendContact(_prev: FormState, formData: FormData): Promise<FormState> {
  if (String(formData.get("website") ?? "")) return { ok: true, message: "Message envoyé." };

  // Un humain met plus de 3 secondes à remplir le formulaire.
  const opened = Number(formData.get("t") ?? 0);
  if (!opened || Date.now() - opened < 3000) return { ok: false, message: "Veuillez réessayer dans un instant." };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 150);
  const message = String(formData.get("message") ?? "").trim();

  if (!name || name.length > 120) return { ok: false, message: "Indiquez votre nom." };
  if (!EMAIL_RE.test(email)) return { ok: false, message: "Adresse e-mail invalide." };
  if (message.length < 5 || message.length > 5000) return { ok: false, message: "Le message doit contenir entre 5 et 5000 caractères." };
  if ((message.match(/https?:\/\//g) ?? []).length > 3) return { ok: false, message: "Trop de liens dans le message." };

  if (!supabaseConfigured) return { ok: true, message: "Mode démonstration : message non enregistré." };

  const { error } = await publicClient().from("contact_messages").insert({ name, email, subject, message });
  if (error) {
    console.error("[contact]", error.message);
    return { ok: false, message: "Envoi impossible pour le moment. Écrivez-nous par e-mail." };
  }
  return { ok: true, message: "Message envoyé. Nous vous répondrons dès que possible." };
}
