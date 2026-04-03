import DocHeader from "./docs/DocHeader";
import DocCodeArchitecture from "./docs/DocCodeArchitecture";
import DocPageExplanations from "./docs/DocPageExplanations";
import DocBackendFunctions from "./docs/DocBackendFunctions";
import DocSecurityDetail from "./docs/DocSecurityDetail";
import DocContextsAndHooks from "./docs/DocContextsAndHooks";

export default function Documentation() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DocHeader />

      <main className="mx-auto max-w-4xl px-6 py-10 print:px-0 print:py-0">
        <article className="prose prose-neutral dark:prose-invert max-w-none print:prose-sm">
          <h1 className="text-3xl font-black tracking-tight">
            IT Equipment Checkout System — Complete Documentation
          </h1>
          <p className="text-muted-foreground text-lg">
            A comprehensive overview of the application for IT, administration, and other departments.
          </p>

          <hr />

          {/* ── Overview ── */}
          <h2>What Is This Application?</h2>
          <p>
            This is a <strong>self-service IT equipment checkout kiosk</strong> built as a web app. It runs in a browser
            (designed for a Raspberry Pi touchscreen or any computer) and lets <strong>students borrow and return IT
            equipment</strong> (laptops, chargers, cables, etc.) without needing a staff member present. Staff and admins
            manage everything through a separate admin dashboard.
          </p>

          <hr />

          {/* ── Who Uses It ── */}
          <h2>Who Uses It?</h2>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr><th>Role</th><th>How They Access It</th><th>What They Can Do</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>Students</strong></td><td>Walk up to the kiosk, enter their Student ID</td><td>Check out equipment, return equipment</td></tr>
                <tr><td><strong>Staff</strong></td><td>Log in with email/password via "Staff Login"</td><td>View inventory, students, and loans</td></tr>
                <tr><td><strong>Admins</strong></td><td>Log in the same way (have admin role)</td><td>Everything staff can do, plus: add/remove items, manage students, manage staff accounts, change settings</td></tr>
              </tbody>
            </table>
          </div>

          <hr />

          {/* ── Student Experience ── */}
          <h2>The Student Experience (Kiosk Mode)</h2>

          <h3>Home Screen</h3>
          <ul>
            <li>Three big buttons: <strong>Check Out</strong>, <strong>Return</strong>, and <strong>Staff Login</strong></li>
            <li>Dark/light mode toggle in the top corner</li>
            <li>If a student is already identified, their name appears with a "Not you?" link</li>
          </ul>

          <h3>Checking Out Equipment</h3>
          <ol>
            <li>Student taps <strong>Check Out</strong></li>
            <li>Enters their <strong>Student ID</strong> (6–12 digit number) using the on-screen virtual keyboard or a physical keyboard</li>
            <li>If the student isn't in the system, they can <strong>self-register</strong> by entering their first and last name</li>
            <li>Once identified, they see a list of all <strong>available items</strong> with checkboxes</li>
            <li>They can <strong>search</strong> by name or asset tag, and <strong>filter by category</strong></li>
            <li>They select one or more items (up to their max limit, default 3)</li>
            <li>A floating bar appears at the bottom showing how many items are selected</li>
            <li>They tap <strong>Continue</strong>, which opens a form asking:
              <ul>
                <li>How many days they need the items (required)</li>
                <li>Why they need them (required)</li>
                <li>Which teacher sent them (optional)</li>
              </ul>
            </li>
            <li>A summary appears, and they confirm the checkout</li>
            <li>The system records the loan and marks items as "checked out"</li>
          </ol>

          <h3>Returning Equipment</h3>
          <ol>
            <li>Student taps <strong>Return</strong></li>
            <li>Enters their Student ID</li>
            <li>Sees a list of all items they currently have checked out, with due dates</li>
            <li>Overdue items are highlighted in red</li>
            <li>They tap <strong>Return</strong> next to each item to return it</li>
            <li>The item goes back to "available" status</li>
          </ol>

          <h3>Session Management</h3>
          <ul>
            <li>After <strong>60 seconds of inactivity</strong>, the student session automatically clears and returns to the home screen</li>
            <li>This prevents the next student from accessing the previous student's account</li>
          </ul>

          <hr />

          {/* ── Staff/Admin Experience ── */}
          <h2>The Staff/Admin Experience</h2>

          <h3>Logging In</h3>
          <ul>
            <li>Tap <strong>Staff Login</strong> on the home screen</li>
            <li>Enter email and password</li>
            <li>Redirected to the <strong>Admin Dashboard</strong></li>
          </ul>

          <h3>Admin Dashboard Tabs</h3>

          <h4>1. Inventory Tab</h4>
          <ul>
            <li>Shows all equipment in a searchable table</li>
            <li>Columns: Asset Tag, Name, Category, Location, Status</li>
            <li>Click any item to see full details: condition, description, who currently has it, and complete loan history</li>
            <li>Staff can change item status (Available, Maintenance, Lost, Retired)</li>
            <li>Admins can add new items</li>
          </ul>

          <h4>2. Students Tab</h4>
          <ul>
            <li>Searchable list of all registered students</li>
            <li>Shows: Student ID, Name, Email, Grade, Active/Inactive status</li>
            <li>Admins can add new students or deactivate/activate them</li>
          </ul>

          <h4>3. Loans Tab</h4>
          <ul>
            <li>Complete history of all loans (past and present)</li>
            <li>Filterable by: All, Active, Overdue, Returned</li>
            <li>Shows: Student name, Item name, Checkout date, Due date, Return date, Status, Reason, Teacher</li>
            <li>Searchable by student name/ID or item name/asset tag</li>
          </ul>

          <h4>4. Staff Tab (Admin Only)</h4>
          <ul>
            <li>Manage staff and admin accounts</li>
            <li>Create new accounts with email, password, name, and role (Staff or Admin)</li>
            <li>Change roles or remove staff members</li>
          </ul>

          <h4>5. Settings Tab (Admin Only)</h4>
          <ul>
            <li>Configure loan defaults (default duration, max items per student, overdue reminder days)</li>
            <li>Email/SMTP settings for notifications</li>
            <li>School/organization name</li>
          </ul>

          <hr />

          {/* ── NEW: Code Architecture ── */}
          <DocCodeArchitecture />

          <hr />

          {/* ── NEW: Page Explanations ── */}
          <DocPageExplanations />

          <hr />

          {/* ── NEW: Backend Functions ── */}
          <DocBackendFunctions />

          <hr />

          {/* ── NEW: Contexts & Hooks ── */}
          <DocContextsAndHooks />

          <hr />

          {/* ── Database Structure ── */}
          <h2>Database Structure</h2>
          <div className="overflow-x-auto">
            <table>
              <thead><tr><th>Table</th><th>Purpose</th></tr></thead>
              <tbody>
                <tr><td><strong>students</strong></td><td>Student records (student_id, name, email, grade, max_items, active flag)</td></tr>
                <tr><td><strong>items</strong></td><td>Equipment inventory (asset_tag, name, category, status, condition, location, default loan duration)</td></tr>
                <tr><td><strong>loans</strong></td><td>Checkout/return records (links student to item, tracks dates, status, reason, teacher)</td></tr>
                <tr><td><strong>profiles</strong></td><td>Staff user profiles (linked to login accounts)</td></tr>
                <tr><td><strong>user_roles</strong></td><td>Maps staff users to roles (admin or staff)</td></tr>
                <tr><td><strong>settings</strong></td><td>Key-value configuration store</td></tr>
                <tr><td><strong>audit_log</strong></td><td>Tracks all checkout/return actions for accountability</td></tr>
                <tr><td><strong>email_logs</strong></td><td>Records of any notification emails sent</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Item Statuses</h3>
          <ul>
            <li><strong>Available</strong> — can be checked out</li>
            <li><strong>Checked Out</strong> — currently borrowed by a student</li>
            <li><strong>Maintenance</strong> — temporarily unavailable</li>
            <li><strong>Lost</strong> — reported missing</li>
            <li><strong>Retired</strong> — permanently removed from service</li>
          </ul>

          <h3>Loan Statuses</h3>
          <ul>
            <li><strong>Active</strong> — currently checked out</li>
            <li><strong>Returned</strong> — brought back</li>
            <li><strong>Overdue</strong> — past due date (calculated automatically)</li>
          </ul>

          <hr />

          {/* ── NEW: Security Detail ── */}
          <DocSecurityDetail />

          <hr />

          {/* ── Virtual Keyboard ── */}
          <h2>Virtual Keyboard</h2>
          <p>The app includes a built-in on-screen keyboard for touchscreen kiosks. It supports:</p>
          <ul>
            <li><strong>Numeric mode</strong> — for Student ID entry</li>
            <li><strong>Alpha mode</strong> — for names and teacher fields</li>
            <li><strong>Full mode</strong> — switches between letters and numbers (for email/password on staff login)</li>
          </ul>
          <p>Physical keyboards also work simultaneously — inputs accept both.</p>

          <hr />

          {/* ── Technical Stack ── */}
          <h2>Technical Stack (for IT Departments)</h2>
          <div className="overflow-x-auto">
            <table>
              <thead><tr><th>Component</th><th>Technology</th></tr></thead>
              <tbody>
                <tr><td>Frontend</td><td>React + TypeScript + Vite</td></tr>
                <tr><td>Styling</td><td>Tailwind CSS + shadcn/ui components</td></tr>
                <tr><td>Data Storage</td><td>Browser localStorage (no backend needed)</td></tr>
                <tr><td>Hosting</td><td>Any static hosting provider, or run locally</td></tr>
                <tr><td>Font</td><td>Poppins (Google Fonts)</td></tr>
                <tr><td>Theme</td><td>Dark mode by default, toggleable</td></tr>
              </tbody>
            </table>
          </div>

          <hr />

          {/* ── Deployment ── */}
          <h2>How to Deploy on a Raspberry Pi Kiosk</h2>
          <ol>
            <li>Build the app with <code>npm run build</code> and serve the <code>dist/</code> folder with any static server (e.g., Nginx, Caddy, or <code>npx serve dist</code>)</li>
            <li>Open the app URL in a full-screen browser (Chromium kiosk mode)</li>
            <li>No internet required — all data is stored locally in the browser</li>
            <li>The virtual keyboard handles all input on touchscreens</li>
          </ol>

          <hr />

          {/* ── First-Time Setup ── */}
          <h2>First-Time Setup</h2>
          <ol>
            <li>Navigate to the app URL</li>
            <li>Go to <strong>Staff Login</strong></li>
            <li>The first admin account needs to be created via the backend (bootstrap mode — no existing admin required for the very first account)</li>
            <li>Once logged in as admin, use the <strong>Staff Tab</strong> to create additional staff/admin accounts</li>
            <li>Use the <strong>Inventory Tab</strong> to add your equipment</li>
            <li>Use the <strong>Students Tab</strong> to pre-register students, or let students self-register at the kiosk</li>
            <li>Configure defaults in the <strong>Settings Tab</strong></li>
          </ol>

          <hr />
          <p className="text-muted-foreground text-sm italic print:text-black">
            Generated from the IT Equipment Checkout System. For questions, contact your school IT department.
          </p>
        </article>
      </main>
    </div>
  );
}
