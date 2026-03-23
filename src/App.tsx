import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout";

const HomePage = lazy(() => import("./pages/HomePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const RecommendationsPage = lazy(() => import("./pages/RecommendationsPage"));
const OpportunitiesPage = lazy(() => import("./pages/OpportunitiesPage"));
const OpportunitiesDynPage = lazy(() => import("./pages/OpportunitiesDynPage"));
const ConfirmationPage = lazy(() => import("./pages/ConfirmationPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const InvoiceIntegrationPage = lazy(() => import("./pages/InvoiceIntegrationPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const CustomerProfilePage = lazy(() => import("./pages/CustomerProfilePage"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
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
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
