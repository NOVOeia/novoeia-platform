import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Settings,
  Users,
  Building2,
  Package,
  CreditCard,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  Sun,
  Moon,
  Link2,
  Activity,
  UserPlus,
  ScrollText,
  Shield,
  Mail,
  ClipboardList,
} from 'lucide-react';

import { Logo } from '../components/ui.jsx';
import NotificationBell from '../components/NotificationBell.jsx';
import {
  SuperAdminConsole,
  PartnerConsole,
} from '../components/PlatformConsole.jsx';
import PartnerBrandConsole from '../components/PartnerBrandConsole.jsx';
import PartnerEmailTemplates from '../components/PartnerEmailTemplates.jsx';
import { platformApi } from '../lib/platformApi.js';

import '../styles/dashboard-clean.css';

const adminMenu = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['partners', 'Partners', Users],
  ['registrations', 'Registros partner', UserPlus],
  ['clients', 'Clientes', Building2],
  ['products', 'Productos', Package],
  ['links', 'Links de venta', Link2],
  ['subscriptions', 'Suscripciones', Activity],
  ['payments', 'Pagos', CreditCard],
  ['email-templates', 'Plantillas email', Mail],
  ['audit', 'Auditoría', ScrollText],
  ['settings', 'Configuración', Settings],
];

const partnerMenu = [
  ['partner-center', 'Partner Center', ClipboardList],
  ['dashboard', 'Mi negocio', LayoutDashboard],
  ['clients', 'Mis clientes', Users],
  ['products', 'Productos y servicios', Package],
  ['links', 'Links de venta', Link2],
  ['commissions', 'Comisiones', CreditCard],
  ['brand', 'Mi marca y páginas', Settings],
  ['client-emails', 'Emails a clientes', Mail],
  ['support', 'Soporte', Bell],
];

function defaultSectionForRole(role) {
  if (role === 'partner') return 'partner-center';
  return 'dashboard';
}

export default function AppShell({ role, section }) {
  const initialSection = section || defaultSectionForRole(role);
  const [active, setActive] = useState(initialSection);
  const [linkProductPreset, setLinkProductPreset] = useState(null);
  const [impersonation, setImpersonation] = useState(() => platformApi.getImpersonation());

  useEffect(() => {
    setActive(section || defaultSectionForRole(role));
  }, [section, role]);

  useEffect(() => {
    setImpersonation(platformApi.getImpersonation());
  }, [role, section]);

  function navigatePartner(nextSection, options = {}) {
    if (options.productId) {
      setLinkProductPreset(options.productId);
    }
    setActive(nextSection);
  }

  function exitImpersonation() {
    platformApi.clearImpersonation();
    setImpersonation(null);
    go?.('admin-dashboard/partners');
  }

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('novo-dashboard-theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('novo-dashboard-theme', theme);
  }, [theme]);

  const menu = role === 'admin' ? adminMenu : partnerMenu;
  const isImpersonating = role === 'partner' && Boolean(impersonation?.partnerId);
  const roleLabel = role === 'admin'
    ? 'SUPER ADMIN'
    : isImpersonating
      ? `SOPORTE · ${impersonation.partnerName}`
      : role === 'partner'
        ? 'PARTNER NOVO'
        : 'CLIENTE NOVO';
  const initial = role === 'admin' ? 'N' : role === 'partner' ? 'P' : 'C';

  function toggleTheme() {
    setTheme(current => current === 'dark' ? 'light' : 'dark');
  }

  return (
    <div className="novo-shell" data-theme={theme}>
      <aside className="novo-sidebar">
        <div className="novo-sidebar-brand">
          <Logo small />
        </div>

        <div className="novo-role-badge">{roleLabel}</div>

        <nav className="novo-nav">
          {menu.map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              className={`novo-nav-item ${active === id ? 'active' : ''}`}
              onClick={() => setActive(id)}
            >
              <span className="novo-nav-icon"><Icon size={17} /></span>
              <span className="novo-nav-label">{label}</span>
              {active === id && <ChevronRight size={14} className="novo-nav-arrow" />}
            </button>
          ))}
        </nav>

        <button type="button" className="novo-logout" onClick={() => go('home')}>
          <LogOut size={16} />
          <span>Salir</span>
        </button>
      </aside>

      <div className="novo-main">
        <header className="novo-topbar">
          <div className="novo-search">
            <Search size={15} />
            <input placeholder="Buscar en NOVO..." />
          </div>

          <div className="novo-topbar-right">
            <button
              type="button"
              className="novo-theme-toggle"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <NotificationBell role={role} onNavigate={setActive} />

            <div className="novo-avatar">{initial}</div>
          </div>
        </header>

        <div className="novo-content">
          {isImpersonating && (
            <div
              className="novo-card"
              style={{
                margin: '0 0 16px',
                border: '1px solid rgba(245,158,11,.35)',
                background: 'rgba(245,158,11,.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Shield size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: 'var(--novo-text)' }}>
                      Modo soporte — viendo como {impersonation.partnerName}
                    </strong>
                    <p style={{ margin: '4px 0 0', color: 'var(--novo-muted)', fontSize: 13 }}>
                      Las acciones se ejecutan en el contexto de este partner.
                    </p>
                  </div>
                </div>
                <button type="button" className="novo-btn novo-btn-ghost" onClick={exitImpersonation}>
                  Volver a Super Admin
                </button>
              </div>
            </div>
          )}
          {role === 'admin' && <SuperAdminConsole section={active} go={go} />}
          {role === 'partner' && (
            <>
              <div style={{ display: active === 'brand' ? 'block' : 'none' }}>
                <PartnerBrandConsole />
              </div>
              <div style={{ display: active === 'client-emails' ? 'block' : 'none' }}>
                <PartnerEmailTemplates />
              </div>
              {active !== 'brand' && active !== 'client-emails' && (
                <PartnerConsole
                  section={active}
                  onNavigate={navigatePartner}
                  linkProductPreset={linkProductPreset}
                  onClearLinkPreset={() => setLinkProductPreset(null)}
                />
              )}
            </>
          )}
          {role === 'client' && <ClientPlaceholder />}
        </div>
      </div>
    </div>
  );
}

function ClientPlaceholder() {
  return (
    <div className="novo-page">
      <h1>Panel Cliente</h1>
      <p>Próximamente disponible.</p>
    </div>
  );
}