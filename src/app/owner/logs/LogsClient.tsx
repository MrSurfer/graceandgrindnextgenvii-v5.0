"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowLeft, Search, Clock, User, Activity, BarChart3, List, ChevronRight } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface EventLog {
  id: string;
  action: string;
  actorId: string;
  targetId: string | null;
  details: string | null;
  createdAt: Date;
  actor: {
    name: string | null;
    email: string;
    role: string;
  };
}

const COLORS = ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6'];

export default function LogsClient({ logs }: { logs: EventLog[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"FEED" | "ANALYTICS">("FEED");

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = 
        log.actor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.targetId && log.targetId.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesAction = filterAction === "ALL" || log.action === filterAction;

      return matchesSearch && matchesAction;
    });
  }, [logs, searchTerm, filterAction]);

  const getActionColor = (action: string) => {
    switch (action) {
      case "ROLE_CHANGE": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "USER_DELETE": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "STATUS_CHANGE": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "FORGE_ACCOUNT": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      default: return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "ROLE_CHANGE": return <User className="w-4 h-4 text-purple-400" />;
      case "USER_DELETE": return <User className="w-4 h-4 text-red-400" />;
      case "STATUS_CHANGE": return <Activity className="w-4 h-4 text-amber-400" />;
      default: return <Activity className="w-4 h-4 text-blue-400" />;
    }
  };

  // Analytics Data Prep
  const actionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach(log => {
      counts[log.action] = (counts[log.action] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredLogs]);

  const timeSeriesData = useMemo(() => {
    const dates: Record<string, number> = {};
    filteredLogs.forEach(log => {
      const dateStr = new Date(log.createdAt).toLocaleDateString();
      dates[dateStr] = (dates[dateStr] || 0) + 1;
    });
    // Sort by date chronologically
    return Object.entries(dates)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days of activity shown
  }, [filteredLogs]);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold tracking-widest text-xs uppercase mb-2">
            <ShieldCheck className="w-4 h-4" /> Security Log
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Audit Trail</h1>
          <p className="text-gray-500 mt-2 max-w-md">Immutable record of all high-privilege administrative operations.</p>
        </div>
        <div className="flex gap-4">
          <Link 
            href="/admin" 
            className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-2xl transition-all"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Back to Operations Hub</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        
        {/* Tab Controls */}
        <div className="flex items-center gap-4 mb-8 bg-zinc-900/50 p-2 rounded-2xl border border-white/5 inline-flex">
          <button
            onClick={() => setActiveTab("FEED")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "FEED" ? "bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/20" : "text-gray-400 hover:text-white"
            }`}
          >
            <List className="w-4 h-4" /> Activity Feed
          </button>
          <button
            onClick={() => setActiveTab("ANALYTICS")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "ANALYTICS" ? "bg-amber-500 text-gray-950 shadow-lg shadow-amber-500/20" : "text-gray-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Visualization
          </button>
        </div>

        {/* Filters */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by email, action, or target ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-white focus:outline-none focus:border-amber-500/50 appearance-none min-w-[200px]"
          >
            <option value="ALL">All Actions</option>
            {Array.from(new Set(logs.map(l => l.action))).map(action => (
              <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "FEED" ? (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {filteredLogs.length === 0 ? (
                <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-12 text-center">
                  <Activity className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-300">No Logs Found</h3>
                  <p className="text-gray-500 mt-2">Adjust your search or filters to see more activity.</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="bg-zinc-900/50 border border-white/5 hover:border-white/10 rounded-[1.5rem] p-5 transition-colors flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-4 md:w-1/4 shrink-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-gray-200 truncate">{log.actor.name || "Unknown"}</div>
                        <div className="text-xs text-gray-500 font-mono truncate">{log.actor.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 md:w-1/4 shrink-0">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 text-sm text-gray-400">
                      {log.details ? (
                        <span className="font-mono text-xs bg-black/20 px-2 py-1 rounded truncate block">
                          {log.details}
                        </span>
                      ) : (
                        <span className="italic text-gray-600">No additional details</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-gray-400 flex items-center gap-1.5 justify-end">
                          <Clock className="w-3 h-3" />
                          {new Date(log.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-gray-600 font-mono">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Actions Breakdown Chart */}
              <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-500" />
                  Actions Breakdown
                </h3>
                <div className="flex-1 min-h-[300px]">
                  {actionCounts.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={actionCounts}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {actionCounts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
                  )}
                </div>
              </div>

              {/* Activity Timeline Chart */}
              <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Activity Timeline (Last 14 Active Days)
                </h3>
                <div className="flex-1 min-h-[300px]">
                  {timeSeriesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#71717a" 
                          fontSize={10}
                          tickMargin={10}
                        />
                        <YAxis stroke="#71717a" fontSize={10} allowDecimals={false} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem', color: '#fff' }}
                          cursor={{ fill: '#27272a', opacity: 0.4 }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Actions" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
