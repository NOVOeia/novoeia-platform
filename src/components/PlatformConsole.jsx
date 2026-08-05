import { Fragment, useEffect, useState, useCallback } from 'react';
import {
  Settings, ShieldCheck, PlugZap, CreditCard, RefreshCw, Save,
  Users, Building2, Package, CheckCircle2, AlertCircle, Plus,
  DollarSign, Activity, Link2, Copy, ExternalLink,
  Eye, Edit2, X, ArrowUpRight, Search, BarChart2,
  LifeBuoy, KeyRound, Webhook, Trash2, Globe, Phone,
  MapPin, User, FileText, Image, UploadCloud, Loader2,
  Archive, Power, PowerOff
} from 'lucide-react';
import { platformApi } from '../lib/platformApi.js';
import { supabase } from '../lib/supabase.js';
import {
  AdminResources,
  PartnerResources,
} from './ResourcesConsole.jsx';

/* ================================
   SUPER ADMIN ROUTER
================================ */
export function SuperAdminConsole({ section }) {
  if (section === 'dashboard') return <AdminDashboard />;
  if (section === 'partners') return <AdminPartners />;
  if (section === 'clients') return <AdminClients />;
  if (section === 'products') return <AdminProducts />;
  if (section === 'links') return <AdminSalesLinks />;
  if (section === 'subscriptions') return <AdminSubscriptions />;
  if (section === 'payments') return <AdminPayments />;
  if (section === 'resources') return <AdminResources />;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pd, cd, clientsData, subsData, commData] = await Promise.all([
          platformApi.listPartners().catch(() => ({ partners: [] })),
          platformApi.listCatalogProducts().catch(() => ({ products: [] })),
          platformApi.listAllClients().catch(() => ({ clients: [] })),
          platformApi.listActiveSubscriptions().catch(() => ({ subscriptions: [] })),
          platformApi.listCommissions({ status: 'pending' }).catch(() => ({ commissions: [] })),
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
      } finally { setLoading(false); }
    }
    load();
  }, []);

  const active = partners.filter(p => p.status === 'active').length;

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
          {[
            ['Supabase Auth + RLS', true],
            ['Edge Functions', true],
            ['Catálogo de productos', products.length > 0],
            ['Partners registrados', partners.length > 0],
            ['GHL OAuth', false],
            ['Stripe Checkout', activeSubs > 0],
          ].map(([label, ok]) => (
            <div key={label} className="status-row">
              <span>{label}</span>
              <Badge status={ok ? 'active' : 'pending'} label={ok ? 'Activo' : 'Pendiente'} />
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
function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', plan_name: 'partner', status: 'pending' });
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try { setLoading(true); const data = await platformApi.listPartners(); setPartners(data?.partners || []); }
    catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function savePartner() {
    try {
      setBusy(true);
      if (editMode && selected) { await platformApi.updatePartner({ ...form, id: selected.id }); setNotice({ type: 'success', text: 'Partner actualizado.' }); }
      else { await platformApi.createPartner(form); setNotice({ type: 'success', text: 'Partner creado.' }); }
      setShowForm(false); setEditMode(false); setForm({ name: '', slug: '', plan_name: 'partner', status: 'pending' }); setSelected(null); load();
    } catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setBusy(false); }
  }

  function openEdit(p) {
    setForm({ name: p.name, slug: p.slug, plan_name: p.plan_name || 'partner', status: p.status || 'pending' });
    setSelected(p); setEditMode(true); setShowForm(true);
  }

  const filtered = partners.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.slug?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="novo-page">
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><span className="kicker">GESTIÓN</span><h1>Partners</h1><p>Administra los partners del ecosistema NOVO.</p></div>
        <button className="novo-btn novo-btn-primary" onClick={() => { setShowForm(!showForm); setEditMode(false); setForm({ name: '', slug: '', plan_name: 'partner', status: 'pending' }); }}>
          <Plus size={15} /> Nuevo partner
        </button>
      </div>
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}
      {showForm && (
        <div className="novo-card" style={{ marginBottom: 20, border: '1px solid rgba(124,58,237,.3)' }}>
          <div className="novo-card-header">
            <div className="novo-card-title">{editMode ? `Editando: ${selected?.name}` : 'Crear nuevo partner'}</div>
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
            <button className="novo-btn novo-btn-primary" onClick={savePartner} disabled={busy}><Save size={14} /> {editMode ? 'Actualizar' : 'Crear partner'}</button>
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
              {filtered.map(p => (
                <Fragment key={p.id}>
                  <tr>
                    <td><strong style={{ color: 'var(--novo-text)' }}>{p.name}</strong><br /><small style={{ color: 'var(--novo-muted)', fontSize: 11 }}>/{p.slug}</small></td>
                    <td>{p.plan_name || 'Partner'}</td>
                    <td style={{ fontSize: 12, color: 'var(--novo-muted)' }}>{p.ghl_location_id || 'Sin asignar'}</td>
                    <td><Badge status={p.status || 'pending'} /></td>
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
                            <Info label="Owner" value={p.owner_user_id ? p.owner_user_id.slice(0,8)+'…' : 'Sin vincular'} />
                            <Info label="GHL Location" value={p.ghl_location_id || 'Sin asignar'} />
                            <Info label="Creado" value={new Date(p.created_at).toLocaleDateString()} />
                          </div>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button className="novo-btn novo-btn-primary" onClick={() => openEdit(p)}><Edit2 size={13} /> Editar partner</button>
                            <button className="novo-btn novo-btn-secondary"><Eye size={13} /> Ver panel partner</button>
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
  const [filters, setFilters] = useState({ partnerId: '', status: '' });
  const [formPartnerId, setFormPartnerId] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [partnersData, clientsData] = await Promise.all([
        platformApi.listPartners(),
        platformApi.listAllClients({
          partnerId: filters.partnerId || null,
          status: filters.status || null,
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
  }, [filters.partnerId, filters.status]);

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
        <div className="novo-grid-3" style={{ marginBottom: 0 }}>
          <SelectField label="Filtrar por Partner" value={filters.partnerId} onChange={value => setFilters(current => ({ ...current, partnerId: value }))}>
            <option value="">Todos los Partners</option>
            {partners.map(partner => <option key={partner.id} value={partner.id}>{partner.name}</option>)}
          </SelectField>
          <SelectField label="Estado" value={filters.status} onChange={value => setFilters(current => ({ ...current, status: value }))}>
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="cancelled">Cancelado</option>
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
            <thead><tr><th>Empresa</th><th>Partner</th><th>Contacto</th><th>Ubicación</th><th>Estado</th><th>Creado</th></tr></thead>
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
                  <td>{formatDate(client.created_at)}</td>
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
  const [form, setForm] = useState({ name: '', description: '', wholesalePrice: '', suggestedPrice: '', interval: 'month', stripeProductId: '', stripePriceId: '', active: true });

  const load = useCallback(async () => {
    try { setLoading(true); const data = await platformApi.listCatalogProducts(); setProducts(data?.products || []); }
    catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openEdit(p) {
    setForm({ name: p.name, description: p.description || '', wholesalePrice: p.wholesale_price, suggestedPrice: p.suggested_price || '', interval: p.interval || 'month', stripeProductId: p.stripe_product_id || '', stripePriceId: p.stripe_price_id || '', active: p.active !== false });
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
        <div><span className="kicker">CATÁLOGO</span><h1>Productos</h1><p>Catálogo central conectado con Stripe.</p></div>
        <button className="novo-btn novo-btn-primary" onClick={() => { setForm({ name: '', description: '', wholesalePrice: '', suggestedPrice: '', interval: 'month', stripeProductId: '', stripePriceId: '', active: true }); setEditItem(null); setShowForm(true); }}><Plus size={15} /> Nuevo producto</button>
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
            <NField label="Descripción" value={form.description} onChange={v => setForm({ ...form, description: v })} />
            <NField label="Costo mayorista (USD)" type="number" value={form.wholesalePrice} onChange={v => setForm({ ...form, wholesalePrice: v })} />
            <NField label="Precio sugerido (USD)" type="number" value={form.suggestedPrice} onChange={v => setForm({ ...form, suggestedPrice: v })} />
            <div className="novo-field">
              <label>Intervalo</label>
              <select value={form.interval} onChange={e => setForm({ ...form, interval: e.target.value })}>
                <option value="month">Mensual</option>
                <option value="year">Anual</option>
              </select>
            </div>
            <div className="novo-field">
              <label>Estado</label>
              <select value={String(form.active)} onChange={e => setForm({ ...form, active: e.target.value === 'true' })}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
            <NField label="Stripe Product ID" value={form.stripeProductId} onChange={v => setForm({ ...form, stripeProductId: v })} />
            <NField label="Stripe Price ID" value={form.stripePriceId} onChange={v => setForm({ ...form, stripePriceId: v })} />
          </div>
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
            <thead><tr><th>Producto</th><th>Intervalo</th><th>Mayorista</th><th>Sugerido</th><th>Stripe</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td><strong style={{ color: 'var(--novo-text)' }}>{p.name}</strong>{p.description && <><br /><small style={{ color: 'var(--novo-muted)', fontSize: 11 }}>{p.description}</small></>}</td>
                  <td style={{ textTransform: 'capitalize' }}>{p.interval}</td>
                  <td><span style={{ color: 'var(--novo-success)', fontWeight: 600 }}>${p.wholesale_price}</span></td>
                  <td><span style={{ color: 'var(--novo-purple)' }}>${p.suggested_price || '—'}</span></td>
                  <td>{p.stripe_product_id ? <span style={{ color: 'var(--novo-success)', fontSize: 11 }}>✓ Vinculado</span> : <span style={{ color: 'var(--novo-muted)', fontSize: 11 }}>Sin vincular</span>}</td>
                  <td><Badge status={p.active ? 'active' : 'inactive'} /></td>
                  <td><button className="novo-btn novo-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => openEdit(p)}><Edit2 size={12} /> Editar</button></td>
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
function AdminPayments() {
  const [keys, setKeys] = useState({ stripeSecretKey: '', stripeWebhookSecret: '' });
  const [commissions, setCommissions] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [filters, setFilters] = useState({ partnerId: '', status: 'pending' });

  const loadCommissions = useCallback(async () => {
    try {
      setLoading(true);
      const [commData, partnersData] = await Promise.all([
        platformApi.listCommissions({
          partnerId: filters.partnerId || null,
          status: filters.status || null,
        }),
        platformApi.listPartners(),
      ]);
      setCommissions(commData?.commissions || []);
      setPartners(partnersData?.partners || []);
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }, [filters.partnerId, filters.status]);

  useEffect(() => { loadCommissions(); }, [loadCommissions]);

  async function save() {
    try { setBusy(true); await platformApi.saveIntegrationSettings(keys); setNotice({ type: 'success', text: 'Claves guardadas.' }); }
    catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setBusy(false); }
  }

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

  const pendingTotal = commissions
    .filter(row => row.status === 'pending')
    .reduce((sum, row) => sum + Number(row.commission_amount || 0), 0);

  return (
    <div className="novo-page">
      <div className="novo-page-header"><span className="kicker">FINANZAS</span><h1>Pagos y comisiones</h1><p>Comisiones de partners y configuración Stripe.</p></div>
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

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
                return (
                  <tr key={row.id}>
                    <td><strong style={{ color: 'var(--novo-text)' }}>{row.partners?.name || '—'}</strong></td>
                    <td>{client?.company_name || client?.name || '—'}<br /><small style={{ color: 'var(--novo-muted)' }}>{client?.email || '—'}</small></td>
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

      <div className="novo-card">
        <div className="novo-card-header"><div><div className="novo-card-title">Configuración Stripe</div><div className="novo-card-sub">Claves para procesar pagos</div></div><Badge status="pending" label="Pendiente" /></div>
        <div className="novo-grid-2">
          <NField label="Secret key" secret value={keys.stripeSecretKey} onChange={v => setKeys({ ...keys, stripeSecretKey: v })} />
          <NField label="Webhook secret" secret value={keys.stripeWebhookSecret} onChange={v => setKeys({ ...keys, stripeWebhookSecret: v })} />
        </div>
        <button className="novo-btn novo-btn-primary" onClick={save} disabled={busy}><Save size={14} /> Guardar</button>
      </div>
    </div>
  );
}

/* ================================
   ADMIN CONFIGURACIÓN
================================ */
function AdminSettings() {
  const [tab, setTab] = useState('ghl');
  const [settings, setSettings] = useState({ ghlClientId: '', ghlClientSecret: '', ghlRedirectUri: '', ghlScopes: '', stripeSecretKey: '', stripeWebhookSecret: '', supabaseServiceRoleKey: '', webhookBaseUrl: '' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  async function save() {
    try { setBusy(true); await platformApi.saveIntegrationSettings(settings); setNotice({ type: 'success', text: 'Configuración guardada.' }); }
    catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setBusy(false); }
  }

  async function connectGhl() {
    try { setBusy(true); const data = await platformApi.startGhlOAuth(); if (!data?.authorizationUrl) throw new Error('No se recibió URL.'); window.location.href = data.authorizationUrl; }
    catch (e) { setNotice({ type: 'error', text: e.message }); setBusy(false); }
  }

  const tabs = [['ghl','HighLevel',PlugZap],['stripe','Stripe',CreditCard],['supabase','Supabase',ShieldCheck],['webhooks','Webhooks',Webhook],['security','Seguridad',KeyRound]];

  return (
    <div className="novo-page">
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><span className="kicker">SISTEMA</span><h1>Configuración</h1><p>Conexiones, integraciones y seguridad.</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="novo-btn novo-btn-secondary" onClick={() => platformApi.syncGhlLocations().catch(()=>{})} disabled={busy}><RefreshCw size={14} /> Sync GHL</button>
          <button className="novo-btn novo-btn-primary" onClick={save} disabled={busy}><Save size={14} /> Guardar todo</button>
        </div>
      </div>
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}
      <div className="pc-tabs" style={{ marginBottom: 20 }}>
        {tabs.map(([id,label,Icon]) => <button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><Icon size={13}/> {label}</button>)}
      </div>
      {tab==='ghl' && (
        <div className="novo-card">
          <div className="novo-card-header"><div><div className="novo-card-title">HighLevel OAuth</div><div className="novo-card-sub">Conexión principal con GoHighLevel</div></div><button className="novo-btn novo-btn-primary" onClick={connectGhl} disabled={busy}><PlugZap size={14}/> Conectar OAuth</button></div>
          <div className="novo-grid-2">
            <NField label="Client ID" value={settings.ghlClientId} onChange={v=>setSettings({...settings,ghlClientId:v})} />
            <NField label="Client Secret" secret value={settings.ghlClientSecret} onChange={v=>setSettings({...settings,ghlClientSecret:v})} />
            <NField label="Redirect URI" value={settings.ghlRedirectUri} onChange={v=>setSettings({...settings,ghlRedirectUri:v})} />
            <NField label="Scopes" value={settings.ghlScopes} onChange={v=>setSettings({...settings,ghlScopes:v})} />
          </div>
        </div>
      )}
      {tab==='stripe' && (
        <div className="novo-card">
          <div className="novo-card-header"><div><div className="novo-card-title">Stripe</div></div><Badge status="pending" label="Pendiente"/></div>
          <div className="novo-grid-2">
            <NField label="Secret key" secret value={settings.stripeSecretKey} onChange={v=>setSettings({...settings,stripeSecretKey:v})} />
            <NField label="Webhook secret" secret value={settings.stripeWebhookSecret} onChange={v=>setSettings({...settings,stripeWebhookSecret:v})} />
          </div>
        </div>
      )}
      {tab==='supabase' && (<div className="novo-card"><div className="novo-card-header"><div className="novo-card-title">Supabase</div></div><NField label="Service role key" secret value={settings.supabaseServiceRoleKey} onChange={v=>setSettings({...settings,supabaseServiceRoleKey:v})} /></div>)}
      {tab==='webhooks' && (<div className="novo-card"><div className="novo-card-header"><div className="novo-card-title">Webhooks</div></div><NField label="Webhook base URL" value={settings.webhookBaseUrl} onChange={v=>setSettings({...settings,webhookBaseUrl:v})} /></div>)}
      {tab==='security' && (
        <div className="novo-card">
          <div className="novo-card-header"><div className="novo-card-title">Checklist de seguridad</div></div>
          {[['Supabase Auth con roles',true],['RLS en todas las tablas',true],['Secretos en Edge Functions',true],['OAuth con refresh token',true],['Webhooks con firma Ed25519',true],['Variables de entorno en Netlify',false],['Stripe webhook conectado',false],['GHL OAuth configurado',false]].map(([label,ok])=>(
            <div key={label} className="status-row">
              {ok?<CheckCircle2 size={15} style={{color:'var(--novo-success)',flexShrink:0}}/>:<AlertCircle size={15} style={{color:'var(--novo-warning)',flexShrink:0}}/>}
              <span style={{fontSize:13}}>{label}</span>
              <Badge status={ok?'active':'pending'} label={ok?'OK':'Pendiente'} />
            </div>
          ))}
        </div>
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
export function PartnerConsole({ section }) {
  if (section === 'dashboard') return <PartnerDashboard />;
  if (section === 'clients')   return <PartnerClients />;
  if (section === 'offers')    return <PartnerOffers />;
  if (section === 'links')     return <PartnerLinks />;
  if (section === 'commissions') return <PartnerCommissions />;
  if (section === 'resources') return <PartnerResources />;
  if (section === 'brand')     return <PartnerBrand />;
  if (section === 'support')   return <PartnerSupport />;
  return <PartnerDashboard />;
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
          {!loading && catalog.map(p => (
            <div key={p.id} className="status-row">
              <span style={{ color: 'var(--novo-text)', fontWeight: 500 }}>{p.name}</span>
              <span style={{ color: 'var(--novo-success)', fontSize: 13 }}>${p.wholesale_price}/{p.interval}</span>
            </div>
          ))}
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
   PARTNER OFERTAS
================================ */
function PartnerOffers() {
  const [catalog, setCatalog] = useState([]);
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [clientId, setClientId] = useState('');
  const [price, setPrice] = useState('');
  const [checkout, setCheckout] = useState('');
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([platformApi.listCatalog(), platformApi.listPartnerClients()])
      .then(([catalogData, clientsData]) => {
        setCatalog(catalogData?.products || []);
        setClients(clientsData?.clients || []);
      })
      .catch(error => setNotice({ type: 'error', text: error.message }))
      .finally(() => setLoading(false));
  }, []);

  const selectedClient = clients.find(client => client.id === clientId);
  const margin = selected && price ? Number(price) - Number(selected.wholesale_price || 0) : 0;

  async function generate() {
    if (!selected) {
      setNotice({ type: 'error', text: 'Selecciona un producto.' });
      return;
    }
    if (!clientId) {
      setNotice({ type: 'error', text: 'Selecciona el cliente al que pertenece este link.' });
      return;
    }
    if (!price || Number(price) <= 0) {
      setNotice({ type: 'error', text: 'Define un precio de venta válido.' });
      return;
    }
    if (Number(price) < Number(selected.wholesale_price)) {
      setNotice({ type: 'error', text: 'El precio no puede ser menor al costo mayorista.' });
      return;
    }

    try {
      setBusy(true);
      const data = await platformApi.generateCheckoutLink({
        productId: selected.id,
        clientId,
        clientEmail: selectedClient?.email || null,
        retailPrice: Number(price),
      });
      setCheckout(data.checkoutUrl || '');
      setNotice({
        type: 'success',
        text: `Link guardado para ${selectedClient?.company_name || selectedClient?.name}. Ya aparece en Links de venta.`,
      });
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="novo-page">
      <div className="novo-page-header">
        <span className="kicker">CATÁLOGO NOVO</span>
        <h1>Productos y ofertas</h1>
        <p>Selecciona producto, cliente y precio. El link quedará guardado automáticamente.</p>
      </div>
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

      {loading && <div className="novo-card"><div className="novo-empty">Cargando catálogo y clientes…</div></div>}
      {!loading && clients.length === 0 && (
        <div className="novo-notice error" style={{ marginBottom: 16 }}>
          <AlertCircle size={15} />
          <span>No tienes clientes registrados. Crea un cliente antes de generar un link de venta.</span>
        </div>
      )}

      {!loading && (
        <div className="novo-grid-2" style={{ marginBottom: 16 }}>
          {catalog.length === 0 && <div className="novo-empty" style={{ gridColumn: '1/-1' }}>El Super Admin aún no ha publicado productos.</div>}
          {catalog.map(product => (
            <button
              type="button"
              key={product.id}
              className="novo-card"
              style={{ cursor: 'pointer', textAlign: 'left', border: selected?.id === product.id ? '1px solid #7C3AED' : '1px solid var(--novo-card-border)', background: selected?.id === product.id ? 'rgba(124,58,237,.08)' : 'var(--novo-card)', transition: 'all .18s' }}
              onClick={() => { setSelected(product); setPrice(String(product.suggested_price || '')); setCheckout(''); }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--novo-text)', marginBottom: 4 }}>{product.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--novo-muted)', textTransform: 'capitalize' }}>{product.billing_type} · {product.interval}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--novo-success)', fontWeight: 700, fontSize: 18 }}>{money(product.wholesale_price, product.currency)}</div>
                  <div style={{ fontSize: 11, color: 'var(--novo-muted)' }}>costo mayorista</div>
                </div>
              </div>
              {selected?.id === product.id && <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(124,58,237,.2)', fontSize: 12, color: 'var(--novo-purple)' }}>✓ Producto seleccionado</div>}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="novo-card">
          <div className="novo-card-header">
            <div>
              <div className="novo-card-title">Configurar oferta — {selected.name}</div>
              <div className="novo-card-sub">El cliente seleccionado quedará asociado permanentemente al link.</div>
            </div>
          </div>

          <div className="novo-grid-2" style={{ marginBottom: 16 }}>
            <SelectField label="Cliente *" value={clientId} onChange={value => { setClientId(value); setCheckout(''); }} disabled={clients.length === 0}>
              <option value="">Selecciona un cliente</option>
              {clients.map(client => <option key={client.id} value={client.id}>{client.company_name || client.name}{client.email ? ` — ${client.email}` : ''}</option>)}
            </SelectField>
            <NField label="Precio de venta (USD) *" type="number" value={price} onChange={value => { setPrice(value); setCheckout(''); }} />
          </div>

          <div className="novo-grid-3" style={{ marginBottom: 16 }}>
            <Metric label="Costo mayorista" value={money(selected.wholesale_price, selected.currency)} />
            <Metric label="Precio al cliente" value={money(price || 0, selected.currency)} />
            <Metric label="Tu ganancia estimada" value={money(margin, selected.currency)} tone={margin >= 0 ? 'success' : 'danger'} />
          </div>

          <button className="novo-btn novo-btn-primary" onClick={generate} disabled={busy || !clientId || !price || clients.length === 0}>
            {busy ? <Loader2 size={14} style={{ animation: 'novoSpin .8s linear infinite' }} /> : <Link2 size={14} />} Generar y guardar link
          </button>

          {checkout && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.15)', borderRadius: 8, padding: '12px 14px', marginTop: 16 }}>
              <span style={{ flex: 1, fontSize: 12, color: 'var(--novo-success)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{checkout}</span>
              <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => copyText(checkout)}><Copy size={12} /> Copiar</button>
              <a href={checkout} target="_blank" rel="noreferrer" className="novo-btn novo-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}><ExternalLink size={12} /> Abrir</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================
   PARTNER LINKS
================================ */
function PartnerLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [filters, setFilters] = useState({ status: '', search: '' });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await platformApi.listSalesLinks();
      setLinks(data?.links || []);
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(link, status) {
    try {
      setBusy(true);
      await platformApi.updateSalesLinkStatus(link.id, status);
      setNotice({ type: 'success', text: status === 'active' ? 'Link reactivado.' : status === 'disabled' ? 'Link desactivado.' : 'Link archivado.' });
      await load();
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
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
        <p>Historial real de links, clientes, productos, precios y estados.</p>
      </div>

      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

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
            <div className="novo-search" style={{ width: '100%' }}><Search size={13} /><input value={filters.search} onChange={e => setFilters(current => ({ ...current, search: e.target.value }))} placeholder="Cliente, correo o producto" /></div>
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
   PARTNER MARCA
================================ */
function PartnerBrand() {
  const [form, setForm] = useState({ name: '', domain: '', logoUrl: '', primaryColor: '', metaPixelId: '', facebookUrl: '', instagramUrl: '', tiktokUrl: '' });
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    try {
      setBusy(true);
      await platformApi.savePartnerBranding(form);
      setNotice({ type: 'success', text: 'Marca guardada.' });
    } catch (e) {
      setNotice({ type: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="novo-page">
      <div className="novo-page-header"><span className="kicker">IDENTIDAD</span><h1>Marca y redes</h1><p>Configura tu identidad en el ecosistema NOVO.</p></div>
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}
      <div className="novo-card">
        <div className="novo-card-header"><div className="novo-card-title">Configuración permitida</div></div>
        <LogoField label="Logo del Partner" value={form.logoUrl} onChange={logoUrl => setForm(current => ({ ...current, logoUrl }))} uploadScope="partners" />
        <div className="novo-grid-2">
          <NField label="Nombre comercial" value={form.name} onChange={value => setForm(current => ({ ...current, name: value }))} />
          <NField label="Dominio" value={form.domain} onChange={value => setForm(current => ({ ...current, domain: value }))} />
          <NField label="Color principal" value={form.primaryColor} onChange={value => setForm(current => ({ ...current, primaryColor: value }))} />
          <NField label="Meta Pixel ID" value={form.metaPixelId} onChange={value => setForm(current => ({ ...current, metaPixelId: value }))} />
          <NField label="Facebook URL" value={form.facebookUrl} onChange={value => setForm(current => ({ ...current, facebookUrl: value }))} />
          <NField label="Instagram URL" value={form.instagramUrl} onChange={value => setForm(current => ({ ...current, instagramUrl: value }))} />
          <NField label="TikTok URL" value={form.tiktokUrl} onChange={value => setForm(current => ({ ...current, tiktokUrl: value }))} />
        </div>
        <button className="novo-btn novo-btn-primary" onClick={save} disabled={busy}>
          {busy ? <Loader2 size={14} style={{ animation: 'novoSpin .8s linear infinite' }} /> : <Save size={14} />} Guardar marca
        </button>
        <p style={{ fontSize: 11, color: 'var(--novo-muted)', marginTop: 10 }}>Las conexiones GHL, pagos y permisos avanzados solo los administra el Super Admin.</p>
      </div>
    </div>
  );
}

/* ================================
   PARTNER SOPORTE
================================ */
function PartnerSupport() {
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' });
  const [notice, setNotice] = useState(null);

  function submitTicket() {
    if (!form.subject || !form.message) { setNotice({ type: 'error', text: 'Completa el asunto y el mensaje.' }); return; }
    setTickets(t => [{ id: Date.now(), ...form, status: 'open', created_at: new Date().toISOString() }, ...t]);
    setNotice({ type: 'success', text: 'Ticket enviado. Te responderemos pronto.' });
    setShowForm(false);
    setForm({ subject: '', message: '', priority: 'medium' });
  }

  return (
    <div className="novo-page">
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><span className="kicker">SOPORTE</span><h1>Centro de ayuda</h1><p>Soporte directo para partners del ecosistema NOVO.</p></div>
        <button className="novo-btn novo-btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Nuevo ticket</button>
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
            <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
              style={{ background: 'var(--novo-card-hover)', border: '1px solid var(--novo-border)', borderRadius: 8, padding: '9px 12px', color: 'var(--novo-text)', fontSize: 13, outline: 'none', width: '100%', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="novo-btn novo-btn-primary" onClick={submitTicket}><Save size={14} /> Enviar ticket</button>
            <button className="novo-btn novo-btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="novo-card">
        <div className="novo-card-header"><div className="novo-card-title">Mis tickets ({tickets.length})</div></div>
        {tickets.length === 0 ? (
          <div className="novo-empty" style={{ padding: '48px 24px' }}>
            <LifeBuoy size={36} style={{ opacity: .2, marginBottom: 14 }} />
            <p style={{ fontWeight: 600, color: 'var(--novo-text)', marginBottom: 6 }}>No tienes tickets abiertos</p>
            <p style={{ fontSize: 13 }}>Para soporte directo: <strong style={{ color: 'var(--novo-purple)' }}>clients@novoeia.com</strong></p>
          </div>
        ) : (
          <table className="novo-table">
            <thead><tr><th>Asunto</th><th>Prioridad</th><th>Estado</th><th>Fecha</th></tr></thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id}>
                  <td><strong style={{ color: 'var(--novo-text)' }}>{t.subject}</strong><br /><small style={{ color: 'var(--novo-muted)', fontSize: 11 }}>{t.message.slice(0, 60)}…</small></td>
                  <td><Badge status={t.priority === 'high' ? 'inactive' : t.priority === 'medium' ? 'pending' : 'active'} label={t.priority === 'high' ? 'Alta' : t.priority === 'medium' ? 'Media' : 'Baja'} /></td>
                  <td><Badge status="pending" label="Abierto" /></td>
                  <td style={{ fontSize: 12, color: 'var(--novo-muted)' }}>{new Date(t.created_at).toLocaleDateString()}</td>
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
                      <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => copyText(link.checkout_url)} disabled={!link.checkout_url}><Copy size={12} /> Copiar</button>
                      {link.checkout_url && <a className="novo-btn novo-btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} href={link.checkout_url} target="_blank" rel="noreferrer"><ExternalLink size={12} /> Abrir</a>}
                      {link.status === 'active' ? (
                        <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => onStatusChange(link, 'disabled')} disabled={busy}><PowerOff size={12} /> Desactivar</button>
                      ) : link.status !== 'archived' && (
                        <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => onStatusChange(link, 'active')} disabled={busy}><Power size={12} /> Activar</button>
                      )}
                      {link.status !== 'archived' && <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => onStatusChange(link, 'archived')} disabled={busy}><Archive size={12} /> Archivar</button>}
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

function NField({ label, value = '', onChange, secret = false, type = 'text' }) {
  return (
    <div className="novo-field">
      <label>{label}</label>
      <input type={secret ? 'password' : type} value={value} onChange={e => onChange?.(e.target.value)} autoComplete="off" />
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

function Badge({ status, label }) {
  const normalized = status || 'pending';
  const cls = {
    active: 'active',
    paid: 'active',
    completed: 'active',
    inactive: 'inactive',
    disabled: 'inactive',
    expired: 'inactive',
    archived: 'inactive',
    failed: 'inactive',
    pending: 'pending',
    draft: 'pending',
    open: 'pending',
  }[normalized] || 'pending';
  const defaultLabel = {
    active: 'Activo', inactive: 'Inactivo', disabled: 'Desactivado', expired: 'Expirado', archived: 'Archivado',
    pending: 'Pendiente', draft: 'Borrador', paid: 'Pagado', failed: 'Fallido', open: 'Abierto',
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