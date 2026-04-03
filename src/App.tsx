import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { StudentProvider } from "@/contexts/StudentContext";
import { KioskKeyboardProvider } from "@/contexts/KioskKeyboardContext";
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import Return from "./pages/Return";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <StudentProvider>
          <KioskKeyboardProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/return" element={<Return />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/docs" element={<Documentation />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </KioskKeyboardProvider>
        </StudentProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
