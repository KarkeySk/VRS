================================================================================
BHATBHATE VRS — WEBSITE TESTING REPORT
Date: 2026-05-23
Tested by: Claude Code (static code audit)
================================================================================

Total issues found: 20
  HIGH:   4
  MEDIUM: 6
  LOW:    10

================================================================================
BUGS (FUNCTIONAL)
================================================================================

------------------------------------------------------------------------
Issue 1 — [HIGH] Navbar uses position:absolute — scrolls away on all pages
------------------------------------------------------------------------
File: user/src/components/layout/Navbar.jsx (line 43)

Problem:
  The wrapping div uses inline style { position: 'absolute' }.
  There IS a .navbar { position: fixed } class in index.css (line 999)
  but it is NOT applied to this component — it uses only inline styles.
  Result: the navbar disappears when the user scrolls down on any long page.

Fix:
  Change position: 'absolute' to position: 'fixed' in the inline style
  OR apply the .navbar CSS class to the component div.

------------------------------------------------------------------------
Issue 2 — [HIGH] Users can book past dates — start date has no minimum
------------------------------------------------------------------------
File: user/src/pages/user/BookingApply.jsx (line 218)

Problem:
  The end date input has min={startDate} to prevent end < start.
  But the start date input has NO min attribute at all.
  Users can select any past date and submit a booking successfully.

Fix:
  Add min={new Date().toISOString().split('T')[0]} to the start date input.

------------------------------------------------------------------------
Issue 3 — [MEDIUM] Step indicator in Booking form allows skipping Step 1
------------------------------------------------------------------------
File: user/src/pages/user/BookingApply.jsx (line 157)

Problem:
  The step tab divs have onClick={() => setStep(i + 1)}, so users can
  click "Step 2: Questions" directly without filling any required fields
  in Step 1 (dates, license number, contact details).
  Only the final submit validates, so invalid data can reach step 2.

Fix:
  Remove the onClick from step tabs, or validate step 1 fields before
  allowing the user to jump to step 2.

------------------------------------------------------------------------
Issue 4 — [MEDIUM] Currency shows "$" instead of "NPR" in 4 places
------------------------------------------------------------------------
Files:
  user/src/pages/user/BookingsPage.jsx (line 89)
    → ${app.total_price} renders as "$150" instead of "NPR 150"
  user/src/pages/user/VehicleDetail.jsx (line 262)
    → +${addon.price} renders as "+$500" for addon prices
  user/src/pages/user/VehicleDetail.jsx (line 307)
    → ${v.price} renders as "$2500" in related vehicles section
  user/src/pages/user/InquiryPage.jsx (line 178)
    → +${addon.price} renders as "+$500" for addon prices

Problem:
  These four lines use JavaScript template literals that produce a dollar
  sign. The rest of the app correctly uses "NPR". This is inconsistent
  and confusing for Nepali users.

Fix:
  Replace with: NPR {value.toLocaleString()} consistently across all pages.

------------------------------------------------------------------------
Issue 5 — [LOW] "Trip Purpose" dropdown color hardcoded — broken in light mode
------------------------------------------------------------------------
File: user/src/pages/user/BookingApply.jsx (line 308)

Problem:
  color: purpose ? '#fff' : '#555'
  This ignores CSS theme variables. In light mode, after selecting a
  purpose the text becomes white-on-white (invisible).

Fix:
  Use: color: purpose ? 'var(--text-primary)' : 'var(--text-muted)'

------------------------------------------------------------------------
Issue 6 — [LOW] PaymentPage subtitle says "approved!" even when it isn't
------------------------------------------------------------------------
File: user/src/pages/user/PaymentPage.jsx (line 129)

Problem:
  The subtitle "Your booking has been approved! Pay to confirm your
  reservation." is rendered unconditionally at page load. If the booking
  is still under review or rejected, this text is misleading. The actual
  error is shown further down the page.

Fix:
  Wrap this subtitle in a conditional: only show it when canPay is true.

------------------------------------------------------------------------
Issue 7 — [MEDIUM] VehiclesPage URL filter state not updated on back-navigation
------------------------------------------------------------------------
File: user/src/pages/user/VehiclesPage.jsx

Problem:
  const [filter, setFilter] = useState(terrainParam || 'All Terrain')
  This only reads the URL param at component mount. If a user clicks a
  vehicle, goes to VehicleDetail, then presses browser back, the URL
  still has ?terrain=Mountain but the filter state is stale and does not
  update, showing wrong filter results.

Fix:
  Add a useEffect that watches terrainParam and calls setFilter when it
  changes.

------------------------------------------------------------------------
Issue 8 — [HIGH] Admin app has no URL routing — back/forward/refresh broken
------------------------------------------------------------------------
File: admin/src/pages/dashboard/Dashboard.jsx

Problem:
  All navigation inside the admin panel uses local React state (activePage).
  - Refreshing always sends the admin back to "Dashboard"
  - Browser back/forward buttons do nothing
  - Bookmarking a specific admin page (e.g. Fleet) is impossible
  - Deep linking to a specific section does not work

Fix:
  Replace local state routing with proper <Route> paths inside the admin
  BrowserRouter (e.g. /dashboard/fleet, /dashboard/bookings, etc.).

------------------------------------------------------------------------
Issue 9 — [HIGH] eSewa test credentials used silently if env var is missing
------------------------------------------------------------------------
File: packages/shared/utils/esewaConfig.js (line 15)

Problem:
  secretKey: import.meta.env.VITE_ESEWA_SECRET_KEY || ESEWA_TEST_SECRET_KEY
  If VITE_ESEWA_SECRET_KEY is not set in production, the app silently
  falls back to hardcoded test credentials ('8gBm/:&EnhH.1/q') and the
  test payment URL. Real payments would go to the test gateway with no
  warning or error.

Fix:
  In production mode, throw an error if VITE_ESEWA_SECRET_KEY is missing:
    if (!import.meta.env.VITE_ESEWA_SECRET_KEY && import.meta.env.PROD) {
      throw new Error('VITE_ESEWA_SECRET_KEY is required in production')
    }

------------------------------------------------------------------------
Issue 10 — [HIGH] Navbar has no mobile hamburger menu
------------------------------------------------------------------------
File: user/src/components/layout/Navbar.jsx

Problem:
  The navbar renders all links, buttons, and icons in a single horizontal
  row with no responsive breakpoints. On screens narrower than ~768px
  the nav links, "Book Now" button, theme toggle, logout button, and
  notification bell all overflow and overlap each other.

Fix:
  Add a hamburger icon that toggles a mobile menu on small screens.
  Hide the horizontal nav links below a breakpoint using CSS.

------------------------------------------------------------------------
Issue 11 — [LOW] No Profile link in Navbar
------------------------------------------------------------------------
File: user/src/components/layout/Navbar.jsx (line 16-21)

Problem:
  navLinks contains: Dashboard, Terrain, Fleet, Bookings.
  There is no Profile link. Users must go to Dashboard and click the
  Profile tile to reach their profile. This is poor UX.

Fix:
  Add { label: 'Profile', to: '/profile' } to the navLinks array.


================================================================================
DUPLICATE CODE / DEAD FILES
================================================================================

------------------------------------------------------------------------
Issue 12 — [LOW] BookingCalendar.jsx exists but is never used
------------------------------------------------------------------------
Files:
  user/src/components/common/BookingCalendar.jsx  ← never imported
  user/src/components/common/CalendarPanel.jsx    ← actually used

Problem:
  Both components render a monthly calendar with booking highlights.
  CalendarPanel is imported in Dashboard.jsx and used.
  BookingCalendar is never imported anywhere — it is dead code.

Fix:
  Delete user/src/components/common/BookingCalendar.jsx

------------------------------------------------------------------------
Issue 13 — [LOW] WeatherWidget.jsx exists but is never used
------------------------------------------------------------------------
Files:
  user/src/components/common/WeatherWidget.jsx   ← never imported
  user/src/components/common/WeatherPanel.jsx    ← actually used

Problem:
  Both components fetch and display weather data.
  WeatherPanel is imported in Dashboard.jsx and used.
  WeatherWidget is never imported anywhere — it is dead code.

Fix:
  Delete user/src/components/common/WeatherWidget.jsx

------------------------------------------------------------------------
Issue 14 — [LOW] ConfirmDialogExample.jsx is a demo file in production source
------------------------------------------------------------------------
File: user/src/components/common/ConfirmDialogExample.jsx

Problem:
  This file is only a usage example showing how to use ConfirmDialog.
  It contains console.log('Item deleted') inside it.
  It is never imported or used anywhere in the app.
  It ships with the production bundle unnecessarily.

Fix:
  Delete the file or move it to a docs/ or examples/ folder outside src/.

------------------------------------------------------------------------
Issue 15 — [MEDIUM] DRIVER_FEE_PER_DAY = 2000 hardcoded in 3 separate files
------------------------------------------------------------------------
Files:
  user/src/pages/user/InquiryPage.jsx (line 10)
  user/src/pages/user/VehicleDetail.jsx (line 14)
  user/src/pages/user/BookingApply.jsx (line 9)

Problem:
  The same constant (2000 NPR per day driver fee) is copy-pasted into
  three different files. Changing the driver fee requires editing all 3
  files — easy to miss one and cause calculation inconsistencies.

Fix:
  Export it from a shared constants file:
    packages/shared/utils/constants.js
    export const DRIVER_FEE_PER_DAY = 2000
  Then import it wherever needed.

------------------------------------------------------------------------
Issue 16 — [LOW] Two separate import statements from the same module
------------------------------------------------------------------------
File: user/src/pages/user/VehicleRecommendation.jsx (lines 8-9)

Problem:
  import { getTerrainRecommendation } from '../../../../AI-chatboc/chatbotService';
  import { sendChatMessage } from '../../../../AI-chatboc/chatbotService';
  These are two import lines from the exact same file path. Redundant.

Fix:
  Combine into one:
  import { getTerrainRecommendation, sendChatMessage } from '../../../../AI-chatboc/chatbotService';

------------------------------------------------------------------------
Issue 17 — [HIGH] Two migration files share the same number 011
------------------------------------------------------------------------
Files:
  supabase/migrations/011_booking_email_notifications.sql
  supabase/migrations/011_add_payment_and_notifications.sql

Problem:
  Both files start with 011_. Migration runners (including Supabase CLI)
  order migrations by filename. Two files with the same number causes
  ambiguity — one may be skipped, applied in wrong order, or cause
  errors. The content of both is different (email tracking vs payment
  tracking), meaning one is likely the original and one a replacement.

Fix:
  Renumber one to 012. Also verify the existing 012_add_vehicle_notes.sql
  to avoid a chain collision and renumber accordingly.

------------------------------------------------------------------------
Issue 18 — [MEDIUM] bookingService and applicationService are confusingly parallel
------------------------------------------------------------------------
Files:
  packages/shared/services/bookingService.js    → queries 'bookings' table
  packages/shared/services/applicationService.js → queries 'booking_applications' table

Problem:
  Both expose create, getById, cancel, update, delete with near-identical
  APIs. The user-facing app only uses applicationService. bookingService
  is used only in the admin BookingsPage. The naming gives no hint that
  these are different stages of the same workflow. New developers will
  not know which to use.

Fix:
  Add clear documentation at the top of each file explaining which stage
  it represents. If 'bookings' and 'booking_applications' are different
  stages of one workflow, document that explicitly.

------------------------------------------------------------------------
Issue 19 — [LOW] Admin has two files both named "Dashboard" — confusing
------------------------------------------------------------------------
Files:
  admin/src/pages/dashboard/Dashboard.jsx  ← the shell/router component
  admin/src/pages/DashboardPage.jsx        ← the actual dashboard content

Problem:
  The shell Dashboard.jsx renders <DashboardPage> as one of its page
  cases. Both are called "Dashboard" in different directories. Any new
  developer editing the admin UI must figure out which one to open.

Fix:
  Rename the shell to AdminShell.jsx or AdminLayout.jsx to make its
  purpose clear.


================================================================================
DEBUG LOGS LEFT IN PRODUCTION CODE
================================================================================

------------------------------------------------------------------------
Issue 20 — [MEDIUM] console.log / console.warn / console.error in production files
------------------------------------------------------------------------
Files and lines:

  user/src/pages/user/PaymentSuccess.jsx (line 22)
    console.log('[PaymentSuccess] callback params: ...')
    *** SENSITIVE — logs payment callback URL and eSewa data to browser console ***

  user/src/pages/user/BookingsPage.jsx (lines 26, 36)
    console.warn('Failed to load bookings: ...')
    console.warn('Failed to cancel booking: ...')

  user/src/pages/user/VehicleRecommendation.jsx (line 99)
    console.error('[Recommendation] Error: ...')

  user/src/pages/auth/LoginPage.jsx (line 86)
    console.error('[Google OAuth] error: ...')

  user/src/components/common/ConfirmDialogExample.jsx (line 73)
    console.log('Item deleted')

  user/src/components/common/WeatherPanel.jsx (line 82)
    console.error('Failed to load weather: ...')

Problem:
  Debug logs left in production code. The PaymentSuccess log is the most
  serious — it echoes the full eSewa callback URL and payment token
  preview to the browser console, visible to anyone with DevTools open.

Fix:
  Remove all console.log/warn/error statements from production code paths.
  If error tracking is needed, use a proper service (e.g. Sentry).


================================================================================
SUMMARY TABLE
================================================================================

 #  | Severity | Category       | Location
----|----------|----------------|------------------------------------------
  1 | HIGH     | Bug            | Navbar — position:absolute scrolls away
  2 | HIGH     | Bug            | BookingApply — no min date on start date
  3 | MEDIUM   | Bug            | BookingApply — step tab skips validation
  4 | MEDIUM   | Bug            | BookingsPage/VehicleDetail/Inquiry — $ vs NPR
  5 | LOW      | Bug            | BookingApply — purpose dropdown color
  6 | LOW      | Bug            | PaymentPage — misleading subtitle
  7 | MEDIUM   | Bug            | VehiclesPage — stale URL filter state
  8 | HIGH     | Bug            | Admin — no URL routing, refresh breaks nav
  9 | HIGH     | Security       | eSewa test key silently used in production
 10 | HIGH     | UX             | Navbar — no mobile hamburger menu
 11 | LOW      | UX             | Navbar — no Profile link
 12 | LOW      | Duplicate/Dead | BookingCalendar.jsx never used
 13 | LOW      | Duplicate/Dead | WeatherWidget.jsx never used
 14 | LOW      | Duplicate/Dead | ConfirmDialogExample.jsx demo file in src
 15 | MEDIUM   | Duplicate      | DRIVER_FEE_PER_DAY hardcoded × 3 files
 16 | LOW      | Duplicate      | chatbotService imported twice in same file
 17 | HIGH     | Duplicate      | Two migration files numbered 011
 18 | MEDIUM   | Duplicate      | bookingService vs applicationService naming
 19 | LOW      | Duplicate      | Two files both named Dashboard in admin
 20 | MEDIUM   | Debug logs     | console.log/warn/error in production code

================================================================================
RECOMMENDED PRIORITY ORDER FOR GITHUB ISSUES
================================================================================

Priority 1 (fix before next release):
  Issue 9  — eSewa test key fallback (security/money risk)
  Issue 17 — Duplicate 011 migration (data integrity risk)
  Issue 1  — Navbar scrolls away (visible on every page)
  Issue 8  — Admin has no URL routing (admin UX broken)
  Issue 10 — No mobile menu (site unusable on phones)

Priority 2 (fix soon):
  Issue 2  — Past date booking allowed
  Issue 4  — Currency shows $ instead of NPR
  Issue 7  — Stale URL filter in vehicles page
  Issue 20 — Remove debug console logs (especially PaymentSuccess)
  Issue 15 — Centralize DRIVER_FEE_PER_DAY constant

Priority 3 (cleanup / nice to have):
  Issue 3  — Step tab skips form validation
  Issue 5  — Purpose dropdown color in light mode
  Issue 6  — PaymentPage misleading subtitle
  Issue 11 — Add Profile to navbar
  Issue 12 — Delete BookingCalendar.jsx
  Issue 13 — Delete WeatherWidget.jsx
  Issue 14 — Delete ConfirmDialogExample.jsx
  Issue 16 — Merge double import statement
  Issue 18 — Document bookingService vs applicationService
  Issue 19 — Rename admin Dashboard shell file

================================================================================
END OF REPORT
================================================================================
