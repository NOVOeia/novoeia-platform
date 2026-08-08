export const COUNTRIES = [
  'Estados Unidos',
  'Colombia',
  'México',
  'España',
  'Argentina',
  'Chile',
  'Perú',
  'Ecuador',
  'República Dominicana',
  'Panamá',
  'Costa Rica',
  'Puerto Rico',
  'Otro',
];

export const ACTIVITIES = [
  { id: 'activity1', value: 'marketing', icon: '📣', label: 'Agencia de marketing' },
  { id: 'activity2', value: 'consultant', icon: '💼', label: 'Consultor / Freelancer' },
  { id: 'activity3', value: 'automation', icon: '⚡', label: 'Automatización / IA' },
  { id: 'activity4', value: 'technology', icon: '💻', label: 'Web / Tecnología' },
  { id: 'activity5', value: 'sales', icon: '📈', label: 'Ventas / Servicios' },
  { id: 'activity6', value: 'starting', icon: '🚀', label: 'Estoy comenzando' },
];

export const GOALS = [
  { id: 'goal1', value: 'crm', icon: '👥', label: 'Ofrecer CRM a clientes' },
  { id: 'goal2', value: 'automation', icon: '⚙️', label: 'Vender automatizaciones' },
  { id: 'goal3', value: 'services', icon: '🧩', label: 'Vender servicios alrededor del CRM' },
  { id: 'goal4', value: 'recurring', icon: '♻️', label: 'Crear ingresos recurrentes' },
  { id: 'goal5', value: 'current-clients', icon: '🤝', label: 'Implementarlo con clientes actuales' },
  { id: 'goal6', value: 'new-business', icon: '🚀', label: 'Crear una nueva línea de negocio' },
];

export const STEP_NAV = [
  { title: 'Sobre ti', subtitle: 'Datos básicos' },
  { title: 'Tu negocio', subtitle: 'Perfil y experiencia' },
  { title: 'Tu objetivo', subtitle: 'Cómo usarás NOVO' },
  { title: 'Confirmación', subtitle: 'Reglas y acceso' },
];

export const STEP_CONTENT = [
  {
    title: 'Empecemos por conocerte',
    subtitle: 'Información básica para crear tu perfil dentro de NOVO Partners.',
    short: 'Sobre ti',
  },
  {
    title: 'Cuéntanos sobre tu negocio',
    subtitle: 'Queremos entender tu experiencia y el tipo de actividad que desarrollas.',
    short: 'Tu negocio',
  },
  {
    title: '¿Cómo quieres utilizar NOVO?',
    subtitle: 'Define tus objetivos comerciales y el tipo de clientes que quieres atender.',
    short: 'Tu objetivo',
  },
  {
    title: 'Confirma tu registro',
    subtitle: 'Revisa las reglas principales del Programa y crea tu acceso.',
    short: 'Confirmación',
  },
];

export const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  partnerType: '',
  businessName: '',
  website: '',
  social: '',
  activity: '',
  hasClients: '',
  clientCount: 'Aún no tengo clientes',
  crmExperience: '',
  ghlExperience: '',
  experienceLevel: 'Estoy comenzando',
  goals: [],
  targetClients: 'Empresas en crecimiento',
  targetMarket: '',
  estimatedClients: '1 - 5',
  source: 'Redes sociales',
  referralCode: '',
  password: '',
  confirmPassword: '',
  truth: false,
  terms: false,
  fees: false,
  privacy: false,
};
