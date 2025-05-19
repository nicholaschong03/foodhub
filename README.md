# FoodHub MERN Monorepo

A modern MERN stack monorepo using PNPM workspaces and Turborepo.

## Prerequisites

- Node.js ≥ 18
- PNPM ≥ 8
- MongoDB (local or remote)

## Project Structure

```
foodhub/
├── packages/
│   ├── frontend/     # Vite + React + TypeScript + Tailwind
│   ├── backend/      # Express + TypeScript + MongoDB
│   └── shared/       # Shared types and utilities
├── package.json
└── turbo.json
```

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create a `.env` file in the backend package:
   ```
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/foodhub
   ```

3. Start development servers:
   ```bash
   pnpm dev
   ```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## Available Scripts

- `pnpm dev` - Start all packages in development mode
- `pnpm build` - Build all packages
- `pnpm test` - Run tests (when implemented)

## Development

- Frontend: Vite + React + TypeScript + Tailwind CSS
- Backend: Express + TypeScript + MongoDB
- Shared: Common types and utilities using Zod

## License

MIT