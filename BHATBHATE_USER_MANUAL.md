# Bhatbhate Vehicle Rental System — User Manual

**Version 1.0 | Nepal Himalayan Vehicle Rental Platform**

---

## Table of Contents

1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [User Application](#user-application)
   - 3.1 [Home Page](#31-home-page)
   - 3.2 [Registration](#32-registration)
   - 3.3 [Login](#33-login)
   - 3.4 [Password Reset](#34-password-reset)
   - 3.5 [User Dashboard](#35-user-dashboard)
   - 3.6 [Terrain Selection](#36-terrain-selection)
   - 3.7 [Fleet Discovery](#37-fleet-discovery)
   - 3.8 [Vehicle Detail & Booking Panel](#38-vehicle-detail--booking-panel)
   - 3.9 [Inquiry & Booking Application](#39-inquiry--booking-application)
   - 3.10 [My Bookings](#310-my-bookings)
   - 3.11 [Payment via eSewa](#311-payment-via-esewa)
   - 3.12 [User Profile & Two-Factor Authentication](#312-user-profile--two-factor-authentication)
   - 3.13 [Notifications](#313-notifications)
4. [Admin Panel](#admin-panel)
   - 4.1 [Admin Login](#41-admin-login)
   - 4.2 [Dashboard — Fleet Command Center](#42-dashboard--fleet-command-center)
   - 4.3 [Fleet Management](#43-fleet-management)
   - 4.4 [Add New Vehicle](#44-add-new-vehicle)
   - 4.5 [Bookings Management](#45-bookings-management)
   - 4.6 [New Booking (Admin-Created)](#46-new-booking-admin-created)
   - 4.7 [Checks & Logs (Compliance)](#47-checks--logs-compliance)
   - 4.8 [Operations & Logs](#48-operations--logs)
   - 4.9 [Route Settings](#49-route-settings)
   - 4.10 [Admin Profile](#410-admin-profile)
5. [Booking Workflow Summary](#booking-workflow-summary)
6. [Frequently Asked Questions](#frequently-asked-questions)

---

## 1. Introduction

Bhatbhate is a Nepal-focused vehicle rental platform designed for Himalayan and valley travel. It connects customers with a curated fleet of motorcycles, SUVs, jeeps, and pickups suited to Nepal's diverse terrain — from Kathmandu Valley roads to high-altitude mountain passes.

This manual covers both the customer-facing web application and the administration console used by fleet managers.

---

## 2. System Overview

| Component | Purpose |
|-----------|---------|
| User App | Customer registration, terrain selection, vehicle browsing, booking, and payment |
| Admin Panel | Fleet inventory, booking approval, compliance tracking, revenue reporting |
| Payment Gateway | eSewa (Nepal digital wallet) — the sole payment method for customers |
| Authentication | Supabase Auth — supports email/password and Google OAuth |
| 2FA | Time-based One-Time Password (TOTP) via authenticator app |
| Notifications | Real-time in-app alerts via Supabase subscription |

---

## 3. User Application

### 3.1 Home Page

**URL:** `/`

The home page is publicly accessible without logging in. It contains four sections:

**Hero Section**
The hero banner displays the headline "RIDE THE MOUNTAINS" with two action buttons:
- **Explore Fleet** — scrolls down to the Fleet section on the same page
- **View Routes** — scrolls down to the Routes section on the same page

An interactive parallax effect responds to mouse movement across the banner.

**Fleet Section**
Showcases the available vehicle categories with preview cards.

**Routes Section**
Highlights popular Himalayan and valley routes available for rental.

**CTA Section & Footer**
A call-to-action prompt encouraging registration, followed by the site footer.

---

### 3.2 Registration

**URL:** `/auth/register`

New users can create an account using email or Google.

#### 3.2.1 Google Sign-Up (Recommended)
Click **Continue with Google**. The browser redirects to Google's OAuth page. After granting permission, you are automatically registered and logged in.

#### 3.2.2 Email Sign-Up

Fill in the following fields:

| Field | Description |
|-------|-------------|
| Full Name | Your legal name (e.g., John Everest) |
| Email Address | A valid email you can access |
| Phone Number | Nepal format (e.g., +977 9841xxxxxx) |
| Password | Minimum 8 characters, must include uppercase, lowercase, and a number or symbol |
| Road Preference | Choose from: Mountain Roads, Kathmandu Valley, Off-road, or Highways |

Click **Create Account**.

**Outcome A — Email verification required:** You receive a verification email. Click the link in the email before attempting to sign in. The account remains inactive until email is verified.

**Outcome B — Immediate access:** If email confirmation is disabled by the platform, you are taken directly to your dashboard.

---

### 3.3 Login

**URL:** `/auth/login`

#### 3.3.1 Google Login
Click **Continue with Google** to authenticate via your Google account.

#### 3.3.2 Email Login

| Field | Description |
|-------|-------------|
| Email Address | The email used at registration |
| Password | Your account password |

Use the eye icon next to the password field to toggle visibility. Click **Sign In**.

**Forgot Password?** — A link below the password field sends a reset email (see Section 3.4).

**Email not verified:** If your email has not been confirmed, a warning appears. Click **Send verification email** to resend the confirmation link.

#### 3.3.3 Two-Factor Authentication (TOTP)

If you have enrolled a TOTP authenticator app (see Section 3.12), login proceeds in two steps:

1. Enter email and password as normal.
2. A second screen prompts for a **6-digit code** from your authenticator app (e.g., Google Authenticator, Authy).
3. Enter the code and click **Verify**.

Use the **Cancel** button to return to the email/password step.

---

### 3.4 Password Reset

**URL:** `/auth/forgot-password`

1. Click **Forgot Password?** on the login page.
2. Enter your registered email address.
3. Click **Send Reset Link**.
4. The page confirms "Check Your Email" and shows the address the link was sent to.
5. Open the link in the email to set a new password.

---

### 3.5 User Dashboard

**URL:** `/dashboard` *(requires login)*

After logging in, the dashboard greets you with "Hello, [First Name]" and provides four quick-action tiles:

| Tile | Destination | Purpose |
|------|-------------|---------|
| Pick Road Type | `/terrain` | Start the terrain selection flow |
| Browse Fleet | `/vehicles` | See all available vehicles |
| My Bookings | `/bookings` | Track your booking requests |
| Profile | `/profile` | Edit your account details |

The dashboard also shows:
- A **suggestion banner** for recommended next steps
- **Weather Panel** — current weather conditions relevant to your preferred terrain
- **Calendar Panel** — view upcoming booking dates

---

### 3.6 Terrain Selection

**URL:** `/terrain` *(requires login)*

The terrain selection page uses an interactive SVG map of Nepal to help you find vehicles suited to your destination.

#### How to use the map

**Step 1 — Select a Province**
The map displays Nepal's 7 provinces. Click any province to zoom into its districts.

**Step 2 — Select a District**
Districts within the province appear. Each district shows a vehicle hint badge indicating what vehicle types are recommended:

| Badge | Meaning |
|-------|---------|
| 4WD Only | Rough mountain roads — only 4-wheel drive vehicles |
| SUV Recommended | Mixed terrain — SUV preferred |
| Sedan + SUV | Moderate roads — cars and SUVs work |
| Any Vehicle | Good roads — all vehicle types |

**Step 3 — Select a Town or Village**
Click a district to drill down to towns and villages.

#### Next Steps

After selecting your location, two options appear:

- **Get AI Vehicle Recommendation** — Proceeds to `/recommend` where an AI suggests the best vehicles for your selected terrain and dates.
- **Browse All Vehicles** — Goes to `/vehicles` with a terrain filter pre-applied for your selected area.

A **Skip — See All Vehicles** button is also available if you prefer to browse without selecting terrain.

---

### 3.7 Fleet Discovery

**URL:** `/vehicles` *(requires login)*

The vehicles page header reads "FLEET DISCOVERY / Bhatbhate: Choose Your Ride."

#### Filters

| Filter | Options |
|--------|---------|
| Terrain | All Terrain, Ice Peaks, Valley Passes |
| Drive Type | All Wheels, Four Wheeler, Two Wheeler |
| Sort | Price Low to High, Price High to Low |

Vehicle cards display the vehicle photo, name, category, and price per day. Each card includes an **Ask on WhatsApp** button for direct inquiries.

A **mountain weather widget** at the bottom of the page shows current conditions for high-altitude routes.

Click any vehicle card to open the vehicle detail page.

---

### 3.8 Vehicle Detail & Booking Panel

**URL:** `/vehicles/:id` *(requires login)*

The detail page shows a full-width hero image with a "Ready to Book" badge. It contains:

#### Vehicle Information
- Engine displacement, torque, drive type, and passenger capacity
- Key Features displayed as cards
- Height Support altitude chart showing the vehicle's usable altitude range
- Technical specifications table

#### Sticky Booking Panel (right side or bottom)
This panel appears on every vehicle detail page:

| Element | Description |
|---------|-------------|
| Price | Starting from NPR X per day |
| Drive Mode | Toggle between **Self-Drive** and **With Driver** (driver adds NPR 2,000/day) |
| Extra Options | Optional add-ons that can be added to the booking |
| Free cancellation note | "Free cancel up to 48h before trip" |
| BOOK THIS VEHICLE | Button to proceed to `/inquiry/:id` |

---

### 3.9 Inquiry & Booking Application

Booking is a two-page process: Inquiry → Application Form.

#### 3.9.1 Inquiry Page

**URL:** `/inquiry/:id`

Confirm your booking preferences before submitting:

| Field | Description |
|-------|-------------|
| Vehicle summary | Shows the selected vehicle details |
| Drive Type | Self Drive or With Driver |
| Extras / Add-ons | Select any optional extras |
| Message (optional) | Any special notes to the fleet manager |

Click **Send Request** to proceed to the full application form at `/apply/:inquiryId`.

#### 3.9.2 Booking Application Form

**URL:** `/apply/:inquiryId`

A two-step form:

**Step 1 — Dates & Documents**

| Field | Notes |
|-------|-------|
| Full Name | Pre-filled from your profile |
| Phone Number | Pre-filled from your profile |
| Email Address | Pre-filled from your profile |
| Start Date | Pickup date |
| End Date | Return date |
| License Number | Required for Self Drive only |
| Document Upload | Upload driving license + national ID (JPG, PNG, or PDF, max 5 MB each) |

**Step 2 — Trip Questions**

| Field | Notes |
|-------|-------|
| Driving Experience | Select from dropdown (e.g., Beginner, Intermediate, Expert) |
| Group Size | Number of passengers |
| Trip Purpose | Select from dropdown (e.g., Tourism, Work, Adventure) |
| Medical Notes | Any relevant health information |
| Emergency Contact | Name and phone of a contact person |

Submit to send your application. You are redirected to a booking confirmation page at `/booking/confirm/:applicationId`.

Your application status begins as **Submitted** and moves through the approval workflow (see Section 5).

---

### 3.10 My Bookings

**URL:** `/bookings` *(requires login)*

The My Bookings page lists all your booking applications with full status tracking.

#### Status Indicators

| Status | Icon | Meaning |
|--------|------|---------|
| Submitted | Clock | Application received, awaiting admin review |
| Under Review | Alert circle | Admin is reviewing your documents |
| Approved | Checkmark | Admin approved — payment required |
| Rejected | X circle | Application was rejected |
| Confirmed | Checkmark | Booking is confirmed and payment is complete |
| Cancelled | X circle | Booking was cancelled |

#### Available Actions

**Cancel** — Appears for bookings in Submitted or Under Review status. Cancels the request immediately.

**Pay Now** — Appears for bookings in Approved status where payment has not yet been completed. Clicking opens the eSewa payment page for that booking.

**Paid badge (✓ Paid)** — Shown when payment is confirmed as completed.

Each card shows: vehicle photo, vehicle name, drive type, start and end dates, and total price in NPR.

If you have no bookings yet, a prompt with a "Pick Road Type" button encourages you to start a new booking.

---

### 3.11 Payment via eSewa

**URL:** `/payment/:applicationId` *(requires login, booking must be Approved)*

Payment is only available after admin approval of your booking application.

The payment page shows:
- Booking summary card: vehicle image, vehicle name, drive type, dates, total price in NPR
- **Pay with eSewa** button — submits your payment through eSewa's secure gateway
- Security note explaining the transaction is handled by eSewa

After clicking **Pay with eSewa**, you are redirected to the eSewa payment gateway. Complete the payment there using your eSewa wallet or linked bank account.

**If payment is cancelled on eSewa's side**, you are returned with a `?failed=true` query in the URL, and a failure message is displayed. You can retry the payment.

**On successful payment**, the booking status updates to **Confirmed** and a "Payment Successful" notification is sent.

**Note:** eSewa is the only supported payment method for online bookings. Cash and other methods are not available through the user application.

---

### 3.12 User Profile & Two-Factor Authentication

**URL:** `/profile` *(requires login)*

#### Editable Profile Fields

| Field | Description |
|-------|-------------|
| Full Name | Your display name |
| Phone Number | Contact number |
| Road Preference | Mountain Roads, Kathmandu Valley, Off-road, or Highways |
| Profile Photo | Upload a photo (used across the platform) |

Click **Save Changes** to update.

#### Two-Factor Authentication (TOTP)

**Enrolling 2FA:**
1. Open the Profile page and find the Two-Factor Authentication section.
2. A QR code is displayed. Scan it with an authenticator app (Google Authenticator, Authy, Microsoft Authenticator, or similar).
3. The authenticator app generates a 6-digit time-based code.
4. Enter the 6-digit code into the verification field on the profile page.
5. Click **Verify** to complete enrollment.

From the next login, you will be required to enter a code from your authenticator app after entering your password.

**Unenrolling 2FA:**
An **Unenroll** button appears next to any enrolled TOTP factor. Clicking it removes the 2FA requirement from your account.

---

### 3.13 Notifications

The notification bell icon appears in the top navigation bar when you are logged in. A red badge shows the count of unread notifications (displayed as "9+" when count exceeds 9).

Clicking the bell opens a dropdown panel listing all notifications with type-specific icons:

| Notification Type | Icon | Color |
|------------------|------|-------|
| Booking Approved | Checkmark circle | Green |
| Booking Rejected | X circle | Red |
| Payment Successful | Credit card | Green |
| Payment Failed | Credit card | Red |
| General | Bell | Default |

**Mark all read** — button at the top of the panel clears all unread indicators.

**Clicking a notification:**
- Booking approved notifications → navigate to `/payment/:id` (payment page)
- All other notifications → navigate to `/booking/confirm/:id` (booking detail)

Notifications are delivered in real time via Supabase subscriptions — no page refresh required.

---

## 4. Admin Panel

The admin panel is a separate application for fleet managers. It uses a sidebar-based single-page layout where navigation switches views without changing the browser URL.

**Access:** Navigate to the admin application URL (separate from the user app).

---

### 4.1 Admin Login

**Page:** Admin Login

Fields:
- **Email** — administrator account email
- **Password** — administrator password

Click **Sign In** to access the management console.

The page title reads "Admin Panel / Bhatbhate Management Console."

---

### 4.2 Dashboard — Fleet Command Center

**Sidebar item:** Dashboard (grid icon)

The dashboard provides a live overview of the fleet and operations.

#### Fleet Status Banner
Three summary metrics at the top:
- **Active Trips** — number of bookings currently in progress
- **Available Units** — vehicles currently available for rental
- **Completed Returns** — vehicles returned and processed

#### Vehicle Theme Tiles
Three clickable tiles (Bikes, Cars, Jeeps) show:
- Available count / total count
- Progress bar indicating deployment ratio

Clicking a tile filters the bookings stream panel below to show only that vehicle category.

#### Bookings Stream Panel
Displays upcoming and past bookings:
- **Upcoming** — bookings with ACTIVE or PARTIAL status
- **Past** — COMPLETED or OVERDUE bookings

An **Open Full Bookings** button navigates to the full bookings management view.

**Edit Booking Modal** — clicking a booking opens a modal where you can:
- Set status to Confirmed, Active, Completed, or Cancelled
- Delete the booking record
- Resend a confirmation email to the customer

#### Stats Cards
- **Fleet Deployment %** — percentage of fleet currently rented
- **Availability Ratio** — available vehicles vs. total fleet

#### Panels
- **Calendar Panel** — shows upcoming booking dates
- **Weather Panel** — current mountain weather conditions
- **Tracking Chart** — visual chart of booking and fleet activity

---

### 4.3 Fleet Management

**Sidebar item:** Fleet (document icon)

**Page header:** "Fleet Overview / Live inventory from Supabase"

#### Summary Stats
Three cards at the top:
- **Total Fleet** — all vehicles in the database
- **Available** (green) — vehicles marked as available
- **Unavailable** (red) — vehicles marked as unavailable

#### Vehicle Inventory Table

Columns: vehicle thumbnail, name and subtitle, category, price per day, availability badge.

**Per-row actions:**

| Action | Description |
|--------|-------------|
| Edit | Opens an inline edit form (see below) |
| Toggle Availability | Switches the vehicle between available and unavailable |
| Delete | Removes the vehicle from the fleet permanently |

#### Inline Edit Form

When editing a vehicle, the following fields are shown inline in the table row:

| Field | Notes |
|-------|-------|
| Make | Vehicle manufacturer |
| Model | Model name |
| Year | Manufacturing year |
| Subtitle | Short description (e.g., "Himalayan Expedition Ready") |
| Category | bike, suv, jeep, pickup, or car |
| Engine | Engine specification (e.g., 400cc) |
| Daily Rental (NPR) | Price per day in Nepali Rupees |
| Mark as available | Checkbox to toggle availability |
| Bluebook Expiry | Date of vehicle registration expiry |
| Insurance Expiry | Date of insurance expiry |
| Vehicle Image | Upload a new image or enter an image URL |
| Notes | Internal admin notes |

Click **Save** to apply changes or **Cancel** to discard.

---

### 4.4 Add New Vehicle

**Sidebar footer:** "+ Add New Vehicle" button  
**Page header:** "Add Vehicle / Connected to Supabase"

The add vehicle form is split into sections with a live preview panel on the right:

#### Vehicle Information
- Make (manufacturer)
- Model
- Year
- Subtitle (with datalist suggestions for common subtitles)

#### Vehicle Image
Upload an image file for the vehicle.

#### Category
Choose one of: Motorbike, SUV, Jeep, Pickup, Car.

#### Additional Details
- Engine specification
- Daily Rental in NPR
- Bluebook Expiry date
- Insurance Expiry date
- Notes (internal)

The **Live Preview panel** on the right updates in real time as you fill in the form, showing how the vehicle card will appear in the fleet.

Click **Add Vehicle** to save to the database. The page then returns to the fleet view.

---

### 4.5 Bookings Management

**Sidebar item:** Bookings (calendar icon)  
**Page header:** "Bookings / Manage requests and confirmed bookings"

This page shows a unified table of both booking applications (from the user flow) and confirmed bookings.

#### Table Columns

| Column | Description |
|--------|-------------|
| Booking ID | Unique identifier |
| Customer | Name, phone, and email |
| Vehicle | Vehicle name |
| Dates | Start and end dates |
| Price | Total price in NPR |
| Status | Current booking status |
| Actions | Context-sensitive action buttons |

#### Record Types

Records are visually distinguished by badge:
- **REQUEST** (yellow badge) — booking applications submitted by users, awaiting approval
- **BOOKING** (orange badge) — confirmed bookings already in the system

#### Search & Filter

- **Search bar** — filters by booking ID, customer name, phone, email, or vehicle name
- **Status filter dropdown** — filter by: all, submitted, under-review, approved, rejected, pending, confirmed, active, completed, cancelled

#### Actions for REQUEST Records (Applications)

| Button | Action |
|--------|--------|
| Approve | Creates a booking record, sends an approval email to the customer, and sends an in-app notification (type: booking_approved) |
| Reject | Sends an in-app notification to the customer (type: booking_rejected) |

#### Actions for BOOKING Records

| Button | Action |
|--------|--------|
| Confirm / Activate | Toggles the booking to Confirmed or Active status |
| Resend Email | Resends the confirmation email (only for confirmed bookings) |
| Cancel | Cancels the booking |
| Delete | Permanently removes the booking record |

#### Quick Add (Inline Form)

A "Quick Add" form at the bottom of the page allows creating a booking directly without going through the user application flow:

| Field | Description |
|-------|-------------|
| Customer Name | Renter's full name |
| Phone | Contact number |
| Email | Email address |
| Vehicle | Select from dropdown of available vehicles |
| Start Date | Pickup date |
| End Date | Return date |
| Total Price | Manual price entry in NPR |

Submitting creates a booking record with status **Confirmed** and automatically sends a confirmation email to the provided address.

For a full booking creation form with more options, use **+ New Booking** in the sidebar (see Section 4.6).

---

### 4.6 New Booking (Admin-Created)

**Sidebar item (or header button):** "+ New Booking"  
**Page header:** "New Booking / Booking Form"

This full-featured form allows admins to create a detailed booking on behalf of a customer. A checklist panel on the right tracks completion of each section, and a pricing preview updates live.

#### Section 1 — Booking Type
Select **Self-Drive** or **With Driver**.

#### Section 2 — Customer Information

| Field | Notes |
|-------|-------|
| Full Name | Customer's name |
| Phone Number | Contact number |
| Email Address | Used to send confirmation email |
| Nationality | e.g., Nepali, Indian, etc. |
| License Number | Shown for Self-Drive bookings |
| Preferred Driver | Dropdown selection for With Driver bookings (Karma Sherpa, Raj Thapa, Tenzing Lama, or blank) |

#### Section 3 — Vehicle Selection
All vehicles in the fleet are listed. Click a vehicle to select it. Price per day is shown for each.

#### Section 4 — Trip Details

| Field | Description |
|-------|-------------|
| Pickup Date | Start date |
| Return Date | End date |
| Pickup Location | e.g., Pokhara Lakeside Hub |
| Drop-off Location | e.g., Kathmandu Thamel Office |
| Route | Choose from: Annapurna Circuit, Upper Mustang, Manang Valley, Everest Base Camp Route, or Custom Route |

#### Section 5 — Add-Ons & Extras

Optional add-ons (prices in NPR):

| Add-On | Price |
|--------|-------|
| Off-Road Pack | 3,500 |
| Extra Helmet | 500 |
| GPS Navigation | 1,200 |
| Full Insurance | 4,000 |
| Camping Gear | 5,500 |
| Premium Luggage | 2,000 |

#### Section 6 — Payment & Notes

| Field | Description |
|-------|-------------|
| Payment Method | Cash on Pickup, Bank Transfer, eSewa, Khalti, or Credit/Debit Card |
| Deposit Amount (NPR) | Deposit collected at pickup |
| Notes | Any special requests or internal notes |

Click **Confirm Booking** to save. The booking is created with **Confirmed** status and a confirmation email is sent if an email address was provided. The page then navigates back to the bookings view.

---

### 4.7 Checks & Logs (Compliance)

**Sidebar item:** Checks (checkmark icon)  
**Page header:** "Checks & Logs / Waiting: N requests" (N = pending applications)

This page has three tabs:

#### Tab 1 — Application Checks

Reviews incoming booking applications with document verification.

**Table columns:**

| Column | Description |
|--------|-------------|
| Request ID | Application identifier |
| Customer | Name and drive type (Self Drive / With Driver) |
| Vehicle | Requested vehicle |
| Documents | **ID** button and **License** button — click to open uploaded documents in a new browser tab (signed Supabase storage URL) |
| Status | Current application status badge |
| Actions | Approve or Reject buttons |

Use the document buttons to verify the uploaded ID and driving license before making an approval decision.

#### Tab 2 — Payment Tracking

**Summary stat cards:**

| Card | Description |
|------|-------------|
| Total Revenue (NPR) | Cumulative revenue from completed payments |
| Pending (NPR) | Revenue from approved but unpaid bookings |
| eSewa Payments | Count of completed eSewa transactions |
| Failed | Count of failed or cancelled payment attempts |

**Payment table columns:** Application ID, Customer name, Vehicle, Amount in NPR, Payment method, Payment status, Transaction ID (truncated for display).

#### Tab 3 — Sales Statistics

**Period summary cards** (Today, This Week, This Month, All Time):
- Total revenue for the period
- Number of transactions

**Growth indicator:** Week-over-week percentage change with up/down arrow.

**Revenue chart:** A stock-style SVG area chart. Toggle between 1D (hourly), 1W (daily), and 1M (daily) periods. The chart is horizontally scrollable.

**Top Vehicles by Revenue:** A ranked list of the most revenue-generating vehicles, each with a progress bar showing relative contribution.

**Sales Summary table:** Columns — Period, Transactions, Revenue (NPR), Average per Sale (NPR).

---

### 4.8 Operations & Logs

**Sidebar item:** Operations (cog icon)  
**Page header:** "Operations & Logs"

This page provides operational monitoring and quick reporting tools.

#### Live Vehicle Feed (Telemetry)
Displays the top 3 available vehicles with simulated telemetry data:
- Vehicle name and code
- Current route
- Altitude reading
- Engine temperature
- Battery level (colour-coded: green = good, yellow = low)

An **ACTIVE** badge shows the count of currently available vehicles.

#### Important Alerts
A panel of up to 3 service alerts, pulled from unavailable vehicles or pending bookings:

| Severity | Colour |
|----------|--------|
| URGENT | Red |
| 2 DAYS | Yellow |
| INFO | Blue |

#### Daily Logs
Click **Download CSV** to export today's booking list as a CSV file. The file is named `daily-transit-log-YYYY-MM-DD.csv` and contains: booking ID, vehicle name, status, start date, end date, and total price.

#### Weather Panel
Shows an area forecast image (loaded from Supabase storage) and current conditions.

#### Live Map
A map preview panel with a button to **Open Map** — opens Google Maps focused on the Mustang region in a new tab.

#### Quick Stats
- **Efficiency** — fleet utilisation efficiency percentage
- **CO2 Offset** — estimated carbon offset from the fleet

---

### 4.9 Route Settings

**Sidebar item:** Settings (settings icon)  
**Page header:** "Route Settings / Global Limits"

Configure operational rules for routes and weather conditions. Settings are saved to browser local storage.

#### 4WD Rule

| Setting | Description | Default |
|---------|-------------|---------|
| Height Limit (Meters) | Altitude above which 4WD is required | 3,500 m |
| Slope Limit (%) | Gradient above which 4WD is required | 15% |

#### Weather Alerts

Toggle automatic ride-stop triggers:

| Alert | Condition |
|-------|-----------|
| Snowfall alert | Triggered when snowfall exceeds 5 cm |
| Gale alert | Triggered when wind speed exceeds 40 km/h |

#### User Roles

Three role types are defined:

| Role | Description |
|------|-------------|
| Fleet Manager | Can manage vehicles and routes |
| Booking Agent | Can manage bookings |
| Tech Admin | Can manage system settings |

Click the edit icon next to a role to modify it. The **+ Create Custom Role** button is available for future expansion.

#### Privacy & Cleanup

| Setting | Description |
|---------|-------------|
| Auto Clean Old Records | Automatically removes data older than 6 months (toggle on/off) |
| Run Manual Cleanup | Immediately triggers the cleanup process (requires confirmation dialog) |

Click **Save Changes** to persist settings. Click **Discard Changes** to revert to the last saved state.

---

### 4.10 Admin Profile

**Access:** Click the admin name in the sidebar footer  
**Page header:** "Admin Profile / Account Settings"

The admin profile page loads the authenticated admin's details from the database.

#### Profile Overview Card
Shows the admin avatar, display name, role title ("Fleet Director"), member since date, and status badges (Active, Super Admin, Verified).

Click **Edit Profile** to activate editing mode for the fields below.

Hover over the avatar and click the camera icon to upload a new profile photo.

#### Personal Information

| Field | Notes |
|-------|-------|
| Full Name | Editable |
| Display Name | Short name shown in the sidebar |
| Email Address | Editable (email change requires Supabase Auth verification) |
| Phone Number | Editable |
| Timezone | Default: Asia/Kathmandu (NPT +05:45) |
| Role | Read-only — "Fleet Director — Super Admin" |

Click **Save Changes** to persist. Click **Cancel** to discard and return to the dashboard.

#### Change Password

| Field | Notes |
|-------|-------|
| Current Password | Required to verify identity |
| New Password | Must meet: 8+ characters, uppercase, lowercase, number or symbol |
| Confirm New Password | Must match the new password |

Click **Update Password**. The system re-authenticates with the current password before applying the change.

#### Security Settings

**Two-Factor Authentication toggle** — Enable or disable TOTP 2FA for the admin account.

**Active Sessions panel** — Lists currently active login sessions with device and location information. Click **Revoke** on any non-current session to remove it from the list.

#### Notification Preferences

| Preference | Description |
|------------|-------------|
| Email Notifications | Booking alerts and compliance updates |
| SMS Alerts | Critical fleet warnings only |
| Push Notifications | Real-time browser notifications |

Toggle each on or off using the switch controls.

#### Account Overview (Side Panel)
Displays a summary of: Account Status, Role, and 2FA status.

#### Recent Activity (Side Panel)
A log of the most recent admin actions (e.g., "Password changed", "New vehicle added").

#### Danger Zone
A **Delete Account** button is present but blocked in the client application — account deletion requires a service-role backend endpoint.

**Sign Out** button at the bottom left signs the admin out and returns to the login page.

---

## 5. Booking Workflow Summary

The complete lifecycle of a customer booking:

```
User selects terrain → Browses fleet → Opens vehicle detail
    → Submits inquiry → Fills application form (dates, docs, questions)
    → Application status: SUBMITTED

Admin reviews application in Checks & Logs tab
    → Verifies documents (ID + License)
    → Clicks APPROVE or REJECT

If REJECTED:
    User receives rejection notification → No further action

If APPROVED:
    User receives approval notification
    → Application status: APPROVED
    → "Pay Now" button appears in My Bookings
    → User clicks Pay Now → Payment page
    → User completes payment via eSewa

On payment success:
    → Booking status: CONFIRMED
    → User receives payment success notification

Admin can then set booking to:
    → ACTIVE (vehicle handed over)
    → COMPLETED (vehicle returned)
    → CANCELLED (if needed)
```

**Free cancellation:** Users can cancel bookings in Submitted or Under Review status. Cancellation of Approved/Confirmed bookings must be handled by admin.

**Payment:** Only eSewa is supported for online payment. Admin-created bookings can record other payment methods (Cash on Pickup, Bank Transfer, Khalti, Credit/Debit Card) for walk-in customers.

---

## 6. Frequently Asked Questions

**Q: Can I book without logging in?**  
A: No. An account is required to access terrain selection, fleet browsing, vehicle details, and booking functions. The home page is publicly viewable.

**Q: How long does approval take?**  
A: Approval times depend on the fleet manager. You will receive a real-time notification as soon as your application is reviewed.

**Q: Can I use cash to pay?**  
A: Online bookings processed through the user application can only be paid via eSewa. Walk-in customers arranged directly through the admin panel can use other payment methods.

**Q: What documents do I need for Self Drive?**  
A: A valid driving license and a national ID are required. Upload clear photos or scanned copies (JPG, PNG, or PDF, max 5 MB each).

**Q: Can I have a driver without a personal license?**  
A: Yes. Select "With Driver" in the drive type. A driver fee of NPR 2,000 per day is added. No personal license is required.

**Q: How do I set up Two-Factor Authentication?**  
A: Go to Profile, find the 2FA section, scan the QR code with an authenticator app, and enter the 6-digit code to confirm enrollment.

**Q: What happens if my eSewa payment fails?**  
A: You are returned to the payment page with a failure message. The booking remains in Approved status, and you can retry payment at any time from My Bookings.

**Q: What is the maximum altitude the vehicles support?**  
A: Each vehicle's altitude chart on the detail page shows the supported altitude range. 4WD vehicles generally support the highest altitudes.

---

*Bhatbhate Vehicle Rental System — Nepal Himalayan Fleet*  
*Manual prepared based on application version as of May 2026*
