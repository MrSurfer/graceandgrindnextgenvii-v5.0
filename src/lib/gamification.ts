import { prisma } from "@/lib/prisma";
import { differenceInDays, startOfDay } from "date-fns";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  color: string;
}

export interface GamificationProfile {
  points: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  totalLessonsCompleted: number;
  totalCoursesCompleted: number;
}

const POINTS_PER_LESSON = 50;
const POINTS_PER_COURSE = 200;

export async function getUserGamification(userId: string): Promise<GamificationProfile> {
  const [progresses, certificates] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId },
      orderBy: { completedAt: 'asc' }, // Ascending for streak calculation
    }),
    prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: 'asc' },
    })
  ]);

  const totalLessonsCompleted = progresses.length;
  const totalCoursesCompleted = certificates.length;

  const points = (totalLessonsCompleted * POINTS_PER_LESSON) + (totalCoursesCompleted * POINTS_PER_COURSE);

  // Calculate Streak
  let currentStreak = 0;
  let longestStreak = 0;
  let lastDate: Date | null = null;

  // Track unique days of activity
  const activityDays = new Set(
    progresses.map(p => startOfDay(p.completedAt).getTime())
  );
  
  const sortedDays = Array.from(activityDays).sort((a, b) => a - b).map(t => new Date(t));

  for (let i = 0; i < sortedDays.length; i++) {
    const day = sortedDays[i];
    if (!lastDate) {
      currentStreak = 1;
    } else {
      const diff = differenceInDays(day, lastDate);
      if (diff === 1) {
        currentStreak++;
      } else if (diff > 1) {
        currentStreak = 1; // Reset streak
      }
    }
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
    lastDate = day;
  }

  // Check if current streak is broken (no activity yesterday or today)
  if (lastDate) {
    const today = startOfDay(new Date());
    const diffToToday = differenceInDays(today, lastDate);
    if (diffToToday > 1) {
      currentStreak = 0;
    }
  }

  // Determine Badges
  const badges: Badge[] = [];

  if (totalLessonsCompleted >= 1) {
    badges.push({
      id: "first-steps",
      name: "First Steps",
      description: "Completed your first lesson.",
      icon: "Baby",
      earnedAt: progresses[0].completedAt,
      color: "text-green-500",
    });
  }

  if (totalLessonsCompleted >= 5) {
    badges.push({
      id: "dedicated-scholar",
      name: "Dedicated Scholar",
      description: "Completed 5 lessons.",
      icon: "BookOpen",
      earnedAt: progresses[4].completedAt,
      color: "text-blue-500",
    });
  }

  if (totalCoursesCompleted >= 1) {
    badges.push({
      id: "master-of-grace",
      name: "Master of Grace",
      description: "Completed an entire program.",
      icon: "Award",
      earnedAt: certificates[0].issuedAt,
      color: "text-amber-500",
    });
  }
  
  if (currentStreak >= 3) {
    badges.push({
      id: "on-fire",
      name: "On Fire",
      description: "Maintained a 3-day learning streak.",
      icon: "Flame",
      earnedAt: new Date(),
      color: "text-orange-500",
    });
  }

  return {
    points,
    currentStreak,
    longestStreak,
    badges,
    totalLessonsCompleted,
    totalCoursesCompleted
  };
}
