# WiFi Voucher Management System

## Overview

This is a full-stack WiFi voucher management system built with React, Express.js, and TypeScript. The application provides a comprehensive admin dashboard for managing WiFi access vouchers, monitoring user sessions, and customizing captive portal experiences. It's designed for businesses that want to provide controlled WiFi access through a voucher-based system.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Chart.js with React Chart.js 2 for data visualization
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Session Management**: Express sessions with PostgreSQL storage
- **Real-time Communication**: WebSocket server for live updates
- **API Design**: RESTful endpoints with TypeScript interfaces

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema changes
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple

## Key Components

### Database Schema
- **Users**: Admin user management with role-based access
- **Voucher Plans**: Configurable voucher types with different limits and pricing
- **Vouchers**: Individual voucher codes with status tracking
- **User Sessions**: Active connection monitoring and analytics
- **System Settings**: Global configuration management
- **Portal Settings**: Customizable captive portal branding
- **Analytics Data**: Usage statistics and reporting data

### Frontend Modules
- **Dashboard**: Real-time system overview with key metrics
- **Voucher Management**: Create, view, and manage voucher codes
- **Session Monitoring**: Track active user connections and usage
- **Captive Portal**: Customizable WiFi login experience
- **Analytics**: Data visualization and reporting
- **Settings**: System configuration and preferences

### Backend Services
- **Voucher Service**: Handles voucher creation, validation, and redemption
- **Session Management**: Tracks user connections and data usage
- **Authentication**: Admin user authentication and session management
- **Real-time Updates**: WebSocket broadcasting for live dashboard updates
- **Storage Layer**: Abstracted database operations with type safety

## Data Flow

1. **Admin Authentication**: Users log in through the admin interface
2. **Voucher Creation**: Admins create voucher batches based on predefined plans
3. **User Access**: End users redeem vouchers through the captive portal
4. **Session Tracking**: System monitors active connections and data usage
5. **Real-time Updates**: Dashboard receives live updates via WebSocket
6. **Analytics Collection**: Usage data is collected for reporting and insights

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL driver for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **chart.js**: Data visualization library
- **ws**: WebSocket implementation for real-time features

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds
- **tailwindcss**: Utility-first CSS framework
- **vite**: Frontend build tool and development server

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR and error overlay
- **Backend**: tsx for TypeScript execution with auto-restart
- **Database**: Neon serverless PostgreSQL instance
- **Real-time**: WebSocket server integrated with Express

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations applied to production database
- **Deployment**: Single Node.js process serving both API and static files

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **Session Configuration**: Secure session management with PostgreSQL storage

## Changelog

- July 02, 2025. Initial setup
- July 02, 2025. Added authentication system with separate admin and customer interfaces:
  * Created admin login page with demo authentication
  * Separated customer portal as public interface
  * Updated routing to support /admin paths for authenticated users
  * Added logout functionality
  * Seeded database with sample voucher plans and vouchers
- July 02, 2025. Implemented comprehensive voucher validation system:
  * Voucher codes are cross-checked against PostgreSQL database
  * Access granted only for valid, active voucher codes
  * Invalid/used/expired vouchers are properly rejected
  * Test voucher codes created: WIFI-2024-TEST01/02/03, WIFI-2024-GUEST
  * Real-time session tracking and WebSocket updates
  * Comprehensive error handling and user feedback

## User Preferences

Preferred communication style: Simple, everyday language.