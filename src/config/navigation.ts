import {
  Atom,
  Bell,
  ChartPie,
  Database,
  Gift,
  Hexagon,
  House,
  Landmark,
  Leaf,
  MessageCircleQuestion,
  Network,
  Palette,
  ReceiptText,
  ScanLine,
  Send,
  Server,
  Settings,
  ShieldCheck,
  Smartphone,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  description: string;
  /** TASKS.md id that delivers this feature; absent when the page is already built. */
  task?: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { id: 'home', label: 'Home', path: '/', icon: House, description: 'Sandbox workspace overview.' },
  { id: 'pay', label: 'Pay', path: '/pay', icon: Send, task: 'FE-008', description: 'Send sandbox money to a contact, payment ID or QR recipient.' },
  { id: 'scan', label: 'Scan', path: '/scan', icon: ScanLine, task: 'FE-010', description: 'Scan or upload a demo QR code and pay a sandbox recipient.' },
  { id: 'contacts', label: 'Contacts', path: '/contacts', icon: Users, task: 'FE-007', description: 'People-first list of recipients, favorites and beneficiaries.' },
  { id: 'transactions', label: 'Transactions', path: '/transactions', icon: ReceiptText, task: 'FE-009', description: 'Timeline of sandbox payments with filters, details and receipts.' },
  { id: 'bills', label: 'Bills', path: '/bills', icon: Landmark, task: 'FE-012', description: 'Sandbox billers, reminders and autopay simulation.' },
  { id: 'recharge', label: 'Recharge', path: '/recharge', icon: Smartphone, task: 'FE-012', description: 'Mobile recharge simulation with operator plans.' },
  { id: 'rewards', label: 'Rewards', path: '/rewards', icon: Gift, task: 'FE-013', description: 'Points, streaks and cashback simulations. No real monetary value.' },
  { id: 'accounts', label: 'Accounts', path: '/accounts', icon: Hexagon, task: 'FE-006', description: 'Sandbox wallet, linked account simulations and payment methods.' },
  { id: 'analytics', label: 'Analytics', path: '/analytics', icon: ChartPie, task: 'FE-014', description: 'Spending and receiving insights from your sandbox activity.' },
  { id: 'notifications', label: 'Notifications', path: '/notifications', icon: Bell, task: 'FE-011', description: 'Real-time payment, request and security notifications.' },
  { id: 'security', label: 'Security', path: '/security', icon: ShieldCheck, task: 'FE-015', description: 'Sessions, trusted devices, PIN, limits and security alerts.' },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings, task: 'FE-015', description: 'Profile, appearance and preferences.' },
];

export const LAB_NAV: NavItem[] = [
  { id: 'lab-design-system', label: 'Design system', path: '/lab/design-system', icon: Palette, description: 'Tokens, typography and component states.' },
  { id: 'lab-angular', label: 'Angular', path: '/lab/angular', icon: Hexagon, task: 'FE-016', description: 'Angular learning track.' },
  { id: 'lab-react', label: 'React', path: '/lab/react', icon: Atom, task: 'FE-016', description: 'React learning track.' },
  { id: 'lab-node', label: 'Node.js', path: '/lab/node', icon: Server, task: 'FE-016', description: 'Node.js learning track.' },
  { id: 'lab-mysql', label: 'MySQL', path: '/lab/mysql', icon: Database, task: 'FE-016', description: 'MySQL learning track.' },
  { id: 'lab-mongodb', label: 'MongoDB', path: '/lab/mongodb', icon: Leaf, task: 'FE-016', description: 'MongoDB learning track.' },
  { id: 'lab-questionnaire', label: 'Questionnaire', path: '/lab/questionnaire', icon: MessageCircleQuestion, task: 'FE-016', description: 'Timed technical questions with hints and explanations.' },
  { id: 'lab-workflows', label: 'Workflow diagrams', path: '/lab/workflows', icon: Workflow, task: 'FE-017', description: 'Interactive payment, auth and notification workflows.' },
  { id: 'lab-relationships', label: 'Relationship diagrams', path: '/lab/relationships', icon: Network, task: 'FE-017', description: 'Zoomable entity relationship explorer.' },
];

/** Destinations shown in the mobile bottom bar next to the menu button; everything else lives in the drawer. */
export const MOBILE_NAV_IDS = ['home', 'pay', 'scan', 'transactions'] as const;
