# src/php documentation

PHP endpoints used by the MKB / CRM Soft frontend. Webpack copies this folder to `dist/php`.

---

## auto-login.php

Validates username and password for URL-based auto-login on `/crm-soft/?username=...&password=...&code=...` (no cookie persistence on the client). Same auth logic as `login.php`: DB lookup, password match, optional IP check.

Query parameters: `username`, `password`.

Response JSON `result`: `access` | `deny` | `denyIP`.

Used in:
- `src/scripts/mkb-start.js`

---

## login.php

Validates username and password for the normal login page and cookie-based session checks.

Query parameters: `username`, `password`.

Response JSON `result`: `access` | `deny` | `denyIP`.

Used in:
- `src/scripts/login.js`
- `src/scripts/mkb-start.js`

---

## get-data-main.php

Returns main MKB diagnosis data for a given code after credential checks.

Query parameters: `code`, `username`, `password` (via `/login` path style used by the frontend).

Used in:
- `src/scripts/mkb.js`
- `src/scripts/crm-soft.js`

---

## get-data-popup.php

Returns popup / secondary MKB data for a given code after credential checks.

Query parameters: `code`, `username`, `password`.

Used in:
- `src/scripts/mkb.js`
- `src/scripts/crm-soft.js`

---

## get-data-tables.php

Returns table data for a CRM id after credential checks.

Query parameters: `cr_id`, `username`, `password`.

Used in:
- `src/scripts/mkb.js`
- `src/scripts/crm-soft.js`

---

## get-data.php

Legacy / unused data endpoint (not referenced by current frontend scripts).

Used in:
- (none)

---

## search.php

MKB search suggestions by query string.

Query parameters: `q`.

Used in:
- `src/scripts/mkb.js`
- `src/scripts/crm-soft.js`
