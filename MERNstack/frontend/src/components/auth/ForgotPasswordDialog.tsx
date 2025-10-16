import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAuth } from "../../lib/auth-context";
import { toast } from "sonner@2.0.3";
import { CheckCircle2 } from "lucide-react";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin: () => void;
}

export function ForgotPasswordDialog({ 
  open, 
  onOpenChange, 
  onSwitchToLogin 
}: ForgotPasswordDialogProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await resetPassword(email);
      setIsSuccess(true);
      toast.success(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setEmail("");
      setIsSuccess(false);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="forgot-password-description">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription id="forgot-password-description">
            Enter your email address and we'll send you instructions to reset your password
          </DialogDescription>
        </DialogHeader>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Instructions"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onSwitchToLogin();
                }}
                className="text-primary hover:underline"
              >
                Back to sign in
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center py-6">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
            <div className="space-y-2">
              <h3>Check your email</h3>
              <p className="text-muted-foreground">
                If an account exists with this email, you will receive password reset instructions.
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
