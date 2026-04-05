# Quantum Code Vault — Frontend

Next.js 14 frontend for the Quantum Code Vault marketplace.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.local.example .env.local
   ```
   Set:
   - `NEXT_PUBLIC_API_URL` — Backend URL (default `http://localhost:8106`)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe public key

3. **Run development server:**
   ```bash
   npm run dev
   ```
   App starts on `http://localhost:3000`.

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
src/
  app/                  # Next.js App Router pages
    admin/              # Admin dashboard, products, users, notifications, plans, chats
    chat/[id]/          # Chat room
    product/[id]/       # Product detail
    ...                 # Auth, account, shop, services, etc.
  components/           # Navbar, Footer
  context/              # AuthContext (JWT management)
  lib/                  # API client with typed interfaces
```

## Tech Stack

- **Next.js 14** — App Router, server components
- **TypeScript** — Full type safety
- **Tailwind CSS** — Custom purple/pink theme
- **Stripe.js** — Payment integration
- **lucide-react** — Icons

## API Proxy

In development, `/api/*` requests are proxied to the backend at `http://localhost:8106` via `next.config.js` rewrites.
