import { useState, useEffect } from "react";
import { getSettings, saveSettings } from "@/lib/local-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsTab() {
  const [settings, setSettingsState] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSettingsState(getSettings());
    setLoading(false);
  }, []);

  const handleSave = () => {
    setSaving(true);
    try {
      saveSettings(settings);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
    setSaving(false);
  };

  const update = (key: string, value: string) => {
    setSettingsState((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const groups = [
    {
      title: "Loan Settings",
      fields: [
        { key: "default_loan_duration", label: "Default Loan Duration (days)", type: "number" },
        { key: "max_items_per_student", label: "Max Items Per Student", type: "number" },
        { key: "overdue_reminder_days", label: "Overdue Reminder After (days)", type: "number" },
      ],
    },
    {
      title: "General",
      fields: [
        { key: "school_name", label: "School / Organization Name", type: "text" },
      ],
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {groups.map((group) => (
        <div key={group.title} className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">{group.title}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.fields.map((field) => (
              <div key={field.key}>
                <Label>{field.label}</Label>
                <Input
                  type={field.type}
                  value={settings[field.key] ?? ""}
                  onChange={(e) => update(field.key, e.target.value)}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button onClick={handleSave} disabled={saving} size="lg">
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save Settings
      </Button>
    </div>
  );
}
