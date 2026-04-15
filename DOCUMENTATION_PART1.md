# GarageOS — Complete Documentation
### Client Manual & User Manual
**Version 1.0 | 2024**

---

# TABLE OF CONTENTS

- [1. Introduction](#1-introduction)
- [2. System Overview](#2-system-overview)
- [3. Installation Guide](#3-installation-guide)
- [4. Client Manual (Owner / Admin)](#4-client-manual)
- [5. User Manual (Staff / Daily Users)](#5-user-manual)

---

# 1. Introduction

## 1.1 Overview

GarageOS is a smart, mobile-first garage management system built for modern automotive service businesses. It runs on both Android and iOS devices and provides a complete digital workflow — from customer check-in and booking, all the way through job card management, estimates, invoicing, and payment collection.

The system is designed to replace paper-based job cards, manual booking registers, and disconnected spreadsheets with a single, unified platform that every member of your garage team can use from their phone.

## 1.2 Purpose

GarageOS solves the core operational challenges of running a garage:

- Losing track of which vehicle is at what stage of repair
- Missing customer follow-ups and appointments
- Disputes over estimates and approvals
- No visibility into daily or monthly revenue
- Mechanics not knowing which jobs are assigned to them
- Receptionists manually managing bookings on paper

The app brings all of this into one place, with each staff role seeing only what they need to do their job.

## 1.3 Target Users

| Role | Who They Are | What They Do in GarageOS |
|---|---|---|
| **Owner** | Garage business owner | Full access — revenue, approvals, all jobs, staff management |
| **Manager** | Operations manager | Assigns mechanics, manages job cards, approves estimates |
| **Mechanic** | Workshop technician | Views assigned jobs, updates work status, logs notes and photos |
| **Receptionist** | Front desk staff | Creates bookings, checks in vehicles, manages customers |

---

# 2. System Overview

## 2.1 Key Features

**Customer & Vehicle Management**
- Add, edit, and search customers by name, phone, or email
- Link multiple vehicles to a single customer
- View full service history per vehicle

**Booking Management**
- 3-step booking wizard: find customer → set details → confirm
- Time slot selection (09:00 to 17:00)
- Service type selection: Service, Repair, Inspection, Other
- Today's schedule view for the receptionist

**Job Card Lifecycle**
- Create job cards from vehicle check-in
- 15-stage status workflow from Created to Delivered
- Role-based status transitions (mechanics can only update their own jobs)
- Inspection logging, work notes, and photo uploads

**Estimates & Approvals**
- Create itemised estimates with parts and labour
- GST calculation included
- Owner/Manager approves, revises, or rejects estimates
- Estimate approval triggers mechanic assignment

**Invoicing & Payments**
- Generate invoices from approved job cards
- Record payments by mode: Cash, UPI, Bank Transfer, Cheque
- Track pending collections and balance due

**Revenue Dashboard (Owner)**
- Today's revenue and monthly revenue KPIs
- Pending payment alerts
- Payment breakdown by mode (Cash, UPI, etc.)
- Job statistics: Total, Completed, In Progress, Pending

**Staff Management (Manager)**
- Add mechanics with name, phone, and specialization
- Assign mechanics to specific job cards
- View mechanic workload

**Notifications**
- In-app notification bell with unread count badge
- Alerts for new assignments, status changes, and approvals

## 2.2 High-Level Workflow

```
Customer Arrives / Calls
        │
        ▼
Receptionist Creates Booking
        │
        ▼
Vehicle Checked In → Job Card Created
        │
        ▼
Inspection Done → Estimate Created
        │
        ▼
Owner/Manager Approves Estimate
        │
        ▼
Manager Assigns Mechanic
        │
        ▼
Mechanic Works → Updates Status
(In Progress → Waiting Parts → Work Completed)
        │
        ▼
QC Check (Passed / Failed)
        │
        ▼
Invoice Generated → Payment Collected
        │
        ▼
Vehicle Delivered ✓
```

## 2.3 Job Card Status Flow

| Status | Meaning |
|---|---|
| Created | Job card opened, vehicle checked in |
| Inspection Done | Vehicle inspected |
| Estimate Created | Cost estimate prepared |
| Estimate Approved | Owner/Manager approved the estimate |
| Assigned | Mechanic assigned to the job |
| In Progress | Mechanic actively working |
| Waiting Parts | Work paused, waiting for spare parts |
| Work Completed | Mechanic finished the work |
| QC Pending | Quality check in progress |
| QC Failed | Quality check failed, back to mechanic |
| QC Passed | Quality check passed |
| Invoiced | Invoice generated |
| Paid | Payment received |
| Delivered | Vehicle handed back to customer |
| Cancelled | Job cancelled |

---

# 3. Installation Guide

## 3.1 Prerequisites

Before setting up GarageOS, ensure the following are installed on your development machine:

| Requirement | Version | Purpose |
|---|---|---|
| Node.js | 18 or higher | JavaScript runtime |
| npm | 9 or higher | Package manager |
| Expo CLI | Latest | Mobile app tooling |
| Android Studio | Latest | Android emulator / SDK |
| Xcode | 14+ (macOS only) | iOS simulator |
| Git | Any | Clone the repository |

**Install Expo CLI globally:**
```bash
npm install -g expo-cli
```

## 3.2 Mobile App Setup

### Step 1 — Install dependencies

```bash
cd GarageOS/mobile
npm install
```

### Step 2 — Start the development server

```bash
npm start
```

This opens the Expo Developer Tools in your browser. You will see a QR code.

### Step 3 — Run on a device or emulator

**Android Emulator:**
```bash
npm run android
```
Requires Android Studio with an AVD (Android Virtual Device) configured.

**iOS Simulator (macOS only):**
```bash
npm run ios
```
Requires Xcode installed with a simulator.

**Physical Device:**
1. Install the **Expo Go** app from the App Store or Google Play
2. Scan the QR code shown in the terminal or browser
3. The app loads instantly on your device

## 3.3 Backend Setup

```bash
cd GarageOS/backend
npm install

# Copy and configure environment variables
cp .env .env.local
# Edit .env with your PostgreSQL database credentials

# Run database migrations
npx prisma migrate dev --name init
npx prisma generate

# Start the API server
npm run dev
# API runs at http://localhost:3000/api/v1
```

## 3.4 Admin Panel Setup

```bash
cd GarageOS/admin
npm install
npm run dev
# Admin panel opens at http://localhost:5173
```

## 3.5 Demo / Development Mode

The mobile app ships with built-in demo data so you can use it immediately without a backend.

In `mobile/src/config/env.ts`, the flag `USE_DUMMY_DATA` is set to `true` by default. When enabled:
- Login works with the demo credentials below
- All data (customers, vehicles, job cards, bookings) is pre-loaded
- No backend or database is required

**Demo Login Credentials:**

| Role | Mobile | Password |
|---|---|---|
| Owner | 9876543210 | owner@123 |
| Manager | 9876543211 | manager@123 |
| Mechanic | 9876543212 | mechanic@123 |
| Receptionist | 9876543213 | reception@123 |

> To switch to a real backend, set `USE_DUMMY_DATA = false` in `env.ts` and ensure the backend is running.

## 3.6 Environment Variables (Backend)

Create a `.env` file in the `backend/` folder with the following:

```
DATABASE_URL=postgresql://user:password@localhost:5432/garageos
JWT_SECRET=your-secret-key-here
PORT=3000
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-key
R2_SECRET_ACCESS_KEY=your-r2-secret
R2_BUCKET_NAME=garageos-media
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

---

# 4. Client Manual

> This section is for the **Garage Owner** and **Manager** — the people responsible for running the business and overseeing all operations.

---

## 4.1 Login Process

1. Open the GarageOS app on your phone.
2. You will see the **Sign In** screen with the GarageOS logo.
3. Enter your **Mobile Number** (10 digits) in the first field.
4. Enter your **Password** in the second field.
5. Tap **Sign In**.
6. The app automatically takes you to your role-specific dashboard.

**What each field does:**
- **Mobile Number** — This is your unique login identifier. It is the mobile number registered with your account.
- **Password** — Your account password set by the system administrator.

**Forgot Password:**
- Tap **Forgot Password?** below the Sign In button.
- Follow the on-screen instructions to reset your password.

**Expected outcome:** After successful login, the Owner sees the Owner Dashboard. The Manager sees the Manager Dashboard.

---

## 4.2 Owner Dashboard

The Owner Dashboard is the command centre for the business. It loads automatically after login.

**Header:**
- Shows a personalised greeting (Good morning / afternoon / evening) with your name
- Displays the garage name and today's date
- Bell icon (top right) — tap to view notifications. A red badge shows unread count.
- Hamburger menu (top left) — tap to open the side navigation drawer

**KPI Cards (6 tiles):**

| Tile | What It Shows |
|---|---|
| Revenue Today | Total invoiced amount for today |
| This Month | Total revenue for the current calendar month |
| Active Jobs | Number of jobs currently In Progress or Waiting Parts |
| Pending Payment | Total outstanding balance across all unpaid invoices |
| Bookings Today | Number of bookings scheduled for today |
| Needs Approval | Number of estimates waiting for your approval |

**Needs Approval section:**
- Lists job cards where an estimate has been created and is waiting for your review
- Tap any card to open the full Job Card Detail and approve or reject the estimate
- Tap **See all** to go to the full Approvals screen

**Active & Overdue Jobs section:**
- Shows jobs currently in progress
- Tap any job card to view full details

**Pending Payments section:**
- Lists invoices with an outstanding balance
- Shows invoice number, job number, and amount due
- Tap any row to go directly to the Payment screen

**Pull down to refresh** the dashboard at any time.

---

## 4.3 Manager Dashboard

The Manager Dashboard focuses on operational control.

**Header:**
- Shows "Manager View" label with your name
- Plus (+) button (top right) — tap to create a new service / job card directly
- Hamburger menu (top left) — opens the side navigation drawer

**KPI Cards:**

| Tile | What It Shows |
|---|---|
| Active | Jobs currently In Progress |
| Unassigned | Jobs with no mechanic assigned |
| Waiting Parts | Jobs paused waiting for parts |
| Completed | Jobs that have been delivered |

**Needs Assignment section:**
- Highlighted in red — these are jobs with no mechanic assigned
- Tap **Assign** on any card to go directly to the Assign Mechanic screen
- Tap **See all** to view the full jobs list

**Active Jobs section:**
- Lists all in-progress jobs
- Tap any job to open Job Card Detail

---

## 4.4 Customer Management

Access via: Hamburger menu → **Customers**

### 4.4.1 View Customer List

- The screen shows all customers with their name, phone number, email, and city
- A search bar at the top lets you filter by name, phone, or email in real time

### 4.4.2 Add a New Customer

1. Tap the blue **+** button (top right of the Customers screen)
2. Fill in the form:
   - **Full Name** *(required)* — Customer's full name
   - **Mobile Number** *(required)* — 10-digit mobile number
   - **Email** *(optional)* — Customer's email address
   - **Address** *(optional)* — Street and area
   - **City** *(optional)* — City name
3. Tap **Add Customer**

**Expected outcome:** Customer is added and you are returned to the customer list.

### 4.4.3 Edit a Customer

1. Find the customer in the list
2. Tap the **pencil (edit) icon** on the right side of their card
3. Update the required fields
4. Tap **Save**

### 4.4.4 Delete a Customer

1. Find the customer in the list
2. Tap the **trash (delete) icon** on the right side of their card
3. A confirmation dialog appears: "Delete [Name]? This cannot be undone."
4. Tap **Delete** to confirm

> Warning: Deleting a customer is permanent and cannot be reversed.

### 4.4.5 View Customer Details

- Tap anywhere on a customer card (not the edit/delete icons) to open their detail page
- The detail page shows their full profile and linked vehicles

---

## 4.5 Vehicle Management

Vehicles are linked to customers. You can add a vehicle from two places:
- From the **New Service** screen when a vehicle is not found
- From the **Add Vehicle** screen directly

### Add a Vehicle

1. Navigate to **New Service** (Hamburger → Jobs → + button, or Manager Dashboard → + button)
2. On Step 1, search by registration number
3. If the vehicle is not found, tap **"Vehicle not found — Add new vehicle"**
4. Fill in the vehicle details: registration number, make, model, year, current KMs
5. Link it to an existing customer
6. Tap **Save**

---

## 4.6 Booking Management

Access via: Hamburger menu → **Bookings**

Bookings represent scheduled appointments before a vehicle physically arrives.

### Create a New Booking (3-step wizard)

**Step 1 — Find Customer:**
1. Type at least 2 characters in the search box
2. Matching customers appear below — tap to select one
3. If the customer is not found, tap **"Add new customer"**
4. Tap **Next**

**Step 2 — Booking Details:**
1. Select **Service Type**: Service / Repair / Inspection / Other
2. Select a **Time Slot** from the available grid (09:00 to 17:00)
3. Optionally select a **Vehicle** from the customer's registered vehicles
4. Add any **Notes** or special instructions
5. Tap **Review**

**Step 3 — Confirm:**
1. Review all details: customer, date, time, service type, vehicle, notes
2. Tap **Confirm Booking**

**Expected outcome:** Booking is created with "Confirmed" status and appears in the Receptionist's today's schedule.

### Booking Statuses

| Status | Meaning |
|---|---|
| Pending | Booking created, not yet confirmed |
| Confirmed | Appointment confirmed |
| Arrived | Customer has arrived at the garage |
| Cancelled | Booking was cancelled |
| No Show | Customer did not arrive |

---

## 4.7 Job Card Lifecycle

Job cards are the core of GarageOS. Every vehicle that comes in for service gets a job card.

### 4.7.1 Create a Job Card (New Service)

Access via: Manager Dashboard → **+** button, or Hamburger → **Jobs** → **New Service**

**Step 1 — Find Vehicle:**
1. Type the last 4 digits of the registration number (e.g., "1234")
2. Matching vehicles appear — tap to select
3. If not found, tap **"Add new vehicle"**
4. Tap **Next: Work Type**

**Step 2 — Work Type:**
1. Select work type:
   - **Service** — Routine maintenance and oil change
   - **Repair** — Fix specific issues or damage
   - **Service + Repair** — Full service with repairs
2. Enter **Current KMs** (odometer reading)
3. Add a **Description** of the work needed (optional)
4. Tap **Review**

**Step 3 — Confirm:**
1. Review all details
2. Tap **Create Job Card**

**Expected outcome:** Job card is created with status "Created" and a unique job number (e.g., JC-0042).

### 4.7.2 View and Update a Job Card

1. Go to **Jobs** from the hamburger menu
2. Use the search bar to find by customer name or registration plate
3. Use the filter chips to narrow by status: All / Created / In Progress / Waiting Parts / QC / Delivered
4. Tap any job card to open **Job Card Detail**

**Job Card Detail screen shows:**
- Vehicle name, registration plate, and current status badge
- Customer name and masked mobile number
- Assigned mechanic (if any)
- Check-in date, odometer reading, work type
- Work description
- Inspection records
- Action buttons: Estimate, Invoice, Payment (role-dependent)

### 4.7.3 Assign a Mechanic (Manager)

1. Open a job card
2. In the **Mechanic Assignment** section, tap **Assign** (or **Reassign**)
3. The Assign Mechanic screen shows available mechanics
4. Tap a mechanic to assign them
5. Job card status moves to "Assigned"

### 4.7.4 Approve an Estimate (Owner / Manager)

Access via: Owner Dashboard → **Needs Approval** section, or Hamburger → **Approvals**

1. The Approvals screen lists all estimates with status "Draft" or "Sent"
2. Each card shows: job number, vehicle, itemised list, subtotal, GST, and total
3. Three action buttons at the bottom of each card:
   - **Reject** — Rejects the estimate (removes it from the list)
   - **Revise** — Opens the Estimate screen to edit the items
   - **Approve** — Approves the estimate; work can now proceed
4. Tap **Approve** and confirm in the dialog

**Expected outcome:** Estimate status changes to "Approved". The job card can now be assigned to a mechanic.

---

## 4.8 Staff / Mechanic Management (Manager)

Access via: Hamburger menu → **Mechanics**

### View Mechanic List
- Shows all mechanics with their name, phone, and specialization
- Displays current job assignment status

### Add a New Mechanic

1. Tap the **+** button on the Mechanics screen
2. Fill in:
   - **Full Name** *(required)*
   - **Phone Number** *(required, 10 digits)*
   - **Specialization** *(optional)* — e.g., Engine, Electrical, AC Repair
3. Tap **Add Mechanic**

**Expected outcome:** Mechanic is added to the list and can be assigned to job cards.

---

## 4.9 Revenue & Analytics (Owner)

Access via: Hamburger menu → **Revenue**

The Revenue screen gives the owner a financial overview of the business.

**Period Filter:**
- Toggle between **Today**, **This Week**, and **This Month**

**Total Revenue card:**
- Large display of total collected revenue for the selected period
- Trend indicator (e.g., +12% vs last month)

**Pending Collections:**
- Shows total outstanding balance across all unpaid invoices
- Highlighted in red when there are pending amounts

**Payment Breakdown:**
- Bar chart showing revenue split by payment mode: Cash, UPI, Bank Transfer, Cheque

**Job Statistics:**
- Total Jobs, Completed, In Progress, Pending — displayed as a 2×2 grid

---

## 4.10 Profile & Settings

Access via: Hamburger menu → **Profile**

The Profile screen shows:
- Your name, mobile number, email, and role badge
- Garage name and subscription plan
- Quick access links to Jobs, Customers, Notifications, Revenue, Approvals, Mechanics
- Your permission badges (what you can and cannot do)
- **Sign Out** button at the bottom

### Sign Out
1. Tap **Sign Out** (red button at the bottom of Profile)
2. Confirm in the dialog: "Are you sure you want to sign out?"
3. Tap **Sign Out** to confirm

---

# 5. User Manual

> This section is for **daily staff users** — Mechanics and Receptionists. Instructions are written in simple, plain language.

---

## 5.1 How to Log In

1. Open the **GarageOS** app on your phone.
2. Type your **mobile number** in the first box.
3. Type your **password** in the second box.
4. Tap the **Sign In** button.
5. The app will open your personal dashboard automatically.

If you see an error message, check:
- You typed the correct mobile number (no spaces)
- Your password is correct (passwords are case-sensitive)
- Tap **Forgot Password?** if you need to reset it

---

## 5.2 Receptionist — How to Create a Booking

A booking is made when a customer calls ahead to schedule an appointment.

1. From your dashboard, tap **New Booking** (quick action button)
   — OR — tap the hamburger menu (☰) and go to **Bookings**, then tap **+**
2. **Step 1 — Find the customer:**
   - Type the customer's name or mobile number (at least 2 characters)
   - Tap their name when it appears
   - If they are a new customer, tap **"Add new customer"** and fill in their details
   - Tap **Next**
3. **Step 2 — Set the details:**
   - Choose the service type (Service / Repair / Inspection / Other)
   - Tap a time slot (e.g., 10:00)
   - Select their vehicle if it appears (optional)
   - Add any notes from the customer
   - Tap **Review**
4. **Step 3 — Confirm:**
   - Check all the details are correct
   - Tap **Confirm Booking**
5. Done! The booking appears in today's schedule.

---

## 5.3 Receptionist — How to Check In a Vehicle (New Service)

When a customer arrives at the garage, create a job card to start tracking their vehicle.

1. From your dashboard, tap **New Service** (quick action button)
2. **Step 1 — Find the vehicle:**
   - Type the last 4 digits of the number plate (e.g., "1234")
   - Tap the vehicle when it appears
   - If the vehicle is not found, tap **"Add new vehicle"**
   - Tap **Next: Work Type**
3. **Step 2 — Work type:**
   - Select: Service, Repair, or Service + Repair
   - Enter the current odometer reading (KMs)
   - Add a description of the problem (optional)
   - Tap **Review**
4. **Step 3 — Confirm:**
   - Check all details
   - Tap **Create Job Card**
5. A job card is created. The manager will be notified.

---

## 5.4 Receptionist — How to Search for a Customer or Vehicle

**Search customers:**
1. Tap the hamburger menu (☰) → **Customers**
2. Type the customer's name, phone number, or email in the search bar
3. Results update as you type
4. Tap a customer to view their full profile and vehicle history

**Search vehicles (via New Service):**
1. Tap **New Service**
2. Type the registration number in the search box
3. The vehicle and its owner appear in the results

---

## 5.5 Mechanic — How to View Your Assigned Jobs

When you log in, your dashboard shows only the jobs assigned to you.

**Dashboard KPI tiles:**
- **In Progress** — Jobs you are currently working on
- **Waiting Parts** — Jobs paused for parts
- **Completed** — Jobs you have finished
- **Total Assigned** — All jobs ever assigned to you

**My Active Jobs list:**
- Shows all jobs with status: Assigned, In Progress, Waiting Parts
- Tap any job to open the **Job Work** screen

---

## 5.6 Mechanic — How to Update Job Status

1. From your dashboard, tap a job card in the **My Active Jobs** list
2. The **Job Work** screen opens, showing:
   - Job number and work type
   - Vehicle details (make, model, registration, KMs)
   - Customer name and masked phone number
   - Work description
3. In the **Update Status** section, tap the appropriate button:
   - **Start Work** — Changes status to In Progress
   - **Mark Waiting Parts** — Pauses the job (waiting for spare parts)
   - **Resume Work** — Resumes from Waiting Parts back to In Progress
   - **Mark Work Complete** — Marks the job as Work Completed (triggers QC)
4. A confirmation dialog appears — tap **Confirm** to update

**Expected outcome:** The job status updates immediately. The manager can see the change on their dashboard.

---

## 5.7 Mechanic — How to Add Work Notes

1. Open a job from your dashboard
2. Scroll down to the **Work Notes** section
3. Type your notes in the text box (e.g., "Replaced brake pads, checked fluid levels")
4. Tap **Save Notes**

Notes are visible to the manager and owner.

---

## 5.8 Mechanic — How to Add Photos

1. Open a job from your dashboard
2. Scroll down to the **Photos** section
3. Tap **Camera** to take a new photo, or **Gallery** to upload from your phone
4. Photos are saved to the job card automatically

---

## 5.9 How to View Notifications

1. Tap the **bell icon** (top right of your dashboard)
2. The Notifications screen shows all recent alerts
3. A red badge on the bell shows how many unread notifications you have

Notifications include: new job assignments, status changes, estimate approvals, and payment confirmations.

---

*— End of Part 1 (Sections 1–5) —*
*Continue in DOCUMENTATION_PART2.md for Sections 6–10*
