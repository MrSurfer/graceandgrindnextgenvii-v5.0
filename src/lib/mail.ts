import { Resend } from "resend";
import { env } from "./env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendEmail({
  to,
  subject,
  html,
  from = "GraceAndGrind <onboarding@resend.dev>", // Default Resend test domain
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  if (!resend) {
    console.warn("⚠️ Resend API key missing. Email not sent:", { to, subject });
    return { error: "Email provider not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return { error };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("❌ Email failed:", error);
    return { error: error.message };
  }
}
