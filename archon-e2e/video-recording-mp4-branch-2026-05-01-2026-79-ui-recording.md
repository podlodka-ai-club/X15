# UI Recording Summary

Issue: #79
Session: video-recording-mp4-branch-2026-05-01-2026

## App path tested

Recorded the Vite storefront happy path:

1. Opened the storefront at `http://127.0.0.1:4177/`.
2. Waited for the main storefront heading to load.
3. Searched the catalog for `lamp`.
4. Added the Adjustable Desk Lamp to the cart.
5. Filled checkout details.
6. Submitted the order.

## Commands used

- `npm ci`
- `npm run dev -- --host 127.0.0.1 --port 4177`
- `node /home/ubuntu/.archon/workspaces/podlodka-ai-club/X15/artifacts/runs/7d09807ed91b75c7c462d182a21ad06c/playwright-recording/record-storefront.mjs`
- `ffmpeg -y -i storefront-checkout.webm -c:v libx264 -pix_fmt yuv420p -movflags +faststart video-recording-mp4-branch-2026-05-01-2026-79-ui-recording.mp4`

## Assertion made

The Playwright script asserted visible outcomes during the flow:

- `Everyday goods for focused work` loaded on the page.
- Searching `lamp` showed `1 of 4 products shown`.
- Adding the item showed `1 items selected, $72.00 subtotal`.
- Submitting checkout showed a visible `Order confirmed:` message.

## Recording location

Final MP4:

`/home/ubuntu/.archon/workspaces/podlodka-ai-club/X15/artifacts/runs/7d09807ed91b75c7c462d182a21ad06c/archon-e2e/video-recording-mp4-branch-2026-05-01-2026-79-ui-recording.mp4`

