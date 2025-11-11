import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { useCart } from "../../lib/cart-context";
import { useAuth } from "../../lib/auth-context";
import { toast } from "sonner@2.0.3";
import { CheckCircle2, Wallet, ShoppingCart } from "lucide-react";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CheckoutStep = "confirmation" | "success";

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const { user, updateUser } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>("confirmation");
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState<typeof items>([]);
  const [paidAmount, setPaidAmount] = useState(0);

  const handleConfirmPurchase = async () => {
    if (!user) {
      toast.error("You must be logged in to purchase");
      return;
    }

    // Check if user has sufficient balance
    const userBalance = user.balance || 0;
    if (userBalance < totalPrice) {
      toast.error(`Insufficient balance. You need $${totalPrice.toFixed(2)} but only have $${userBalance.toFixed(2)}`);
      return;
    }

    setIsProcessing(true);

    try {
      // Save purchased items before clearing cart
      setPurchasedItems([...items]);
      setPaidAmount(totalPrice);

      // Deduct balance
      const newBalance = userBalance - totalPrice;
      await updateUser({ balance: newBalance });

      setIsProcessing(false);
      setStep("success");
      clearCart();
      toast.success("Order placed successfully!");
    } catch (error) {
      setIsProcessing(false);
      toast.error("Failed to process payment. Please try again.");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after dialog closes
    setTimeout(() => {
      setStep("confirmation");
    }, 200);
  };

  const currentBalance = user?.balance || 0;
  const balanceAfterPurchase = currentBalance - totalPrice;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" aria-describedby="checkout-description">
        <DialogHeader>
          <DialogTitle>
            {step === "confirmation" && "Confirm Purchase"}
            {step === "success" && "Order Confirmed"}
          </DialogTitle>
        </DialogHeader>

        <p className="sr-only" id="checkout-description">
          {step === "confirmation" && "Review your order and confirm purchase"}
          {step === "success" && "Your order has been successfully placed"}
        </p>

        {/* Confirmation Step */}
        {step === "confirmation" && (
          <div className="space-y-6 py-4">
            {/* Order Summary */}
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <ShoppingCart className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">Order Total</p>
                  <p className="text-2xl font-bold">${totalPrice.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
            </div>

            {/* Balance Information */}
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <Wallet className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Balance</span>
                    <span className="font-medium">${currentBalance.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Balance After Purchase</span>
                    <span className={`font-medium ${balanceAfterPurchase < 0 ? 'text-destructive' : 'text-primary'}`}>
                      ${balanceAfterPurchase.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {balanceAfterPurchase < 0 && (
              <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                <p className="text-sm text-destructive">
                  Insufficient balance. Please add funds to your account.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPurchase}
                className="flex-1"
                disabled={isProcessing || balanceAfterPurchase < 0}
              >
                {isProcessing ? "Processing..." : "Confirm Purchase"}
              </Button>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === "success" && (
          <div className="space-y-6 text-center py-6">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Thank you for your order!</h3>
              <p className="text-muted-foreground">
                Your purchase has been completed successfully.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg text-left space-y-3">
              {purchasedItems.map((item, index) => (
                <div key={index}>
                  {index > 0 && <Separator className="my-3" />}
                  <div>
                    <p className="font-medium">{item.product.title}</p>
                    {item.product.author && <p className="text-sm text-muted-foreground">{item.product.author}</p>}
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Paid</span>
                <span className="font-medium text-primary">${paidAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Balance</span>
                <span className="font-medium">${(user?.balance || 0).toFixed(2)}</span>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              Continue Shopping
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
