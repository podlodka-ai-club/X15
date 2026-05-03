# Recording summary

Tested the Vite ecommerce storefront happy path.

Run method:
- Installed repo dependencies with `npm ci`.
- Started the app with `npm run dev -- --host 127.0.0.1 --port 4173`.
- Used a temporary Playwright harness under the run directory to record Chromium video.
- Converted the Playwright `.webm` recording to MP4 with `ffmpeg`.

Flow recorded:
- Loaded the storefront and verified the Products heading was visible.
- Searched for `planner`.
- Added Desk Planner to the cart.
- Filled checkout details for Avery Stone.
- Placed the order.

Assertion passed:
- The checkout confirmation became visible and matched `Confirmation ORDER-*`.

Local recording:
`/home/ubuntu/.archon/workspaces/podlodka-ai-club/X15/artifacts/runs/8edcb34c7ead5f90038ee1d94feeaaa2/playwright-recording/ecommerce-checkout-recording.mp4`
