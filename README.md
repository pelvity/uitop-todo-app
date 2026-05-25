# 📝 Todo App

A full-stack Todo management application with categories, undo notifications, action history, bulk operations, and max-5-tasks-per-category rule.

Built with NestJS + TypeORM + SQLite (backend) and Next.js + TypeScript + Ant Design (frontend).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS, TypeORM, SQLite (better-sqlite3) |
| Frontend | Next.js 16 (App Router), TypeScript, Ant Design |
| Forms | React Hook Form + Zod |
| State | React Context + custom hooks |
| Tests | Jest (backend), React Testing Library (frontend) |
| Infrastructure | Docker Compose (dev mode) |

## Features

- ✅ Create, complete, delete todos with categories
- ✅ Max 5 active tasks per category (backend-enforced)
- ✅ Category management (Work, Personal, Shopping auto-seeded)
- ✅ Undo notification with 5-second timer
- ✅ Action history sidebar with color-coded timeline
- ✅ Bulk select + batch complete
- ✅ Category filtering
- ✅ Loading/error/empty states
- ✅ 8+ frontend tests, 20+ backend tests
- ✅ Docker Compose with hot-reload

## Prerequisites

- **Node.js 20+** (for local development)
- **Docker** (optional — for containerized setup)
- **npm** or **yarn**

## Quick Start

### Option A: Local Development

**1. Backend:**
```bash
cd backend
npm install
npm run start:dev
```
Backend starts on http://localhost:3003

**2. Frontend (in another terminal):**
```bash
cd frontend
npm install
npm run dev
```
Frontend starts on http://localhost:3000

### Option B: Docker
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend: http://localhost:3031 (maps to container port 3001)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /categories | Create category |
| GET | /categories | List all categories |
| PATCH | /categories/:id | Update category name |
| DELETE | /categories/:id | Delete category (if empty) |
| POST | /todos | Create todo |
| GET | /todos?categoryId= | List todos (optional filter) |
| PATCH | /todos/:id | Update todo (complete, text) |
| DELETE | /todos/:id | Delete todo |
| GET | /action-logs?limit=50 | List recent action logs |

## Running Tests

```bash
# Backend tests (20+ tests)
cd backend && npm test

# Frontend tests (8+ tests)
cd frontend && npm test

# Both with root convenience script
npm test
```

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── categories/    # Category CRUD + seeding
│   │   │   ├── todos/         # Todo CRUD + max-5 validation
│   │   │   └── action-logs/   # Action logging service
│   │   └── common/
│   │       └── filters/       # Global exception filter
│   ├── test/                  # Backend tests
│   └── data/                  # SQLite database (gitignored)
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/          # TodoContext provider
│   │   ├── hooks/            # Custom hooks (undo, action logs)
│   │   ├── lib/              # API client + types
│   │   └── app/              # Next.js App Router
│   └── __tests__/            # Frontend tests
├── docker-compose.yml
├── README.md
└── package.json
```

## Design Decisions

- **Max 5 rule**: Counts active (uncompleted) tasks only. Completed tasks don't count toward the limit.
- **Undo**: Client-side only via Ant Design notification (5-second timer). Lost on page refresh — accepted limitation.
- **Port 3003**: Backend uses port 3003 in dev mode (3001 is occupied by Graviton dashboard in this environment). Docker uses port 3001 internally, mapped to 3031 on host.
- **SQLite**: File-based database at `backend/data/todo.db`. Persists via Docker volume.

## AI Usage

This project was built with:
- **Atlas (OhMyOpenCode)**: Master orchestrator coordinating all tasks
- **Sisyphus-Junior**: Domain-specialized subagents for implementation
- **Ant Design**: UI component library
- **Next.js + NestJS**: Framework scaffolding via CLI tools

All code reviewed and verified by both automated checks (TypeScript compilation, Jest tests, LSP diagnostics) and manual code review.
