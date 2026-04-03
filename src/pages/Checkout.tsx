import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStudent } from "@/contexts/StudentContext";
import { useKioskKeyboard } from "@/contexts/KioskKeyboardContext";
import StudentIdEntry from "@/components/StudentIdEntry";
import { getAvailableItems, getItemCategories, checkoutItem } from "@/lib/local-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Search, Loader2, CheckCircle2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export default function Checkout() {
  const { student, resetTimer } = useStudent();
  const navigate = useNavigate();
  const { attachInput, detachInput } = useKioskKeyboard();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);

  const [duration, setDuration] = useState("");
  const [reason, setReason] = useState("");
  const [teacher, setTeacher] = useState("");

  const searchRef = useRef<HTMLInputElement>(null);
  const durationRef = useRef<HTMLInputElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const teacherRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (student) {
      loadItems();
      setCategories(getItemCategories());
    }
  }, [student, selectedCategory]);

  const loadItems = () => {
    setLoading(true);
    try {
      setItems(getAvailableItems(selectedCategory));
    } catch {
      toast.error("Failed to load available items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (itemId: string) => {
    resetTimer();
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const openCheckoutForm = () => {
    resetTimer();
    detachInput();
    const firstSelected = items.find((i) => selectedItems.has(i.id));
    setDuration(String(firstSelected?.default_loan_duration ?? 1));
    setReason("");
    setTeacher("");
    setShowForm(true);
  };

  const closeCheckoutForm = () => {
    detachInput();
    setShowForm(false);
    setDuration("");
    setReason("");
    setTeacher("");
  };

  const handleCheckout = () => {
    if (!student || selectedItems.size === 0) return;
    resetTimer();
    detachInput();
    const days = parseInt(duration, 10);
    if (!days || days < 1) {
      toast.error("Please enter a valid number of days (at least 1)");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please tell us why you need these items");
      return;
    }
    setCheckingOut(true);
    try {
      const itemIds = Array.from(selectedItems);
      for (const itemId of itemIds) {
        checkoutItem(student.id, itemId, days, reason.trim(), teacher.trim() || undefined);
      }
      toast.success(`${itemIds.length} item${itemIds.length > 1 ? "s" : ""} checked out successfully!`);
      closeCheckoutForm();
      navigate("/");
    } catch (e: any) {
      toast.error(e.message || "This item couldn't be checked out. It may already be borrowed.");
    } finally {
      setCheckingOut(false);
    }
  };

  const handleBack = () => {
    detachInput();
    navigate("/");
  };

  if (!student) {
    return <StudentIdEntry title="Check Out Equipment" onIdentified={() => {}} />;
  }

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.asset_tag.toLowerCase().includes(search.toLowerCase())
  );

  const selectedItemDetails = items.filter((i) => selectedItems.has(i.id));

  return (
    <div className="min-h-screen bg-background p-6 pb-72">
      <div className="mx-auto max-w-3xl animate-fade-in">
        <button onClick={handleBack} className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-foreground touch-target">
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Check Out Equipment</h1>
          <p className="text-muted-foreground">
            Welcome, <span className="font-semibold text-foreground">{student.first_name} {student.last_name}</span>
          </p>
        </div>

        {/* Checkout details dialog */}
        <Dialog open={showForm} onOpenChange={(open) => { if (!open) closeCheckoutForm(); }}>
          <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Confirm Check Out</DialogTitle>
            </DialogHeader>

            {/* Selected items summary */}
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="mb-2 text-sm font-medium text-muted-foreground">Items ({selectedItemDetails.length})</p>
              <div className="flex flex-wrap gap-2">
                {selectedItemDetails.map((item) => (
                  <Badge key={item.id} variant="secondary" className="text-xs">
                    {item.name} <span className="ml-1 font-mono text-muted-foreground">#{item.asset_tag}</span>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  How many days do you need them? <span className="text-destructive">*</span>
                </label>
                <Input
                  ref={durationRef}
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  onFocus={() => attachInput(durationRef.current, setDuration, duration, "numeric")}
                  placeholder="Number of days"
                  className="h-12 text-base"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Why do you need them? <span className="text-destructive">*</span>
                </label>
                <Textarea
                  ref={reasonRef}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  onFocus={() => attachInput(reasonRef.current, setReason, reason, "full")}
                  placeholder="e.g. Science project, class presentation..."
                  className="min-h-[80px] text-base"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Which teacher sent you? <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <Input
                  ref={teacherRef}
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  onFocus={() => attachInput(teacherRef.current, setTeacher, teacher, "alpha")}
                  placeholder="Teacher name"
                  className="h-12 text-base"
                />
              </div>

              {/* Confirmation summary */}
              {(duration || reason.trim()) && (
                <div className="rounded-lg border bg-muted/20 p-3 text-sm space-y-1">
                  <p className="font-medium text-foreground">Summary</p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">{selectedItemDetails.length}</span> item{selectedItemDetails.length > 1 ? "s" : ""} for{" "}
                    <span className="font-medium text-foreground">{duration || "?"}</span> day{duration !== "1" ? "s" : ""}
                  </p>
                  {reason.trim() && <p className="text-muted-foreground">Reason: {reason.trim()}</p>}
                  {teacher.trim() && <p className="text-muted-foreground">Teacher: {teacher.trim()}</p>}
                </div>
              )}

              <Button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="h-12 text-base touch-target"
              >
                {checkingOut ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Confirm Check Out ({selectedItems.size})
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Search by name or asset tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => attachInput(searchRef.current, setSearch, search, "full")}
              className="h-12 pl-10 text-base"
            />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "secondary"}
              className="cursor-pointer touch-target px-4 py-2 text-sm"
              onClick={() => { detachInput(); setSelectedCategory(cat); }}
            >
              {cat}
            </Badge>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <p className="text-lg text-muted-foreground">No available items found</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((item) => {
              const isSelected = selectedItems.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 shadow-sm transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "bg-card hover:shadow-md"
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleItem(item.id)}
                    className="h-6 w-6"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{item.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">#{item.asset_tag}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{item.category}</span>
                      {item.location && <span>• {item.location}</span>}
                      <span>• {item.default_loan_duration}d default</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating checkout bar */}
      {selectedItems.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background p-4 shadow-lg">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <div className="flex items-center gap-2 text-foreground">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-semibold">{selectedItems.size} item{selectedItems.size > 1 ? "s" : ""} selected</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedItems(new Set())} className="touch-target">
                Clear
              </Button>
              <Button onClick={openCheckoutForm} className="touch-target">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
