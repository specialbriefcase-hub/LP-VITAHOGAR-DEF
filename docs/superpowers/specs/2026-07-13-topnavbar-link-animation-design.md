# TopNavBar Link Animation — Design

**Date:** 2026-07-13
**Status:** Approved (awaiting user review of written spec)
**Scope:** `Practica_de _LP/index.html` only

## Context

The TopNavBar in `Practica_de _LP/index.html` (lines 213-283) currently has a static
`aria-current="page"` underline on the "Inicio" link. There is no visual feedback
when a user clicks another link, and no indication of which section they are
currently reading as they scroll. The rest of the page already uses fluid,
brand-coordinated motion (e.g. `card-hover-ring` conic gradient, testimonial
slide-up), so the navbar should match that level of craft.

This design adds a single shared, sliding underline that:

1. morphs to the clicked link the moment a user clicks it (color flash + grow),
2. follows the user's section as they scroll (IntersectionObserver scroll-spy),

and a per-item left bar + burger pulse as the mobile equivalent.

The animation uses only the project's existing toolchain: HTML, Tailwind CSS
(CDN), the custom `tailwind.config` (lines 16-110), and one small inline `<script>`
following the same IIFE pattern as the existing scripts in the file. No
screenshot loop, no new dependencies, no other files touched.

## Animation language

- **Visual:** 2px shared underline, color `bg-primary` (`#4f6618`), fully rounded
  ends.
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` — same family as the existing
  `card-hover-ring` transitions, so the whole page has one motion vocabulary.
- **Timing:**
  - Click color flash: 180ms.
  - Click grow: 200ms (scaleX 0.4 → 1).
  - Morph between links: 350ms.
  - Reduced motion: all durations collapse to 0ms; no flash, no grow.

## Desktop behavior (md and up)

### Markup additions

- Each desktop link in the link row (lines 222-232) gets
  `data-nav-link data-target="…"` (target = href's hash, e.g. `proceso`).
- The link row gains `class="relative"` so the underline can anchor to it.
- One `<span id="nav-underline" class="nav-underline" hidden
  class="md:block"></span>` is appended to the link row, hidden on mobile.

### Click flow

1. `e.preventDefault()`.
2. Add `is-clicking` class to clicked link → text color flashes from
   `text-on-surface-variant` to `text-primary` over 180ms.
3. Underline grows under clicked link (200ms, scaleX 0.4 → 1, no translate).
4. After 180ms, run the morph animation to the destination link.
5. `scrollIntoView({ behavior: 'smooth', block: 'start' })` with offset of
   `-80px` for the sticky bar height (computed from `nav.offsetHeight`).

### Scroll spy

- One `IntersectionObserver` watches all 5 target sections.
- `rootMargin: '-30% 0px -65% 0px'` — a section is active when its top is in
  the upper-middle band of the viewport.
- On each intersection, find the section currently in the band and morph the
  underline to its link.
- Re-entering "Inicio" (the hero) keeps the underline under "Inicio" (default).
- Throttled with `requestAnimationFrame` to one morph per frame.
- Short final section (CTA): if no section intersects and the user is near the
  bottom, force-activate the last link (`#contacto`).

### Click while morphing

- Cancel the in-flight transition (set `transition: none`, force reflow, re-set
  transition) and start the new morph.

### Click on already-active link

- No-op (no scroll, no animation).

## Mobile behavior (below md)

### Per-link left bar

- Each mobile link (lines 254-272) gets a 2px left bar via `::before`
  (`:before:bg-primary` equivalent in the existing Tailwind config or a small
  utility class).
- Bar: `absolute; left: 0; top: 50%; translateY(-50%); width: 2px; height: 60%;
  bg-primary; opacity: 0; transition: opacity 200ms;`.
- Active link: `opacity: 1`; link itself gets `text-primary border-l-2
  border-primary pl-3`.

### Burger button pulse

- When active section changes, the burger button gets
  `data-burger-pulse="true"` for 200ms.
- Visual: icon container `transform: scale(1.08); transition: transform 200ms`.

### Resize across breakpoint

- The shared underline is `hidden md:block`. On mobile it disappears; the
  per-link left bar takes over once the mobile menu is opened.

## Implementation sketch

```js
// IIFE — placed just before the existing hover-ring script (line 979)
// The existing burger-menu script at line 811 keeps running as-is.
(function () {
  var nav = document.querySelector('nav[aria-label="Principal"]');
  var row = nav.querySelector('[data-nav-row]');
  var underline = document.getElementById('nav-underline');
  var links = Array.from(nav.querySelectorAll('[data-nav-link]'));
  var burger = document.getElementById('burger');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clickLock = false;
  var active = links[0];

  function placeUnderline(link, animate) {
    var r = link.getBoundingClientRect();
    var rr = row.getBoundingClientRect();
    var x = r.left - rr.left;
    underline.style.width = r.width + 'px';
    underline.style.transform = 'translateX(' + x + 'px)';
    if (!animate) underline.style.transition = 'none';
    else underline.style.transition = '';
  }

  // ...scroll spy via IntersectionObserver, click handlers, RAF throttle...
})();
```

CSS lives in the existing `<style>` block (lines 112-209):

```css
.nav-underline {
  position: absolute;
  bottom: 0;
  height: 2px;
  background: var(--primary, #4f6618);
  border-radius: 9999px;
  transition: transform 350ms cubic-bezier(0.16, 1, 0.3, 1),
              width 350ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, width;
}
@media (prefers-reduced-motion: reduce) {
  .nav-underline { transition: none; }
}
```

## Edge cases

- **Click while morphing** — cancel in-flight transition, start new morph.
- **Click on already-active link** — no-op.
- **Click "Inicio" from another section** — smooth scroll to top; underline
  stays under "Inicio" throughout.
- **Window resize** — debounced re-measure of active link (no morph, snap only).
- **Fonts load late** — `document.fonts.ready` triggers re-measure.
- **Mobile menu open during scroll spy change** — the left bar updates on the
  currently-open menu; the burger pulses regardless of menu state.
- **Breakpoint cross** — underline is `hidden md:block`; mobile left bar takes
  over once menu is reopened.

## What does NOT change

- `tailwind.config` (lines 16-110) — untouched.
- All sections outside the TopNavBar (Hero, Proceso, Requisitos, Testimonios,
  Confianza, CTA, Footer) — untouched.
- The existing burger menu IIFE (lines 811-872) — runs as-is.
- The `card-hover-ring` conic gradient system — untouched.
- `serve.mjs`, `screenshot.mjs`, `package.json` — untouched.

## Files touched (1)

`Practica_de _LP/index.html` only:

1. Add `data-nav-link` and `data-target` attributes to desktop links (lines
   222-232) and mobile links (lines 254-272). Add the `<span id="nav-underline">`
   element to the desktop link row. Add a small `[data-nav-link]::before` rule
   for the mobile left bar. Add `.nav-underline` and `.is-clicking` CSS to the
   existing `<style>` block.
2. Append a new IIFE `<script>` (scroll spy + click handlers + RAF throttle)
   just before the existing hover-ring script (line 979).

## Verification

Manual, by serving the project on `http://localhost:5500` with `node serve.mjs`:

- Click each of the 5 links. Verify color flash, underline grow, morph to
  destination, and smooth scroll.
- Scroll slowly through the page. Verify underline tracks the visible section.
- Resize across the `md` breakpoint. Verify underline disappears and the
  mobile left bar appears.
- Toggle "Reduce motion" in OS settings. Verify all animations collapse to
  instant.
- Click the already-active link. Verify no-op.

(No screenshot loop per the project instructions.)
