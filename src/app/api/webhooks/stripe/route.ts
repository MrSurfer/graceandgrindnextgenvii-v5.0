import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";

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

    // Revalidate paths so the user sees the enrollment immediately
    revalidatePath("/");
    revalidatePath("/courses");
    revalidatePath(`/courses/${session.metadata?.courseSlug || ""}`);

    console.log(`✅ Enrolled user ${userId} in course ${courseId}`);
  }

  return NextResponse.json({ received: true });
}
