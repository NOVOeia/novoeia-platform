import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Mail, RefreshCw, Save } from 'lucide-react';
import { platformApi } from '../lib/platformApi.js';
import {
  PARTNER_CLIENT_EMAIL_CATALOG,
  listPartnerClientTemplatesForUi,
  renderPartnerEmailTemplate,
} from '../lib/partnerEmailTemplateDefaults.js';

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
  clientName: 'Cliente Demo S.A.S.',
  clientEmail: 'cliente@ejemplo.com',
  productName: 'Plan Profesional',
  amount: '199.00',
  currency: 'USD',
  partnerName: 'Agencia Nova',
  supportEmail: 'contacto@agencianova.com',
};

export default function PartnerEmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [emailSettings, setEmailSettings] = useState({ fromName: '', replyTo: '' });
  const [selectedId, setSelectedId] = useState(PARTNER_CLIENT_EMAIL_CATALOG[0]?.id || '');
  const [draft, setDraft] = useState({ subject: '', html: '', enabled: true });
  const [preview, setPreview] = useState(false);
  const [testTo, setTestTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const selectedMeta = useMemo(
    () => templates.find(item => item.id === selectedId)
      || PARTNER_CLIENT_EMAIL_CATALOG.find(item => item.id === selectedId),
    [templates, selectedId],
  );

  function selectTemplate(id) {
    const item = templates.find(row => row.id === id);
    setSelectedId(id);
    if (item) {
      setDraft({
        subject: item.subject || '',
        html: item.html || '',
        enabled: item.enabled !== false,
      });
      setPreview(false);
    }
  }

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await platformApi.getPartnerEmailTemplates();
      const rows = (data?.templates?.length
        ? data.templates
        : listPartnerClientTemplatesForUi());
      setTemplates(rows);
      setEmailSettings({
        fromName: data?.emailSettings?.fromName || '',
        replyTo: data?.emailSettings?.replyTo || '',
      });
      if (rows.length > 0) {
        setSelectedId(current => {
          const nextId = current && rows.some(row => row.id === current) ? current : rows[0].id;
          const item = rows.find(row => row.id === nextId);
          if (item) {
            setDraft({
              subject: item.subject || '',
              html: item.html || '',
              enabled: item.enabled !== false,
            });
          }
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
    setDraft(current => ({ ...current, [field]: value }));
    setTemplates(current => current.map(item => (
      item.id === selectedId ? { ...item, [field]: value } : item
    )));
  }

  function buildPayload() {
    return {
      emailSettings,
      templates: Object.fromEntries(
        templates.map(item => [item.id, {
          subject: item.subject,
          html: item.html,
          enabled: item.enabled !== false,
        }]),
      ),
    };
  }

  async function saveAll() {
    try {
      setBusy(true);
      await platformApi.savePartnerEmailTemplates(buildPayload());
      setNotice({ type: 'success', text: 'Plantillas y remitente guardados.' });
      await load();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    try {
      setBusy(true);
      await platformApi.savePartnerEmailTemplates(buildPayload());
      await platformApi.sendPartnerEmailTemplateTest(selectedId, testTo.trim() || null);
      setNotice({ type: 'success', text: `Correo de prueba enviado (${selectedMeta?.name}).` });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  const previewVariables = {
    ...SAMPLE_VARIABLES,
    partnerName: emailSettings.fromName || SAMPLE_VARIABLES.partnerName,
    supportEmail: emailSettings.replyTo || SAMPLE_VARIABLES.supportEmail,
  };
  const previewSubject = renderPartnerEmailTemplate(draft.subject, previewVariables);
  const previewHtml = renderPartnerEmailTemplate(draft.html, previewVariables);

  return (
    <div className="novo-page">
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="kicker">COMUNICACIÓN CON CLIENTES</span>
          <h1>Emails a clientes</h1>
          <p>
            Personaliza los correos que reciben tus clientes. Se envían con tu nombre como remitente
            y tu email como respuesta.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="novo-btn novo-btn-ghost" onClick={load} disabled={loading || busy}>
            <RefreshCw size={14} />
          </button>
          <button type="button" className="novo-btn novo-btn-primary" onClick={saveAll} disabled={busy || loading}>
            <Save size={14} /> Guardar
          </button>
        </div>
      </div>

      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}
      {loading && <div className="novo-empty">Cargando plantillas…</div>}

      {!loading && (
        <>
          <div className="novo-card" style={{ marginBottom: 16 }}>
            <div className="novo-card-header">
              <div>
                <div className="novo-card-title">Remitente visible</div>
                <div className="novo-card-sub">
                  El correo sale desde la infraestructura NOVO, pero el cliente lo ve como si fuera tuyo.
                </div>
              </div>
            </div>
            <div className="novo-grid-2">
              <div className="novo-field">
                <label>Nombre del remitente</label>
                <input
                  className="novo-input"
                  placeholder="Ej. Agencia Nova"
                  value={emailSettings.fromName}
                  onChange={e => setEmailSettings(current => ({ ...current, fromName: e.target.value }))}
                />
              </div>
              <div className="novo-field">
                <label>Responder a (Reply-To)</label>
                <input
                  className="novo-input"
                  type="email"
                  placeholder="contacto@tuagencia.com"
                  value={emailSettings.replyTo}
                  onChange={e => setEmailSettings(current => ({ ...current, replyTo: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, alignItems: 'start' }}>
            <div className="novo-card" style={{ padding: 0, overflow: 'hidden' }}>
              {templates.map(item => (
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
                  <div style={{ fontSize: 11, color: 'var(--novo-muted)', marginTop: 4 }}>{item.trigger}</div>
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
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <input
                        type="checkbox"
                        checked={draft.enabled}
                        onChange={e => updateDraft('enabled', e.target.checked)}
                      />
                      Activa
                    </label>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--novo-muted)', marginBottom: 8 }}>
                      Variables disponibles:{' '}
                      {(selectedMeta.variables || []).map(v => (
                        <code key={v} style={{ marginRight: 6 }}>{'{{' + v + '}}'}</code>
                      ))}
                    </div>
                  </div>

                  <div className="novo-field" style={{ marginBottom: 12 }}>
                    <label>Asunto</label>
                    <input
                      className="novo-input"
                      value={draft.subject}
                      onChange={e => updateDraft('subject', e.target.value)}
                    />
                  </div>

                  <div className="novo-field" style={{ marginBottom: 16 }}>
                    <label>Cuerpo HTML</label>
                    <textarea
                      className="novo-input"
                      rows={14}
                      value={draft.html}
                      onChange={e => updateDraft('html', e.target.value)}
                      style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                    <button type="button" className="novo-btn novo-btn-ghost" onClick={() => setPreview(current => !current)}>
                      <Eye size={14} /> {preview ? 'Ocultar preview' : 'Vista previa'}
                    </button>
                    <input
                      className="novo-input"
                      style={{ maxWidth: 260 }}
                      placeholder="Email de prueba (opcional)"
                      value={testTo}
                      onChange={e => setTestTo(e.target.value)}
                    />
                    <button type="button" className="novo-btn novo-btn-secondary" onClick={sendTest} disabled={busy}>
                      <Mail size={14} /> Enviar prueba
                    </button>
                  </div>

                  {preview && (
                    <div style={{ border: '1px solid var(--novo-border)', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: '10px 14px', background: 'rgba(124,58,237,.06)', fontSize: 13 }}>
                        <strong>De:</strong> {emailSettings.fromName || 'Tu agencia'}
                        {emailSettings.replyTo && (
                          <span style={{ color: 'var(--novo-muted)' }}> · Reply-To: {emailSettings.replyTo}</span>
                        )}
                        <br />
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
        </>
      )}
    </div>
  );
}
