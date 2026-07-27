import { supabase } from './supabase.js';

async function invoke(functionName, body = {}) {
  const { data, error } = await supabase.functions.invoke(functionName, { body });
  if (error) throw new Error(error.message || 'Error de conexión');
  if (data?.error) throw new Error(data.error);
  return data;
}

export const platformApi = {
  getSession: () => supabase.auth.getSession(),
  signOut: () => supabase.auth.signOut(),

  async getPlatformSettings() {
    const { data, error } = await supabase
      .from('platform_settings_public')
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  saveIntegrationSettings(payload) {
    return invoke('platform-admin', { action: 'saveIntegrationSettings', payload });
  },

  testIntegration(provider) {
    return invoke('platform-admin', { action: 'testIntegration', provider });
  },

  startGhlOAuth() {
    return invoke('ghl-oauth', { action: 'authorize' });
  },

  syncGhlLocations() {
    return invoke('ghl-proxy', { action: 'syncLocations' });
  },

  listPartners() {
    return invoke('platform-admin', { action: 'listPartners' });
  },

  createPartner(payload) {
    return invoke('platform-admin', { action: 'createPartner', payload });
  },

  updatePartner(payload) {
    return invoke('platform-admin', { action: 'updatePartner', payload });
  },

  listCatalog() {
    return invoke('partner-commerce', { action: 'listCatalog' });
  },

  savePartnerOffer(payload) {
    return invoke('partner-commerce', { action: 'saveOffer', payload });
  },

  generateCheckoutLink(payload) {
    return invoke('partner-commerce', { action: 'generateCheckoutLink', payload });
  },

  listPartnerClients() {
    return invoke('partner-commerce', { action: 'listClients' });
  },

  savePartnerBranding(payload) {
    return invoke('partner-commerce', { action: 'saveBranding', payload });
  },
};
