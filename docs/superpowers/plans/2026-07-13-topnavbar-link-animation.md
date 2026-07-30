# TopNavBar Link Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single shared, morphing underline to the TopNavBar (lines 213-283 of `Practica_de _LP/index.html`) that flashes + grows on link click, slides between active links on scroll, and has a per-item left bar + burger pulse as the mobile equivalent.

**Architecture:** One absolutely-positioned `<span id="nav-underline">` inside the desktop link row. JS measures the previous and new active link's bounding rects and tweens `transform: translateX() scaleX()` between them (FLIP technique). One `IntersectionObserver` watches all 5 target sections to drive the scroll spy; `requestAnimationFrame` throttles updates to one morph per frame. Reduced-motion collapses all durations to 0.

**Tech Stack:** HTML, Tailwind CSS (CDN), inline JavaScript (IIFE), `IntersectionObserver`, `requestAnimationFrame`, `document.fonts.ready`, `getBoundingClientRect`, `matchMedia('(prefers-reduced-motion: reduce)')`, `scrollIntoView`. No new dependencies.

## Global Constraints

- Single file: only `Practica_de _LP/index.html` may be modified. All other files untouched.
- Tailwind config (lines 16-110) is read-only. All colors and tokens come from it.
- No screenshot loop. No new tools. No new dependencies.
- The existing burger menu IIFE (lines 811-872) and the existing hover-ring script (line 979) must continue to run as-is.
- All other sections (Hero, Proceso, Requisitos, Testimonios, Confianza, CTA, Footer) must be untouched.
- Easing for the underline: `cubic-bezier(0.16, 1, 0.3, 1)`.
- Underline color: `bg-primary` = `#4f6618`.
- Underline dimensions: height 2px, fully rounded.
- Active section "Inicion" (the hero) keeps the underline under it as the default.
- Existing `aria-current="page"` on the "Inicion" link is preserved.

---

## File Structure

One file is touched: `Practica_de _LP/index.html`.

Responsibilities added to that file:
1. **Markup edits (lines 222-272)** — add `data-nav-link` / `data-target` attributes to the 5 desktop links and the 5 mobile links, add `data-nav-row` to the desktop link row, add `relative` to the desktop link row's class, append `<span id="nav-underline" class="nav-underline" hidden></span>` after the desktop link row.
2. **CSS additions (inside the existing `<style>` block, after line 208)** — `.nav-underline`, `.nav-link-clicking`, `.nav-link-active` (mobile), `.burger-pulse` rules + reduced-motion media query.
3. **JS IIFE (appended just before the hover-ring `<script>` at line 979)** — one new `<script>` containing: DOM grab, `placeUnderline`, `morphTo`, click handler, scroll-spy via IntersectionObserver, RAF throttle, font-load and resize re-measure.

---

### Task 1: Markup — add data attributes and the underline element

**Files:**
- Modify: `Practica_de _LP/index.html` lines 222-232 (desktop link row) and lines 254-272 (mobile menu)

**Interfaces:**
- Produces: 5 desktop elements with `data-nav-link data-target="..."`; 5 mobile elements with the same; one `<span id="nav-underline">` after the desktop link row.

- [ ] **Step 1: Edit the desktop link row (lines 222-232)**

Replace the existing `<div class="hidden md:flex gap-2 items-center">` opening tag and the 5 `<a>` tags inside it so the container carries `data-nav-row` and each link carries `data-nav-link` and `data-target`. Add `relative` to the container.

Current:
```html
<div class="hidden md:flex gap-2 items-center">
  <a class="font-label-bold text-label-bold text-primary border-b-2 border-primary pb-1 px-3 py-2"
     href="#" aria-current="page">Inicion</a>
  <a class="font-label-bold text-label-bold text-on-surface-variant hover:text-primary hover:bg-primary-container/10 px-3 py-2 rounded-lg transition-colors duration-200"
     href="#proceso">Proceso</a>
  <a class="font-label-bold text-label-bold text-on-surface-variant hover:text-primary hover:bg-primary-container/10 px-3 py-2 rounded-lg transition-colors duration-200"
     href="#requisitos">Requisitos</a>
  <a class="font-label-bold text-label-bold text-on-surface-variant hover:text-primary hover:bg-primary-container/10 px-3 py-2 rounded-lg transition-colors duration-200"
     href="#testimonios">Testimonios</a>
  <a class="font-label-bold text-label-bold text-on-surface-variant hover:text-primary hover:bg-primary-container/10 px-3 py-2 rounded-lg transition-colors duration-200"
     href="#contacto">Contacto</a>
</div>
```

After:
```html
<div class="hidden md:flex gap-2 items-center relative" data-nav-row>
  <a class="font-label-bold text-label-bold text-primary border-b-2 border-primary pb-1 px-3 py-2"
     href="#" aria-current="page" data-nav-link data-target="">Inicion</a>
  <a class="font-label-bold text-label-bold text-on-surface-variant hover:text-primary hover:bg-primary-container/10 px-3 py-2 rounded-lg transition-colors duration-200"
     href="#proceso" data-nav-link data-target="proceso">Proceso</a>
  <a class="font-label-bold text-label-bold text-on-surface-variant hover:text-primary hover:bg-primary-container/10 px-3 py-2 rounded-lg transition-colors duration-200"
     href="#requisitos" data-nav-link data-target="requisitos">Requisitos</a>
  <a class="font-label-bold text-label-bold text-on-surface-variant hover:text-primary hover:bg-primary-container/10 px-3 py-2 rounded-lg transition-colors duration-200"
     href="#testimonios" data-nav-link data-target="testimonios">Testimonios</a>
  <a class="font-label-bold text-label-bold text-on-surface-variant hover:text-primary hover:bg-primary-container/10 px-3 py-2 rounded-lg transition-colors duration-200"
     href="#contacto" data-nav-link data-target="contacto">Contacto</a>
  <span id="nav-underline" class="nav-underline" aria-hidden="true"></span>
</div>
```

- [ ] **Step 2: Edit the mobile menu links (lines 254-272)**

Replace the 5 mobile `<a>` tags so each carries `data-nav-link` and `data-target`. Also add a per-item `::before` placeholder class for the left bar. The class `nav-link-mobile` is what CSS will use to render the bar.

Current mobile links (5 of them) look like:
```html
<a class="font-label-bold text-label-bold text-primary border-b-2 border-primary pb-1 px-3 py-3 block rounded-lg"
   href="#" aria-current="page" data-menu-link>Inicion</a>
```

After (apply to all 5):
```html
<a class="font-label-bold text-label-bold text-primary border-b-2 border-primary pb-1 px-3 py-3 block rounded-lg nav-link-mobile is-active"
   href="#" aria-current="page" data-menu-link data-nav-link data-target="">Inicion</a>
```

And for the other 4:
```html
<a class="font-label-bold text-label-bold text-on-surface-variant hover:text-primary hover:bg-primary-container/10 px-3 py-3 rounded-lg block transition-colors duration-200 nav-link-mobile"
   href="#proceso" data-menu-link data-nav-link data-target="proceso">Proceso</a>
<a class="font-label-bold text-label-bold text-on-surface-variant hover:text-primary hover:bg-primary-container/10 px-3 py-3 rounded-lg block transition-colors duration-200 nav-link-mobile"
   href="#requisitos" data-menu-link data-nav-link data-target="requisitos">Requisitos</a>
<a class="font-label-bold text-label-bold text-on-surface-variant hover:text-primary hover:bg-primary-container/10 px-3 py-3 rounded-lg block transition-colors duration-200 nav-link-mobile"
   href="#testimonios" data-menu-link data-nav-link data-target="testimonios">Testimonios</a>
<a class="font-label-bold text-label-bold text-on-surface-variant hover:text-primary hover:bg-primary-container/10 px-3 py-3 rounded-lg block transition-colors duration-200 nav-link-mobile"
   href="#contacto" data-menu-link data-nav-link data-target="contacto">Contacto</a>
```

- [ ] **Step 3: Verify the file still parses**

Open `Practica_de _LP/index.html` in any editor. Confirm the 5 desktop links and 5 mobile links each carry `data-nav-link` and `data-target`. Confirm `<span id="nav-underline" class="nav-underline" aria-hidden="true">` is present after the desktop link row.

---

### Task 2: CSS — add the underline, mobile bar, click flash, and reduced-motion rules

**Files:**
- Modify: `Practica_de _LP/index.html` `<style>` block (insert after the `.card-hover-ring` rules, before `</style>` at line 209)

**Interfaces:**
- Consumes: existing CSS custom properties (none required); brand color `#4f6618` is hard-coded as fallback alongside the Tailwind primary.
- Produces: rules the JS will toggle by adding classes (`is-clicking`, `is-active`) and the underline element styles.

- [ ] **Step 1: Insert the new CSS rules**

After the existing `@media (prefers-reduced-motion: reduce) { .card-hover-ring::before { transition: none; } }` block (line 207-208) and before `</style>` (line 209), insert:

```css
/* TopNavBar link animation */
.nav-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 0;
  background: #4f6618;
  border-radius: 9999px;
  transform: translateX(0) scaleX(1);
  transition: transform 350ms cubic-bezier(0.16, 1, 0.3, 1),
              width 350ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, width;
  pointer-events: none;
}

/* Color flash on click (desktop). Overrides the link's text color
   for the duration of the .is-clicking class. The link returns to
   its resting text color when the class is removed. */
[data-nav-link].is-clicking {
  color: #4f6618;
  transition: color 180ms ease-out;
}

/* Per-item left bar for the mobile menu. Hidden by default; the
   JS toggles .is-active on the link to fade the bar in and shift
   the link's text to primary. */
.nav-link-mobile {
  position: relative;
  transition: color 200ms ease-out, padding-left 200ms ease-out;
}
.nav-link-mobile::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 60%;
  background: #4f6618;
  border-radius: 9999px;
  opacity: 0;
  transition: opacity 200ms ease-out;
}
.nav-link-mobile.is-active {
  color: #4f6618;
  padding-left: 0.75rem; /* pl-3 equivalent */
}
.nav-link-mobile.is-active::before {
  opacity: 1;
}

/* Burger button pulse. Toggled by JS for 200ms when the active
   section changes. */
#burger {
  transition: transform 200ms ease-out;
}
#burger.is-pulsing {
  transform: scale(1.08);
}

@media (prefers-reduced-motion: reduce) {
  .nav-underline,
  [data-nav-link].is-clicking,
  .nav-link-mobile,
  .nav-link-mobile::before,
  #burger {
    transition: none;
  }
}
```

- [ ] **Step 2: Verify CSS block integrity**

Open the file. Confirm the rules are inside the existing `<style>` block (between the `</style>` closer at the end of `</style>`) and that no existing rules were removed. Confirm there is no duplicate `@media (prefers-reduced-motion: reduce)` block.

---

### Task 3: JavaScript — append the new IIFE script for the underline, scroll spy, and click handler

**Files:**
- Modify: `Practica_de _LP/index.html` insert a new `<script>` element just before the existing hover-ring `<script>` at line 979

**Interfaces:**
- Consumes: `data-nav-link` and `data-target` attributes (set in Task 1), `.is-clicking` / `.is-active` / `.is-pulsing` classes (defined in Task 2), sections referenced by `data-target` (`#proceso`, `#requisitos`, `#testimonios`, `#contacto`).
- Produces: a working scroll-spy underline, click handler with color flash + grow + morph + smooth scroll, mobile bar updates, and burger pulse.

- [ ] **Step 1: Insert the new IIFE script**

Locate the line just above `<script type="module">` (around line 874, the React/testimonials block) — leave that alone. The hover-ring IIFE `<script>` is the one at lines 979-1024. Insert a new `<script>` immediately before it.

The new script:

```html
<script>
  /* TopNavBar link animation — FLIP morph + IntersectionObserver scroll spy.
     Mirrors the burger-menu IIFE style (line 811). Respects
     prefers-reduced-motion. See docs/superpowers/specs/2026-07-13-topnavbar-link-animation-design.md. */
  (function () {
    var row = document.querySelector('[data-nav-row]');
    var underline = document.getElementById('nav-underline');
    var desktopLinks = row ? Array.prototype.slice.call(row.querySelectorAll('[data-nav-link]')) : [];
    var mobileLinks = Array.prototype.slice.call(document.querySelectorAll('#mobile-menu [data-nav-link]'));
    var allLinks = desktopLinks.concat(mobileLinks);
    var burger = document.getElementById('burger');
    var nav = document.querySelector('nav[aria-label="Principal"]');

    if (!row || !underline || desktopLinks.length === 0) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
    var MORPH_MS = reduced ? 0 : 350;
    var CLICK_FLASH_MS = reduced ? 0 : 180;
    var GROW_MS = reduced ? 0 : 200;
    var PULSE_MS = 200;

    var currentTarget = ''; // current active data-target value ('' = Inicion)
    var rafPending = false;
    var lastTrigger = 0; // throttle identical morphs
    var pendingTarget = null;
    var clickLock = false;

    function targetOf(link) {
      return link ? (link.getAttribute('data-target') || '') : '';
    }

    function setMobileActive(target) {
      for (var i = 0; i < mobileLinks.length; i++) {
        var link = mobileLinks[i];
        if (targetOf(link) === target) link.classList.add('is-active');
        else link.classList.remove('is-active');
      }
    }

    function pulseBurger() {
      if (!burger || reduced) return;
      burger.classList.add('is-pulsing');
      setTimeout(function () { burger.classList.remove('is-pulsing'); }, PULSE_MS);
    }

    function placeUnderline(link, animate) {
      var r = link.getBoundingClientRect();
      var rr = row.getBoundingClientRect();
      var x = r.left - rr.left;
      underline.style.width = r.width + 'px';
      underline.style.transform = 'translateX(' + x + 'px)';
      if (animate) {
        underline.style.transition = 'transform ' + MORPH_MS + 'ms ' + EASE + ', width ' + MORPH_MS + 'ms ' + EASE;
      } else {
        underline.style.transition = 'none';
        // Force a reflow so the no-transition position is committed
        // before we re-enable transitions.
        void underline.offsetWidth;
        underline.style.transition = 'transform ' + MORPH_MS + 'ms ' + EASE + ', width ' + MORPH_MS + 'ms ' + EASE;
      }
    }

    function morphToTarget(target) {
      if (target === currentTarget) return;
      currentTarget = target;
      var link = null;
      for (var i = 0; i < desktopLinks.length; i++) {
        if (targetOf(desktopLinks[i]) === target) { link = desktopLinks[i]; break; }
      }
      if (link) placeUnderline(link, true);
      setMobileActive(target);
    }

    function scheduleMorph(target) {
      if (target === currentTarget) return;
      pendingTarget = target;
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(function () {
        rafPending = false;
        if (pendingTarget !== null) {
          var t = pendingTarget;
          pendingTarget = null;
          morphToTarget(t);
        }
      });
    }

    function scrollToTarget(target) {
      if (target === '') {
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
        return;
      }
      var el = document.getElementById(target);
      if (!el) return;
      var offset = nav ? nav.offsetHeight : 80;
      var top = el.getBoundingClientRect().top + window.pageYOffset - offset + 1;
      window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
    }

    // Click handler
    function onClick(e) {
      var link = e.currentTarget;
      var target = targetOf(link);
      if (target === currentTarget) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      clickLock = true;
      // Color flash on clicked link
      link.classList.add('is-clicking');
      setTimeout(function () { link.classList.remove('is-clicking'); }, CLICK_FLASH_MS);
      // Grow underline under clicked link (no morph, no translate).
      var r = link.getBoundingClientRect();
      var rr = row.getBoundingClientRect();
      var x = r.left - rr.left;
      underline.style.transition = 'transform ' + GROW_MS + 'ms ' + EASE + ', width ' + GROW_MS + 'ms ' + EASE;
      underline.style.width = r.width + 'px';
      underline.style.transform = 'translateX(' + x + 'px) scaleX(1)';
      // After the grow, scroll + morph
      setTimeout(function () {
        scrollToTarget(target);
        // The IntersectionObserver will pick up the new section and
        // schedule a morph. As a safety net, also schedule one here.
        scheduleMorph(target);
        setTimeout(function () { clickLock = false; }, 600);
      }, GROW_MS);
    }

    for (var i = 0; i < desktopLinks.length; i++) {
      desktopLinks[i].addEventListener('click', onClick);
    }

    // Scroll spy via IntersectionObserver
    var sectionIds = ['proceso', 'requisitos', 'testimonios', 'contacto'];
    var sections = sectionIds
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    function dominantSection() {
      // Among sections currently in the band, pick the one whose top
      // is closest to the trigger line. If none, fall back to the
      // last one if we're near the bottom of the document.
      if (sections.length === 0) return '';
      var inBand = [];
      var vh = window.innerHeight;
      for (var i = 0; i < sections.length; i++) {
        var s = sections[i];
        var rect = s.getBoundingClientRect();
        // "in band" means the section's top has crossed below the upper 30% mark
        // and the section is still in view.
        if (rect.top <= vh * 0.35 && rect.bottom > 0) {
          inBand.push({ id: s.id, top: rect.top });
        }
      }
      if (inBand.length > 0) {
        // Pick the section whose top is the largest (closest to trigger line from above).
        inBand.sort(function (a, b) { return b.top - a.top; });
        return inBand[0].id;
      }
      // Fallback: near bottom of document -> activate the last link.
      var atBottom = (window.innerHeight + window.pageYOffset) >= (document.documentElement.scrollHeight - 4);
      if (atBottom) return 'contacto';
      return '';
    }

    function onScroll() {
      if (clickLock) return;
      var t = dominantSection();
      scheduleMorph(t);
    }

    if ('IntersectionObserver' in window && sections.length > 0) {
      // Use IO for cheap notifications; dominantSection() still
      // picks the winner from the entries.
      var io = new IntersectionObserver(function (entries) {
        // entries are batched; just re-evaluate the dominant section.
        onScroll();
      }, {
        root: null,
        rootMargin: '-30% 0px -65% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      });
      for (var j = 0; j < sections.length; j++) io.observe(sections[j]);
      // Also listen to scroll for the bottom-of-document fallback.
      window.addEventListener('scroll', onScroll, { passive: true });
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Re-measure on resize and after fonts load (link widths can change).
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var link = null;
        for (var i = 0; i < desktopLinks.length; i++) {
          if (targetOf(desktopLinks[i]) === currentTarget) { link = desktopLinks[i]; break; }
        }
        if (link) placeUnderline(link, false);
      }, 100);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        var link = null;
        for (var i = 0; i < desktopLinks.length; i++) {
          if (targetOf(desktopLinks[i]) === currentTarget) { link = desktopLinks[i]; break; }
        }
        if (link) placeUnderline(link, false);
      });
    }

    // Burger pulse on scroll-driven section changes (independent of
    // morph — the morph is a visual continuity cue; the pulse is a
    // subtle confirmation that something changed).
    var lastDominant = '';
    var io2 = ('IntersectionObserver' in window)
      ? new IntersectionObserver(function (entries) {
          var t = dominantSection();
          if (t !== lastDominant) {
            lastDominant = t;
            pulseBurger();
          }
        }, { root: null, rootMargin: '-30% 0px -65% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] })
      : null;
    if (io2) {
      for (var k = 0; k < sections.length; k++) io2.observe(sections[k]);
    }

    // Boot: place the underline under the initial active link with no animation.
    placeUnderline(desktopLinks[0], false);
  })();
</script>
```

- [ ] **Step 2: Verify the file is well-formed**

Open the file. Confirm the new `<script>` is placed between the existing burger-menu `<script>` (ends ~line 873) and the React `<script type="module">` (line 874), or alternatively between the React script and the hover-ring `<script>` at line 979 — both work. The crucial check: it must NOT be *inside* either of the existing IIFEs, and the closing `</script>` must be present.

---

### Task 4: Smoke-test the page

**Files:**
- None modified.

- [ ] **Step 1: Start the dev server**

Run from the repo root (`/Users/eloy/Downloads/Practica_de _LP `):

```bash
node "Practica_de _LP/serve.mjs"
```

The server listens on `http://localhost:5500` by default. If that port is in use, it will print the actual port; use that URL.

Expected output: a line like `Server running at http://localhost:5500`.

- [ ] **Step 2: Open the page in a browser**

Open `http://localhost:5500` in Chrome (with DevTools open, mobile emulation off initially). The TopNavBar should look identical to before on first paint, except that a 2px primary-colored underline should be visible under the "Inicion" link.

- [ ] **Step 3: Click each link and verify**

For each of the 5 desktop links (Inicion, Proceso, Requisitos, Testimonios, Contacto):
- Click the link.
- Verify the link's text color flashes from `on-surface-variant` to `primary` briefly.
- Verify the underline grows under the clicked link.
- Verify the page smooth-scrolls so the target section's top is just below the navbar.
- Verify the underline morphs to sit under the destination link.

- [ ] **Step 4: Scroll and verify the scroll spy**

Scroll the page slowly from top to bottom. The underline should follow: Inicion → Proceso → Requisitos → Testimonios → Contacto.

- [ ] **Step 5: Resize across the md breakpoint**

Drag the window from desktop width to mobile width. The desktop underline should disappear (it is `position: absolute` inside the desktop row, which is `hidden` below md). Open the mobile menu via the burger button; the active mobile link should show a 2px left bar and `text-primary`.

- [ ] **Step 6: Toggle reduced motion**

In OS settings (or DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce"), enable reduced motion. Reload. Verify all transitions complete instantly and there is no color flash.

- [ ] **Step 7: Stop the dev server**

Stop the server with `Ctrl-C` in the terminal where it is running. Do not leave it running between sessions.

---

### Task 5: Final review and commit

- [ ] **Step 1: Diff review**

Run `git diff` (or compare files) and confirm the changes are limited to:
- The 5 desktop links and 5 mobile links (added data attributes only).
- The desktop link row's container (added `relative` and `data-nav-row`).
- One new `<span id="nav-underline">` after the desktop link row.
- One CSS block appended inside the existing `<style>` (no edits to existing rules).
- One new `<script>` appended before the hover-ring `<script>` at line 979.

Verify that the existing burger-menu IIFE (lines 811-872), the React `<script type="module">` (lines 874-977), the hover-ring IIFE (lines 979-1024), and all other sections are byte-identical to their previous state.

- [ ] **Step 2: Hand off**

The implementation is complete. The user reviews the result and the spec file at `Practica_de _LP/docs/superpowers/specs/2026-07-13-topnavbar-link-animation-design.md` for traceability.
