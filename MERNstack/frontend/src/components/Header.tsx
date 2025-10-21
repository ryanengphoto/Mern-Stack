import { useState } from "react";
import { Search, User, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "../lib/auth-context";
import { useCart } from "../lib/cart-context";
import { UserMenu } from "./UserMenu";
import { LoginDialog } from "./auth/LoginDialog";
import { SignupDialog } from "./auth/SignupDialog";
import { ForgotPasswordDialog } from "./auth/ForgotPasswordDialog";
import { Badge } from "./ui/badge";

interface HeaderProps {
  onSearchChange: (value: string) => void;
  searchQuery: string;
  onCartClick: () => void;
}

export function Header({
  onSearchChange,
  searchQuery,
  onCartClick,
}: HeaderProps) {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  return (
    <>
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-6">
            {/* Logo */}
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <h1 className="text-primary">baye</h1>
              <span className="text-muted-foreground">textbooks</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for textbooks..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={onCartClick}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>

              {user ? (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/listings">Your Listings</Link>
                  </Button>
                  <Button>Sell Textbook</Button>
                  <UserMenu />
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setLoginOpen(true)}>
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                  <Button onClick={() => setSignupOpen(true)}>
                    Sell Textbook
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Dialogs */}
      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSwitchToSignup={() => setSignupOpen(true)}
        onSwitchToForgotPassword={() => setForgotPasswordOpen(true)}
      />
      <SignupDialog
        open={signupOpen}
        onOpenChange={setSignupOpen}
        onSwitchToLogin={() => setLoginOpen(true)}
      />
      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
        onSwitchToLogin={() => setLoginOpen(true)}
      />
    </>
  );
}
