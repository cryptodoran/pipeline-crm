# Pipeline CRM — Technical Requirements

## Overview

Pipeline is a team CRM for tracking leads across social platforms through a visual pipeline interface.

---

## Data Model

### Lead

The atomic unit of the system. A lead represents a potential relationship.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | CUID | Auto | Unique identifier |
| name | String | Yes | Display name of the lead |
| telegram | String | No | Telegram username (without @) |
| twitter | String | No | X/Twitter handle (without @) |
| farcaster | String | No | Farcaster username |
| tiktok | String | No | TikTok username |
| youtube | String | No | YouTube channel handle |
| twitch | String | No | Twitch username |
| instagram | String | No | Instagram handle (without @) |
| email | String | No | Email address |
| assigneeId | CUID | No | FK to TeamMember |
| stage | PipelineStage | Yes | Current pipeline position (default: NEW) |
| createdAt | DateTime | Auto | Creation timestamp |
| updatedAt | DateTime | Auto | Last modification timestamp |

**Constraints:**
- At least one contact method (any social handle or email) should be provided
- Email must be valid format if provided
- Social handles should be stored without @ prefix

### TeamMember

Represents someone who works leads.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | CUID | Auto | Unique identifier |
| name | String | Yes | Display name |
| email | String | Yes | Unique email for identification |
| createdAt | DateTime | Auto | Creation timestamp |

**Constraints:**
- Email must be unique across all team members

### Note

Timestamped context attached to a lead.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | CUID | Auto | Unique identifier |
| content | String | Yes | The note text |
| leadId | CUID | Yes | FK to Lead |
| authorId | CUID | Yes | FK to TeamMember who wrote it |
| createdAt | DateTime | Auto | When the note was created |

**Constraints:**
- Deleting a lead cascades to delete all its notes
- Content cannot be empty

### PipelineStage (Enum)

```
NEW         → Fresh lead, no action taken
CONTACTED   → Initial outreach sent
ENGAGED     → Two-way conversation started
QUALIFIED   → Confirmed mutual interest and fit
PROPOSAL    → Offer or proposal presented
NEGOTIATION → Terms being discussed
WON         → Successfully converted
LOST        → Did not convert
```

**Stage Transitions:**
- Leads can move forward or backward through stages
- Moving to LOST is valid from any stage
- Moving to WON is only valid from NEGOTIATION or PROPOSAL

---

## Functional Requirements

### FR-1: Lead Management

**FR-1.1** Create Lead
- User can create a lead with name (required) and any combination of social handles/email
- New leads default to NEW stage
- System generates unique ID automatically

**FR-1.2** View Lead
- User can view all lead details including all social handles
- Social handles render as clickable links to respective platforms
- Full note history is visible, newest first

**FR-1.3** Edit Lead
- User can update any lead field
- Changes trigger updatedAt timestamp update

**FR-1.4** Delete Lead
- User can delete a lead
- Deletion cascades to remove all associated notes
- Confirmation required before deletion

### FR-2: Pipeline Management

**FR-2.1** View Pipeline
- Display all leads in a Kanban board layout
- One column per pipeline stage (8 columns total)
- Leads shown as cards with name and key info

**FR-2.2** Move Lead Through Pipeline
- User can drag lead card to different stage column
- Stage change persists immediately
- Invalid transitions (WON from NEW) should be prevented

**FR-2.3** Filter Pipeline
- Filter leads by assigned team member
- Filter leads by stage(s)
- Search leads by name or handle

### FR-3: Team Assignment

**FR-3.1** Assign Lead
- User can assign a lead to a team member
- One lead can have exactly zero or one assignee
- Changing assignment is allowed

**FR-3.2** View Team Workload
- View all team members with their lead counts
- View all leads assigned to a specific member
- Identify unassigned leads

### FR-4: Notes

**FR-4.1** Add Note
- User can add a note to any lead
- Note automatically captures author and timestamp
- Notes cannot be edited after creation (append-only)

**FR-4.2** View Notes
- Notes display in reverse chronological order
- Each note shows content, author name, and timestamp

---

## Non-Functional Requirements

### NFR-1: Performance

- Page load: < 2 seconds for pipeline view with 100 leads
- Drag-drop feedback: < 100ms
- Database queries: < 50ms for single-record operations
- Must handle 1000+ leads without degradation

### NFR-2: Usability

- Keyboard navigable (tab through cards, arrow keys in columns)
- Responsive design: desktop (1200px+), tablet (768-1199px), mobile (< 768px)
- Clear visual hierarchy and stage colors
- Empty states with helpful guidance

### NFR-3: Reliability

- All mutations are atomic (no partial saves)
- Optimistic UI with rollback on failure
- Error messages are user-friendly

### NFR-4: Security

- Input sanitization on all user inputs
- No SQL injection (Prisma handles this)
- No XSS in rendered content

---

## Technical Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 20+ |
| Language | TypeScript | 5+ (strict mode) |
| Framework | Next.js | 14+ (App Router) |
| Database | SQLite | 3+ |
| ORM | Prisma | 5+ |
| Styling | Tailwind CSS | 3+ |
| Components | shadcn/ui | Latest |
| Validation | Zod | 3+ |
| Drag-Drop | @dnd-kit | Latest |

---

## API Design

Using Next.js Server Actions for all mutations.

### Lead Actions

```typescript
// Create a new lead
createLead(data: CreateLeadInput): Promise<Lead>

// Update lead details
updateLead(id: string, data: UpdateLeadInput): Promise<Lead>

// Delete a lead
deleteLead(id: string): Promise<void>

// Move lead to new stage
updateLeadStage(id: string, stage: PipelineStage): Promise<Lead>

// Assign lead to team member
assignLead(leadId: string, teamMemberId: string | null): Promise<Lead>
```

### Note Actions

```typescript
// Add note to lead
addNote(leadId: string, content: string, authorId: string): Promise<Note>
```

### Team Member Actions

```typescript
// Create team member
createTeamMember(data: CreateTeamMemberInput): Promise<TeamMember>

// List all team members
getTeamMembers(): Promise<TeamMember[]>
```

### Query Functions

```typescript
// Get all leads with relations
getLeads(): Promise<LeadWithRelations[]>

// Get single lead with all details
getLead(id: string): Promise<LeadWithRelations | null>

// Get leads by stage
getLeadsByStage(stage: PipelineStage): Promise<Lead[]>

// Get leads by assignee
getLeadsByAssignee(teamMemberId: string): Promise<Lead[]>
```

---

## UI Components

### Core Components

1. **KanbanBoard** — Container for all columns
2. **PipelineColumn** — Single stage column with drop zone
3. **LeadCard** — Draggable card showing lead summary
4. **LeadDetail** — Full lead view with all fields and notes
5. **LeadForm** — Create/edit lead form
6. **NoteTimeline** — Chronological note display
7. **NoteInput** — Add new note form
8. **TeamSelector** — Dropdown to assign team member
9. **StageSelector** — Dropdown/buttons to change stage
10. **SocialLink** — Platform-aware link with icon

### Page Structure

```
/                   → Kanban pipeline view (default)
/leads/[id]         → Lead detail page
/team               → Team members list
/team/[id]          → Team member detail with their leads
```

---

## Success Metrics

The CRM is complete when:

1. A new lead can be created with all 8 social handle fields
2. Leads appear on the Kanban board in correct columns
3. Dragging a lead to another column updates its stage
4. Notes can be added and display in timeline
5. Team members can be assigned to leads
6. Filtering by team member works
7. All CRUD operations have corresponding tests
8. UI works on mobile, tablet, and desktop
9. 1000 leads load and drag smoothly

---

## Out of Scope (v1)

- User authentication/login
- Multi-tenant support
- Email/notification integrations
- Import/export functionality
- Activity logging/audit trail
- Custom pipeline stages
- Lead scoring
- Reporting/analytics
