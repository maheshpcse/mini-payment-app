import {
  Bell,
  ChartPie,
  Gift,
  House,
  Landmark,
  ReceiptText,
  ScanLine,
  Send,
  Settings,
  ShieldCheck,
  Smartphone,
  UserRound,
  Users,
  WalletCards,
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
  /** Match the path exactly (for parents of other nav items, e.g. /settings vs /settings/security). */
  end?: boolean;
}

export interface NavGroupConfig {
  title: string;
  items: NavItem[];
}

export const PAYMENT_NAV: NavItem[] = [
  { id: 'home', label: 'Home', path: '/', icon: House, end: true, description: 'Sandbox workspace overview.' },
  { id: 'pay', label: 'Pay', path: '/pay', icon: Send, task: 'FE-008', description: 'Send sandbox money to a contact, payment ID or QR recipient.' },
  { id: 'scan', label: 'Scan', path: '/scan', icon: ScanLine, task: 'FE-010', description: 'Scan or upload a demo QR code and pay a sandbox recipient.' },
  { id: 'contacts', label: 'Contacts', path: '/contacts', icon: Users, task: 'FE-007', description: 'People-first list of recipients, favorites and beneficiaries.' },
  { id: 'transactions', label: 'Transactions', path: '/transactions', icon: ReceiptText, task: 'FE-009', description: 'Timeline of sandbox payments with filters, details and receipts.' },
  { id: 'wallets', label: 'Wallets', path: '/wallets', icon: WalletCards, description: 'MiNi wallet, linked bank accounts and UPI IDs (sandbox).' },
  { id: 'bills', label: 'Bills', path: '/bills', icon: Landmark, task: 'FE-012', description: 'Sandbox billers, reminders and autopay simulation.' },
  { id: 'recharge', label: 'Recharge', path: '/recharge', icon: Smartphone, task: 'FE-012', description: 'Mobile recharge simulation with operator plans.' },
  { id: 'rewards', label: 'Rewards', path: '/rewards', icon: Gift, task: 'FE-013', description: 'Points, streaks and cashback simulations. No real monetary value.' },
  { id: 'analytics', label: 'Analytics', path: '/analytics', icon: ChartPie, task: 'FE-014', description: 'Spending and receiving insights from your sandbox activity.' },
  { id: 'notifications', label: 'Notifications', path: '/notifications', icon: Bell, task: 'FE-011', description: 'Real-time payment, request and security notifications.' },
];

export const ACCOUNT_NAV: NavItem[] = [
  { id: 'profile', label: 'Profile', path: '/profile', icon: UserRound, description: 'Your name, contact details and avatar.' },
  { id: 'security', label: 'Security', path: '/settings/security', icon: ShieldCheck, description: 'Password and signed-in sessions.' },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings, end: true, description: 'Notifications, payments and appearance.' },
];

export const NAV_GROUPS: NavGroupConfig[] = [
  { title: 'Payments', items: PAYMENT_NAV },
  { title: 'Account', items: ACCOUNT_NAV },
];

export const ALL_NAV: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

/** Destinations shown in the mobile bottom bar next to the menu button; everything else lives in the drawer. */
export const MOBILE_NAV_IDS = ['home', 'pay', 'scan', 'transactions'] as const;
