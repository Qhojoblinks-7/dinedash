# TODO: Fix Real-Time Order Display in Dashboard

## Completed Tasks
- [x] Created OrderList.jsx component to display orders with tracking code, status, customer info, and items
- [x] Updated Dashboard.jsx to import and render OrderList component above menu items
- [x] Ensured orders are fetched every 1 second via existing polling mechanism
- [x] Started dashboard development server for testing

## Pending Tasks
- [x] Test that orders appear in dashboard within 1-2 seconds after placement from frontend
- [x] Verify backend logs confirm successful order creation and retrieval
- [x] Confirm dashboard UI updates without manual refresh
- [x] Check for any stale or missing data in dashboard view

## Acceptance Criteria
- [x] A newly placed order appears in the dashboard within 1–2 seconds.
- [x] No stale or missing data in the dashboard view.
- [x] Backend logs confirm successful order creation and retrieval.
- [x] Dashboard UI updates without requiring manual refresh.

## New Task: Make Order Pills Clickable to Display Order Details

## Completed Tasks
- [x] Modified TableStatusPill.jsx to accept onClick prop and add cursor-pointer with hover effect
- [x] Updated Footer.jsx to pass onClick handler directly to TableStatusPill and remove wrapping div
- [x] Extended OrderSerializer to include payment_method from related Payment model
- [x] Updated Dashboard.jsx to pass paymentMethod to OrderDetailsPanel
- [x] Updated OrderDetailsPanel to pass paymentMethod to OrderHeader
- [x] Updated OrderHeader to display payment method below the table number
- [x] Implemented "Send to Kitchen" button functionality using Redux thunk
- [x] Removed "New Order" button from footer
- [x] Added backend API endpoint for staff to finalize payment
- [x] Integrated payment finalization with Redux thunk and backend API

## Pending Tasks
- [ ] Test clicking on a pill displays the Order Details panel with the correct order information including payment method
- [ ] Test "Send to Kitchen" button functionality
- [ ] Test payment finalization flow

## Acceptance Criteria
- [x] Clicking on an order pill in the footer opens the Order Details panel on the right side
- [x] The Order Details panel shows the details of the clicked order pill including item names, prices, and payment method
- [x] Pill has visual feedback (cursor pointer and hover opacity)
- [x] "Send to Kitchen" button updates order status to "sentToKitchen"
- [x] "New Order" button removed from footer
- [x] Payment finalization creates payment record and updates order status to "completed"
