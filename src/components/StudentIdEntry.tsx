import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "@/contexts/StudentContext";
import { registerStudent } from "@/lib/local-store";
import { useKioskKeyboard } from "@/contexts/KioskKeyboardContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  title: string;
  onIdentified: () => void;
}

export default function StudentIdEntry({ title, onIdentified }: Props) {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const { identify } = useStudent();
  const navigate = useNavigate();
  const { attachInput, detachInput } = useKioskKeyboard();

  const idRef = useRef<HTMLInputElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const lastRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    detachInput();
    const trimmed = studentId.trim();
    if (!trimmed) {
      toast.error("Please enter your Student ID");
      return;
    }
    if (!/^\d{6,}$/.test(trimmed)) {
      toast.error("Student ID must be at least 6 digits");
      return;
    }
    setLoading(true);
    try {
      const student = await identify(trimmed);
      if (student) {
        toast.success(`Welcome, ${student.first_name}!`);
        onIdentified();
      } else {
        setShowRegister(true);
      }
    } catch {
      toast.error("We couldn't find that Student ID. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    detachInput();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter your first and last name");
      return;
    }
    setLoading(true);
    try {
      const student = registerStudent(studentId.trim(), firstName.trim(), lastName.trim());
      if (student) {
        await identify(studentId.trim());
        toast.success(`Welcome, ${student.first_name}! You're registered.`);
        onIdentified();
      }
    } catch (err: any) {
      toast.error(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const setStudentIdNumeric = useCallback((val: string) => {
    setStudentId(val.replace(/\D/g, ""));
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 pb-72">
      <div className="w-full max-w-md animate-fade-in">
        <button
          onClick={() => { detachInput(); navigate("/"); }}
          className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground touch-target"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <h1 className="mb-2 text-3xl font-bold text-foreground">{title}</h1>
        <p className="mb-8 text-muted-foreground">
          {showRegister ? "First time? Enter your name to get started." : "Enter your Student ID to continue"}
        </p>

        {!showRegister ? (
          <>
            <Input
              ref={idRef}
              type="text"
              inputMode="none"
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ""))}
              onFocus={() => attachInput(idRef.current, setStudentIdNumeric, studentId, "numeric", handleSubmit)}
              className="mb-4 h-16 text-center text-2xl font-mono"
              autoFocus
            />
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="h-14 w-full text-lg font-semibold"
              size="lg"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue"}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground space-y-1">
              <div>Student ID: <span className="font-mono font-semibold text-foreground">{studentId}</span></div>
              <div>Email: <span className="font-medium text-foreground">{studentId.trim()}@fcstu.org</span></div>
            </div>
            <div>
              <Label>First Name</Label>
              <Input
                ref={firstRef}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onFocus={() => attachInput(firstRef.current, setFirstName, firstName, "alpha")}
                className="mt-1 h-12 text-lg"
                autoFocus
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                ref={lastRef}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onFocus={() => attachInput(lastRef.current, setLastName, lastName, "alpha")}
                className="mt-1 h-12 text-lg"
              />
            </div>
            <Button
              onClick={handleRegister}
              disabled={loading}
              className="h-14 w-full text-lg font-semibold"
              size="lg"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Register & Continue"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => { detachInput(); setShowRegister(false); setFirstName(""); setLastName(""); }}
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
