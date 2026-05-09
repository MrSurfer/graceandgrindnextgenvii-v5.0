"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, CheckCircle2 } from "lucide-react";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/app/actions/notifications";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Notification = {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();

    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchNotifications() {
    const res = await getNotifications();
    if (res.notifications) {
      setNotifications(res.notifications);
    }
  }

  async function handleMarkAsRead(id: string) {
    const res = await markNotificationAsRead(id);
    if (res.success) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  }

  async function handleMarkAllAsRead() {
    const res = await markAllNotificationsAsRead();
    if (res.success) {
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-950"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 transform origin-top-right transition-all">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-950/50">
            <h3 className="font-bold text-gray-200">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto overflow-x-hidden custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <Bell className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-4 hover:bg-gray-800/50 transition-colors flex gap-3 group ${!notif.isRead ? 'bg-gray-800/20' : ''}`}
                    onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                  >
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5 shrink-0"></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm text-gray-300 ${!notif.isRead ? 'font-medium text-gray-200' : ''}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id); }}
                        className="text-gray-500 hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-all shrink-0 p-1"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
