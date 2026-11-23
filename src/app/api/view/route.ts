import { NextResponse } from "next/server";
import { supabaseConfigured } from "@/lib/config";
import { publicClient } from "@/lib/supabase/clients";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  try {
    const { id } = (await req.json()) as { id?: string };
    if (!id || !UUID.test(id) || !supabaseConfigured) return NextResponse.json({ ok: false }, { status: 400 });
    await publicClient().rpc("track_view", { p_article: id });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
