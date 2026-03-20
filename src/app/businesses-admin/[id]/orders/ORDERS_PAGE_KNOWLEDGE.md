# Orders Page Documentation

This document explains the structure and behavior of the business orders page:

- Route: `src/app/businesses/[id]/orders/page.tsx`
- Purpose: manage active orders and view order history in one page

## Architecture

The page is now a container that composes reusable components from `src/components/orders/`.

### Container page

- `src/app/businesses/[id]/orders/page.tsx`
- Responsibilities:
  - hold page state (`activeSection`, `pendingOrders`)
  - prepare derived lists (`liveOrders`, `historyOrders`)
  - pass data/callbacks to presentational components

### Reusable components

- `src/components/orders/types.ts`
  - shared types: `OrderSection`, `OrderItem`, `PendingOrderItem`

- `src/components/orders/PendingOrdersRibbon.tsx`
  - top "Action Required" area for pending orders
  - accepts `pendingOrders` and `onAccept(id)`

- `src/components/orders/OrdersStatsBar.tsx`
  - KPI cards for section-level summary

- `src/components/orders/OrderSectionTabs.tsx`
  - switch between `orders` and `history`

- `src/components/orders/OrdersTable.tsx`
  - searchable table shell and order rows
  - displays section-aware title and empty state

- `src/components/orders/StatusBadge.tsx`
  - status pill style mapping (`Pending`, `Processing`, `Ready`, `Completed`, `Cancelled`)

- `src/components/orders/StatCard.tsx`
  - visual card primitive used in stats bar

## Behavior

## 1) Section switching

`activeSection` values:
- `orders` => show live orders
- `history` => show completed/cancelled orders

`OrderSectionTabs` controls this state.

## 2) Pending ribbon visibility

`PendingOrdersRibbon` is rendered only when:
- `activeSection === "orders"`
- `pendingOrders.length > 0`

## 3) Derived datasets

The container computes:
- `liveOrders`: excludes `Completed` and `Cancelled`
- `historyOrders`: includes only `Completed` and `Cancelled`
- `visibleOrders`: selected by current section

## 4) Accept action

`handleAcceptOrder(id)` removes one pending order from local state.
(Replace with API mutation when backend is connected.)

## Testing

Added unit tests with Jest + React Testing Library.

### Test files

- `src/__tests__/components/orders/OrderSectionTabs.test.tsx`
  - renders tabs
  - triggers `onChange("history")`

- `src/__tests__/components/orders/OrdersTable.test.tsx`
  - section title rendering
  - empty state rendering
  - row content rendering

### Test setup

- `jest.config.ts`
- `jest.setup.ts`
- `package.json` scripts:
  - `npm test`
  - `npm run test:watch`

## Notes for future integration

- Orders now use React Query + service layer:
  - service: `src/services/orderService.ts`
  - hook: `src/hooks/orders/orderHook.ts`
  - types: `src/types/order.ts`
- Endpoint: `GET /orders` with query support:
  - `customer_id`
  - `business_id`
  - `status`
  - `page`
  - `size`
- Move filtering/search into controlled state and apply to `visibleOrders`.
- Wire accept/reject/manage actions to backend endpoints.
- Keep page as container + components to preserve current modular structure.
