# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/vanilla JS + PHP (no build step). Database: MySQL on Hostinger via PDO; SQLite fallback for local testing with the same code. Deploy target: Hostinger (never publish without explicit user confirmation).

## Users

General public — any reader, from the occasional gift buyer to the person who reads two books a month. They arrive either knowing the book they want (search → reserve/buy fast) or not knowing (browse → be guided by a bookseller's recommendation). A share of them live near the physical shop and prefer to pick up in store.

## Product Purpose

Bookit is a physical bookshop with an online counter. The web exists to:
1. Sell books online (cart → order).
2. Take reservations: **pre-orders of upcoming releases** and **reserve-and-collect in store** (pay on pickup).
3. Bring people to the shop and to the brand (audience building).

Success = completed orders + reservations, and returning signed-in users with wishlists.

## Positioning

A real shop with real booksellers behind the website: every recommendation is signed by a person, every book can be held for you at the counter. A pure online retailer can't truthfully claim "we'll keep it aside for you until Saturday".

## Operating Context

- Signed-in accounts (email + password, stored hashed in MySQL).
- Product catalogue (books: title, author, cover, price, format, stock, publication date for pre-orders).
- Cart (guest in localStorage, synced to account on login) and wishlist (account-bound).
- Fulfilment choice per order: home delivery or collect in store.
- Pre-order: book with a future release date; reserved now, charged/collected on release.

## Capabilities and Constraints

- Login/registration with database, product listing + detail, cart, wishlist, checkout flow (payment gateway **undecided** — checkout records the order/reservation; real payment integration is out of scope until the user provides a provider).
- Shop address, opening hours, phone, legal data: **not provided** — placeholders must be clearly marked for the user to fill.
- No build tooling, no npm.

## Brand Commitments

Name: Bookit. No logo, tone or references provided — visual identity to be created.

## Evidence on Hand

None. No real reviews, sales figures, press, staff names or photos. Do not fabricate testimonials, ratings or customer counts. Book data uses real published titles (public bibliographic facts) with free-licence or generated imagery.

## Product Principles

1. The shop is the proof: show the physical place and the people, not abstract "experience".
2. Two speeds: the reader who knows what they want reaches reserve/buy in two taps; the browser gets guided.
3. Reserving is as first-class as buying — never hidden behind checkout.
4. Account value is visible: wishlist and reservations are reasons to sign in, not a wall.

## Accessibility & Inclusion

WCAG 2.2 AA. Broad public including older readers: generous type, clear contrast, full keyboard navigation.
