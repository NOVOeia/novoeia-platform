import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Settings,
  UserRound,
  LayoutDashboard,
  Globe2,
  Share2,
  MessageCircle,
  Target,
  Mail,
  UsersRound,
  TrendingUp,
} from "lucide-react";

const menu = [
  [LayoutDashboard, "Dashboard"],
  [Globe2, "Mi web"],
  [Share2, "Redes"],
  [MessageCircle, "WhatsApp"],
  [Target, "Pop-ups"],
  [Mail, "Email"],
  [UsersRound, "CRM"],
];

export default function PartnerModule() {
  const [plan, setPlan] = useState("basic");
  const [price, setPrice] = useState(97);
  const [clients, setClients] = useState(10);
  const [brand, setBrand] = useState("Mi Agencia");
  const [color, setColor] = useState("#7B2FFF");
  const [activeMenu, setActiveMenu] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveMenu((current) => (current + 1) % menu.length);
    }, 1800);

    return () => window.clearInterval(timer);
  }, []);

  const cost = plan === "basic" ? 47 : 87;
  const minimum = cost + 10;
  const safePrice = Math.max(price, minimum);
  const profit = (safePrice - cost) * clients;
  const revenue = safePrice * clients;
  const totalCost = cost * clients;

  const chartData = useMemo(() => {
    const base = [
      24, 38, 31, 53, 45, 67, 57, 73, 63, 82,
      70, 91, 77, 87, 74, 93, 82, 80, 89, 96,
      84, 92, 78, 89, 95, 86, 91, 94, 89, 98,
    ];

    const multiplier = Math.min(1.22, 0.82 + clients / 120);

    return base.map((value) =>
      Math.min(100, Math.round(value * multiplier))
    );
  }, [clients]);

  const formatNumber = (value) =>
    value.toLocaleString("es-ES", {
      maximumFractionDigits: 0,
    });

  function changePlan(nextPlan) {
    const nextCost = nextPlan === "basic" ? 47 : 87;

    setPlan(nextPlan);
    setPrice((currentPrice) =>
      Math.max(currentPrice, nextCost + 10)
    );
  }

  const brandName = brand.trim() || "Mi Agencia";
  const brandInitial = brandName.charAt(0).toUpperCase() || "M";

  return (
    <section className="partner-demo partner-demo-wow">
      <div className="partner-demo-aura" />

      <div className="partner-demo-header">
        <div className="partner-demo-icon">
          <TrendingUp size={20} />
        </div>

        <div>
          <strong>
            Calculadora de ganancias + vista previa de marca blanca
          </strong>

          <span>
            Personaliza el modelo y observa cómo verán tus clientes su
            plataforma.
          </span>
        </div>

        <div className="live-pill">
          <i />
          Demo en vivo
        </div>
      </div>

      <div className="partner-demo-body">
        <div className="profit-panel">
          <label className="control-label">
            Plan que revendes
          </label>

          <div className="plan-switch">
            <button
              type="button"
              className={plan === "basic" ? "active" : ""}
              onClick={() => changePlan("basic")}
            >
              Básico · USD 47
            </button>

            <button
              type="button"
              className={plan === "pro" ? "active" : ""}
              onClick={() => changePlan("pro")}
            >
              Pro · USD 87
            </button>
          </div>

          <label className="control-label control-space">
            Precio de venta
            <b>USD {safePrice}</b>
            <small>/mes</small>
          </label>

          <input
            className="range purple"
            type="range"
            min={minimum}
            max={297}
            value={safePrice}
            onChange={(event) =>
              setPrice(Number(event.target.value))
            }
          />

          <div className="range-labels">
            <span>USD {minimum}</span>
            <span>USD 297</span>
          </div>

          <label className="control-label control-space">
            Clientes
            <b>{clients}</b>
          </label>

          <input
            className="range blue"
            type="range"
            min={1}
            max={50}
            value={clients}
            onChange={(event) =>
              setClients(Number(event.target.value))
            }
          />

          <div className="range-labels">
            <span>1</span>
            <span>50</span>
          </div>

          <div className="profit-result" key={`${profit}-${plan}`}>
            <span>Tu ganancia mensual estimada</span>

            <strong>USD {formatNumber(profit)}</strong>

            <small>
              Ingresos: USD {formatNumber(revenue)}
              {" · "}
              Costo: USD {formatNumber(totalCost)}
            </small>
          </div>

          <div className="brand-controls">
            <label
              className="control-label"
              htmlFor="partner-brand-name"
            >
              Tu marca blanca
            </label>

            <input
              id="partner-brand-name"
              type="text"
              value={brand}
              maxLength={24}
              onChange={(event) =>
                setBrand(event.target.value)
              }
              placeholder="Nombre de tu empresa"
            />

            <div className="color-row">
              <span>Color de marca</span>

              <input
                type="color"
                value={color}
                aria-label="Seleccionar color de marca"
                onChange={(event) =>
                  setColor(event.target.value)
                }
              />

              <code>{color}</code>
            </div>
          </div>
        </div>

        <div
          className="dashboard-preview-panel"
          style={{ "--partner-color": color }}
        >
          <div className="preview-label">
            Vista previa de la experiencia de tu cliente
          </div>

          <div className="monitor-wrap">
            <div className="monitor-screen">
              <div className="monitor-live-light" />
              <div className="monitor-scanlines" />

              <div className="partner-topbar">
                <div className="partner-brand">
                  <div className="partner-logo">
                    {brandInitial}
                  </div>

                  <strong>{brandName}</strong>
                  <span>PRO</span>
                </div>

                <div className="partner-tools">
                  <Bell size={17} />
                  <Settings size={17} />
                  <UserRound size={17} />
                </div>
              </div>

              <div className="partner-layout">
                <aside className="partner-sidebar">
                  {menu.map(([Icon, label], index) => (
                    <div
                      key={label}
                      className={index === activeMenu ? "active" : ""}
                    >
                      <Icon size={17} />
                      <span>{label}</span>
                    </div>
                  ))}
                </aside>

                <main className="partner-main">
                  <div className="partner-welcome">
                    <small>Bienvenido de vuelta 👋</small>

                    <strong>
                      {brandName} — Panel de control
                    </strong>
                  </div>

                  <div className="partner-kpis">
                    {[
                      ["1.248", "Visitas"],
                      ["84", "Leads"],
                      ["USD 8.4k", "Ingresos"],
                      ["32", "Ventas"],
                    ].map(([value, label], index) => (
                      <div
                        key={label}
                        style={{ "--kpi-delay": `${index * 0.12}s` }}
                      >
                        <strong>{value}</strong>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="partner-widgets">
                    <div className="partner-chart">
                      <span>Visitas · últimos 30 días</span>

                      <div className="chart-bars">
                        {chartData.map((height, index) => (
                          <i
                            key={`${height}-${index}`}
                            style={{
                              height: `${height}%`,
                              "--bar-delay": `${index * 0.035}s`,
                            }}
                            className={index > 26 ? "hot" : ""}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="partner-side-widgets">
                      <div>
                        <header>
                          <span>WhatsApp</span>
                          <b>● En línea</b>
                        </header>

                        <p>
                          Interesado en tu producto
                          <small>2m</small>
                        </p>

                        <p>
                          ¿Cuánto cuesta?
                          <small>5m</small>
                        </p>
                      </div>

                      <div>
                        <header>
                          <span>Redes sociales</span>
                        </header>

                        <p>
                          Instagram
                          <b>2.4k</b>
                        </p>

                        <p>
                          Facebook
                          <b>1.8k</b>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="partner-popup">
                    <span>
                      🎯 Pop-up activo: “20% OFF esta semana”
                    </span>

                    <b>127 vistas hoy</b>
                  </div>
                </main>
              </div>
            </div>

            <div className="monitor-neck" />
            <div className="monitor-base" />
          </div>

          <p className="preview-foot">
            Tu cliente verá una experiencia completamente bajo{" "}
            <strong>{brandName}</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}