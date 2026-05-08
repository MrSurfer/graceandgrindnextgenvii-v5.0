"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  ArrowUpRight, 
  Target, 
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

interface OwnerClientProps {
  initialData: any;
}

export default function OwnerClient({ initialData }: OwnerClientProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold tracking-widest text-xs uppercase mb-2">
            <ShieldCheck className="w-4 h-4" /> CEO Command Hub
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Strategic Overview</h1>
          <p className="text-gray-500 mt-2 max-w-md">Real-time governance and generational impact tracking for the Grace & Grind platform.</p>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/dashboard/teacher" 
            className="group flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 px-6 py-3 rounded-2xl transition-all"
          >
            <span className="text-sm font-bold">Content Creator</span>
          </Link>
          <Link 
            href="/admin" 
            className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-2xl transition-all"
          >
            <span className="text-sm font-bold">Operations Hub</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Metric Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30">
              <Users className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
              <ArrowUpRight className="w-3 h-3" /> 12%
            </div>
          </div>
          <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Total Community</div>
          <div className="text-4xl font-black tabular-nums">{initialData.totalUsers}</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
              <DollarSign className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
              <Activity className="w-3 h-3" /> Live
            </div>
          </div>
          <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Gross Revenue</div>
          <div className="text-4xl font-black tabular-nums">${initialData.totalRevenue.toLocaleString()}</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
              <Target className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-xs font-bold text-purple-400 uppercase tracking-tighter">Strategic</div>
          </div>
          <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Generational Impact</div>
          <div className="text-4xl font-black tabular-nums">98%</div>
        </motion.div>
      </div>

      {/* Graph Area */}
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-10 overflow-hidden relative"
        >
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black">Community Growth</h3>
              <p className="text-gray-500 text-sm">Aggregated enrollment trends over the last 30 days</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-xs font-bold">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                Enrollments
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full flex items-end justify-between gap-2 px-4 relative">
            {/* Simple SVG Graph simulation using mapping */}
            {initialData.userGrowth.map((point: any, idx: number) => (
              <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(point.count / (Math.max(...initialData.userGrowth.map((p: any) => p.count)) || 1)) * 100}%` }}
                  transition={{ delay: 0.5 + idx * 0.02, duration: 1 }}
                  className="w-full bg-gradient-to-t from-amber-500/20 to-amber-500/60 rounded-t-lg group-hover:from-amber-500/40 group-hover:to-amber-500 transition-all border-x border-t border-amber-500/20 shadow-lg shadow-amber-500/5"
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[10px] font-black px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                  {point.count} Users
                </div>
                <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-4 rotate-45 origin-left">
                  {point.date}
                </div>
              </div>
            ))}
          </div>

          {/* Grid lines background */}
          <div className="absolute inset-0 pointer-events-none -z-10 opacity-20">
            <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8">
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" /> Top Performing Programs
          </h4>
          <div className="space-y-4">
            {initialData.topCourses.map((course: any, idx: number) => (
              <div key={course.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center font-bold text-amber-500">#{idx + 1}</div>
                  <div>
                    <div className="font-bold truncate max-w-[200px]">{course.title}</div>
                    <div className="text-xs text-gray-500">{course.enrollments.toLocaleString()} Students</div>
                  </div>
                </div>
                <div className="font-black text-emerald-400">+${course.revenue.toLocaleString()}</div>
              </div>
            ))}
            {initialData.topCourses.length === 0 && (
              <div className="text-center py-10 text-gray-500 text-sm italic">
                No course data available yet.
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-amber-500 text-black rounded-3xl p-10 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
            <Target className="w-48 h-48" />
          </div>
          <div>
            <h4 className="text-3xl font-black leading-tight mb-4">You are shaping the next generation.</h4>
            <p className="text-black/70 font-bold">Every data point represents a family receiving the tools they need to thrive.</p>
          </div>
          <button className="bg-black text-white self-start px-8 py-4 rounded-2xl font-bold mt-8 hover:bg-black/80 transition-colors">
            Review Strategic Goals
          </button>
        </div>
      </div>
    </div>
  );
}
