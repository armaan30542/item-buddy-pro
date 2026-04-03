import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Package, Users, ClipboardList, Settings, Home } from "lucide-react";
import InventoryTab from "./InventoryTab";
import StudentsTab from "./StudentsTab";
import LoansTab from "./LoansTab";
import SettingsTab from "./SettingsTab";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("inventory");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">IT Equipment Manager</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <Home className="mr-1 h-4 w-4" />
            Kiosk
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 h-12">
            <TabsTrigger value="inventory" className="gap-2 touch-target">
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-2 touch-target">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="loans" className="gap-2 touch-target">
              <ClipboardList className="h-4 w-4" />
              Loans
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 touch-target">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <InventoryTab />
          </TabsContent>
          <TabsContent value="students">
            <StudentsTab />
          </TabsContent>
          <TabsContent value="loans">
            <LoansTab />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
