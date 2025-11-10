// src/pages/ResetPasswordPage.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../lib/auth-context";

export function ResetPasswordPage() {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const { submitResetPassword } = useAuth(); // now using context
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Block page if no token
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-red-600 font-semibold text-lg">
          Invalid or missing password reset link.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords do not match");

    setIsLoading(true);
    try {
      // Call authService via context
      const res = await submitResetPassword(token, password);
      toast.success(res.message);
      setSuccess(true);
    } catch (err: any) {
      toast.error(err.message || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDone = () => navigate("/");

  return (
    <div className="min-h-screen bg-[#f5f1e7] flex items-start justify-center py-12 px-4">
      <div className="bg-white border border-gray-300 shadow-xl rounded-xl w-full max-w-3xl overflow-hidden">
        <div className="bg-gray-50 px-10 py-8 border-b-2 border-gray-200 flex justify-center">
          <h1 style={{ fontSize: "1.5rem", fontWeight: 500 }} className="text-center">
            Reset Password
          </h1>
        </div>

        <div className="p-10 space-y-6">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-2 px-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2"
                  required
                />
              </div>

              <div className="flex flex-col gap-2 px-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-3 py-2"
                  required
                />
              </div>

              <div className="px-2">
                <Button type="submit" className="w-full mt-4 py-2" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="mx-auto w-12 h-12 text-green-600" />
              <h3 className="text-xl font-semibold">Success!</h3>
              <p className="text-muted-foreground">
                Your password has been reset. You can now log in with your new password.
              </p>
              <Button onClick={handleDone} className="w-full">
                Go to Home
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
