# EventsOfSSN

**EventsOfSSN** is a centralized campus event discovery platform designed to solve the problem of fragmented event information scattered across numerous Instagram pages and WhatsApp groups. It provides a single source of truth for students to discover, track, and register for campus events.

## Tech Stack & Architecture

- **Frontend & Framework**: Next.js (App Router) - Chosen for excellent SEO (critical for shareable event links) and seamless API routes.
- **Backend & Database**: Supabase (PostgreSQL) - Chosen for built-in Auth, Row Level Security (RLS) for data protection, and fast development of relational schemas.
- **Authentication**: Supabase Auth (Google OAuth) - Strictly restricted to `@ssn.edu.in` to ensure only verified students can access the platform and prevent spam.
- **Styling**: Tailwind CSS & Shadcn UI - For rapid development of a premium, accessible user interface.
- **Hosting**: Vercel (Frontend & API) and Supabase Cloud (Database & Auth).

## Core Features

- **Centralized Event Feed**: Browse events by category (technical, cultural, hackathon, etc.) and date.
- **Role-Based Access**: 
  - **Students**: Browse and register for events.
  - **Club Admins**: Create and manage events with poster uploads.
  - **Super Admins**: Approve pending events to prevent spam.
- **Automated Reminders**: Email notifications sent prior to event registration deadlines to minimize missed opportunities.
- **Event Detail Pages**: Dedicated pages with countdown timers, capacity tracking, and direct registration links.
