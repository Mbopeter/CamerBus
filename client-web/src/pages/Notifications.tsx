import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationService } from '../api/endpoints';
import './Notifications.css';

export default function Notifications() {
  const qc = useQueryClient();
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll().then(r => r.data.data ?? []),
  });

  const { mutate: markRead } = useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const { mutate: markAll } = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unread = notifications.filter((n: any) => !n.is_read).length;

  const typeIcon: Record<string, string> = {
    booking:  '🎫', payment: '💳', parcel: '📦',
    system:   'ℹ️',  alert:   '⚠️',
  };

  return (
    <div className="notif-page">
      <div className="notif-header">
        <div className="notif-header-left">
          <Bell size={28} className="notif-icon" />
          <div>
            <h1>Notifications</h1>
            {unread > 0 && <p>{unread} unread</p>}
          </div>
        </div>
        {unread > 0 && (
          <button id="mark-all-read" className="mark-all-btn" onClick={() => markAll()}>
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="notif-list">{[1,2,3,4].map(i => <div key={i} className="notif-skeleton" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔔</span>
          <h3>No notifications</h3>
          <p>You're all caught up!</p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map((n: any) => (
            <div
              key={n.id}
              id={`notif-${n.id}`}
              className={`notif-card glass-card ${!n.is_read ? 'unread' : ''}`}
              onClick={() => !n.is_read && markRead(n.id)}
            >
              <div className="notif-icon-wrap">{typeIcon[n.type] ?? 'ℹ️'}</div>
              <div className="notif-body">
                <div className="notif-title">{n.title}</div>
                {n.message && <div className="notif-message">{n.message}</div>}
                <div className="notif-time">{new Date(n.created_at).toLocaleDateString()}</div>
              </div>
              {!n.is_read && <div className="unread-dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
