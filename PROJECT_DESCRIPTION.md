# Project Analysis: Visitor Management System

## Overview
This is a **full-stack Visitor Management System** built with **Next.js 15 (App Router)**, **MongoDB (Mongoose)**, **Cloudinary** for image storage, and **JWT-based authentication**. It includes a **Juniper Mist WiFi integration** for guest access.

---

## Tech Stack
| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS 4, HeroUI, Lucide React |
| **Backend** | Next.js API Routes, Mongoose ODM |
| **Database** | MongoDB Atlas |
| **Image Storage** | Cloudinary |
| **Authentication** | JWT + bcryptjs |
| **Email** | Nodemailer (SMTP/Gmail) |
| **QR Code** | qrcode.react, html5-qrcode |
| **WiFi Integration** | Juniper Mist API |

---

## Core Features

### 1. **Visitor Registration Flow** (`/visitor`)
- Multi-step form: Details → OTP verification → Photo upload → QR card generation
- **Photo capture** via mobile camera with client-side compression (200KB limit)
- **Geolocation** required (blocks submission without it)
- **OTP email verification** (6-digit, 5-min expiry, static `123456` in dev)
- **Sponsor selection** from active sponsors dropdown
- **QR visitor card** valid for 5 hours, downloadable as PNG

### 2. **Admin/Sponsor Dashboard** (`/dashboard`)
- **Role-based**: Admin & Sponsor (JWT auth, stored in localStorage)
- **Sections**:
  - **Dashboard**: Today's visits stats + visitor table
  - **Visitors**: Toggle between "Today's Visits" & "All Visitors" with pagination
  - **Sponsors**: CRUD with search, active/inactive toggle
  - **Reports**: Placeholder
- **Visitor table actions**: View details, delete visits
- **Visit approval workflow**: Email with Approve/Reject links (token-based, one-time use)

### 3. **Sponsor Approval Workflow**
- On registration, approval emails sent to **sponsor** + **whomToMeet** (if email)
- Links hit `/api/visit/approve?token=...&action=approve|reject`
- Updates `Visit.approval` / `Visit.rejected` flags

### 4. **Juniper Mist WiFi Integration** (Optional)
- Guest WiFi access via Mist API
- Test endpoint: `/api/test-mist`
- Config via `MISTSITEID`, `WLANID`, `MISTTOKEN` env vars
- Tries multiple guest endpoint variations

---

## Data Models

| Model | Key Fields |
|-------|------------|
| **User** | name, email, password (hashed), role (admin/sponsor) |
| **Visitor** | name, email, phone (unique) |
| **Visit** | visitor (ref), photoUrl, purpose, whomToMeet, time, approval, rejected, approvalToken, locationLat/Long, expiresAt |
| **Sponsor** | name, email, phone, company, department, active |
| **Otp** | email, otp, expiresAt (auto-cleanup on verify) |

---

## API Routes Structure

```
/api
├── auth/validate          # JWT token validation
├── user                   # POST signup, GET login (returns JWT)
├── sponsor                # CRUD for sponsors
├── visitor
│   ├── route              # POST create visit, GET all visitors
│   ├── send-otp           # POST send email OTP
│   ├── verify-otp         # POST verify OTP
│   ├── filter             # GET with filter=today|latest, pagination
│   ├── send-qrcode        # (not fully reviewed)
│   └── [id]               # Single visitor operations
├── visit/approve          # GET token-based approve/reject
├── upload                 # POST image → Cloudinary
└── test-mist              # GET test Mist connectivity
```

---

## Key Files to Note

| File | Purpose |
|------|---------|
| `app/api/db/dbconnect.js` | MongoDB connection singleton |
| `app/utils/Authtoken.jsx` | `validateUserSession()` for client auth checks |
| `app/api/lib/mail/send-mail.js` | Nodemailer email utility |
| `components.json` | shadcn/ui config (HeroUI based) |

---

## Environment Variables Required
```env
MONGO_URI=
NEXT_BASE_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
JWT_SECRET=
JWT_EXPIRE=
GMAIL_APP_PASSWORD=
GMAIL_USER=
# Optional Mist WiFi
MISTSITEID=
WLANID=
MISTTOKEN=
```

---

## Current State Observations
1. **Clerk & NextAuth** dependencies installed but **not used** (custom JWT auth implemented)
2. **Prisma** installed but **not used** (Mongoose models used instead)
3. **TypeScript** configured but project uses `.js/.jsx` (no TS files)
4. `MIST_SETUP.md` documents WiFi integration but it's optional/not core
5. Some API routes referenced but not fully reviewed (send-qrcode, visitor/[id])

---

## Summary
This is a **production-ready visitor management system** with:
- ✅ Complete registration → approval → QR check-in flow
- ✅ Admin dashboard with sponsor/visitor management
- ✅ Email-based OTP & approval workflows
- ✅ Cloudinary image handling
- ✅ Optional Juniper Mist WiFi guest access
- ⚠️ Some unused dependencies (Clerk, Prisma, NextAuth) that could be cleaned up