import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "@/contexts/StudentContext";
import StudentIdEntry from "@/components/StudentIdEntry";
import { getStudentLoans, returnItem } from "@/lib/local-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function MyItems() {
  const { student, clear } = useStudent();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [returning, setReturning] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setLoading(true);
      try {
        setLoans(getStudentLoans(student.id));
      } catch {
        toast.error("Failed to load items");
      } finally {
        setLoading(false);
      }
    }
  }, [student]);

  const handleBack = () => {
    clear();
    navigate("/");
  };

  const handleReturn = (loanId: string) => {
    setReturning(loanId);
    try {
      returnItem(loanId);
      toast.success("Item returned successfully!");
      setLoans(getStudentLoans(student!.id));
    } catch (e: any) {
      toast.error(e.message || "Failed to return item");
    } finally {
      setReturning(null);
    }
  };

  if (!student) {
    return <StudentIdEntry title="My Items" onIdentified={() => {}} />;
  }

  const isOverdue = (loan: any) => loan.status === "active" && new Date(loan.due_date) < new Date();

  const statusDisplay = (loan: any) => {
    if (loan.status === "returned") return <Badge variant="secondary">Returned</Badge>;
    if (isOverdue(loan)) return <Badge variant="destructive">Overdue</Badge>;
    return <Badge className="bg-success text-success-foreground">Active</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl animate-fade-in">
        <button onClick={handleBack} className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-foreground touch-target">
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Items</h1>
          <p className="text-muted-foreground">
            Loan history for <span className="font-semibold text-foreground">{student.first_name} {student.last_name}</span>
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : loans.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <p className="text-lg text-muted-foreground">No loan history</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {loans.map((loan) => (
              <div key={loan.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{loan.items?.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">#{loan.items?.asset_tag}</span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Checked out: {format(new Date(loan.checkout_at), "MMM d, yyyy")}
                      {" • "}
                      Due: {format(new Date(loan.due_date), "MMM d, yyyy")}
                      {loan.return_at && (
                        <> • Returned: {format(new Date(loan.return_at), "MMM d, yyyy")}</>
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
                  <div className="flex items-center gap-2">
                    {loan.status !== "returned" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" disabled={returning === loan.id}>
                            {returning === loan.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RotateCcw className="h-4 w-4" />
                            )}
                            Return
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Return {loan.items?.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will mark the item as returned and make it available for others.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleReturn(loan.id)}>
                              Confirm Return
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {statusDisplay(loan)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
