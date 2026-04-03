import { useNavigate } from "react-router-dom";
import { Monitor, RotateCcw, Settings, Moon, Sun } from "lucide-react";
import { useStudent } from "@/contexts/StudentContext";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { student, clear } = useStudent();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      {/* Dark mode toggle */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Sun className="h-4 w-4 text-muted-foreground" />
        <Switch checked={dark} onCheckedChange={setDark} />
        <Moon className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="mb-12 text-center animate-fade-in">
        <div className="mb-4 flex items-center justify-center gap-3">
          <Monitor className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">
            IT Equipment Checkout
          </h1>
        </div>
        {student ? (
          <div className="text-lg text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{student.first_name} {student.last_name}</span>
            <button onClick={clear} className="ml-2 text-sm text-primary underline hover:text-primary/80">
              Not you?
            </button>
          </div>
        ) : (
          <p className="text-lg text-muted-foreground">
            Tap an option below to get started
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 md:gap-8 animate-fade-in">
        <button
          onClick={() => navigate("/checkout")}
          className="kiosk-btn kiosk-btn-primary"
        >
          <Monitor className="h-12 w-12" />
          <span>Check Out</span>
        </button>

        <button
          onClick={() => navigate("/return")}
          className="kiosk-btn kiosk-btn-accent"
        >
          <RotateCcw className="h-12 w-12" />
          <span>Return</span>
        </button>

        <button
          onClick={() => navigate("/admin")}
          className="kiosk-btn kiosk-btn-secondary col-span-2"
        >
          <Settings className="h-12 w-12" />
          <span>Manage</span>
        </button>
      </div>

    </div>
  );
};

export default Index;
