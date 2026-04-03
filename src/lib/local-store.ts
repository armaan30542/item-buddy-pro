// localStorage-based data store — no backend needed
// On first run, loads seed data from /seed.json (edit that file to change defaults)

function uuid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ─── Generic helpers ───

function getTable<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function setTable<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Seed data loader ───

const SEEDED_KEY = "ibp_seeded";

export async function loadSeedIfNeeded(): Promise<void> {
  if (localStorage.getItem(SEEDED_KEY)) return;

  try {
    const res = await fetch("/seed.json");
    if (!res.ok) return;
    const seed = await res.json();

    if (seed.items?.length && getTable(ITEMS).length === 0) {
      const items: Item[] = seed.items.map((item: any) => ({
        id: uuid(),
        asset_tag: item.asset_tag ?? "",
        name: item.name ?? "",
        category: item.category ?? "General",
        description: item.description ?? null,
        condition: item.condition ?? null,
        location: item.location ?? null,
        status: item.status ?? "available",
        default_loan_duration: item.default_loan_duration ?? 1,
        created_at: now(),
        updated_at: now(),
      }));
      setTable(ITEMS, items);
    }

    if (seed.students?.length && getTable(STUDENTS).length === 0) {
      const students: Student[] = seed.students.map((s: any) => ({
        id: uuid(),
        student_id: s.student_id ?? "",
        first_name: s.first_name ?? "",
        last_name: s.last_name ?? "",
        email: s.email ?? null,
        grade: s.grade ?? null,
        max_items: s.max_items ?? 3,
        active: s.active ?? true,
        created_at: now(),
        updated_at: now(),
      }));
      setTable(STUDENTS, students);
    }

    if (seed.settings) {
      const settings: Setting[] = Object.entries(seed.settings).map(([key, value]) => ({
        id: uuid(),
        key,
        value: String(value),
        description: null,
        created_at: now(),
        updated_at: now(),
      }));
      if (getTable(SETTINGS).length === 0) {
        setTable(SETTINGS, settings);
      }
    }
  } catch {
    // seed.json not found or invalid — that's fine, start empty
  }

  localStorage.setItem(SEEDED_KEY, "1");
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

// ─── Table keys ───

const STUDENTS = "ibp_students";
const ITEMS = "ibp_items";
const LOANS = "ibp_loans";
const SETTINGS = "ibp_settings";

// ─── Students ───

export function getAllStudents(): Student[] {
  return getTable<Student>(STUDENTS).sort((a, b) => a.last_name.localeCompare(b.last_name));
}

export function lookupStudent(studentId: string): Student | null {
  return getTable<Student>(STUDENTS).find((s) => s.student_id === studentId && s.active) ?? null;
}

export function registerStudent(studentId: string, firstName: string, lastName: string): Student {
  const students = getTable<Student>(STUDENTS);
  if (students.some((s) => s.student_id === studentId)) {
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
  students.push(student);
  setTable(STUDENTS, students);
  return student;
}

export function addStudent(data: { student_id: string; first_name: string; last_name: string; email?: string; grade?: string }): Student {
  const students = getTable<Student>(STUDENTS);
  if (students.some((s) => s.student_id === data.student_id)) {
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
  students.push(student);
  setTable(STUDENTS, students);
  return student;
}

export function toggleStudentActive(id: string): void {
  const students = getTable<Student>(STUDENTS);
  const idx = students.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Student not found");
  students[idx].active = !students[idx].active;
  students[idx].updated_at = now();
  setTable(STUDENTS, students);
}

// ─── Items ───

export function getAllItems(): Item[] {
  return getTable<Item>(ITEMS).sort((a, b) => a.name.localeCompare(b.name));
}

export function getAvailableItems(category?: string): Item[] {
  let items = getTable<Item>(ITEMS).filter((i) => i.status === "available");
  if (category && category !== "All") {
    items = items.filter((i) => i.category === category);
  }
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

export function getItemCategories(): string[] {
  const cats = [...new Set(getTable<Item>(ITEMS).map((i) => i.category))].sort();
  return ["All", ...cats];
}

export function addItem(data: {
  asset_tag: string; name: string; category?: string; description?: string;
  condition?: string; location?: string; default_loan_duration?: number;
}): Item {
  const items = getTable<Item>(ITEMS);
  if (items.some((i) => i.asset_tag === data.asset_tag)) {
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
  items.push(item);
  setTable(ITEMS, items);
  return item;
}

export function updateItemStatus(id: string, status: ItemStatus): void {
  const items = getTable<Item>(ITEMS);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error("Item not found");
  items[idx].status = status;
  items[idx].updated_at = now();
  setTable(ITEMS, items);
}

// ─── Loans ───

export function checkoutItem(
  studentId: string, itemId: string, durationDays: number, reason: string, teacher?: string
): Loan {
  const items = getTable<Item>(ITEMS);
  const students = getTable<Student>(STUDENTS);
  const loans = getTable<Loan>(LOANS);

  const item = items.find((i) => i.id === itemId);
  if (!item || item.status !== "available") throw new Error("Item is not available");

  const student = students.find((s) => s.id === studentId);
  if (!student) throw new Error("Student not found");

  const activeLoans = loans.filter((l) => l.student_id === studentId && l.status === "active");
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
  const itemIdx = items.findIndex((i) => i.id === itemId);
  items[itemIdx].status = "checked_out";
  items[itemIdx].updated_at = now();
  setTable(ITEMS, items);

  loans.push(loan);
  setTable(LOANS, loans);
  return loan;
}

export function returnItem(loanId: string): void {
  const loans = getTable<Loan>(LOANS);
  const items = getTable<Item>(ITEMS);

  const loanIdx = loans.findIndex((l) => l.id === loanId);
  if (loanIdx === -1) throw new Error("Loan not found");
  if (loans[loanIdx].status === "returned") throw new Error("Already returned");

  loans[loanIdx].status = "returned";
  loans[loanIdx].return_at = now();
  loans[loanIdx].updated_at = now();

  // Update item status back to available
  const itemIdx = items.findIndex((i) => i.id === loans[loanIdx].item_id);
  if (itemIdx !== -1) {
    items[itemIdx].status = "available";
    items[itemIdx].updated_at = now();
    setTable(ITEMS, items);
  }

  setTable(LOANS, loans);
}

export function getStudentLoans(studentDbId: string): (Loan & { items?: Item })[] {
  const loans = getTable<Loan>(LOANS).filter((l) => l.student_id === studentDbId);
  const items = getTable<Item>(ITEMS);
  return loans
    .map((l) => ({ ...l, items: items.find((i) => i.id === l.item_id) }))
    .sort((a, b) => new Date(b.checkout_at).getTime() - new Date(a.checkout_at).getTime());
}

export function getActiveStudentLoans(studentDbId: string): (Loan & { items?: Item })[] {
  return getStudentLoans(studentDbId).filter((l) => l.status !== "returned");
}

export function getAllLoans(): (Loan & { items?: Item; students?: Student })[] {
  const loans = getTable<Loan>(LOANS);
  const items = getTable<Item>(ITEMS);
  const students = getTable<Student>(STUDENTS);
  return loans
    .map((l) => ({
      ...l,
      items: items.find((i) => i.id === l.item_id),
      students: students.find((s) => s.id === l.student_id),
    }))
    .sort((a, b) => new Date(b.checkout_at).getTime() - new Date(a.checkout_at).getTime());
}

export function getItemLoans(itemId: string): (Loan & { students?: Student })[] {
  const loans = getTable<Loan>(LOANS).filter((l) => l.item_id === itemId);
  const students = getTable<Student>(STUDENTS);
  return loans
    .map((l) => ({ ...l, students: students.find((s) => s.id === l.student_id) }))
    .sort((a, b) => new Date(b.checkout_at).getTime() - new Date(a.checkout_at).getTime());
}

export function getActiveItemLoan(itemId: string): (Loan & { students?: Student }) | null {
  const loans = getTable<Loan>(LOANS).filter(
    (l) => l.item_id === itemId && (l.status === "active" || l.status === "overdue")
  );
  if (loans.length === 0) return null;
  const students = getTable<Student>(STUDENTS);
  const loan = loans[0];
  return { ...loan, students: students.find((s) => s.id === loan.student_id) };
}

// ─── Settings ───

const DEFAULT_SETTINGS: Record<string, string> = {
  default_loan_duration: "1",
  max_items_per_student: "3",
  overdue_reminder_days: "1",
  school_name: "",
};

export function getSettings(): Record<string, string> {
  const settings = getTable<Setting>(SETTINGS);
  const map: Record<string, string> = { ...DEFAULT_SETTINGS };
  settings.forEach((s) => { map[s.key] = s.value; });
  return map;
}

export function saveSettings(values: Record<string, string>): void {
  const settings = getTable<Setting>(SETTINGS);
  for (const [key, value] of Object.entries(values)) {
    const idx = settings.findIndex((s) => s.key === key);
    if (idx !== -1) {
      settings[idx].value = value;
      settings[idx].updated_at = now();
    } else {
      settings.push({
        id: uuid(),
        key,
        value,
        description: null,
        created_at: now(),
        updated_at: now(),
      });
    }
  }
  setTable(SETTINGS, settings);
}
