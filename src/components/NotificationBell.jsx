import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, Building2, CheckCheck } from 'lucide-react';
import { platformApi } from '../lib/platformApi.js';
import { supabase } from '../lib/supabase.js';

function formatWhen(value) {
  if (!value) return '';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Ahora mismo';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  return date.toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function NotificationBell({ role = 'partner', onNavigate }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partnerId, setPartnerId] = useState(null);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter(row => !row.read_at).length;

  const load = useCallback(async () => {
    try {
      const data = await platformApi.listNotifications();
      setNotifications(data?.notifications || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    platformApi.getMyProfile().then(profile => {
      setPartnerId(profile?.partner_id || null);
    }).catch(() => {});
  }, [load]);

  useEffect(() => {
    if (role === 'partner' && !partnerId) return undefined;

    const channelName = role === 'admin'
      ? 'platform-notifications-admin'
      : `platform-notifications-${partnerId}`;

    const changeConfig = {
      event: 'INSERT',
      schema: 'public',
      table: 'platform_notifications',
      ...(role === 'partner' && partnerId
        ? { filter: `partner_id=eq.${partnerId}` }
        : {}),
    };

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', changeConfig, payload => {
        const row = payload.new;
        if (!row) return;
        setNotifications(current => [row, ...current.filter(item => item.id !== row.id)]);
      })
      .subscribe();

    const poll = window.setInterval(load, 20000);

    return () => {
      window.clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [partnerId, role, load]);

  useEffect(() => {
    function onDocClick(event) {
      if (!panelRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  async function openItem(item) {
    if (!item.read_at) {
      try {
        await platformApi.markNotificationRead(item.id);
        setNotifications(current =>
          current.map(row => row.id === item.id ? { ...row, read_at: new Date().toISOString() } : row),
        );
      } catch {
        // ignore
      }
    }
    setOpen(false);
    if (item.type === 'storefront.lead_created' && onNavigate) {
      onNavigate('clients');
    }
  }

  async function markAllRead() {
    try {
      await platformApi.markAllNotificationsRead();
      const now = new Date().toISOString();
      setNotifications(current => current.map(row => ({ ...row, read_at: row.read_at || now })));
    } catch {
      // ignore
    }
  }

  return (
    <div className="novo-notifications" ref={panelRef}>
      <button
        type="button"
        className={`novo-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
        aria-label="Notificaciones"
        aria-expanded={open}
        onClick={() => setOpen(current => !current)}
      >
        <Bell size={17} />
        {unreadCount > 0 && <span className="novo-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="novo-notifications-panel">
          <div className="novo-notifications-head">
            <strong>Notificaciones</strong>
            {unreadCount > 0 && (
              <button type="button" className="novo-notifications-mark-all" onClick={markAllRead}>
                <CheckCheck size={14} /> Marcar leídas
              </button>
            )}
          </div>

          {loading && <div className="novo-notifications-empty">Cargando…</div>}
          {!loading && notifications.length === 0 && (
            <div className="novo-notifications-empty">No tienes notificaciones nuevas.</div>
          )}
          {!loading && notifications.length > 0 && (
            <div className="novo-notifications-list">
              {notifications.map(item => (
                <button
                  type="button"
                  key={item.id}
                  className={`novo-notification-item ${item.read_at ? 'read' : 'unread'}`}
                  onClick={() => openItem(item)}
                >
                  <span className="novo-notification-icon"><Building2 size={15} /></span>
                  <span className="novo-notification-copy">
                    <strong>{item.title}</strong>
                    <span>{item.body}</span>
                    <small>{formatWhen(item.created_at)}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
