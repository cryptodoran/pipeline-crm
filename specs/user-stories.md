# Pipeline CRM — User Stories

> These stories breathe life into the requirements. Each one is a moment in your team's day.

---

## Epic 1: Lead Capture

### Story 1.1: Capturing a Conference Contact

**As** a team member who just met someone at a Web3 conference,
**I want** to quickly add them as a lead with their Telegram and Farcaster handles,
**So that** I don't lose their info and can follow up tomorrow.

**Scenario:**
```
Given I'm on the Pipeline dashboard
When I click "Add Lead"
And I enter:
  - Name: "Alex Chen"
  - Telegram: "alexchen_eth"
  - Farcaster: "alexchen"
Then a new lead appears in the "New" column
And I see Alex's card with both social icons visible
```

**Acceptance Criteria:**
- [ ] Lead form opens in modal or drawer
- [ ] Name is the only required field
- [ ] Form submits and closes on success
- [ ] New lead immediately visible in Kanban

---

### Story 1.2: Adding a Content Creator Lead

**As** a partnerships team member,
**I want** to add a creator with their YouTube, TikTok, and Twitch handles,
**So that** anyone on the team can see their full digital presence at a glance.

**Scenario:**
```
Given I'm creating a new lead
When I fill in:
  - Name: "Maya Studios"
  - YouTube: "@mayastudios"
  - TikTok: "mayastudios"
  - Twitch: "maya_studios"
  - Instagram: "mayastudios"
And I submit the form
Then the lead card shows icons for all 4 platforms
And clicking any icon opens that platform profile in a new tab
```

**Acceptance Criteria:**
- [ ] All 8 social handle fields available
- [ ] Platform icons displayed for filled handles only
- [ ] Links open correct platform URLs
- [ ] @ symbols stripped from display but included in URLs where needed

---

## Epic 2: Pipeline Management

### Story 2.1: Moving a Lead After First Contact

**As** a team member who just DM'd a lead on Twitter,
**I want** to drag their card from "New" to "Contacted",
**So that** the team knows I've made first contact.

**Scenario:**
```
Given I see "Alex Chen" in the "New" column
When I drag their card to the "Contacted" column
Then the card smoothly animates to the new column
And the move persists after page refresh
And the card shows it was updated recently
```

**Acceptance Criteria:**
- [ ] Drag and drop feels smooth (< 100ms feedback)
- [ ] Visual indicator during drag (shadow, scale)
- [ ] Stage persists to database
- [ ] Optimistic UI (move happens before server confirms)

---

### Story 2.2: Marking a Deal as Won

**As** a team lead reviewing closed deals,
**I want** to move a lead from "Negotiation" to "Won",
**So that** the win is recorded and visible to everyone.

**Scenario:**
```
Given "Maya Studios" is in the "Negotiation" column
When I drag their card to the "Won" column
Then the card moves to "Won"
And a subtle celebration indicator appears (optional)
And the lead count in "Won" increases by 1
```

**Acceptance Criteria:**
- [ ] WON only reachable from PROPOSAL or NEGOTIATION
- [ ] Column totals update in real-time
- [ ] Historical won deals remain visible

---

### Story 2.3: Losing a Lead Gracefully

**As** a team member closing the loop on a dead conversation,
**I want** to move any lead to "Lost" with a note explaining why,
**So that** we learn from what didn't work.

**Scenario:**
```
Given "Jordan Smith" has been stuck in "Qualified" for 3 weeks
When I drag their card to "Lost"
Then I'm prompted to add a note (optional)
And I write "No budget until Q3"
And the lead moves to "Lost" with my note attached
```

**Acceptance Criteria:**
- [ ] LOST accessible from any stage
- [ ] Optional note prompt on LOST transition
- [ ] Notes persist even if prompt is dismissed

---

## Epic 3: Collaboration

### Story 3.1: Assigning a Lead to a Teammate

**As** a founder who discovered a lead but doesn't have time to nurture it,
**I want** to assign the lead to a team member,
**So that** ownership is clear and nothing falls through cracks.

**Scenario:**
```
Given I'm viewing "Alex Chen's" lead detail
When I click the assignee dropdown
And I select "Sarah Kim"
Then Sarah's avatar/name appears on Alex's card
And Sarah can filter the Kanban to see only her leads
```

**Acceptance Criteria:**
- [ ] Assignee dropdown shows all team members
- [ ] "Unassigned" is a valid option
- [ ] Assignment reflected on Kanban card
- [ ] Filter by assignee works

---

### Story 3.2: Adding Context Before Handoff

**As** a team member who's been nurturing a lead,
**I want** to add detailed notes before handing off,
**So that** the next person has full context.

**Scenario:**
```
Given I'm on "Maya Studios" lead detail
When I click "Add Note"
And I write:
  "Had a 30min call. They're interested in sponsoring
   our podcast. Main concern is CPM rates. Decision
   maker is their CMO, not Maya herself. Follow up
   after they get Q1 budget approved (mid-January)."
Then my note appears at the top of the timeline
And it shows my name and "just now"
And the note is preserved when I assign to someone else
```

**Acceptance Criteria:**
- [ ] Note input supports multi-line text
- [ ] Author name auto-captured
- [ ] Timestamp displayed relatively ("5 min ago")
- [ ] Notes sorted newest-first

---

### Story 3.3: Understanding a Lead's History

**As** a team member picking up a lead from a colleague,
**I want** to read through all previous notes in order,
**So that** I know exactly where this relationship stands.

**Scenario:**
```
Given I click on "Jordan Smith" who was just assigned to me
Then I see the lead detail with:
  - All social handles (clickable)
  - Current stage: QUALIFIED
  - Assigned to: Me
  - 4 notes from different team members
And the notes tell the story:
  - "Met at ETHDenver" (Feb 2)
  - "Sent intro email" (Feb 5)
  - "Great call, they love our mission" (Feb 12)
  - "Waiting on legal review from their side" (Feb 20)
```

**Acceptance Criteria:**
- [ ] Note timeline shows full history
- [ ] Each note shows author and date
- [ ] Notes provide continuous narrative

---

## Epic 4: Team Visibility

### Story 4.1: Checking Team Workload

**As** a team lead,
**I want** to see how many leads each person is handling,
**So that** I can balance the workload fairly.

**Scenario:**
```
Given I navigate to the Team page
Then I see:
  - Sarah Kim: 12 leads (3 New, 5 Contacted, 4 Qualified)
  - Mike Johnson: 8 leads (2 New, 6 Engaged)
  - Unassigned: 23 leads
And I realize we need to distribute unassigned leads
```

**Acceptance Criteria:**
- [ ] Team page lists all members
- [ ] Lead count shown per member
- [ ] Breakdown by stage is visible
- [ ] Unassigned leads called out

---

### Story 4.2: Reviewing My Pipeline

**As** a team member starting my day,
**I want** to filter the Kanban to just my leads,
**So that** I can focus on my responsibilities.

**Scenario:**
```
Given I'm on the Pipeline dashboard
When I select "My Leads" from the filter
Then only leads assigned to me are shown
And empty columns collapse or show "No leads in this stage"
And I see I have 3 leads in CONTACTED that need attention
```

**Acceptance Criteria:**
- [ ] Filter by "My Leads" / "All Leads" / specific member
- [ ] Filter persists during session
- [ ] Empty states are helpful, not alarming

---

## Epic 5: Platform Intelligence

### Story 5.1: Quick-access to Lead's Social Presence

**As** a team member about to reach out on Twitter,
**I want** to click the Twitter icon and land on their profile,
**So that** I can personalize my message based on recent posts.

**Scenario:**
```
Given I'm viewing "Alex Chen" who has:
  - Twitter: alexchen_eth
  - Telegram: alexchen_eth
  - Farcaster: alexchen
When I click the Twitter icon
Then a new tab opens to https://x.com/alexchen_eth
When I click the Farcaster icon
Then a new tab opens to https://warpcast.com/alexchen
When I click the Telegram icon
Then a new tab opens to https://t.me/alexchen_eth
```

**Acceptance Criteria:**
- [ ] Each platform links to correct URL format
- [ ] Links open in new tab
- [ ] Icons only shown for filled handles
- [ ] Platform-appropriate icons (recognizable)

---

## Epic 6: Data Integrity

### Story 6.1: Editing Lead Information

**As** a team member who received updated contact info,
**I want** to update a lead's handles,
**So that** our records stay current.

**Scenario:**
```
Given "Maya Studios" changed their TikTok handle
When I open their detail view
And I click "Edit"
And I change TikTok from "mayastudios" to "mayastudios_official"
And I save
Then the card shows the updated TikTok link
And the updatedAt timestamp reflects the change
```

**Acceptance Criteria:**
- [ ] All fields editable
- [ ] Edit mode is explicit (not inline editing everywhere)
- [ ] Validation runs on save
- [ ] Changes reflected immediately in UI

---

### Story 6.2: Removing a Duplicate Lead

**As** a team lead doing data cleanup,
**I want** to delete a duplicate lead,
**So that** our pipeline stays accurate.

**Scenario:**
```
Given "Alex Chen" was entered twice
When I open the duplicate's detail view
And I click "Delete"
Then I see a confirmation: "Delete Alex Chen? This will remove all notes."
When I confirm
Then the lead disappears from the Kanban
And the column count decreases
```

**Acceptance Criteria:**
- [ ] Delete requires confirmation
- [ ] Confirmation mentions note deletion
- [ ] UI updates immediately
- [ ] Cannot undo (append-only note about this)

---

## Epic 7: Team Access & Deployment

### Story 7.1: Accessing CRM from Anywhere

**As** a team member working remotely,
**I want** to access Pipeline CRM from any device with internet,
**So that** I can manage leads whether I'm at the office, home, or traveling.

**Scenario:**
```
Given I'm on my phone at a coffee shop
When I open pipeline-crm.vercel.app in my browser
Then I see the full Kanban board
And I can add notes to leads
And changes sync instantly for the whole team
```

**Acceptance Criteria:**
- [ ] App deployed to Vercel (or similar hosting)
- [ ] Database hosted on Neon PostgreSQL (not local SQLite)
- [ ] Works on mobile browsers
- [ ] No local setup required for team members
- [ ] HTTPS enabled (automatic with Vercel)

---

### Story 7.2: Database Migration to Cloud

**As** a developer preparing for team deployment,
**I want** to migrate from SQLite to PostgreSQL,
**So that** multiple team members can access the same data simultaneously.

**Scenario:**
```
Given the app uses SQLite locally
When I update Prisma schema to PostgreSQL
And configure DATABASE_URL for Neon
And run prisma db push
Then the cloud database has all tables
And the app connects to Neon instead of local file
```

**Acceptance Criteria:**
- [ ] Prisma schema uses PostgreSQL provider
- [ ] DATABASE_URL reads from environment variable
- [ ] .env.example documents required variables
- [ ] .env is gitignored (no secrets in repo)
- [ ] prisma db push succeeds against Neon

---

### Story 7.3: One-Click Deploy to Vercel

**As** a team lead who wants the CRM live today,
**I want** to deploy to Vercel with minimal configuration,
**So that** the team can start using it immediately.

**Scenario:**
```
Given the code is pushed to GitHub
When I connect the repo to Vercel
And add DATABASE_URL environment variable
And click Deploy
Then the app builds successfully
And is live at a public URL
And the team can access it
```

**Acceptance Criteria:**
- [ ] Project pushed to GitHub repository
- [ ] vercel.json configured (if needed)
- [ ] Build command works: next build
- [ ] Environment variables documented
- [ ] Deployment succeeds with no errors
- [ ] Live URL accessible by team

---

### Story 7.4: Seeding Production Database

**As** a developer setting up the production environment,
**I want** to seed the Neon database with initial team members,
**So that** the team can start using the CRM with their accounts.

**Scenario:**
```
Given the Neon database is empty
When I run the seed script against production
Then team members are created in the database
And they appear in the Team dropdown
And leads can be assigned to them
```

**Acceptance Criteria:**
- [ ] Seed script works with PostgreSQL
- [ ] Can run seed against production DATABASE_URL
- [ ] Team members created successfully
- [ ] No duplicate key errors on re-run (upsert)

---

## Story Map Summary

| Epic | Priority | User Value |
|------|----------|------------|
| Lead Capture | P0 | Can't use CRM without leads |
| Pipeline Management | P0 | Core value proposition |
| Collaboration | P1 | Team coordination |
| Team Visibility | P1 | Management insight |
| Platform Intelligence | P2 | Efficiency boost |
| Data Integrity | P2 | Trust in the system |
| **Team Access & Deployment** | **P0** | **Can't use CRM if only local** |

---

## Definition of Done

A story is complete when:

1. All acceptance criteria pass
2. Happy path works end-to-end
3. Edge cases handled (empty states, errors)
4. Works on desktop and mobile
5. Code reviewed and merged
6. No console errors or warnings
