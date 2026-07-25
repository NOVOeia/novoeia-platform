import { useState } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  Mail,
  LockKeyhole,
  LayoutDashboard,
} from "lucide-react";
import { Button, Logo, Field } from "../components/ui.jsx";
import "../styles/site-wow.css";

export default function LoginPage({ go }) {
  const [role, setRole] = useState("admin");

  return (
    <div className="wow-auth-page">
      <div className="wow-auth-grid" />
      <div className="wow-auth-orb auth-orb-a" />
      <div className="wow-auth-orb auth-orb-b" />

      <button
        className="back wow-back"
        onClick={() => go("home")}
      >
        <ArrowLeft />
        Volver
      </button>

      <div className="auth-card card wow-auth-card wow-login-card">
        <Logo />

        <div className="eyebrow">DEMO DE ACCESO</div>

        <h2>Entra a tu experiencia NOVO</h2>

        <p className="auth-intro">
          Selecciona el panel que deseas explorar.
        </p>

        <div className="login-security">
          <ShieldCheck />
          <span>Acceso seguro y protegido</span>
        </div>

        <Field label="Tipo de usuario">
          <div className="wow-input-wrap wow-select-wrap">
            <LayoutDashboard />

            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="admin">NOVO Admin</option>
              <option value="partner">Partner</option>
              <option value="client">Cliente</option>
            </select>
          </div>
        </Field>

        <Field label="Correo">
          <div className="wow-input-wrap">
            <Mail />
            <input defaultValue="demo@novoeia.com" />
          </div>
        </Field>

        <Field label="Contraseña">
          <div className="wow-input-wrap">
            <LockKeyhole />
            <input
              type="password"
              defaultValue="123456"
            />
          </div>
        </Field>

        <Button
          className="full"
          onClick={() => go(`${role}-dashboard`)}
        >
          Entrar al demo
        </Button>
      </div>
    </div>
  );
}