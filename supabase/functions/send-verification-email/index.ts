import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import {
  corsHeaders,
  createExpiryDate,
  generateVerificationToken,
  hashVerificationToken,
  jsonResponse,
} from "../_shared/emailVerification.ts";
import { sendVerificationEmail } from "../_shared/emailService.ts";

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
    const { user_id: userId } = await req.json();

    if (!userId) {
      return jsonResponse({ error: "user_id is required" }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: userResult, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !userResult.user?.email) {
      return jsonResponse({ error: "User not found" }, 404);
    }

    const rawToken = generateVerificationToken();
    const tokenHash = await hashVerificationToken(rawToken);
    const tokenExpiry = createExpiryDate();

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        is_verified: false,
        verification_token: tokenHash,
        token_expiry: tokenExpiry,
      })
      .eq("id", userResult.user.id);

    if (profileError) {
      return jsonResponse({ error: profileError.message }, 500);
    }

    await sendVerificationEmail({
      to: userResult.user.email,
      token: rawToken,
    });

    return jsonResponse({ message: "Verification email sent" });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unable to send verification email" },
      500,
    );
  }
});
