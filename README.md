# Habesha Wear

Full-stack ecommerce platform for traditional wear, built with a React + Vite frontend and an Express + MongoDB backend.

## Tech Stack

- Frontend: React 19, Vite, Redux Toolkit, React Router, Axios, Tailwind CSS
- Backend: Node.js, Express 5, MongoDB (Mongoose), Joi validation, JWT auth, cookie-based sessions
- Media: Cloudinary (product image uploads)
- Deploy: Render (backend), Vercel-compatible frontend setup

## Repository Structure

```text
habesha-wear/
├── backend/            # Express API + MongoDB models/routes
├── frontend/           # React/Vite web app
└── render.yaml         # Render deployment config for backend
```

## Features

- Role-based auth (`customer`, `vendor`, `admin`, `owner`) with HttpOnly JWT cookie
- Product catalog with:
  - Featured products
  - Search and category filtering
  - Product status workflow (`pending`, `active`, `archived`)
  - Rating system (customer-only)
- Cart management with quantity updates and normalization
- Checkout and order creation with delivery/payment method support
- Admin dashboards for users, products, pending approvals, carts, and orders
- Stats endpoint for dashboard metrics

## Prerequisites

- Node.js 18+
- npm
- MongoDB (local or hosted)
- Cloudinary account (required for image uploads)

## Environment Variables

### Backend (`backend/.env`)

Create `backend/.env` with:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost/habesha-wear
JWT_PRIVATE_KEY=replace-with-a-long-random-secret
FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Notes:

- If `MONGO_URI` is missing, backend falls back to `mongodb://localhost/habesha-wear`.
- If Cloudinary variables are missing, backend starts but uploads will fail.

### Frontend (`frontend/.env`)

For local development, this is optional because Vite proxies `/api` to `http://localhost:3000`.

For remote backend usage, add:

```env
VITE_BACKEND_URL=https://your-backend-domain.com
```

## Local Development

Run backend and frontend in separate terminals.

### 1) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Start backend

```bash
cd backend
npm run dev
```

Backend health check: `GET http://localhost:3000/health`

### 3) Start frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## Available Scripts

### Backend (`backend/package.json`)

- `npm run dev` - start backend
- `npm start` - start backend

### Frontend (`frontend/package.json`)

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## API Overview

Base URL (local): `http://localhost:3000`

### Health

- `GET /health`

### Users (`/api/users`)

- `GET /` - list users (admin/owner)
- `GET /me` - current user profile
- `POST /` - register
- `POST /login` - login
- `POST /logout` - logout
- `DELETE /:id` - delete user (admin/owner restrictions apply)
- `POST /add-admin` - create admin (owner only)

### Products (`/api/products`)

- `GET /featured` - top-rated featured products
- `GET /` - product list (supports query params: `q`, `category`, `status`, `page`, `limit`, `mine`, `excludeFeatured`)
- `GET /:id` - single product
- `POST /` - create product (admin/owner)
- `PUT /:id` - decrease stock for ordering flow
- `DELETE /:id` - delete product (admin/owner)
- `PUT /:id/status` - update status (admin/owner)
- `PUT /:id/stock` - set stock (vendor/admin/owner)
- `PUT /:id/rating` - rate product (customer)

### Orders (`/api/orders`)

- `GET /` - list orders (role-based)
- `POST /` - create order
- `PUT /:id` - update order status (admin/owner)
- `DELETE /:id` - delete order (admin/owner)

### Carts (`/api/carts`)

- `GET /` - list carts (role-based)
- `POST /` - create cart
- `PUT /` - update current customer cart
- `DELETE /` - delete current customer cart
- `DELETE /:id` - delete any cart (admin/owner)

### Stats (`/api/stats`)

- `GET /` - dashboard counts for products/users/pendingProducts/orders/carts

## Authentication & CORS

- Auth uses JWT stored in an HttpOnly cookie named `token`.
- Backend enables CORS for:
  - `http://localhost:5173`
  - `https://habesha-wear-rjdd.vercel.app`
  - `FRONTEND_URL` from env (if set)
- `withCredentials` is enabled in frontend Axios calls.

## Deployment

### Backend (Render)

`render.yaml` defines a Node web service rooted at `backend/`:

- Build command: `npm install`
- Start command: `npm start`
- Health check: `/health`

Set the secret env vars in Render dashboard:

- `MONGO_URI`
- `JWT_PRIVATE_KEY`
- `FRONTEND_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Frontend

Deploy `frontend/` to your preferred static host (for example, Vercel/Netlify).

Recommended production env:

- `VITE_BACKEND_URL=https://your-backend-domain.com`

## Troubleshooting

- Login succeeds but requests are unauthorized:
  - Ensure backend `FRONTEND_URL` matches the frontend origin exactly.
  - Ensure browser accepts cross-site cookies in production (`secure` + `SameSite=None`).
- Product image uploads fail:
  - Verify all three Cloudinary env vars are configured.
- API calls hit wrong backend:
  - Check `VITE_BACKEND_URL` and restart frontend dev server after env changes.

## License

ISC
