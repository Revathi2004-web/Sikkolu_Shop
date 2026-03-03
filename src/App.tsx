import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StoreProvider } from "@/context/StoreContext";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LanguageProvider } from "@/context/LanguageContext";
import { Suspense, lazy } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const CustomerStore = lazy(() => import("./pages/customer/CustomerStore"));
const CustomerAuth = lazy(() => import("./pages/customer/CustomerAuth"));
const Cart = lazy(() => import("./pages/customer/Cart"));
const Checkout = lazy(() => import("./pages/customer/Checkout"));
const Orders = lazy(() => import("./pages/customer/Orders"));
const ResetPassword = lazy(() => import("./pages/customer/ResetPassword"));
const Wishlist = lazy(() => import("./pages/customer/Wishlist"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
  </div>
);

const ProtectedCustomerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <StoreProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<CustomerAuth />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/store" element={<ProtectedCustomerRoute><CustomerStore /></ProtectedCustomerRoute>} />
                  <Route path="/cart" element={<ProtectedCustomerRoute><Cart /></ProtectedCustomerRoute>} />
                  <Route path="/checkout" element={<ProtectedCustomerRoute><Checkout /></ProtectedCustomerRoute>} />
                  <Route path="/orders" element={<ProtectedCustomerRoute><Orders /></ProtectedCustomerRoute>} />
                  <Route path="/wishlist" element={<ProtectedCustomerRoute><Wishlist /></ProtectedCustomerRoute>} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </StoreProvider>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
