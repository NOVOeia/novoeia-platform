import { useEffect } from 'react';
import termsBody from '../../content/partnerTermsBody.html?raw';
import privacyBody from '../../content/partnerPrivacyBody.html?raw';

function LegalModal({ open, title, kicker, bodyHtml, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay show"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <div>
            <small>{kicker}</small>
            <h3>{title}</h3>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>
        <div className="modal-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

export function PartnerTermsModal({ open, onClose }) {
  return (
    <LegalModal
      open={open}
      kicker="NOVO Partners"
      title="Términos y Condiciones"
      bodyHtml={termsBody}
      onClose={onClose}
    />
  );
}

export function PartnerPrivacyModal({ open, onClose }) {
  return (
    <LegalModal
      open={open}
      kicker="NOVO Partners"
      title="Política de Privacidad"
      bodyHtml={privacyBody}
      onClose={onClose}
    />
  );
}
