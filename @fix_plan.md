# Pipeline CRM - Fix Plan

## Phase 1: Foundation (Critical Path)

- [ ] Initialize Next.js 14 project with TypeScript strict mode
- [ ] Configure Tailwind CSS and install shadcn/ui
- [ ] Set up Prisma with SQLite database
- [ ] Create database schema (Lead, TeamMember, Note, PipelineStage enum)
- [ ] Generate Prisma client and run initial migration
- [ ] Seed database with sample team members

## Phase 2: Core Data Layer

- [ ] Create Lead CRUD operations (create, read, update, delete)
- [ ] Create TeamMember CRUD operations
- [ ] Create Note CRUD operations (add note to lead)
- [ ] Implement lead assignment (assign team member to lead)
- [ ] Implement pipeline stage transitions
- [ ] Add data validation with Zod schemas

## Phase 3: API Layer

- [ ] Create Server Actions for lead management
- [ ] Create Server Actions for team member management
- [ ] Create Server Actions for notes
- [ ] Create Server Actions for pipeline stage changes
- [ ] Add error handling and response types

## Phase 4: Kanban Board UI

- [ ] Create app layout with navigation
- [ ] Build Kanban board container component
- [ ] Build pipeline stage columns (8 stages)
- [ ] Build lead card component with social icons
- [ ] Implement drag-and-drop between columns
- [ ] Add empty state for columns
- [ ] Add loading states

## Phase 5: Lead Management UI

- [ ] Build lead creation form (all social handles + email)
- [ ] Build lead detail drawer/modal
- [ ] Display all social handles as clickable links
- [ ] Build notes timeline component
- [ ] Build add note form
- [ ] Build team member assignment dropdown
- [ ] Build pipeline stage selector

## Phase 6: Team View

- [ ] Build team members list page
- [ ] Show lead count per team member
- [ ] Build team member detail view
- [ ] Show all leads assigned to member
- [ ] Add team member creation form

## Phase 7: Polish & Edge Cases

- [ ] Handle empty states gracefully
- [ ] Add keyboard navigation
- [ ] Ensure responsive design (mobile, tablet, desktop)
- [ ] Add optimistic UI updates
- [ ] Add error boundaries
- [ ] Performance testing with 1000+ leads

## Phase 8: Team Deployment (PRIORITY - Do This Next!)

- [x] Update Prisma schema from SQLite to PostgreSQL
- [x] Create .env.example documenting DATABASE_URL
- [ ] Create Neon PostgreSQL database at neon.tech
- [ ] Configure DATABASE_URL environment variable
- [ ] Run prisma db push against Neon database
- [ ] Update seed script to use upsert (avoid duplicates)
- [ ] Seed production database with team members
- [ ] Push code to GitHub repository
- [ ] Connect repo to Vercel
- [ ] Add DATABASE_URL to Vercel environment variables
- [ ] Deploy to Vercel
- [ ] Verify live URL works for team access
- [ ] Test on mobile browser

## Completed

- [x] Project initialization
- [x] Define project vision and requirements
- [x] Next.js 14 project structure created
- [x] Prisma schema with Lead, TeamMember, Note models
- [x] Server Actions for CRUD operations
- [x] Kanban board UI components
- [x] Lead card and detail modal
- [x] Team page created
- [x] npm dependencies installed
- [x] Local SQLite database working
- [x] Prisma migrated to PostgreSQL provider

## Guiding Principles

1. **Ship working software** — Each phase should result in usable functionality
2. **Data before UI** — Phases 1-3 before Phases 4-6
3. **Test as you go** — Every CRUD operation needs basic tests
4. **No dead code** — If it's not used, delete it
5. **Commit often** — Working increments, not big bangs
