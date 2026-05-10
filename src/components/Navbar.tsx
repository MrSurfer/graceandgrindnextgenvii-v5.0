"use client";

import Link from "next/link";
import { useSession, signOut } from "@/components/providers/SupabaseProvider";
import { getBaseUrl } from "@/lib/utils";
import { hasPermission } from "@/lib/permissions";
import { Heart, Menu, X, BookOpen, LayoutDashboard, Shield, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/I18nContext";
import { useCurrency, CURRENCY_LIST } from "@/lib/CurrencyContext";
import type { CurrencyCode } from "@/lib/CurrencyContext";
import { usePlatformSound } from "@/lib/SoundContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const role = session?.user?.role;
  const permissions = session?.user?.permissions || [];
  const pathname = usePathname() || "";
  const { t, locale, setLocale } = useTranslation();
  const { currency, setCurrency } = useCurrency();
  const { soundEnabled, toggleSound } = usePlatformSound();
  const hasLocalization = hasPermission(permissions, "feature:localization");

  // Helper component for animated nav links
  const NavLink = ({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) => {
    // Exact match for home, startsWith for others
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
    
    return (
      <Link href={href} className={`relative flex items-center gap-1.5 transition-colors pb-1 ${isActive ? "text-amber-500" : "text-gray-300 hover:text-white"} ${className}`}>
        {children}
        {isActive && (
          <motion.div
            layoutId="navbar-indicator"
            className="absolute -bottom-[21px] left-0 right-0 h-[3px] bg-amber-500 rounded-t-md"
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </Link>
    );
  };

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
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium h-full">
        <NavLink href="/courses">
          <BookOpen className="w-4 h-4" /> {t.nav.programs}
        </NavLink>
        <NavLink href="/about">{t.nav.about}</NavLink>

        {session ? (
          <>
            {(hasPermission(permissions, "owner:dashboard")) && (
              <NavLink href="/owner">
                <LayoutDashboard className="w-4 h-4" /> {t.nav.ceo}
              </NavLink>
            )}
            {(hasPermission(permissions, "teacher:dashboard") || hasPermission(permissions, "admin:dashboard") || hasPermission(permissions, "owner:dashboard")) && (
              <NavLink href="/dashboard/teacher">
                <LayoutDashboard className="w-4 h-4" /> {t.nav.educator}
              </NavLink>
            )}
            {(hasPermission(permissions, "admin:dashboard") || hasPermission(permissions, "owner:dashboard")) && (
              <NavLink href="/admin">
                <Shield className="w-4 h-4" /> {t.nav.admin}
              </NavLink>
            )}
            
            <div className="flex items-center gap-3 border-l border-gray-800 pl-6 ml-2">
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="appearance-none bg-gray-900 border border-gray-800 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer hover:text-white transition-colors"
                >
                  {CURRENCY_LIST.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                  ))}
                </select>
                <div className="absolute top-1/2 right-2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              <button
                onClick={toggleSound}
                className="p-1.5 rounded-md hover:bg-gray-800 text-gray-500 hover:text-amber-500 transition-colors"
                title={soundEnabled ? "Mute sounds" : "Enable sounds"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {hasLocalization && (
                <div className="flex items-center bg-gray-900 border border-gray-800 rounded-lg p-1">
                  <button 
                    onClick={() => setLocale("en")}
                    className={`px-2 py-1 text-xs font-bold rounded ${locale === "en" ? "bg-amber-500 text-gray-900" : "text-gray-500 hover:text-white"}`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => setLocale("am")}
                    className={`px-2 py-1 text-xs font-bold rounded ${locale === "am" ? "bg-amber-500 text-gray-900" : "text-gray-500 hover:text-white"}`}
                  >
                    አማ
                  </button>
                </div>
              )}
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
                {t.nav.signout}
              </button>
            </div>
          </>
        ) : (
          <Link
            href="/login"
            id="login-nav-btn"
            className="px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-600 transition-colors text-gray-950 font-bold"
          >
            {t.nav.login}
          </Link>
        )}
      </nav>

      {/* Mobile Right Side */}
      <div className="flex items-center gap-4 lg:hidden">
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
        <div className="absolute top-full left-0 w-full bg-gray-950/98 border-b border-gray-800 flex flex-col lg:hidden shadow-2xl max-h-[85vh] overflow-y-auto">
          {/* Profile summary */}
          {session && (
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800/60 bg-gray-900/40">
              <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-bold overflow-hidden shrink-0">
                {session.user?.image ? (
                  <img src={session.user.image} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  session.user?.name?.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white truncate">{session.user?.name || "Member"}</p>
                <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
              </div>
            </div>
          )}

          <div className="px-6 py-4 space-y-1">
            {/* Public links */}
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold px-2 py-2">Explore</p>
            <Link href="/courses" onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith("/courses") ? "text-amber-500 bg-amber-500/10" : "text-gray-300 hover:text-white hover:bg-gray-800/60"}`}>
              <BookOpen className="w-4 h-4" /> Programs
            </Link>
            <Link href="/about" onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith("/about") ? "text-amber-500 bg-amber-500/10" : "text-gray-300 hover:text-white hover:bg-gray-800/60"}`}>
              About
            </Link>

            {session && (
              <>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold px-2 pt-4 pb-2">My Account</p>
                <Link href="/profile" onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname === "/profile" ? "text-amber-500 bg-amber-500/10" : "text-gray-300 hover:text-white hover:bg-gray-800/60"}`}>
                  <Heart className="w-4 h-4" /> Profile
                </Link>
                <Link href="/support" onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith("/support") ? "text-amber-500 bg-amber-500/10" : "text-gray-300 hover:text-white hover:bg-gray-800/60"}`}>
                  <Menu className="w-4 h-4" /> Help & Support
                </Link>

                {/* Role-based links */}
                {(hasPermission(permissions, "teacher:dashboard") || hasPermission(permissions, "admin:dashboard") || hasPermission(permissions, "owner:dashboard")) && (
                  <>
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold px-2 pt-4 pb-2">Management</p>
                    {hasPermission(permissions, "owner:dashboard") && (
                      <Link href="/owner" onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith("/owner") ? "text-amber-500 bg-amber-500/10" : "text-gray-300 hover:text-white hover:bg-gray-800/60"}`}>
                        <LayoutDashboard className="w-4 h-4" /> CEO Dashboard
                      </Link>
                    )}
                    {(hasPermission(permissions, "teacher:dashboard") || hasPermission(permissions, "admin:dashboard") || hasPermission(permissions, "owner:dashboard")) && (
                      <Link href="/dashboard/teacher" onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith("/dashboard") ? "text-amber-500 bg-amber-500/10" : "text-gray-300 hover:text-white hover:bg-gray-800/60"}`}>
                        <LayoutDashboard className="w-4 h-4" /> Educator Hub
                      </Link>
                    )}
                    {(hasPermission(permissions, "admin:dashboard") || hasPermission(permissions, "owner:dashboard")) && (
                      <Link href="/admin" onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith("/admin") ? "text-amber-500 bg-amber-500/10" : "text-gray-300 hover:text-white hover:bg-gray-800/60"}`}>
                        <Shield className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                  </>
                )}

                {/* Settings row */}
                <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold px-2 pt-4 pb-2">Settings</p>
                <div className="flex items-center gap-3 px-3 py-2">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold text-gray-300 focus:outline-none"
                  >
                    {CURRENCY_LIST.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                    ))}
                  </select>
                  <button
                    onClick={toggleSound}
                    className="p-2.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-amber-500 transition-colors"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  {hasLocalization && (
                    <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1">
                      <button onClick={() => setLocale("en")} className={`px-2 py-1 text-xs font-bold rounded ${locale === "en" ? "bg-amber-500 text-gray-900" : "text-gray-500"}`}>EN</button>
                      <button onClick={() => setLocale("am")} className={`px-2 py-1 text-xs font-bold rounded ${locale === "am" ? "bg-amber-500 text-gray-900" : "text-gray-500"}`}>አማ</button>
                    </div>
                  )}
                </div>

                <div className="pt-3 pb-1">
                  <button
                    onClick={() => { setMenuOpen(false); signOut({ callbackUrl: getBaseUrl() }); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-sm border border-red-500/20 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
            {!session && (
              <div className="pt-2">
                <a href="/login" onClick={() => setMenuOpen(false)} className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-sm transition-colors">
                  Login
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
