# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rails 8.0.3 API backend with React 18 SPA frontend. The application uses:
- **Backend:** Rails API with PostgreSQL
- **Frontend:** React 18 + TypeScript + Vite
- **Routing:** React Router v6 (client-side)
- **Infrastructure:** Solid Cache, Solid Queue, and Solid Cable for database-backed operations

**Ruby version:** 3.3.7
**Node version:** (check `.nvmrc` or use latest LTS)

## Development Commands

### Initial Setup
```bash
bin/setup
```
Installs dependencies, prepares the database, and starts the development server.

To setup without starting the server:
```bash
bin/setup --skip-server
```

### Running the Application
```bash
# Start both Rails and Vite dev servers concurrently
bin/dev
```

This runs both:
- Rails API server on `http://localhost:3000`
- Vite dev server on `http://localhost:3036` (with HMR)

To run servers separately:
```bash
# Rails server only
bin/rails server

# Vite dev server only
bin/vite dev
```

### Database Commands
```bash
# Prepare database (create, migrate, seed)
bin/rails db:prepare

# Create the database
bin/rails db:create

# Run migrations
bin/rails db:migrate

# Rollback last migration
bin/rails db:rollback

# Reset database (drop, create, migrate, seed)
bin/rails db:reset

# Seed the database
bin/rails db:seed
```

### Testing
```bash
# Run all tests
bin/rails test

# Run specific test file
bin/rails test test/models/example_test.rb

# Run specific test by line number
bin/rails test test/models/example_test.rb:12

# Run system tests
bin/rails test:system
```

### Code Quality
```bash
# Run RuboCop linter
bin/rubocop

# Auto-fix RuboCop violations
bin/rubocop -A

# Run Brakeman security scanner
bin/brakeman
```

### Rails Console
```bash
bin/rails console
# or for short
bin/rails c
```

### Frontend Development

```bash
# Install frontend dependencies
npm install

# Run Vite dev server with HMR
bin/vite dev

# Build frontend for production
bin/vite build

# Type check TypeScript
npx tsc --noEmit
```

### Building for Production
```bash
# Build frontend assets
bin/vite build

# Precompile all assets (if needed)
bin/rails assets:precompile
```

### Background Jobs
```bash
# Start Solid Queue worker
bin/jobs
```

## Frontend Architecture

### Directory Structure
```
app/javascript/
├── entrypoints/
│   └── application.tsx      # Vite entry point, mounts React app
├── App.tsx                   # Root component with React Router
├── pages/                    # Page components (route targets)
│   ├── Home.tsx
│   └── NotFound.tsx
├── components/               # Reusable React components
└── styles/
    └── application.css       # Global styles
```

### Key Concepts

**SPA Architecture:**
- React handles ALL routing via React Router
- Rails serves the initial HTML shell for all routes via `SpaController`
- The catch-all route `get "*path"` ensures React Router handles navigation
- API endpoints live under `/api` namespace

**API Communication:**
- All API endpoints are under `/api` (e.g., `/api/health`)
- CORS is configured for development (Vite dev server on port 3036)
- API controllers inherit from `Api::BaseController`
- Use `fetch()` in React components to call Rails API

**Adding New Routes:**
1. Add route to `app/javascript/App.tsx`
2. Create page component in `app/javascript/pages/`
3. Rails automatically serves the React app for all non-API routes

**Adding New API Endpoints:**
1. Create controller in `app/controllers/api/`
2. Inherit from `Api::BaseController`
3. Add route in `config/routes.rb` under `namespace :api`

### TypeScript Configuration
- Path alias `~/*` maps to `app/javascript/*`
- Strict mode enabled
- React JSX transform configured

## Database Architecture

The application uses a **multi-database setup** with PostgreSQL:

- **Primary database:** Main application data (`boom_interview_project_development`)
- **Cache database:** Solid Cache storage (`boom_interview_project_development_cache`)
  - Migrations in `db/cache_migrate/`
  - Schema in `db/cache_schema.rb`
- **Queue database:** Solid Queue job storage (`boom_interview_project_development_queue`)
  - Migrations in `db/queue_migrate/`
  - Schema in `db/queue_schema.rb`
- **Cable database:** Solid Cable WebSocket storage (`boom_interview_project_development_cable`)
  - Migrations in `db/cable_migrate/`
  - Schema in `db/cable_schema.rb`

When creating migrations for these secondary databases, use the appropriate paths.

## Code Style

This project uses **rubocop-rails-omakase** for Ruby styling, which enforces Rails' Omakase style guide. The configuration is minimal by design, inheriting from the Omakase gem.

Key points:
- Follow Omakase conventions unless explicitly overridden in `.rubocop.yml`
- Run `bin/rubocop` before committing
- Auto-fix with `bin/rubocop -A` when possible

## Deployment

The application is Docker-ready with Kamal deployment support:

```bash
# Deploy with Kamal
bin/kamal deploy

# Check Kamal configuration
bin/kamal setup
```

Docker build for production:
```bash
docker build -t boom_interview_project .
docker run -d -p 80:80 -e RAILS_MASTER_KEY=<value> --name boom_interview_project boom_interview_project
```

The application uses **Thruster** as the HTTP accelerator in production (handles asset caching, compression, and X-Sendfile).

## Technology Stack

### Backend
- **Rails 8.0.3** - API backend framework
- **PostgreSQL** - Database
- **Puma** - Web server
- **Solid Cache** - Database-backed caching
- **Solid Queue** - Database-backed background jobs
- **Solid Cable** - Database-backed Action Cable
- **Thruster** - Production HTTP accelerator
- **rack-cors** - CORS middleware for API

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool with HMR (via vite_rails)
- **React Router v6** - Client-side routing
- **CSS** - Vanilla CSS with modern features

### Testing Stack
- **Minitest** - Test framework (Rails default)
- **Capybara** - System testing
- **Selenium WebDriver** - Browser automation for system tests

### Development Tools
- **RuboCop** (rails-omakase) - Ruby linter
- **Brakeman** - Security scanner
- **Foreman** - Process manager for dev servers
