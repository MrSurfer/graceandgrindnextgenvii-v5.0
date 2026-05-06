import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;

  // Static routes
  const staticRoutes = [
    "",
    "/courses",
    "/about",
    "/login",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic course routes
  const courses = await prisma.course.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const courseRoutes = courses.map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: course.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Dynamic lesson routes
  const lessons = await prisma.lesson.findMany({
    where: { 
      status: "PUBLISHED",
      course: { published: true }
    },
    select: { 
      slug: true, 
      updatedAt: true,
      course: { select: { slug: true } }
    },
  });

  const lessonRoutes = lessons.map((lesson) => ({
    url: `${baseUrl}/courses/${lesson.course.slug}/${lesson.slug}`,
    lastModified: lesson.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...courseRoutes, ...lessonRoutes];
}
