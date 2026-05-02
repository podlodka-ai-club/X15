# X15

Repository for the X15 project by [Podlodka AI Club](https://github.com/podlodka-ai-club).

## Overview

This repository is part of the Podlodka AI Club initiative. It now includes a small vanilla TypeScript ecommerce storefront skeleton for X15.

## Ecommerce Behavior

The storefront is a client-side ecommerce shell. Products, cart state, pricing, checkout validation, and order confirmation are all handled locally in the browser.

### Catalog

- Products are defined in `src/main.ts` with `id`, `name`, `description`, `price`, and `category`.
- Search matches product name, description, and category case-insensitively.
- Category filtering uses either `all` or an exact product category.
- Sorting supports featured order, price low-to-high, and price high-to-low.

### Cart

- Cart state is in memory for the current page session.
- Adding a product creates a quantity of `1`; adding the same product again increments the existing row.
- Removing a product filters it out by product id.
- Updating quantity to `0` or lower removes the item; fractional quantities are rounded down.

### Pricing

- Subtotal is `price * quantity` across all cart items.
- Shipping is free when subtotal is `$0` or at least `$250`; otherwise shipping is `$12`.
- Tax is `8%` of subtotal.
- Currency totals are rounded to two decimal places.

### Checkout

- Checkout requires name, valid email, shipping address, and at least one cart item.
- Empty carts keep checkout disabled.
- Valid checkout creates a local confirmation; no payment provider or backend request is used.
- Confirmation IDs use `X15-{itemCount}-{totalCents}-{checksum}`.

### UI States

- The catalog shows an empty message when filters match no products.
- The cart shows an empty state and total when no products have been added.
- Checkout errors render inline beside the relevant fields.

## Getting Started

```bash
git clone git@github.com:podlodka-ai-club/X15.git
cd X15
npm install
npm run dev
```

## Validation

```bash
npm run type-check
npm run lint
npm run format:check
npm run test
npm run build
```

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

## License

To be determined.
