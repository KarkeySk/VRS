import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import {
  corsHeaders,
  hashVerificationToken,
  jsonResponse,
} from "../_shared/emailVerification.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Supabase service credentials are not configured" }, 500);
  }

  try {
    let body: { token?: unknown };

    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Request body must be valid JSON" }, 400);
    }

    const { token } = body;

    if (!token || typeof token !== "string") {
      return jsonResponse({ error: "Verification token is required" }, 400);
    }

    const tokenHash = await hashVerificationToken(token);
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, token_expiry")
      .eq("verification_token", tokenHash)
      .maybeSingle();

    if (profileError) {
      return jsonResponse({ error: profileError.message }, 500);
    }

    if (!profile) {
      return jsonResponse({ error: "Invalid verification token" }, 400);
    }

    if (!profile.token_expiry || new Date(profile.token_expiry).getTime() <= Date.now()) {
      return jsonResponse({ error: "Verification token has expired" }, 400);
    }

    const { data: verifiedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        is_verified: true,
        verification_token: null,
        token_expiry: null,
      })
      .eq("id", profile.id)
      .eq("verification_token", tokenHash)
      .select("id")
      .maybeSingle();

    if (updateError) {
      return jsonResponse({ error: updateError.message }, 500);
    }

    if (!verifiedProfile) {
      return jsonResponse({ error: "Invalid verification token" }, 400);
    }

    return jsonResponse({ message: "Email verified" });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unable to verify email" },
      500,
    );
  }
});
