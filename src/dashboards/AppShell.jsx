import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Globe2,
  Settings,
  LifeBuoy,
  Link2,
  Plus,
  LogOut,
  Search,
  Bell,
  Wallet,
  MonitorSmartphone,
  Palette,
  Layers3,
  BarChart3,
  Workflow,
  ChevronRight,
} from "lucide-react";
import { Button, Logo, Empty } from "../components/ui.jsx";
import { money } from "../utils/format.js";
import { clients } from "../data/mockData.js";
import "../styles/dashboard-clean.css";

const menus = {
  admin: [
    ["dashboard", "Resumen", LayoutDashboard],
    ["partners", "Partners", Users],
    ["clientes", "Clientes", Building2],
    ["cuentas", "Subcuentas", Globe2],
    ["ingresos", "Ingresos", CreditCard],
    ["webs", "Webs", MonitorSmartphone],
    ["planes", "Planes", Layers3],
    ["config", "Configuración", Settings],
  ],
  partner: [
    ["dashboard", "Resumen", LayoutDashboard],
    ["clientes", "Mis clientes", Users],
    ["crear", "Crear cuenta", Plus],
    ["ingresos", "Ingresos", Wallet],
    ["links", "Links de venta", Link2],
    ["marca", "Mi marca", Palette],
    ["soporte", "Soporte", LifeBuoy],
  ],
  client: [
    ["dashboard", "Resumen", LayoutDashboard],
    ["empresa", "Mi empresa", Building2],
    ["plan", "Mi plan", CreditCard],
    ["web", "Mi web", MonitorSmartphone],
    ["soporte", "Soporte", LifeBuoy],
  ],
};

const roleNames = {
  admin: "NOVO Admin",
  partner: "Partner",
  client: "Cliente",
};

export default function AppShell({ role, go }) {
  const [active, setActive] = useState("dashboard");
  const list = menus[role] || menus.client;

  return (
    <div className={`app-shell dashboard-clean app-shell-${role}`}>
      <aside className="dashboard-sidebar">
        <div className="aside-brand">
          <Logo small />
        </div>

        <div className="role-label">{roleNames[role]}</div>

        <nav>
          {list.map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              className={active === id ? "active" : ""}
              onClick={() => setActive(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="logout"
          onClick={() => go("home")}
        >
          <LogOut size={18} />
          <span>Salir</span>
        </button>
      </aside>

      <main className="dashboard-main">
        <div className="topbar">
          <div className="search">
            <Search size={17} />
            <input placeholder="Buscar..." />
          </div>

          <div className="top-actions">
            <button type="button">
              <Bell size={18} />
            </button>

            <div className="avatar">
              {role === "admin" ? "N" : role === "partner" ? "P" : "C"}
            </div>
          </div>
        </div>

        <DashboardContent
          role={role}
          active={active}
          setActive={setActive}
        />
      </main>
    </div>
  );
}

function DashboardContent({ role, active, setActive }) {
  if (active !== "dashboard") {
    return (
      <div className="dash-page">
        <Heading
          title={getTitle(role, active)}
          sub="Módulo preparado para conexión con Supabase, Stripe y HighLevel."
        />

        <Empty
          title="Módulo listo para desarrollar"
          text="Aquí conectaremos la funcionalidad real correspondiente."
          action={
            <Button onClick={() => setActive("dashboard")}>
              Volver al resumen
            </Button>
          }
        />
      </div>
    );
  }

  if (role === "admin") return <AdminHome />;
  if (role === "partner") return <PartnerHome />;
  return <ClientHome />;
}

function Heading({ title, sub, action }) {
  return (
    <div className="dash-heading clean-heading">
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>

      {action}
    </div>
  );
}

function AdminHome() {
  return (
    <div className="dash-page admin-clean-home">
      <Heading
        title="Resumen de la agencia"
        sub="Control general de Partners, clientes, subcuentas e ingresos."
        action={
          <Button>
            <Plus size={16} />
            Nuevo Partner
          </Button>
        }
      />

      <section className="admin-clean-summary">
        <MetricCard
          label="Partners activos"
          value="21"
          detail="3 pendientes"
          icon={Users}
        />

        <MetricCard
          label="Clientes totales"
          value="148"
          detail="+12 este mes"
          icon={Building2}
        />

        <MetricCard
          label="MRR de la agencia"
          value={money(18420)}
          detail="+18.4%"
          icon={Wallet}
        />

        <MetricCard
          label="Subcuentas"
          value="156"
          detail="8 pendientes"
          icon={Globe2}
        />
      </section>

      <section className="admin-clean-main">
        <div className="admin-clean-chart card">
          <div className="clean-card-header">
            <div>
              <span className="clean-kicker">RENDIMIENTO</span>
              <h3>Ingresos recurrentes</h3>
            </div>

            <strong>+18.4%</strong>
          </div>

          <div className="clean-chart-bars">
            {[38, 42, 46, 54, 51, 61, 68, 72, 79, 84, 88, 94].map(
              (height, index) => (
                <i
                  key={index}
                  style={{ height: `${height}%` }}
                />
              )
            )}
          </div>

          <div className="clean-chart-labels">
            <span>Ene</span>
            <span>Mar</span>
            <span>May</span>
            <span>Jul</span>
            <span>Sep</span>
            <span>Dic</span>
          </div>
        </div>

        <div className="admin-clean-status card">
          <div className="clean-card-header">
            <div>
              <span className="clean-kicker">ESTADO GENERAL</span>
              <h3>Operación</h3>
            </div>
          </div>

          <StatusRow
            label="Partners activos"
            value="21 de 24"
            percent={88}
          />

          <StatusRow
            label="Clientes activos"
            value="139 de 148"
            percent={94}
          />

          <StatusRow
            label="Subcuentas conectadas"
            value="148 de 156"
            percent={95}
          />

          <StatusRow
            label="Webs publicadas"
            value="31 de 37"
            percent={84}
          />
        </div>
      </section>

      <section className="admin-clean-lower">
        <div className="admin-clean-table card">
          <div className="clean-card-header">
            <div>
              <span className="clean-kicker">CLIENTES</span>
              <h3>Clientes recientes</h3>
            </div>

            <button type="button">
              Ver todos
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="clean-table">
            <div className="clean-row clean-head">
              <span>Empresa</span>
              <span>Plan</span>
              <span>MRR</span>
              <span>Estado</span>
            </div>

            {clients.slice(0, 5).map((client) => (
              <div className="clean-row" key={client.name}>
                <span>
                  <i className="clean-company-icon">
                    <Building2 size={14} />
                  </i>
                  {client.name}
                </span>

                <span>{client.plan}</span>
                <span>{money(client.mrr)}</span>
                <span>
                  <b className="clean-status-dot" />
                  {client.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-clean-activity card">
          <div className="clean-card-header">
            <div>
              <span className="clean-kicker">ACTIVIDAD</span>
              <h3>Últimos movimientos</h3>
            </div>
          </div>

          <ActivityRow
            icon={Users}
            title="Nuevo Partner"
            detail="EverGrace Digital"
            time="12 min"
          />

          <ActivityRow
            icon={Building2}
            title="Nuevo cliente"
            detail="Holy Cannoli"
            time="35 min"
          />

          <ActivityRow
            icon={MonitorSmartphone}
            title="Web publicada"
            detail="La Brochette Bistro"
            time="1 h"
          />

          <ActivityRow
            icon={Workflow}
            title="Automatización activa"
            detail="Secuencia de seguimiento"
            time="2 h"
          />
        </div>
      </section>
    </div>
  );
}

function PartnerHome() {
  return (
    <div className="dash-page">
      <Heading
        title="Resumen Partner"
        sub="Administra tus clientes, ingresos y ventas."
        action={
          <Button>
            <Plus size={16} />
            Nuevo cliente
          </Button>
        }
      />

      <section className="admin-clean-summary">
        <MetricCard
          label="Mis clientes"
          value="12"
          detail="10 activos"
          icon={Users}
        />

        <MetricCard
          label="Ingresos"
          value={money(1840)}
          detail="mensuales"
          icon={Wallet}
        />

        <MetricCard
          label="Ganancia"
          value={money(960)}
          detail="estimada"
          icon={BarChart3}
        />

        <MetricCard
          label="Webs"
          value="7"
          detail="2 en desarrollo"
          icon={MonitorSmartphone}
        />
      </section>
    </div>
  );
}

function ClientHome() {
  return (
    <div className="dash-page">
      <Heading
        title="Hola, Holy Cannoli"
        sub="Administra tu cuenta y tus servicios."
      />

      <section className="admin-clean-summary">
        <MetricCard
          label="Plan"
          value="NOVO Empresa"
          detail="Activo"
          icon={CreditCard}
        />

        <MetricCard
          label="Subcuenta"
          value="Conectada"
          detail="Disponible"
          icon={Globe2}
        />

        <MetricCard
          label="Web"
          value="Publicada"
          detail="Dominio activo"
          icon={MonitorSmartphone}
        />

        <MetricCard
          label="Soporte"
          value="0"
          detail="casos abiertos"
          icon={LifeBuoy}
        />
      </section>
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon }) {
  return (
    <article className="clean-metric-card card">
      <div className="clean-metric-icon">
        <Icon size={20} />
      </div>

      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function StatusRow({ label, value, percent }) {
  return (
    <div className="clean-status-row">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <div className="clean-progress">
        <i style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function ActivityRow({ icon: Icon, title, detail, time }) {
  return (
    <div className="clean-activity-row">
      <div className="clean-activity-icon">
        <Icon size={16} />
      </div>

      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>

      <small>{time}</small>
    </div>
  );
}

function getTitle(role, active) {
  const titles = {
    admin: {
      partners: "Partners",
      clientes: "Clientes",
      cuentas: "Subcuentas",
      ingresos: "Ingresos",
      webs: "Webs",
      planes: "Planes",
      config: "Configuración",
    },
    partner: {
      clientes: "Mis clientes",
      crear: "Crear cuenta",
      ingresos: "Ingresos",
      links: "Links de venta",
      marca: "Mi marca",
      soporte: "Soporte",
    },
    client: {
      empresa: "Mi empresa",
      plan: "Mi plan",
      web: "Mi web",
      soporte: "Soporte",
    },
  };

  return titles[role]?.[active] || "Módulo";
}