import { Fragment, useEffect, useState, useCallback } from 'react';
import {
  Settings, PlugZap, CreditCard, RefreshCw, Save,
  Users, Building2, Package, CheckCircle2, AlertCircle, Plus,
  DollarSign, Activity, Link2, Copy, ExternalLink,
  Eye, Edit2, X, ArrowUpRight, Search, BarChart2,
  LifeBuoy, KeyRound, Webhook, Trash2, Globe, Phone, Mail,
  MapPin, User, FileText, Image, UploadCloud, Loader2,
  Archive, Power, PowerOff, UserPlus, ScrollText, Check, XCircle, LogIn
} from 'lucide-react';
import { platformApi } from '../lib/platformApi.js';
import {
  EMAIL_API_PROVIDERS,
  EMAIL_ENCRYPTION_OPTIONS,
  EMAIL_PROVIDER_PRESETS,
  EMAIL_TRANSPORT_OPTIONS,
} from '../lib/emailProviderPresets.js';
import { calculateCheckoutDueToday } from '../lib/checkoutLineItems.js';
import { notifyPartnerCatalogUpdated, subscribePartnerCatalogUpdated } from '../lib/partnerCatalogEvents.js';
import { MAX_PARTNER_ADDITIONAL_SERVICES } from '../lib/storefrontDefaults.js';
import { supabase } from '../lib/supabase.js';
import PartnerBrandConsole from './PartnerBrandConsole.jsx';
import PartnerPaymentsModule from './PartnerPaymentsModule.jsx';
import AdminPartnerCreateForm from './partner-registration/AdminPartnerCreateForm.jsx';
import AdminEmailTemplates from './AdminEmailTemplates.jsx';
import PartnerRegistrationEmbed from './PartnerRegistrationEmbed.jsx';
import {
  countryLabel,
  paymentRouteFromSelection,
  statusLabel as paymentStatusLabel,
} from '../lib/partnerPaymentConfig.js';

/* ================================
   SUPER ADMIN ROUTER
================================ */
export function SuperAdminConsole({ section, go }) {
  if (section === 'dashboard') return <AdminDashboard />;
  if (section === 'partners') return <AdminPartners go={go} />;
  if (section === 'registrations') return <AdminPartnerRegistrations />;
  if (section === 'clients') return <AdminClients />;
  if (section === 'products') return <AdminProducts />;
  if (section === 'links') return <AdminSalesLinks />;
  if (section === 'subscriptions') return <AdminSubscriptions />;
  if (section === 'payments') return <AdminPayments />;
  if (section === 'support') return <AdminSupport />;
  if (section === 'email-templates') return <AdminEmailTemplates />;
  if (section === 'audit') return <AdminAuditLogs />;
  if (section === 'settings') return <AdminSettings />;
  return <AdminDashboard />;
}

/* ================================
   ADMIN DASHBOARD
================================ */
function AdminDashboard() {
  const [partners, setPartners] = useState([]);
  const [products, setProducts] = useState([]);
  const [clientCount, setClientCount] = useState(null);
  const [activeSubs, setActiveSubs] = useState(null);
  const [pendingCommissions, setPendingCommissions] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pd, cd, clientsData, subsData, commData, health] = await Promise.all([
          platformApi.listPartners().catch(() => ({ partners: [] })),
          platformApi.listCatalogProducts().catch(() => ({ products: [] })),
          platformApi.listAllClients().catch(() => ({ clients: [] })),
          platformApi.listActiveSubscriptions().catch(() => ({ subscriptions: [] })),
          platformApi.listCommissions({ status: 'pending' }).catch(() => ({ commissions: [] })),
          platformApi.getAdminSystemHealth().catch(() => null),
        ]);
        setPartners(pd?.partners || []);
        setProducts(cd?.products || []);
        setClientCount((clientsData?.clients || []).length);
        setActiveSubs((subsData?.subscriptions || []).length);
        const pending = commData?.commissions || [];
        setPendingCommissions({
          count: pending.length,
          total: pending.reduce((sum, row) => sum + Number(row.commission_amount || 0), 0),
        });
        setSystemHealth(health);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  const active = partners.filter(p => p.status === 'active').length;
  const integrationRows = [
    ['Supabase Auth + RLS', true, 'Activo'],
    ['Catálogo de productos', products.length > 0, products.length > 0 ? `${products.length} productos` : 'Pendiente'],
    ['Partners registrados', partners.length > 0, partners.length > 0 ? `${partners.length} partners` : 'Pendiente'],
    [
      'GHL agencia conectada',
      Boolean(systemHealth?.ghl?.connected),
      systemHealth?.ghl?.connected
        ? (systemHealth.ghl.companyId ? `Company ${String(systemHealth.ghl.companyId).slice(0, 10)}…` : 'Conectada')
        : 'Pendiente',
    ],
    [
      'GHL provisioning (locations.write)',
      Boolean(systemHealth?.ghl?.provisionReady),
      systemHealth?.ghl?.provisionReady
        ? 'Listo'
        : (systemHealth?.ghl?.connected ? 'Falta scope write' : 'Pendiente'),
    ],
    [
      'Stripe Checkout',
      (activeSubs ?? 0) > 0 || Boolean(systemHealth?.stripe?.configured),
      (activeSubs ?? 0) > 0 ? `${activeSubs} suscripciones` : (systemHealth?.stripe?.configured ? 'Configurado' : 'Pendiente'),
    ],
    [
      'Registros partner pendientes',
      (systemHealth?.partnersPending ?? 0) === 0,
      (systemHealth?.partnersPending ?? 0) > 0 ? `${systemHealth.partnersPending} por revisar` : 'Al día',
    ],
  ];

  return (
    <div className="novo-page">
      <div className="novo-page-header">
        <span className="kicker">NOVO CONTROL CENTER</span>
        <h1>Dashboard General</h1>
        <p>Vista ejecutiva del ecosistema NOVOeia Partners.</p>
      </div>
      <div className="novo-stats">
        {[
          { label: 'Partners registrados', value: loading ? '…' : partners.length, icon: Users, color: 'blue', sub: `${active} activos`, up: true },
          { label: 'Clientes en plataforma', value: loading ? '…' : clientCount ?? '—', icon: Building2, color: 'purple', sub: 'Todos los partners' },
          { label: 'Suscripciones activas', value: loading ? '…' : activeSubs ?? '—', icon: Activity, color: 'green', sub: 'Links pagados', up: activeSubs > 0 },
          { label: 'Comisiones pendientes', value: loading ? '…' : pendingCommissions ? `$${pendingCommissions.total.toFixed(0)}` : '$—', icon: DollarSign, color: 'orange', sub: pendingCommissions ? `${pendingCommissions.count} por pagar` : 'Sin pendientes' },
        ].map(({ label, value, icon: Icon, color, sub, up }) => (
          <div className="novo-stat" key={label}>
            <div className={`novo-stat-icon ${color}`}><Icon size={17} /></div>
            <span className="novo-stat-label">{label}</span>
            <span className="novo-stat-value">{value}</span>
            <span className={`novo-stat-sub ${up ? 'up' : ''}`}>{up && <ArrowUpRight size={11} />}{sub}</span>
          </div>
        ))}
      </div>
      {!loading && (systemHealth?.clientsGhlFailed ?? 0) > 0 && (
        <div className="novo-card" style={{ marginBottom: 16, border: '1px solid rgba(239,68,68,.25)', background: 'rgba(239,68,68,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} style={{ color: 'var(--novo-danger, #ef4444)', flexShrink: 0 }} />
            <div>
              <strong style={{ color: 'var(--novo-text)' }}>
                {systemHealth.clientsGhlFailed} cliente{systemHealth.clientsGhlFailed === 1 ? '' : 's'} con activación GHL fallida
              </strong>
              <p style={{ margin: '4px 0 0', color: 'var(--novo-muted)', fontSize: 13 }}>
                Revisa Clientes → filtro GHL = Fallido y usa «Reintentar activación GHL».
              </p>
            </div>
          </div>
        </div>
      )}
      {!loading && (systemHealth?.partnersPending ?? 0) > 0 && (
        <div className="novo-card" style={{ marginBottom: 16, border: '1px solid rgba(245,158,11,.25)', background: 'rgba(245,158,11,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <UserPlus size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <div>
              <strong style={{ color: 'var(--novo-text)' }}>
                {systemHealth.partnersPending} registro{systemHealth.partnersPending === 1 ? '' : 's'} partner pendiente{systemHealth.partnersPending === 1 ? '' : 's'} de aprobación
              </strong>
              <p style={{ margin: '4px 0 0', color: 'var(--novo-muted)', fontSize: 13 }}>
                Revisa Registros partner para aprobar o rechazar solicitudes.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="novo-grid-2">
        <div className="novo-card">
          <div className="novo-card-header">
            <div><div className="novo-card-title">Partners recientes</div><div className="novo-card-sub">Últimos registrados</div></div>
            <BarChart2 size={18} style={{ color: 'var(--novo-muted)' }} />
          </div>
          {loading && <div className="novo-empty">Cargando…</div>}
          {!loading && partners.length === 0 && <div className="novo-empty">No hay partners aún.</div>}
          {!loading && partners.length > 0 && (
            <table className="novo-table">
              <thead><tr><th>Partner</th><th>Plan</th><th>Estado</th></tr></thead>
              <tbody>
                {partners.slice(0, 6).map(p => (
                  <tr key={p.id}>
                    <td><strong style={{ color: 'var(--novo-text)' }}>{p.name}</strong><br /><small style={{ color: 'var(--novo-muted)' }}>/{p.slug}</small></td>
                    <td>{p.plan_name || 'Partner'}</td>
                    <td><Badge status={p.status || 'pending'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="novo-card">
          <div className="novo-card-header">
            <div><div className="novo-card-title">Estado del sistema</div><div className="novo-card-sub">Integraciones activas</div></div>
            <Activity size={18} style={{ color: 'var(--novo-muted)' }} />
          </div>
          {integrationRows.map(([label, ok, detail]) => (
            <div key={label} className="status-row">
              <span>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <small style={{ color: 'var(--novo-muted)' }}>{detail}</small>
                <Badge status={ok ? 'active' : 'pending'} label={ok ? 'Activo' : 'Pendiente'} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================
   ADMIN PARTNERS
================================ */
function AdminPartners({ go }) {
  const [partners, setPartners] = useState([]);
  const [ownersById, setOwnersById] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', plan_name: 'partner', status: 'pending' });
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await platformApi.listPartners();
      const rows = data?.partners || [];
      setPartners(rows);

      const ownerIds = [...new Set(rows.map(row => row.owner_user_id).filter(Boolean))];
      if (ownerIds.length === 0) {
        setOwnersById({});
        return;
      }

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone')
        .in('id', ownerIds);
      if (error) throw error;
      setOwnersById(Object.fromEntries((profiles || []).map(profile => [profile.id, profile])));
    }
    catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openPartnerPanel(partner) {
    if (partner.status !== 'active') {
      setNotice({ type: 'error', text: 'Solo puedes impersonar partners activos.' });
      return;
    }
    platformApi.startImpersonatingPartner(partner);
    go?.('partner-dashboard/dashboard');
  }

  async function savePartner() {
    if (!editMode || !selected) return;
    try {
      setBusy(true);
      await platformApi.updatePartner({ ...form, id: selected.id });
      setNotice({ type: 'success', text: 'Partner actualizado.' });
      setShowForm(false);
      setEditMode(false);
      setForm({ name: '', slug: '', plan_name: 'partner', status: 'pending' });
      setSelected(null);
      load();
    } catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setBusy(false); }
  }

  async function changePartnerStatus(partner, status) {
    if (!partner?.id || partner.status === status) return;
    try {
      setBusy(true);
      await platformApi.updatePartner({ id: partner.id, status });
      setNotice({
        type: 'success',
        text: status === 'active'
          ? `${partner.name} activado.`
          : status === 'inactive'
            ? `${partner.name} desactivado.`
            : `${partner.name} marcado como pendiente.`,
      });
      if (selected?.id === partner.id) {
        setSelected({ ...partner, status });
        setForm((current) => ({ ...current, status }));
      }
      await load();
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function sendPasswordReset(partner, owner) {
    const email = owner?.email;
    if (!email) {
      setNotice({ type: 'error', text: 'Este partner no tiene un correo de owner vinculado.' });
      return;
    }
    if (!window.confirm(`¿Enviar correo de recuperación de contraseña a ${email}?`)) return;
    try {
      setBusy(true);
      const data = await platformApi.sendPartnerPasswordReset(partner.id);
      setNotice({
        type: 'success',
        text: `Correo de recuperación enviado a ${data?.to || email}.`,
      });
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  function openEdit(p) {
    setForm({ name: p.name, slug: p.slug, plan_name: p.plan_name || 'partner', status: p.status || 'pending' });
    setSelected(p); setEditMode(true); setShowForm(true);
    window.requestAnimationFrame(() => {
      document.querySelector('.novo-page-header')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  const filtered = partners.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.slug?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="novo-page">
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><span className="kicker">GESTIÓN</span><h1>Partners</h1><p>Administra los partners del ecosistema NOVO.</p></div>
        <button className="novo-btn novo-btn-primary" onClick={() => { setShowForm(true); setEditMode(false); setSelected(null); }}>
          <Plus size={15} /> Nuevo partner
        </button>
      </div>
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}
      {showForm && !editMode && (
        <AdminPartnerCreateForm
          onCancel={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            setNotice({ type: 'success', text: 'Partner creado con cuenta y perfil vinculados.' });
            load();
          }}
        />
      )}
      {showForm && editMode && (
        <div className="novo-card" style={{ marginBottom: 20, border: '1px solid rgba(124,58,237,.3)' }}>
          <div className="novo-card-header">
            <div className="novo-card-title">Editando: {selected?.name}</div>
            <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setShowForm(false)}><X size={14} /></button>
          </div>
          <div className="novo-grid-2">
            <NField label="Nombre de la empresa" value={form.name} onChange={v => setForm({ ...form, name: v })} />
            <NField label="Slug" value={form.slug} onChange={v => setForm({ ...form, slug: v.toLowerCase().replace(/\s/g, '-') })} />
            <div className="novo-field">
              <label>Plan</label>
              <select value={form.plan_name} onChange={e => setForm({ ...form, plan_name: e.target.value })}>
                <option value="partner">Partner</option>
                <option value="partner_pro">Partner Pro</option>
                <option value="partner_enterprise">Partner Enterprise</option>
              </select>
            </div>
            <div className="novo-field">
              <label>Estado</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pendiente</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="novo-btn novo-btn-primary" onClick={savePartner} disabled={busy}><Save size={14} /> Actualizar</button>
            <button className="novo-btn novo-btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}
      <div className="novo-card">
        <div className="novo-card-header">
          <div className="novo-card-title">Partners registrados ({filtered.length})</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="novo-search" style={{ width: 200 }}><Search size={13} /><input placeholder="Buscar…" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <button className="novo-btn novo-btn-ghost" onClick={load}><RefreshCw size={13} /></button>
          </div>
        </div>
        {loading && <div className="novo-empty">Cargando…</div>}
        {!loading && filtered.length === 0 && <div className="novo-empty">No hay partners.</div>}
        {!loading && filtered.length > 0 && (
          <table className="novo-table">
            <thead><tr><th>Partner</th><th>Plan</th><th>GHL</th><th>Estado</th><th>Creado</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtered.map(p => {
                const owner = ownersById[p.owner_user_id] || null;
                return (
                <Fragment key={p.id}>
                  <tr>
                    <td><strong style={{ color: 'var(--novo-text)' }}>{p.name}</strong><br /><small style={{ color: 'var(--novo-muted)', fontSize: 11 }}>/{p.slug}</small></td>
                    <td>{p.plan_name || 'Partner'}</td>
                    <td style={{ fontSize: 12, color: 'var(--novo-muted)' }}>{p.ghl_location_id || 'Sin asignar'}</td>
                    <td>
                      <select
                        value={p.status || 'pending'}
                        disabled={busy}
                        onChange={(e) => changePartnerStatus(p, e.target.value)}
                        style={{
                          minWidth: 120,
                          padding: '6px 8px',
                          borderRadius: 8,
                          border: '1px solid rgba(148,163,184,.35)',
                          background: 'var(--novo-surface, #fff)',
                          color: 'var(--novo-text)',
                          fontSize: 12,
                        }}
                        aria-label={`Estado de ${p.name}`}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--novo-muted)' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setSelected(selected?.id === p.id ? null : p)}><Eye size={12} /> {selected?.id === p.id ? 'Cerrar' : 'Ver'}</button>
                        <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => openEdit(p)}><Edit2 size={12} /> Editar</button>
                      </div>
                    </td>
                  </tr>
                  {selected?.id === p.id && (
                    <tr key={`${p.id}-d`}>
                      <td colSpan={6} style={{ padding: 0 }}>
                        <div style={{ background: 'rgba(124,58,237,.05)', border: '1px solid rgba(124,58,237,.15)', borderRadius: 10, margin: '4px 0', padding: '18px 20px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
                            <Info label="ID" value={p.id.slice(0,8)+'…'} />
                            <Info label="Owner" value={owner?.email || (p.owner_user_id ? p.owner_user_id.slice(0,8)+'…' : 'Sin vincular')} />
                            <Info label="GHL Location" value={p.ghl_location_id || 'Sin asignar'} />
                            <Info label="Creado" value={new Date(p.created_at).toLocaleDateString()} />
                          </div>
                          <AdminPartnerOffers partnerId={p.id} partnerName={p.name} />
                          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                            <button className="novo-btn novo-btn-primary" onClick={() => openEdit(p)}><Edit2 size={13} /> Editar partner</button>
                            <button
                              className="novo-btn novo-btn-secondary"
                              onClick={() => sendPasswordReset(p, owner)}
                              disabled={busy || !owner?.email}
                              title={owner?.email ? `Enviar recuperación a ${owner.email}` : 'Sin correo de owner'}
                            >
                              <KeyRound size={13} /> Enviar recuperación
                            </button>
                            <button
                              className="novo-btn novo-btn-secondary"
                              onClick={() => openPartnerPanel(p)}
                              disabled={p.status !== 'active'}
                              title={p.status !== 'active' ? 'El partner debe estar activo' : 'Abrir panel como este partner'}
                            >
                              <LogIn size={13} /> Ver panel partner
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );})}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ================================
   ADMIN OFERTAS PARTNER
================================ */
function AdminPartnerOffers({ partnerId, partnerName }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [drafts, setDrafts] = useState({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await platformApi.listPartnerOffersForAdmin(partnerId);
      const rows = data?.products || [];
      setProducts(rows);
      setDrafts(() => {
        const next = {};
        rows.forEach(product => {
          next[product.id] = {
            retailPrice: product.retailPrice != null ? String(product.retailPrice) : '',
            ghlPriceId: product.ghlPriceId || '',
          };
        });
        return next;
      });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => { load(); }, [load]);

  function updateDraft(productId, field, value) {
    setDrafts(current => ({
      ...current,
      [productId]: {
        ...current[productId],
        [field]: value,
      },
    }));
  }

  async function saveOffer(product) {
    const draft = drafts[product.id] || {};
    const retailPrice = Number(draft.retailPrice);
    if (!Number.isFinite(retailPrice) || retailPrice <= 0) {
      setNotice({ type: 'error', text: `Define un precio retail válido para ${product.name}.` });
      return;
    }
    if (retailPrice < Number(product.wholesale_price || 0)) {
      setNotice({ type: 'error', text: 'El precio retail no puede ser menor al mayorista.' });
      return;
    }

    try {
      setBusy(true);
      await platformApi.savePartnerOfferForAdmin(partnerId, {
        productId: product.id,
        retailPrice,
        displayName: product.displayName || product.name,
        ghlPriceId: draft.ghlPriceId?.trim() || null,
        active: true,
      });
      setNotice({ type: 'success', text: `Oferta de ${product.name} guardada para ${partnerName}.` });
      await load();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ borderTop: '1px solid rgba(124,58,237,.12)', paddingTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <strong style={{ color: 'var(--novo-text)' }}>Ofertas y GHL price</strong>
          <p style={{ margin: '4px 0 0', color: 'var(--novo-muted)', fontSize: 13 }}>
            Precio retail y GHL Price ID por producto para provisioning SaaS.
          </p>
        </div>
        <button className="novo-btn novo-btn-ghost" onClick={load} disabled={loading || busy}>
          <RefreshCw size={13} />
        </button>
      </div>
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}
      {loading && <div className="novo-empty">Cargando ofertas…</div>}
      {!loading && products.length === 0 && <div className="novo-empty">No hay productos en catálogo.</div>}
      {!loading && products.length > 0 && (
        <table className="novo-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Mayorista</th>
              <th>Retail</th>
              <th>GHL Price ID</th>
              <th>Catálogo GHL</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const draft = drafts[product.id] || {};
              return (
                <tr key={product.id}>
                  <td>
                    <strong style={{ color: 'var(--novo-text)' }}>{product.name}</strong>
                    {!product.active && <><br /><small style={{ color: 'var(--novo-muted)' }}>Inactivo en catálogo</small></>}
                  </td>
                  <td>{money(product.wholesale_price, product.currency)}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draft.retailPrice ?? ''}
                      onChange={e => updateDraft(product.id, 'retailPrice', e.target.value)}
                      style={{ width: 90, padding: '4px 8px', fontSize: 12 }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={draft.ghlPriceId ?? ''}
                      onChange={e => updateDraft(product.id, 'ghlPriceId', e.target.value)}
                      placeholder={product.catalogGhlPriceId || 'price_…'}
                      style={{ width: 140, padding: '4px 8px', fontSize: 12 }}
                    />
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--novo-muted)' }}>
                    {product.ghl_product_id || '—'}
                    {product.catalogGhlPriceId && <><br />{product.catalogGhlPriceId}</>}
                  </td>
                  <td>
                    <Badge
                      status={product.offerActive ? 'active' : 'pending'}
                      label={product.offerActive ? 'Publicada' : 'Sin oferta'}
                    />
                  </td>
                  <td>
                    <button
                      className="novo-btn novo-btn-primary"
                      style={{ padding: '4px 10px', fontSize: 11 }}
                      onClick={() => saveOffer(product)}
                      disabled={busy}
                    >
                      <Save size={12} /> Guardar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ================================
   ADMIN REGISTROS PARTNER
================================ */
function AdminPartnerRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await platformApi.listPendingPartnerRegistrations();
      setRegistrations(data?.registrations || []);
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function review(partnerId, decision) {
    try {
      setBusy(true);
      await platformApi.reviewPartnerRegistration(partnerId, decision, reviewNote.trim() || null);
      setNotice({
        type: 'success',
        text: decision === 'approve' ? 'Partner aprobado y activado.' : 'Registro rechazado.',
      });
      setReviewNote('');
      setExpandedId(null);
      await load();
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="novo-page">
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="kicker">ONBOARDING</span>
          <h1>Registros partner</h1>
          <p>Solicitudes desde la landing pública pendientes de aprobación.</p>
        </div>
        <button className="novo-btn novo-btn-ghost" onClick={load} disabled={loading}>
          <RefreshCw size={13} />
        </button>
      </div>
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

      <div className="novo-card">
        <div className="novo-card-header">
          <div>
            <div className="novo-card-title">Pendientes ({loading ? '…' : registrations.length})</div>
            <div className="novo-card-sub">Al aprobar, el partner pasa a estado activo y puede operar</div>
          </div>
        </div>
        {loading && <div className="novo-empty">Cargando…</div>}
        {!loading && registrations.length === 0 && (
          <div className="novo-empty">No hay registros pendientes.</div>
        )}
        {!loading && registrations.length > 0 && (
          <table className="novo-table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Contacto</th>
                <th>Precios</th>
                <th>Solicitud</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(row => {
                const owner = row.owner || {};
                const branding = row.branding || {};
                const prices = branding.prices || {};
                const expanded = expandedId === row.id;
                return (
                  <Fragment key={row.id}>
                    <tr>
                      <td>
                        <strong style={{ color: 'var(--novo-text)' }}>{row.name}</strong>
                        <br />
                        <small style={{ color: 'var(--novo-muted)' }}>/{row.slug}</small>
                      </td>
                      <td>
                        {owner.full_name || '—'}
                        <br />
                        <small style={{ color: 'var(--novo-muted)' }}>{owner.email || branding.contactEmail || '—'}</small>
                        {(owner.phone || branding.contactPhone) && (
                          <>
                            <br />
                            <small style={{ color: 'var(--novo-muted)' }}>{owner.phone || branding.contactPhone}</small>
                          </>
                        )}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {prices.basic != null && <div>Básico: ${prices.basic}</div>}
                        {prices.pro != null && <div>Pro: ${prices.pro}</div>}
                        {prices.basic == null && prices.pro == null && '—'}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--novo-muted)' }}>{formatDate(row.created_at)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            className="novo-btn novo-btn-primary"
                            style={{ padding: '4px 10px', fontSize: 11 }}
                            onClick={() => setExpandedId(expanded ? null : row.id)}
                            disabled={busy}
                          >
                            {expanded ? 'Cerrar' : 'Revisar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded && (
                      <tr>
                        <td colSpan={5} style={{ background: 'rgba(124,58,237,.04)' }}>
                          <div style={{ padding: '12px 4px' }}>
                            <div className="novo-grid-2" style={{ marginBottom: 12 }}>
                              <InfoField label="Plan" value={row.plan_name || 'Partner'} />
                              <InfoField label="Color marca" value={branding.primaryColor || '—'} />
                            </div>
                            <div className="novo-field" style={{ marginBottom: 12 }}>
                              <label>Nota interna (opcional)</label>
                              <textarea
                                rows={2}
                                value={reviewNote}
                                onChange={e => setReviewNote(e.target.value)}
                                placeholder="Motivo de aprobación o rechazo…"
                                style={{ width: '100%', resize: 'vertical' }}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                              <button
                                className="novo-btn novo-btn-primary"
                                onClick={() => review(row.id, 'approve')}
                                disabled={busy}
                              >
                                <Check size={14} /> Aprobar
                              </button>
                              <button
                                className="novo-btn novo-btn-ghost"
                                onClick={() => review(row.id, 'reject')}
                                disabled={busy}
                                style={{ color: 'var(--novo-danger, #ef4444)' }}
                              >
                                <XCircle size={14} /> Rechazar
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ================================
   ADMIN CLIENTES
================================ */
function AdminClients() {
  const [partners, setPartners] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ partnerId: '', status: '', ghlSyncStatus: '' });
  const [formPartnerId, setFormPartnerId] = useState('');
  const [retryingClientId, setRetryingClientId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [partnersData, clientsData] = await Promise.all([
        platformApi.listPartners(),
        platformApi.listAllClients({
          partnerId: filters.partnerId || null,
          status: filters.status || null,
          ghlSyncStatus: filters.ghlSyncStatus || null,
        }),
      ]);
      const rows = partnersData?.partners || [];
      setPartners(rows);
      setClients(clientsData?.clients || []);
      setFormPartnerId(current => current || rows[0]?.id || '');
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }, [filters.partnerId, filters.status, filters.ghlSyncStatus]);

  useEffect(() => { load(); }, [load]);

  async function saveClient(form) {
    const partnerId = formPartnerId || filters.partnerId;
    if (!partnerId) {
      setNotice({ type: 'error', text: 'Selecciona un Partner antes de crear el cliente.' });
      return;
    }
    try {
      setBusy(true);
      await platformApi.createPartnerClient({
        ...form,
        partnerId,
        name: form.company_name || form.name,
      });
      setNotice({ type: 'success', text: 'Cliente creado y asignado al Partner.' });
      setShowForm(false);
      await load();
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function retryGhlProvision(client) {
    try {
      setRetryingClientId(client.id);
      const result = await platformApi.provisionClientInGhl(client.id, {
        offerId: client.offer_id || null,
      });

      if (result?.skipped && result?.reason === 'already_provisioned') {
        setNotice({ type: 'success', text: 'Este cliente ya tiene subcuenta GHL activa.' });
      } else if (result?.skipped && result?.reason === 'agency_not_connected') {
        setNotice({ type: 'error', text: 'Conecta la agencia GHL desde Super Admin antes de reintentar.' });
      } else if (result?.locationId) {
        setNotice({ type: 'success', text: `Subcuenta GHL creada: ${result.locationId}` });
      } else {
        setNotice({ type: 'success', text: 'Activación GHL procesada.' });
      }

      await load();
    } catch (e) {
      setNotice({ type: 'error', text: e.message || 'No se pudo reactivar en GHL.' });
    } finally {
      setRetryingClientId(null);
    }
  }

  function canRetryGhl(client) {
    return ['failed', 'pending_agency'].includes(client.ghl_sync_status);
  }

  function ghlSyncLabel(status) {
    if (status === 'provisioned') return 'Activo';
    if (status === 'failed') return 'Fallido';
    if (status === 'pending_agency') return 'Sin agencia';
    return 'Pendiente';
  }

  const formPartner = partners.find(p => p.id === formPartnerId);
  const filtered = clients.filter(client => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    const partnerName = client.partners?.name || '';
    return [client.company_name, client.name, client.contact_name, client.email, partnerName]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(term));
  });

  return (
    <div className="novo-page">
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="kicker">ECOSISTEMA</span>
          <h1>Clientes</h1>
          <p>Vista global de todos los clientes del ecosistema NOVO.</p>
        </div>
        <button className="novo-btn novo-btn-primary" onClick={() => setShowForm(true)} disabled={!formPartnerId && !filters.partnerId}>
          <Plus size={15} /> Nuevo cliente
        </button>
      </div>

      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

      <div className="novo-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <SelectField label="Filtrar por Partner" value={filters.partnerId} onChange={value => setFilters(current => ({ ...current, partnerId: value }))}>
            <option value="">Todos los Partners</option>
            {partners.map(partner => <option key={partner.id} value={partner.id}>{partner.name}</option>)}
          </SelectField>
          <SelectField label="Estado cliente" value={filters.status} onChange={value => setFilters(current => ({ ...current, status: value }))}>
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="cancelled">Cancelado</option>
          </SelectField>
          <SelectField label="Estado GHL" value={filters.ghlSyncStatus} onChange={value => setFilters(current => ({ ...current, ghlSyncStatus: value }))}>
            <option value="">Todos</option>
            <option value="provisioned">Activo GHL</option>
            <option value="failed">Fallido</option>
            <option value="pending_agency">Sin agencia</option>
            <option value="pending">Pendiente</option>
          </SelectField>
          <div className="novo-field">
            <label>Buscar cliente</label>
            <div className="novo-search" style={{ width: '100%' }}><Search size={13} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Empresa, contacto, correo o partner" /></div>
          </div>
        </div>
      </div>

      {showForm && (
        <>
          <div className="novo-card" style={{ marginBottom: 12 }}>
            <SelectField label="Partner propietario *" value={formPartnerId} onChange={setFormPartnerId}>
              <option value="">Selecciona un Partner</option>
              {partners.map(partner => <option key={partner.id} value={partner.id}>{partner.name}</option>)}
            </SelectField>
          </div>
          <ClientForm
            initial={emptyClient}
            title={formPartner ? `Nuevo cliente para ${formPartner.name}` : 'Nuevo cliente'}
            onSave={saveClient}
            onCancel={() => setShowForm(false)}
            busy={busy}
            uploadScope={`clients/${formPartnerId || 'unassigned'}`}
          />
        </>
      )}

      <div className="novo-card">
        <div className="novo-card-header">
          <div>
            <div className="novo-card-title">Todos los clientes ({filtered.length})</div>
            <div className="novo-card-sub">Registros de todos los partners</div>
          </div>
          <button className="novo-btn novo-btn-ghost" onClick={load} disabled={loading}>
            <RefreshCw size={13} /> Actualizar
          </button>
        </div>

        {loading && <div className="novo-empty">Cargando…</div>}
        {!loading && filtered.length === 0 && <div className="novo-empty">No hay clientes con estos filtros.</div>}
        {!loading && filtered.length > 0 && (
          <table className="novo-table">
            <thead><tr><th>Empresa</th><th>Partner</th><th>Contacto</th><th>Ubicación</th><th>Estado</th><th>GHL</th><th>Creado</th><th></th></tr></thead>
            <tbody>
              {filtered.map(client => (
                <tr key={client.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <LogoAvatar url={client.logo_url} name={client.company_name || client.name} size={32} />
                      <div>
                        <strong style={{ color: 'var(--novo-text)', display: 'block' }}>{client.company_name || client.name}</strong>
                        {client.industry && <small style={{ color: 'var(--novo-muted)' }}>{client.industry}</small>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--novo-text)' }}>{client.partners?.name || '—'}</strong>
                    {client.partners?.slug && <><br /><small style={{ color: 'var(--novo-muted)' }}>/{client.partners.slug}</small></>}
                  </td>
                  <td>{client.contact_name || '—'}<br /><small style={{ color: 'var(--novo-muted)' }}>{client.email || '—'}</small></td>
                  <td>{[client.city, client.country].filter(Boolean).join(', ') || '—'}</td>
                  <td><Badge status={client.status || 'pending'} /></td>
                  <td>
                    <Badge
                      status={client.ghl_sync_status === 'provisioned' ? 'active' : client.ghl_sync_status || 'pending'}
                      label={ghlSyncLabel(client.ghl_sync_status)}
                    />
                    {client.ghl_location_id && (
                      <small style={{ display: 'block', color: 'var(--novo-muted)', marginTop: 4 }}>
                        {client.ghl_location_id.slice(0, 12)}…
                      </small>
                    )}
                  </td>
                  <td>{formatDate(client.created_at)}</td>
                  <td>
                    {canRetryGhl(client) && (
                      <button
                        type="button"
                        className="novo-btn novo-btn-ghost"
                        style={{ whiteSpace: 'nowrap' }}
                        disabled={retryingClientId === client.id}
                        onClick={() => retryGhlProvision(client)}
                      >
                        {retryingClientId === client.id
                          ? <><Loader2 size={13} className="spin" /> Reintentando…</>
                          : <><RefreshCw size={13} /> Reintentar activación GHL</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ================================
   ADMIN PRODUCTOS
================================ */
function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const emptyForm = {
    name: '',
    description: '',
    includes: '',
    wholesalePrice: '',
    suggestedPrice: '',
    interval: 'month',
    stripeProductId: '',
    stripePriceId: '',
    ghlProductId: '',
    ghlPriceId: '',
    active: true,
  };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    try { setLoading(true); const data = await platformApi.listCatalogProducts(); setProducts(data?.products || []); }
    catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openEdit(p) {
    setForm({
      name: p.name,
      description: p.description || '',
      includes: p.includes || '',
      wholesalePrice: p.wholesale_price,
      suggestedPrice: p.suggested_price || '',
      interval: p.interval || 'month',
      stripeProductId: p.stripe_product_id || '',
      stripePriceId: p.stripe_price_id || '',
      ghlProductId: p.ghl_product_id || '',
      ghlPriceId: p.ghl_price_id || '',
      active: p.active !== false,
    });
    setEditItem(p); setShowForm(true);
  }

  async function save() {
    try {
      setBusy(true);
      await platformApi.saveCatalogProduct({ ...form, id: editItem?.id });
      setNotice({ type: 'success', text: editItem ? 'Producto actualizado.' : 'Producto creado.' });
      setShowForm(false); setEditItem(null); load();
    } catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setBusy(false); }
  }

  return (
    <div className="novo-page">
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><span className="kicker">CATÁLOGO</span><h1>Productos</h1><p>Catálogo central conectado con Stripe y GHL SaaS.</p></div>
        <button className="novo-btn novo-btn-primary" onClick={() => { setForm(emptyForm); setEditItem(null); setShowForm(true); }}><Plus size={15} /> Nuevo producto</button>
      </div>
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}
      {showForm && (
        <div className="novo-card" style={{ marginBottom: 20, border: '1px solid rgba(124,58,237,.3)' }}>
          <div className="novo-card-header">
            <div className="novo-card-title">{editItem ? `Editando: ${editItem.name}` : 'Nuevo producto'}</div>
            <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setShowForm(false)}><X size={14} /></button>
          </div>
          <div className="novo-grid-2">
            <NField label="Nombre" value={form.name} onChange={v => setForm({ ...form, name: v })} />
            <div className="novo-field">
              <label>Intervalo</label>
              <select value={form.interval} onChange={e => setForm({ ...form, interval: e.target.value })}>
                <option value="month">Mensual</option>
                <option value="year">Anual</option>
              </select>
            </div>
            <div className="novo-field" style={{ gridColumn: '1 / -1' }}>
              <label>Descripción del producto</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Resumen del plan para el partner"
                style={{ width: '100%', resize: 'vertical', background: 'var(--novo-card-hover)', border: '1px solid var(--novo-border)', borderRadius: 8, padding: '10px 12px', color: 'var(--novo-text)', fontSize: 13, outline: 'none' }}
              />
            </div>
            <div className="novo-field" style={{ gridColumn: '1 / -1' }}>
              <label>Qué incluye</label>
              <textarea
                rows={5}
                value={form.includes}
                onChange={e => setForm({ ...form, includes: e.target.value })}
                placeholder={'Un ítem por línea, por ejemplo:\nSubcuenta GoHighLevel\nAutomatizaciones incluidas\nSoporte prioritario'}
                style={{ width: '100%', resize: 'vertical', background: 'var(--novo-card-hover)', border: '1px solid var(--novo-border)', borderRadius: 8, padding: '10px 12px', color: 'var(--novo-text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
              />
              <small style={{ color: 'var(--novo-muted)', display: 'block', marginTop: 6 }}>
                Visible para el partner. Escribe un beneficio o característica por línea.
              </small>
            </div>
            <NField label="Costo mayorista (USD)" type="number" value={form.wholesalePrice} onChange={v => setForm({ ...form, wholesalePrice: v })} />
            <NField label="Precio sugerido (USD)" type="number" value={form.suggestedPrice} onChange={v => setForm({ ...form, suggestedPrice: v })} />
            <div className="novo-field">
              <label>Estado</label>
              <select value={String(form.active)} onChange={e => setForm({ ...form, active: e.target.value === 'true' })}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
            <NField label="Stripe Product ID" value={form.stripeProductId} onChange={v => setForm({ ...form, stripeProductId: v })} />
            <NField label="Stripe Price ID" value={form.stripePriceId} onChange={v => setForm({ ...form, stripePriceId: v })} />
            <NField label="GHL SaaS Plan ID" value={form.ghlProductId} onChange={v => setForm({ ...form, ghlProductId: v })} placeholder="ID del plan SaaS en GoHighLevel" />
            <NField label="GHL SaaS Price ID" value={form.ghlPriceId} onChange={v => setForm({ ...form, ghlPriceId: v })} placeholder="price_… (tarifa del plan en GHL)" />
          </div>
          <p style={{ color: 'var(--novo-muted)', fontSize: 12, margin: '0 0 16px' }}>
            Plan y Price ID se usan al activar la subcuenta GHL del cliente. Encuéntralos en GHL → SaaS Configurator → tu plan → opción de precio.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="novo-btn novo-btn-primary" onClick={save} disabled={busy}><Save size={14} /> {editItem ? 'Actualizar' : 'Crear producto'}</button>
            <button className="novo-btn novo-btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}
      <div className="novo-card">
        <div className="novo-card-header">
          <div><div className="novo-card-title">Catálogo ({products.length})</div><div className="novo-card-sub">Los partners venden estos productos.</div></div>
          <button className="novo-btn novo-btn-ghost" onClick={load}><RefreshCw size={13} /></button>
        </div>
        {loading && <div className="novo-empty">Cargando…</div>}
        {!loading && products.length === 0 && <div className="novo-empty" style={{ padding: '48px 24px' }}><Package size={32} style={{ opacity: .2, marginBottom: 12 }} /><p>No hay productos aún.</p></div>}
        {!loading && products.length > 0 && (
          <table className="novo-table">
            <thead><tr><th>Producto</th><th>Intervalo</th><th>Mayorista</th><th>Sugerido</th><th>Stripe</th><th>GHL</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {products.map(p => {
                const includeCount = String(p.includes || '').split('\n').map((line) => line.trim()).filter(Boolean).length;
                return (
                <tr key={p.id}>
                  <td>
                    <strong style={{ color: 'var(--novo-text)' }}>{p.name}</strong>
                    {p.description && <><br /><small style={{ color: 'var(--novo-muted)', fontSize: 11 }}>{p.description}</small></>}
                    {includeCount > 0 && <><br /><small style={{ color: 'var(--novo-purple)', fontSize: 11 }}>{includeCount} ítems incluidos</small></>}
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{p.interval}</td>
                  <td><span style={{ color: 'var(--novo-success)', fontWeight: 600 }}>${p.wholesale_price}</span></td>
                  <td><span style={{ color: 'var(--novo-purple)' }}>${p.suggested_price || '—'}</span></td>
                  <td>{p.stripe_product_id ? <span style={{ color: 'var(--novo-success)', fontSize: 11 }}>✓ Vinculado</span> : <span style={{ color: 'var(--novo-muted)', fontSize: 11 }}>Sin vincular</span>}</td>
                  <td>
                    {p.ghl_product_id || p.ghl_price_id ? (
                      <span style={{ color: 'var(--novo-success)', fontSize: 11 }}>
                        {p.ghl_product_id && p.ghl_price_id ? '✓ Plan + precio' : p.ghl_product_id ? '✓ Plan' : '✓ Precio'}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--novo-muted)', fontSize: 11 }}>Sin vincular</span>
                    )}
                  </td>
                  <td><Badge status={p.active ? 'active' : 'inactive'} /></td>
                  <td><button className="novo-btn novo-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => openEdit(p)}><Edit2 size={12} /> Editar</button></td>
                </tr>
              );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ================================
   ADMIN LINKS DE VENTA
================================ */
function AdminSalesLinks() {
  const [links, setLinks] = useState([]);
  const [partners, setPartners] = useState([]);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [notice, setNotice] = useState(null);
  const [filters, setFilters] = useState({ partnerId: '', status: '', search: '' });
  const [form, setForm] = useState({ partnerId: '', clientId: '', productId: '', retailPrice: '' });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [linksData, partnersData, productsData] = await Promise.all([
        platformApi.listSalesLinks(),
        platformApi.listPartners(),
        platformApi.listCatalogProducts(),
      ]);
      setLinks(linksData?.links || []);
      setPartners(partnersData?.partners || []);
      setProducts((productsData?.products || []).filter(product => product.active !== false));
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!form.partnerId) {
      setClients([]);
      setForm(current => ({ ...current, clientId: '' }));
      return;
    }
    platformApi.listPartnerClients(form.partnerId)
      .then(data => setClients(data?.clients || []))
      .catch(error => setNotice({ type: 'error', text: error.message }));
  }, [form.partnerId]);

  const selectedClient = clients.find(client => client.id === form.clientId);
  const selectedProduct = products.find(product => product.id === form.productId);
  const adminMargin = selectedProduct && form.retailPrice
    ? Number(form.retailPrice) - Number(selectedProduct.wholesale_price || 0)
    : 0;

  async function generateLink() {
    if (!form.partnerId || !form.clientId || !form.productId || !form.retailPrice) {
      setNotice({ type: 'error', text: 'Selecciona Partner, cliente, producto y precio.' });
      return;
    }
    if (Number(form.retailPrice) < Number(selectedProduct?.wholesale_price || 0)) {
      setNotice({ type: 'error', text: 'El precio no puede ser menor al costo mayorista.' });
      return;
    }
    try {
      setBusy(true);
      const result = await platformApi.generateCheckoutLink({
        partnerId: form.partnerId,
        clientId: form.clientId,
        clientEmail: selectedClient?.email || null,
        productId: form.productId,
        retailPrice: Number(form.retailPrice),
      });
      setNotice({ type: 'success', text: `Link creado para ${selectedClient?.company_name || selectedClient?.name}.` });
      setShowGenerator(false);
      setForm({ partnerId: '', clientId: '', productId: '', retailPrice: '' });
      await load();
      if (result?.checkoutUrl) navigator.clipboard?.writeText(result.checkoutUrl).catch(() => {});
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(link, status) {
    try {
      setBusy(true);
      await platformApi.updateSalesLinkStatus(link.id, status);
      setNotice({ type: 'success', text: `Link ${status === 'active' ? 'activado' : status === 'disabled' ? 'desactivado' : 'archivado'}.` });
      await load();
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  const visibleLinks = links.filter(link => {
    if (filters.partnerId && link.partner_id !== filters.partnerId) return false;
    if (filters.status && link.status !== filters.status) return false;
    const term = filters.search.trim().toLowerCase();
    if (!term) return true;
    return [link.partner_name, link.client_name, link.client_email, link.product_name]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(term));
  });

  return (
    <div className="novo-page">
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="kicker">CONTROL COMERCIAL</span>
          <h1>Links de venta</h1>
          <p>Administra cada link por Partner, cliente, producto y precio.</p>
        </div>
        <button className="novo-btn novo-btn-primary" onClick={() => setShowGenerator(current => !current)}>
          <Plus size={15} /> Generar link
        </button>
      </div>

      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

      {showGenerator && (
        <div className="novo-card" style={{ marginBottom: 20, border: '1px solid rgba(124,58,237,.3)' }}>
          <div className="novo-card-header">
            <div>
              <div className="novo-card-title">Nuevo link administrado</div>
              <div className="novo-card-sub">El cliente quedará vinculado al link y al checkout de Stripe.</div>
            </div>
            <button className="novo-btn novo-btn-ghost" onClick={() => setShowGenerator(false)}><X size={14} /></button>
          </div>
          <div className="novo-grid-2">
            <SelectField label="Partner *" value={form.partnerId} onChange={value => setForm({ partnerId: value, clientId: '', productId: form.productId, retailPrice: form.retailPrice })}>
              <option value="">Selecciona un Partner</option>
              {partners.map(partner => <option key={partner.id} value={partner.id}>{partner.name}</option>)}
            </SelectField>
            <SelectField label="Cliente del Partner *" value={form.clientId} onChange={value => setForm(current => ({ ...current, clientId: value }))} disabled={!form.partnerId}>
              <option value="">Selecciona un cliente</option>
              {clients.map(client => <option key={client.id} value={client.id}>{client.company_name || client.name}{client.email ? ` — ${client.email}` : ''}</option>)}
            </SelectField>
            <SelectField label="Producto *" value={form.productId} onChange={value => {
              const product = products.find(item => item.id === value);
              setForm(current => ({ ...current, productId: value, retailPrice: value ? String(product?.suggested_price || '') : '' }));
            }}>
              <option value="">Selecciona un producto</option>
              {products.map(product => <option key={product.id} value={product.id}>{product.name} — costo ${money(product.wholesale_price, product.currency)}</option>)}
            </SelectField>
            <NField label="Precio de venta *" type="number" value={form.retailPrice} onChange={value => setForm(current => ({ ...current, retailPrice: value }))} />
          </div>
          {selectedProduct && (
            <div className="novo-grid-3" style={{ marginBottom: 16 }}>
              <Metric label="Costo NOVO" value={money(selectedProduct.wholesale_price, selectedProduct.currency)} />
              <Metric label="Precio final" value={money(form.retailPrice || 0, selectedProduct.currency)} />
              <Metric label="Margen Partner" value={money(adminMargin, selectedProduct.currency)} tone={adminMargin >= 0 ? 'success' : 'danger'} />
            </div>
          )}
          <button className="novo-btn novo-btn-primary" onClick={generateLink} disabled={busy || !form.partnerId || !form.clientId || !form.productId || !form.retailPrice}>
            {busy ? <Loader2 size={14} style={{ animation: 'novoSpin .8s linear infinite' }} /> : <Link2 size={14} />} Crear y guardar link
          </button>
        </div>
      )}

      <div className="novo-card" style={{ marginBottom: 16 }}>
        <div className="novo-grid-3" style={{ marginBottom: 0 }}>
          <SelectField label="Filtrar por Partner" value={filters.partnerId} onChange={value => setFilters(current => ({ ...current, partnerId: value }))}>
            <option value="">Todos los Partners</option>
            {partners.map(partner => <option key={partner.id} value={partner.id}>{partner.name}</option>)}
          </SelectField>
          <SelectField label="Estado" value={filters.status} onChange={value => setFilters(current => ({ ...current, status: value }))}>
            <option value="">Todos</option>
            <option value="active">Activo</option>
            <option value="disabled">Desactivado</option>
            <option value="expired">Expirado</option>
            <option value="archived">Archivado</option>
            <option value="draft">Borrador</option>
          </SelectField>
          <div className="novo-field">
            <label>Buscar</label>
            <div className="novo-search" style={{ width: '100%' }}><Search size={13} /><input value={filters.search} onChange={e => setFilters(current => ({ ...current, search: e.target.value }))} placeholder="Partner, cliente o producto" /></div>
          </div>
        </div>
      </div>

      <SalesLinksTable
        links={visibleLinks}
        loading={loading}
        admin
        busy={busy}
        onStatusChange={changeStatus}
        onRefresh={load}
      />
    </div>
  );
}

/* ================================
   ADMIN SUSCRIPCIONES
================================ */
function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [partnerId, setPartnerId] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [subsData, partnersData] = await Promise.all([
        platformApi.listActiveSubscriptions({ partnerId: partnerId || null }),
        platformApi.listPartners(),
      ]);
      setSubscriptions(subsData?.subscriptions || []);
      setPartners(partnersData?.partners || []);
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => { load(); }, [load]);

  const filtered = subscriptions.filter(row => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [row.partner_name, row.client_name, row.client_email, row.product_name, row.stripe_subscription_id]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(term));
  });

  const mrr = filtered.reduce((sum, row) => sum + Number(row.sale_price || 0), 0);

  return (
    <div className="novo-page">
      <div className="novo-page-header">
        <span className="kicker">INGRESOS RECURRENTES</span>
        <h1>Suscripciones activas</h1>
        <p>Links de venta pagados con suscripción activa en Stripe.</p>
      </div>

      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

      <div className="novo-stats" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 16 }}>
        <div className="novo-stat">
          <div className="novo-stat-icon green"><Activity size={17} /></div>
          <span className="novo-stat-label">Suscripciones activas</span>
          <span className="novo-stat-value">{loading ? '…' : filtered.length}</span>
          <span className="novo-stat-sub">Links con pago confirmado</span>
        </div>
        <div className="novo-stat">
          <div className="novo-stat-icon purple"><DollarSign size={17} /></div>
          <span className="novo-stat-label">MRR estimado</span>
          <span className="novo-stat-value">{loading ? '…' : money(mrr)}</span>
          <span className="novo-stat-sub">Suma de precios de venta</span>
        </div>
        <div className="novo-stat">
          <div className="novo-stat-icon blue"><Users size={17} /></div>
          <span className="novo-stat-label">Partners con ingresos</span>
          <span className="novo-stat-value">{loading ? '…' : new Set(filtered.map(row => row.partner_id)).size}</span>
          <span className="novo-stat-sub">Con al menos una suscripción</span>
        </div>
      </div>

      <div className="novo-card" style={{ marginBottom: 16 }}>
        <div className="novo-grid-2" style={{ marginBottom: 0 }}>
          <SelectField label="Filtrar por Partner" value={partnerId} onChange={setPartnerId}>
            <option value="">Todos los Partners</option>
            {partners.map(partner => <option key={partner.id} value={partner.id}>{partner.name}</option>)}
          </SelectField>
          <div className="novo-field">
            <label>Buscar</label>
            <div className="novo-search" style={{ width: '100%' }}><Search size={13} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Partner, cliente, producto o subscription ID" /></div>
          </div>
        </div>
      </div>

      <div className="novo-card">
        <div className="novo-card-header">
          <div>
            <div className="novo-card-title">Suscripciones ({filtered.length})</div>
            <div className="novo-card-sub">Estado del cliente sincronizado desde partner_clients</div>
          </div>
          <button className="novo-btn novo-btn-ghost" onClick={load} disabled={loading}><RefreshCw size={13} /></button>
        </div>

        {loading && <div className="novo-empty">Cargando…</div>}
        {!loading && filtered.length === 0 && <div className="novo-empty">No hay suscripciones activas.</div>}
        {!loading && filtered.length > 0 && (
          <table className="novo-table">
            <thead>
              <tr>
                <th>Partner</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Precio</th>
                <th>Activada</th>
                <th>Stripe</th>
                <th>Estado cliente</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.id}>
                  <td><strong style={{ color: 'var(--novo-text)' }}>{row.partner_name}</strong></td>
                  <td>
                    <strong style={{ color: 'var(--novo-text)' }}>{row.client_name}</strong>
                    {row.client_email && <><br /><small style={{ color: 'var(--novo-muted)' }}>{row.client_email}</small></>}
                  </td>
                  <td>
                    {row.product_name}
                    <br /><small style={{ color: 'var(--novo-muted)' }}>{row.billing_interval === 'year' ? 'Anual' : 'Mensual'}</small>
                  </td>
                  <td><span style={{ color: 'var(--novo-success)', fontWeight: 600 }}>{money(row.sale_price, row.currency)}</span></td>
                  <td>{formatDate(row.activated_at || row.created_at)}</td>
                  <td style={{ fontSize: 11, color: 'var(--novo-muted)', maxWidth: 140, wordBreak: 'break-all' }}>
                    {row.stripe_subscription_id || '—'}
                  </td>
                  <td><Badge status={row.client_status || 'pending'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ================================
   ADMIN PAGOS
================================ */
function paymentRouteLabel(route) {
  const map = {
    AIRWALLEX_ACCOUNT: 'Airwallex',
    WISE_ACCOUNT: 'Wise (cuenta)',
    WISE_BANK: 'Wise → banco',
    USA_BANK: 'Cuenta bancaria USA',
  };
  return map[route] || route || 'Sin definir';
}

function DetailRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--novo-border)' }}>
      <span style={{ color: 'var(--novo-muted)', fontSize: 13 }}>{label}</span>
      <strong style={{ color: 'var(--novo-text)', fontSize: 13, textAlign: 'right' }}>{value}</strong>
    </div>
  );
}

function CommissionPayoutModal({ data, onClose }) {
  const commission = data?.commission;
  const profile = data?.profile;
  const legal = profile?.legal_profile || {};
  const backup = profile?.backup_bank || {};
  const usBank = profile?.us_bank || {};
  const provider = profile?.provider_details || {};
  const wizard = profile?.wizard_state || {};
  const client = commission?.partner_clients;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'rgba(15, 23, 42, 0.45)',
      }}
    >
      <div
        className="novo-card"
        style={{
          width: 'min(640px, 100%)',
          maxHeight: '85vh',
          overflow: 'auto',
          margin: 0,
          boxShadow: '0 24px 70px rgba(15,23,42,.28)',
        }}
      >
        <div className="novo-card-header">
          <div>
            <div className="novo-card-title">Datos para liquidar comisión</div>
            <div className="novo-card-sub">
              {commission?.partners?.name || 'Partner'} · {data?.serviceName || 'Servicio'}
            </div>
          </div>
          <button type="button" className="novo-btn novo-btn-ghost" style={{ padding: '4px 8px' }} onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ padding: 12, borderRadius: 12, background: 'rgba(124,58,237,.06)', border: '1px solid rgba(124,58,237,.15)' }}>
            <DetailRow label="Servicio" value={data?.serviceName} />
            <DetailRow label="Cliente" value={client?.company_name || client?.name || '—'} />
            <DetailRow label="Comisión" value={money(commission?.commission_amount, commission?.currency)} />
            <DetailRow label="Bruto / Mayorista" value={`${money(commission?.gross_amount, commission?.currency)} / ${money(commission?.wholesale_amount, commission?.currency)}`} />
            <DetailRow label="Estado comisión" value={commission?.status || '—'} />
          </div>

          {!profile ? (
            <div className="novo-empty" style={{ padding: 24 }}>
              Este partner aún no tiene una cuenta de pagos registrada.
            </div>
          ) : (
            <>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--novo-text)' }}>Titular</div>
                <DetailRow label="Nombre" value={[legal.firstName, legal.lastName].filter(Boolean).join(' ') || '—'} />
                <DetailRow label="Email" value={legal.email} />
                <DetailRow label="Teléfono" value={legal.phone} />
                <DetailRow label="País" value={countryLabel(legal.country)} />
                <DetailRow label="Tipo" value={legal.partnerType === 'company' ? 'Empresa' : legal.partnerType === 'individual' ? 'Persona natural' : legal.partnerType} />
                <DetailRow label="Empresa legal" value={legal.companyLegalName} />
              </div>

              <div>
                <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--novo-text)' }}>Método oficial</div>
                <DetailRow label="Ruta" value={paymentRouteLabel(profile.payment_route)} />
                <DetailRow label="Estado perfil" value={paymentStatusLabel(profile.status)} />
                <DetailRow label="Proveedor" value={wizard.selectedProvider || '—'} />
                {profile.payment_route === 'AIRWALLEX_ACCOUNT' && (
                  <>
                    <DetailRow label="Email Airwallex" value={provider.airwallexEmail} />
                    <DetailRow label="Account ID" value={provider.airwallexAccountId} />
                  </>
                )}
                {(profile.payment_route === 'WISE_ACCOUNT' || profile.payment_route === 'WISE_BANK') && (
                  <>
                    <DetailRow label="Email Wise" value={provider.wiseEmail} />
                    <DetailRow label="Wisetag" value={provider.wiseTag} />
                    <DetailRow label="Teléfono Wise" value={provider.wisePhone} />
                  </>
                )}
              </div>

              {(profile.payment_route === 'USA_BANK' || profile.has_us_bank) && (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--novo-text)' }}>Cuenta bancaria USA</div>
                  <DetailRow label="Banco" value={usBank.usBankName} />
                  <DetailRow label="Titular" value={usBank.usBankHolder} />
                  <DetailRow label="Routing / ABA" value={usBank.usBankRouting} />
                  <DetailRow label="Cuenta" value={usBank.usBankAccount} />
                  <DetailRow label="Tipo" value={usBank.usBankType} />
                  <DetailRow label="Zelle" value={usBank.usBankZelle} />
                </div>
              )}

              <div>
                <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--novo-text)' }}>Banco de respaldo</div>
                <DetailRow label="País" value={countryLabel(backup.bankCountry)} />
                <DetailRow label="Banco" value={backup.bankName} />
                <DetailRow label="Titular" value={backup.bankHolder} />
                <DetailRow label="Tipo" value={backup.bankType} />
                <DetailRow label="Cuenta / IBAN" value={backup.bankAccount || backup.mainBankIban} />
                <DetailRow label="SWIFT" value={backup.bankSwift} />
                <DetailRow label="Routing" value={backup.mainBankRouting} />
                <DetailRow label="Método local" value={backup.localPaymentId} />
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="novo-btn novo-btn-primary" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================
   ADMIN PAGOS BODY
================================ */
function AdminPayments() {
  const [tab, setTab] = useState('commissions');
  const [commissions, setCommissions] = useState([]);
  const [partners, setPartners] = useState([]);
  const [paymentProfiles, setPaymentProfiles] = useState([]);
  const [payoutProfilesByPartner, setPayoutProfilesByPartner] = useState({});
  const [loading, setLoading] = useState(true);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [filters, setFilters] = useState({ partnerId: '', status: 'pending' });
  const [profileFilters, setProfileFilters] = useState({ status: 'pending_review', partnerId: '' });
  const [reviewNotes, setReviewNotes] = useState({});
  const [expandedProfileId, setExpandedProfileId] = useState(null);
  const [payoutModal, setPayoutModal] = useState(null);

  const loadCommissions = useCallback(async () => {
    try {
      setLoading(true);
      const [commData, partnersData, payoutProfilesData] = await Promise.all([
        platformApi.listCommissions({
          partnerId: filters.partnerId || null,
          status: filters.status || null,
        }),
        platformApi.listPartners(),
        platformApi.listPaymentProfiles({}).catch(() => ({ profiles: [] })),
      ]);
      setCommissions(commData?.commissions || []);
      setPartners(partnersData?.partners || []);
      setPayoutProfilesByPartner(Object.fromEntries(
        (payoutProfilesData?.profiles || []).map((profile) => [profile.partner_id, profile]),
      ));
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }, [filters.partnerId, filters.status]);

  const loadPaymentProfiles = useCallback(async () => {
    try {
      setProfilesLoading(true);
      const data = await platformApi.listPaymentProfiles({
        status: profileFilters.status || null,
        partnerId: profileFilters.partnerId || null,
      });
      setPaymentProfiles(data?.profiles || []);
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setProfilesLoading(false);
    }
  }, [profileFilters.status, profileFilters.partnerId]);

  useEffect(() => { loadCommissions(); }, [loadCommissions]);
  useEffect(() => { loadPaymentProfiles(); }, [loadPaymentProfiles]);

  async function markPaid(commission) {
    try {
      setBusy(true);
      await platformApi.updateCommissionStatus(commission.id, 'paid');
      setNotice({ type: 'success', text: `Comisión de ${money(commission.commission_amount, commission.currency)} marcada como pagada.` });
      await loadCommissions();
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function reviewProfile(profile, decision) {
    try {
      setBusy(true);
      await platformApi.reviewPaymentProfile({
        profileId: profile.id,
        decision,
        notes: reviewNotes[profile.id] || null,
      });
      setNotice({
        type: 'success',
        text: decision === 'approved'
          ? 'Cuenta de pagos aprobada.'
          : decision === 'rejected'
            ? 'Cuenta de pagos rechazada.'
            : 'Se solicitaron cambios al Partner.',
      });
      await loadPaymentProfiles();
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  const pendingTotal = commissions
    .filter(row => row.status === 'pending')
    .reduce((sum, row) => sum + Number(row.commission_amount || 0), 0);

  const pendingProfiles = paymentProfiles.filter(row => row.status === 'pending_review').length;

  return (
    <div className="novo-page">
      <div className="novo-page-header"><span className="kicker">FINANZAS</span><h1>Pagos y comisiones</h1><p>Gestión de comisiones y activación de cuentas de pago de partners.</p></div>
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className={`novo-btn ${tab === 'commissions' ? 'novo-btn-primary' : 'novo-btn-ghost'}`}
          onClick={() => setTab('commissions')}
        >
          Comisiones
        </button>
        <button
          className={`novo-btn ${tab === 'accounts' ? 'novo-btn-primary' : 'novo-btn-ghost'}`}
          onClick={() => setTab('accounts')}
        >
          Cuentas de pago {pendingProfiles > 0 ? `(${pendingProfiles})` : ''}
        </button>
      </div>

      {tab === 'commissions' && (
        <>
          <div className="novo-stats" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            <div className="novo-stat">
              <div className="novo-stat-icon orange"><DollarSign size={17} /></div>
              <span className="novo-stat-label">Comisiones pendientes</span>
              <span className="novo-stat-value">{loading ? '…' : money(pendingTotal)}</span>
              <span className="novo-stat-sub">{commissions.filter(row => row.status === 'pending').length} por pagar</span>
            </div>
            <div className="novo-stat">
              <div className="novo-stat-icon green"><CheckCircle2 size={17} /></div>
              <span className="novo-stat-label">Comisiones pagadas</span>
              <span className="novo-stat-value">{loading ? '…' : commissions.filter(row => row.status === 'paid').length}</span>
              <span className="novo-stat-sub">Marcadas manualmente</span>
            </div>
            <div className="novo-stat">
              <div className="novo-stat-icon blue"><Activity size={17} /></div>
              <span className="novo-stat-label">Total en vista</span>
              <span className="novo-stat-value">{loading ? '…' : commissions.length}</span>
              <span className="novo-stat-sub">Según filtros activos</span>
            </div>
          </div>

          <div className="novo-card" style={{ marginTop: 16, marginBottom: 16 }}>
            <div className="novo-card-header">
              <div><div className="novo-card-title">Comisiones de partners</div><div className="novo-card-sub">Generadas automáticamente al confirmar el pago en Stripe</div></div>
              <button className="novo-btn novo-btn-ghost" onClick={loadCommissions} disabled={loading}><RefreshCw size={13} /></button>
            </div>
            <div className="novo-grid-2" style={{ marginBottom: 16 }}>
              <SelectField label="Partner" value={filters.partnerId} onChange={value => setFilters(current => ({ ...current, partnerId: value }))}>
                <option value="">Todos</option>
                {partners.map(partner => <option key={partner.id} value={partner.id}>{partner.name}</option>)}
              </SelectField>
              <SelectField label="Estado" value={filters.status} onChange={value => setFilters(current => ({ ...current, status: value }))}>
                <option value="">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="paid">Pagada</option>
                <option value="cancelled">Cancelada</option>
              </SelectField>
            </div>
            {loading && <div className="novo-empty">Cargando…</div>}
            {!loading && commissions.length === 0 && <div className="novo-empty">No hay comisiones con estos filtros.</div>}
            {!loading && commissions.length > 0 && (
              <table className="novo-table">
                <thead>
                  <tr>
                    <th>Partner</th>
                    <th>Cliente</th>
                    <th>Servicio</th>
                    <th>Bruto</th>
                    <th>Mayorista</th>
                    <th>Comisión</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map(row => {
                    const client = row.partner_clients;
                    const serviceName = row.sales_links?.product_name
                      || row.sales_links?.metadata?.product_name
                      || '—';
                    return (
                      <tr key={row.id}>
                        <td><strong style={{ color: 'var(--novo-text)' }}>{row.partners?.name || '—'}</strong></td>
                        <td>{client?.company_name || client?.name || '—'}<br /><small style={{ color: 'var(--novo-muted)' }}>{client?.email || '—'}</small></td>
                        <td>
                          {serviceName !== '—' ? (
                            <button
                              type="button"
                              onClick={() => setPayoutModal({
                                commission: row,
                                serviceName,
                                profile: payoutProfilesByPartner[row.partner_id] || null,
                              })}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                color: 'var(--novo-purple)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                textAlign: 'left',
                                textDecoration: 'underline',
                              }}
                              title="Ver datos bancarios del partner"
                            >
                              {serviceName}
                            </button>
                          ) : (
                            <span style={{ color: 'var(--novo-muted)' }}>—</span>
                          )}
                        </td>
                        <td>{money(row.gross_amount, row.currency)}</td>
                        <td>{money(row.wholesale_amount, row.currency)}</td>
                        <td><span style={{ color: 'var(--novo-purple)', fontWeight: 600 }}>{money(row.commission_amount, row.currency)}</span></td>
                        <td><Badge status={row.status} /></td>
                        <td>{formatDate(row.created_at)}</td>
                        <td>
                          {row.status === 'pending' ? (
                            <button className="novo-btn novo-btn-primary" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => markPaid(row)} disabled={busy}>
                              <CheckCircle2 size={12} /> Marcar pagada
                            </button>
                          ) : row.paid_at ? (
                            <small style={{ color: 'var(--novo-muted)' }}>{formatDate(row.paid_at)}</small>
                          ) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {payoutModal && (
            <CommissionPayoutModal
              data={payoutModal}
              onClose={() => setPayoutModal(null)}
            />
          )}
        </>
      )}

      {tab === 'accounts' && (
        <div className="novo-card">
          <div className="novo-card-header">
            <div>
              <div className="novo-card-title">Cuentas de pago de partners</div>
              <div className="novo-card-sub">Revisión de perfiles enviados desde el módulo Pagos del Partner</div>
            </div>
            <button className="novo-btn novo-btn-ghost" onClick={loadPaymentProfiles} disabled={profilesLoading}><RefreshCw size={13} /></button>
          </div>
          <div className="novo-grid-2" style={{ marginBottom: 16 }}>
            <SelectField label="Partner" value={profileFilters.partnerId} onChange={value => setProfileFilters(current => ({ ...current, partnerId: value }))}>
              <option value="">Todos</option>
              {partners.map(partner => <option key={partner.id} value={partner.id}>{partner.name}</option>)}
            </SelectField>
            <SelectField label="Estado" value={profileFilters.status} onChange={value => setProfileFilters(current => ({ ...current, status: value }))}>
              <option value="">Todos</option>
              <option value="pending_review">En revisión</option>
              <option value="approved">Aprobada</option>
              <option value="rejected">Rechazada</option>
              <option value="needs_changes">Requiere cambios</option>
              <option value="draft">Borrador</option>
            </SelectField>
          </div>

          {profilesLoading && <div className="novo-empty">Cargando…</div>}
          {!profilesLoading && paymentProfiles.length === 0 && <div className="novo-empty">No hay cuentas de pago con estos filtros.</div>}
          {!profilesLoading && paymentProfiles.length > 0 && (
            <table className="novo-table">
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>Titular</th>
                  <th>Ruta</th>
                  <th>Estado</th>
                  <th>Enviado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {paymentProfiles.map((row) => {
                  const legal = row.legal_profile || {};
                  const wizard = row.wizard_state || {};
                  const expanded = expandedProfileId === row.id;
                  return (
                    <Fragment key={row.id}>
                      <tr>
                        <td>
                          <strong style={{ color: 'var(--novo-text)' }}>{row.partners?.name || '—'}</strong>
                          <br /><small style={{ color: 'var(--novo-muted)' }}>{row.partners?.slug || row.partner_id}</small>
                        </td>
                        <td>
                          {[legal.firstName, legal.lastName].filter(Boolean).join(' ') || '—'}
                          <br /><small style={{ color: 'var(--novo-muted)' }}>{legal.email || '—'}</small>
                        </td>
                        <td>
                          {row.payment_route
                            || paymentRouteFromSelection(wizard.selectedProvider, wizard.selectedWiseDestination)
                            || '—'}
                        </td>
                        <td><Badge status={row.status} /> <small style={{ color: 'var(--novo-muted)' }}>{paymentStatusLabel(row.status)}</small></td>
                        <td>{row.submitted_at ? formatDate(row.submitted_at) : '—'}</td>
                        <td>
                          <button
                            className="novo-btn novo-btn-ghost"
                            style={{ padding: '4px 10px', fontSize: 11 }}
                            onClick={() => setExpandedProfileId(expanded ? null : row.id)}
                          >
                            {expanded ? 'Ocultar' : 'Revisar'}
                          </button>
                        </td>
                      </tr>
                      {expanded && (
                        <tr>
                          <td colSpan={6}>
                            <div style={{ display: 'grid', gap: 10, padding: '8px 0' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                  <strong>Perfil</strong>
                                  <div style={{ color: 'var(--novo-muted)', fontSize: 13, marginTop: 6 }}>
                                    País: {countryLabel(legal.country)} · Tipo: {legal.partnerType || '—'}
                                    <br />Tel: {legal.phone || '—'}
                                    {legal.companyLegalName ? <><br />Empresa: {legal.companyLegalName}</> : null}
                                  </div>
                                </div>
                                <div>
                                  <strong>Banco respaldo</strong>
                                  <div style={{ color: 'var(--novo-muted)', fontSize: 13, marginTop: 6 }}>
                                    {(row.backup_bank?.bankName) || '—'} · {(row.backup_bank?.bankHolder) || '—'}
                                    <br />{countryLabel(row.backup_bank?.bankCountry)} · cuenta {(row.backup_bank?.bankAccount) || '—'}
                                    <br />USA bank: {row.has_us_bank ? 'Sí' : 'No'}
                                  </div>
                                </div>
                              </div>
                              <div className="novo-field">
                                <label>Notas de revisión</label>
                                <textarea
                                  rows={2}
                                  value={reviewNotes[row.id] || ''}
                                  onChange={(e) => setReviewNotes((current) => ({ ...current, [row.id]: e.target.value }))}
                                  placeholder="Opcional para el Partner"
                                  disabled={busy || row.status === 'approved'}
                                />
                              </div>
                              {row.status === 'pending_review' && (
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                  <button className="novo-btn novo-btn-primary" disabled={busy} onClick={() => reviewProfile(row, 'approved')}>
                                    <Check size={13} /> Aprobar
                                  </button>
                                  <button className="novo-btn novo-btn-ghost" disabled={busy} onClick={() => reviewProfile(row, 'needs_changes')}>
                                    Pedir cambios
                                  </button>
                                  <button className="novo-btn novo-btn-ghost" disabled={busy} onClick={() => reviewProfile(row, 'rejected')}>
                                    <XCircle size={13} /> Rechazar
                                  </button>
                                </div>
                              )}
                              {row.review_notes && (
                                <div style={{ color: 'var(--novo-muted)', fontSize: 13 }}>
                                  Última nota: {row.review_notes}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="novo-card" style={{ marginTop: 16, border: '1px dashed rgba(124,58,237,.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CreditCard size={18} style={{ color: 'var(--novo-purple)', flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--novo-text)' }}>Configuración Stripe</strong>
            <p style={{ margin: '4px 0 0', color: 'var(--novo-muted)', fontSize: 13 }}>
              Secret key y webhook secret se configuran en Configuración → Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================
   ADMIN SOPORTE
================================ */
function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [filters, setFilters] = useState({ status: 'open', partnerId: '', priority: '' });
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [replyStatus, setReplyStatus] = useState('waiting_partner');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [ticketsData, partnersData] = await Promise.all([
        platformApi.listAdminSupportTickets({
          status: filters.status || null,
          partnerId: filters.partnerId || null,
          priority: filters.priority || null,
        }),
        platformApi.listPartners().catch(() => ({ partners: [] })),
      ]);
      setTickets(ticketsData?.tickets || []);
      setPartners(partnersData?.partners || []);
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.partnerId, filters.priority]);

  useEffect(() => { load(); }, [load]);

  async function openTicket(ticketId) {
    try {
      setSelectedId(ticketId);
      setDetailLoading(true);
      const data = await platformApi.getAdminSupportTicket(ticketId);
      setDetail(data);
      setReply('');
      setReplyStatus('waiting_partner');
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setDetailLoading(false);
    }
  }

  async function sendReply() {
    if (!selectedId || !reply.trim()) return;
    try {
      setBusy(true);
      await platformApi.replyAdminSupportTicket({
        ticketId: selectedId,
        message: reply.trim(),
        status: replyStatus,
      });
      setNotice({ type: 'success', text: 'Respuesta enviada al partner.' });
      setReply('');
      await openTicket(selectedId);
      await load();
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(status) {
    if (!selectedId) return;
    try {
      setBusy(true);
      await platformApi.updateSupportTicketStatus({ ticketId: selectedId, status });
      setNotice({ type: 'success', text: `Ticket marcado como ${SUPPORT_STATUS_LABELS[status] || status}.` });
      await openTicket(selectedId);
      await load();
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  const ticket = detail?.ticket;
  const messages = detail?.messages || [];
  const openCount = tickets.filter((row) => ['open', 'in_progress', 'waiting_partner'].includes(row.status)).length;

  return (
    <div className="novo-page">
      <div className="novo-page-header">
        <span className="kicker">ATENCIÓN</span>
        <h1>Soporte a partners</h1>
        <p>Revisa, responde y gestiona los tickets abiertos por partners.</p>
      </div>
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

      <div className="novo-stats" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 16 }}>
        <div className="novo-stat">
          <div className="novo-stat-icon orange"><LifeBuoy size={17} /></div>
          <span className="novo-stat-label">En vista</span>
          <span className="novo-stat-value">{loading ? '…' : tickets.length}</span>
          <span className="novo-stat-sub">Según filtros</span>
        </div>
        <div className="novo-stat">
          <div className="novo-stat-icon purple"><Activity size={17} /></div>
          <span className="novo-stat-label">Activos en vista</span>
          <span className="novo-stat-value">{loading ? '…' : openCount}</span>
          <span className="novo-stat-sub">Abiertos / en progreso / esperando</span>
        </div>
        <div className="novo-stat">
          <div className="novo-stat-icon green"><CheckCircle2 size={17} /></div>
          <span className="novo-stat-label">Selección</span>
          <span className="novo-stat-value">{ticket ? (SUPPORT_STATUS_LABELS[ticket.status] || '—') : '—'}</span>
          <span className="novo-stat-sub">{ticket?.partners?.name || 'Sin ticket abierto'}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedId ? '1.15fr 1fr' : '1fr', gap: 16 }}>
        <div className="novo-card">
          <div className="novo-card-header">
            <div>
              <div className="novo-card-title">Tickets ({tickets.length})</div>
              <div className="novo-card-sub">Cola de soporte de partners</div>
            </div>
            <button className="novo-btn novo-btn-ghost" onClick={load} disabled={loading}><RefreshCw size={13} /></button>
          </div>
          <div className="novo-grid-2" style={{ marginBottom: 14, gridTemplateColumns: 'repeat(3,1fr)' }}>
            <SelectField label="Estado" value={filters.status} onChange={value => setFilters(current => ({ ...current, status: value }))}>
              <option value="">Todos</option>
              <option value="open">Abierto</option>
              <option value="in_progress">En progreso</option>
              <option value="waiting_partner">Esperando partner</option>
              <option value="resolved">Resuelto</option>
              <option value="closed">Cerrado</option>
            </SelectField>
            <SelectField label="Partner" value={filters.partnerId} onChange={value => setFilters(current => ({ ...current, partnerId: value }))}>
              <option value="">Todos</option>
              {partners.map(partner => <option key={partner.id} value={partner.id}>{partner.name}</option>)}
            </SelectField>
            <SelectField label="Prioridad" value={filters.priority} onChange={value => setFilters(current => ({ ...current, priority: value }))}>
              <option value="">Todas</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </SelectField>
          </div>

          {loading && <div className="novo-empty">Cargando…</div>}
          {!loading && tickets.length === 0 && <div className="novo-empty">No hay tickets con estos filtros.</div>}
          {!loading && tickets.length > 0 && (
            <table className="novo-table">
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>Asunto</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => openTicket(row.id)}
                    style={{ cursor: 'pointer', background: selectedId === row.id ? 'rgba(124,58,237,.06)' : undefined }}
                  >
                    <td><strong style={{ color: 'var(--novo-text)' }}>{row.partners?.name || '—'}</strong></td>
                    <td>{row.subject}</td>
                    <td>
                      <Badge
                        status={row.priority === 'high' ? 'inactive' : row.priority === 'medium' ? 'pending' : 'active'}
                        label={SUPPORT_PRIORITY_LABELS[row.priority] || row.priority}
                      />
                    </td>
                    <td><Badge status={supportStatusBadge(row.status)} label={SUPPORT_STATUS_LABELS[row.status] || row.status} /></td>
                    <td style={{ fontSize: 12, color: 'var(--novo-muted)' }}>{formatDate(row.last_message_at || row.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedId && (
          <div className="novo-card">
            <div className="novo-card-header">
              <div>
                <div className="novo-card-title">{ticket?.subject || 'Ticket'}</div>
                <div className="novo-card-sub">
                  {ticket?.partners?.name || 'Partner'} · {ticket ? (SUPPORT_STATUS_LABELS[ticket.status] || ticket.status) : '…'}
                </div>
              </div>
              <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 8px' }} onClick={() => { setSelectedId(null); setDetail(null); }}>
                <X size={14} />
              </button>
            </div>

            {detailLoading && <div className="novo-empty">Cargando conversación…</div>}
            {!detailLoading && ticket && (
              <>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <button className="novo-btn novo-btn-ghost" style={{ fontSize: 11 }} disabled={busy} onClick={() => changeStatus('in_progress')}>En progreso</button>
                  <button className="novo-btn novo-btn-ghost" style={{ fontSize: 11 }} disabled={busy} onClick={() => changeStatus('waiting_partner')}>Esperar partner</button>
                  <button className="novo-btn novo-btn-ghost" style={{ fontSize: 11 }} disabled={busy} onClick={() => changeStatus('resolved')}>Resuelto</button>
                  <button className="novo-btn novo-btn-ghost" style={{ fontSize: 11 }} disabled={busy} onClick={() => changeStatus('closed')}>Cerrar</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto', marginBottom: 14 }}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: msg.author_role === 'super_admin' ? 'flex-end' : 'flex-start',
                        maxWidth: '88%',
                        padding: '10px 12px',
                        borderRadius: 12,
                        background: msg.author_role === 'super_admin' ? 'rgba(124,58,237,.12)' : 'rgba(148,163,184,.12)',
                        border: '1px solid var(--novo-border)',
                      }}
                    >
                      <div style={{ fontSize: 11, color: 'var(--novo-muted)', marginBottom: 4 }}>
                        {msg.author_role === 'super_admin' ? 'Soporte NOVO' : 'Partner'} · {formatDate(msg.created_at)}
                      </div>
                      <div style={{ color: 'var(--novo-text)', whiteSpace: 'pre-wrap', fontSize: 13 }}>{msg.body}</div>
                    </div>
                  ))}
                </div>

                {ticket.status !== 'closed' ? (
                  <>
                    <div className="novo-grid-2" style={{ marginBottom: 10 }}>
                      <div className="novo-field">
                        <label>Estado al responder</label>
                        <select value={replyStatus} onChange={e => setReplyStatus(e.target.value)}>
                          <option value="waiting_partner">Esperando partner</option>
                          <option value="in_progress">En progreso</option>
                          <option value="resolved">Resuelto</option>
                          <option value="closed">Cerrado</option>
                        </select>
                      </div>
                    </div>
                    <div className="novo-field" style={{ marginBottom: 10 }}>
                      <label>Respuesta</label>
                      <textarea
                        rows={4}
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        placeholder="Escribe la respuesta para el partner…"
                        style={{ background: 'var(--novo-card-hover)', border: '1px solid var(--novo-border)', borderRadius: 8, padding: '9px 12px', color: 'var(--novo-text)', fontSize: 13, outline: 'none', width: '100%', resize: 'vertical' }}
                      />
                    </div>
                    <button className="novo-btn novo-btn-primary" onClick={sendReply} disabled={busy || !reply.trim()}>
                      {busy ? <Loader2 size={14} style={{ animation: 'novoSpin .8s linear infinite' }} /> : <Save size={14} />} Enviar respuesta
                    </button>
                  </>
                ) : (
                  <div className="novo-empty">Ticket cerrado.</div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================
   ADMIN AUDITORÍA
================================ */
function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [filters, setFilters] = useState({ actionPrefix: '', entityType: '' });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await platformApi.listAuditLogs({
        actionPrefix: filters.actionPrefix || null,
        entityType: filters.entityType || null,
        limit: 100,
      });
      setLogs(data?.logs || []);
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }, [filters.actionPrefix, filters.entityType]);

  useEffect(() => { load(); }, [load]);

  function formatMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object') return '—';
    const parts = [];
    if (metadata.error) parts.push(String(metadata.error));
    if (metadata.partnerName) parts.push(`Partner: ${metadata.partnerName}`);
    if (metadata.email) parts.push(metadata.email);
    if (metadata.note) parts.push(`Nota: ${metadata.note}`);
    if (metadata.companyName) parts.push(metadata.companyName);
    return parts.length > 0 ? parts.join(' · ') : JSON.stringify(metadata);
  }

  return (
    <div className="novo-page">
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="kicker">TRAZABILIDAD</span>
          <h1>Auditoría</h1>
          <p>Registro de acciones del sistema: partners, GHL, Stripe e integraciones.</p>
        </div>
        <button className="novo-btn novo-btn-ghost" onClick={load} disabled={loading}>
          <RefreshCw size={13} />
        </button>
      </div>
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

      <div className="novo-card">
        <div className="novo-card-header">
          <div>
            <div className="novo-card-title">Eventos recientes</div>
            <div className="novo-card-sub">Últimos 100 registros según filtros</div>
          </div>
        </div>
        <div className="novo-grid-2" style={{ marginBottom: 16 }}>
          <SelectField
            label="Tipo de acción"
            value={filters.actionPrefix}
            onChange={value => setFilters(current => ({ ...current, actionPrefix: value }))}
          >
            <option value="">Todas</option>
            <option value="partner.">Partners</option>
            <option value="ghl.">GHL</option>
            <option value="stripe.">Stripe</option>
            <option value="integrations.">Integraciones</option>
          </SelectField>
          <SelectField
            label="Entidad"
            value={filters.entityType}
            onChange={value => setFilters(current => ({ ...current, entityType: value }))}
          >
            <option value="">Todas</option>
            <option value="partner">Partner</option>
            <option value="client">Cliente</option>
            <option value="platform">Plataforma</option>
            <option value="subscription">Suscripción</option>
          </SelectField>
        </div>
        {loading && <div className="novo-empty">Cargando…</div>}
        {!loading && logs.length === 0 && <div className="novo-empty">No hay eventos con estos filtros.</div>}
        {!loading && logs.length > 0 && (
          <table className="novo-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Acción</th>
                <th>Entidad</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(row => (
                <tr key={row.id}>
                  <td style={{ fontSize: 12, color: 'var(--novo-muted)', whiteSpace: 'nowrap' }}>{formatDate(row.created_at)}</td>
                  <td><code style={{ fontSize: 11 }}>{row.action}</code></td>
                  <td style={{ fontSize: 12 }}>
                    {row.entity_type || '—'}
                    {row.entity_id && (
                      <>
                        <br />
                        <small style={{ color: 'var(--novo-muted)' }}>{String(row.entity_id).slice(0, 8)}…</small>
                      </>
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--novo-muted)', maxWidth: 360 }}>{formatMetadata(row.metadata)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ================================
   ADMIN CONFIGURACIÓN
================================ */
function AdminSettings() {
  const [tab, setTab] = useState('ghl');
  const defaultScopes = 'users.readonly locations.readonly locations.write companies.readonly saas/company.read saas/company.write saas/location.write';
  const [settings, setSettings] = useState({
    ghlClientId: '',
    ghlClientSecret: '',
    ghlRedirectUri: typeof window !== 'undefined' ? `${window.location.origin}/` : '',
    ghlScopes: defaultScopes,
    ghlCompanyId: '',
    ghlLocationId: '',
    ghlUserType: '',
    ghlConnectedAt: '',
    ghlSaasEnabled: false,
    ghlSaasV2: true,
    ghlDefaultTimezone: 'America/New_York',
    ghlDefaultSaasPlanId: '',
    ghlDefaultSaasPriceId: '',
    stripePublishableKey: '',
    stripePriceMode: 'test',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    publicAppUrl: typeof window !== 'undefined' ? window.location.origin : '',
    webhookBaseUrl: '',
    superAdminEmails: '',
    emailTransport: 'api',
    emailProvider: 'resend',
    emailApiProvider: 'resend',
    emailSmtpHost: 'smtp.resend.com',
    emailSmtpPort: '587',
    emailSmtpEncryption: 'starttls',
    emailSmtpUser: '',
    emailSmtpPassword: '',
    emailApiKey: '',
    emailFromEmail: '',
    emailFromName: 'NOVO',
    emailReplyTo: '',
    emailMailgunDomain: '',
    emailSesRegion: 'us-east-1',
    emailTestTo: '',
  });
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [secretsLoaded, setSecretsLoaded] = useState({
    ghlClientSecret: false,
    stripeSecretKey: false,
    stripeWebhookSecret: false,
    emailSmtpPassword: false,
    emailApiKey: false,
  });

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsData, healthData] = await Promise.all([
        platformApi.getIntegrationSettings(),
        platformApi.getAdminSystemHealth().catch(() => null),
      ]);
      const saved = settingsData?.settings;
      if (saved) {
        setSettings(current => ({
          ...current,
          ghlClientId: saved.ghlClientId || current.ghlClientId,
          ghlRedirectUri: saved.ghlRedirectUri || current.ghlRedirectUri,
          ghlScopes: saved.ghlScopes || current.ghlScopes,
          ghlClientSecret: saved.ghlClientSecret || '',
          webhookBaseUrl: saved.webhookBaseUrl || current.webhookBaseUrl,
          ghlCompanyId: saved.ghlCompanyId || '',
          ghlLocationId: saved.ghlLocationId || '',
          ghlUserType: saved.ghlUserType || '',
          ghlConnectedAt: saved.ghlConnectedAt || '',
          ghlSaasEnabled: saved.ghlSaasEnabled === true,
          ghlSaasV2: saved.ghlSaasV2 !== false,
          ghlDefaultTimezone: saved.ghlDefaultTimezone || 'America/New_York',
          ghlDefaultSaasPlanId: saved.ghlDefaultSaasPlanId || '',
          ghlDefaultSaasPriceId: saved.ghlDefaultSaasPriceId || '',
          stripePublishableKey: saved.stripePublishableKey || '',
          stripePriceMode: saved.stripePriceMode || 'test',
          stripeSecretKey: saved.stripeSecretKey || '',
          stripeWebhookSecret: saved.stripeWebhookSecret || '',
          publicAppUrl: saved.publicAppUrl || current.publicAppUrl,
          webhookBaseUrl: saved.webhookBaseUrl || current.webhookBaseUrl,
          superAdminEmails: saved.superAdminEmails || '',
          emailTransport: saved.emailTransport || 'api',
          emailProvider: saved.emailProvider || 'resend',
          emailApiProvider: saved.emailApiProvider || 'resend',
          emailSmtpHost: saved.emailSmtpHost || '',
          emailSmtpPort: saved.emailSmtpPort || '587',
          emailSmtpEncryption: saved.emailSmtpEncryption || 'starttls',
          emailSmtpUser: saved.emailSmtpUser || '',
          emailSmtpPassword: saved.emailSmtpPassword || '',
          emailApiKey: saved.emailApiKey || '',
          emailFromEmail: saved.emailFromEmail || '',
          emailFromName: saved.emailFromName || 'NOVO',
          emailReplyTo: saved.emailReplyTo || '',
          emailMailgunDomain: saved.emailMailgunDomain || '',
          emailSesRegion: saved.emailSesRegion || 'us-east-1',
        }));
        setSecretsLoaded({
          ghlClientSecret: Boolean(saved.ghlClientSecret),
          stripeSecretKey: Boolean(saved.stripeSecretKey),
          stripeWebhookSecret: Boolean(saved.stripeWebhookSecret),
          emailSmtpPassword: Boolean(saved.emailSmtpPassword),
          emailApiKey: Boolean(saved.emailApiKey),
        });
      }
      setHealth(healthData);
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  async function save() {
    try {
      setBusy(true);
      await platformApi.saveIntegrationSettings(settings);
      setNotice({ type: 'success', text: 'Configuración guardada.' });
      await loadSettings();
    }
    catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setBusy(false); }
  }

  async function syncGhl() {
    try {
      setBusy(true);
      const data = await platformApi.syncGhlLocations();
      setNotice({
        type: 'success',
        text: `Sync GHL completado: ${data?.count ?? 0} location(s) procesadas.`,
      });
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function connectGhl() {
    if (!settings.ghlClientId?.trim()) {
      setNotice({ type: 'error', text: 'Completa Client ID de la app GHL Marketplace.' });
      return;
    }
    if (!settings.ghlRedirectUri?.trim()) {
      setNotice({ type: 'error', text: 'Completa Redirect URI (ej. http://localhost:5173/).' });
      return;
    }
    if (settings.ghlClientId?.includes('@')) {
      setNotice({ type: 'error', text: 'Client ID incorrecto: debe ser el ID de la app GHL Marketplace, no un email.' });
      return;
    }
    if (!settings.ghlScopes?.includes('locations.write')) {
      setNotice({ type: 'error', text: 'Scopes debe incluir locations.write.' });
      return;
    }

    try {
      setBusy(true);
      await platformApi.saveIntegrationSettings(settings);
      const data = await platformApi.startGhlOAuth();
      if (!data?.authorizationUrl) throw new Error('No se recibió URL.');
      if (!String(data.requestedScopes || []).includes('locations.write')) {
        setNotice({
          type: 'error',
          text: 'OAuth no incluye locations.write. Completa Scopes en este panel, guarda y vuelve a conectar.',
        });
        setBusy(false);
        return;
      }
      window.location.href = data.authorizationUrl;
    } catch (e) { setNotice({ type: 'error', text: e.message }); setBusy(false); }
  }

  async function sendTestEmail() {
    try {
      setBusy(true);
      await platformApi.saveIntegrationSettings(settings);
      await platformApi.sendTestEmail(settings.emailTestTo?.trim() || null);
      setNotice({ type: 'success', text: `Correo de prueba enviado${settings.emailTestTo ? ` a ${settings.emailTestTo}` : ''}.` });
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  function applyEmailProvider(providerId) {
    const preset = EMAIL_PROVIDER_PRESETS[providerId] || EMAIL_PROVIDER_PRESETS.custom;
    setSettings(current => ({
      ...current,
      emailProvider: providerId,
      emailTransport: preset.transport,
      emailApiProvider: preset.apiProvider,
      emailSmtpHost: preset.smtpHost,
      emailSmtpPort: preset.smtpPort,
      emailSmtpEncryption: preset.smtpEncryption,
      ...(preset.sesRegion ? { emailSesRegion: preset.sesRegion } : {}),
    }));
  }

  const ghlConnected = Boolean(health?.ghl?.connected || settings.ghlCompanyId);
  const ghlProvisionReady = Boolean(health?.ghl?.provisionReady);
  const stripeConfigured = Boolean(
    (health?.stripe?.configured && health?.stripe?.publishableConfigured)
    || (secretsLoaded.stripeSecretKey && settings.stripePublishableKey),
  );
  const stripePublishableConfigured = Boolean(
    settings.stripePublishableKey?.startsWith('pk_')
    || health?.stripe?.publishableConfigured,
  );
  const stripeWebhookConfigured = Boolean(secretsLoaded.stripeWebhookSecret);
  const superAdminConfigured = Boolean(
    settings.superAdminEmails?.split(/[,;\n]+/).map(e => e.trim()).filter(Boolean).length,
  );
  const emailConfigured = Boolean(
    settings.emailFromEmail
    && (
      (settings.emailTransport === 'api' && (secretsLoaded.emailApiKey || settings.emailApiKey))
      || (settings.emailTransport === 'smtp'
        && settings.emailSmtpHost
        && settings.emailSmtpUser
        && (secretsLoaded.emailSmtpPassword || settings.emailSmtpPassword))
    ),
  );

  const tabs = [['ghl','HighLevel',PlugZap],['stripe','Stripe',CreditCard],['email','Correo',Mail],['webhooks','App y Webhooks',Webhook],['security','Seguridad',KeyRound]];

  return (
    <div className="novo-page">
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><span className="kicker">SISTEMA</span><h1>Configuración</h1><p>Conexiones, integraciones y seguridad.</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="novo-btn novo-btn-secondary" onClick={syncGhl} disabled={busy || loading || !ghlConnected}><RefreshCw size={14} /> Sync GHL</button>
          <button className="novo-btn novo-btn-primary" onClick={save} disabled={busy || loading}><Save size={14} /> Guardar todo</button>
        </div>
      </div>
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}
      {loading && <div className="novo-empty" style={{ marginBottom: 16 }}>Cargando configuración…</div>}
      <div className="pc-tabs" style={{ marginBottom: 20 }}>
        {tabs.map(([id,label,Icon]) => <button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><Icon size={13}/> {label}</button>)}
      </div>
      {tab==='ghl' && (
        <>
          <div className="novo-card" style={{ marginBottom: 16 }}>
            <div className="novo-card-header">
              <div><div className="novo-card-title">Estado GHL</div><div className="novo-card-sub">Conexión activa y scopes del token</div></div>
              <Badge
                status={ghlProvisionReady ? 'active' : ghlConnected ? 'pending' : 'inactive'}
                label={ghlProvisionReady ? 'Listo' : ghlConnected ? 'Conectado (sin write)' : 'Desconectado'}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <InfoField label="Agencia" value={settings.ghlCompanyId || health?.ghl?.companyId || '—'} />
              <InfoField label="Tipo" value={settings.ghlUserType || '—'} />
              <InfoField label="Conectado" value={settings.ghlConnectedAt ? formatDate(settings.ghlConnectedAt) : '—'} />
            </div>
            {ghlConnected && !ghlProvisionReady && (
              <p style={{ color: 'var(--novo-warning, #f59e0b)', fontSize: 13, margin: '12px 0 0' }}>
                El token no incluye <code>locations.write</code>. Reconecta OAuth con los scopes correctos.
              </p>
            )}
          </div>
          <div className="novo-card">
            <div className="novo-card-header"><div><div className="novo-card-title">HighLevel OAuth</div><div className="novo-card-sub">Credenciales guardadas en plataforma (OAuth las usa al conectar)</div></div><button className="novo-btn novo-btn-primary" onClick={connectGhl} disabled={busy || loading}><PlugZap size={14}/> Conectar OAuth</button></div>
            <div className="novo-grid-2">
              <NField label="Client ID" value={settings.ghlClientId} onChange={v=>setSettings({...settings,ghlClientId:v})} placeholder="6a6b6070...-ms7m9fh5 (desde GHL Marketplace)" />
              <NField label="Client Secret" secret value={settings.ghlClientSecret} onChange={v=>setSettings({...settings,ghlClientSecret:v})} placeholder={secretsLoaded.ghlClientSecret ? '•••••••• (dejar vacío para mantener)' : ''} />
              <NField label="Redirect URI" value={settings.ghlRedirectUri} onChange={v=>setSettings({...settings,ghlRedirectUri:v})} placeholder="http://localhost:5173/" />
              <NField label="Scopes" value={settings.ghlScopes} onChange={v=>setSettings({...settings,ghlScopes:v})} />
            </div>
            <p style={{ color: 'var(--novo-muted)', fontSize: 12, margin: '0 0 16px' }}>
              Debe incluir <code>locations.write</code>. OAuth usa <strong>solo estos scopes del panel</strong> (fallback: secret <code>GHL_SCOPES</code> en Supabase si el campo está vacío).
            </p>
          </div>
          <div className="novo-card" style={{ marginTop: 16 }}>
            <div className="novo-card-header">
              <div><div className="novo-card-title">Provisioning SaaS</div><div className="novo-card-sub">Control de activación GHL al registrar clientes</div></div>
              <Badge status={settings.ghlSaasEnabled ? 'active' : 'pending'} label={settings.ghlSaasEnabled ? 'SaaS activo' : 'Solo location'} />
            </div>
            <div className="novo-grid-2" style={{ marginBottom: 16 }}>
              <label className="novo-field" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={settings.ghlSaasEnabled}
                  onChange={e => setSettings({ ...settings, ghlSaasEnabled: e.target.checked })}
                />
                <span>Activar SaaS al provisionar (<code>GHL_SAAS_ENABLED</code>)</span>
              </label>
              <label className="novo-field" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={settings.ghlSaasV2}
                  onChange={e => setSettings({ ...settings, ghlSaasV2: e.target.checked })}
                />
                <span>Usar API SaaS v2 (<code>GHL_SAAS_V2</code>)</span>
              </label>
            </div>
            <div className="novo-grid-2">
              <SelectField
                label="Timezone default (GHL_DEFAULT_TIMEZONE)"
                value={settings.ghlDefaultTimezone}
                onChange={value => setSettings(current => ({ ...current, ghlDefaultTimezone: value }))}
              >
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Bogota">America/Bogota (COT)</option>
                <option value="America/Mexico_City">America/Mexico_City (CST)</option>
                <option value="America/Lima">America/Lima (PET)</option>
                <option value="America/Santiago">America/Santiago (CLT)</option>
                <option value="UTC">UTC</option>
              </SelectField>
              <NField
                label="Plan GHL fallback (GHL_DEFAULT_SAAS_PLAN_ID)"
                value={settings.ghlDefaultSaasPlanId}
                onChange={v => setSettings({ ...settings, ghlDefaultSaasPlanId: v })}
                placeholder="Opcional — preferir Productos → GHL Plan ID"
              />
              <NField
                label="Price GHL fallback (GHL_DEFAULT_SAAS_PRICE_ID)"
                value={settings.ghlDefaultSaasPriceId}
                onChange={v => setSettings({ ...settings, ghlDefaultSaasPriceId: v })}
                placeholder="Opcional — preferir ofertas partner"
              />
            </div>
          </div>
        </>
      )}
      {tab==='stripe' && (
        <div className="novo-card">
          <div className="novo-card-header">
            <div><div className="novo-card-title">Stripe</div><div className="novo-card-sub">Toda la configuración Stripe centralizada aquí</div></div>
            <Badge
              status={stripeConfigured ? 'active' : 'pending'}
              label={stripeConfigured ? 'Listo' : 'Pendiente'}
            />
          </div>
          <div className="novo-grid-2" style={{ marginBottom: 16 }}>
            <SelectField
              label="Modo"
              value={settings.stripePriceMode}
              onChange={value => setSettings(current => ({ ...current, stripePriceMode: value }))}
            >
              <option value="test">Test (pk_test_ / sk_test_)</option>
              <option value="live">Live (pk_live_ / sk_live_)</option>
            </SelectField>
            <InfoField
              label="Estado"
              value={
                stripeConfigured
                  ? `Configurado (${settings.stripePriceMode === 'live' ? 'producción' : 'test'})`
                  : 'Faltan claves por configurar'
              }
            />
          </div>
          <div className="novo-grid-2">
            <NField
              label="Publishable key (STRIPE_PUBLISHABLE_KEY)"
              value={settings.stripePublishableKey}
              onChange={v=>setSettings({...settings,stripePublishableKey:v.trim()})}
              placeholder="pk_test_... o pk_live_..."
            />
            <NField
              label="Secret key (STRIPE_SECRET_KEY)"
              secret
              value={settings.stripeSecretKey}
              onChange={v=>setSettings({...settings,stripeSecretKey:v})}
              placeholder={secretsLoaded.stripeSecretKey ? '•••••••• (dejar vacío para mantener)' : 'sk_test_... o sk_live_...'}
            />
            <NField
              label="Webhook secret (STRIPE_WEBHOOK_SECRET)"
              secret
              value={settings.stripeWebhookSecret}
              onChange={v=>setSettings({...settings,stripeWebhookSecret:v})}
              placeholder={secretsLoaded.stripeWebhookSecret ? '•••••••• (dejar vacío para mantener)' : 'whsec_...'}
            />
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--novo-muted)', lineHeight: 1.6 }}>
            <p style={{ margin: '0 0 8px' }}>
              <strong style={{ color: 'var(--novo-text)' }}>Dónde obtenerlas en Stripe Dashboard → Developers:</strong>
            </p>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li><strong>Publishable + Secret key</strong> → API keys</li>
              <li><strong>Webhook secret</strong> → Webhooks → endpoint → Signing secret</li>
            </ul>
            <p style={{ margin: '12px 0 0' }}>
              Webhook endpoint: <code>{settings.webhookBaseUrl || 'https://TU-PROYECTO.supabase.co/functions/v1'}/stripe-webhook</code>
            </p>
            <p style={{ margin: '8px 0 0' }}>
              El checkout embebido usa la <strong>Publishable key</strong> desde aquí. Las Edge Functions usan Secret + Webhook secret. Guarda y pulsa <strong>Guardar todo</strong>.
            </p>
          </div>
        </div>
      )}
      {tab==='email' && (
        <div className="novo-card">
          <div className="novo-card-header">
            <div>
              <div className="novo-card-title">Correo transaccional</div>
              <div className="novo-card-sub">Notificaciones, bienvenidas y alertas del sistema</div>
            </div>
            <Badge status={emailConfigured ? 'active' : 'pending'} label={emailConfigured ? 'Listo' : 'Pendiente'} />
          </div>

          <div className="novo-grid-2" style={{ marginBottom: 16 }}>
            <SelectField
              label="Proveedor (preset)"
              value={settings.emailProvider}
              onChange={value => applyEmailProvider(value)}
            >
              {Object.entries(EMAIL_PROVIDER_PRESETS).map(([id, preset]) => (
                <option key={id} value={id}>{preset.label}</option>
              ))}
            </SelectField>
            <SelectField
              label="Protocolo / transporte"
              value={settings.emailTransport}
              onChange={value => setSettings(current => ({ ...current, emailTransport: value }))}
            >
              {EMAIL_TRANSPORT_OPTIONS.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </SelectField>
          </div>

          <p style={{ margin: '0 0 16px', color: 'var(--novo-muted)', fontSize: 12, lineHeight: 1.6 }}>
            {EMAIL_TRANSPORT_OPTIONS.find(option => option.id === settings.emailTransport)?.hint}
            {' '}En Supabase Edge Functions, <strong>API HTTP</strong> (Resend, SendGrid, Mailgun, Postmark) suele ser más fiable que SMTP.
          </p>

          <div className="novo-grid-2" style={{ marginBottom: 16 }}>
            <NField label="Remitente (From email)" value={settings.emailFromEmail} onChange={v => setSettings({ ...settings, emailFromEmail: v.trim() })} placeholder="noreply@tudominio.com" />
            <NField label="Nombre remitente" value={settings.emailFromName} onChange={v => setSettings({ ...settings, emailFromName: v })} placeholder="NOVO" />
            <NField label="Reply-To (opcional)" value={settings.emailReplyTo} onChange={v => setSettings({ ...settings, emailReplyTo: v.trim() })} placeholder="soporte@tudominio.com" />
          </div>

          {settings.emailTransport === 'api' && (
            <div className="novo-grid-2" style={{ marginBottom: 16 }}>
              <SelectField
                label="API provider"
                value={settings.emailApiProvider}
                onChange={value => setSettings(current => ({ ...current, emailApiProvider: value }))}
              >
                {EMAIL_API_PROVIDERS.map(provider => (
                  <option key={provider.id} value={provider.id}>{provider.label}</option>
                ))}
              </SelectField>
              <NField
                label="API Key"
                secret
                value={settings.emailApiKey}
                onChange={v => setSettings({ ...settings, emailApiKey: v })}
                placeholder={secretsLoaded.emailApiKey ? '•••••••• (dejar vacío para mantener)' : 're_... / SG....'}
              />
              {settings.emailApiProvider === 'mailgun' && (
                <NField
                  label="Mailgun domain"
                  value={settings.emailMailgunDomain}
                  onChange={v => setSettings({ ...settings, emailMailgunDomain: v.trim() })}
                  placeholder="mg.tudominio.com"
                />
              )}
            </div>
          )}

          {settings.emailTransport === 'smtp' && (
            <div className="novo-grid-2" style={{ marginBottom: 16 }}>
              <NField label="SMTP Host" value={settings.emailSmtpHost} onChange={v => setSettings({ ...settings, emailSmtpHost: v.trim() })} placeholder="smtp.resend.com" />
              <NField label="SMTP Port" value={settings.emailSmtpPort} onChange={v => setSettings({ ...settings, emailSmtpPort: v.trim() })} placeholder="587" />
              <SelectField
                label="Cifrado"
                value={settings.emailSmtpEncryption}
                onChange={value => setSettings(current => ({ ...current, emailSmtpEncryption: value }))}
              >
                {EMAIL_ENCRYPTION_OPTIONS.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </SelectField>
              <NField label="SMTP User" value={settings.emailSmtpUser} onChange={v => setSettings({ ...settings, emailSmtpUser: v })} placeholder="apikey o usuario SMTP" />
              <NField
                label="SMTP Password"
                secret
                value={settings.emailSmtpPassword}
                onChange={v => setSettings({ ...settings, emailSmtpPassword: v })}
                placeholder={secretsLoaded.emailSmtpPassword ? '•••••••• (dejar vacío para mantener)' : 'Contraseña o API key SMTP'}
              />
              {settings.emailProvider === 'ses' && (
                <NField label="Región SES" value={settings.emailSesRegion} onChange={v => setSettings({ ...settings, emailSesRegion: v })} placeholder="us-east-1" />
              )}
              {settings.emailSmtpPort === '465' && settings.emailSmtpEncryption !== 'ssl' && (
                <div style={{ gridColumn: '1 / -1', fontSize: 12, color: 'var(--novo-danger)' }}>
                  Puerto 465 requiere cifrado SSL. Con STARTTLS el correo suele no enviarse.
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--novo-muted)', lineHeight: 1.6, marginBottom: 16 }}>
            <p style={{ margin: '0 0 8px' }}><strong style={{ color: 'var(--novo-text)' }}>Protocolos recomendados:</strong></p>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li><strong>API HTTP</strong> — Resend, SendGrid, Mailgun, Postmark (mejor en serverless)</li>
              <li><strong>SMTP + STARTTLS</strong> — puerto <code>587</code> (estándar más usado)</li>
              <li><strong>SMTP + SSL</strong> — puerto <code>465</code> (legacy, aún soportado)</li>
              <li><strong>Evitar puerto 25</strong> — suele estar bloqueado en cloud/serverless</li>
            </ul>
          </div>

          <div className="novo-grid-2" style={{ alignItems: 'end' }}>
            <NField
              label="Enviar prueba a"
              value={settings.emailTestTo}
              onChange={v => setSettings({ ...settings, emailTestTo: v.trim() })}
              placeholder="tu@email.com (vacío = tu usuario admin)"
            />
            <button type="button" className="novo-btn novo-btn-secondary" onClick={sendTestEmail} disabled={busy || loading}>
              <Mail size={14} /> Enviar correo de prueba
            </button>
          </div>
        </div>
      )}
      {tab==='webhooks' && (
        <div className="novo-card">
          <div className="novo-card-header">
            <div><div className="novo-card-title">App y Webhooks</div><div className="novo-card-sub">URLs públicas para checkout y endpoints de functions</div></div>
          </div>
          <div className="novo-grid-2">
            <NField
              label="App URL (PUBLIC_APP_URL)"
              value={settings.publicAppUrl}
              onChange={v=>setSettings({...settings,publicAppUrl:v.trim().replace(/\/$/, '')})}
              placeholder="http://localhost:5173 o https://partners.novoeia.com"
            />
            <NField
              label="Functions base URL"
              value={settings.webhookBaseUrl}
              onChange={v=>setSettings({...settings,webhookBaseUrl:v.trim().replace(/\/$/, '')})}
              placeholder="https://tu-proyecto.supabase.co/functions/v1"
            />
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--novo-muted)', lineHeight: 1.6 }}>
            <p style={{ margin: '0 0 8px' }}><strong style={{ color: 'var(--novo-text)' }}>Preview de URLs generadas:</strong></p>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Checkout partner: <code>{settings.publicAppUrl || '…'}/#p/&#123;slug&#125;/checkout/&#123;productId&#125;</code></li>
              <li>Stripe webhook: <code>{settings.webhookBaseUrl || '…'}/stripe-webhook</code></li>
            </ul>
            {/localhost:3000|127\.0\.0\.1:3000/i.test(settings.publicAppUrl || '') && (
              <p style={{ margin: '10px 0 0', color: '#B45309' }}>
                App URL apunta a :3000. En local usa <code>http://localhost:5173</code>;
                en producción <code>https://partners.novoeia.com</code>.
                Actualízala aquí y en Supabase → Authentication → URL Configuration.
              </p>
            )}
            {/localhost:5173|127\.0\.0\.1:5173/i.test(settings.publicAppUrl || '') && (
              <p style={{ margin: '10px 0 0' }}>
                Modo local. Para producción guarda <code>https://partners.novoeia.com</code>
                y agrega ambas URLs en Supabase Auth → Redirect URLs.
              </p>
            )}
            {/^https:\/\/partners\.novoeia\.com\/?$/i.test(settings.publicAppUrl || '') && (
              <p style={{ margin: '10px 0 0' }}>
                Producción OK. Mantén también <code>http://localhost:5173</code> en Supabase Redirect URLs para desarrollo.
              </p>
            )}
            {/localhost|127\.0\.0\.1/i.test(settings.publicAppUrl || '') && !/localhost:3000|127\.0\.0\.1:3000|localhost:5173|127\.0\.0\.1:5173/i.test(settings.publicAppUrl || '') && (
              <p style={{ margin: '10px 0 0', color: '#B45309' }}>
                App URL apunta a localhost: los correos de recuperación / checkout usarán esa URL.
                En producción pon <code>https://partners.novoeia.com</code>.
              </p>
            )}
          </div>
        </div>
      )}
      {tab==='security' && (
        <>
          <div className="novo-card" style={{ marginBottom: 16 }}>
            <div className="novo-card-header">
              <div>
                <div className="novo-card-title">Super Admin allowlist</div>
                <div className="novo-card-sub">Emails que reciben rol super_admin al iniciar sesión con GHL</div>
              </div>
              <Badge status={superAdminConfigured ? 'active' : 'pending'} label={superAdminConfigured ? 'Configurado' : 'Vacío'} />
            </div>
            <NField
              label="Emails super admin (GHL_SUPER_ADMIN_EMAILS)"
              value={settings.superAdminEmails}
              onChange={v => setSettings({ ...settings, superAdminEmails: v })}
              placeholder="tu@email.com, otro@empresa.com"
            />
            <p style={{ color: 'var(--novo-muted)', fontSize: 12, margin: '12px 0 0', lineHeight: 1.6 }}>
              Separa con comas, punto y coma o saltos de línea. OAuth GHL y <code>syncRole</code> usan
              {' '}<strong>primero este campo del panel</strong>; si está vacío, caen al secret{' '}
              <code>GHL_SUPER_ADMIN_EMAILS</code> en Supabase. Guarda y vuelve a iniciar sesión con GHL para aplicar.
            </p>
          </div>
          <div className="novo-card">
            <div className="novo-card-header"><div className="novo-card-title">Checklist de seguridad</div></div>
            {[
              ['Supabase Auth con roles', true],
              ['RLS en todas las tablas', true],
              ['Secretos en Edge Functions', true],
              ['OAuth con refresh token', ghlConnected],
              ['Webhooks con firma Ed25519', true],
              ['GHL OAuth configurado', ghlConnected],
              ['GHL provisioning (locations.write)', ghlProvisionReady],
              ['GHL SaaS provisioning', settings.ghlSaasEnabled],
              ['App URL configurada', Boolean(settings.publicAppUrl)],
              ['Super admin allowlist', superAdminConfigured],
              ['Correo transaccional', emailConfigured],
              ['Stripe publishable key', stripePublishableConfigured],
              ['Stripe secret + webhook', stripeConfigured && stripeWebhookConfigured],
            ].map(([label, ok])=>(
              <div key={label} className="status-row">
                {ok?<CheckCircle2 size={15} style={{color:'var(--novo-success)',flexShrink:0}}/>:<AlertCircle size={15} style={{color:'var(--novo-warning)',flexShrink:0}}/>}
                <span style={{fontSize:13}}>{label}</span>
                <Badge status={ok?'active':'pending'} label={ok?'OK':'Pendiente'} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ================================
   FORMULARIO CLIENTE COMPLETO
   (compartido entre Partner y Admin)
================================ */
const emptyClient = {
  name: '', company_name: '', logo_url: '', industry: '', website: '',
  contact_name: '', email: '', phone: '', contact_role: '',
  country: '', city: '', address: '', status: 'pending', notes: '',
};

function ClientForm({ initial = emptyClient, onSave, onCancel, busy, title = 'Nuevo cliente', uploadScope = 'clients' }) {
  const [form, setForm] = useState(initial);
  const f = key => value => setForm(current => ({ ...current, [key]: value }));

  useEffect(() => { setForm(initial); }, [initial]);

  return (
    <div className="novo-card" style={{ marginBottom: 20, border: '1px solid rgba(124,58,237,.3)' }}>
      <div className="novo-card-header">
        <div className="novo-card-title">{title}</div>
        <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 8px' }} onClick={onCancel}><X size={14} /></button>
      </div>

      <LogoField
        label="Logo de la empresa"
        value={form.logo_url}
        onChange={f('logo_url')}
        uploadScope={uploadScope}
      />

      <SectionLabel icon={Building2} label="Información de la empresa" />
      <div className="novo-grid-2" style={{ marginBottom: 16 }}>
        <NField label="Nombre de la empresa *" value={form.company_name} onChange={f('company_name')} />
        <NField label="Nombre visible / Apodo" value={form.name} onChange={f('name')} />
        <NField label="Industria / Sector" value={form.industry} onChange={f('industry')} />
        <NField label="Sitio web" value={form.website} onChange={f('website')} />
      </div>

      <SectionLabel icon={User} label="Contacto principal" />
      <div className="novo-grid-2" style={{ marginBottom: 16 }}>
        <NField label="Nombre del contacto" value={form.contact_name} onChange={f('contact_name')} />
        <NField label="Cargo" value={form.contact_role} onChange={f('contact_role')} />
        <NField label="Email *" type="email" value={form.email} onChange={f('email')} />
        <NField label="Teléfono" value={form.phone} onChange={f('phone')} />
      </div>

      <SectionLabel icon={MapPin} label="Ubicación" />
      <div className="novo-grid-3" style={{ marginBottom: 16 }}>
        <NField label="País" value={form.country} onChange={f('country')} />
        <NField label="Ciudad" value={form.city} onChange={f('city')} />
        <NField label="Dirección" value={form.address} onChange={f('address')} />
      </div>

      <SectionLabel icon={FileText} label="Información interna" />
      <div className="novo-grid-2" style={{ marginBottom: 16 }}>
        <SelectField label="Estado" value={form.status} onChange={f('status')}>
          <option value="pending">Pendiente</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </SelectField>
        <NField label="Notas internas" value={form.notes} onChange={f('notes')} />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="novo-btn novo-btn-primary" onClick={() => onSave(form)} disabled={busy || !form.company_name?.trim()}>
          {busy ? <Loader2 size={14} style={{ animation: 'novoSpin .8s linear infinite' }} /> : <Save size={14} />} Guardar cliente
        </button>
        <button className="novo-btn novo-btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

/* ================================
   PARTNER ROUTER
================================ */
export function PartnerConsole({ section, onNavigate, linkProductPreset, onClearLinkPreset }) {
  if (section === 'dashboard') return <PartnerDashboard />;
  if (section === 'clients')   return <PartnerClients />;
  if (section === 'products' || section === 'offers') {
    return <PartnerProductServices onNavigate={onNavigate} />;
  }
  if (section === 'links') {
    return (
      <PartnerLinks
        linkProductPreset={linkProductPreset}
        onClearLinkPreset={onClearLinkPreset}
      />
    );
  }
  if (section === 'commissions') return <PartnerCommissions />;
  if (section === 'payments') return <PartnerPaymentsModule />;
  if (section === 'partner-center' || section === 'partner-registration') return <PartnerRegistrationEmbed />;
  if (section === 'brand')     return null;
  if (section === 'support')   return <PartnerSupport />;
  return <PartnerRegistrationEmbed />;
}

/* ================================
   PARTNER DASHBOARD
================================ */
function PartnerDashboard() {
  const [clients, setClients] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      platformApi.listPartnerClients().catch(() => ({ clients: [] })),
      platformApi.listCatalog().catch(() => ({ products: [] })),
      platformApi.listActiveSubscriptions().catch(() => ({ subscriptions: [] })),
      platformApi.listCommissions().catch(() => ({ commissions: [] })),
    ]).then(([cd, ct, subs, comm]) => {
      setClients(cd?.clients || []);
      setCatalog(ct?.products || []);
      setSubscriptions(subs?.subscriptions || []);
      setCommissions(comm?.commissions || []);
    }).finally(() => setLoading(false));
  }, []);

  const pendingCommissions = commissions.filter(row => row.status === 'pending');
  const paidCommissions = commissions.filter(row => row.status === 'paid');
  const mrr = subscriptions.reduce((sum, row) => sum + Number(row.sale_price || 0), 0);

  return (
    <div className="novo-page">
      <div className="novo-page-header"><span className="kicker">PARTNER WORKSPACE</span><h1>Mi negocio</h1><p>Resumen de tu operación en el ecosistema NOVO.</p></div>
      <div className="novo-stats">
        {[
          ['Mis clientes', loading ? '…' : clients.length, Users, 'blue'],
          ['Clientes activos', loading ? '…' : clients.filter(c => c.status === 'active').length, CheckCircle2, 'green'],
          ['Suscripciones activas', loading ? '…' : subscriptions.length, Activity, 'purple'],
          ['Comisiones pendientes', loading ? '…' : money(pendingCommissions.reduce((sum, row) => sum + Number(row.commission_amount || 0), 0)), DollarSign, 'orange'],
        ].map(([label, value, Icon, color]) => (
          <div className="novo-stat" key={label}>
            <div className={`novo-stat-icon ${color}`}><Icon size={17} /></div>
            <span className="novo-stat-label">{label}</span>
            <span className="novo-stat-value">{value}</span>
            {label === 'Suscripciones activas' && !loading && (
              <span className="novo-stat-sub">MRR estimado {money(mrr)}</span>
            )}
            {label === 'Comisiones pendientes' && !loading && (
              <span className="novo-stat-sub">{paidCommissions.length} ya pagadas</span>
            )}
          </div>
        ))}
      </div>
      <div className="novo-grid-2">
        <div className="novo-card">
          <div className="novo-card-header"><div className="novo-card-title">Clientes recientes</div><Badge status="active" label={`${clients.length} total`} /></div>
          {loading && <div className="novo-empty">Cargando…</div>}
          {!loading && clients.length === 0 && <div className="novo-empty">No tienes clientes todavía.</div>}
          {!loading && clients.length > 0 && (
            <table className="novo-table">
              <thead><tr><th>Empresa</th><th>Contacto</th><th>Estado</th></tr></thead>
              <tbody>
                {clients.slice(0, 5).map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {c.logo_url && <img src={c.logo_url} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} onError={e => e.target.style.display='none'} />}
                        <strong style={{ color: 'var(--novo-text)' }}>{c.company_name || c.name}</strong>
                      </div>
                    </td>
                    <td style={{ color: 'var(--novo-muted)', fontSize: 12 }}>{c.contact_name || c.email || '—'}</td>
                    <td><Badge status={c.status || 'pending'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="novo-card">
          <div className="novo-card-header"><div className="novo-card-title">Productos disponibles</div></div>
          {loading && <div className="novo-empty">Cargando…</div>}
          {!loading && catalog.length === 0 && <div className="novo-empty">El Super Admin aún no ha publicado productos.</div>}
          {!loading && catalog.map(p => {
            const includes = String(p.includes || '')
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean);
            return (
              <div key={p.id} className="status-row" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 12 }}>
                  <span style={{ color: 'var(--novo-text)', fontWeight: 500 }}>{p.name}</span>
                  <span style={{ color: 'var(--novo-success)', fontSize: 13, whiteSpace: 'nowrap' }}>${p.wholesale_price}/{p.interval}</span>
                </div>
                {p.description && (
                  <div style={{ fontSize: 12, color: 'var(--novo-muted)', lineHeight: 1.4 }}>{p.description}</div>
                )}
                {includes.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--novo-muted)', fontSize: 12, lineHeight: 1.45 }}>
                    {includes.slice(0, 4).map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================================
   PARTNER CLIENTES
================================ */
function PartnerClients() {
  const [clients, setClients] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [clientsData, subsData, commData] = await Promise.all([
        platformApi.listPartnerClients(),
        platformApi.listActiveSubscriptions().catch(() => ({ subscriptions: [] })),
        platformApi.listCommissions().catch(() => ({ commissions: [] })),
      ]);
      setClients(clientsData?.clients || []);
      setSubscriptions(subsData?.subscriptions || []);
      setCommissions(commData?.commissions || []);
    }
    catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function saveClient(form) {
    try {
      setBusy(true);
      const payload = { ...form, name: form.company_name || form.name };
      if (editItem) {
        await platformApi.createPartnerClient({ ...payload, id: editItem.id });
      } else {
        await platformApi.createPartnerClient(payload);
      }
      setNotice({ type: 'success', text: editItem ? 'Cliente actualizado.' : 'Cliente creado correctamente.' });
      setShowForm(false); setEditItem(null); load();
    } catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setBusy(false); }
  }

  function openEdit(c) { setEditItem(c); setShowForm(true); }
  function openNew() { setEditItem(null); setShowForm(true); }

  const filtered = clients.filter(c =>
    (c.company_name || c.name)?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="novo-page">
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><span className="kicker">CLIENTES</span><h1>Mis clientes</h1><p>Gestiona tu cartera de clientes en el ecosistema NOVO.</p></div>
        <button className="novo-btn novo-btn-primary" onClick={openNew}><Plus size={15} /> Agregar cliente</button>
      </div>

      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

      {showForm && (
        <ClientForm
          initial={editItem ? {
            name: editItem.name || '', company_name: editItem.company_name || editItem.name || '',
            logo_url: editItem.logo_url || '', industry: editItem.industry || '',
            website: editItem.website || '', contact_name: editItem.contact_name || '',
            email: editItem.email || '', phone: editItem.phone || '',
            contact_role: editItem.contact_role || '', country: editItem.country || '',
            city: editItem.city || '', address: editItem.address || '',
            status: editItem.status || 'pending', notes: editItem.notes || '',
          } : emptyClient}
          title={editItem ? `Editando: ${editItem.company_name || editItem.name}` : 'Nuevo cliente'}
          onSave={saveClient}
          onCancel={() => { setShowForm(false); setEditItem(null); }}
          busy={busy}
          uploadScope="clients"
        />
      )}

      <div className="novo-card">
        <div className="novo-card-header">
          <div className="novo-card-title">Clientes ({filtered.length})</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="novo-search" style={{ width: 220 }}><Search size={13} /><input placeholder="Buscar cliente…" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <button className="novo-btn novo-btn-ghost" onClick={load}><RefreshCw size={13} /></button>
          </div>
        </div>

        {loading && <div className="novo-empty">Cargando…</div>}
        {!loading && filtered.length === 0 && <div className="novo-empty">No hay clientes que coincidan.</div>}
        {!loading && filtered.length > 0 && (
          <table className="novo-table">
            <thead><tr><th>Empresa</th><th>Contacto</th><th>Ubicación</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <Fragment key={c.id}>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {c.logo_url
                          ? <img src={c.logo_url} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--novo-border)' }} onError={e => e.target.style.display='none'} />
                          : <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,58,237,.15)', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, color: 'var(--novo-purple)' }}>{(c.company_name || c.name || '?')[0].toUpperCase()}</div>
                        }
                        <div>
                          <strong style={{ color: 'var(--novo-text)', display: 'block' }}>{c.company_name || c.name}</strong>
                          {c.industry && <small style={{ color: 'var(--novo-muted)', fontSize: 11 }}>{c.industry}</small>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{c.contact_name || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--novo-muted)' }}>{c.email || '—'}</div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--novo-muted)' }}>{[c.city, c.country].filter(Boolean).join(', ') || '—'}</td>
                    <td><Badge status={c.status || 'pending'} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setSelected(selected?.id === c.id ? null : c)}><Eye size={12} /> {selected?.id === c.id ? 'Cerrar' : 'Ver'}</button>
                        <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => openEdit(c)}><Edit2 size={12} /> Editar</button>
                      </div>
                    </td>
                  </tr>
                  {selected?.id === c.id && (
                    <tr key={`${c.id}-detail`}>
                      <td colSpan={5} style={{ padding: 0 }}>
                        <div style={{ background: 'rgba(124,58,237,.05)', border: '1px solid rgba(124,58,237,.15)', borderRadius: 10, margin: '4px 0', padding: '18px 20px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
                            <Info label="Email" value={c.email || '—'} />
                            <Info label="Teléfono" value={c.phone || '—'} />
                            <Info label="Sitio web" value={c.website || '—'} />
                            <Info label="Contacto" value={c.contact_name || '—'} />
                            <Info label="Cargo" value={c.contact_role || '—'} />
                            <Info label="País" value={c.country || '—'} />
                            <Info label="Ciudad" value={c.city || '—'} />
                            <Info label="Dirección" value={c.address || '—'} />
                          </div>
                          {(() => {
                            const clientSubs = subscriptions.filter(row => row.client_id === c.id);
                            const clientComms = commissions.filter(row => row.client_id === c.id);
                            const pendingComm = clientComms
                              .filter(row => row.status === 'pending')
                              .reduce((sum, row) => sum + Number(row.commission_amount || 0), 0);
                            const activeSub = clientSubs[0];
                            return (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16, padding: '14px 16px', background: 'var(--novo-card-hover)', borderRadius: 8 }}>
                                <Info label="Suscripción activa" value={activeSub ? `${activeSub.product_name} — ${money(activeSub.sale_price, activeSub.currency)}` : 'Sin suscripción activa'} />
                                <Info label="Margen recurrente" value={activeSub ? money(activeSub.partner_margin, activeSub.currency) : '—'} />
                                <Info label="Comisiones pendientes" value={pendingComm > 0 ? money(pendingComm) : clientComms.length > 0 ? 'Al día' : 'Sin comisiones'} />
                              </div>
                            );
                          })()}
                          {c.notes && <div style={{ background: 'var(--novo-card-hover)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--novo-muted)', marginBottom: 14 }}><strong style={{ color: 'var(--novo-text)' }}>Notas: </strong>{c.notes}</div>}
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button className="novo-btn novo-btn-primary" onClick={() => openEdit(c)}><Edit2 size={13} /> Editar cliente</button>
                            <button className="novo-btn novo-btn-ghost" onClick={() => setSelected(null)}><X size={13} /> Cerrar</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ================================
   PARTNER PRODUCTOS Y SERVICIOS
================================ */
function PartnerProductServices({ onNavigate }) {
  const [products, setProducts] = useState([]);
  const [additionalServices, setAdditionalServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [drafts, setDrafts] = useState({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [catalogData, brandingData] = await Promise.all([
        platformApi.listPartnerCatalog(),
        platformApi.getPartnerBranding(),
      ]);
      const rows = catalogData?.products || [];
      const branding = brandingData?.partner?.branding || {};
      setProducts(rows);
      setAdditionalServices(Array.isArray(branding.additionalServices) ? branding.additionalServices : []);
      setDrafts(() => {
        const next = {};
        rows.forEach(product => {
          next[product.id] = {
            displayName: product.displayName || product.catalogName || '',
            displayDescription: product.displayDescription || product.catalogDescription || '',
            retailPrice: product.retailPrice != null ? String(product.retailPrice) : '',
          };
        });
        return next;
      });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function updateDraft(productId, field, value) {
    setDrafts(current => ({
      ...current,
      [productId]: {
        ...current[productId],
        [field]: value,
      },
    }));
  }

  async function saveProduct(product) {
    const draft = drafts[product.id] || {};
    const retailPrice = Number(draft.retailPrice);
    if (!draft.displayName?.trim()) {
      setNotice({ type: 'error', text: 'El nombre público del producto es obligatorio.' });
      return;
    }
    if (!Number.isFinite(retailPrice) || retailPrice <= 0) {
      setNotice({ type: 'error', text: 'Define un precio de venta válido.' });
      return;
    }
    if (retailPrice < Number(product.wholesalePrice || 0)) {
      setNotice({ type: 'error', text: 'El precio no puede ser menor al costo mayorista.' });
      return;
    }

    try {
      setBusy(true);
      await platformApi.savePartnerOffer({
        productId: product.id,
        retailPrice,
        displayName: draft.displayName.trim(),
        displayDescription: draft.displayDescription?.trim() || '',
      });
      setNotice({ type: 'success', text: `Producto "${draft.displayName.trim()}" guardado.` });
      notifyPartnerCatalogUpdated({ source: 'product', productId: product.id });
      setExpandedProductId(null);
      await load();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  function goCreateLink(product) {
    onNavigate?.('links', { productId: product.id });
  }

  function addAdditionalService() {
    if (additionalServices.length >= MAX_PARTNER_ADDITIONAL_SERVICES) {
      setNotice({
        type: 'error',
        text: `Solo puedes tener hasta ${MAX_PARTNER_ADDITIONAL_SERVICES} servicios adicionales.`,
      });
      return;
    }
    setAdditionalServices(current => [
      ...current,
      {
        id: `svc-${Date.now()}`,
        title: '',
        description: '',
        price: 0,
        compareAtPrice: null,
        billingType: 'one_time',
        active: true,
      },
    ]);
  }

  function updateAdditionalService(index, field, value) {
    setAdditionalServices(current => current.map((item, i) => (
      i === index ? { ...item, [field]: value } : item
    )));
  }

  function removeAdditionalService(index) {
    setAdditionalServices(current => current.filter((_, i) => i !== index));
  }

  async function saveAdditionalServices() {
    if (additionalServices.length > MAX_PARTNER_ADDITIONAL_SERVICES) {
      setNotice({
        type: 'error',
        text: `Solo puedes guardar hasta ${MAX_PARTNER_ADDITIONAL_SERVICES} servicios adicionales.`,
      });
      return;
    }

    const incompleteActive = additionalServices.filter(service =>
      service.active !== false
      && (!String(service.title || '').trim() || !Number(service.price) || Number(service.price) <= 0),
    );
    if (incompleteActive.length > 0) {
      setNotice({
        type: 'error',
        text: 'Los servicios activos deben tener nombre y precio mayor a 0 para guardarse en Stripe.',
      });
      return;
    }

    try {
      setBusy(true);
      await platformApi.savePartnerAdditionalServices(additionalServices);
      setNotice({ type: 'success', text: 'Servicios adicionales guardados correctamente.' });
      await load();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="novo-page">
      <div className="novo-page-header">
        <span className="kicker">CATÁLOGO PARTNER</span>
        <h1>Productos y servicios</h1>
        <p>Personaliza tus planes del catálogo NOVO y administra los servicios adicionales del checkout.</p>
      </div>

      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

      <div className="novo-card">
        <div className="novo-card-header">
          <div>
            <div className="novo-card-title">Mis productos</div>
            <div className="novo-card-sub">Define nombre, descripción y precio público de cada plan del catálogo NOVO.</div>
          </div>
          <button type="button" className="novo-btn novo-btn-ghost" onClick={load}><RefreshCw size={13} /></button>
        </div>

        {loading && <div className="novo-empty">Cargando catálogo…</div>}
        {!loading && products.length === 0 && (
          <div className="novo-empty">El Super Admin aún no ha publicado productos.</div>
        )}

        {!loading && products.length > 0 && (
          <div className="novo-grid-2">
            {products.map(product => {
              const draft = drafts[product.id] || {};
              const expanded = expandedProductId === product.id;
              return (
                <div
                  key={product.id}
                  className="novo-card"
                  style={{
                    marginBottom: 0,
                    border: expanded ? '1px solid #7C3AED' : '1px solid var(--novo-card-border)',
                    background: expanded ? 'rgba(124,58,237,.05)' : 'var(--novo-card)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--novo-text)', marginBottom: 4 }}>
                        {draft.displayName || product.catalogName}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--novo-muted)', textTransform: 'capitalize' }}>
                        {product.billingType} · {product.interval}
                      </div>
                      {product.catalogDescription && (
                        <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--novo-text)', lineHeight: 1.45 }}>
                          {product.catalogDescription}
                        </p>
                      )}
                      {(() => {
                        const includes = String(product.catalogIncludes || '')
                          .split('\n')
                          .map((line) => line.trim())
                          .filter(Boolean);
                        if (!includes.length) return null;
                        return (
                          <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: 'var(--novo-muted)', fontSize: 12, lineHeight: 1.5 }}>
                            {includes.slice(0, expanded ? includes.length : 3).map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                            {!expanded && includes.length > 3 && (
                              <li style={{ listStyle: 'none', marginLeft: -18, color: 'var(--novo-purple)' }}>
                                +{includes.length - 3} más
                              </li>
                            )}
                          </ul>
                        );
                      })()}
                      {product.published ? (
                        <span style={{ display: 'inline-block', marginTop: 8, fontSize: 11, color: 'var(--novo-success)' }}>Publicado en tu landing</span>
                      ) : (
                        <span style={{ display: 'inline-block', marginTop: 8, fontSize: 11, color: 'var(--novo-muted)' }}>Sin publicar — guarda nombre y precio</span>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--novo-success)', fontWeight: 700, fontSize: 18 }}>
                        {money(product.retailPrice || draft.retailPrice || 0, product.currency)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--novo-muted)' }}>
                        mayorista {money(product.wholesalePrice, product.currency)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                    {!expanded && (
                      <button
                        type="button"
                        className="novo-btn novo-btn-ghost"
                        style={{ padding: '4px 10px', fontSize: 11 }}
                        onClick={() => setExpandedProductId(product.id)}
                      >
                        <Edit2 size={12} /> Editar producto
                      </button>
                    )}
                    {product.published && onNavigate && (
                      <button
                        type="button"
                        className="novo-btn novo-btn-secondary"
                        style={{ padding: '4px 10px', fontSize: 11 }}
                        onClick={() => goCreateLink(product)}
                      >
                        <Link2 size={12} /> Crear link
                      </button>
                    )}
                  </div>

                  {expanded && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--novo-border)' }}>
                      <div className="novo-grid-2" style={{ marginBottom: 12 }}>
                        <NField
                          label="Nombre público *"
                          value={draft.displayName ?? product.catalogName ?? ''}
                          onChange={value => updateDraft(product.id, 'displayName', value)}
                        />
                        <NField
                          label="Precio de venta (USD) *"
                          type="number"
                          value={draft.retailPrice || ''}
                          onChange={value => updateDraft(product.id, 'retailPrice', value)}
                        />
                      </div>
                      <div className="novo-field" style={{ marginBottom: 12 }}>
                        <label>Descripción pública</label>
                        <textarea
                          rows={3}
                          value={draft.displayDescription ?? product.catalogDescription ?? ''}
                          onChange={event => updateDraft(product.id, 'displayDescription', event.target.value)}
                          placeholder={product.catalogDescription || 'Descripción que verá el cliente'}
                          style={{ width: '100%', resize: 'vertical', background: 'var(--novo-card-hover)', border: '1px solid var(--novo-border)', borderRadius: 8, padding: '10px 12px', color: 'var(--novo-text)', fontSize: 13, outline: 'none' }}
                        />
                      </div>
                      <div className="novo-grid-3" style={{ marginBottom: 14 }}>
                        <Metric label="Costo mayorista" value={money(product.wholesalePrice, product.currency)} />
                        <Metric label="Precio al cliente" value={money(draft.retailPrice || 0, product.currency)} />
                        <Metric
                          label="Tu margen"
                          value={money(Number(draft.retailPrice || 0) - Number(product.wholesalePrice || 0), product.currency)}
                          tone={Number(draft.retailPrice || 0) >= Number(product.wholesalePrice || 0) ? 'success' : 'danger'}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="novo-btn novo-btn-primary"
                          disabled={busy}
                          onClick={() => saveProduct(product)}
                        >
                          {busy ? <Loader2 size={14} style={{ animation: 'novoSpin .8s linear infinite' }} /> : <Save size={14} />}
                          Guardar producto
                        </button>
                        <button
                          type="button"
                          className="novo-btn novo-btn-ghost"
                          disabled={busy}
                          onClick={() => setExpandedProductId(null)}
                        >
                          <X size={14} />
                          Cerrar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="novo-card" style={{ marginTop: 16 }}>
        <div className="novo-card-header">
          <div>
            <div className="novo-card-title">Servicios adicionales</div>
            <div className="novo-card-sub">Upsells opcionales en el checkout. Máximo {MAX_PARTNER_ADDITIONAL_SERVICES} servicios ({additionalServices.length}/{MAX_PARTNER_ADDITIONAL_SERVICES}). Al guardar, cada servicio con nombre y precio se crea en Stripe.</div>
          </div>
        </div>

        {additionalServices.length === 0 ? (
          <p style={{ margin: '0 0 14px', color: 'var(--novo-muted)', fontSize: 12, lineHeight: 1.55 }}>
            Aún no tienes servicios adicionales. Agrega configuración inicial, integraciones u otros cargos.
          </p>
        ) : (
          additionalServices.map((service, index) => (
            <div
              key={service.id || index}
              className="novo-card"
              style={{ marginBottom: 12, padding: 16, background: 'var(--novo-card-hover)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong>Servicio {index + 1}</strong>
                  {service.stripe_price_id && (
                    <span style={{ fontSize: 11, color: 'var(--novo-success)' }}>✓ Stripe</span>
                  )}
                </div>
                <button
                  type="button"
                  className="novo-btn novo-btn-ghost"
                  style={{ padding: '4px 8px' }}
                  onClick={() => removeAdditionalService(index)}
                  aria-label="Eliminar servicio"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="novo-grid-2" style={{ marginBottom: 12 }}>
                <NField label="Nombre" value={service.title} onChange={value => updateAdditionalService(index, 'title', value)} />
                <SelectField
                  label="Tipo de cobro"
                  value={service.billingType || 'one_time'}
                  onChange={value => updateAdditionalService(index, 'billingType', value)}
                >
                  <option value="one_time">Pago único</option>
                  <option value="month">Mensual</option>
                  <option value="year">Anual</option>
                </SelectField>
                <NField label="Precio (USD)" type="number" value={service.price} onChange={value => updateAdditionalService(index, 'price', Number(value))} />
                <NField
                  label="Precio anterior (USD)"
                  type="number"
                  value={service.compareAtPrice ?? ''}
                  onChange={value => updateAdditionalService(index, 'compareAtPrice', value === '' ? null : Number(value))}
                />
              </div>
              <div className="novo-field" style={{ marginBottom: 12 }}>
                <label>Descripción</label>
                <input
                  type="text"
                  value={service.description || ''}
                  onChange={event => updateAdditionalService(index, 'description', event.target.value)}
                  style={{ width: '100%', background: 'var(--novo-card-hover)', border: '1px solid var(--novo-border)', borderRadius: 8, padding: '10px 12px', color: 'var(--novo-text)', fontSize: 13, outline: 'none' }}
                />
                <small style={{ display: 'block', marginTop: 6, color: 'var(--novo-muted)', fontSize: 11 }}>
                  El precio anterior aparece tachado en el checkout si es mayor al precio de venta.
                </small>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--novo-text)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={service.active !== false}
                  onChange={event => updateAdditionalService(index, 'active', event.target.checked)}
                />
                Servicio activo — si lo desactivas, no aparecerá en el checkout
              </label>
            </div>
          ))
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
          <button
            type="button"
            className="novo-btn novo-btn-ghost"
            onClick={addAdditionalService}
            disabled={additionalServices.length >= MAX_PARTNER_ADDITIONAL_SERVICES}
            title={additionalServices.length >= MAX_PARTNER_ADDITIONAL_SERVICES ? `Máximo ${MAX_PARTNER_ADDITIONAL_SERVICES} servicios` : undefined}
          >
            <Plus size={14} /> Agregar servicio adicional
          </button>
          <button type="button" className="novo-btn novo-btn-primary" onClick={saveAdditionalServices} disabled={busy}>
            {busy ? <Loader2 size={14} style={{ animation: 'novoSpin .8s linear infinite' }} /> : <Save size={14} />}
            Guardar servicios
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================
   PARTNER LINKS DE VENTA
================================ */
function PartnerLinks({ linkProductPreset, onClearLinkPreset }) {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [links, setLinks] = useState([]);
  const [additionalServices, setAdditionalServices] = useState([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [showOtherServices, setShowOtherServices] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [linkProductId, setLinkProductId] = useState('');
  const [clientId, setClientId] = useState('');
  const [linkPrice, setLinkPrice] = useState('');
  const [checkout, setCheckout] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [catalogData, clientsData, linksData, brandingData] = await Promise.all([
        platformApi.listPartnerCatalog(),
        platformApi.listPartnerClients(),
        platformApi.listSalesLinks(),
        platformApi.getPartnerBranding(),
      ]);
      setProducts(catalogData?.products || []);
      setClients(clientsData?.clients || []);
      setLinks(linksData?.links || []);
      const branding = brandingData?.partner?.branding || {};
      setAdditionalServices(
        Array.isArray(branding.additionalServices)
          ? branding.additionalServices.filter(service => service.active !== false)
          : [],
      );
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => subscribePartnerCatalogUpdated(() => {
    load().catch(error => setNotice({ type: 'error', text: error.message }));
  }), [load]);

  useEffect(() => {
    if (!linkProductPreset || products.length === 0) return;
    const product = products.find(row => row.id === linkProductPreset);
    if (!product) return;
    setLinkProductId(product.id);
    setLinkPrice(product.retailPrice != null ? String(product.retailPrice) : '');
    onClearLinkPreset?.();
  }, [linkProductPreset, products, onClearLinkPreset]);

  const publishedProducts = products.filter(product => product.published);
  const selectedLinkProduct = products.find(product => product.id === linkProductId);
  const selectedClient = clients.find(client => client.id === clientId);
  const linkMargin = selectedLinkProduct && linkPrice
    ? Number(linkPrice) - Number(selectedLinkProduct.wholesalePrice || 0)
    : 0;
  const selectedLinkServices = additionalServices.filter(service =>
    selectedServiceIds.includes(service.id),
  );
  const estimatedFirstPayment = selectedLinkProduct
    ? calculateCheckoutDueToday(
      {
        price: linkPrice,
        interval: selectedLinkProduct.interval,
      },
      selectedLinkServices,
    ).dueToday
    : 0;

  function toggleLinkService(serviceId) {
    setSelectedServiceIds(current => (
      current.includes(serviceId)
        ? current.filter(id => id !== serviceId)
        : [...current, serviceId]
    ));
    setCheckout('');
  }

  function linkServiceBillingLabel(billingType) {
    if (billingType === 'month') return '/ mes';
    if (billingType === 'year') return '/ año';
    return ' · único';
  }

  async function generateLink() {
    if (!linkProductId) {
      setNotice({ type: 'error', text: 'Selecciona un producto publicado.' });
      return;
    }
    if (!clientId) {
      setNotice({ type: 'error', text: 'Selecciona el cliente al que pertenece este link.' });
      return;
    }
    if (!linkPrice || Number(linkPrice) <= 0) {
      setNotice({ type: 'error', text: 'Define un precio de venta válido.' });
      return;
    }
    if (selectedLinkProduct && Number(linkPrice) < Number(selectedLinkProduct.wholesalePrice || 0)) {
      setNotice({ type: 'error', text: 'El precio no puede ser menor al costo mayorista.' });
      return;
    }

    try {
      setBusy(true);
      const data = await platformApi.generateCheckoutLink({
        productId: linkProductId,
        clientId,
        clientEmail: selectedClient?.email || null,
        retailPrice: Number(linkPrice),
        selectedServiceIds,
        showOtherServices,
      });
      setCheckout(data.checkoutUrl || '');
      setNotice({
        type: 'success',
        text: `Link guardado para ${selectedClient?.company_name || selectedClient?.name}.`,
      });
      await load();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(link, status) {
    try {
      setBusy(true);
      await platformApi.updateSalesLinkStatus(link.id, status);
      setNotice({
        type: 'success',
        text: status === 'active' ? 'Link reactivado.' : status === 'disabled' ? 'Link desactivado.' : 'Link archivado.',
      });
      await load();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  const visibleLinks = links.filter(link => {
    if (filters.status && link.status !== filters.status) return false;
    const term = filters.search.trim().toLowerCase();
    if (!term) return true;
    return [link.client_name, link.client_email, link.product_name]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(term));
  });

  return (
    <div className="novo-page">
      <div className="novo-page-header">
        <span className="kicker">VENTAS</span>
        <h1>Links de venta</h1>
        <p>Genera links a tu checkout white-label con producto, cliente y servicios preseleccionados.</p>
      </div>

      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

      <div id="partner-generate-link" className="novo-card" style={{ marginBottom: 16 }}>
        <div className="novo-card-header">
          <div>
            <div className="novo-card-title">Generar link de venta</div>
            <div className="novo-card-sub">Selecciona producto, cliente y servicios incluidos. El cliente pagará en tu checkout embebido.</div>
          </div>
        </div>

        {!loading && clients.length === 0 && (
          <div className="novo-notice error" style={{ marginBottom: 16 }}>
            <AlertCircle size={15} />
            <span>No tienes clientes registrados. Crea un cliente antes de generar un link.</span>
          </div>
        )}

        {!loading && publishedProducts.length === 0 && (
          <div className="novo-notice error" style={{ marginBottom: 16 }}>
            <AlertCircle size={15} />
            <span>Publica al menos un producto en Productos y servicios antes de generar links.</span>
          </div>
        )}

        <div className="novo-grid-2" style={{ marginBottom: 16 }}>
          <SelectField
            label="Producto *"
            value={linkProductId}
            onChange={value => {
              setLinkProductId(value);
              const product = products.find(row => row.id === value);
              setLinkPrice(product?.retailPrice != null ? String(product.retailPrice) : '');
              setSelectedServiceIds([]);
              setShowOtherServices(true);
              setCheckout('');
            }}
            disabled={publishedProducts.length === 0}
          >
            <option value="">Selecciona un producto</option>
            {publishedProducts.map(product => (
              <option key={product.id} value={product.id}>
                {product.displayName} — {money(product.retailPrice, product.currency)}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Cliente *"
            value={clientId}
            onChange={value => { setClientId(value); setCheckout(''); }}
            disabled={clients.length === 0}
          >
            <option value="">Selecciona un cliente</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.company_name || client.name}{client.email ? ` — ${client.email}` : ''}
              </option>
            ))}
          </SelectField>
        </div>

        {selectedLinkProduct && (
          <>
            <div className="novo-grid-2" style={{ marginBottom: 16 }}>
              <NField
                label="Precio del link (USD) *"
                type="number"
                value={linkPrice}
                onChange={value => { setLinkPrice(value); setCheckout(''); }}
              />
              <div className="novo-field">
                <label>Descripción que verá el cliente</label>
                <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--novo-card-hover)', fontSize: 12, color: 'var(--novo-muted)', minHeight: 42 }}>
                  {selectedLinkProduct.displayDescription || 'Sin descripción'}
                </div>
              </div>
            </div>
            <div className="novo-grid-3" style={{ marginBottom: 16 }}>
              <Metric label="Costo mayorista" value={money(selectedLinkProduct.wholesalePrice, selectedLinkProduct.currency)} />
              <Metric label="Precio al cliente" value={money(linkPrice || 0, selectedLinkProduct.currency)} />
              <Metric label="Tu ganancia estimada" value={money(linkMargin, selectedLinkProduct.currency)} tone={linkMargin >= 0 ? 'success' : 'danger'} />
            </div>

            {additionalServices.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--novo-text)', marginBottom: 10 }}>
                  Servicios incluidos en el link
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {additionalServices.map(service => {
                    const selected = selectedServiceIds.includes(service.id);
                    return (
                      <label
                        key={service.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 14px',
                          borderRadius: 10,
                          border: selected ? '1px solid var(--novo-purple)' : '1px solid var(--novo-border)',
                          background: selected ? 'rgba(124,58,237,.06)' : 'var(--novo-card-hover)',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleLinkService(service.id)}
                        />
                        <span style={{ flex: 1 }}>
                          <strong style={{ display: 'block', fontSize: 13 }}>{service.title}</strong>
                          <small style={{ color: 'var(--novo-muted)', fontSize: 11 }}>
                            {service.description || 'Servicio adicional'}
                          </small>
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--novo-success)', fontSize: 13 }}>
                          {money(service.price, selectedLinkProduct.currency)}
                          <small style={{ display: 'block', color: 'var(--novo-muted)', fontWeight: 500, fontSize: 10 }}>
                            {linkServiceBillingLabel(service.billingType)}
                          </small>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {selectedLinkServices.length > 0 && (
                  <p style={{ margin: '10px 0 0', fontSize: 11, color: 'var(--novo-muted)' }}>
                    Total estimado de hoy: {money(estimatedFirstPayment, selectedLinkProduct.currency)}
                  </p>
                )}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    marginTop: 12,
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--novo-border)',
                    background: 'var(--novo-card-hover)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={showOtherServices}
                    onChange={(event) => {
                      setShowOtherServices(event.target.checked);
                      setCheckout('');
                    }}
                    style={{ marginTop: 2 }}
                  />
                  <span>
                    <strong style={{ display: 'block', fontSize: 13 }}>
                      Mostrar otros servicios disponibles en el checkout
                    </strong>
                    <small style={{ color: 'var(--novo-muted)', fontSize: 11, lineHeight: 1.45 }}>
                      {showOtherServices
                        ? 'El cliente verá todos tus servicios activos y podrá agregar más además de los preseleccionados.'
                        : 'El cliente solo verá los servicios que seleccionaste arriba (ningún otro upsell).'}
                    </small>
                  </span>
                </label>
              </div>
            )}
          </>
        )}

        <button
          type="button"
          className="novo-btn novo-btn-primary"
          onClick={generateLink}
          disabled={busy || !linkProductId || !clientId || !linkPrice || clients.length === 0}
        >
          {busy ? <Loader2 size={14} style={{ animation: 'novoSpin .8s linear infinite' }} /> : <Link2 size={14} />}
          Generar y guardar link
        </button>

        {checkout && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.15)', borderRadius: 8, padding: '12px 14px', marginTop: 16 }}>
            <span style={{ flex: 1, fontSize: 12, color: 'var(--novo-success)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{checkout}</span>
            <button type="button" className="novo-btn novo-btn-ghost" style={{ padding: 6 }} onClick={() => copyText(checkout)} aria-label="Copiar" title="Copiar"><Copy size={14} /></button>
            <a href={checkout} target="_blank" rel="noreferrer" className="novo-btn novo-btn-ghost" style={{ padding: 6 }} aria-label="Abrir" title="Abrir"><ExternalLink size={14} /></a>
          </div>
        )}
      </div>

      <div className="novo-card" style={{ marginBottom: 16 }}>
        <div className="novo-grid-2" style={{ marginBottom: 0 }}>
          <SelectField label="Estado" value={filters.status} onChange={value => setFilters(current => ({ ...current, status: value }))}>
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="disabled">Desactivado</option>
            <option value="expired">Expirado</option>
            <option value="archived">Archivado</option>
            <option value="draft">Borrador</option>
          </SelectField>
          <div className="novo-field">
            <label>Buscar</label>
            <div className="novo-search" style={{ width: '100%' }}>
              <Search size={13} />
              <input
                value={filters.search}
                onChange={event => setFilters(current => ({ ...current, search: event.target.value }))}
                placeholder="Cliente, correo o producto"
              />
            </div>
          </div>
        </div>
      </div>

      <SalesLinksTable
        links={visibleLinks}
        loading={loading}
        busy={busy}
        onStatusChange={changeStatus}
        onRefresh={load}
      />
    </div>
  );
}


/* ================================
   PARTNER COMISIONES
================================ */
function PartnerCommissions() {
  const [commissions, setCommissions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [commData, subsData] = await Promise.all([
        platformApi.listCommissions({ status: statusFilter || null }),
        platformApi.listActiveSubscriptions(),
      ]);
      setCommissions(commData?.commissions || []);
      setSubscriptions(subsData?.subscriptions || []);
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const pendingTotal = commissions
    .filter(row => row.status === 'pending')
    .reduce((sum, row) => sum + Number(row.commission_amount || 0), 0);
  const paidTotal = commissions
    .filter(row => row.status === 'paid')
    .reduce((sum, row) => sum + Number(row.commission_amount || 0), 0);
  const mrr = subscriptions.reduce((sum, row) => sum + Number(row.sale_price || 0), 0);

  const filtered = commissions.filter(row => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    const client = row.partner_clients;
    return [client?.company_name, client?.name, client?.email, row.stripe_subscription_id]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(term));
  });

  return (
    <div className="novo-page">
      <div className="novo-page-header">
        <span className="kicker">TUS INGRESOS</span>
        <h1>Comisiones e ingresos</h1>
        <p>Seguimiento de comisiones y suscripciones activas de tus clientes.</p>
      </div>

      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

      <div className="novo-stats" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 16 }}>
        <div className="novo-stat">
          <div className="novo-stat-icon orange"><DollarSign size={17} /></div>
          <span className="novo-stat-label">Comisiones pendientes</span>
          <span className="novo-stat-value">{loading ? '…' : money(pendingTotal)}</span>
          <span className="novo-stat-sub">Por recibir de NOVO</span>
        </div>
        <div className="novo-stat">
          <div className="novo-stat-icon green"><CheckCircle2 size={17} /></div>
          <span className="novo-stat-label">Comisiones pagadas</span>
          <span className="novo-stat-value">{loading ? '…' : money(paidTotal)}</span>
          <span className="novo-stat-sub">{commissions.filter(row => row.status === 'paid').length} liquidadas</span>
        </div>
        <div className="novo-stat">
          <div className="novo-stat-icon purple"><Activity size={17} /></div>
          <span className="novo-stat-label">Suscripciones activas</span>
          <span className="novo-stat-value">{loading ? '…' : subscriptions.length}</span>
          <span className="novo-stat-sub">Clientes pagando</span>
        </div>
        <div className="novo-stat">
          <div className="novo-stat-icon blue"><BarChart2 size={17} /></div>
          <span className="novo-stat-label">MRR estimado</span>
          <span className="novo-stat-value">{loading ? '…' : money(mrr)}</span>
          <span className="novo-stat-sub">Suma de precios de venta</span>
        </div>
      </div>

      <div className="novo-card" style={{ marginBottom: 16 }}>
        <div className="novo-card-header">
          <div>
            <div className="novo-card-title">Suscripciones activas ({subscriptions.length})</div>
            <div className="novo-card-sub">Clientes con pago confirmado en Stripe</div>
          </div>
          <button className="novo-btn novo-btn-ghost" onClick={load} disabled={loading}><RefreshCw size={13} /></button>
        </div>
        {loading && <div className="novo-empty">Cargando…</div>}
        {!loading && subscriptions.length === 0 && <div className="novo-empty">Aún no tienes suscripciones activas.</div>}
        {!loading && subscriptions.length > 0 && (
          <table className="novo-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Precio venta</th>
                <th>Tu margen</th>
                <th>Activada</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map(row => (
                <tr key={row.id}>
                  <td>
                    <strong style={{ color: 'var(--novo-text)' }}>{row.client_name}</strong>
                    {row.client_email && <><br /><small style={{ color: 'var(--novo-muted)' }}>{row.client_email}</small></>}
                  </td>
                  <td>
                    {row.product_name}
                    <br /><small style={{ color: 'var(--novo-muted)' }}>{row.billing_interval === 'year' ? 'Anual' : 'Mensual'}</small>
                  </td>
                  <td>{money(row.sale_price, row.currency)}</td>
                  <td><span style={{ color: 'var(--novo-purple)', fontWeight: 600 }}>{money(row.partner_margin, row.currency)}</span></td>
                  <td>{formatDate(row.activated_at || row.created_at)}</td>
                  <td><Badge status={row.client_status || 'pending'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="novo-card">
        <div className="novo-card-header">
          <div>
            <div className="novo-card-title">Historial de comisiones ({filtered.length})</div>
            <div className="novo-card-sub">NOVO liquida manualmente las comisiones pendientes</div>
          </div>
        </div>
        <div className="novo-grid-2" style={{ marginBottom: 16 }}>
          <SelectField label="Estado" value={statusFilter} onChange={setStatusFilter}>
            <option value="">Todas</option>
            <option value="pending">Pendiente</option>
            <option value="paid">Pagada</option>
            <option value="cancelled">Cancelada</option>
          </SelectField>
          <div className="novo-field">
            <label>Buscar cliente</label>
            <div className="novo-search" style={{ width: '100%' }}><Search size={13} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Empresa, correo o subscription ID" /></div>
          </div>
        </div>
        {loading && <div className="novo-empty">Cargando…</div>}
        {!loading && filtered.length === 0 && <div className="novo-empty">No hay comisiones con estos filtros.</div>}
        {!loading && filtered.length > 0 && (
          <table className="novo-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Venta bruta</th>
                <th>Costo NOVO</th>
                <th>Tu comisión</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Pagada</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => {
                const client = row.partner_clients;
                return (
                  <tr key={row.id}>
                    <td>
                      <strong style={{ color: 'var(--novo-text)' }}>{client?.company_name || client?.name || '—'}</strong>
                      {client?.email && <><br /><small style={{ color: 'var(--novo-muted)' }}>{client.email}</small></>}
                    </td>
                    <td>{money(row.gross_amount, row.currency)}</td>
                    <td>{money(row.wholesale_amount, row.currency)}</td>
                    <td><span style={{ color: 'var(--novo-purple)', fontWeight: 600 }}>{money(row.commission_amount, row.currency)}</span></td>
                    <td><Badge status={row.status} /></td>
                    <td>{formatDate(row.created_at)}</td>
                    <td>{row.paid_at ? formatDate(row.paid_at) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ================================
   PARTNER SOPORTE
================================ */
const SUPPORT_STATUS_LABELS = {
  open: 'Abierto',
  in_progress: 'En progreso',
  waiting_partner: 'Esperando partner',
  resolved: 'Resuelto',
  closed: 'Cerrado',
};

const SUPPORT_PRIORITY_LABELS = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

function supportStatusBadge(status) {
  if (status === 'resolved' || status === 'closed') return 'active';
  if (status === 'in_progress' || status === 'waiting_partner') return 'pending';
  return 'pending';
}

function PartnerSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' });
  const [statusFilter, setStatusFilter] = useState('');
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await platformApi.listSupportTickets({ status: statusFilter || null });
      setTickets(data?.tickets || []);
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function openTicket(ticketId) {
    try {
      setSelectedId(ticketId);
      setDetailLoading(true);
      const data = await platformApi.getSupportTicket(ticketId);
      setDetail(data);
      setReply('');
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setDetailLoading(false);
    }
  }

  async function submitTicket() {
    if (!form.subject.trim() || !form.message.trim()) {
      setNotice({ type: 'error', text: 'Completa el asunto y el mensaje.' });
      return;
    }
    try {
      setBusy(true);
      const data = await platformApi.createSupportTicket(form);
      setNotice({ type: 'success', text: 'Ticket enviado. El equipo NOVO te responderá pronto.' });
      setShowForm(false);
      setForm({ subject: '', message: '', priority: 'medium' });
      await load();
      if (data?.ticket?.id) await openTicket(data.ticket.id);
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function sendReply() {
    if (!selectedId || !reply.trim()) return;
    try {
      setBusy(true);
      await platformApi.replySupportTicket({ ticketId: selectedId, message: reply.trim() });
      setNotice({ type: 'success', text: 'Respuesta enviada.' });
      setReply('');
      await openTicket(selectedId);
      await load();
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  const ticket = detail?.ticket;
  const messages = detail?.messages || [];
  const canReply = ticket && ticket.status !== 'closed';

  return (
    <div className="novo-page">
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="kicker">SOPORTE</span>
          <h1>Centro de ayuda</h1>
          <p>Crea tickets y conversa con el equipo de NOVO.</p>
        </div>
        <button className="novo-btn novo-btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={15} /> Nuevo ticket
        </button>
      </div>

      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

      {showForm && (
        <div className="novo-card" style={{ marginBottom: 20, border: '1px solid rgba(124,58,237,.3)' }}>
          <div className="novo-card-header">
            <div className="novo-card-title">Crear ticket de soporte</div>
            <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setShowForm(false)}><X size={14} /></button>
          </div>
          <div className="novo-grid-2" style={{ marginBottom: 14 }}>
            <NField label="Asunto *" value={form.subject} onChange={v => setForm({ ...form, subject: v })} />
            <div className="novo-field">
              <label>Prioridad</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
          <div className="novo-field" style={{ marginBottom: 14 }}>
            <label>Mensaje *</label>
            <textarea
              rows={4}
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              style={{ background: 'var(--novo-card-hover)', border: '1px solid var(--novo-border)', borderRadius: 8, padding: '9px 12px', color: 'var(--novo-text)', fontSize: 13, outline: 'none', width: '100%', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="novo-btn novo-btn-primary" onClick={submitTicket} disabled={busy}>
              {busy ? <Loader2 size={14} style={{ animation: 'novoSpin .8s linear infinite' }} /> : <Save size={14} />} Enviar ticket
            </button>
            <button className="novo-btn novo-btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedId ? '1.1fr 1fr' : '1fr', gap: 16 }}>
        <div className="novo-card">
          <div className="novo-card-header">
            <div className="novo-card-title">Mis tickets ({tickets.length})</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ fontSize: 12, padding: '6px 8px', borderRadius: 8 }}>
                <option value="">Todos</option>
                <option value="open">Abierto</option>
                <option value="in_progress">En progreso</option>
                <option value="waiting_partner">Esperando partner</option>
                <option value="resolved">Resuelto</option>
                <option value="closed">Cerrado</option>
              </select>
              <button className="novo-btn novo-btn-ghost" onClick={load} disabled={loading}><RefreshCw size={13} /></button>
            </div>
          </div>
          {loading && <div className="novo-empty">Cargando…</div>}
          {!loading && tickets.length === 0 && (
            <div className="novo-empty" style={{ padding: '48px 24px' }}>
              <LifeBuoy size={36} style={{ opacity: .2, marginBottom: 14 }} />
              <p style={{ fontWeight: 600, color: 'var(--novo-text)', marginBottom: 6 }}>No tienes tickets</p>
              <p style={{ fontSize: 13 }}>Crea uno para recibir ayuda del equipo NOVO.</p>
            </div>
          )}
          {!loading && tickets.length > 0 && (
            <table className="novo-table">
              <thead><tr><th>Asunto</th><th>Prioridad</th><th>Estado</th><th>Actualizado</th></tr></thead>
              <tbody>
                {tickets.map(t => (
                  <tr
                    key={t.id}
                    onClick={() => openTicket(t.id)}
                    style={{ cursor: 'pointer', background: selectedId === t.id ? 'rgba(124,58,237,.06)' : undefined }}
                  >
                    <td><strong style={{ color: 'var(--novo-text)' }}>{t.subject}</strong></td>
                    <td>
                      <Badge
                        status={t.priority === 'high' ? 'inactive' : t.priority === 'medium' ? 'pending' : 'active'}
                        label={SUPPORT_PRIORITY_LABELS[t.priority] || t.priority}
                      />
                    </td>
                    <td><Badge status={supportStatusBadge(t.status)} label={SUPPORT_STATUS_LABELS[t.status] || t.status} /></td>
                    <td style={{ fontSize: 12, color: 'var(--novo-muted)' }}>{formatDate(t.last_message_at || t.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedId && (
          <div className="novo-card">
            <div className="novo-card-header">
              <div>
                <div className="novo-card-title">{ticket?.subject || 'Ticket'}</div>
                <div className="novo-card-sub">
                  {ticket ? `${SUPPORT_STATUS_LABELS[ticket.status] || ticket.status} · ${SUPPORT_PRIORITY_LABELS[ticket.priority] || ticket.priority}` : 'Cargando…'}
                </div>
              </div>
              <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 8px' }} onClick={() => { setSelectedId(null); setDetail(null); }}>
                <X size={14} />
              </button>
            </div>

            {detailLoading && <div className="novo-empty">Cargando conversación…</div>}
            {!detailLoading && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 420, overflowY: 'auto', marginBottom: 14 }}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: msg.author_role === 'partner' ? 'flex-end' : 'flex-start',
                        maxWidth: '88%',
                        padding: '10px 12px',
                        borderRadius: 12,
                        background: msg.author_role === 'partner' ? 'rgba(124,58,237,.12)' : 'rgba(148,163,184,.12)',
                        border: '1px solid var(--novo-border)',
                      }}
                    >
                      <div style={{ fontSize: 11, color: 'var(--novo-muted)', marginBottom: 4 }}>
                        {msg.author_role === 'partner' ? 'Tú' : 'Soporte NOVO'} · {formatDate(msg.created_at)}
                      </div>
                      <div style={{ color: 'var(--novo-text)', whiteSpace: 'pre-wrap', fontSize: 13 }}>{msg.body}</div>
                    </div>
                  ))}
                  {messages.length === 0 && <div className="novo-empty">Sin mensajes.</div>}
                </div>

                {canReply ? (
                  <>
                    <div className="novo-field" style={{ marginBottom: 10 }}>
                      <label>Responder</label>
                      <textarea
                        rows={3}
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        placeholder="Escribe tu respuesta…"
                        style={{ background: 'var(--novo-card-hover)', border: '1px solid var(--novo-border)', borderRadius: 8, padding: '9px 12px', color: 'var(--novo-text)', fontSize: 13, outline: 'none', width: '100%', resize: 'vertical' }}
                      />
                    </div>
                    <button className="novo-btn novo-btn-primary" onClick={sendReply} disabled={busy || !reply.trim()}>
                      {busy ? <Loader2 size={14} style={{ animation: 'novoSpin .8s linear infinite' }} /> : <Save size={14} />} Enviar respuesta
                    </button>
                  </>
                ) : (
                  <div className="novo-empty">Este ticket está cerrado.</div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================
   LINKS, LOGOS Y UTILIDADES
================================ */
const LOGO_BUCKET = 'brand-assets';
const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

async function uploadLogo(file, scope) {
  if (!file) throw new Error('Selecciona una imagen.');
  if (!ALLOWED_LOGO_TYPES.includes(file.type)) throw new Error('Usa PNG, JPG, JPEG o WEBP.');
  if (file.size > MAX_LOGO_SIZE) throw new Error('La imagen no puede superar 2 MB.');

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) throw new Error('Debes iniciar sesión para subir imágenes.');

  const extension = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanScope = String(scope || 'logos').replace(/[^a-zA-Z0-9/_-]/g, '-');
  const path = `${cleanScope}/${userData.user.id}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(path, file, { cacheControl: '3600', contentType: file.type, upsert: false });

  if (uploadError) throw new Error(`No se pudo subir el logo: ${uploadError.message}`);

  const { data } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error('Supabase no devolvió la URL pública del logo.');
  return data.publicUrl;
}

function LogoField({ label, value, onChange, uploadScope = 'logos' }) {
  const [mode, setMode] = useState(value ? 'url' : 'upload');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setError('');
      const url = await uploadLogo(file, uploadScope);
      onChange(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 12, color: 'var(--novo-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Image size={13} /> {label}</label>
      <div className="pc-tabs" style={{ marginBottom: 10 }}>
        <button type="button" className={mode === 'upload' ? 'active' : ''} onClick={() => setMode('upload')}><UploadCloud size={13} /> Subir archivo</button>
        <button type="button" className={mode === 'url' ? 'active' : ''} onClick={() => setMode('url')}><Globe size={13} /> Usar URL</button>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <LogoAvatar url={value} name="Logo" size={58} />
        {mode === 'url' ? (
          <input
            style={{ flex: 1, minWidth: 240, background: 'var(--novo-card-hover)', border: '1px solid var(--novo-border)', borderRadius: 8, padding: '9px 12px', color: 'var(--novo-text)', fontSize: 13, outline: 'none' }}
            placeholder="https://empresa.com/logo.png"
            value={value || ''}
            onChange={event => { setError(''); onChange(event.target.value); }}
          />
        ) : (
          <label className="novo-btn novo-btn-secondary" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
            {uploading ? <Loader2 size={14} style={{ animation: 'novoSpin .8s linear infinite' }} /> : <UploadCloud size={14} />}
            {uploading ? 'Subiendo…' : 'Seleccionar imagen'}
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} disabled={uploading} style={{ display: 'none' }} />
          </label>
        )}
        {value && <button type="button" className="novo-btn novo-btn-ghost" onClick={() => onChange('')}><Trash2 size={13} /> Eliminar</button>}
      </div>
      <div style={{ fontSize: 11, color: error ? 'var(--novo-danger)' : 'var(--novo-muted)', marginTop: 7 }}>{error || 'PNG, JPG o WEBP. Máximo 2 MB.'}</div>
    </div>
  );
}

function LogoAvatar({ url, name = '', size = 32 }) {
  const initial = String(name || '?').trim().charAt(0).toUpperCase() || '?';
  if (url) {
    return <img src={url} alt={name || 'Logo'} style={{ width: size, height: size, borderRadius: 9, objectFit: 'cover', border: '1px solid var(--novo-border)', background: 'var(--novo-card-hover)' }} />;
  }
  return <div style={{ width: size, height: size, borderRadius: 9, display: 'grid', placeItems: 'center', flexShrink: 0, background: 'rgba(124,58,237,.15)', color: 'var(--novo-purple)', fontWeight: 700 }}>{initial}</div>;
}

function SalesLinksTable({ links, loading, admin = false, busy, onStatusChange, onRefresh }) {
  return (
    <div className="novo-card">
      <div className="novo-card-header">
        <div>
          <div className="novo-card-title">Links registrados ({links.length})</div>
          <div className="novo-card-sub">Cada fila conserva el precio y margen históricos.</div>
        </div>
        <button className="novo-btn novo-btn-ghost" onClick={onRefresh} disabled={loading}><RefreshCw size={13} /> Actualizar</button>
      </div>
      {loading && <div className="novo-empty">Cargando links…</div>}
      {!loading && links.length === 0 && <div className="novo-empty"><Link2 size={32} style={{ opacity: .2, marginBottom: 12 }} /><p>No hay links registrados.</p></div>}
      {!loading && links.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="novo-table">
            <thead>
              <tr>
                {admin && <th>Partner</th>}
                <th>Cliente</th><th>Producto</th><th>Costo</th><th>Precio</th><th>Margen</th><th>Estado</th><th>Creado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {links.map(link => (
                <tr key={link.id}>
                  {admin && <td><strong>{link.partner_name}</strong></td>}
                  <td><strong>{link.client_name}</strong><br /><small style={{ color: 'var(--novo-muted)' }}>{link.client_email || 'Sin correo'}</small></td>
                  <td>{link.product_name}<br /><small style={{ color: 'var(--novo-muted)' }}>{intervalLabel(link.billing_interval)}</small></td>
                  <td>{money(link.wholesale_price, link.currency)}</td>
                  <td><strong>{money(link.sale_price, link.currency)}</strong></td>
                  <td style={{ color: Number(link.partner_margin) >= 0 ? 'var(--novo-success)' : 'var(--novo-danger)', fontWeight: 700 }}>{money(link.partner_margin, link.currency)}</td>
                  <td><Badge status={link.status} /></td>
                  <td>{formatDate(link.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="novo-btn novo-btn-ghost" style={{ padding: 6 }} onClick={() => copyText(link.checkout_url)} disabled={!link.checkout_url} aria-label="Copiar" title="Copiar"><Copy size={14} /></button>
                      {link.checkout_url && <a className="novo-btn novo-btn-ghost" style={{ padding: 6 }} href={link.checkout_url} target="_blank" rel="noreferrer" aria-label="Abrir" title="Abrir"><ExternalLink size={14} /></a>}
                      {link.status === 'active' ? (
                        <button className="novo-btn novo-btn-ghost" style={{ padding: 6 }} onClick={() => onStatusChange(link, 'disabled')} disabled={busy} aria-label="Desactivar" title="Desactivar"><PowerOff size={14} /></button>
                      ) : link.status !== 'archived' && (
                        <button className="novo-btn novo-btn-ghost" style={{ padding: 6 }} onClick={() => onStatusChange(link, 'active')} disabled={busy} aria-label="Activar" title="Activar"><Power size={14} /></button>
                      )}
                      {link.status !== 'archived' && <button className="novo-btn novo-btn-ghost" style={{ padding: 6 }} onClick={() => onStatusChange(link, 'archived')} disabled={busy} aria-label="Archivar" title="Archivar"><Archive size={14} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, tone }) {
  const color = tone === 'success' ? 'var(--novo-success)' : tone === 'danger' ? 'var(--novo-danger)' : 'var(--novo-text)';
  return <div style={{ padding: 14, border: '1px solid var(--novo-border)', borderRadius: 10, background: 'var(--novo-card-hover)' }}><div style={{ fontSize: 11, color: 'var(--novo-muted)', marginBottom: 5 }}>{label}</div><div style={{ fontSize: 19, fontWeight: 800, color }}>{value}</div></div>;
}

function SelectField({ label, value = '', onChange, disabled = false, children }) {
  return <div className="novo-field"><label>{label}</label><select value={value} onChange={event => onChange?.(event.target.value)} disabled={disabled}>{children}</select></div>;
}

function money(value, currency = 'USD') {
  const amount = Number(value || 0);
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount); }
  catch { return `$${amount.toFixed(2)}`; }
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('es-US');
}

function intervalLabel(interval) {
  return ({ month: 'Mensual', year: 'Anual', week: 'Semanal', day: 'Diario' })[interval] || interval || '—';
}

async function copyText(value) {
  if (!value) return;
  await navigator.clipboard.writeText(value);
}

/* ================================
   SHARED COMPONENTS
================================ */
function SectionLabel({ icon: Icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--novo-border)' }}>
      <Icon size={14} style={{ color: 'var(--novo-purple)' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--novo-purple)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
}

function NField({ label, value = '', onChange, secret = false, type = 'text', placeholder = '' }) {
  return (
    <div className="novo-field">
      <label>{label}</label>
      <input type={secret ? 'password' : type} value={value} placeholder={placeholder} onChange={e => onChange?.(e.target.value)} autoComplete="off" />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--novo-muted)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--novo-text)', fontWeight: 500 }}>{String(value)}</div>
    </div>
  );
}

function InfoField(props) {
  return Info(props);
}

function Badge({ status, label }) {
  const normalized = status || 'pending';
  const cls = {
    active: 'active',
    paid: 'active',
    completed: 'active',
    approved: 'active',
    inactive: 'inactive',
    disabled: 'inactive',
    expired: 'inactive',
    archived: 'inactive',
    failed: 'inactive',
    rejected: 'inactive',
    cancelled: 'inactive',
    pending: 'pending',
    pending_review: 'pending',
    needs_changes: 'pending',
    draft: 'pending',
    open: 'pending',
  }[normalized] || 'pending';
  const defaultLabel = {
    active: 'Activo',
    inactive: 'Inactivo',
    disabled: 'Desactivado',
    expired: 'Expirado',
    archived: 'Archivado',
    pending: 'Pendiente',
    pending_review: 'En revisión',
    needs_changes: 'Requiere cambios',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    draft: 'Borrador',
    paid: 'Pagado',
    failed: 'Fallido',
    open: 'Abierto',
    cancelled: 'Cancelada',
  }[normalized] || normalized;
  return <span className={`novo-badge ${cls}`}>{label || defaultLabel}</span>;
}

function Notice({ type, text, onClose }) {
  return (
    <div className={`novo-notice ${type}`} style={{ marginBottom: 16 }}>
      {type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      <span style={{ flex: 1 }}>{text}</span>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}><X size={14} /></button>}
    </div>
  );
}