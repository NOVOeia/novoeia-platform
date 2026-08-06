export const PARTNER_CATALOG_UPDATED = 'novo:partner-catalog-updated';

export function notifyPartnerCatalogUpdated(detail = {}) {
  window.dispatchEvent(new CustomEvent(PARTNER_CATALOG_UPDATED, { detail }));
}

export function subscribePartnerCatalogUpdated(handler) {
  window.addEventListener(PARTNER_CATALOG_UPDATED, handler);
  return () => window.removeEventListener(PARTNER_CATALOG_UPDATED, handler);
}
