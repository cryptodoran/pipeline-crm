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

## Phase 8: Team Deployment - COMPLETE!

- [x] Update Prisma schema from SQLite to PostgreSQL
- [x] Create .env.example documenting DATABASE_URL
- [x] Create Neon PostgreSQL database at neon.tech
- [x] Configure DATABASE_URL environment variable
- [x] Run prisma db push against Neon database
- [x] Seed production database with team members
- [x] Push code to GitHub repository
- [x] Connect repo to Vercel
- [x] Add DATABASE_URL to Vercel environment variables
- [x] Deploy to Vercel
- [x] Live URL: https://pipeline-crm-rho.vercel.app

## Phase 9: Search & Filter (Priority: P1)

- [ ] Add search input to Kanban header/toolbar
- [ ] Implement real-time search filtering by lead name
- [ ] Add case-insensitive search
- [ ] Add clear search button
- [ ] Show "No results" empty state when search has no matches
- [ ] Add filter dropdown for social platforms (Has TikTok, Has Twitter, etc.)
- [ ] Implement multi-select filter with AND logic
- [ ] Show active filter badges
- [ ] Add "Clear all filters" button

## Phase 10: Bulk Actions (Priority: P2)

- [ ] Add checkbox to each lead card
- [ ] Add "Select All" checkbox in toolbar
- [ ] Show bulk action toolbar when items are selected
- [ ] Implement bulk assign (assign multiple leads to one team member)
- [ ] Implement bulk stage move (move multiple leads to a stage)
- [ ] Add automatic note when bulk moving leads
- [ ] Add success/error toast notifications
- [ ] Add undo capability (10 second window)

## Phase 11: Import & Export (Priority: P2)

- [ ] Add Export button to toolbar
- [ ] Implement CSV export of all leads
- [ ] Include all fields in export (name, socials, stage, assignee, notes count)
- [ ] Add date to export filename
- [ ] Add Import button to toolbar
- [ ] Build CSV file upload and parsing
- [ ] Build column mapping UI
- [ ] Show preview before importing
- [ ] Implement duplicate detection by email
- [ ] Show import progress indicator
- [ ] Show summary of imported/skipped leads

## Phase 12: Activity & Dashboard (Priority: P3)

- [ ] Create Activity model in Prisma schema
- [ ] Log activities on lead create, update, stage change, note add
- [ ] Build Activity feed page or sidebar
- [ ] Show relative timestamps in activity feed
- [ ] Make activity items clickable to navigate to lead
- [ ] Add filter by team member or action type
- [ ] Build stats cards (total leads, weekly delta, conversion rate)
- [ ] Show breakdown by stage
- [ ] Show breakdown by team member

## Phase 13: Tags & Categories (Priority: P1)

- [ ] Create Tag model in Prisma schema (many-to-many with Lead)
- [ ] Add tag input with autocomplete to lead detail
- [ ] Allow creating new tags on the fly
- [ ] Show tags as colored pills on lead cards
- [ ] Support multiple tags per lead
- [ ] Add tag filter to Kanban board
- [ ] Build tags management page
- [ ] Implement rename tag (updates all leads)
- [ ] Implement delete tag (removes from all leads)
- [ ] Show lead count per tag

## Phase 14: Reminders & Follow-ups (Priority: P1)

- [ ] Create Reminder model in Prisma schema
- [ ] Add "Set Reminder" button to lead detail
- [ ] Build date/time picker for reminder
- [ ] Add optional note field for reminder
- [ ] Show reminder icon on lead cards with upcoming reminders
- [ ] Build "My Reminders" page showing upcoming reminders
- [ ] Implement mark reminder complete
- [ ] Implement snooze (1 day, 1 week)
- [ ] Build "Today's Follow-ups" section

## Phase 15: Lead Sources (Priority: P2)

- [ ] Add source field to Lead model
- [ ] Create Source model for predefined sources
- [ ] Add source dropdown to lead creation form
- [ ] Allow custom source entry
- [ ] Show source badge on lead cards
- [ ] Add source filter to Kanban
- [ ] Show source breakdown in dashboard
- [ ] Calculate conversion rate by source

## Phase 16: Dark Mode & Themes (Priority: P3)

- [ ] Add theme toggle button to header (sun/moon icon)
- [ ] Create dark theme CSS variables
- [ ] Style all components for dark mode
- [ ] Save theme preference to localStorage
- [ ] Respect system preference by default (prefers-color-scheme)
- [ ] Smooth transition between themes

## Phase 17: Keyboard Shortcuts (Priority: P3)

- [ ] Add global keyboard event listener
- [ ] Implement "N" - Open new lead form
- [ ] Implement "/" - Focus search box
- [ ] Implement "?" - Show shortcuts help modal
- [ ] Implement "Esc" - Close modals
- [ ] Implement arrow keys for card navigation
- [ ] Implement "E" - Edit selected lead
- [ ] Implement "1-8" - Move lead to stage
- [ ] Build shortcuts help modal with all commands

## Phase 18: Duplicate Detection (Priority: P2)

- [ ] Build duplicate detection algorithm (email match, fuzzy name)
- [ ] Create "Duplicates" page
- [ ] Show potential duplicate pairs
- [ ] Build side-by-side comparison view
- [ ] Implement merge action (combine notes, keep newer data)
- [ ] Implement dismiss false positive
- [ ] Run detection on lead create to warn

## Phase 19: Mobile PWA (Priority: P2)

- [ ] Create manifest.json with app metadata
- [ ] Generate app icons (192x192, 512x512)
- [ ] Configure Next.js for PWA
- [ ] Add "Add to Home Screen" meta tags
- [ ] Build offline indicator component
- [ ] Ensure touch-friendly tap targets (min 44px)
- [ ] Test on iOS and Android browsers

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
- [x] Prisma migrated to PostgreSQL provider
- [x] Neon database connected
- [x] Deployed to Vercel (https://pipeline-crm-rho.vercel.app)
- [x] GitHub repo: https://github.com/cryptodoran/pipeline-crm

## Guiding Principles

1. **Ship working software** — Each phase should result in usable functionality
2. **Data before UI** — Phases 1-3 before Phases 4-6
3. **Test as you go** — Every CRUD operation needs basic tests
4. **No dead code** — If it's not used, delete it
5. **Commit often** — Working increments, not big bangs
