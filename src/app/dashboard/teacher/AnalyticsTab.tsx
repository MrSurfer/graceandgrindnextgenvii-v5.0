"use client";

import { useMemo } from "react";
import { format, subDays, startOfDay } from "date-fns";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";
import { useCurrency } from "@/lib/CurrencyContext";

interface AnalyticsTabProps {
  enrollments: any[];
  courses: any[];
}

export default function AnalyticsTab({ enrollments, courses }: AnalyticsTabProps) {
  const { formatPrice } = useCurrency();
  
  // 1. Revenue Over Time (Last 30 Days)
  const revenueData = useMemo(() => {
    const data: Record<string, number> = {};
    const today = startOfDay(new Date());
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const dateStr = format(subDays(today, i), "MMM dd");
      data[dateStr] = 0;
    }

    enrollments.forEach(enrollment => {
      const dateStr = format(new Date(enrollment.createdAt), "MMM dd");
      if (data[dateStr] !== undefined) {
        data[dateStr] += enrollment.course?.price || 0;
      }
    });

    return Object.entries(data).map(([date, revenue]) => ({ date, revenue }));
  }, [enrollments]);

  // 2. Top Courses by Enrollment
  const topCoursesData = useMemo(() => {
    const data = courses.map(course => ({
      name: course.title.length > 20 ? course.title.substring(0, 20) + "..." : course.title,
      students: course._count?.enrollments || 0
    })).sort((a, b) => b.students - a.students).slice(0, 5); // Top 5
    return data;
  }, [courses]);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Line Chart */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-lg font-bold mb-6 text-gray-200">Revenue (Last 30 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12} 
                  axisLine={false}
                  tickFormatter={(val) => formatPrice(val)}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", color: "#F3F4F6", borderRadius: "8px" }}
                  itemStyle={{ color: "#F59E0B", fontWeight: "bold" }}
                  formatter={(value: any) => [formatPrice(Number(value)), "Revenue"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  dot={{ fill: "#F59E0B", r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Courses Bar Chart */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-lg font-bold mb-6 text-gray-200">Top Programs (By Enrollment)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCoursesData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#9CA3AF" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", color: "#F3F4F6", borderRadius: "8px" }}
                  cursor={{ fill: "#1F2937" }}
                />
                <Bar 
                  dataKey="students" 
                  fill="#3B82F6" 
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
