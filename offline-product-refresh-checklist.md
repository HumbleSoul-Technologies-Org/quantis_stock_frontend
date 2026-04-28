# Offline Product Refresh Regression Checklist

This document captures the manual verification steps for the offline product refresh bug fix.

## Goal

Ensure offline-created products are preserved after refresh and remain available in the stock movement form.

## Steps

1. Start the app and sign in.
2. Disable network or switch the app to offline mode.
3. Create a new product while offline.
   - Confirm the product appears in the product list immediately.
   - Confirm the product is available in the stock movement form product selector.
4. Refresh the browser.
   - Confirm the product still appears in the product list.
   - Confirm the product still appears in the stock movement form selector.
5. Re-enable network connectivity.
6. Confirm sync eventually runs and the offline-created product remains visible.
7. Confirm localStorage still contains the offline product under `erp_system_state`.

## Expected Behavior

- Offline-created products are cached locally and not discarded on refresh.
- The stock movement form shows the product even before server sync completes.
- Once the product syncs to the server, it remains in the product list normally.

## Notes

- The fix merges server-fetched products with locally cached products instead of replacing them.
- If the offline product disappears after refresh, inspect `context/DataContext.tsx` and `lib/storage.ts` for merge or persistence issues.
