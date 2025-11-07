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
    <div className="min-h-screen bg-[#f5f1e7] flex items-start justify-center py-12 px-4">
      <div className="bg-white border border-gray-300 shadow-xl rounded-xl w-full max-w-3xl overflow-hidden">
        {/* Card header */}
      <div className="bg-gray-50 px-10 py-8 border-b-2 border-gray-200 flex justify-center">
        <h1
          style={{ fontSize: "1.5rem", fontWeight: 500 }}
          className="text-center"
        >
          User Settings
        </h1>
      </div>

        {/* Card body */}
        <div className="p-10 space-y-6">
          {/* Name */}
          <div className="flex flex-col gap-2 px-2">
            <label className="font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2" />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2 px-2">
            <label className="font-medium">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2" />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-2 px-2">
            <label className="font-medium">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2" />
          </div>

          {/* Balance */}
          <div className="flex flex-col gap-2 px-2">
            <label className="font-medium">Balance</label>
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold">${balance.toFixed(2)}</span>
              <Button size="sm" onClick={handleAddBalance}>
                Add Balance
              </Button>
            </div>
          </div>

          {/* Save */}
          <div className="px-2">
            <Button className="w-full mt-4 py-2" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
