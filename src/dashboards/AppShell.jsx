import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Settings, Users, Building2, Package, Link2,
  CreditCard, Palette, LifeBuoy, LogOut, Bell, Search
} from 'lucide-react';
import { Logo } from '../components/ui.jsx';
import { SuperAdminConsole, PartnerConsole } from '../components/PlatformConsole.jsx';
import { platformApi } from '../lib/platformApi.js';
import '../styles/dashboard-clean.css';

const menus = {
  admin: [
    ['dashboard', 'Control Center', LayoutDashboard],
    ['partners', 'Partners', Users],
    ['clients', 'Clientes', Building2],
    ['catalog', 'Productos', Package],
    ['payments', 'Pagos', CreditCard],
    ['settings', 'Configuración', Settings],
  ],
  partner: [
    ['dashboard', 'Mi negocio', LayoutDashboard],
    ['clients', 'Mis clientes', Users],
    ['offers', 'Productos y ofertas', Package],
    ['links', 'Links de venta', Link2],
    ['brand', 'Marca y redes', Palette],
    ['support', 'Soporte', LifeBuoy],
  ],
  client: [
    ['dashboard', 'Resumen', LayoutDashboard],
    ['company', 'Mi empresa', Building2],
    ['plan', 'Mi plan', CreditCard],
    ['support', 'Soporte', LifeBuoy],
  ],
};

function dashboardBase(role) {
  if (role === 'admin') return 'admin-dashboard';
  if (role === 'partner') return 'partner-dashboard';
  return 'client-dashboard';
}

export default function AppShell({ role, section = 'dashboard', go }) {
  const [active, setActive] = useState(section);
  const menu = menus[role] || menus.client;

  useEffect(() => {
    setActive(section || 'dashboard');
  }, [section]);

  function navigate(id) {
    setActive(id);
    go(`${dashboardBase(role)}/${id}`);
  }

  return (
    <div className={`app-shell dashboard-clean app-shell-${role}`}>
      <aside className="dashboard-sidebar">
        <div className="aside-brand"><Logo small /></div>
        <div className="role-label">{role === 'admin' ? 'SUPER ADMIN NOVO' : role === 'partner' ? 'PARTNER NOVO' : 'CLIENTE NOVO'}</div>
        <nav>
          {menu.map(([id, label, Icon]) => (
            <button key={id} type="button" className={active === id ? 'active' : ''} onClick={() => navigate(id)}>
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="logout"
          onClick={async () => {
            try { await platformApi.signOut(); } catch {}
            go('login');
          }}
        >
          <LogOut size={18} /><span>Salir</span>
        </button>
      </aside>

      <main className="dashboard-main">
        <div className="topbar">
          <div className="search"><Search size={17} /><input placeholder="Buscar en NOVO..." /></div>
          <div className="top-actions"><button type="button"><Bell size={18} /></button><div className="avatar">{role === 'admin' ? 'N' : role === 'partner' ? 'P' : 'C'}</div></div>
        </div>

        {role === 'admin' && <SuperAdminConsole section={active} />}
        {role === 'partner' && <PartnerConsole section={active} />}
        {role === 'client' && <ClientPlaceholder section={active} />}
      </main>
    </div>
  );
}

function ClientPlaceholder({ section }) {
  const titles = {
    dashboard: 'Resumen',
    company: 'Mi empresa',
    plan: 'Mi plan',
    support: 'Soporte',
  };
  return (
    <div className="dash-page">
      <div className="dash-heading">
        <div>
          <h1>Panel Cliente — {titles[section] || 'Resumen'}</h1>
          <p>El acceso del cliente se conectará a su subcuenta, plan y servicios asignados.</p>
        </div>
      </div>
    </div>
  );
}
