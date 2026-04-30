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
    const { user_id: userId, email } = await req.json();

    if (!userId && !email) {
      return jsonResponse({ error: "user_id or email is required" }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    let resolvedUserId = userId;
    let resolvedEmail = email;

    if (resolvedUserId) {
      const { data: userResult, error: userError } = await supabase.auth.admin.getUserById(resolvedUserId);

      if (userError || !userResult.user?.email) {
        return jsonResponse({ error: "User not found" }, 404);
      }

      resolvedEmail = userResult.user.email;
    } else {
      const { data: profile, error: profileLookupError } = await supabase
        .from("profiles")
        .select("id, email, is_verified")
        .eq("email", resolvedEmail)
        .maybeSingle();

      if (profileLookupError) {
        return jsonResponse({ error: profileLookupError.message }, 500);
      }

      if (!profile?.id || !profile.email) {
        return jsonResponse({ error: "User not found" }, 404);
      }

      if (profile.is_verified) {
        return jsonResponse({ message: "Email is already verified" });
      }

      resolvedUserId = profile.id;
      resolvedEmail = profile.email;
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
      .eq("id", resolvedUserId);

    if (profileError) {
      return jsonResponse({ error: profileError.message }, 500);
    }

    await sendVerificationEmail({
      to: resolvedEmail,
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
