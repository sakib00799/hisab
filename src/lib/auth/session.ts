import { createClient } from "@/lib/supabase/server";
import { unauthorized } from "@/lib/errors";

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAuth() {
  const user = await getSession();
  if (!user) throw unauthorized();
  return user;
}
