import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    const { courseId } = await params;
    // Redirect to login, we'll come back after
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    const callbackUrl = course ? `/courses/${course.slug}` : "/courses";
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url));
  }

  const { courseId } = await params;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  // Check if already enrolled
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (existing) {
    return NextResponse.redirect(new URL(`/courses/${course.slug}`, req.url));
  }

  // Free course — enroll directly, no Stripe needed
  if (course.price === 0) {
    await prisma.enrollment.create({
      data: { userId: session.user.id, courseId },
    });
    
    // Ensure the cache is invalidated for the course page and others
    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/courses/${course.slug}`);
    revalidatePath(`/courses`);
    revalidatePath(`/profile`);
    revalidatePath(`/`);

    return NextResponse.redirect(new URL(`/courses/${course.slug}?enrolled=true`, req.url));
  }

  // Get the base URL directly from the current request URL (most reliable)
  const origin = new URL(req.url).origin;

  // Paid course — create Stripe Checkout Session
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(course.price * 100),
          product_data: {
            name: course.title,
            description: course.description,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      courseId: course.id,
      userId: session.user.id,
      courseSlug: course.slug,
    },
    success_url: `${origin}/courses/${course.slug}?enrolled=true`,
    cancel_url: `${origin}/courses/${course.slug}?cancelled=true`,
  });

  return NextResponse.redirect(new URL(checkoutSession.url!));
}
