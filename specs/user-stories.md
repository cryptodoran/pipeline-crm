# Pipeline CRM — User Stories

> These stories breathe life into the requirements. Each one is a moment in your team's day.

---

## Epic 0: Critical Fixes & Deployment (Priority: P0)

### Story 0.1: Ensure Vercel Deployment Works

**As** a team member,
**I want** the CRM to deploy successfully to Vercel,
**So that** everyone can access it.

**Scenario:**
```
Given code is pushed to GitHub
When Vercel builds the project
Then build succeeds without errors
And DATABASE_URL is properly configured
And all pages load correctly
```

**Acceptance Criteria:**
- [ ] Verify DATABASE_URL is set in Vercel environment
- [ ] Run `npm run build` locally to catch errors before push
- [ ] Ensure Prisma generates client during build
- [ ] Test all routes after deployment
- [ ] Verify database connection works in production

---

### Story 0.2: Complete Tags Implementation

**As** a team member,
**I want** to tag leads with custom labels,
**So that** I can organize and filter leads my way.

**Scenario:**
```
Given I'm viewing a lead
When I add tags "VIP" and "Web3"
Then tags appear on the lead card
And I can filter Kanban by tag
```

**Acceptance Criteria:**
- [ ] Tag model exists in database (DONE)
- [ ] Server actions for tag CRUD
- [ ] Tag input component with autocomplete
- [ ] Tags displayed on lead cards
- [ ] Tag filter in Kanban toolbar
- [ ] /tags management page

---

### Story 0.3: Fix Any Build Errors

**As** a developer,
**I want** the build to pass without errors,
**So that** deployment works reliably.

**Scenario:**
```
Given I run npm run build
When build completes
Then there are no TypeScript errors
And no missing dependencies
And all imports resolve correctly
```

**Acceptance Criteria:**
- [ ] npm run build passes locally
- [ ] No TypeScript strict mode violations
- [ ] All imports valid
- [ ] Prisma client generated
- [ ] Environment variables documented

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

## Epic 8: Search & Filter

### Story 8.1: Finding a Lead by Name

**As** a team member looking for a specific lead,
**I want** to search by name across all pipeline stages,
**So that** I can quickly find anyone without scrolling.

**Scenario:**
```
Given I have 200 leads across all stages
When I type "Alex" in the search box
Then only leads with "Alex" in their name appear
And the Kanban filters to show matching leads
And I can clear search to see all leads again
```

**Acceptance Criteria:**
- [ ] Search input in header/toolbar
- [ ] Real-time filtering as user types
- [ ] Case-insensitive search
- [ ] Clear button to reset
- [ ] Shows "No results" if nothing matches

---

### Story 8.2: Filtering by Social Platform

**As** a partnerships manager targeting TikTok creators,
**I want** to filter leads that have a TikTok handle,
**So that** I can focus on platform-specific outreach.

**Scenario:**
```
Given I click the filter dropdown
When I select "Has TikTok"
Then only leads with a tiktok field are shown
And I can combine with other filters (e.g., stage)
```

**Acceptance Criteria:**
- [ ] Filter dropdown with platform options
- [ ] Multi-select filters (AND logic)
- [ ] Filter badge shows active filters
- [ ] Quick clear all filters

---

## Epic 9: Bulk Actions

### Story 9.1: Assigning Multiple Leads at Once

**As** a team lead onboarding a new team member,
**I want** to select multiple unassigned leads and assign them in bulk,
**So that** I can distribute work efficiently.

**Scenario:**
```
Given I'm viewing 20 unassigned leads
When I click checkbox on 5 lead cards
And I click "Bulk Assign"
And select "Sarah Kim"
Then all 5 leads are assigned to Sarah
And a success toast confirms "5 leads assigned"
```

**Acceptance Criteria:**
- [ ] Checkbox on each lead card
- [ ] "Select All" option
- [ ] Bulk action toolbar appears when items selected
- [ ] Bulk assign dropdown
- [ ] Success/error feedback

---

### Story 9.2: Moving Multiple Leads to a Stage

**As** a team member cleaning up the pipeline,
**I want** to select stale leads and move them to Lost in bulk,
**So that** I can keep the pipeline accurate without repetitive clicking.

**Scenario:**
```
Given I select 8 leads in "Contacted" that went cold
When I click "Bulk Move" and select "Lost"
Then all 8 leads move to the Lost column
And each gets a system note "Moved to Lost via bulk action"
```

**Acceptance Criteria:**
- [ ] Bulk move to any stage
- [ ] Automatic note added for audit trail
- [ ] Animation shows cards moving
- [ ] Can undo within 10 seconds

---

## Epic 10: Import & Export

### Story 10.1: Exporting Leads to CSV

**As** a team lead preparing a report,
**I want** to export all leads to a CSV file,
**So that** I can analyze data in Excel or share with stakeholders.

**Scenario:**
```
Given I click "Export" in the toolbar
When I select "All Leads" and "CSV"
Then a file downloads: pipeline-leads-2026-01-15.csv
And it contains all lead fields including notes count
```

**Acceptance Criteria:**
- [ ] Export button in toolbar
- [ ] CSV format with headers
- [ ] Includes all fields (name, socials, stage, assignee)
- [ ] Option to export current filter or all
- [ ] Filename includes date

---

### Story 10.2: Importing Leads from CSV

**As** a team member with a spreadsheet of conference contacts,
**I want** to import leads from a CSV file,
**So that** I don't have to enter them one by one.

**Scenario:**
```
Given I have a CSV with columns: name, email, twitter, telegram
When I click "Import" and upload the file
Then I see a preview of 50 leads to be imported
And I can map CSV columns to CRM fields
And clicking "Import" creates all 50 leads
```

**Acceptance Criteria:**
- [ ] Import button opens file picker
- [ ] CSV parsing with header detection
- [ ] Column mapping UI
- [ ] Preview before import
- [ ] Duplicate detection (by email)
- [ ] Import progress indicator
- [ ] Summary of imported/skipped

---

## Epic 11: Activity & Notifications

### Story 11.1: Seeing Recent Activity

**As** a team lead starting my day,
**I want** to see what happened overnight,
**So that** I know what changed without checking every lead.

**Scenario:**
```
Given team members were active yesterday
When I open the Activity feed
Then I see:
  - "Sarah moved Alex Chen to Qualified" (2h ago)
  - "Bob added note to Maya Studios" (5h ago)
  - "Carol created new lead: Jordan Smith" (8h ago)
```

**Acceptance Criteria:**
- [ ] Activity feed page or sidebar
- [ ] Shows lead changes, note additions, stage moves
- [ ] Relative timestamps
- [ ] Click to navigate to lead
- [ ] Filter by team member or action type

---

### Story 11.2: Lead Count Dashboard

**As** a founder tracking growth,
**I want** to see pipeline metrics at a glance,
**So that** I understand our lead flow.

**Scenario:**
```
Given I'm on the dashboard
Then I see:
  - Total leads: 156
  - This week: +23 new leads
  - Conversion rate: 12% (Won / Total)
  - By stage: NEW(45) CONTACTED(32) ENGAGED(28)...
```

**Acceptance Criteria:**
- [ ] Stats cards at top of Kanban or separate dashboard
- [ ] Total count, weekly delta
- [ ] Conversion funnel visualization
- [ ] Breakdown by stage
- [ ] Breakdown by team member

---

## Epic 12: Tags & Categories

### Story 12.1: Adding Tags to a Lead

**As** a team member categorizing leads,
**I want** to add custom tags like "VIP", "Crypto", "Gaming",
**So that** I can organize leads beyond just pipeline stages.

**Scenario:**
```
Given I'm viewing a lead's detail
When I click "Add Tag"
And I type "VIP" or select from existing tags
Then the tag appears on the lead card
And I can filter the Kanban by this tag
```

**Acceptance Criteria:**
- [ ] Tag input with autocomplete for existing tags
- [ ] Create new tags on the fly
- [ ] Tags shown as colored pills on lead cards
- [ ] Multiple tags per lead
- [ ] Filter Kanban by tag

---

### Story 12.2: Managing Tags

**As** a team lead,
**I want** to manage all tags in one place,
**So that** I can rename, merge, or delete unused tags.

**Acceptance Criteria:**
- [ ] Tags management page
- [ ] Rename tag (updates all leads)
- [ ] Delete tag (removes from all leads)
- [ ] Merge duplicate tags
- [ ] Show lead count per tag

---

## Epic 13: Reminders & Follow-ups

### Story 13.1: Setting a Follow-up Reminder

**As** a team member who needs to call back next week,
**I want** to set a reminder on a lead,
**So that** I don't forget to follow up.

**Scenario:**
```
Given I'm on a lead's detail page
When I click "Set Reminder"
And I select "Next Tuesday at 10am"
And I add note "Call to discuss partnership"
Then the reminder is saved
And I get notified when it's due
```

**Acceptance Criteria:**
- [ ] Date/time picker for reminder
- [ ] Optional note with reminder
- [ ] Reminder shown on lead card with icon
- [ ] "My Reminders" view showing upcoming
- [ ] Mark reminder complete or snooze

---

### Story 13.2: Viewing Today's Follow-ups

**As** a team member starting my day,
**I want** to see all my reminders due today,
**So that** I can prioritize my outreach.

**Acceptance Criteria:**
- [ ] "Today's Follow-ups" section or page
- [ ] Shows lead name, reminder note, time
- [ ] Click to open lead detail
- [ ] Quick actions: Complete, Snooze 1 day, Snooze 1 week

---

## Epic 14: Lead Sources

### Story 14.1: Tracking Where Leads Come From

**As** a team lead analyzing our funnel,
**I want** to tag leads with their source (Conference, Twitter DM, Referral),
**So that** I can see which channels bring the best leads.

**Scenario:**
```
Given I'm adding a new lead
When I select Source: "ETHDenver 2026"
Then the source is saved with the lead
And I can filter by source
And I can see conversion rates by source
```

**Acceptance Criteria:**
- [ ] Source dropdown on lead form
- [ ] Predefined sources + custom
- [ ] Source shown on lead card
- [ ] Filter by source
- [ ] Source breakdown in dashboard

---

## Epic 15: Dark Mode & Themes

### Story 15.1: Switching to Dark Mode

**As** a team member working late,
**I want** to switch to dark mode,
**So that** the screen doesn't strain my eyes.

**Scenario:**
```
Given I click the theme toggle in the header
When I select "Dark"
Then all UI elements switch to dark theme
And my preference is saved for next visit
```

**Acceptance Criteria:**
- [ ] Theme toggle in header (sun/moon icon)
- [ ] Light and dark theme variants
- [ ] Preference saved to localStorage
- [ ] Respects system preference by default
- [ ] All components styled for both themes

---

## Epic 16: Keyboard Shortcuts

### Story 16.1: Power User Navigation

**As** a power user managing many leads,
**I want** keyboard shortcuts for common actions,
**So that** I can work faster without touching the mouse.

**Scenario:**
```
Given I'm on the Kanban board
When I press "N"
Then the new lead form opens
When I press "/"
Then the search box is focused
When I press "?"
Then the shortcuts help modal appears
```

**Acceptance Criteria:**
- [ ] "N" - New lead
- [ ] "/" - Focus search
- [ ] "?" - Show shortcuts help
- [ ] "Esc" - Close modals
- [ ] Arrow keys - Navigate between cards
- [ ] "E" - Edit selected lead
- [ ] "1-8" - Move to stage 1-8

---

## Epic 17: Duplicate Detection

### Story 17.1: Finding Potential Duplicates

**As** a team lead cleaning up data,
**I want** the system to detect potential duplicate leads,
**So that** I can merge them and keep data clean.

**Scenario:**
```
Given two leads have the same email or very similar names
When I open the "Duplicates" view
Then I see pairs of potential duplicates
And I can review and merge them
```

**Acceptance Criteria:**
- [ ] Duplicates detection page
- [ ] Match by email (exact)
- [ ] Match by name (fuzzy)
- [ ] Side-by-side comparison view
- [ ] Merge action (keeps notes from both)
- [ ] Dismiss false positives

---

## Epic 18: Mobile PWA

### Story 18.1: Installing on Phone

**As** a team member on the go,
**I want** to install Pipeline as an app on my phone,
**So that** I can access it like a native app.

**Acceptance Criteria:**
- [ ] Valid manifest.json for PWA
- [ ] App icon (192x192, 512x512)
- [ ] "Add to Home Screen" prompt works
- [ ] Offline indicator when no connection
- [ ] Touch-friendly UI (larger tap targets)

---

## Epic 19: Custom Pipeline Stages

### Story 19.1: Renaming Pipeline Stages

**As** a team lead with our own sales process,
**I want** to rename pipeline stages to match our terminology,
**So that** the CRM fits how we actually work.

**Scenario:**
```
Given I go to Settings > Pipeline
When I rename "Contacted" to "First Touch"
And I rename "Qualified" to "Discovery Call"
Then all leads and filters show the new names
```

**Acceptance Criteria:**
- [ ] Pipeline settings page
- [ ] Rename any stage
- [ ] Custom colors per stage
- [ ] Changes reflect everywhere immediately
- [ ] Cannot delete stages with leads (must move first)

---

## Epic 20: Quick Actions

### Story 20.1: One-Click Quick Notes

**As** a team member in rapid-fire outreach mode,
**I want** quick note buttons like "Left VM", "No Answer", "Sent Email",
**So that** I can log activity without typing.

**Scenario:**
```
Given I'm on a lead card
When I click the quick action "Left VM"
Then a note is added: "Left voicemail" with timestamp
And I can configure my own quick actions
```

**Acceptance Criteria:**
- [ ] Quick action buttons on lead cards
- [ ] Default actions: "Left VM", "No Answer", "Sent Email", "Meeting Scheduled"
- [ ] Custom quick actions in settings
- [ ] One click adds timestamped note

---

## Epic 21: Lead Archiving

### Story 21.1: Archiving Old Leads

**As** a team lead cleaning up the pipeline,
**I want** to archive leads instead of deleting them,
**So that** I can reference them later if needed.

**Scenario:**
```
Given a lead has been in "Lost" for 6 months
When I click "Archive"
Then the lead moves to an archived state
And it no longer appears in the main Kanban
And I can find it in "Archived Leads" view
```

**Acceptance Criteria:**
- [ ] Archive action on lead detail
- [ ] Archived leads hidden from main Kanban
- [ ] "Archived Leads" view/page
- [ ] Unarchive action to bring lead back
- [ ] Bulk archive action

---

## Epic 22: Lead Scoring

### Story 22.1: Automatic Lead Scoring

**As** a team lead prioritizing outreach,
**I want** leads to have a score based on engagement,
**So that** we focus on the hottest leads first.

**Scenario:**
```
Given a lead has:
  - All social handles filled (+10)
  - 5+ notes (+15)
  - Moved past Qualified (+20)
  - Has reminder set (+5)
Then their score is 50
And high-scoring leads have a fire icon
```

**Acceptance Criteria:**
- [ ] Score calculation algorithm
- [ ] Score displayed on lead cards
- [ ] Sort by score option
- [ ] Score breakdown on hover
- [ ] Configurable scoring rules

---

## Epic 23: Email Templates

### Story 23.1: Saving Outreach Templates

**As** a team member doing repetitive outreach,
**I want** to save email templates,
**So that** I can quickly copy them for personalization.

**Scenario:**
```
Given I go to Templates
When I create a template called "Conference Follow-up"
With body: "Great meeting you at {{event}}! I'd love to..."
Then I can use this template from any lead's detail page
```

**Acceptance Criteria:**
- [ ] Templates management page
- [ ] Create, edit, delete templates
- [ ] Template variables ({{name}}, {{company}})
- [ ] Copy template to clipboard from lead detail
- [ ] Template categories

---

## Epic 24: REST API

### Story 24.1: Programmatic Lead Creation

**As** a developer integrating with other tools,
**I want** a REST API to create and update leads,
**So that** I can build automations and integrations.

**Scenario:**
```
Given I have an API key
When I POST to /api/leads with lead data
Then a new lead is created
And I receive the lead ID in response
```

**Acceptance Criteria:**
- [ ] API routes for leads CRUD
- [ ] API key authentication
- [ ] Rate limiting (100 req/min)
- [ ] API documentation page
- [ ] Webhook support for lead events

---

## Epic 25: Team Roles & Permissions

### Story 25.1: Admin vs Member Roles

**As** a team lead,
**I want** to control who can delete leads and manage settings,
**So that** regular members can't accidentally break things.

**Acceptance Criteria:**
- [ ] Role field on TeamMember (admin, member)
- [ ] Admins can: delete leads, manage settings, manage team
- [ ] Members can: create, edit, assign, add notes
- [ ] Role-based UI (hide admin actions for members)
- [ ] At least one admin required

---

## Epic 26: Company/Organization Grouping

### Story 26.1: Linking Leads to Companies

**As** a B2B sales team member,
**I want** to group multiple leads under one company,
**So that** I can see all our contacts at an organization.

**Scenario:**
```
Given I have 3 leads from "Acme Corp"
When I create a Company "Acme Corp"
And link all 3 leads to it
Then I can view the company page showing all contacts
And see total engagement across all leads
```

**Acceptance Criteria:**
- [ ] Company model in database
- [ ] Company creation form
- [ ] Link lead to company dropdown
- [ ] Company detail page showing all linked leads
- [ ] Company list view with lead counts

---

## Epic 27: Deal Value & Revenue Tracking

### Story 27.1: Adding Deal Value to Leads

**As** a sales manager tracking revenue,
**I want** to add a dollar value to each lead,
**So that** I can see pipeline value by stage.

**Scenario:**
```
Given I'm editing a lead in Proposal stage
When I add Deal Value: $50,000
Then the value shows on the lead card
And the pipeline shows total value per stage
And I can sort leads by value
```

**Acceptance Criteria:**
- [ ] Deal value field on Lead model
- [ ] Currency input in lead form
- [ ] Value displayed on lead cards
- [ ] Total pipeline value per stage
- [ ] Sort by value option
- [ ] Won/Lost revenue reports

---

## Epic 28: Lead Comments & Mentions

### Story 28.1: @Mentioning Team Members

**As** a team member needing input,
**I want** to @mention colleagues in notes,
**So that** they get notified and can respond.

**Scenario:**
```
Given I'm adding a note to a lead
When I type "@sarah need your input on pricing"
Then Sarah gets a notification
And the mention is highlighted in the note
And Sarah can click to jump to the lead
```

**Acceptance Criteria:**
- [ ] @mention autocomplete in note input
- [ ] Mention highlighting in notes
- [ ] Notification when mentioned
- [ ] Click mention to view team member
- [ ] "Mentions" filter in activity feed

---

## Epic 29: Lead Timeline Visualization

### Story 29.1: Visual Journey Timeline

**As** a team member reviewing a lead's history,
**I want** to see a visual timeline of all events,
**So that** I understand the full journey at a glance.

**Scenario:**
```
Given I open a lead's detail page
When I click "Timeline" tab
Then I see a vertical timeline showing:
  - Created (Jan 1)
  - Stage: New → Contacted (Jan 3)
  - Note added by Bob (Jan 5)
  - Stage: Contacted → Qualified (Jan 10)
  - Reminder set (Jan 12)
```

**Acceptance Criteria:**
- [ ] Timeline component with vertical layout
- [ ] Event types: stage changes, notes, reminders, assignments
- [ ] Timestamps with relative dates
- [ ] Event icons by type
- [ ] Expandable event details

---

## Epic 30: Saved Views & Filters

### Story 30.1: Saving Custom Filter Views

**As** a team member with specific workflows,
**I want** to save my filter combinations as named views,
**So that** I can quickly switch between them.

**Scenario:**
```
Given I filter by "My Leads" + "Has Twitter" + "Contacted stage"
When I click "Save View" and name it "Twitter Outreach"
Then the view appears in my sidebar
And clicking it applies all those filters instantly
```

**Acceptance Criteria:**
- [ ] Save current filters as named view
- [ ] Views list in sidebar
- [ ] Click to apply view filters
- [ ] Edit/rename/delete views
- [ ] Personal vs shared views option

---

## Epic 31: Slack Integration

### Story 31.1: Posting Lead Updates to Slack

**As** a team using Slack for communication,
**I want** CRM updates posted to a Slack channel,
**So that** everyone stays informed without checking the CRM.

**Scenario:**
```
Given Slack integration is configured
When a lead moves to "Won"
Then a message posts to #sales-wins:
  "🎉 Alex Chen moved Maya Studios to Won! Deal value: $50k"
```

**Acceptance Criteria:**
- [ ] Slack OAuth integration
- [ ] Channel selection in settings
- [ ] Configurable notification triggers
- [ ] Rich message formatting
- [ ] Link back to CRM lead

---

## Epic 32: Calendar Integration

### Story 32.1: Syncing Reminders to Google Calendar

**As** a team member using Google Calendar,
**I want** my CRM reminders to appear on my calendar,
**So that** I don't miss follow-ups.

**Scenario:**
```
Given I set a reminder "Call Alex Tuesday 2pm"
When the reminder syncs
Then it appears in my Google Calendar
With link back to the lead in CRM
```

**Acceptance Criteria:**
- [ ] Google Calendar OAuth
- [ ] Reminder → Calendar event sync
- [ ] Two-way sync (calendar changes reflect in CRM)
- [ ] Calendar event includes CRM link
- [ ] Disconnect calendar option

---

## Epic 33: Lead Engagement Analytics

### Story 33.1: Tracking Lead Response Times

**As** a team lead,
**I want** to see how quickly my team responds to new leads,
**So that** I can improve our responsiveness.

**Scenario:**
```
Given I view the analytics dashboard
When I check "Response Times"
Then I see average time from NEW to CONTACTED
Broken down by team member
With trend line over past 30 days
```

**Acceptance Criteria:**
- [ ] Calculate time between stage transitions
- [ ] Average response time metric
- [ ] Per-team-member breakdown
- [ ] Historical trend chart
- [ ] Export analytics data

---

### Story 33.2: Pipeline Velocity Report

**As** a sales manager,
**I want** to see how long leads stay in each stage,
**So that** I can identify bottlenecks.

**Scenario:**
```
Given leads move through the pipeline
When I view velocity report
Then I see average days per stage
With visualization of flow
And comparison to previous period
```

**Acceptance Criteria:**
- [ ] Track time in each stage
- [ ] Funnel visualization
- [ ] Stage-by-stage breakdown
- [ ] Period comparison
- [ ] Identify stuck leads

---

## Epic 34: Smart Lead Assignment

### Story 34.1: Round-Robin Auto-Assignment

**As** a team lead,
**I want** new leads to be automatically assigned to team members,
**So that** work is distributed fairly.

**Scenario:**
```
Given auto-assignment is enabled
When a new lead is created without assignee
Then it's assigned to the next team member in rotation
And notification is sent to them
```

**Acceptance Criteria:**
- [ ] Enable/disable auto-assignment
- [ ] Round-robin algorithm
- [ ] Skip unavailable team members
- [ ] Assignment notification
- [ ] Manual override option

---

### Story 34.2: Workload-Based Assignment

**As** a team lead,
**I want** leads assigned based on current workload,
**So that** no one gets overwhelmed.

**Scenario:**
```
Given workload-based assignment is enabled
When a new lead arrives
Then it's assigned to the team member with fewest active leads
Respecting maximum lead count settings
```

**Acceptance Criteria:**
- [ ] Count active leads per member
- [ ] Maximum lead setting per member
- [ ] Workload balancing algorithm
- [ ] Visual workload indicator
- [ ] Re-balance existing leads option

---

## Epic 35: Lead Communication Log

### Story 35.1: Logging External Communications

**As** a team member,
**I want** to log emails and calls I make outside the CRM,
**So that** the team has complete communication history.

**Scenario:**
```
Given I'm viewing a lead
When I click "Log Communication"
Then I can select type (Email, Call, Meeting, Message)
And enter summary and outcome
And it appears in the lead's timeline
```

**Acceptance Criteria:**
- [ ] Communication type selection
- [ ] Date/time picker (defaults to now)
- [ ] Summary text field
- [ ] Outcome selection (Positive, Neutral, Negative)
- [ ] Timeline integration

---

### Story 35.2: Email Forwarding to CRM

**As** a team member,
**I want** to forward emails to CRM for automatic logging,
**So that** I don't have to manually copy content.

**Scenario:**
```
Given I receive an email from a lead
When I forward it to leads@mycrm.pipeline
Then the email content is extracted
And added as a note to the matching lead
```

**Acceptance Criteria:**
- [ ] Unique CRM email address
- [ ] Parse forwarded email content
- [ ] Match sender to lead (by email)
- [ ] Create note with email body
- [ ] Handle attachments

---

## Epic 36: Custom Fields

### Story 36.1: Adding Custom Fields to Leads

**As** an admin,
**I want** to add custom fields to the lead form,
**So that** we can capture industry-specific data.

**Scenario:**
```
Given I'm in settings
When I add custom field "Company Size"
With type "Select" and options S/M/L/Enterprise
Then the field appears on all lead forms
And data is stored and searchable
```

**Acceptance Criteria:**
- [ ] Admin-only field management
- [ ] Field types: Text, Number, Select, Date, Checkbox
- [ ] Required/optional setting
- [ ] Default value option
- [ ] Search and filter by custom fields

---

### Story 36.2: Conditional Field Display

**As** an admin,
**I want** some fields to only show based on other field values,
**So that** forms stay clean and relevant.

**Scenario:**
```
Given I configure "Contract Value" field
When I set condition "Stage = Proposal or later"
Then the field only appears for leads in those stages
```

**Acceptance Criteria:**
- [ ] Conditional visibility rules
- [ ] Multiple conditions (AND/OR)
- [ ] Stage-based conditions
- [ ] Tag-based conditions
- [ ] Custom field-based conditions

---

## Epic 37: Lead Nurturing Sequences

### Story 37.1: Creating Follow-up Sequences

**As** a team member,
**I want** to enroll leads in automated follow-up sequences,
**So that** I don't forget to check in regularly.

**Scenario:**
```
Given I have a "New Lead Nurture" sequence
When I enroll a lead
Then reminders are created automatically
Day 1: Initial follow-up
Day 3: Check in
Day 7: Value add touch
Day 14: Re-engagement
```

**Acceptance Criteria:**
- [ ] Create/edit sequences
- [ ] Define steps with delays
- [ ] Enroll/unenroll leads
- [ ] Pause/resume sequence
- [ ] Auto-exit on stage change

---

### Story 37.2: Sequence Analytics

**As** a team lead,
**I want** to see how effective our sequences are,
**So that** we can optimize them.

**Scenario:**
```
Given leads are in sequences
When I view sequence analytics
Then I see completion rate, drop-off points
And conversion rate for sequenced vs non-sequenced leads
```

**Acceptance Criteria:**
- [ ] Sequence completion rate
- [ ] Step-by-step drop-off
- [ ] Conversion comparison
- [ ] Best performing sequences
- [ ] A/B test sequences

---

## Epic 38: Lead Merge & Deduplication

### Story 38.1: Manual Lead Merge

**As** a team member,
**I want** to merge two duplicate leads into one,
**So that** all information is consolidated.

**Scenario:**
```
Given I identify two leads as duplicates
When I select "Merge Leads"
Then I choose which fields to keep from each
All notes are combined chronologically
And the duplicate is removed
```

**Acceptance Criteria:**
- [ ] Side-by-side field comparison
- [ ] Select winning value per field
- [ ] Merge all notes preserving dates
- [ ] Merge all tags
- [ ] Redirect old lead references

---

### Story 38.2: Automatic Duplicate Detection

**As** a team member,
**I want** the system to warn me about potential duplicates,
**So that** I don't create duplicate leads.

**Scenario:**
```
Given I'm creating a new lead "John Smith"
When the system finds existing "John Smith" or matching email
Then I see a warning with potential matches
And can choose to view existing or continue creating
```

**Acceptance Criteria:**
- [ ] Real-time duplicate check on create
- [ ] Match on name (fuzzy)
- [ ] Match on email (exact)
- [ ] Match on social handles
- [ ] Confidence score for matches

---

## Epic 39: Audit Trail & History

### Story 39.1: Viewing Lead Change History

**As** a team member,
**I want** to see all changes made to a lead,
**So that** I understand how the lead evolved.

**Scenario:**
```
Given I open lead history
Then I see chronological list of all changes
Who made each change and when
Previous and new values for each field
```

**Acceptance Criteria:**
- [ ] Log all field changes
- [ ] Record user and timestamp
- [ ] Show before/after values
- [ ] Filter by field or user
- [ ] Export history

---

### Story 39.2: System-wide Audit Log

**As** an admin,
**I want** to see all system changes,
**So that** I can track team activity and investigate issues.

**Scenario:**
```
Given I access the audit log
Then I see all actions across the system
Filterable by user, action type, date range
With details of each change
```

**Acceptance Criteria:**
- [ ] Centralized audit log
- [ ] Filter by user
- [ ] Filter by action type
- [ ] Date range filter
- [ ] Export audit data

---

## Epic 40: Data Backup & Recovery

### Story 40.1: Exporting Full Backup

**As** an admin,
**I want** to export a complete backup of all CRM data,
**So that** we have disaster recovery capability.

**Scenario:**
```
Given I'm in admin settings
When I click "Export Full Backup"
Then all data is exported in standard format
Including leads, notes, team members, tags
With option to restore later
```

**Acceptance Criteria:**
- [ ] Full data export (JSON/CSV)
- [ ] Include all models
- [ ] Include relationships
- [ ] Downloadable file
- [ ] Encrypted option

---

### Story 40.2: Restoring from Backup

**As** an admin,
**I want** to restore CRM from a backup,
**So that** we can recover from data loss.

**Scenario:**
```
Given I have a backup file
When I upload and confirm restore
Then all data is restored to that point
With option for full replace or merge
```

**Acceptance Criteria:**
- [ ] Upload backup file
- [ ] Validate backup integrity
- [ ] Preview changes before restore
- [ ] Full replace or merge option
- [ ] Rollback if restore fails

---

## Epic 41: Lead Scoring Rules Engine

### Story 41.1: Configuring Scoring Rules

**As** an admin,
**I want** to define custom scoring rules for leads,
**So that** we can identify high-potential leads automatically.

**Scenario:**
```
Given I'm in scoring settings
When I add rule "+10 points if has Email"
And I add rule "+20 points if stage is Engaged+"
Then all leads are scored automatically
And high scores are highlighted
```

**Acceptance Criteria:**
- [ ] Admin scoring rules UI
- [ ] Rule conditions (field equals, contains, exists)
- [ ] Point values per rule
- [ ] Auto-recalculate on lead changes
- [ ] Score history tracking

---

### Story 41.2: Score-Based Lead Prioritization

**As** a team member,
**I want** to see leads sorted by score,
**So that** I focus on the most promising ones.

**Scenario:**
```
Given leads have scores
When I click "Sort by Score"
Then leads are ordered highest to lowest
With score badge visible on each card
```

**Acceptance Criteria:**
- [ ] Sort by score option
- [ ] Score badge on lead cards
- [ ] "Hot lead" indicator for top scores
- [ ] Score breakdown tooltip
- [ ] Filter by score range

---

## Epic 42: Email Integration

### Story 42.1: Connecting Gmail Account

**As** a team member,
**I want** to connect my Gmail account,
**So that** emails with leads are automatically logged.

**Scenario:**
```
Given I connect my Gmail via OAuth
When I send/receive email to/from a lead's email
Then the email appears in that lead's timeline
With subject, snippet, and timestamp
```

**Acceptance Criteria:**
- [ ] Gmail OAuth integration
- [ ] Match emails by lead email address
- [ ] Log incoming and outgoing emails
- [ ] Show email in lead timeline
- [ ] Link to view full email in Gmail

---

### Story 42.2: Sending Email from CRM

**As** a team member,
**I want** to compose and send emails from within the CRM,
**So that** I don't have to switch between apps.

**Scenario:**
```
Given I'm viewing a lead
When I click "Send Email"
Then I compose email with lead's email prefilled
And email is sent via my connected Gmail
And it's logged in the timeline
```

**Acceptance Criteria:**
- [ ] Email compose modal
- [ ] Rich text editor
- [ ] Template insertion
- [ ] Send via Gmail API
- [ ] Auto-log in timeline

---

## Epic 43: Task Management

### Story 43.1: Creating Tasks for Leads

**As** a team member,
**I want** to create tasks associated with leads,
**So that** I track what needs to be done.

**Scenario:**
```
Given I'm viewing a lead
When I click "Add Task"
And enter "Send proposal" due tomorrow
Then the task appears in lead detail
And in my tasks list
```

**Acceptance Criteria:**
- [ ] Create task with title, description, due date
- [ ] Assign task to team member
- [ ] Task appears in lead detail
- [ ] Personal "My Tasks" page
- [ ] Mark task complete

---

### Story 43.2: Task Reminders

**As** a team member,
**I want** to be reminded about upcoming tasks,
**So that** I don't miss deadlines.

**Scenario:**
```
Given I have a task due tomorrow
When tomorrow arrives
Then I see a notification
And the task appears in "Today's Tasks"
```

**Acceptance Criteria:**
- [ ] Due date reminders
- [ ] Overdue task highlighting
- [ ] "Today's Tasks" section
- [ ] Task priority levels
- [ ] Snooze task option

---

## Epic 44: Team Collaboration Features

### Story 44.1: @Mentioning Team Members

**As** a team member,
**I want** to @mention colleagues in notes,
**So that** they're notified about relevant leads.

**Scenario:**
```
Given I'm adding a note to a lead
When I type "@sarah needs to review"
Then Sarah gets a notification
With link to the lead
```

**Acceptance Criteria:**
- [ ] @mention autocomplete
- [ ] Notification to mentioned user
- [ ] Mention highlighted in note
- [ ] "Mentions" notification tab
- [ ] Click mention to view profile

---

### Story 44.2: Internal Comments vs Notes

**As** a team member,
**I want** to add private comments separate from notes,
**So that** internal discussions stay separate.

**Scenario:**
```
Given I view a lead
When I add an internal comment
Then it's visible to team only
And separate from client-facing notes
```

**Acceptance Criteria:**
- [ ] Separate comments section
- [ ] Comments marked as internal
- [ ] Different visual style
- [ ] @mentions in comments
- [ ] Comment threads/replies

---

## Epic 45: Reporting Dashboard

### Story 45.1: Building Custom Reports

**As** a team lead,
**I want** to create custom reports,
**So that** I track the metrics that matter to us.

**Scenario:**
```
Given I'm in reports section
When I create report "Weekly Conversions"
With filters: stage changed to Won, this week
Then I see matching leads and totals
And can save/schedule the report
```

**Acceptance Criteria:**
- [ ] Report builder UI
- [ ] Filter by any field
- [ ] Date range selection
- [ ] Aggregate functions (count, sum)
- [ ] Save report for reuse

---

### Story 45.2: Scheduled Report Emails

**As** a team lead,
**I want** to receive reports by email weekly,
**So that** I stay informed without logging in.

**Scenario:**
```
Given I have a saved report
When I set schedule "Every Monday 9am"
Then I receive report via email
With summary and link to full report
```

**Acceptance Criteria:**
- [ ] Schedule configuration
- [ ] Email delivery
- [ ] PDF attachment option
- [ ] Multiple recipients
- [ ] Unsubscribe option

---

## Epic 46: Multi-Pipeline Support

### Story 46.1: Creating Multiple Pipelines

**As** an admin,
**I want** to create separate pipelines,
**So that** we can track different types of leads.

**Scenario:**
```
Given we have Sales and Partnerships teams
When I create "Partnerships Pipeline"
With custom stages: Identified, Reached Out, In Discussion, Agreed, Active
Then leads can be placed in either pipeline
```

**Acceptance Criteria:**
- [ ] Create new pipeline
- [ ] Custom stages per pipeline
- [ ] Assign leads to pipeline
- [ ] Pipeline switcher in UI
- [ ] Pipeline-specific reports

---

### Story 46.2: Cross-Pipeline Views

**As** a team lead,
**I want** to see all pipelines at once,
**So that** I have a complete picture.

**Scenario:**
```
Given we have multiple pipelines
When I select "All Pipelines" view
Then I see aggregated stats
And can filter across pipelines
```

**Acceptance Criteria:**
- [ ] "All Pipelines" dashboard
- [ ] Combined metrics
- [ ] Filter by pipeline
- [ ] Cross-pipeline search
- [ ] Pipeline comparison report

---

## Epic 47: Mobile App Features

### Story 47.1: Quick Lead Capture on Mobile

**As** a team member at an event,
**I want** to quickly add leads from my phone,
**So that** I capture contacts immediately.

**Scenario:**
```
Given I'm at a conference
When I open the mobile app
Then I can quickly add name + one social handle
And take a photo of their business card
```

**Acceptance Criteria:**
- [ ] Streamlined mobile add form
- [ ] Camera integration
- [ ] Business card OCR
- [ ] Offline support with sync
- [ ] Quick voice note option

---

### Story 47.2: Mobile Notifications

**As** a team member,
**I want** to receive push notifications,
**So that** I'm alerted to important updates.

**Scenario:**
```
Given a lead I own moves to "Won"
When another team member updates it
Then I get a push notification
With quick actions available
```

**Acceptance Criteria:**
- [ ] Push notification setup
- [ ] Configurable notification types
- [ ] Quick action buttons
- [ ] Notification preferences
- [ ] Do not disturb schedule

---

## Epic 48: Webhooks & Integrations

### Story 48.1: Setting Up Webhooks

**As** an admin,
**I want** to configure webhooks for events,
**So that** external systems can react to CRM changes.

**Scenario:**
```
Given I configure webhook for "lead.stage_changed"
When a lead moves to "Won"
Then webhook fires to configured URL
With lead data in JSON payload
```

**Acceptance Criteria:**
- [ ] Webhook configuration UI
- [ ] Event type selection
- [ ] Custom payload templates
- [ ] Webhook history/logs
- [ ] Retry on failure

---

### Story 48.2: Zapier Integration

**As** a team member,
**I want** to connect CRM to Zapier,
**So that** I can automate workflows with other tools.

**Scenario:**
```
Given CRM is connected to Zapier
When I create a Zap "New Lead → Slack notification"
Then every new lead triggers Slack message
Without custom code
```

**Acceptance Criteria:**
- [ ] Zapier app listing
- [ ] Trigger events available
- [ ] Action endpoints available
- [ ] Authentication flow
- [ ] Usage documentation

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
| **Search & Filter** | **P1** | **Find leads fast** |
| **Bulk Actions** | **P2** | **Efficiency at scale** |
| **Import & Export** | **P2** | **Data portability** |
| **Activity & Notifications** | **P3** | **Team awareness** |
| **Tags & Categories** | **P1** | **Organize leads your way** |
| **Reminders & Follow-ups** | **P1** | **Never forget to follow up** |
| **Lead Sources** | **P2** | **Track what's working** |
| **Dark Mode & Themes** | **P3** | **Comfortable viewing** |
| **Keyboard Shortcuts** | **P3** | **Power user speed** |
| **Duplicate Detection** | **P2** | **Clean data** |
| **Mobile PWA** | **P2** | **Access anywhere** |
| **Custom Pipeline Stages** | **P2** | **Fit your process** |
| **Quick Actions** | **P2** | **Log activity fast** |
| **Lead Archiving** | **P3** | **Clean pipeline, keep history** |
| **Lead Scoring** | **P2** | **Focus on hot leads** |
| **Email Templates** | **P3** | **Faster outreach** |
| **REST API** | **P3** | **Build integrations** |
| **Team Roles** | **P2** | **Control access** |
| **Company Grouping** | **P2** | **B2B organization view** |
| **Deal Value & Revenue** | **P1** | **Track pipeline $$$** |
| **Comments & Mentions** | **P2** | **Team collaboration** |
| **Timeline Visualization** | **P2** | **See the full journey** |
| **Saved Views** | **P2** | **Quick workflow switching** |
| **Slack Integration** | **P3** | **Stay informed in Slack** |
| **Calendar Integration** | **P3** | **Never miss a follow-up** |

---

## Definition of Done

A story is complete when:

1. All acceptance criteria pass
2. Happy path works end-to-end
3. Edge cases handled (empty states, errors)
4. Works on desktop and mobile
5. Code reviewed and merged
6. No console errors or warnings
