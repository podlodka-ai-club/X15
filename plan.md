# Small Interactive PRD

## Problem
The project owner currently has the whole storefront experience on one page. That makes it harder to show that catalog browsing, cart review, and checkout are separate product features, and it gives no obvious page-to-page proof for the requested demo video.

## Smallest Useful Version
Add a tiny client-side page switcher with dedicated views for Catalog, Cart, and Checkout. The navigation should update the visible page without losing in-memory cart or checkout state, and each feature should have its own heading and URL hash such as `#/catalog`, `#/cart`, and `#/checkout`.

## Implementation Plan
- Update `src/main.ts` to introduce a small route/page state, render top-level navigation, and show only the active feature section.
- Keep the existing catalog, cart, and checkout render functions and shared state, moving existing sections into page-specific containers instead of rewriting feature logic.
- Update `src/main.test.ts` with focused DOM tests for default route, nav/hash switching, and cart state surviving between pages.
- Adjust `src/styles.css` only as needed for the navigation and active page layout.

## Acceptance Criteria
- Opening the app shows the Catalog page by default with product cards visible.
- Navigation exposes separate Catalog, Cart, and Checkout views, and only the selected feature page is visible.
- The URL hash changes when switching pages and direct hashes open the matching view.
- Adding a product on Catalog, moving to Cart, and then Checkout preserves the cart state.
- A Playwright-recordable browser run can visibly demonstrate switching across the three pages.

## Validation Commands
- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run build`
- `npx playwright install --with-deps chromium`
- `npx playwright open --save-har /tmp/x15-pages.har`
