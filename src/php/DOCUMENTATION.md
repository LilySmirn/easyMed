# src/php documentation

PHP endpoints used by the MKB / CRM Soft frontend. Webpack copies this folder to `dist/php`.

**Active CRM Soft API:** root-level files in this folder — SQNS/newDB-backed endpoints shaped like the old CRM Soft responses. Frontend calls `../php/*.php`.

---

## _db.php

Shared SQNS connection, username/password auth, and response-shape helpers (`newPhpSplitStandardsForAge`, `newPhpLoadMkbWithStandards`, `newPhpPopupFromSqnsText`, `newPhpWrapDrugTables`).

Used in:
- `get-data-main.php`
- `get-data.php`
- `get-data-popup.php`
- `get-data-tables.php`
- `search.php`
- `login.php`
- `auto-login.php`

---

## auto-login.php

Validates username and password for URL-based auto-login on `/crm-soft/?username=...&password=...&code=...` (no cookie persistence on the client). Same auth logic as `login.php`: SQNS `user` lookup, password match, optional IP check.

Query parameters: `username`, `password`.

Response JSON `result`: `access` | `deny` | `denyIP`.

Used in:
- `src/scripts/mkb-start.js` (same checks via `login.php`)

---

## login.php

Validates username and password for the normal login page and cookie-based session checks against SQNS `user`.

Query parameters: `username`, `password`.

Response JSON `result`: `access` | `deny` | `denyIP`.

Used in:
- `src/scripts/login.js`
- `src/scripts/mkb-start.js`

---

## get-data-main.php

Returns main MKB diagnosis data for a given code after credential checks. Reads SQNS DB and splits each combined standard into Диагностика / Лечение objects.

Query parameters: `code`, `username`, `password` (via `/login` path style used by the frontend).

Used in:
- `src/scripts/mkb.js`
- `src/scripts/crm-soft.js`

---

## get-data-popup.php

Returns popup / secondary MKB data for a given code after credential checks. Reshapes SQNS cr-text array into keyed `{cr_db_id: {text, comment}}` object.

Query parameters: `code`, `username`, `password`.

Used in:
- `src/scripts/mkb.js`
- `src/scripts/crm-soft.js`

---

## get-data-tables.php

Returns table data for a CRM id after credential checks. Accepts `cr_id` (SQNS `cr_m_id`) and wraps tables into the old `drugTables` envelope.

Query parameters: `cr_id`, `username`, `password`.

Used in:
- `src/scripts/mkb.js`
- `src/scripts/crm-soft.js`

---

## get-data.php

Legacy / unused data endpoint (same SQNS load + split behavior as `get-data-main.php`; not referenced by current frontend scripts).

Used in:
- (none)

---

## search.php

MKB search suggestions by query string. Accepts `q` (or `search`). Uses `u2791988_API_TEST.mkb` like SQNS search.

Query parameters: `q`.

Used in:
- `src/scripts/mkb.js`
- `src/scripts/crm-soft.js`
