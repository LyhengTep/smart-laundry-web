"use client";

import {
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/notifications/notificationHook";
import { Notification } from "@/types/notification";
import { Bell, BellOff, Check, CheckCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface NotificationBellProps {
  dark?: boolean;
}

export function NotificationBell({ dark = false }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data, isLoading } = useNotifications(
    open ? { size: 20, ...(showUnreadOnly ? { is_read: false } : {}) } : undefined,
  );
  const { mutate: markRead } = useMarkNotificationRead();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const notifications = data?.items ?? [];

  const handleItemClick = (n: Notification) => {
    if (!n.is_read) markRead(n.id);
  };

  const handleMarkAllRead = () => {
    notifications.filter((n) => !n.is_read).forEach((n) => markRead(n.id));
  };

  const buttonBase = dark
    ? "relative p-3 bg-slate-900 rounded-2xl border border-white/5 text-slate-400 hover:text-white transition-all"
    : "relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all";

  const panelBase = dark
    ? "absolute right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
    : "absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden";

  const headerText = dark ? "text-white" : "text-slate-900";
  const subText = dark ? "text-slate-400" : "text-slate-500";
  const divider = dark ? "border-white/10" : "border-slate-100";
  const itemHover = dark ? "hover:bg-slate-800" : "hover:bg-slate-50";
  const unreadBg = dark ? "bg-slate-800/70" : "bg-blue-50/60";
  const titleText = dark ? "text-slate-100" : "text-slate-800";
  const msgText = dark ? "text-slate-400" : "text-slate-500";
  const timeText = dark ? "text-slate-500" : "text-slate-400";
  const emptyIcon = dark ? "text-slate-600" : "text-slate-300";
  const emptyText = dark ? "text-slate-500" : "text-slate-400";
  const filterActive = dark
    ? "bg-blue-600 text-white"
    : "bg-blue-600 text-white";
  const filterInactive = dark
    ? "bg-slate-800 text-slate-400 hover:text-white"
    : "bg-slate-100 text-slate-500 hover:text-slate-700";

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={buttonBase}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={panelBase}>
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${divider}`}>
            <div className="flex items-center gap-2">
              <Bell size={16} className={subText} />
              <span className={`font-black text-sm ${headerText}`}>Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  className={`p-1.5 rounded-lg transition-all ${itemHover} ${subText}`}
                >
                  <CheckCheck size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={`p-1.5 rounded-lg transition-all ${itemHover} ${subText}`}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className={`flex gap-2 px-4 py-2 border-b ${divider}`}>
            <button
              type="button"
              onClick={() => setShowUnreadOnly(false)}
              className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${!showUnreadOnly ? filterActive : filterInactive}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setShowUnreadOnly(true)}
              className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${showUnreadOnly ? filterActive : filterInactive}`}
            >
              Unread
            </button>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-14 rounded-xl animate-pulse ${dark ? "bg-slate-800" : "bg-slate-100"}`}
                  />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10">
                <BellOff size={28} className={emptyIcon} />
                <p className={`text-sm font-medium ${emptyText}`}>
                  {showUnreadOnly ? "No unread notifications" : "No notifications yet"}
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleItemClick(n)}
                  className={`w-full text-left px-4 py-3 transition-all border-b last:border-b-0 ${divider} ${itemHover} ${!n.is_read ? unreadBg : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                        <p className={`text-sm font-bold truncate ${titleText}`}>{n.title}</p>
                      </div>
                      <p className={`text-xs mt-0.5 leading-relaxed line-clamp-2 ${msgText}`}>
                        {n.message}
                      </p>
                      <p className={`text-[10px] mt-1 font-medium ${timeText}`}>
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                    {n.is_read && (
                      <Check size={12} className={`shrink-0 mt-1 ${subText}`} />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
