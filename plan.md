# Small Interactive PRD

## Problem
The project owner has a compact storefront where catalog browsing, cart management, and checkout all live on one page. That makes it hard to demonstrate that each feature has a dedicated view, and it does not satisfy the GitHub issue request to prove the app has separate pages with a recorded walkthrough.

## Smallest Useful Version
Keep the existing storefront features and state, but split the UI into dedicated views reachable from in-app navigation:

- Catalog page: product search, category filter, sorting, and add-to-cart buttons.
- Cart page: cart rows, quantity edits, removal, totals, and empty cart state.
- Checkout page: checkout form, validation, disabled state when cart is empty, and order confirmation.

Use a small client-side route mechanism, likely hash routes such as `#/catalog`, `#/cart`, and `#/checkout`, so the Vite app remains static and does not need router dependencies. Cart and checkout state should survive moving between views during the same browser session.

## Implementation Plan
- Update `src/main.ts` to introduce a tiny view model for the active page, render shared header/navigation, and render only the active feature section while preserving the existing cart and checkout state closures.
- Reuse the existing catalog, cart, and checkout rendering logic in `src/main.ts`; extract small render helpers only where it keeps the file readable.
- Update `src/main.test.ts` to cover navigation between catalog, cart, and checkout views, including state persistence after adding an item and moving pages.
- If needed, adjust `src/styles.css` only for active navigation and page layout polish.
- Record a Playwright video after implementation showing the user moving through the different pages.

## Acceptance Criteria
- Catalog, cart, and checkout are available as separate navigable views with distinct route state or URLs.
- Each feature page shows only its dedicated primary content, plus shared app header/navigation.
- Adding a product on the catalog page is reflected on the cart page without losing state.
- Checkout validation and confirmation still work after navigating from catalog to cart to checkout.
- A Playwright video is recorded that visibly proves switching between the separate pages.

## Validation Commands
- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run build`
- `npx playwright --version`
- `npm run dev -- --host 127.0.0.1`
- Record a Playwright browser video that visits the catalog, cart, and checkout routes and attach it to the issue workflow output.
