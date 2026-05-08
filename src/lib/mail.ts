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
    console.warn("⚠️ Resend API key missing. Email not sent, but printing to console for local development:");
    console.log("----------------------------------------");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("----------------------------------------");
    
    // Extract 6-digit OTP if it exists
    const otpMatch = html.match(/>(\d{6})</);
    if (otpMatch) {
      console.log(`\n🔑🔑🔑 OTP CODE: ${otpMatch[1]} 🔑🔑🔑\n`);
    }

    // Extract reset link if it exists
    const linkMatch = html.match(/href="([^"]+)"/);
    if (linkMatch && html.includes("Reset your password")) {
      console.log(`\n🔗🔗🔗 RESET LINK: ${linkMatch[1]} 🔗🔗🔗\n`);
    }
    
    console.log("----------------------------------------");
    // We return success so the flow can continue locally
    return { success: true, data: { id: "local-dev-mock-id" } };
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
