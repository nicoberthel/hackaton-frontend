import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import RecommendationsPage from "./pages/RecommendationsPage";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import OpportunitiesDynPage from "./pages/OpportunitiesDynPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import DashboardPage from "./pages/DashboardPage";
import InvoiceIntegrationPage from "./pages/InvoiceIntegrationPage";
import CommunityPage from "./pages/CommunityPage";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import PortfolioPage from "./pages/PortfolioPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/opportunities" element={<OpportunitiesPage />} />
          <Route path="/opportunities_dyn" element={<OpportunitiesDynPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/invoice" element={<InvoiceIntegrationPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/customer-profile" element={<CustomerProfilePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
