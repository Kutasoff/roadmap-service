import "server-only";
import { notFound } from "next/navigation";
import { requireAuthUser } from "@/lib/session";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function getAdminContext() {
  const user = await requireAuthUser();
  const supabase = createSupabaseAdmin();

  const { data: profile } = await supabase
    .from("users")
    .select("org_id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) notFound();

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("id", profile.org_id)
    .single();

  if (!org) notFound();

  return { user, org, role: profile.role as string, supabase };
}
