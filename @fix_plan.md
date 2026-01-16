# Pipeline CRM - Fix Plan

## Phase 0: Critical Fixes & Deployment (Priority: P0) - COMPLETE! ✅

- [x] Verify DATABASE_URL is set in .env file
- [x] Run `npm run build` and fix any TypeScript errors
- [x] Run `npx prisma generate` to regenerate client
- [x] Create tag server actions (getTags, createTag, updateTag, deleteTag)
- [x] Create tag input component with autocomplete
- [x] Add tags display to lead cards
- [x] Add tag filter to Kanban toolbar
- [x] Build /tags management page
- [x] Test build passes: `npm run build`
- [x] Commit and push to GitHub
- [x] Verify Vercel deployment succeeds
- [x] Test live site: https://pipeline-crm-rho.vercel.app

## Phase 1: Foundation (Critical Path)

- [x] Initialize Next.js 14 project with TypeScript strict mode
- [x] Configure Tailwind CSS and install shadcn/ui
- [x] Set up Prisma with SQLite database
- [x] Create database schema (Lead, TeamMember, Note, PipelineStage enum)
- [x] Generate Prisma client and run initial migration
- [x] Seed database with sample team members

## Phase 2: Core Data Layer

- [x] Create Lead CRUD operations (create, read, update, delete)
- [x] Create TeamMember CRUD operations
- [x] Create Note CRUD operations (add note to lead)
- [x] Implement lead assignment (assign team member to lead)
- [x] Implement pipeline stage transitions
- [ ] Add data validation with Zod schemas

## Phase 3: API Layer

- [x] Create Server Actions for lead management
- [x] Create Server Actions for team member management
- [x] Create Server Actions for notes
- [x] Create Server Actions for pipeline stage changes
- [x] Add error handling and response types

## Phase 4: Kanban Board UI

- [x] Create app layout with navigation
- [x] Build Kanban board container component
- [x] Build pipeline stage columns (8 stages)
- [x] Build lead card component with social icons
- [x] Implement drag-and-drop between columns
- [x] Add empty state for columns
- [x] Add loading states

## Phase 5: Lead Management UI

- [x] Build lead creation form (all social handles + email)
- [x] Build lead detail drawer/modal
- [x] Display all social handles as clickable links
- [x] Build notes timeline component
- [x] Build add note form
- [x] Build team member assignment dropdown
- [x] Build pipeline stage selector

## Phase 6: Team View

- [x] Build team members list page
- [x] Show lead count per team member
- [x] Build team member detail view
- [x] Show all leads assigned to member
- [x] Add team member creation form

## Phase 7: Polish & Edge Cases

- [x] Handle empty states gracefully
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

## Phase 9: Search & Filter (Priority: P1) - COMPLETE!

- [x] Add search input to Kanban header/toolbar
- [x] Implement real-time search filtering by lead name
- [x] Add case-insensitive search
- [x] Add clear search button
- [x] Show "No results" empty state when search has no matches
- [x] Add filter dropdown for social platforms (Has TikTok, Has Twitter, etc.)
- [x] Implement multi-select filter with AND logic
- [x] Show active filter badges
- [x] Add "Clear all filters" button

## Phase 10: Bulk Actions (Priority: P2) - COMPLETE!

- [x] Add checkbox to each lead card
- [x] Add "Select All" checkbox in toolbar
- [x] Show bulk action toolbar when items are selected
- [x] Implement bulk assign (assign multiple leads to one team member)
- [x] Implement bulk stage move (move multiple leads to a stage)
- [x] Add automatic note when bulk moving leads
- [x] Add success/error toast notifications
- [x] Add undo capability (10 second window)

## Phase 11: Import & Export (Priority: P2) - COMPLETE!

- [x] Add Export button to toolbar
- [x] Implement CSV export of all leads
- [x] Include all fields in export (name, socials, stage, assignee, notes count)
- [x] Add date to export filename
- [x] Add Import button to toolbar
- [x] Build CSV file upload and parsing
- [x] Build column mapping UI
- [x] Show preview before importing
- [x] Implement duplicate detection by email
- [x] Show import progress indicator
- [x] Show summary of imported/skipped leads

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

## Phase 13: Tags & Categories (Priority: P1) - COMPLETE!

- [x] Create Tag model in Prisma schema (many-to-many with Lead)
- [x] Add tag input with autocomplete to lead detail
- [x] Allow creating new tags on the fly
- [x] Show tags as colored pills on lead cards
- [x] Support multiple tags per lead
- [x] Add tag filter to Kanban board
- [x] Build tags management page
- [x] Implement rename tag (updates all leads)
- [x] Implement delete tag (removes from all leads)
- [x] Show lead count per tag

## Phase 14: Reminders & Follow-ups (Priority: P1) - COMPLETE!

- [x] Create Reminder model in Prisma schema
- [x] Add "Set Reminder" button to lead detail
- [x] Build date/time picker for reminder
- [x] Add optional note field for reminder
- [x] Show reminder icon on lead cards with upcoming reminders
- [x] Build "My Reminders" page showing upcoming reminders
- [x] Implement mark reminder complete
- [x] Implement snooze (1 day, 1 week)
- [x] Build "Today's Follow-ups" section

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

## Phase 20: Custom Pipeline Stages (Priority: P2)

- [ ] Create PipelineStage model in Prisma schema
- [ ] Build Pipeline settings page
- [ ] Allow renaming any stage
- [ ] Add custom color picker per stage
- [ ] Update Kanban to use custom stage names
- [ ] Prevent deleting stages with leads
- [ ] Add stage reordering via drag-drop

## Phase 21: Quick Actions (Priority: P2)

- [ ] Create QuickAction model in Prisma schema
- [ ] Add quick action buttons to lead cards
- [ ] Default actions: "Left VM", "No Answer", "Sent Email", "Meeting Scheduled"
- [ ] Build quick actions settings page
- [ ] Allow creating custom quick actions
- [ ] One-click adds timestamped note to lead

## Phase 22: Lead Archiving (Priority: P3)

- [ ] Add archived boolean field to Lead model
- [ ] Add "Archive" button to lead detail
- [ ] Hide archived leads from main Kanban
- [ ] Build "Archived Leads" page
- [ ] Implement unarchive action
- [ ] Add bulk archive action
- [ ] Auto-archive leads in Lost after 90 days (configurable)

## Phase 23: Lead Scoring (Priority: P2)

- [ ] Design scoring algorithm (social handles, notes, stage, reminders)
- [ ] Add computed score field or calculate on fetch
- [ ] Show score on lead cards (number or stars)
- [ ] Add fire/hot icon for high scores
- [ ] Sort leads by score option
- [ ] Score breakdown tooltip on hover
- [ ] Build scoring rules settings page

## Phase 24: Email Templates (Priority: P3)

- [ ] Create Template model in Prisma schema
- [ ] Build Templates management page
- [ ] Create, edit, delete templates
- [ ] Support template variables ({{name}}, {{company}}, etc.)
- [ ] Add "Use Template" button in lead detail
- [ ] Copy rendered template to clipboard
- [ ] Template categories/folders

## Phase 25: REST API (Priority: P3)

- [ ] Create /api/leads route (GET, POST)
- [ ] Create /api/leads/[id] route (GET, PUT, DELETE)
- [ ] Create /api/team route (GET)
- [ ] Implement API key authentication
- [ ] Add rate limiting (100 req/min)
- [ ] Build API documentation page
- [ ] Add webhook support for lead events (create, update, stage_change)

## Phase 26: Team Roles & Permissions (Priority: P2)

- [ ] Add role field to TeamMember model (ADMIN, MEMBER)
- [ ] Update seed to create admin user
- [ ] Hide delete buttons for non-admins
- [ ] Hide settings pages for non-admins
- [ ] Add role badge to team members list
- [ ] Require at least one admin (prevent demoting last admin)
- [ ] Build team invite flow with role selection

## Phase 27: Lead Engagement Analytics (Priority: P3)

- [ ] Calculate time between stage transitions
- [ ] Build average response time metric display
- [ ] Per-team-member response time breakdown
- [ ] Historical trend chart (30 days)
- [ ] Pipeline velocity report (avg days per stage)
- [ ] Funnel visualization component
- [ ] Stage-by-stage breakdown table
- [ ] Period comparison (vs previous month)
- [ ] Identify and highlight stuck leads
- [ ] Export analytics data to CSV

## Phase 28: Smart Lead Assignment (Priority: P2)

- [ ] Add auto-assignment settings to admin
- [ ] Implement round-robin assignment algorithm
- [ ] Track team member availability status
- [ ] Skip unavailable members in rotation
- [ ] Send assignment notifications
- [ ] Count active leads per team member
- [ ] Add maximum lead setting per member
- [ ] Implement workload-based assignment option
- [ ] Visual workload indicator on team page
- [ ] Re-balance existing leads feature

## Phase 29: Lead Communication Log (Priority: P2)

- [ ] Create Communication model in Prisma schema
- [ ] Build "Log Communication" modal
- [ ] Communication type selection (Email, Call, Meeting, Message)
- [ ] Date/time picker with default to now
- [ ] Outcome selection (Positive, Neutral, Negative)
- [ ] Display communications in lead timeline
- [ ] Filter timeline by communication type
- [ ] Communication count on lead cards

## Phase 30: Custom Fields (Priority: P3)

- [ ] Create CustomField model in Prisma schema
- [ ] Create CustomFieldValue model for lead values
- [ ] Admin UI for managing custom fields
- [ ] Support field types: Text, Number, Select, Date, Checkbox
- [ ] Required/optional field setting
- [ ] Default value configuration
- [ ] Render custom fields on lead form
- [ ] Render custom fields on lead detail
- [ ] Search and filter by custom fields
- [ ] Conditional field display rules

## Phase 31: Lead Nurturing Sequences (Priority: P3)

- [ ] Create Sequence model in Prisma schema
- [ ] Create SequenceStep model
- [ ] Create LeadSequenceEnrollment model
- [ ] Build sequence builder UI
- [ ] Define steps with delays (days)
- [ ] Enroll/unenroll leads from sequences
- [ ] Auto-create reminders from sequence steps
- [ ] Pause/resume sequence for lead
- [ ] Auto-exit sequence on stage change
- [ ] Sequence analytics dashboard

## Phase 32: Lead Merge & Deduplication (Priority: P2)

- [ ] Build duplicate detection algorithm (fuzzy name, exact email)
- [ ] Real-time duplicate check on lead create
- [ ] Warning modal with potential matches
- [ ] Confidence score for matches
- [ ] Side-by-side merge comparison view
- [ ] Select winning value per field
- [ ] Merge notes chronologically
- [ ] Merge tags
- [ ] Delete duplicate after merge
- [ ] Bulk duplicate scan for existing leads

## Phase 33: Audit Trail & History (Priority: P3)

- [ ] Create AuditLog model in Prisma schema
- [ ] Log all lead field changes
- [ ] Record user and timestamp for changes
- [ ] Store before/after values
- [ ] Build lead history view
- [ ] Filter history by field or user
- [ ] System-wide audit log page (admin)
- [ ] Filter by action type
- [ ] Date range filter
- [ ] Export audit data

## Phase 34: Data Backup & Recovery (Priority: P3)

- [ ] Build full data export (JSON format)
- [ ] Include all models in export
- [ ] Preserve relationships in export
- [ ] Downloadable backup file
- [ ] Upload backup file UI
- [ ] Validate backup integrity
- [ ] Preview changes before restore
- [ ] Full replace restore option
- [ ] Merge restore option
- [ ] Rollback on restore failure

## Phase 35: Lead Scoring Rules Engine (Priority: P2)

- [ ] Create ScoringRule model in Prisma schema
- [ ] Admin UI for scoring rules management
- [ ] Rule conditions (field equals, contains, exists)
- [ ] Point values per rule (+/-)
- [ ] Calculate lead score on create/update
- [ ] Store score on Lead model
- [ ] Score badge on lead cards
- [ ] "Hot lead" indicator for high scores
- [ ] Sort by score option
- [ ] Filter by score range

## Phase 36: Email Integration (Priority: P3)

- [ ] Gmail OAuth setup
- [ ] Match emails by lead email address
- [ ] Log incoming/outgoing emails
- [ ] Show emails in lead timeline
- [ ] Link to view full email in Gmail
- [ ] Email compose modal
- [ ] Rich text editor for emails
- [ ] Template insertion in compose
- [ ] Send via Gmail API
- [ ] Auto-log sent emails

## Phase 37: Task Management (Priority: P2)

- [ ] Create Task model in Prisma schema
- [ ] Task creation form (title, description, due date)
- [ ] Assign task to team member
- [ ] Show tasks in lead detail
- [ ] "My Tasks" page
- [ ] Mark task complete
- [ ] Due date reminders
- [ ] Overdue task highlighting
- [ ] "Today's Tasks" section
- [ ] Task priority levels

## Phase 38: Team Collaboration Features (Priority: P2)

- [ ] @mention autocomplete in notes
- [ ] Notification to mentioned user
- [ ] Highlight mentions in notes
- [ ] "Mentions" notification tab
- [ ] Separate internal comments section
- [ ] Comments marked as internal
- [ ] Different visual style for comments
- [ ] Comment threads/replies
- [ ] Real-time updates (polling/websocket)

## Phase 39: Reporting Dashboard (Priority: P3)

- [ ] Report builder UI
- [ ] Filter by any field
- [ ] Date range selection
- [ ] Aggregate functions (count, sum, avg)
- [ ] Save report for reuse
- [ ] Schedule report delivery
- [ ] Email delivery of reports
- [ ] PDF export option
- [ ] Multiple recipients for scheduled reports
- [ ] Report templates gallery

## Phase 40: Multi-Pipeline Support (Priority: P3)

- [ ] Create Pipeline model in Prisma schema
- [ ] Create PipelineStage model
- [ ] Default pipeline with existing stages
- [ ] Create new pipeline UI
- [ ] Custom stages per pipeline
- [ ] Assign leads to pipeline
- [ ] Pipeline switcher in header
- [ ] "All Pipelines" dashboard view
- [ ] Pipeline-specific reports
- [ ] Cross-pipeline search

## Phase 41: Mobile PWA Enhancements (Priority: P3)

- [ ] Streamlined mobile add form
- [ ] Camera integration for photos
- [ ] Business card OCR parsing
- [ ] Offline support with sync queue
- [ ] Quick voice note recording
- [ ] Push notification setup
- [ ] Configurable notification types
- [ ] Quick action buttons in notifications
- [ ] Notification preferences page
- [ ] Do not disturb schedule

## Phase 42: Webhooks & External Integrations (Priority: P3)

- [ ] Webhook configuration UI in admin
- [ ] Event type selection (lead.created, etc.)
- [ ] Custom payload templates
- [ ] Webhook delivery history/logs
- [ ] Retry failed webhooks
- [ ] Zapier trigger endpoints
- [ ] Zapier action endpoints
- [ ] OAuth authentication for integrations
- [ ] Integration documentation page
- [ ] Rate limiting for webhooks

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
- [x] Search input added to Kanban board (name filtering, clear button, no results state)
- [x] Platform filters added to Kanban board (multi-select, badges, clear all)
- [x] Tag system fully implemented (Phase 13 complete)
- [x] Reminder system implemented (Phase 14 complete)

## Guiding Principles

1. **Ship working software** — Each phase should result in usable functionality
2. **Data before UI** — Phases 1-3 before Phases 4-6
3. **Test as you go** — Every CRUD operation needs basic tests
4. **No dead code** — If it's not used, delete it
5. **Commit often** — Working increments, not big bangs
