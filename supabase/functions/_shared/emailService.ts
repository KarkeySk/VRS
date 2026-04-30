const resendApiKey = Deno.env.get("RESEND_API_KEY");
const emailFrom = Deno.env.get("EMAIL_FROM");
const appUrl = Deno.env.get("APP_URL") ?? "https://yourdomain.com";

type VerificationEmailInput = {
  to: string;
  token: string;
};

export async function sendVerificationEmail({ to, token }: VerificationEmailInput) {
  if (!resendApiKey || !emailFrom) {
    throw new Error("Email service is not configured");
  }

  const verificationUrl = `${appUrl.replace(/\/$/, "")}/verify?token=${encodeURIComponent(token)}`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to,
      subject: "Verify your email address",
      html: `
        <p>Welcome to Bhatbhate.</p>
        <p>Verify your email address using this link:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link expires in 30 minutes.</p>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error(await readEmailServiceError(response));
  }
}

async function readEmailServiceError(response: Response) {
  const message = await response.text();

  try {
    const body = JSON.parse(message);
    return body?.message || "Email service failed";
  } catch {
    return message || "Email service failed";
  }
}
