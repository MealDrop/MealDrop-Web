# MealDrop

MealDrop is a full-stack food ordering platform for customers and restaurants in Barasat, India. It includes a customer ordering experience, a restaurant management dashboard, and a REST API backed by MongoDB.

## Features

### Customers

- Browse restaurants and menus
- Search for restaurants and dishes with keyword matching or optional Gemini-powered smart search
- View restaurant details and dish information
- Add items to a cart and place orders
- Track active orders and order status
- Create an account, manage a profile, and review past orders
- Submit restaurant reviews
- Upload profile or restaurant images through Cloudinary when configured

### Restaurants

- Register and complete restaurant setup
- Manage restaurant information and menu items
- Add, edit, and remove dishes
- View incoming and historical orders
- Update order statuses
- Manage a restaurant profile

## Project Structure

```text
MealDrop-Web/
├── backend/                 # Express API and MongoDB models
│   ├── config/              # Database and Cloudinary configuration
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Authentication, roles, uploads, errors
│   ├── models/              # Mongoose models
│   ├── routes/              # API route definitions
│   ├── utils/               # Tokens, OTPs, email, and smart search
│   ├── app.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── customer/            # Customer React/Vite application
│   └── restaurant/          # Restaurant React/Vite application
└── README.md
```

## Technology Stack

- **Frontend:** React 19, React Router, Vite, Axios, Lucide React
- **Backend:** Node.js, Express 5, Mongoose, JWT, Multer, Morgan
- **Database:** MongoDB
- **Media storage:** Cloudinary (optional for local API development)
- **Email:** Brevo API (used for transactional email such as OTP flows)
- **Smart search:** Google Gemini API with a keyword fallback

## Prerequisites

- Node.js 18 or newer
- npm
- A MongoDB database, local or hosted
- A terminal that can run three development processes

The optional integrations require their own accounts and credentials:

- Cloudinary for image uploads
- Brevo for email delivery
- Google Gemini for AI-assisted search

## Installation

Clone the repository and install dependencies in each application:

```bash
git clone <repository-url>
cd MealDrop-Web

cd backend
npm install

cd ../frontend/customer
npm install

cd ../restaurant
npm install
```

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/mealdrop
JWT_SECRET=replace-with-a-long-random-secret

# Optional: image uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional: Gemini smart search
GEMINI_API_KEY=

# Optional: Brevo transactional email
BREVO_API_KEY=
BREVO_FROM=MealDrop <no-reply@mealdrop.app>
```

Create a `.env` file in either frontend if the API is not running at the default URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Do not commit environment files or API credentials. The backend needs `MONGODB_URI` and `JWT_SECRET` to start correctly. Gemini, Cloudinary, and Brevo are optional; the application falls back or reports the relevant integration as unavailable when they are not configured.

## Running Locally

Start the backend from `backend/`:

```bash
npm run dev
```

The API runs at `http://localhost:5000` by default. Verify it with:

```text
GET http://localhost:5000/api/health
```

Start the customer frontend in a second terminal:

```bash
cd frontend/customer
npm run dev
```

Start the restaurant frontend in a third terminal:

```bash
cd frontend/restaurant
npm run dev
```

Vite prints the exact local URLs after startup. Its default port is typically `5173`; if that port is already in use, Vite selects another available port.

## Available Scripts

### Backend

Run these commands from `backend/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with Nodemon |
| `npm start` | Start the API with Node.js |

### Customer frontend

Run these commands from `frontend/customer/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

### Restaurant frontend

Run the same commands from `frontend/restaurant/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## API Overview

All API routes are prefixed with `/api`.

| Route group | Purpose |
| --- | --- |
| `/api/health` | Service health check |
| `/api/auth` | Customer and restaurant authentication, OTP, and account access |
| `/api/restaurants` | Restaurant registration, profiles, and restaurant data |
| `/api/dishes` | Menu and dish management |
| `/api/orders` | Cart checkout, order retrieval, and order status updates |
| `/api/reviews` | Restaurant reviews |
| `/api/search` | Restaurant and dish search, including smart search |
| `/api/upload` | Authenticated media uploads |

Protected endpoints use a JWT bearer token:

```http
Authorization: Bearer <token>
```

The backend also applies role-based authorization where restaurant-only operations require a restaurant account.

## Typical Development Workflow

1. Start MongoDB and confirm the connection string in `backend/.env`.
2. Start the backend and verify `/api/health`.
3. Start the customer frontend to test browsing, cart, checkout, and order tracking.
4. Start the restaurant frontend to test setup, menu management, and order updates.
5. Run frontend linting and production builds before deployment.

## Troubleshooting

### The backend exits during startup

Check that `MONGODB_URI` is present and that MongoDB is reachable. The server intentionally exits when it cannot connect to the database.

### The frontend cannot reach the API

Confirm the backend is running on port `5000`, or set `VITE_API_BASE_URL` in the frontend `.env` file. Restart Vite after changing environment variables.

### Image uploads do not work

Configure all three Cloudinary values: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

### Smart search uses basic matching

That is expected when `GEMINI_API_KEY` is not configured or when Gemini returns an invalid response. The backend automatically uses its keyword fallback.

## Production Notes

- Set `NODE_ENV` and deployment-specific environment variables in the hosting platform.
- Use a managed MongoDB instance or a secured private database in production.
- Keep `JWT_SECRET` long, random, and private.
- Restrict CORS to the deployed customer and restaurant frontend origins instead of allowing all origins.
- Build and deploy `frontend/customer` and `frontend/restaurant` independently.
- Deploy the `backend` as a Node.js service and expose its `/api` base URL to both frontends through `VITE_API_BASE_URL`.
