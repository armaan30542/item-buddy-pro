import { useState, useEffect } from "react";
import { getAllStudents, addStudent, toggleStudentActive } from "@/lib/local-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function StudentsTab() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ student_id: "", first_name: "", last_name: "", email: "", grade: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = () => {
    setLoading(true);
    setStudents(getAllStudents());
    setLoading(false);
  };

  const handleSave = () => {
    if (!form.student_id || !form.first_name || !form.last_name) {
      toast.error("Student ID, first name, and last name are required");
      return;
    }
    setSaving(true);
    try {
      addStudent(form);
      toast.success("Student added");
      setDialogOpen(false);
      setForm({ student_id: "", first_name: "", last_name: "", email: "", grade: "" });
      loadStudents();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  const handleToggleActive = (id: string) => {
    try {
      toggleStudentActive(id);
      toast.success("Student updated");
      loadStudents();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.first_name.toLowerCase().includes(search.toLowerCase()) ||
      s.last_name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1 h-4 w-4" /> Add Student</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label>Student ID *</Label><Input value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} /></div>
              <div><Label>First Name *</Label><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></div>
              <div><Label>Last Name *</Label><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Grade</Label><Input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} /></div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Student"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Student ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Grade</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{s.student_id}</td>
                  <td className="px-4 py-3 font-medium">{s.first_name} {s.last_name}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{s.email || "—"}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{s.grade || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${s.active ? "status-available" : "status-maintenance"}`}>
                      {s.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm" onClick={() => handleToggleActive(s.id)}>
                      {s.active ? "Deactivate" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
