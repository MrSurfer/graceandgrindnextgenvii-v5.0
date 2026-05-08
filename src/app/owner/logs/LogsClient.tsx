"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft, Search, Clock, User, Activity } from "lucide-react";
import Link from "next/link";

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

export default function LogsClient({ logs }: { logs: EventLog[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.actor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.targetId && log.targetId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = filterAction === "ALL" || log.action === filterAction;

    return matchesSearch && matchesAction;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case "ROLE_CHANGE": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "USER_DELETE": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "STATUS_CHANGE": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "FORGE_ACCOUNT": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      default: return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
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
            <option value="ROLE_CHANGE">Role Changes</option>
            <option value="USER_DELETE">Deletions</option>
            <option value="STATUS_CHANGE">Status Changes</option>
            <option value="FORGE_ACCOUNT">Forged Accounts</option>
          </select>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-black/20 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Target ID</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-400 text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="font-bold">{log.actor.name || "Unknown"}</div>
                          <div className="text-xs text-gray-500 font-mono">{log.actor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${getActionColor(log.action)}`}>
                        <Activity className="w-3 h-3" />
                        {log.action.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {log.targetId || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-400 bg-black/20 p-2 rounded-lg font-mono overflow-x-auto max-w-[300px]">
                        {log.details ? log.details : "No details provided"}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No logs match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
