/**
 * Consumer demo logins seeded by mini-payment-server migration 0003 in every
 * environment (see its docs/MASTER_DATA.md). The password is public on purpose.
 */
export const DEMO_PASSWORD = 'MiniPay@2026';

export const DEMO_LOGINS = [
  { email: 'demo@example.com', name: 'Priya Sharma', role: 'Customer with a linked UPI ID and bank account' },
  { email: 'demo.friend@example.com', name: 'Rahul Verma', role: 'Second customer to pay and request from' },
] as const;
