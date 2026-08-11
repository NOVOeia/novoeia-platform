import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Mail, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { platformApi } from '../lib/platformApi.js';
import {
  CUSTOM_TEMPLATE_VARIABLE_OPTIONS,
  EMAIL_TEMPLATE_CATALOG,
  renderEmailTemplate,
  slugifyTemplateId,
} from '../lib/emailTemplateDefaults.js';

function Notice({ type, text, onClose }) {
  return (
    <div className={`novo-notice ${type}`} style={{ marginBottom: 16 }}>
      <span>{text}</span>
      {onClose && <button type="button" onClick={onClose}>×</button>}
    </div>
  );
}

function Badge({ status, label }) {
  return <span className={`novo-badge ${status}`}>{label}</span>;
}

const SAMPLE_VARIABLES = {
  fullName: 'Daniel Cortés',
  email: 'partner@ejemplo.com',
  companyName: 'Agencia Nova',
  clientName: 'Cliente Demo S.A.S.',
  clientEmail: 'cliente@ejemplo.com',
  productName: 'Plan Profesional',
  amount: '199.00',
  currency: 'USD',
  commission: '49.00',
  partnerName: 'Agencia Nova',
  loginUrl: 'https://app.tudominio.com/#login',
  dashboardUrl: 'https://app.tudominio.com/#partner-dashboard/dashboard',
  resetUrl: 'https://app.tudominio.com/#reset-password?token=ejemplo',
  expiresIn: '60 minutos',
  supportEmail: 'soporte@novoeia.com',
  appName: 'NOVO Partners',
};

const EMPTY_CREATE = {
  name: '',
  description: '',
  trigger: 'manual',
  variables: ['fullName', 'email', 'appName'],
  subject: 'Asunto de {{appName}}',
  html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#16181d;max-width:560px;margin:0 auto;padding:24px">
<h2 style="margin:0 0 12px">Hola {{fullName}}</h2>
<p>Escribe aquí el contenido de tu plantilla.</p>
<p style="color:#737b8b;font-size:12px;margin-top:24px">— {{appName}}</p>
</div>`,
  enabled: true,
};

function templatesPayload(templates) {
  return Object.fromEntries(
    templates.map((item) => [
      item.id,
      {
        subject: item.subject,
        html: item.html,
        enabled: item.enabled !== false,
        ...(item.custom
          ? {
              custom: true,
              name: item.name,
              description: item.description,
              trigger: item.trigger || 'manual',
              variables: item.variables || ['fullName', 'email', 'appName'],
            }
          : {}),
      },
    ]),
  );
}

export default function AdminEmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState(EMAIL_TEMPLATE_CATALOG[0]?.id || '');
  const [draft, setDraft] = useState({ subject: '', html: '', enabled: true, name: '', description: '', trigger: 'manual', variables: [] });
  const [preview, setPreview] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [testTo, setTestTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const selectedMeta = useMemo(
    () => templates.find((item) => item.id === selectedId) || null,
    [templates, selectedId],
  );

  function applySelection(rows, id) {
    const nextId = id && rows.some((row) => row.id === id) ? id : rows[0]?.id || '';
    const item = rows.find((row) => row.id === nextId);
    setSelectedId(nextId);
    if (item) {
      setDraft({
        subject: item.subject || '',
        html: item.html || '',
        enabled: item.enabled !== false,
        name: item.name || '',
        description: item.description || '',
        trigger: item.trigger || 'manual',
        variables: item.variables || [],
      });
    }
    setPreview(false);
    return nextId;
  }

  function selectTemplate(id) {
    applySelection(templates, id);
  }

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await platformApi.getEmailTemplates();
      const rows = data?.templates || [];
      setTemplates(rows);
      if (rows.length > 0) {
        setSelectedId((current) => {
          const nextId = current && rows.some((row) => row.id === current) ? current : rows[0].id;
          const item = rows.find((row) => row.id === nextId);
          if (item) {
            setDraft({
              subject: item.subject || '',
              html: item.html || '',
              enabled: item.enabled !== false,
              name: item.name || '',
              description: item.description || '',
              trigger: item.trigger || 'manual',
              variables: item.variables || [],
            });
          }
          setPreview(false);
          return nextId;
        });
      }
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
    setTemplates((current) => current.map((item) => (
      item.id === selectedId ? { ...item, [field]: value } : item
    )));
  }

  function toggleCreateVariable(variable) {
    setCreateForm((current) => {
      const exists = current.variables.includes(variable);
      return {
        ...current,
        variables: exists
          ? current.variables.filter((item) => item !== variable)
          : [...current.variables, variable],
      };
    });
  }

  async function saveAll(nextTemplates = templates, deleteIds = [], selectId = selectedId) {
    const data = await platformApi.saveEmailTemplates(templatesPayload(nextTemplates), deleteIds);
    const rows = data?.templates || nextTemplates;
    setTemplates(rows);
    applySelection(rows, selectId);
    return rows;
  }

  async function handleSave() {
    try {
      setBusy(true);
      await saveAll();
      setNotice({ type: 'success', text: 'Plantillas guardadas.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function createTemplate() {
    const name = createForm.name.trim();
    if (!name) {
      setNotice({ type: 'error', text: 'Indica un nombre para la plantilla.' });
      return;
    }
    if (!createForm.subject.trim() || !createForm.html.trim()) {
      setNotice({ type: 'error', text: 'Completa asunto y cuerpo HTML.' });
      return;
    }

    const id = slugifyTemplateId(name);
    const next = {
      id,
      custom: true,
      name,
      description: createForm.description.trim() || 'Plantilla personalizada',
      trigger: createForm.trigger.trim() || 'manual',
      variables: createForm.variables.length ? createForm.variables : ['fullName', 'email', 'appName'],
      subject: createForm.subject,
      html: createForm.html,
      enabled: createForm.enabled !== false,
    };

    try {
      setBusy(true);
      const rows = [...templates, next];
      await saveAll(rows, [], id);
      setShowCreate(false);
      setCreateForm(EMPTY_CREATE);
      setNotice({ type: 'success', text: `Plantilla “${name}” creada.` });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function deleteSelected() {
    if (!selectedMeta?.custom) return;
    if (!window.confirm(`¿Eliminar la plantilla “${selectedMeta.name}”?`)) return;
    try {
      setBusy(true);
      const remaining = templates.filter((item) => item.id !== selectedMeta.id);
      await saveAll(remaining, [selectedMeta.id], remaining[0]?.id || '');
      setNotice({ type: 'success', text: 'Plantilla eliminada.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    try {
      setBusy(true);
      await saveAll();
      await platformApi.sendTemplateTestEmail(selectedId, testTo.trim() || null);
      setNotice({ type: 'success', text: `Correo de prueba enviado (${selectedMeta?.name}).` });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  const previewSubject = renderEmailTemplate(draft.subject, SAMPLE_VARIABLES);
  const previewHtml = renderEmailTemplate(draft.html, SAMPLE_VARIABLES);

  return (
    <div className="novo-page">
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="kicker">COMUNICACIÓN</span>
          <h1>Plantillas de email</h1>
          <p>Edita los correos automáticos del sistema o crea plantillas nuevas. Usa variables como <code>{'{{fullName}}'}</code>.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="novo-btn novo-btn-ghost" onClick={load} disabled={loading || busy}>
            <RefreshCw size={14} />
          </button>
          <button type="button" className="novo-btn novo-btn-secondary" onClick={() => setShowCreate(true)} disabled={busy || loading}>
            <Plus size={14} /> Nueva plantilla
          </button>
          <button type="button" className="novo-btn novo-btn-primary" onClick={handleSave} disabled={busy || loading}>
            <Save size={14} /> Guardar plantillas
          </button>
        </div>
      </div>

      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}
      {loading && <div className="novo-empty">Cargando plantillas…</div>}

      {showCreate && (
        <div className="novo-card" style={{ marginBottom: 16, border: '1px solid rgba(124,58,237,.3)' }}>
          <div className="novo-card-header">
            <div>
              <div className="novo-card-title">Crear plantilla</div>
              <div className="novo-card-sub">Las plantillas personalizadas se pueden editar, probar y eliminar.</div>
            </div>
            <button type="button" className="novo-btn novo-btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setShowCreate(false)}>
              <X size={14} />
            </button>
          </div>

          <div className="novo-grid-2" style={{ marginBottom: 12 }}>
            <div className="novo-field">
              <label>Nombre *</label>
              <input
                className="novo-input"
                value={createForm.name}
                onChange={(e) => setCreateForm((current) => ({ ...current, name: e.target.value }))}
                placeholder="Ej. Recordatorio de onboarding"
              />
            </div>
            <div className="novo-field">
              <label>Trigger / uso</label>
              <input
                className="novo-input"
                value={createForm.trigger}
                onChange={(e) => setCreateForm((current) => ({ ...current, trigger: e.target.value }))}
                placeholder="manual, campaign.reminder, etc."
              />
            </div>
          </div>

          <div className="novo-field" style={{ marginBottom: 12 }}>
            <label>Descripción</label>
            <input
              className="novo-input"
              value={createForm.description}
              onChange={(e) => setCreateForm((current) => ({ ...current, description: e.target.value }))}
              placeholder="Para qué se usará esta plantilla"
            />
          </div>

          <div className="novo-field" style={{ marginBottom: 12 }}>
            <label>Variables disponibles</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CUSTOM_TEMPLATE_VARIABLE_OPTIONS.map((variable) => {
                const active = createForm.variables.includes(variable);
                return (
                  <button
                    key={variable}
                    type="button"
                    className={`novo-btn ${active ? 'novo-btn-primary' : 'novo-btn-ghost'}`}
                    style={{ padding: '4px 10px', fontSize: 11 }}
                    onClick={() => toggleCreateVariable(variable)}
                  >
                    {`{{${variable}}}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="novo-field" style={{ marginBottom: 12 }}>
            <label>Asunto *</label>
            <input
              className="novo-input"
              value={createForm.subject}
              onChange={(e) => setCreateForm((current) => ({ ...current, subject: e.target.value }))}
            />
          </div>

          <div className="novo-field" style={{ marginBottom: 12 }}>
            <label>Cuerpo HTML *</label>
            <textarea
              className="novo-input"
              rows={10}
              value={createForm.html}
              onChange={(e) => setCreateForm((current) => ({ ...current, html: e.target.value }))}
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 14 }}>
            <input
              type="checkbox"
              checked={createForm.enabled}
              onChange={(e) => setCreateForm((current) => ({ ...current, enabled: e.target.checked }))}
            />
            Activar plantilla al crearla
          </label>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="novo-btn novo-btn-primary" onClick={createTemplate} disabled={busy}>
              {busy ? 'Creando…' : <><Plus size={14} /> Crear plantilla</>}
            </button>
            <button type="button" className="novo-btn novo-btn-ghost" onClick={() => setShowCreate(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, alignItems: 'start' }}>
          <div className="novo-card" style={{ padding: 0, overflow: 'hidden' }}>
            {templates.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTemplate(item.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px 16px',
                  border: 'none',
                  borderBottom: '1px solid var(--novo-border)',
                  background: selectedId === item.id ? 'rgba(124,58,237,.08)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <strong style={{ color: 'var(--novo-text)', fontSize: 13 }}>{item.name}</strong>
                  <Badge status={item.enabled ? 'active' : 'pending'} label={item.enabled ? 'On' : 'Off'} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--novo-muted)', marginTop: 4 }}>
                  {item.custom ? 'Personalizada · ' : ''}{item.trigger}
                </div>
              </button>
            ))}
          </div>

          <div className="novo-card">
            {selectedMeta && (
              <>
                <div className="novo-card-header">
                  <div>
                    <div className="novo-card-title">{selectedMeta.name}</div>
                    <div className="novo-card-sub">{selectedMeta.description}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {selectedMeta.custom && (
                      <button type="button" className="novo-btn novo-btn-ghost" onClick={deleteSelected} disabled={busy}>
                        <Trash2 size={14} /> Eliminar
                      </button>
                    )}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <input
                        type="checkbox"
                        checked={draft.enabled}
                        onChange={(e) => updateDraft('enabled', e.target.checked)}
                      />
                      Activa
                    </label>
                  </div>
                </div>

                {selectedMeta.custom && (
                  <div className="novo-grid-2" style={{ marginBottom: 12 }}>
                    <div className="novo-field">
                      <label>Nombre</label>
                      <input className="novo-input" value={draft.name} onChange={(e) => updateDraft('name', e.target.value)} />
                    </div>
                    <div className="novo-field">
                      <label>Trigger</label>
                      <input className="novo-input" value={draft.trigger} onChange={(e) => updateDraft('trigger', e.target.value)} />
                    </div>
                    <div className="novo-field" style={{ gridColumn: '1 / -1' }}>
                      <label>Descripción</label>
                      <input className="novo-input" value={draft.description} onChange={(e) => updateDraft('description', e.target.value)} />
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: 'var(--novo-muted)', marginBottom: 8 }}>
                    Variables disponibles:{' '}
                    {(selectedMeta.variables || []).map((v) => (
                      <code key={v} style={{ marginRight: 6 }}>{`{{${v}}}`}</code>
                    ))}
                  </div>
                </div>

                <div className="novo-field" style={{ marginBottom: 12 }}>
                  <label>Asunto</label>
                  <input
                    className="novo-input"
                    value={draft.subject}
                    onChange={(e) => updateDraft('subject', e.target.value)}
                  />
                </div>

                <div className="novo-field" style={{ marginBottom: 16 }}>
                  <label>Cuerpo HTML</label>
                  <textarea
                    className="novo-input"
                    rows={14}
                    value={draft.html}
                    onChange={(e) => updateDraft('html', e.target.value)}
                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                  <button type="button" className="novo-btn novo-btn-ghost" onClick={() => setPreview((current) => !current)}>
                    <Eye size={14} /> {preview ? 'Ocultar preview' : 'Vista previa'}
                  </button>
                  <input
                    className="novo-input"
                    style={{ maxWidth: 260 }}
                    placeholder="Email de prueba (opcional)"
                    value={testTo}
                    onChange={(e) => setTestTo(e.target.value)}
                  />
                  <button type="button" className="novo-btn novo-btn-secondary" onClick={sendTest} disabled={busy}>
                    <Mail size={14} /> Enviar prueba
                  </button>
                </div>

                {preview && (
                  <div style={{ border: '1px solid var(--novo-border)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', background: 'rgba(124,58,237,.06)', fontSize: 13 }}>
                      <strong>Asunto:</strong> {previewSubject}
                    </div>
                    <div
                      style={{ padding: 16, background: '#fff' }}
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
