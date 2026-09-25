# Master data and demo logins (web app view)

The API owns all reference data. It is defined in mini-payment-server `src/modules/reference-data/data/`,
seeded by migrations `0002-reference-data` and `0003-demo-accounts`, and documented in full (every role,
permission, menu, master row and sandbox entity) in mini-payment-server
[`docs/MASTER_DATA.md`](https://github.com/maheshpcse/mini-payment-server/blob/main/docs/MASTER_DATA.md).
This page covers only what the web app relies on.

## Demo logins

Password for every demo account: **`MiniPay@2026`** (public on purpose; everything is sandbox data).

| Account | Email | Where it exists | Shown on the login page |
| --- | --- | --- | --- |
| Priya Sharma (customer, UPI `priya.demo@okhdfcbank` + HDFC savings •••• 6789) | `demo@example.com` | every environment | yes |
| Rahul Verma (second customer) | `demo.friend@example.com` | every environment | yes |
| Admin, Support, Operations, Auditor staff demos | `admin.demo@example.com`, `support.demo@example.com`, `operations.demo@example.com`, `auditor.demo@example.com` | local, development, test only | no |

- The login page lists the two customer demos from `src/config/demo.ts` with one-click sign-in buttons and shows the
  credentials for typing. Set `VITE_DEMO_LOGIN=false` to hide the section.
- The user object carries `isDemo`. Demo accounts are shared, so the API returns `403 DEMO_ACCOUNT_RESTRICTED` for
  password change, sign out everywhere, session revoke, profile edit and avatar changes. The app shows a
  "Shared demo account" notice and disables those controls instead of letting the request fail:
  - Profile: no "Edit profile" link; photo upload/remove disabled.
  - Edit profile (if opened directly): fields and Save disabled.
  - Security: password form and "Sign out of all devices" disabled; the device list shows only this browser.
- Preferences, payment methods and wallets stay usable, so every built page can be tried. Other visitors see those
  changes too.

## Menus

`GET /api/v1/menus` returns the menu entries the signed-in user's roles permit. The customer entries have the same
`id`, `path`, icon name and task id as `src/config/navigation.ts`; change both together. The app still renders
its navigation from `navigation.ts`. Switching to the API response, and showing the ADMINISTRATION group to staff
roles, is part of the staff console (FE-028).

## Master data the app will read

`GET /api/v1/masters?types=…` is public and cached for 5 minutes. The Wallets page currently has its own copies of
the IFSC bank list and UPI handle suggestions. Future forms (bills, recharge, analytics categories) should read
`bank`, `upi_handle`, `bill_category`, `spending_category`, `payment_status` and `platform_setting` from this
endpoint instead of hard-coding them. Sandbox merchants, billers and operators come from `GET /api/v1/entities`
(signed-in only).
