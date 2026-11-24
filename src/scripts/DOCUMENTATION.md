# src/scripts documentation

Frontend scripts for MKB / CRM Soft pages, login, and crypto helpers.

---

## mkb-start.js

Entry auth gate loaded on `/mkb` and `/crm-soft`. On `/crm-soft` and `/crm-soft?code=...`, a visitor with no username/password cookies is sent to `/login` (the diagnosis `code` is kept on the login URL so a successful login returns to that diagnosis). Address-bar auto-login on `/crm-soft/?username=...&password=...&code=...` is unchanged: credentials are validated by `php/login.php` (same checks as `auto-login.php`) and are not saved to cookies. When cookies exist, they are validated via `php/login.php`. `/mkb` without cookies still skips this redirect.

// isCrmSoftPage:
// description: Detects the CRM Soft page from the current pathname, including a trailing slash or index.html.
// parameters: none
// returns: boolean — true when the path ends with /crm-soft
// used imports: none
// used files: none
// imported in: (module top-level auth flow in this file)

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

// getStandardInd:
// description: Returns the standards-array index of the document currently shown for diagnostics or treatment. A single document is read from the monolist paragraph; several documents are read from the select. Index 0 is a valid selection (an empty value means nothing is selected).
// parameters: type (string) — `exam` or `treat`
// returns: number | string | null — standard index, or null when nothing is selected
// used imports: none
// used files: none
// imported in: (used in this file by setExamText, setTreatText, getCurrentCrmId, and the sort handlers)

// createTreatBlock:
// description: Renders one drug or treatment-service row. The info button is added whenever the row has cr_db_id, same as examinations. Clicking it opens the comment popup for that row and following rows that share its header.
// parameters: parentElem (HTMLElement) — drug, service, or offlabel card; treatData (object) — treatment record; prevName (string|null) — previous row name, used to keep one header per name
// returns: void
// used imports: none
// used files: none
// imported in: (used in this file by setTreatText and the treatment sort handlers)

// openInfoPopupByTitle:
// description: Waits for popup text to finish loading, then opens the info popup for an examination or for one or more treatment rows.
// parameters: examData (object) — row with cr_db_id; relatedEntries (array|null) — extra treatment rows included in the same popup
// returns: Promise<void>
// used imports: none
// used files: php/get-data-popup.php via fetchPopupDataOnce
// imported in: (click handler on .block__info-icon in this file)

// updateRemoveAllFloatingVisibility:
// description: Shows the floating delete-all button as soon as any block is selected, without waiting for scroll. Places it just below the page header, 12px to the right of the first examination card, and shifts it left when that spot would fall outside the viewport.
// parameters: none
// returns: void
// used imports: none
// used files: none
// imported in: (called from toggleBlockSelection, removeBlockSelections, setCardCopyButtonsEventHandler, and the scroll/resize listeners in setRemoveAllFloatingEventHandler in this file)

// clearClipboardData:
// description: Empties the clipboard after the floating delete-all button, or a card close control, removes the selection. Clears both plain text and HTML so a later paste does not restore previously copied rows.
// parameters: none
// returns: void
// used imports: none
// used files: none
// imported in: (called from removeBlockSelections and removeAllBlockSelections in this file)

// setCardCopyButtonsEventHandler:
// description: Wires each card's copy and clear controls. On the required examinations card, the header copy button copies every item in that card and leaves `block__container--selected` on those items so the copied rows stay highlighted. Category titles are not highlighted. The card close control and the floating clear button remove the highlight.
// parameters: none
// returns: void
// used imports: none
// used files: none
// imported in: (called at module top level in this file)

// addCopyCardAllTextDataEventListeners:
// description: Shows the copy tooltip and copies the currently selected rows. Clicks on the required examinations copy-all button are left to setCardCopyButtonsEventHandler so that control copies every item once and can highlight those rows.
// parameters: cardCopyElem (HTMLElement) — `.copy-button__copy-button` inside a card
// returns: void
// used imports: none
// used files: none
// imported in: (called from setCardCopyButtonsEventHandler in this file)

// syncExamStageKnob:
// description: Moves the Первичный / Повторный knob by toggling `.exam-stage-toggle--right` from the selected stage button. Older embedded browsers do not support the `:has()` rule that used to do this.
// parameters: none
// returns: void
// used imports: none
// used files: src/css/main.css (class `.exam-stage-toggle--right`)
// imported in: (called from toggleStage in this file)

---

## crm-soft.js

CRM Soft page UI and data loading (same patterns as `mkb.js`). Primary target for URL auto-login: `/crm-soft/?username=...&password=...&code=...`. Captures URL credentials in memory; `getCookie` falls back to them after `history.replaceState` strips the query. Opening `/crm-soft` or `/crm-soft?code=...` without cookies or address-bar credentials redirects to `/login` before any diagnosis request.

// redirectLoggedOutVisitor:
// description: Sends a CRM Soft visitor who has neither session cookies nor address-bar username and password to /login. A diagnosis code in the address is forwarded as /login?code=... so login can return to that diagnosis. Address-bar auto-login is left in place.
// parameters: none
// returns: boolean — true when navigation to /login has started
// used imports: none
// used files: none
// imported in: (called from initPage in this file)

// getCookie:
// description: Reads a cookie by name; if missing, falls back to URL auto-login username/password captured at page load.
// parameters: cname (string) — cookie name (`username` or `password` may use URL fallback)
// returns: string — credential or cookie value, or empty string
// used imports: none
// used files: none
// imported in: (used throughout this file for get-data-* and related calls)

// getStandardInd:
// description: Returns the standards-array index of the document currently shown for diagnostics or treatment. A single document is read from the monolist paragraph; several documents are read from the select. Index 0 is a valid selection (an empty value means nothing is selected).
// parameters: type (string) — `exam` or `treat`
// returns: number | string | null — standard index, or null when nothing is selected
// used imports: none
// used files: none
// imported in: (used in this file by setExamText, setTreatText, getCurrentCrmId, and the sort handlers)

// createTreatBlock:
// description: Renders one drug or treatment-service row. The info button is added whenever the row has cr_db_id, without waiting for popup data to already be in memory. Clicking it waits for that data, then opens the comment popup.
// parameters: parentElem (HTMLElement) — drug, service, or offlabel card; treatData (object) — treatment record; prevName (string|null) — previous row name, used to keep one header per name
// returns: void
// used imports: none
// used files: none
// imported in: (used in this file by setTreatText and the treatment sort handlers)

// openInfoPopupByTitle:
// description: Waits for the in-flight popup request, then opens the info popup for an examination or for one or more treatment rows.
// parameters: examData (object) — row with cr_db_id; relatedEntries (array|null) — extra treatment rows included in the same popup
// returns: Promise<void>
// used imports: none
// used files: php/get-data-popup.php via fetchPopupDataOnce
// imported in: (click handler on .block__info-icon in this file)

// updateRemoveAllFloatingVisibility:
// description: Shows the floating delete-all button as soon as any block is selected, without waiting for scroll. Places it just below the page header, 12px to the right of the first examination card, and shifts it left when that spot would fall outside the viewport.
// parameters: none
// returns: void
// used imports: none
// used files: none
// imported in: (called from toggleBlockSelection, removeBlockSelections, setCardCopyButtonsEventHandler, and the scroll/resize listeners in setRemoveAllFloatingEventHandler in this file)

// clearClipboardData:
// description: Empties the clipboard after the floating delete-all button, or a card close control, removes the selection. Clears both plain text and HTML so a later paste does not restore previously copied rows.
// parameters: none
// returns: void
// used imports: none
// used files: none
// imported in: (called from removeBlockSelections and removeAllBlockSelections in this file)

// setCardCopyButtonsEventHandler:
// description: Wires each card's copy and clear controls. On the required examinations card, the header copy button copies every item in that card and leaves `block__container--selected` on those items so the copied rows stay highlighted. Category titles are not highlighted. The card close control and the floating clear button remove the highlight.
// parameters: none
// returns: void
// used imports: none
// used files: none
// imported in: (called at module top level in this file)

// addCopyCardAllTextDataEventListeners:
// description: Shows the copy tooltip and copies the currently selected rows. Clicks on the required examinations copy-all button are left to setCardCopyButtonsEventHandler so that control copies every item once and can highlight those rows.
// parameters: cardCopyElem (HTMLElement) — `.copy-button__copy-button` inside a card
// returns: void
// used imports: none
// used files: none
// imported in: (called from setCardCopyButtonsEventHandler in this file)

// syncExamStageKnob:
// description: Moves the Первичный / Повторный knob by toggling `.exam-stage-toggle--right` from the selected stage button. Older embedded browsers do not support the `:has()` rule that used to do this.
// parameters: none
// returns: void
// used imports: none
// used files: src/css/main.css (class `.exam-stage-toggle--right`)
// imported in: (called from toggleStage and from the diagnosis load path in this file)

---

## login.js

Login page: form handlers, calls `php/login.php`, on success writes 30-day username/password cookies and redirects to `/crm-soft` (with optional `code`).

// authorize:
// description: Submits username/password to php/login.php and handles access / deny / denyIP.
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
