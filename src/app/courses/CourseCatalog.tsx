"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PlayCircle, Clock, Search, Filter, ChevronDown, X, CheckCircle, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useCurrency } from "@/lib/CurrencyContext";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string | null;
  imageUrl: string | null;
  _count: { lessons: number };
  teacher: { name: string | null };
};

type EnrolledCourse = {
  course: {
    id: string;
    title: string;
    slug: string;
    imageUrl: string | null;
    lessons: { progress: any[] }[];
  };
};

const PRICE_FILTERS = [
  { label: "All Prices", value: "all" },
  { label: "Free", value: "free" },
  { label: "Paid", value: "paid" },
  { label: "Under $25", value: "under25" },
  { label: "Under $50", value: "under50" },
  { label: "$50+", value: "over50" },
];

export default function CourseCatalog({
  courses,
  enrolledCourses,
  categories,
}: {
  courses: Course[];
  enrolledCourses: EnrolledCourse[];
  categories: string[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const { formatPrice } = useCurrency();

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // Keyword search (title, description, teacher name)
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        (course.teacher.name || "").toLowerCase().includes(query);

      // Price filter
      let matchesPrice = true;
      if (priceFilter === "free") matchesPrice = course.price === 0;
      else if (priceFilter === "paid") matchesPrice = course.price > 0;
      else if (priceFilter === "under25") matchesPrice = course.price < 25;
      else if (priceFilter === "under50") matchesPrice = course.price < 50;
      else if (priceFilter === "over50") matchesPrice = course.price >= 50;

      // Category filter
      const matchesCategory =
        categoryFilter === "all" || course.category === categoryFilter;

      return matchesSearch && matchesPrice && matchesCategory;
    });
  }, [courses, searchQuery, priceFilter, categoryFilter]);

  // Group by category for search results
  const groupedResults = useMemo(() => {
    if (!searchQuery) return null;
    const groups: Record<string, Course[]> = {};
    filteredCourses.forEach((course) => {
      const cat = course.category || "Uncategorized";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(course);
    });
    return groups;
  }, [filteredCourses, searchQuery]);

  const activeFilterCount =
    (priceFilter !== "all" ? 1 : 0) + (categoryFilter !== "all" ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          All Programs
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Equipping the next generation of parents with practical, grace-filled
          wisdom and skills.
        </p>
      </div>

      {/* My Enrolled Courses */}
      {enrolledCourses.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" /> My Growth Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map(({ course }) => {
              const totalLessons = course.lessons.length;
              const completedLessons = course.lessons.filter(
                (l: any) => l.progress && l.progress.length > 0
              ).length;
              const progressPercentage =
                totalLessons > 0
                  ? Math.round((completedLessons / totalLessons) * 100)
                  : 0;

              return (
                <Link
                  href={`/courses/${course.slug}`}
                  key={course.id}
                  className="block group bg-gray-950 border border-gray-800 rounded-xl p-5 hover:border-amber-500/50 transition-colors relative overflow-hidden"
                >
                  <div className="flex gap-4 items-center">
                    {course.imageUrl && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-800">
                        <img
                          src={course.imageUrl}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg mb-1 group-hover:text-amber-400 transition-colors truncate">
                        {course.title}
                      </h3>
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>{progressPercentage}% Complete</span>
                        <span>
                          {completedLessons} / {totalLessons}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-amber-500 h-1 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  {progressPercentage === 100 && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 blur-xl rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, topics, or instructors..."
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-11 pr-10 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-gray-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-bold transition-all shrink-0 ${
              showFilters || activeFilterCount > 0
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-amber-500 text-gray-950 text-[10px] px-1.5 py-0.5 rounded-full font-black">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 p-4 bg-gray-900/50 border border-gray-800 rounded-xl animate-in fade-in duration-200">
            {/* Price Filter */}
            <div className="relative">
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="appearance-none bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-300 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
              >
                {PRICE_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-300 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setPriceFilter("all");
                  setCategoryFilter("all");
                }}
                className="text-xs text-red-400 hover:text-red-300 font-bold px-3 py-2.5 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="mb-6 border-b border-gray-800 pb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-300">
          {searchQuery ? "Search Results" : "Mastery Catalog"}
        </h2>
        <span className="text-xs text-gray-500 font-mono">
          {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
          <BookOpen className="w-16 h-16 text-gray-700" />
          <h2 className="text-2xl font-bold text-gray-500">
            {searchQuery ? "No matching courses found." : "No courses yet."}
          </h2>
          <p className="text-gray-600">
            {searchQuery
              ? "Try adjusting your search or filters."
              : "Check back soon — we're creating content for you."}
          </p>
          {(searchQuery || activeFilterCount > 0) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setPriceFilter("all");
                setCategoryFilter("all");
              }}
              className="mt-2 text-amber-500 hover:text-amber-400 text-sm font-bold"
            >
              Reset all filters
            </button>
          )}
        </div>
      ) : groupedResults ? (
        /* Grouped by Category (when searching) */
        <div className="space-y-12">
          {Object.entries(groupedResults).map(([category, categoryCourses]) => (
            <div key={category}>
              <h3 className="text-lg font-bold text-amber-500/80 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                {category}
                <span className="text-xs text-gray-600 font-mono ml-2">
                  ({categoryCourses.length})
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryCourses.map((course, idx) => (
                  <CourseCard key={course.id} course={course} index={idx} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Default Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course, idx) => (
            <CourseCard key={course.id} course={course} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, index = 0 }: { course: Course, index?: number }) {
  const { formatPrice } = useCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        href={`/courses/${course.slug}`}
        className="block group relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-amber-500/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10"
      >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-950 relative flex items-center justify-center overflow-hidden">
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            alt={course.title}
          />
        ) : (
          <PlayCircle className="w-14 h-14 text-amber-500/60 group-hover:text-amber-500 transition-colors" />
        )}
        {course.category && (
          <span className="absolute top-3 left-3 bg-gray-950/80 backdrop-blur-sm text-[10px] font-bold text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20">
            {course.category}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h2 className="font-bold text-lg mb-1 group-hover:text-amber-400 transition-colors line-clamp-2">
          {course.title}
        </h2>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {course._count.lessons} lessons
          </span>
          <span className="font-mono text-amber-500">
            {course.price === 0 ? "Free" : formatPrice(course.price)}
          </span>
        </div>
      </div>
      </Link>
    </motion.div>
  );
}
