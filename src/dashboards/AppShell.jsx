import { useState } from 'react';
import {
  LayoutDashboard, Settings, Users, Building2, Package,
  CreditCard, LogOut, Bell, Search, ChevronRight
} from 'lucide-react';
import { Logo } from '../components/ui.jsx';
import { SuperAdminConsole, PartnerConsole } from '../components/PlatformConsole.jsx';
import '../styles/dashboard-clean.css';

const adminMenu = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['partners', 'Partners', Users],
  ['clients', 'Clientes', Building2],
  ['products', 'Productos', Package],
  ['payments', 'Pagos', CreditCard],
  ['settings', 'Configuración', Settings],
];

const partnerMenu = [
  ['dashboard', 'Mi negocio', LayoutDashboard],
  ['clients', 'Mis clientes', Users],
  ['offers', 'Productos y ofertas', Package],
  ['links', 'Links de venta', CreditCard],
  ['brand', 'Marca y redes', Settings],
  ['support', 'Soporte', Bell],
];

export default function AppShell({ role, go }) {
  const [active, setActive] = useState('dashboard');
  const menu = role === 'admin' ? adminMenu : partnerMenu;
  const roleLabel = role === 'admin' ? 'SUPER ADMIN' : 'PARTNER NOVO';
  const initial = role === 'admin' ? 'N' : 'P';

  return (
    <div className="novo-shell">
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
          <LogOut size={16} /><span>Salir</span>
        </button>
      </aside>

      <div className="novo-main">
        <header className="novo-topbar">
          <div className="novo-search">
            <Search size={15} />
            <input placeholder="Buscar en NOVO..." />
          </div>
          <div className="novo-topbar-right">
            <button type="button" className="novo-bell"><Bell size={17} /></button>
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
      <p>Próximamente disponible.</p>
    </div>
  );
}