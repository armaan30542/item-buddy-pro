import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "@/contexts/StudentContext";
import StudentIdEntry from "@/components/StudentIdEntry";
import { getActiveStudentLoans, returnItem } from "@/lib/local-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Return() {
  const { student } = useStudent();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [returning, setReturning] = useState<string | null>(null);

  useEffect(() => {
    if (student) loadLoans();
  }, [student]);

  const loadLoans = () => {
    if (!student) return;
    setLoading(true);
    try {
      setLoans(getActiveStudentLoans(student.id));
    } catch {
      toast.error("Failed to load loans");
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = (loanId: string) => {
    setReturning(loanId);
    try {
      returnItem(loanId);
      toast.success("Item returned successfully!");
      loadLoans();
    } catch (e: any) {
      toast.error(e.message || "Return failed");
    } finally {
      setReturning(null);
    }
  };

  if (!student) {
    return <StudentIdEntry title="Return Equipment" onIdentified={() => {}} />;
  }

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl animate-fade-in">
        <button onClick={() => navigate("/")} className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-foreground touch-target">
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Return Equipment</h1>
          <p className="text-muted-foreground">
            Returning items for <span className="font-semibold text-foreground">{student.first_name} {student.last_name}</span>
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : loans.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <p className="text-lg text-muted-foreground">No items to return</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {loans.map((loan) => (
              <div
                key={loan.id}
                className={`flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm ${
                  isOverdue(loan.due_date) ? "border-destructive/50" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{loan.items?.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">#{loan.items?.asset_tag}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      Due: {format(new Date(loan.due_date), "MMM d, yyyy")}
                    </span>
                    {isOverdue(loan.due_date) && (
                      <span className="status-overdue rounded px-2 py-0.5 text-xs">OVERDUE</span>
                    )}
                  </div>
                  {loan.reason && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Reason:</span> {loan.reason}
                    </div>
                  )}
                  {loan.teacher && (
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Teacher:</span> {loan.teacher}
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => handleReturn(loan.id)}
                  disabled={returning === loan.id}
                  variant="outline"
                  className="touch-target"
                >
                  {returning === loan.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <RotateCcw className="mr-1 h-4 w-4" />
                      Return
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
