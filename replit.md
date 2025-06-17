# XTask Platform - Full-Stack Task Management System

## Overview

XTask is a comprehensive full-stack platform designed for enterprise task management and business process automation. It combines project management, human resources, financial management, and reporting capabilities into a unified web application.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication with session management
- **File Handling**: Multer for file uploads (contracts, documents)
- **API Design**: RESTful endpoints with modular route organization

### Database Architecture
- **Primary Database**: PostgreSQL 15+
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Neon serverless PostgreSQL adapter with connection pooling

## Key Components

### Module Structure
The application follows a modular architecture with domain-driven design principles:

1. **Authentication Module**: JWT-based auth with user management
2. **Projects Module**: Project lifecycle management with Kanban boards
3. **Human Resources Module**: Employee management, payroll, and evaluations
4. **Finance Module**: Budget management, transactions, and reporting
5. **Suppliers Module**: Vendor management and purchase orders
6. **KPIs Module**: Key performance indicators and bonification system
7. **Microlearning Module**: Training content and employee development
8. **Dashboard Module**: Customizable widgets and process reporting

### Authentication & Authorization
- JWT tokens for stateless authentication
- Session-based management with PostgreSQL store
- Role-based access control (admin, manager, user)
- Protected routes with middleware validation

### File Management
- Document upload system for employee contracts
- Static file serving for training materials
- Configurable storage with multer (local filesystem)
- Support for PDF, DOC, DOCX file types

## Data Flow

### Client-Server Communication
1. **API Calls**: TanStack Query manages server state and caching
2. **Authentication**: JWT tokens in Authorization headers
3. **Form Submission**: Validated with Zod schemas before API calls
4. **Real-time Updates**: Optimistic updates with query invalidation

### Database Operations
1. **Connection Management**: Pool-based connections with Neon adapter
2. **Query Execution**: Type-safe queries through Drizzle ORM
3. **Transaction Handling**: Automated transaction management for complex operations
4. **Schema Evolution**: Version-controlled migrations with Drizzle Kit

## External Dependencies

### Production Dependencies
- **@neondatabase/serverless**: PostgreSQL connection adapter
- **@stripe/stripe-js**: Payment processing integration
- **bcrypt**: Password hashing for user security
- **jsonwebtoken**: JWT token generation and validation
- **multer**: File upload handling
- **pdfkit**: PDF generation for reports and contracts

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production builds
- **drizzle-kit**: Database schema management
- **@types/***: TypeScript definitions

### UI Components
- **@radix-ui/***: Headless UI components for accessibility
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **tailwindcss**: Utility-first CSS framework

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 via Replit environment
- **Database**: PostgreSQL 16 instance
- **Hot Reload**: Vite development server with HMR
- **Port Configuration**: Frontend (Vite) and backend (Express) on port 5000

### Production Deployment
- **Containerization**: Docker with Node.js 18 Alpine base image
- **Build Process**: 
  1. Vite builds frontend to `dist/public`
  2. esbuild bundles server code to `dist/index.js`
- **Process Management**: Single container with combined frontend/backend
- **Database**: External PostgreSQL via DATABASE_URL environment variable

### Kubernetes Deployment
- **Orchestration**: Complete K8s manifests in `/k8s` directory
- **Scaling**: Horizontal Pod Autoscaler with CPU/memory metrics
- **Load Balancing**: NGINX ingress controller with SSL termination
- **Monitoring**: Health check endpoints for liveness/readiness probes
- **Persistence**: PostgreSQL with persistent volume claims

### Docker Compose
- **Local Development**: Simulates production environment
- **Services**: Application container + PostgreSQL database
- **Networking**: Internal Docker network for service communication
- **Volumes**: Persistent data storage for PostgreSQL

## Changelog
- June 17, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.