// src/pages/SettingsPage.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth-context";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
      setBalance(user.balance || 0);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateUser({ name, email, phone, balance });
      toast.success("Settings updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update settings.");
    }
  };

  const handleAddBalance = () => {
    const amount = parseFloat(prompt("Enter amount to add:") || "0");
    if (amount > 0) {
      setBalance((prev) => prev + amount);
      toast.success(`Added $${amount.toFixed(2)} to your balance`);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">User Settings</h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-1">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1">Phone</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1">Balance</label>
          <div className="flex items-center gap-2">
            <span>${balance.toFixed(2)}</span>
            <Button size="sm" onClick={handleAddBalance}>
              Add Balance
            </Button>
          </div>
        </div>

        <Button className="w-full mt-4" onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
