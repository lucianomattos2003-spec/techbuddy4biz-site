# TechBuddy4Biz Web Application - Requirements Document

> **Instructions for Claude Desktop**: Please fill out each section below based on the full project scope. This document will be used by VS Code Copilot (Claude) to implement the web application features.

---

## 1. Project Overview

### 1.1 Current State
- **Existing site**: Static marketing site (HTML/CSS/JS)
- **Hosting**: [Where is it hosted? Netlify? Other?]
- **Domain**: techbuddy4biz.com

### 1.2 New Features Needed
List all features that require web pages/UI:
- [ ] Client onboarding
- [ ] API credentials management
- [ ] Job scheduling
- [ ] Document upload
- [ ] [Add others...]

---

## 2. Tech Stack Decisions

### 2.1 Backend
**Choose one and explain why:**
- [ ] Node.js (Express/Fastify)
- [ ] Python (FastAPI/Flask)
- [ ] Serverless (Netlify Functions / Vercel)
- [ ] Other: ___________

**Reasoning**: [Why this choice?]

### 2.2 Frontend
**Choose one:**
- [ ] Keep static HTML + vanilla JS + HTMX (minimal)
- [ ] React / Next.js
- [ ] Vue / Nuxt
- [ ] Svelte / SvelteKit
- [ ] Other: ___________

**Reasoning**: [Why this choice?]

### 2.3 Database
**PostgreSQL provider**: [Neon / Supabase / Railway / Other?]
**Connection string format**: [Provide example, redact secrets]

### 2.4 File Storage
**Cloudinary account**: [Confirmed yes/no]
**Use cases**: [Images only? Documents? Max file sizes?]

### 2.5 Authentication
**Method** (choose one or more):
- [ ] Email magic link
- [ ] Password-based
- [ ] OAuth (Google, etc.)
- [ ] API key for external access

**Auth provider** (if using a service):
- [ ] Auth0
- [ ] Clerk
- [ ] Supabase Auth
- [ ] Custom JWT
- [ ] Other: ___________

---

## 3. User Roles & Permissions

### 3.1 User Types
| Role | Description | Permissions |
|------|-------------|-------------|
| Admin (TechBuddy team) | [Describe] | [List what they can do] |
| Client | [Describe] | [List what they can do] |
| [Other roles?] | | |

### 3.2 Multi-tenancy
- Is data isolated per client? [Yes/No]
- Can clients have multiple users? [Yes/No]
- Can clients see each other's data? [Yes/No]

---

## 4. Database Schema

### 4.1 Existing Tables
List all tables that already exist in PostgreSQL:
```sql
-- Example format:
-- Table: clients
-- Columns: id, name, email, created_at, ...
```

### 4.2 New Tables Needed
List any new tables that need to be created:
```sql
-- Example:
-- Table: api_credentials
-- Columns: id, client_id, provider (google/meta/etc), encrypted_key, created_at
```

### 4.3 Relationships
Describe key relationships:
- clients → [has many] → api_credentials
- clients → [has many] → jobs
- [etc.]

---

## 5. Feature Specifications

### 5.1 Client Onboarding
**Purpose**: [What happens during onboarding?]

**Steps/Screens**:
1. [Step 1: e.g., Basic info form]
2. [Step 2: e.g., Connect Google account]
3. [Step 3: e.g., Upload logo]
4. [...]

**Data collected**:
- [ ] Business name
- [ ] Contact email
- [ ] Phone
- [ ] [Add fields...]

**Triggers/Webhooks**: [Does completing onboarding trigger an n8n workflow?]

---

### 5.2 API Credentials Management
**Purpose**: [Clients store their API keys for integrations?]

**Supported integrations**:
- [ ] Google Workspace (OAuth or service account?)
- [ ] Meta / Instagram
- [ ] WhatsApp Business
- [ ] VoIP provider: ___________
- [ ] [Others...]

**Security requirements**:
- Encryption at rest? [Yes/No]
- Who can view/edit credentials? [Client only? Admin too?]

**OAuth flows needed**:
List any OAuth integrations where you redirect users to authorize:
- [ ] Google OAuth
- [ ] Meta OAuth
- [ ] [Others...]

---

### 5.3 Job Scheduling
**Purpose**: [What are "jobs"? Automation runs? Reports?]

**Job types**:
| Job Type | Description | Frequency Options |
|----------|-------------|-------------------|
| [e.g., Weekly digest] | [What it does] | [Daily/Weekly/Monthly/Custom] |
| [e.g., Lead sync] | | |

**UI requirements**:
- [ ] Create new scheduled job
- [ ] View upcoming jobs
- [ ] View job history/logs
- [ ] Pause/resume jobs
- [ ] Manual trigger ("run now")

**Backend integration**:
- How does the web app tell n8n to run a job? [Webhook? Database poll? API?]
- How does n8n report job status back? [Webhook to API? Direct DB write?]

---

### 5.4 Document Upload
**Purpose**: [What documents do clients upload?]

**File types accepted**: [PDF, images, CSV, Excel, etc.]
**Max file size**: [e.g., 10MB]
**Storage**: Cloudinary

**Use cases**:
| Document Type | Purpose | Who uploads | Who views |
|---------------|---------|-------------|-----------|
| [e.g., Logo] | [Branding] | [Client] | [Client, Admin] |
| [e.g., Contact list] | [Import leads] | [Client] | [Admin] |

---

### 5.5 Dashboard / Portal Home
**What should clients see when they log in?**
- [ ] Welcome message / onboarding status
- [ ] Recent job runs / status
- [ ] Quick actions (upload, schedule, etc.)
- [ ] Usage stats
- [ ] [Other widgets...]

---

## 6. n8n Integration Points

### 6.1 Webhooks FROM web app TO n8n
| Trigger | Webhook URL pattern | Payload |
|---------|---------------------|---------|
| [e.g., Onboarding complete] | [URL or placeholder] | [What data to send] |
| [e.g., Job scheduled] | | |
| [e.g., Document uploaded] | | |

### 6.2 Webhooks FROM n8n TO web app
| Event | Purpose | Expected payload |
|-------|---------|------------------|
| [e.g., Job completed] | [Update job status in DB] | [What data n8n sends] |
| [e.g., Error occurred] | | |

### 6.3 Database Polling (if used)
Does n8n poll the database directly for pending jobs? [Yes/No]
If yes, describe the polling pattern:

---

## 7. Security Requirements

### 7.1 Data Protection
- [ ] API credentials must be encrypted at rest
- [ ] All traffic over HTTPS
- [ ] Session timeout after ___ minutes of inactivity
- [ ] [Other requirements...]

### 7.2 Audit Logging
What actions should be logged?
- [ ] Login/logout
- [ ] Credential changes
- [ ] Job creation/modification
- [ ] Document uploads
- [ ] [Others...]

---

## 8. UI/UX Requirements

### 8.1 Design System
- **Continue using current site styling?** [Yes/No]
- **Colors**: brandBlue (#0ea5e9), brandOrange (#fb923c), dark bg (#020617)
- **CSS framework**: TailwindCSS (already in use)

### 8.2 Responsive Requirements
- [ ] Must work on mobile
- [ ] Desktop-only is acceptable
- [ ] Tablet support needed

### 8.3 Localization
- [ ] Portal should support EN/ES/PT like marketing site
- [ ] English only for portal

---

## 9. Deployment & Infrastructure

### 9.1 Hosting Plan
- **Frontend**: [Same as marketing site? Separate?]
- **Backend API**: [Where? Vercel? Railway? VPS?]
- **Database**: [Already provisioned? Provider?]

### 9.2 Environment Variables Needed
List all env vars the app will need:
```
DATABASE_URL=
CLOUDINARY_URL=
JWT_SECRET=
N8N_WEBHOOK_BASE_URL=
[Add others...]
```

### 9.3 CI/CD
- Deployment method: [Manual? GitHub Actions? Netlify auto-deploy?]

---

## 10. Priority & Phasing

### Phase 1 (MVP)
List minimum features for first release:
1. 
2. 
3. 

### Phase 2
Features for second release:
1. 
2. 

### Phase 3 (Future)
Nice-to-haves:
1. 
2. 

---

## 11. Open Questions

List any decisions that still need to be made:
1. 
2. 
3. 

---

## 12. Additional Context

Paste any relevant information, diagrams, or notes from the n8n pipeline design that would help with implementation:

```
[Paste here]
```

---

**Once complete, save this file and share it back with VS Code Copilot for implementation.**
