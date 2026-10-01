# src/scripts documentation

Frontend scripts for MKB / CRM Soft pages, login, and crypto helpers.

---

## mkb-start.js

Entry auth gate loaded on `/mkb` and `/crm-soft`. Redirects unauthenticated users to `/login`. Supports URL auto-login on `/crm-soft/?username=...&password=...&code=...` (validated by `login.php` with the same checks as `auto-login.php`; credentials are not saved to cookies). Otherwise validates existing cookies via `login.php`.

// getCookie:
// description: Reads a cookie value by name from document.cookie.
// parameters: cname (string) — cookie name
// returns: string — cookie value, or empty string if missing
// used imports: none
// used files: none
// imported in: (module top-level auth flow in this file)

---

## mkb.js

Main MKB page UI and data loading. Reads optional `code`, `username`, and `password` from the URL. When URL credentials are present, `getCookie` falls back to those in-memory values so API calls work after `history.replaceState` strips the query (auto-login without cookies).

// getCookie:
// description: Reads a cookie by name; if missing, falls back to URL auto-login username/password captured at page load.
// parameters: cname (string) — cookie name (`username` or `password` may use URL fallback)
// returns: string — credential or cookie value, or empty string
// used imports: none
// used files: none
// imported in: (used throughout this file for get-data-* and related calls)

---

## crm-soft.js

CRM Soft page UI and data loading (same patterns as `mkb.js`). Primary target for URL auto-login: `/crm-soft/?username=...&password=...&code=...`. Captures URL credentials in memory; `getCookie` falls back to them after `history.replaceState` strips the query.

// getCookie:
// description: Reads a cookie by name; if missing, falls back to URL auto-login username/password captured at page load.
// parameters: cname (string) — cookie name (`username` or `password` may use URL fallback)
// returns: string — credential or cookie value, or empty string
// used imports: none
// used files: none
// imported in: (used throughout this file for get-data-* and related calls)

---

## login.js

Login page: form handlers, calls `login.php`, on success writes 30-day username/password cookies and redirects to `/crm-soft` (with optional `code`).

// authorize:
// description: Submits username/password to login.php and handles access / deny / denyIP.
// parameters: none (reads from form inputs)
// returns: void
// used imports: none
// used files: ../php/login.php
// imported in: (bound to login button click)

// togglePasswordView:
// description: Toggles password input visibility and reveal/hide icons.
// parameters: none
// returns: void
// used imports: none
// used files: none
// imported in: (bound to reveal/hide password buttons)

// setButtonState:
// description: Enables the login button when username and password are at least 6 characters.
// parameters: e (input event)
// returns: void
// used imports: none
// used files: none
// imported in: (bound to username/password input events)

---

## crypto.js

Client-side decryption helpers for encrypted API payloads.

Used in:
- `src/scripts/mkb.js`
- `src/scripts/crm-soft.js`

---

## crypto.test.js

Unit tests for `crypto.js`.

Used in:
- test runner
