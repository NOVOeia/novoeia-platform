/** Shared helpers for partner payment profile payloads. */

export const PAYMENT_PROFILE_STATUSES = [
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'needs_changes',
] as const;

export type PaymentProfileStatus = typeof PAYMENT_PROFILE_STATUSES[number];

export const PAYMENT_ROUTES = [
  'AIRWALLEX_ACCOUNT',
  'WISE_ACCOUNT',
  'WISE_BANK',
  'USA_BANK',
] as const;

export function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function paymentRouteFromSelection(
  provider: string,
  wiseDestination?: string,
): string | null {
  if (provider === 'airwallex') return 'AIRWALLEX_ACCOUNT';
  if (provider === 'usbank') return 'USA_BANK';
  if (provider === 'wise') {
    return wiseDestination === 'bank' ? 'WISE_BANK' : 'WISE_ACCOUNT';
  }
  return null;
}

export function buildPaymentProfilePatch(payload: Record<string, unknown>) {
  const legal = asObject(payload.legal_profile ?? payload.legalProfile);
  const backup = asObject(payload.backup_bank ?? payload.backupBank);
  const usBank = asObject(payload.us_bank ?? payload.usBank);
  const providerDetails = asObject(payload.provider_details ?? payload.providerDetails);
  const wizardState = asObject(payload.wizard_state ?? payload.wizardState);

  const selectedProvider = String(
    wizardState.selectedProvider || payload.selectedProvider || '',
  );
  const wiseDestination = String(
    wizardState.selectedWiseDestination || payload.selectedWiseDestination || '',
  );

  const paymentRoute = payload.payment_route
    || payload.paymentRoute
    || paymentRouteFromSelection(selectedProvider, wiseDestination);

  return {
    legal_profile: legal,
    backup_bank: backup,
    has_us_bank: Boolean(payload.has_us_bank ?? payload.hasUSBank),
    us_bank: usBank,
    payment_route: paymentRoute || null,
    provider_details: providerDetails,
    wizard_state: {
      ...wizardState,
      selectedProvider: selectedProvider || wizardState.selectedProvider || '',
      selectedWiseDestination: wiseDestination || wizardState.selectedWiseDestination || '',
    },
  };
}

export function validatePaymentProfileForSubmit(row: {
  legal_profile?: Record<string, unknown>;
  backup_bank?: Record<string, unknown>;
  has_us_bank?: boolean;
  us_bank?: Record<string, unknown>;
  payment_route?: string | null;
  wizard_state?: Record<string, unknown>;
}) {
  const legal = asObject(row.legal_profile);
  const backup = asObject(row.backup_bank);
  const usBank = asObject(row.us_bank);
  const wizard = asObject(row.wizard_state);

  if (!String(legal.firstName || '').trim()) throw new Error('PAYMENT_PROFILE_FIRST_NAME_REQUIRED');
  if (!String(legal.lastName || '').trim()) throw new Error('PAYMENT_PROFILE_LAST_NAME_REQUIRED');
  if (!String(legal.partnerType || '').trim()) throw new Error('PAYMENT_PROFILE_TYPE_REQUIRED');
  if (!String(legal.country || '').trim()) throw new Error('PAYMENT_PROFILE_COUNTRY_REQUIRED');
  if (!String(legal.email || '').trim()) throw new Error('PAYMENT_PROFILE_EMAIL_REQUIRED');

  if (!String(backup.bankCountry || '').trim()) throw new Error('PAYMENT_PROFILE_BANK_COUNTRY_REQUIRED');
  if (!String(backup.bankName || '').trim()) throw new Error('PAYMENT_PROFILE_BANK_NAME_REQUIRED');
  if (!String(backup.bankHolder || '').trim()) throw new Error('PAYMENT_PROFILE_BANK_HOLDER_REQUIRED');
  if (!String(backup.bankAccount || '').trim()) throw new Error('PAYMENT_PROFILE_BANK_ACCOUNT_REQUIRED');

  const provider = String(wizard.selectedProvider || '');
  if (!provider) throw new Error('PAYMENT_PROFILE_PROVIDER_REQUIRED');

  if (provider === 'wise' && !String(wizard.selectedWiseDestination || '').trim()) {
    throw new Error('PAYMENT_PROFILE_WISE_DESTINATION_REQUIRED');
  }

  if (provider === 'usbank' || row.has_us_bank) {
    if (provider === 'usbank') {
      if (!String(usBank.usBankName || '').trim()) throw new Error('PAYMENT_PROFILE_US_BANK_NAME_REQUIRED');
      if (!String(usBank.usBankHolder || '').trim()) throw new Error('PAYMENT_PROFILE_US_BANK_HOLDER_REQUIRED');
      if (!String(usBank.usBankRouting || '').trim()) throw new Error('PAYMENT_PROFILE_US_BANK_ROUTING_REQUIRED');
      if (!String(usBank.usBankAccount || '').trim()) throw new Error('PAYMENT_PROFILE_US_BANK_ACCOUNT_REQUIRED');
    }
  }

  if (!wizard.paymentMethodConfirmed && wizard.finalConfirmation !== true) {
    // final confirmation is checked at submit time from payload
  }

  if (!row.payment_route) throw new Error('PAYMENT_PROFILE_ROUTE_REQUIRED');
}
