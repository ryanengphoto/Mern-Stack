import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./lib/auth-context";
import { CartProvider } from "./lib/cart-context";
import { useAuth } from "./lib/auth-context";
import { Toaster } from "./components/ui/sonner";
import { Header } from "./components/Header";
import { CartDrawer } from "./components/CartDrawer";
import { CheckoutDialog } from "./components/checkout/CheckoutDialog";
import { HomePage } from "./pages/HomePage";
import { YourListings } from "./pages/YourListings";
import { SettingsPage } from "./pages/SettingsPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

function AppContent() {
  const { isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header appears on ALL pages */}
      <Header
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Pages switch here based on route */}
      <Routes>
        <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
        <Route path="/listings" element={<YourListings />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/reset-password/:token?" element={<ResetPasswordPage />} />
      </Routes>

      {/* Cart and Checkout available on all pages */}
      <CartDrawer
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        onCheckout={handleCheckout}
      />

      <CheckoutDialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppContent />
          <Toaster />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
