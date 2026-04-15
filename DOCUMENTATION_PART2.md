# GarageOS — Complete Documentation (Part 2)
### Sections 6–10
**Version 1.0 | 2024**

---

# 6. UI Explanation

## 6.1 Screen-by-Screen Reference

### Login Screen
The first screen you see when opening the app. Contains the GarageOS logo, a mobile number field, a password field, a Sign In button, and a Forgot Password link. In development mode, a collapsible demo credentials table is shown at the bottom.

### Owner Dashboard
The main screen for the garage owner. Displays 6 KPI tiles (Revenue Today, This Month, Active Jobs, Pending Payment, Bookings Today, Needs Approval), a "Needs Approval" list of pending estimates, an "Active & Overdue Jobs" list, and a "Pending Payments" list. Pull down to refresh all data.

### Manager Dashboard
The main screen for the manager. Displays 4 KPI tiles (Active, Unassigned, Waiting Parts, Completed), a highlighted "Needs Assignment" section for unassigned jobs, and an "Active Jobs" list. The + button in the top right creates a new service directly.

### Mechanic Dashboard
The main screen for mechanics. Displays 4 KPI tiles (In Progress, Waiting Parts, Completed, Total Assigned), a "My Active Jobs" list showing only jobs assigned to this mechanic, and a collapsed "Completed" summary row.

### Receptionist Dashboard
The main screen for front desk staff. Displays 4 KPI tiles (Today's Bookings, Arrived, Pending, No Vehicle), 3 Quick Action buttons (New Booking, New Service, Find Customer), and a "Today's Schedule" list of all bookings for the day with time, customer name, vehicle, service type, and status pill.

### Customer List Screen
A searchable list of all customers. Each card shows the customer's avatar (initials), name, phone, email, and city. Edit (pencil) and Delete (trash) icons on the right. A + button at the top right adds a new customer.

### Customer Detail Screen
Shows the full profile of a single customer including all linked vehicles and service history.

### Add Customer Screen
A form with fields: Full Name (required), Mobile Number (required), Email, Address, City. Cancel and Add Customer buttons at the bottom.

### Edit Customer Screen (Customer Form)
Same layout as Add Customer, pre-filled with existing data. Save button updates the record.

### New Booking Screen (3 steps)
- Step 1: Search and select a customer
- Step 2: Choose service type, time slot, vehicle, and notes
- Step 3: Review summary and confirm

### New Service Screen (3 steps)
- Step 1: Search vehicle by registration number
- Step 2: Select work type (Service / Repair / Both), enter KMs, add description
- Step 3: Review and create job card

### Jobs Screen (Manager Jobs)
A filterable, searchable list of all job cards. Filter chips at the top: All, Created, In Progress, Waiting Parts, QC, Delivered. Search bar filters by customer name or registration plate.

### Job Card Detail Screen
Full detail view of a single job card. Shows vehicle info, customer info, mechanic assignment, status badge, description, inspection count, and action buttons (Estimate, Invoice, Payment) based on the user's role.

### Job Work Screen (Mechanic)
The mechanic's working view of a job. Shows job number, vehicle details, customer info, work description, status update buttons, work notes text box, photo upload section, and an Add Inspection button.

### Assign Mechanic Screen
A list of available mechanics. Tap a mechanic to assign them to the current job card.

### Add Mechanic Screen
A form with fields: Full Name (required), Phone Number (required), Specialization (optional). Add Mechanic button at the bottom.

### Estimate Screen
Create or view an itemised estimate for a job card. Add line items (parts and labour), view subtotal, GST, and total. Submit for approval.

### Approvals Screen (Owner)
Lists all estimates with status Draft or Sent. Each card shows job number, vehicle, itemised list, subtotal, GST, total, and three action buttons: Reject, Revise, Approve.

### Invoice Screen
Generate and view an invoice for a completed job card. Shows all line items, totals, and payment status.

### Payment Screen
Record a payment against an invoice. Select payment mode (Cash, UPI, Bank Transfer, Cheque), enter amount, and confirm.

### Revenue Screen (Owner)
Financial overview with period filter (Today / This Week / This Month), total revenue card, pending collections alert, payment breakdown by mode, and job statistics grid.

### Inspection Screen
Log a vehicle inspection against a job card. Add inspection notes and findings.

### Profile Screen
Shows user's name, mobile, email, role badge, garage name, subscription plan, quick navigation links, permission badges, and Sign Out button.

### Notifications Screen
List of all in-app notifications with read/unread state.

### Forgot Password Screen
Enter your registered mobile number to receive a password reset link.

---

## 6.2 Navigation Flow

```
App Launch
    │
    ├── Not Logged In
    │       └── Login Screen
    │               ├── Forgot Password Screen
    │               └── [Successful Login]
    │
    └── Logged In (role-based)
            │
            ├── OWNER → Owner Dashboard
            ├── MANAGER → Manager Dashboard
            ├── MECHANIC → Mechanic Dashboard
            └── RECEPTIONIST → Receptionist Dashboard
                    │
                    └── Side Drawer (Hamburger Menu)
                            ├── Dashboard
                            ├── Jobs
                            ├── Customers
                            ├── Mechanics (Manager/Owner)
                            ├── Bookings
                            ├── Revenue (Owner)
                            ├── Approvals (Owner/Manager)
                            ├── Notifications
                            └── Profile
```

**Detail screens** (opened by tapping a list item, always have a back arrow):
- Job Card Detail → Estimate / Invoice / Payment / Assign Mechanic / Inspection
- Customer Detail → Add Vehicle
- Job Work (Mechanic) → Inspection
- New Booking (3-step wizard)
- New Service (3-step wizard)

---

# 7. Troubleshooting Guide

## 7.1 App Not Opening

| Problem | Likely Cause | Solution |
|---|---|---|
| App shows a blank white screen | JavaScript bundle failed to load | Close and reopen the app. If using Expo Go, shake the device and tap "Reload" |
| App crashes immediately on launch | Corrupted cache | Clear the Expo Go app cache, or run `expo start --clear` in the terminal |
| "Something went wrong" error screen | Unhandled runtime error | Note the error message and contact your system administrator |
| App stuck on splash screen | Slow network or backend not running | Check your internet connection. If using real API, verify the backend server is running |

## 7.2 Login Issues

| Problem | Likely Cause | Solution |
|---|---|---|
| "Invalid credentials" error | Wrong mobile number or password | Double-check the mobile number (no spaces, no country code). Passwords are case-sensitive |
| "Mobile number is required" | Field left empty | Enter your 10-digit mobile number |
| "Password is required" | Field left empty | Enter your password |
| Login button does nothing | App is loading | Wait a moment — the loading spinner will appear. Do not tap multiple times |
| Forgot your password | — | Tap "Forgot Password?" on the login screen and follow the steps |
| Account locked or not found | Account not set up | Contact your garage manager or system administrator to verify your account |

## 7.3 Data Not Loading

| Problem | Likely Cause | Solution |
|---|---|---|
| Dashboard shows zeros or empty lists | Data not fetched yet | Pull down on the screen to refresh |
| Customer list is empty | No customers added yet, or search filter active | Clear the search bar. If genuinely empty, add the first customer |
| Job cards not showing | Filter chip is active | Tap "All" in the filter row to show all jobs |
| Bookings not appearing | Date mismatch | The receptionist dashboard shows today's bookings only. Check if bookings were created for a different date |
| "No results" after searching | Search term too specific | Try a shorter search term (e.g., first name only, or last 4 digits of plate) |

## 7.4 Job Card Issues

| Problem | Likely Cause | Solution |
|---|---|---|
| Cannot update job status | You do not have permission for that transition | Only certain roles can make certain status changes. Mechanics can only update their own assigned jobs |
| Estimate not showing in Approvals | Estimate not yet submitted | Ask the person who created the estimate to submit it for approval |
| Cannot assign a mechanic | No mechanics added to the system | Go to Mechanics screen and add at least one mechanic first |
| Job card not found in search | Wrong search term | Try searching by customer name instead of plate, or vice versa |

## 7.5 Payment & Invoice Issues

| Problem | Likely Cause | Solution |
|---|---|---|
| Invoice button not visible | Your role does not have financial access | Only Owner and Manager can view invoices. Contact your manager |
| Payment not recording | Required fields missing | Ensure payment amount and mode are selected before confirming |
| Balance due still showing after payment | Page not refreshed | Pull down to refresh the dashboard or navigate away and back |

---

# 8. Best Practices

## 8.1 How to Use the App Efficiently

**For Owners:**
- Check the dashboard every morning to review the "Needs Approval" section and clear pending estimates before the workday begins
- Use the Revenue screen's period filter to compare weekly and monthly performance
- Review "Pending Payments" daily and follow up with customers who have outstanding balances
- Keep the mechanic list up to date so managers can assign jobs quickly

**For Managers:**
- Start each day by checking the "Needs Assignment" section on your dashboard — unassigned jobs delay the entire workflow
- Use the Jobs screen filter chips to focus on one status at a time (e.g., filter by "Waiting Parts" to follow up on parts procurement)
- When creating a job card, always enter the current KMs accurately — this is important for service history
- Add a clear description when creating a job card so mechanics know exactly what work is needed

**For Receptionists:**
- Always search for an existing customer before adding a new one — avoid duplicate records
- When a customer calls to book, create the booking immediately rather than writing it down and entering it later
- If a vehicle is not in the system, add it at check-in time with the correct registration number
- Use the Notes field in bookings to capture any special customer requests

**For Mechanics:**
- Update your job status in real time — do not wait until the end of the day
- Use the "Waiting Parts" status as soon as you identify a parts shortage so the manager can act quickly
- Add work notes before marking a job as complete — this helps with QC and customer queries
- Take before and after photos for major repairs

## 8.2 Data Entry Tips

- **Mobile numbers:** Always enter 10 digits without spaces, dashes, or country codes (e.g., 9876543210, not +91-98765-43210)
- **Registration numbers:** Enter in standard format (e.g., KA01AB1234). The system searches by partial match so even the last 4 digits work
- **Customer names:** Use the customer's full name as it appears on their documents to avoid confusion
- **KMs / Odometer:** Always record the current odometer reading at check-in — this is essential for service interval tracking
- **Descriptions:** Be specific. "Engine noise" is less useful than "Knocking sound from engine at idle, started 3 days ago"
- **Estimates:** Break down estimates into individual line items (parts and labour separately) — this makes approvals faster and reduces disputes

---

# 9. FAQ

**Q: Do I need an internet connection to use GarageOS?**
A: In demo/development mode with dummy data, the app works offline. In production mode connected to a real backend, an internet connection is required to sync data.

**Q: Can two people log in with the same account at the same time?**
A: This is not recommended. Each staff member should have their own account to ensure accurate activity tracking and role-based access.

**Q: What happens if I accidentally delete a customer?**
A: Deletion is permanent and cannot be undone from the app. Contact your system administrator if you need to recover deleted data from the database backup.

**Q: Can a mechanic see other mechanics' jobs?**
A: No. Mechanics only see jobs assigned to them. This is enforced by the app's permission system.

**Q: Can a receptionist approve estimates or view revenue?**
A: No. Receptionists can only create bookings and job cards. Financial features (estimates, invoices, payments, revenue) are restricted to Owner and Manager roles.

**Q: How do I change my password?**
A: Tap "Forgot Password?" on the login screen and follow the reset steps. You cannot change your password from within the app once logged in — contact your administrator.

**Q: What does the "No Vehicle" warning on the Receptionist dashboard mean?**
A: It means a booking exists for a customer but no vehicle has been linked to that booking. Tap the booking and add the vehicle before the customer arrives.

**Q: Can I use GarageOS on a tablet?**
A: Yes. The app runs on any Android or iOS device. On larger screens, the layout scales appropriately, though it is optimised for phone-sized screens.

**Q: What is the difference between "Work Completed" and "Delivered"?**
A: "Work Completed" means the mechanic has finished the work. The vehicle then goes through QC (quality check). "Delivered" is the final status — it means the vehicle has passed QC, been invoiced, paid, and physically handed back to the customer.

**Q: How many mechanics can I add to the system?**
A: There is no hard limit on the number of mechanics you can add.

**Q: Can I edit a job card after it has been created?**
A: You can update the status, add notes, add inspections, and manage estimates/invoices at any stage. The core vehicle and customer details are set at creation.

**Q: What does "QC Failed" mean?**
A: Quality Check Failed means the vehicle did not pass the post-repair inspection. The job card goes back to "In Progress" so the mechanic can fix the issue before it is re-checked.

**Q: Is customer data secure?**
A: Yes. Mobile numbers are masked in the mechanic's view (only the last few digits are visible). All data is stored per-company and is not shared between different garages using the system.

---

# 10. Future Scope

The following features are planned or recommended for future versions of GarageOS:

## 10.1 Customer-Facing Features
- **Customer Portal / App** — A separate app for customers to track their vehicle's repair status in real time
- **SMS / WhatsApp Notifications** — Automated messages to customers when their vehicle status changes (e.g., "Your car is ready for pickup")
- **Digital Estimate Approval** — Send estimates to customers via WhatsApp or SMS for remote approval
- **Service Reminders** — Automated reminders for upcoming service intervals based on KMs or date

## 10.2 Operational Features
- **Parts Inventory Management** — Track spare parts stock levels, set reorder alerts, and link parts directly to job cards
- **Multi-Bay / Workshop Layout** — Visual bay assignment showing which vehicle is in which bay
- **Technician Time Tracking** — Log actual time spent per job for labour cost accuracy
- **Digital Vehicle Inspection Checklist** — Standardised inspection forms with photo capture per checkpoint
- **Barcode / QR Code Scanning** — Scan vehicle VIN or parts barcodes for faster data entry

## 10.3 Financial Features
- **GST Reports** — Monthly GST summary reports ready for filing
- **Expense Tracking** — Log garage expenses (rent, utilities, parts procurement) against revenue
- **Profit & Loss Dashboard** — Net profit view after expenses
- **Payment Gateway Integration** — Accept online payments via Razorpay, PayU, or Stripe
- **Recurring Service Contracts** — Manage AMC (Annual Maintenance Contract) customers with scheduled service reminders

## 10.4 Analytics & Reporting
- **Mechanic Performance Reports** — Jobs completed per mechanic, average completion time, customer ratings
- **Vehicle Brand / Model Analytics** — Most common vehicles serviced, most common repair types
- **Customer Retention Reports** — Identify customers who have not returned in 6+ months
- **Export to PDF / Excel** — Export job cards, invoices, and revenue reports

## 10.5 Platform & Integration
- **Web Dashboard** — A browser-based version of the owner/manager dashboard for desktop use
- **Accounting Software Integration** — Sync invoices and payments with Tally, QuickBooks, or Zoho Books
- **Multi-Branch Support** — Manage multiple garage locations under one owner account
- **Offline Mode** — Full offline capability with background sync when connectivity is restored
- **Dark Mode** — System-level dark theme support

---

*— End of Documentation —*

---

**Document Information**

| Field | Value |
|---|---|
| Product | GarageOS |
| Version | 1.0 |
| Platform | React Native (Expo) — Android & iOS |
| Prepared | 2024 |
| Audience | Garage Owners, Managers, Mechanics, Receptionists |

*This documentation covers GarageOS mobile application. For backend API documentation or admin panel documentation, refer to the respective technical guides.*
