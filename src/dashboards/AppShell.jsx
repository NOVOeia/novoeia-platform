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
} from 'lucide-react';

import { Logo } from '../components/ui.jsx';
import {
  SuperAdminConsole,
  PartnerConsole,
} from '../components/PlatformConsole.jsx';

import '../styles/dashboard-clean.css';

const adminMenu = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['partners', 'Partners', Users],
  ['clients', 'Clientes', Building2],
  ['products', 'Productos', Package],
  ['links', 'Links de venta', Link2],
  ['payments', 'Pagos', CreditCard],
  ['settings', 'ConfiguraciÃ³n', Settings],
];

const partnerMenu = [
  ['dashboard', 'Mi negocio', LayoutDashboard],
  ['clients', 'Mis clientes', Users],
  ['offers', 'Productos y ofertas', Package],
  ['links', 'Links de venta', Link2],
  ['brand', 'Marca y redes', Settings],
  ['support', 'Soporte', Bell],
];

export default function AppShell({ role, go }) {
  const [active, setActive] = useState('dashboard');

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('novo-dashboard-theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('novo-dashboard-theme', theme);
  }, [theme]);

  const menu = role === 'admin' ? adminMenu : partnerMenu;
  const roleLabel = role === 'admin' ? 'SUPER ADMIN' : role === 'partner' ? 'PARTNER NOVO' : 'CLIENTE NOVO';
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

            <button type="button" className="novo-bell" aria-label="Notificaciones">
              <Bell size={17} />
            </button>

            <div className="novo-avatar">{initial}</div>
          </div>
        </header>

        <div className="novo-content">
          {role === 'admin' && <SuperAdminConsole section={active} />}
          {role === 'partner' && <PartnerConsole section={active} />}
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
      <p>PrÃ³ximamente disponible.</p>
    </div>
  );
}