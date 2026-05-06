import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { sendEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { courseId, userId } = session.metadata ?? {};

    if (!courseId || !userId) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    // Create enrollment — upsert in case of duplicate webhook delivery
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: {
        userId,
        courseId,
        stripePaymentId: session.payment_intent as string,
      },
      update: {
        stripePaymentId: session.payment_intent as string,
      },
    });

    // Fetch details for email
    const [user, course] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }),
      prisma.course.findUnique({ where: { id: courseId }, select: { title: true } })
    ]);

    if (user && course) {
      await sendEmail({
        to: user.email,
        subject: `Welcome to ${course.title}!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
            <h1 style="color: #f59e0b;">Mastery Confirmed!</h1>
            <p>Hi ${user.name || 'there'},</p>
            <p>You've successfully secured your place in <strong>${course.title}</strong>.</p>
            <p>Your journey toward parenting excellence starts now:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/courses" style="display: inline-block; background-color: #f59e0b; color: #000; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px;">Begin Mastery</a>
            <p style="margin-top: 30px; color: #6b7280; font-size: 0.875rem;">Grace & Grind is honored to support your parenting journey.</p>
          </div>
        `
      });
    }

    console.log(`✅ Enrolled user ${userId} in program ${courseId} and sent mastery confirmation email.`);
  }

  return NextResponse.json({ received: true });
}
