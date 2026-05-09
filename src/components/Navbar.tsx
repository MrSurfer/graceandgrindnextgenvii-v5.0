"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { getBaseUrl } from "@/lib/utils";
import { Heart, Menu, X, BookOpen, LayoutDashboard, Shield } from "lucide-react";
import { useState } from "react";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const role = (session?.user as any)?.role;

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 lg:px-12 fixed top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
          <Heart className="text-gray-950 w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight">GraceAndGrind</span>
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
        <Link href="/courses" className="flex items-center gap-1.5 hover:text-white transition-colors">
          <BookOpen className="w-4 h-4" /> Courses
        </Link>
        <Link href="/about" className="hover:text-white transition-colors">About</Link>

        {session ? (
          <>
            {(role === "OWNER") && (
              <Link href="/owner" className="flex items-center gap-1.5 text-amber-500 hover:text-amber-400 transition-colors">
                <LayoutDashboard className="w-4 h-4" /> CEO Hub
              </Link>
            )}
            {(role === "TEACHER" || role === "ADMIN" || role === "SUPER_ADMIN" || role === "OWNER") && (
              <Link href="/dashboard/teacher" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            )}
            {(role === "ADMIN" || role === "SUPER_ADMIN" || role === "OWNER") && (
              <Link href="/admin" className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}
            
            <div className="flex items-center gap-3 border-l border-gray-800 pl-6 ml-2">
              <NotificationBell />
              <div className="relative group/profile">
                <Link href="/profile" className="flex items-center gap-2 hover:text-white transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 group-hover/profile:border-amber-500 transition-colors overflow-hidden">
                    {session.user?.image ? (
                      <img src={session.user.image} alt="User avatar" className="w-full h-full object-cover" />
                    ) : (
                      session.user?.name?.charAt(0).toUpperCase() || session.user?.email?.charAt(0).toUpperCase() || "?"
                    )}
                  </div>
                </Link>
                {/* Hover Tooltip */}
                <div className="absolute top-full right-0 mt-2 opacity-0 scale-95 pointer-events-none group-hover/profile:opacity-100 group-hover/profile:scale-100 transition-all duration-200 origin-top-right z-50">
                  <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 shadow-2xl min-w-[180px]">
                    <p className="text-sm font-bold text-white truncate">{session.user?.name || "User"}</p>
                    <p className="text-[10px] text-gray-500 truncate mb-2">{session.user?.email}</p>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        role === "OWNER" ? "bg-amber-500" :
                        role === "ROOT" ? "bg-red-500" :
                        role === "SUPER_ADMIN" ? "bg-purple-500" :
                        role === "ADMIN" ? "bg-blue-500" :
                        role === "TEACHER" ? "bg-green-500" :
                        "bg-gray-500"
                      }`} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        role === "OWNER" ? "text-amber-400" :
                        role === "ROOT" ? "text-red-400" :
                        role === "SUPER_ADMIN" ? "text-purple-400" :
                        role === "ADMIN" ? "text-blue-400" :
                        role === "TEACHER" ? "text-green-400" :
                        "text-gray-400"
                      }`}>
                        {role === "OWNER" ? "Owner" :
                         role === "ROOT" ? "Root" :
                         role === "SUPER_ADMIN" ? "Super Admin" :
                         role === "ADMIN" ? "Administrator" :
                         role === "TEACHER" ? "Educator" :
                         "Member"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                id="signout-btn"
                onClick={() => signOut({ callbackUrl: getBaseUrl() })}
                className="px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors text-white text-xs"
              >
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <Link
            href="/login"
            id="login-nav-btn"
            className="px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-600 transition-colors text-gray-950 font-bold"
          >
            Login
          </Link>
        )}
      </nav>

      {/* Mobile Right Side */}
      <div className="flex items-center gap-4 md:hidden">
        {session && (
          <Link href="/profile" className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 overflow-hidden">
              {session.user?.image ? (
                <img src={session.user.image} alt="User avatar" className="w-full h-full object-cover" />
              ) : (
                session.user?.name?.charAt(0).toUpperCase() || session.user?.email?.charAt(0).toUpperCase() || "?"
              )}
            </div>
          </Link>
        )}
        <button className="text-gray-300" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-gray-950 border-b border-gray-800 flex flex-col gap-4 p-6 md:hidden">
          <Link href="/courses" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white">Courses</Link>
          <Link href="/about" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-white">About</Link>
          {session ? (
            <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: getBaseUrl() }); }} className="text-left text-gray-300 hover:text-white">
              Sign Out
            </button>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)} className="text-amber-500 font-bold">Login</Link>
          )}
        </div>
      )}
    </header>
  );
}
