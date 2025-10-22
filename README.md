# Boom Interview Project

A modern full-stack application with Rails 8.0.3 API backend and React 18 + TypeScript frontend.

## Tech Stack

**Backend:**
- Rails 8.0.3 (API mode)
- PostgreSQL
- Solid Cache, Solid Queue, Solid Cable

**Frontend:**
- React 18
- TypeScript
- Vite (with HMR)
- React Router v6

## Prerequisites

- Ruby 3.3.7
- Node.js (latest LTS recommended)
- PostgreSQL
- Bundler

## Getting Started

### 1. Initial Setup

```bash
# Install dependencies
bundle install
npm install

# Setup database
bin/rails db:prepare
```

### 2. Run Development Servers

```bash
# Start both Rails API and Vite dev servers
bin/dev
```

This will start:
- **Rails API server** on http://localhost:3000
- **Vite dev server** on http://localhost:3036 (with hot module replacement)

Visit **http://localhost:3000** to see your application.

### 3. Run Servers Separately (Optional)

```bash
# Terminal 1: Rails server
bin/rails server

# Terminal 2: Vite dev server
bin/vite dev
```

## Development

### Frontend Development

```bash
# Type check TypeScript
npx tsc --noEmit

# Build frontend for production
bin/vite build
```

**Frontend structure:**
- `app/javascript/entrypoints/application.tsx` - Entry point
- `app/javascript/App.tsx` - Root component with routing
- `app/javascript/pages/` - Page components
- `app/javascript/components/` - Reusable components
- `app/javascript/styles/` - CSS files

### Backend Development

**API endpoints:**
- All API routes are under `/api` namespace
- Controllers inherit from `Api::BaseController`
- Example: `/api/health`

**Add new API endpoints:**
1. Create controller in `app/controllers/api/`
2. Add route in `config/routes.rb` under `namespace :api`

### Database

```bash
# Run migrations
bin/rails db:migrate

# Rollback migration
bin/rails db:rollback

# Reset database
bin/rails db:reset

# Seed database
bin/rails db:seed
```

### Testing

```bash
# Run all tests
bin/rails test

# Run specific test file
bin/rails test test/models/example_test.rb

# Run system tests
bin/rails test:system
```

### Code Quality

```bash
# Run RuboCop linter
bin/rubocop

# Auto-fix violations
bin/rubocop -A

# Run Brakeman security scanner
bin/brakeman
```

## Deployment

The application is containerized with Docker and supports Kamal deployment:

```bash
# Deploy with Kamal
bin/kamal deploy

# Build Docker image
docker build -t boom_interview_project .
```

## Architecture

This is a **Single Page Application (SPA)** where:
- React handles all client-side routing
- Rails serves the initial HTML shell and provides API endpoints
- Vite bundles frontend assets with TypeScript support
- React Router manages navigation without page reloads

## Additional Resources

- [Rails Guides](https://guides.rubyonrails.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- See `CLAUDE.md` for detailed development guidelines
