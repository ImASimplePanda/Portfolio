---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["catalogo.html","libro.html","carrito.html","deseados.html","cuenta.html"]
---

# Bookit storefront (home + catalogue + book + cart + wishlist + account)

Mode: Persuade (home) / Operate (catalogue, cart, account). Audience: general public, local readers near the physical shop. Job: find a book, buy it or reserve it (pre-order or collect in store). Proof: the shop exists, booksellers sign recommendations. Constraints: static HTML/CSS/JS + PHP/MySQL, no build. Shop address, hours, staff names pending from client.

## Direction contract

THESIS: Bookit is a paperback series. Every screen is a cover built on one three-band module (genre colour / white title panel / genre colour). Refuses the category default of cream paper, elegant serif and a shelf-of-spines hero.

OWN-WORLD: Cold white paper #FAFAF7 and ink #16181B; genre cloth colours: narrativa orange, negra bottle green, ensayo cobalt, poesia/clasicos cherry, infantil yolk yellow. Sofia Sans superfamily in three widths (Extra Condensed spines/labels, Condensed headings, regular body). Square corners, no shadows, bands and white panels only. Primary buttons in ink. Raise (from seven-segment): unavailable / pre-order covers drawn as ghost outlines that fill with colour on release. Raise (from azulejo): layouts recompose by whole band units, never fractional.

STORY: visitor sees it is a real bookshop that will hold a book at the counter, searches or browses by colour, reserves or buys in two taps, signs in to keep a wishlist.

FIRST VIEWPORT: page as one cover. Top band (colour of the chosen collection) holds logo, nav, deseados/cuenta/cesta. White panel, left-aligned: two-line headline "Lo apartamos hoy. / Lo recoges mañana.", working search, secondary link to preventa. Right: the chosen collection's lead title as a large flat cover standing on the bottom band. Bottom band: collection switcher plus a shelf of up to 5 more covers of that collection (scroller on mobile); switching retints every band. Decision recorded after finish review: the shelf shows the chosen collection, not a fixed novedades row, because the switch is the signature interaction.

FORM: assigned grounded candidate 4 of 7 (publisher series identity program); seed key f569f4b2. Signature interaction: choosing a collection retints every band on the page (CSS custom property + view transition); cover to book detail morph.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
