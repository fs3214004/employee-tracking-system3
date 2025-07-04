# Employee Tracking System - Riyadh

## Overview

This is a real-time employee tracking system designed for an internet subscription distribution company in Riyadh, Saudi Arabia. The application provides location-based monitoring of field employees with an Arabic-language interface and interactive map visualization using Leaflet. It features a modern React frontend with Express.js backend, using PostgreSQL with Drizzle ORM for data persistence.

## System Architecture

The application follows a full-stack architecture with the following structure:

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for development
- **UI Library**: Shadcn/UI components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Map Integration**: Leaflet for interactive maps
- **Internationalization**: Arabic language support with RTL layout

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas for data validation
- **Session Management**: Express sessions with PostgreSQL store

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `/shared/schema.ts` for type-safe database operations
- **Main Tables**:
  - `employees`: Core employee data with location tracking
  - `users`: Authentication and user management

## Key Components

### Data Models
- **Employee**: Tracks name, phone, status (available/busy/offline), GPS coordinates, location name, customer assignments, and last update timestamp
- **User**: Basic authentication with username/password

### Core Features
- Real-time employee location tracking with GPS coordinates
- Interactive map visualization centered on Riyadh
- Employee status management (available, busy, offline)
- Customer assignment functionality
- Search and filtering capabilities
- Arabic language interface with RTL support

### API Architecture
- RESTful API design with Express.js
- Endpoints for employee CRUD operations
- Location update capabilities
- Status management endpoints
- Error handling with proper HTTP status codes

## Data Flow

1. **Employee Location Updates**: GPS coordinates are captured and stored with timestamp
2. **Real-time Synchronization**: Frontend polls every 30 seconds for updates
3. **Map Visualization**: Leaflet renders employee positions with status-based markers
4. **Status Management**: Employees can be assigned to customers or marked as available/offline
5. **Search and Filter**: Real-time filtering of employee list based on name, phone, or location

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM for database operations
- **leaflet**: Interactive map library for location visualization
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the stack
- **ESBuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Build Process
- Frontend built with Vite to static assets in `dist/public`
- Backend compiled with ESBuild to `dist/index.js`
- Database migrations managed through Drizzle Kit

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Production/development mode switching via `NODE_ENV`
- Static file serving for production builds

### Production Setup
- Express server serves both API and static frontend
- PostgreSQL database with proper connection pooling
- Session management with PostgreSQL store for scalability

## Changelog
- July 03, 2025: Initial setup
- July 03, 2025: Added map clustering feature for employee markers
- July 03, 2025: Implemented location filters in top header (Region → City → District)
- July 03, 2025: Added right-click map annotation system with 8 icon types
- July 03, 2025: Optimized sidebar layout (reduced width from 320px to 256px)
- July 03, 2025: Fixed z-index issues for all interactive elements (modals, dropdowns, popups)
- July 03, 2025: Enhanced map controls with functional zoom and center buttons
- July 03, 2025: Moved map notes display from right sidebar to left panel (below color legend)
- July 03, 2025: Added comprehensive note editing system with location adjustment and deletion capabilities
- July 03, 2025: Enhanced employee popup details to match comprehensive sidebar view (contact info, languages, training courses, customer assignments, action buttons)
- July 03, 2025: Optimized sidebar layout dimensions and fixed page overflow issues (proper height constraints, scrollable content)
- July 03, 2025: Removed "Add Employee" button from right sidebar
- July 03, 2025: Added comprehensive employee data across all Saudi regions (Makkah, Medina, Eastern Province, Asir, Tabuk, Hail, Northern Border, Jazan, Najran, Baha, Jouf, Qassim)
- July 03, 2025: Added employees in specific Riyadh neighborhoods (Al-Munsiyah, Qurtuba, Ramal, Naseem, Rawabi) as requested

## User Preferences

Preferred communication style: Simple, everyday language.