import { useState, useEffect, useRef } from "react";
import { getAllLoans } from "@/lib/local-store";
import { useKioskKeyboard } from "@/contexts/KioskKeyboardContext";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";

export default function LoansTab() {
  const [loans, setLoans] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "overdue" | "returned">("all");
  const [loading, setLoading] = useState(true);
  const { attachInput } = useKioskKeyboard();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadLoans(); }, []);

  const loadLoans = () => {
    setLoading(true);
    setLoans(getAllLoans());
    setLoading(false);
  };

  const isOverdue = (loan: any) => loan.status === "active" && new Date(loan.due_date) < new Date();

  const filtered = loans.filter((l) => {
    const matchesSearch =
      l.items?.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.items?.asset_tag?.toLowerCase().includes(search.toLowerCase()) ||
      l.students?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.students?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.students?.student_id?.toLowerCase().includes(search.toLowerCase());

    if (filter === "active") return matchesSearch && l.status === "active" && !isOverdue(l);
    if (filter === "overdue") return matchesSearch && isOverdue(l);
    if (filter === "returned") return matchesSearch && l.status === "returned";
    return matchesSearch;
  });

  const statusBadge = (loan: any) => {
    if (loan.status === "returned") return <Badge variant="secondary">Returned</Badge>;
    if (isOverdue(loan)) return <Badge variant="destructive">Overdue</Badge>;
    return <Badge className="bg-success text-success-foreground">Active</Badge>;
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "overdue", label: "Overdue" },
    { key: "returned", label: "Returned" },
  ] as const;

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search loans..." value={search} onChange={(e) => setSearch(e.target.value)} onFocus={() => attachInput(searchRef.current, setSearch, search, "full")} ref={searchRef} className="pl-10" inputMode="none" />
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <Badge
              key={f.key}
              variant={filter === f.key ? "default" : "secondary"}
              className="cursor-pointer touch-target px-3 py-1.5"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Badge>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Student</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Item</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Checked Out</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Due Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Returned</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Reason</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Teacher</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((loan) => (
                <tr key={loan.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{loan.students?.first_name} {loan.students?.last_name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{loan.students?.student_id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{loan.items?.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">#{loan.items?.asset_tag}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {format(new Date(loan.checkout_at), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {format(new Date(loan.due_date), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {loan.return_at ? format(new Date(loan.return_at), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="px-4 py-3">{statusBadge(loan)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground max-w-[200px]">
                    {loan.reason ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate">{loan.reason}</span>
                          </TooltipTrigger>
                          <TooltipContent><p className="max-w-xs">{loan.reason}</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{loan.teacher || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
