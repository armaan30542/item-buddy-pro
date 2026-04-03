import { useState, useEffect } from "react";
import { getAllItems, addItem, updateItemStatus, getActiveItemLoan, getItemLoans, type Item, type ItemStatus } from "@/lib/local-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_STYLES: Record<string, string> = {
  available: "status-available",
  checked_out: "status-checked-out",
  maintenance: "status-maintenance",
  lost: "status-lost",
  retired: "status-maintenance",
};

export default function InventoryTab() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    asset_tag: "", name: "", category: "General", description: "",
    condition: "Good", location: "", default_loan_duration: "1",
  });
  const [saving, setSaving] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [activeLoan, setActiveLoan] = useState<any>(null);
  const [loanHistory, setLoanHistory] = useState<any[]>([]);

  useEffect(() => { loadItems(); }, []);

  const loadItems = () => {
    setLoading(true);
    setItems(getAllItems());
    setLoading(false);
  };

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setDetailOpen(true);
    setActiveLoan(getActiveItemLoan(item.id));
    setLoanHistory(getItemLoans(item.id).slice(0, 20));
  };

  const handleSave = () => {
    if (!form.asset_tag || !form.name) {
      toast.error("Asset Tag and Name are required");
      return;
    }
    setSaving(true);
    try {
      addItem({
        ...form,
        default_loan_duration: parseInt(form.default_loan_duration) || 1,
      });
      toast.success("Item added");
      setDialogOpen(false);
      setForm({ asset_tag: "", name: "", category: "General", description: "", condition: "Good", location: "", default_loan_duration: "1" });
      loadItems();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  const handleUpdateStatus = (id: string, status: string) => {
    try {
      updateItemStatus(id, status as ItemStatus);
      toast.success("Status updated");
      loadItems();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.asset_tag.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1 h-4 w-4" /> Add Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Item</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div><Label>Asset Tag *</Label><Input value={form.asset_tag} onChange={(e) => setForm({ ...form, asset_tag: e.target.value })} /></div>
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Condition</Label><Input value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div><Label>Loan Duration (days)</Label><Input type="number" value={form.default_loan_duration} onChange={(e) => setForm({ ...form, default_loan_duration: e.target.value })} /></div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Item"}
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
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Asset Tag</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Location</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-b last:border-0 hover:bg-muted/30 cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  <td className="px-4 py-3 font-mono text-xs">{item.asset_tag}</td>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{item.category}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{item.location || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[item.status] || ""}`}>
                      {item.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Select value={item.status} onValueChange={(v) => handleUpdateStatus(item.id, v)}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Item Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Asset Tag</span><p className="font-mono font-semibold">{selectedItem.asset_tag}</p></div>
                <div><span className="text-muted-foreground">Category</span><p className="font-medium">{selectedItem.category}</p></div>
                <div><span className="text-muted-foreground">Condition</span><p className="font-medium">{selectedItem.condition || "—"}</p></div>
                <div><span className="text-muted-foreground">Location</span><p className="font-medium">{selectedItem.location || "—"}</p></div>
                <div><span className="text-muted-foreground">Loan Duration</span><p className="font-medium">{selectedItem.default_loan_duration} day(s)</p></div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <p><span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[selectedItem.status] || ""}`}>{selectedItem.status.replace("_", " ")}</span></p>
                </div>
                {selectedItem.description && (
                  <div className="col-span-2"><span className="text-muted-foreground">Description</span><p className="font-medium">{selectedItem.description}</p></div>
                )}
              </div>

              {activeLoan && (
                <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                  <h3 className="font-semibold text-sm">Currently Checked Out By</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Name</span><p className="font-medium">{activeLoan.students?.first_name} {activeLoan.students?.last_name}</p></div>
                    <div><span className="text-muted-foreground">Student ID</span><p className="font-mono font-medium">{activeLoan.students?.student_id}</p></div>
                    <div><span className="text-muted-foreground">Checked Out</span><p className="font-medium">{format(new Date(activeLoan.checkout_at), "MMM d, yyyy")}</p></div>
                    <div><span className="text-muted-foreground">Due Date</span><p className="font-medium">{format(new Date(activeLoan.due_date), "MMM d, yyyy")}</p></div>
                    {activeLoan.reason && <div className="col-span-2"><span className="text-muted-foreground">Reason</span><p className="font-medium">{activeLoan.reason}</p></div>}
                    {activeLoan.teacher && <div className="col-span-2"><span className="text-muted-foreground">Teacher</span><p className="font-medium">{activeLoan.teacher}</p></div>}
                  </div>
                </div>
              )}

              {loanHistory.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Loan History</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {loanHistory.map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-xs">
                        <div>
                          <span className="font-medium">{loan.students?.first_name} {loan.students?.last_name}</span>
                          <span className="text-muted-foreground ml-2">({loan.students?.student_id})</span>
                        </div>
                        <div className="text-right text-muted-foreground">
                          <div>{format(new Date(loan.checkout_at), "MMM d, yyyy")}</div>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${loan.status === "returned" ? "bg-green-100 text-green-700" : loan.status === "overdue" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                            {loan.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
