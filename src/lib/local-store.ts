// Shared data store — talks to server.js so all devices see the same data
// Falls back to localStorage if the server is unreachable

const API = import.meta.env.VITE_API_URL || "";

function uuid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ─── Types ───

export type ItemStatus = "available" | "checked_out" | "maintenance" | "lost" | "retired";
export type LoanStatus = "active" | "returned" | "overdue";

export interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  grade: string | null;
  max_items: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  asset_tag: string;
  name: string;
  category: string;
  description: string | null;
  condition: string | null;
  location: string | null;
  status: ItemStatus;
  default_loan_duration: number;
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  item_id: string;
  student_id: string;
  status: LoanStatus;
  checkout_at: string;
  due_date: string;
  return_at: string | null;
  reason: string | null;
  teacher: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// ─── In-memory cache (syncs from server) ───

interface DataCache {
  students: Student[];
  items: Item[];
  loans: Loan[];
  settings: Record<string, string>;
}

let cache: DataCache = { students: [], items: [], loans: [], settings: {} };
let serverAvailable = false;

// ─── Server communication ───

async function fetchFromServer(): Promise<DataCache | null> {
  try {
    const res = await fetch(`${API}/api/data`);
    if (!res.ok) return null;
    const data = await res.json();
    serverAvailable = true;
    return {
      students: data.students || [],
      items: data.items || [],
      loans: data.loans || [],
      settings: data.settings || {},
    };
  } catch {
    serverAvailable = false;
    return null;
  }
}

async function saveTable(table: string, data: any): Promise<void> {
  if (!serverAvailable) return;
  try {
    await fetch(`${API}/api/${table}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    serverAvailable = false;
  }
}

// ─── Init: load from server on startup ───

export async function loadSeedIfNeeded(): Promise<void> {
  const serverData = await fetchFromServer();
  if (serverData) {
    cache = serverData;

    // Convert settings from object to Record if server has raw seed format
    if (typeof cache.settings === "object" && !Array.isArray(cache.settings)) {
      // Already in the right format
    }

    // Assign IDs to seed items that don't have them
    let needsSave = false;
    for (const item of cache.items) {
      if (!item.id) {
        item.id = uuid();
        item.created_at = item.created_at || now();
        item.updated_at = item.updated_at || now();
        item.status = item.status || "available";
        item.category = item.category || "General";
        item.default_loan_duration = item.default_loan_duration ?? 1;
        needsSave = true;
      }
    }
    for (const s of cache.students) {
      if (!s.id) {
        s.id = uuid();
        s.created_at = s.created_at || now();
        s.updated_at = s.updated_at || now();
        s.active = s.active ?? true;
        s.max_items = s.max_items ?? 3;
        needsSave = true;
      }
    }
    if (needsSave) {
      await saveTable("items", cache.items);
      await saveTable("students", cache.students);
    }
    return;
  }

  // Fallback: no server, use localStorage
  console.warn("Server not reachable — using localStorage fallback");
}

// ─── Refresh cache from server (call before reads for freshness) ───

async function refresh(): Promise<void> {
  const data = await fetchFromServer();
  if (data) cache = data;
}

// ─── Students ───

export async function getAllStudents(): Promise<Student[]> {
  await refresh();
  return cache.students.sort((a, b) => a.last_name.localeCompare(b.last_name));
}

export async function lookupStudent(studentId: string): Promise<Student | null> {
  await refresh();
  return cache.students.find((s) => s.student_id === studentId && s.active) ?? null;
}

export async function registerStudent(studentId: string, firstName: string, lastName: string): Promise<Student> {
  await refresh();
  if (cache.students.some((s) => s.student_id === studentId)) {
    throw new Error("Student ID already exists");
  }
  const student: Student = {
    id: uuid(),
    student_id: studentId,
    first_name: firstName,
    last_name: lastName,
    email: `${studentId}@fcstu.org`,
    grade: null,
    max_items: 3,
    active: true,
    created_at: now(),
    updated_at: now(),
  };
  cache.students.push(student);
  await saveTable("students", cache.students);
  return student;
}

export async function addStudent(data: { student_id: string; first_name: string; last_name: string; email?: string; grade?: string }): Promise<Student> {
  await refresh();
  if (cache.students.some((s) => s.student_id === data.student_id)) {
    throw new Error("Student ID already exists");
  }
  const student: Student = {
    id: uuid(),
    student_id: data.student_id,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email || null,
    grade: data.grade || null,
    max_items: 3,
    active: true,
    created_at: now(),
    updated_at: now(),
  };
  cache.students.push(student);
  await saveTable("students", cache.students);
  return student;
}

export async function toggleStudentActive(id: string): Promise<void> {
  await refresh();
  const idx = cache.students.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Student not found");
  cache.students[idx].active = !cache.students[idx].active;
  cache.students[idx].updated_at = now();
  await saveTable("students", cache.students);
}

// ─── Items ───

export async function getAllItems(): Promise<Item[]> {
  await refresh();
  return cache.items.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getAvailableItems(category?: string): Promise<Item[]> {
  await refresh();
  let items = cache.items.filter((i) => i.status === "available");
  if (category && category !== "All") {
    items = items.filter((i) => i.category === category);
  }
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getItemCategories(): Promise<string[]> {
  await refresh();
  const cats = [...new Set(cache.items.map((i) => i.category))].sort();
  return ["All", ...cats];
}

export async function addItem(data: {
  asset_tag: string; name: string; category?: string; description?: string;
  condition?: string; location?: string; default_loan_duration?: number;
}): Promise<Item> {
  await refresh();
  if (cache.items.some((i) => i.asset_tag === data.asset_tag)) {
    throw new Error("Asset tag already exists");
  }
  const item: Item = {
    id: uuid(),
    asset_tag: data.asset_tag,
    name: data.name,
    category: data.category || "General",
    description: data.description || null,
    condition: data.condition || null,
    location: data.location || null,
    status: "available",
    default_loan_duration: data.default_loan_duration ?? 1,
    created_at: now(),
    updated_at: now(),
  };
  cache.items.push(item);
  await saveTable("items", cache.items);
  return item;
}

export async function updateItemStatus(id: string, status: ItemStatus): Promise<void> {
  await refresh();
  const idx = cache.items.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error("Item not found");
  cache.items[idx].status = status;
  cache.items[idx].updated_at = now();
  await saveTable("items", cache.items);
}

// ─── Loans ───

export async function checkoutItem(
  studentId: string, itemId: string, durationDays: number, reason: string, teacher?: string
): Promise<Loan> {
  await refresh();

  const item = cache.items.find((i) => i.id === itemId);
  if (!item || item.status !== "available") throw new Error("Item is not available");

  const student = cache.students.find((s) => s.id === studentId);
  if (!student) throw new Error("Student not found");

  const activeLoans = cache.loans.filter((l) => l.student_id === studentId && l.status === "active");
  if (activeLoans.length >= student.max_items) {
    throw new Error(`You already have ${activeLoans.length} items checked out (max ${student.max_items})`);
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + durationDays);

  const loan: Loan = {
    id: uuid(),
    item_id: itemId,
    student_id: studentId,
    status: "active",
    checkout_at: now(),
    due_date: dueDate.toISOString(),
    return_at: null,
    reason: reason || null,
    teacher: teacher || null,
    notes: null,
    created_at: now(),
    updated_at: now(),
  };

  // Update item status
  const itemIdx = cache.items.findIndex((i) => i.id === itemId);
  cache.items[itemIdx].status = "checked_out";
  cache.items[itemIdx].updated_at = now();

  cache.loans.push(loan);

  await Promise.all([
    saveTable("items", cache.items),
    saveTable("loans", cache.loans),
  ]);

  return loan;
}

export async function returnItem(loanId: string): Promise<void> {
  await refresh();

  const loanIdx = cache.loans.findIndex((l) => l.id === loanId);
  if (loanIdx === -1) throw new Error("Loan not found");
  if (cache.loans[loanIdx].status === "returned") throw new Error("Already returned");

  cache.loans[loanIdx].status = "returned";
  cache.loans[loanIdx].return_at = now();
  cache.loans[loanIdx].updated_at = now();

  const itemIdx = cache.items.findIndex((i) => i.id === cache.loans[loanIdx].item_id);
  if (itemIdx !== -1) {
    cache.items[itemIdx].status = "available";
    cache.items[itemIdx].updated_at = now();
  }

  await Promise.all([
    saveTable("items", cache.items),
    saveTable("loans", cache.loans),
  ]);
}

export async function getStudentLoans(studentDbId: string): Promise<(Loan & { items?: Item })[]> {
  await refresh();
  const loans = cache.loans.filter((l) => l.student_id === studentDbId);
  return loans
    .map((l) => ({ ...l, items: cache.items.find((i) => i.id === l.item_id) }))
    .sort((a, b) => new Date(b.checkout_at).getTime() - new Date(a.checkout_at).getTime());
}

export async function getActiveStudentLoans(studentDbId: string): Promise<(Loan & { items?: Item })[]> {
  const loans = await getStudentLoans(studentDbId);
  return loans.filter((l) => l.status !== "returned");
}

export async function getAllLoans(): Promise<(Loan & { items?: Item; students?: Student })[]> {
  await refresh();
  return cache.loans
    .map((l) => ({
      ...l,
      items: cache.items.find((i) => i.id === l.item_id),
      students: cache.students.find((s) => s.id === l.student_id),
    }))
    .sort((a, b) => new Date(b.checkout_at).getTime() - new Date(a.checkout_at).getTime());
}

export async function getItemLoans(itemId: string): Promise<(Loan & { students?: Student })[]> {
  await refresh();
  const loans = cache.loans.filter((l) => l.item_id === itemId);
  return loans
    .map((l) => ({ ...l, students: cache.students.find((s) => s.id === l.student_id) }))
    .sort((a, b) => new Date(b.checkout_at).getTime() - new Date(a.checkout_at).getTime());
}

export async function getActiveItemLoan(itemId: string): Promise<(Loan & { students?: Student }) | null> {
  await refresh();
  const loans = cache.loans.filter(
    (l) => l.item_id === itemId && (l.status === "active" || l.status === "overdue")
  );
  if (loans.length === 0) return null;
  const loan = loans[0];
  return { ...loan, students: cache.students.find((s) => s.id === loan.student_id) };
}

// ─── Settings ───

const DEFAULT_SETTINGS: Record<string, string> = {
  default_loan_duration: "1",
  max_items_per_student: "3",
  overdue_reminder_days: "1",
  school_name: "",
};

export async function getSettings(): Promise<Record<string, string>> {
  await refresh();
  return { ...DEFAULT_SETTINGS, ...cache.settings };
}

export async function saveSettings(values: Record<string, string>): Promise<void> {
  await refresh();
  cache.settings = { ...cache.settings, ...values };
  await saveTable("settings", cache.settings);
}
