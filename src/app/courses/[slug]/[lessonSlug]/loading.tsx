"use client";

import LoadingOverlay from "@/components/LoadingOverlay";

export default function LessonLoading() {
  return <LoadingOverlay isVisible={true} message="Retrieving Lesson..." />;
}
