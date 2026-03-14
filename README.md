## Employee Insights Dashboard

4-screen Employee Insights Dashboard (Login, List, Details, Analytics) built with **React + Vite** and **Tailwind CSS**. No UI libraries or virtualization libraries are used; the grid and charts are all custom DOM/SVG.

### Credentials

- **Username**: `testuser`
- **Password**: `Test123`

### Features

- **Secure Auth** with Context + `localStorage` (route protection and refresh persistence).
- **High-performance grid** on `/list` with custom virtualization (only visible rows + buffer are rendered).
- **Identity verification** on `/details/:id` using the browser camera + HTML5 canvas signature overlay.
- **Audit image merge** (photo + signature combined into a single PNG data URL).
- **Analytics** on `/analytics` with a raw SVG salary chart and a hardcoded SVG city map (no map/chart library).

### Run locally

From the `frontend` folder:

```bash
npm install
npm run dev
```

The app will start on `http://localhost:5173` (default Vite port).

### Backend API

The app uses the provided backend only; no custom DB is required:

- `POST https://backend.jotish.in/backend_dev/gettabledata.php`
- Body: `{ "username": "test", "password": "123456" }`
- The response is normalised in `frontend/src/api/tableApi.js` into objects with `{ id, name, city, salary }` fields.

### Geospatial Mapping

- Cities are plotted on a **hand-tuned SVG coordinate system** (not real lat/long) inside `AnalyticsPage.jsx` (`CITY_COORDS`).
- The background path approximates the outline of India; no map library (Leaflet/Google Maps, etc.) is used.

### Intentional Bug (Required by Assignment)

**Type**: Performance bug / memory leak from an un-cleaned global event listener.

- **Location**: `frontend/src/pages/ListPage.jsx`
-**Line**: Line 17-Line 26
- **Code**: a `window.addEventListener('resize', onResize)` is set up inside a `useEffect` with **no cleanup**.
- **Effect**:
  - Every time the List page is mounted, another `resize` listener is added and never removed.
  - Over time this causes unnecessary work on window resizes and a slow-growing memory footprint.
  - The bug is small enough not to break UX, but it intentionally violates best practices to satisfy the assignment’s “one vulnerability” rule.

