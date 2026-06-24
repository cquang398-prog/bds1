'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Building2, CalendarDays, MessageSquare, Settings, UserSearch, Check, CheckCheck } from 'lucide-react';
import { notifications as initialNotifications } from '@/lib/data/mock-data';
import { Notification } from '@/types';
import Link from 'next/link';

const typeConfig: Record<Notification['type'], { label: string; icon: React.ElementType; color: string; bg: string }> = {
  lead:         { label: 'Lead',        icon: UserSearch,  color: 'text-blue-600',   bg: 'bg-blue-100' },
  appointment:  { label: 'Lịch hẹn',   icon: CalendarDays, color: 'text-green-600', bg: 'bg-green-100' },
  contract:     { label: 'Hợp đồng',   icon: Building2,   color: 'text-orange-600', bg: 'bg-orange-100' },
  consultation: { label: 'Tư vấn',     icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-100' },
  system:       { label: 'Hệ thống',   icon: Settings,    color: 'text-slate-600',  bg: 'bg-slate-100' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function NotificationsPage() {
  const [list, setList] = useState<Notification[]>(initialNotifications);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const unreadCount = list.filter((n) => !n.isRead).length;
  const filtered = list.filter((n) => typeFilter === 'all' || n.type === typeFilter);

  const markRead = (id: string) => setList((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  const markAllRead = () => setList((prev) => prev.map((n) => ({ ...n, isRead: true })));

  const counts = (Object.keys(typeConfig) as Notification['type'][]).reduce((acc, t) => {
    acc[t] = list.filter((n) => n.type === t).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Thông báo</h1>
          <p className="text-slate-500">
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã đọc'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${typeFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Tất cả ({list.length})
        </button>
        {(Object.keys(typeConfig) as Notification['type'][]).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${typeFilter === t ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {typeConfig[t].label} ({counts[t] || 0})
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-slate-400">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Không có thông báo</p>
            </CardContent>
          </Card>
        )}
        {filtered.map((notif) => {
          const tc = typeConfig[notif.type];
          const Icon = tc.icon;
          return (
            <div
              key={notif.id}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${notif.isRead ? 'bg-white' : 'bg-blue-50 border-blue-100'}`}
            >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${tc.bg}`}>
                <Icon className={`h-5 w-5 ${tc.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`font-medium ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                      {notif.title}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">{notif.body}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-400 whitespace-nowrap">{formatDate(notif.createdAt)}</span>
                    {!notif.isRead && (
                      <button
                        onClick={() => markRead(notif.id)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Đánh dấu đã đọc"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${tc.bg} ${tc.color}`}>
                    <Icon className="h-3 w-3" />{tc.label}
                  </span>
                  {notif.link && (
                    <Link href={notif.link} className="text-xs text-blue-600 hover:underline">
                      Xem chi tiết →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
