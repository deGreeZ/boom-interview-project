# Boom Interview Project

![CI](https://github.com/deGreeZ/boom-interview-project/actions/workflows/ci.yml/badge.svg)

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

- Ruby 3.4.7
- Node.js (latest LTS recommended)
- PostgreSQL
- Bundler

## Getting Started

### 1. Environment Configuration

Copy the environment template and configure your API credentials:

```bash
cp .env.example .env
```

Then edit `.env` and add your BoomNow API credentials:

```bash
BOOM_API_CLIENT_ID=your_actual_client_id
BOOM_API_CLIENT_SECRET=your_actual_client_secret
```

**Getting API Credentials:**
- Visit https://app.boomnow.com to obtain your API credentials
- Replace the placeholder values in `.env` with your actual credentials

### 2. Initial Setup

Run the automated setup script (installs dependencies and prepares the database):

```bash
bin/setup
```

Or setup without starting the dev server:

```bash
bin/setup --skip-server
```

**Manual setup (alternative):**
```bash
# Install dependencies
bundle install
npm install

# Setup database
bin/rails db:prepare
```

### 3. Run Development Servers

```bash
# Start both Rails API and Vite dev servers
bin/dev
```

This will start:
- **Rails API server** on http://localhost:3000
- **Vite dev server** on http://localhost:3036 (with hot module replacement)

Visit **http://localhost:3000** to see your application.

### 4. Run Servers Separately (Optional)

```bash
# Terminal 1: Rails server
bin/rails server

# Terminal 2: Vite dev server
bin/vite dev
```

## Development

### Environment Variables

The application uses environment variables for configuration. All required variables are documented in `.env.example`:

**BoomNow API Integration:**
- `BOOM_API_CLIENT_ID` - Your BoomNow API client ID
- `BOOM_API_CLIENT_SECRET` - Your BoomNow API client secret

**Security Note:** Never commit your `.env` file to version control. The `.env` file is already in `.gitignore`.

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

**Rails Console:**
```bash
bin/rails console
# or short form
bin/rails c
```

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

### Background Jobs

The application uses Solid Queue for background job processing:

```bash
# Start background job worker
bin/jobs
```

This is already included when you run `bin/dev`.

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

The application is containerized with Docker and supports Kamal deployment. In production, the application uses **Thruster** as an HTTP accelerator for asset caching, compression, and X-Sendfile support.

```bash
# Deploy with Kamal
bin/kamal deploy

# Setup Kamal configuration
bin/kamal setup

# Build Docker image
docker build -t boom_interview_project .

# Run Docker container in production
docker run -d -p 80:80 -e RAILS_MASTER_KEY=<value> --name boom_interview_project boom_interview_project
```

## Architecture

This is a **Single Page Application (SPA)** where:
- React handles all client-side routing
- Rails serves the initial HTML shell and provides API endpoints
- Vite bundles frontend assets with TypeScript support
- React Router manages navigation without page reloads

### Multi-Database Setup

The application uses multiple PostgreSQL databases for different concerns:

- **Primary database:** Main application data
- **Cache database:** Solid Cache storage (db-backed caching)
- **Queue database:** Solid Queue job storage (background jobs)
- **Cable database:** Solid Cable WebSocket storage (Action Cable)

This architecture provides database-backed implementations of Rails caching, job processing, and WebSocket functionality without requiring Redis or other external services.

## Additional Resources

- [Rails Guides](https://guides.rubyonrails.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- See `CLAUDE.md` for detailed development guidelines
