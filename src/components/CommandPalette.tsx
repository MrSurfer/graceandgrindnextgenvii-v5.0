"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { BookOpen, Home, Settings, Search, ShieldCheck, User, Users, FileText, BarChart3, Presentation } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Root as VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useSession } from "./providers/SupabaseProvider";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ROOT" || session?.user?.role === "OWNER";
  const isTeacher = session?.user?.role === "TEACHER" || isAdmin;
  const isOwner = session?.user?.role === "OWNER";

  return (
    <Command.Dialog 
      open={open} 
      onOpenChange={setOpen}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-[10vh] bg-black/80 backdrop-blur-sm"
    >
      <VisuallyHidden>
        <DialogTitle>Global Command Palette</DialogTitle>
      </VisuallyHidden>
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center px-4 py-3 border-b border-gray-800">
          <Search className="w-5 h-5 text-gray-500 mr-3" />
          <Command.Input 
            placeholder="What do you want to learn or manage?..." 
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none border-none text-lg"
          />
          <div className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded font-mono">ESC</div>
        </div>

        <Command.List className="max-h-[300px] overflow-y-auto p-2 overscroll-contain scrollbar-hide">
          <Command.Empty className="py-6 text-center text-sm text-gray-500">
            No results found. Try a different search.
          </Command.Empty>

          <Command.Group heading="Navigation" className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-2">
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/"))}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-300 hover:bg-amber-500/10 hover:text-amber-500 cursor-pointer transition-colors aria-selected:bg-amber-500/10 aria-selected:text-amber-500"
            >
              <Home className="w-4 h-4" /> Home
            </Command.Item>
            <Command.Item 
              onSelect={() => runCommand(() => router.push("/courses"))}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-300 hover:bg-amber-500/10 hover:text-amber-500 cursor-pointer transition-colors aria-selected:bg-amber-500/10 aria-selected:text-amber-500"
            >
              <BookOpen className="w-4 h-4" /> Programs & Mastery
            </Command.Item>
          </Command.Group>

          {session?.user && (
            <Command.Group heading="Account" className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/profile"))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-300 hover:bg-amber-500/10 hover:text-amber-500 cursor-pointer transition-colors aria-selected:bg-amber-500/10 aria-selected:text-amber-500"
              >
                <User className="w-4 h-4" /> Profile & Settings
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/courses"))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-300 hover:bg-amber-500/10 hover:text-amber-500 cursor-pointer transition-colors aria-selected:bg-amber-500/10 aria-selected:text-amber-500"
              >
                <Presentation className="w-4 h-4" /> My Learning
              </Command.Item>
            </Command.Group>
          )}

          {isTeacher && (
            <Command.Group heading="Teacher Tools" className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/dashboard/teacher"))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-300 hover:bg-blue-500/10 hover:text-blue-400 cursor-pointer transition-colors aria-selected:bg-blue-500/10 aria-selected:text-blue-400"
              >
                <FileText className="w-4 h-4" /> Educator Workspace
              </Command.Item>
            </Command.Group>
          )}

          {isAdmin && (
            <Command.Group heading="Administration" className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/admin"))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-300 hover:bg-purple-500/10 hover:text-purple-400 cursor-pointer transition-colors aria-selected:bg-purple-500/10 aria-selected:text-purple-400"
              >
                <ShieldCheck className="w-4 h-4" /> Command Center
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/admin?tab=users"))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-300 hover:bg-purple-500/10 hover:text-purple-400 cursor-pointer transition-colors aria-selected:bg-purple-500/10 aria-selected:text-purple-400"
              >
                <Users className="w-4 h-4" /> Manage Users
              </Command.Item>
            </Command.Group>
          )}

          {isOwner && (
            <Command.Group heading="Executive" className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">
              <Command.Item 
                onSelect={() => runCommand(() => router.push("/owner"))}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-300 hover:bg-amber-500/10 hover:text-amber-500 cursor-pointer transition-colors aria-selected:bg-amber-500/10 aria-selected:text-amber-500"
              >
                <BarChart3 className="w-4 h-4" /> Executive Dashboard
              </Command.Item>
            </Command.Group>
          )}
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
