import { ExternalLink } from 'lucide-react';

const PARTNER_CENTER_URL = '/forms/NOVO_Partner_Center.html';

export default function PartnerRegistrationEmbed() {
  function openNewTab() {
    window.open(PARTNER_CENTER_URL, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="novo-page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <span className="kicker">PARTNER NOVO</span>
          <h1>Partner Center</h1>
          <p>Guía operativa, SOP, centro financiero y ruta para vender como partner.</p>
        </div>
        <button type="button" className="novo-btn novo-btn-secondary" onClick={openNewTab}>
          <ExternalLink size={14} /> Abrir en pestaña nueva
        </button>
      </div>

      <div
        className="novo-card"
        style={{
          flex: 1,
          minHeight: 0,
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <iframe
          title="NOVO Partner Center"
          src={PARTNER_CENTER_URL}
          style={{
            border: 'none',
            width: '100%',
            flex: 1,
            minHeight: '72vh',
            background: '#f6fbff',
          }}
        />
      </div>
    </div>
  );
}
