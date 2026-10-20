# Interface Review — Web Interface Guidelines

Reviewed against the pinned Vercel Web Interface Guidelines snapshot.
Files: `index.html`, `style.css`, `app.js`, `cafe-core.js`.

## index.html

```
index.html - icon-only buttons all have aria-label (sheetClose, lightboxClose, lightboxPrev, lightboxNext)
index.html - cart clear has aria-label and visible text
index.html - search input is wrapped in a <label> with an sr-only span
index.html - name, type, table, note fields all have visible <label for>
index.html:253,428,441,446 - placeholders use … where they describe empty state
index.html:428,441,446 - autocomplete + name + inputmode + maxlength present
index.html:9 - meta theme-color matches the paper canvas
index.html:5 - no maximum-scale / user-scalable=no
index.html:45,369 - brand strings marked translate="no"
index.html:400 - destructive clear action asks for confirmation before emptying
index.html - semantic <nav>, <section>, <button>, <table>, skip link present
```

## style.css

```
style.css:112 - global :focus-visible ring exists
style.css:1101,2224,2317 - outline:none always paired with border + 3px shadow ring
style.css:100 - touch-action: manipulation
style.css:2030,2113 - overscroll-behavior: contain on sheet and lightbox
style.css:383,418,645,657,830,1626 - text-wrap: balance / pretty on headings and ledes
style.css:909,933,1102,1113,1163,1528,1547,1934,1973,2153,2196,2251 - tabular-nums on number columns
style.css:55 - color-scheme: light; the site is intentionally light-only
style.css:2895,2943 - transition properties for motion-off and reduced motion
style.css - no transition: all, no outline:none without replacement
```

## app.js

```
app.js:203 - Intl.DateTimeFormat with fixed en-US parse locale, then mapped to day index
app.js:1120 - focus trap wraps first/last control in dialogs
app.js:1175 - IntersectionObserver for scrollspy with rAF + passive scroll listener
app.js:248,745,902 - forced reflow reads only inside event/rAF callbacks, never in render loops
app.js:318,361,441,512,537,545,629,658,793,798 - innerHTML writes built from escaped data or literal markup
app.js:820 - item note placeholder uses …
```

## cafe-core.js

```
cafe-core.js - Intl.NumberFormat("id-ID") for currency
cafe-core.js - pure functions, no DOM, no layout reads
cafe-core.js - input normalization before formatting
```

## Pass 2 — motion polish (20 Oct 2026)

```
style.css:261 - transition: right → transform: scaleX (layout animation removed)
style.css:305,872,1310,1728 - :hover movement moved inside (hover: hover) and (pointer: fine)
style.css:2345 - lightbox entry uses @starting-style
style.css:2087 - sheet close 42px → 44px touch target
style.css:3013 - print forces [data-enter] visible
app.js:699 - WAAPI count pulse replaces class toggle + offsetWidth reflow
```

Re-check: axe 0 violations on mobile (46 passes) and desktop (45 passes), console
and page errors clean, FCP 216 ms, TTFB 2.2 ms, CLS 0. Full findings and the
approval decision are in `docs/motion-review.md`.

## Result

No guideline violations that require a code change remain. Two judgment calls:

1. `Contoh: 5` on the table input is an example pattern, not a loading hint, so it
   does not need a trailing ellipsis.
2. `color-scheme: light` is explicit because the brand has no dark theme. Dark-mode
   native controls are therefore not a concern.
