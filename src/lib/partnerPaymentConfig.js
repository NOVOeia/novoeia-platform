/** Partner payment activation — rules & options extracted from Modulo de pagos.html */
export const PAYMENT_COUNTRIES = [
  ['US', 'Estados Unidos'],
  ['CA', 'Canadá'],
  ['MX', 'México'],
  ['CO', 'Colombia'],
  ['EC', 'Ecuador'],
  ['PE', 'Perú'],
  ['AR', 'Argentina'],
  ['CL', 'Chile'],
  ['BR', 'Brasil'],
  ['UY', 'Uruguay'],
  ['CR', 'Costa Rica'],
  ['PA', 'Panamá'],
  ['DO', 'República Dominicana'],
  ['ES', 'España'],
  ['PT', 'Portugal'],
  ['FR', 'Francia'],
  ['DE', 'Alemania'],
  ['IT', 'Italia'],
  ['GB', 'Reino Unido'],
  ['OTHER', 'Otro país'],
];

export const AIRWALLEX_CONNECTED_COUNTRIES = new Set([
  'US', 'CA', 'CO', 'EC', 'PE', 'AR', 'CL', 'UY', 'MX', 'BR', 'CR', 'ES', 'PT', 'FR', 'DE', 'IT', 'GB',
]);

export const AIRWALLEX_STANDARD_BUSINESS_COUNTRIES = new Set([
  'US', 'CA', 'MX', 'BR', 'CR', 'ES', 'PT', 'FR', 'DE', 'IT', 'GB',
]);

export const WISE_UNSUPPORTED = new Set([
  'AF', 'BY', 'BI', 'CF', 'TD', 'CG', 'CD', 'CU', 'ER', 'IR', 'IQ', 'KP', 'LY', 'MM', 'SO', 'SS', 'RU', 'SD', 'SY', 'VE', 'YE',
]);

export const LOCAL_METHODS = {
  US: {
    name: 'Zelle',
    label: 'Email o teléfono asociado a Zelle',
    placeholder: 'Ej. pagos@empresa.com',
    description: 'Opcional. Lo conservaremos como información local de respaldo.',
  },
  CO: {
    name: 'Nequi',
    label: 'Número asociado a Nequi',
    placeholder: 'Ej. +57 300 000 0000',
    description: 'Opcional. Puedes registrar tu Nequi como información adicional.',
  },
  MX: {
    name: 'CLABE',
    label: 'CLABE interbancaria',
    placeholder: '18 dígitos',
    description: 'Dato bancario utilizado frecuentemente para transferencias locales en México.',
  },
  AR: {
    name: 'Alias / CBU',
    label: 'Alias o CBU',
    placeholder: 'Alias o CBU',
    description: 'Información bancaria local adicional de Argentina.',
  },
  BR: {
    name: 'PIX',
    label: 'Clave PIX',
    placeholder: 'Email, teléfono, CPF/CNPJ o clave PIX',
    description: 'Opcional. Información local de pagos en Brasil.',
  },
};

export const PROVIDER_INFO = {
  airwallex: {
    title: 'Airwallex',
    points: [
      'Cuenta financiera internacional compatible con liquidaciones NOVO.',
      'Puedes administrar fondos, monedas y retiros posteriores desde Airwallex.',
      'Los costos posteriores de conversión o retiro son responsabilidad del Partner.',
    ],
  },
  wise: {
    title: 'Wise',
    points: [
      'Puedes recibir en una cuenta Wise o usarla como vía hacia tu banco de respaldo.',
      'Identificación vía Wisetag, email, teléfono o datos del destinatario.',
      'Las tarifas dependen de moneda, conversión, país y ruta.',
    ],
  },
  usbank: {
    title: 'Cuenta bancaria USA',
    points: [
      'Disponible si tienes una cuenta bancaria válida en Estados Unidos.',
      'Datos: banco, titular, routing/ABA, número y tipo de cuenta (Zelle opcional).',
      'NOVO no añade un cargo adicional por esta vía.',
    ],
  },
};

export const STEP_LABELS = [
  { step: 1, title: 'Perfil', subtitle: 'Titular y residencia' },
  { step: 2, title: 'Banco respaldo', subtitle: 'Cuenta de respaldo' },
  { step: 3, title: 'Método de pago', subtitle: 'Dónde recibir' },
  { step: 4, title: 'Revisión', subtitle: 'Confirmar y enviar' },
];

export const EMPTY_WIZARD_STATE = {
  currentStep: 1,
  selectedProvider: '',
  selectedWiseDestination: '',
  accountCreationStatus: '',
  paymentMethodConfirmed: false,
  submitted: false,
  airwallexEmail: '',
  airwallexAccountId: '',
  wiseEmail: '',
  wiseTag: '',
  wisePhone: '',
};

export const EMPTY_LEGAL_PROFILE = {
  firstName: '',
  lastName: '',
  partnerType: '',
  country: '',
  email: '',
  phone: '',
  companyLegalName: '',
  taxId: '',
};

export const EMPTY_BACKUP_BANK = {
  bankCountry: '',
  bankName: '',
  bankHolder: '',
  bankType: '',
  bankAccount: '',
  bankSwift: '',
  mainBankRouting: '',
  mainBankIban: '',
  localPaymentId: '',
};

export const EMPTY_US_BANK = {
  usBankName: '',
  usBankHolder: '',
  usBankRouting: '',
  usBankAccount: '',
  usBankType: '',
  usBankZelle: '',
};

export function getProviderRules({ country, partnerType, hasUSBank }) {
  const airwallexViaConnectedAccount = AIRWALLEX_CONNECTED_COUNTRIES.has(country);
  const airwallexViaBusinessAccount =
    partnerType === 'company' && AIRWALLEX_STANDARD_BUSINESS_COUNTRIES.has(country);
  const airwallexEnabled = airwallexViaConnectedAccount || airwallexViaBusinessAccount;
  const wiseEnabled = Boolean(country) && country !== 'OTHER' && !WISE_UNSUPPORTED.has(country);
  const usBankEnabled = Boolean(hasUSBank);

  let recommended = '';
  if (usBankEnabled) recommended = 'usbank';
  else if (airwallexEnabled) recommended = 'airwallex';
  else if (wiseEnabled) recommended = 'wise';

  return {
    country,
    type: partnerType,
    recommended,
    airwallex: {
      enabled: airwallexEnabled,
      mode: airwallexViaConnectedAccount
        ? 'CONNECTED_ACCOUNT'
        : airwallexViaBusinessAccount
          ? 'BUSINESS_ACCOUNT'
          : null,
      reason: 'Airwallex no está habilitado actualmente para este perfil.',
    },
    wise: {
      enabled: wiseEnabled,
      reason: 'Wise no está habilitado actualmente para esta ubicación.',
    },
    usbank: {
      enabled: usBankEnabled,
      reason: 'Esta opción se habilita cuando indicas que tienes una cuenta bancaria en Estados Unidos.',
    },
  };
}

export function paymentRouteFromSelection(provider, wiseDestination) {
  if (provider === 'airwallex') return 'AIRWALLEX_ACCOUNT';
  if (provider === 'usbank') return 'USA_BANK';
  if (provider === 'wise') {
    return wiseDestination === 'bank' ? 'WISE_BANK' : 'WISE_ACCOUNT';
  }
  return null;
}

export function countryLabel(code) {
  const hit = PAYMENT_COUNTRIES.find(([value]) => value === code);
  return hit ? hit[1] : code || '—';
}

export function canEditProfile(status) {
  return !status || ['draft', 'rejected', 'needs_changes'].includes(status);
}

export function statusLabel(status) {
  const map = {
    draft: 'Borrador',
    pending_review: 'En revisión',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    needs_changes: 'Requiere cambios',
  };
  return map[status] || status || 'Sin configurar';
}
