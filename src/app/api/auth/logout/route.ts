import { jsonError, jsonOk } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return jsonOk({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function GET() {
  try {
    await requireAuth();
    return jsonOk({ authenticated: true });
  } catch (error) {
    return jsonError(error);
  }
}
