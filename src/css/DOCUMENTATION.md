# src/css documentation

Shared styles for the MKB and CRM Soft pages.

---

## main.css

Page layout, header, form, cards, and the floating delete-all button. `.remove-all-floating` is fixed on screen. Its default `top` is 56px, just below the 48px page header. Script code then sets `top` from the header's measured height plus 8px, including the shorter CRM Soft header on narrow screens.

The login background is removed with `.page--mkb` and `.page--crm-soft`, not `:has()`, so an older embedded browser still gets a white page. Age and standard switches put the checkbox first and color the labels with sibling selectors. The Первичный / Повторный knob moves with `.exam-stage-toggle--right`, which `syncExamStageKnob` sets. `html` is white with `color-scheme: light` so the host window color does not show through.

On a CRM Soft window at 808px or narrower, the first view (`.page__mkb--start`, search bar and history only) stretches to the page. The search form and `#history-panel` are each 90% wide, which leaves about 5% margin on the left and right. Wider windows and the results view keep the previous form width. The regular MKB page is unchanged.

Used in:
- `src/scripts/crm-soft.js`
- `src/scripts/mkb.js`
