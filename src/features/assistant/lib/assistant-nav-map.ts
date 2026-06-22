import { ROUTES } from '@/config/routes';

/**
 * Maps an assistant `[NAV:token]` to a real web route + an i18n label key.
 *
 * The live chatbot currently drives project creation via `<<WIZARD_STAGE>>` markers
 * rather than `[NAV:…]` deep links, so this is forward-compatible scaffolding: if a
 * reply *does* carry a nav token we turn it into a real in-app link, and anything we
 * don't recognise degrades to plain text (no broken links — the user's chosen
 * behaviour). Only routes that actually exist in {@link ROUTES} are mapped; RN
 * targets with no web equivalent (room designer, voice AI, small tasks, …) are
 * intentionally absent. Synonyms collapse onto one label key.
 */
export type NavTarget = { href: string; labelKey: string };

const NAV_TARGETS: Record<string, NavTarget> = {
  // Projects
  projects: { href: ROUTES.DASHBOARD_PROJECTS, labelKey: 'assistant.nav.projects' },
  myprojects: { href: ROUTES.DASHBOARD_PROJECTS, labelKey: 'assistant.nav.projects' },
  allprojects: { href: ROUTES.DASHBOARD_PROJECTS, labelKey: 'assistant.nav.projects' },
  projectlist: { href: ROUTES.DASHBOARD_PROJECTS, labelKey: 'assistant.nav.projects' },
  projectsdetail: { href: ROUTES.DASHBOARD_PROJECTS, labelKey: 'assistant.nav.projects' },
  projectsmap: { href: ROUTES.DASHBOARD_PROJECTS_MAP, labelKey: 'assistant.nav.projectsMap' },

  // Project creation
  newproject: { href: ROUTES.DASHBOARD_PROJECTS_CREATE, labelKey: 'assistant.nav.createProject' },
  createproject: {
    href: ROUTES.DASHBOARD_PROJECTS_CREATE,
    labelKey: 'assistant.nav.createProject',
  },
  manualproject: { href: ROUTES.DASHBOARD_PROJECTS_NEW, labelKey: 'assistant.nav.createProject' },
  newprojectmanual: {
    href: ROUTES.DASHBOARD_PROJECTS_NEW,
    labelKey: 'assistant.nav.createProject',
  },
  aiproject: { href: ROUTES.DASHBOARD_PROJECTS_CREATE_AI, labelKey: 'assistant.nav.aiProject' },
  aiform: { href: ROUTES.DASHBOARD_PROJECTS_CREATE_AI, labelKey: 'assistant.nav.aiProject' },
  sketch: { href: ROUTES.DASHBOARD_PROJECTS_CREATE_SKETCH, labelKey: 'assistant.nav.sketch' },
  smartdesign: { href: ROUTES.DASHBOARD_PROJECTS_CREATE_SKETCH, labelKey: 'assistant.nav.sketch' },

  // Account / settings hub + sections
  settings: { href: ROUTES.DASHBOARD_SETTINGS, labelKey: 'assistant.nav.settings' },
  profile: { href: ROUTES.DASHBOARD_SETTINGS_PROFILE, labelKey: 'assistant.nav.profile' },
  editprofile: { href: ROUTES.DASHBOARD_SETTINGS_PROFILE, labelKey: 'assistant.nav.profile' },
  myinformation: { href: ROUTES.DASHBOARD_SETTINGS_PROFILE, labelKey: 'assistant.nav.profile' },
  mydata: { href: ROUTES.DASHBOARD_SETTINGS_PROFILE, labelKey: 'assistant.nav.profile' },
  changephone: { href: ROUTES.DASHBOARD_SETTINGS_CHANGE_PHONE, labelKey: 'assistant.nav.profile' },
  changepassword: {
    href: ROUTES.DASHBOARD_SETTINGS_CHANGE_PASSWORD,
    labelKey: 'assistant.nav.profile',
  },
  accounttype: {
    href: ROUTES.DASHBOARD_SETTINGS_ACCOUNT_TYPE,
    labelKey: 'assistant.nav.accountType',
  },
  subscription: {
    href: ROUTES.DASHBOARD_SETTINGS_SUBSCRIPTIONS,
    labelKey: 'assistant.nav.subscriptions',
  },
  subscriptionmanagement: {
    href: ROUTES.DASHBOARD_SETTINGS_SUBSCRIPTIONS,
    labelKey: 'assistant.nav.subscriptions',
  },
  services: { href: ROUTES.DASHBOARD_SETTINGS_SERVICES, labelKey: 'assistant.nav.myServices' },
  myservices: { href: ROUTES.DASHBOARD_SETTINGS_SERVICES, labelKey: 'assistant.nav.myServices' },
  servicemanagement: {
    href: ROUTES.DASHBOARD_SETTINGS_SERVICES,
    labelKey: 'assistant.nav.myServices',
  },
  portfolio: { href: ROUTES.DASHBOARD_SETTINGS_PORTFOLIO, labelKey: 'assistant.nav.portfolio' },
  cards: { href: ROUTES.DASHBOARD_SETTINGS_CARDS, labelKey: 'assistant.nav.cards' },
  paymenthistory: { href: ROUTES.DASHBOARD_PAYMENTS, labelKey: 'assistant.nav.payments' },
  transactions: { href: ROUTES.DASHBOARD_PAYMENTS, labelKey: 'assistant.nav.payments' },
  transactionhistory: { href: ROUTES.DASHBOARD_PAYMENTS, labelKey: 'assistant.nav.payments' },
  support: { href: ROUTES.DASHBOARD_SETTINGS_SUPPORT, labelKey: 'assistant.nav.support' },
  supporttickets: { href: ROUTES.DASHBOARD_SETTINGS_SUPPORT, labelKey: 'assistant.nav.support' },
  referral: { href: ROUTES.DASHBOARD_SETTINGS_REFERRAL, labelKey: 'assistant.nav.referral' },
  feedback: { href: ROUTES.DASHBOARD_SETTINGS_FEEDBACK, labelKey: 'assistant.nav.feedback' },

  // Communications
  notifications: { href: ROUTES.DASHBOARD_NOTIFICATIONS, labelKey: 'assistant.nav.notifications' },
  messages: { href: ROUTES.DASHBOARD_MESSAGES, labelKey: 'assistant.nav.messages' },
  chatrooms: { href: ROUTES.DASHBOARD_MESSAGES, labelKey: 'assistant.nav.messages' },
  offers: { href: ROUTES.DASHBOARD_OFFERS, labelKey: 'assistant.nav.offers' },

  // Public marketing surface
  home: { href: ROUTES.HOME, labelKey: 'assistant.nav.home' },
  dashboard: { href: ROUTES.DASHBOARD, labelKey: 'assistant.nav.dashboard' },
  ourservices: { href: ROUTES.SERVICES, labelKey: 'assistant.nav.services' },
  technicians: { href: ROUTES.TECHNICIANS, labelKey: 'assistant.nav.technicians' },
  forpros: { href: ROUTES.FOR_PROS, labelKey: 'assistant.nav.forPros' },
  howitworks: { href: ROUTES.HOW_IT_WORKS, labelKey: 'assistant.nav.howItWorks' },
  about: { href: ROUTES.ABOUT, labelKey: 'assistant.nav.about' },
  contact: { href: ROUTES.CONTACT, labelKey: 'assistant.nav.contact' },
  faq: { href: ROUTES.FAQ, labelKey: 'assistant.nav.faq' },
  blog: { href: ROUTES.BLOG, labelKey: 'assistant.nav.blog' },
  bloglist: { href: ROUTES.BLOG, labelKey: 'assistant.nav.blog' },
  blogdetail: { href: ROUTES.BLOG, labelKey: 'assistant.nav.blog' },
  help: { href: ROUTES.HELP, labelKey: 'assistant.nav.help' },
  helpcenter: { href: ROUTES.HELP, labelKey: 'assistant.nav.help' },
  terms: { href: ROUTES.TERMS, labelKey: 'assistant.nav.terms' },
  privacy: { href: ROUTES.PRIVACY, labelKey: 'assistant.nav.privacy' },
};

/** Resolve a raw nav token (case/dot-insensitive, RN-style) to a web route, or null if unmapped. */
export function resolveNavTarget(rawToken: string): NavTarget | null {
  const key = rawToken
    .trim()
    .toLowerCase()
    .replace(/[.\s_-]/g, '');
  return NAV_TARGETS[key] ?? null;
}
