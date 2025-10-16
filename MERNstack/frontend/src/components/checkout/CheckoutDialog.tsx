import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { useCart } from "../../lib/cart-context";
import { useAuth } from "../../lib/auth-context";
import { toast } from "sonner@2.0.3";
import { CheckCircle2, CreditCard, MapPin, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CheckoutStep = "shipping" | "payment" | "confirmation";

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>("shipping");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Shipping form
  const [shippingData, setShippingData] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: ""
  });

  // Payment form
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: ""
  });

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock order ID
    const mockOrderId = `ORD-${Date.now()}`;
    setOrderId(mockOrderId);
    
    setIsProcessing(false);
    setStep("confirmation");
    clearCart();
    toast.success("Order placed successfully!");
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after dialog closes
    setTimeout(() => {
      setStep("shipping");
      setPaymentData({
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvv: ""
      });
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="checkout-description">
        <DialogHeader>
          <DialogTitle>
            {step === "shipping" && "Shipping Information"}
            {step === "payment" && "Payment Details"}
            {step === "confirmation" && "Order Confirmed"}
          </DialogTitle>
        </DialogHeader>
        
        <p className="sr-only" id="checkout-description">
          {step === "shipping" && "Enter your shipping address to continue with checkout"}
          {step === "payment" && "Enter your payment information to complete your order"}
          {step === "confirmation" && "Your order has been successfully placed"}
        </p>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex items-center gap-2 ${step === "shipping" ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "shipping" ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
              {step !== "shipping" ? <CheckCircle2 className="h-4 w-4" /> : "1"}
            </div>
            <span>Shipping</span>
          </div>
          <Separator className="flex-1" />
          <div className={`flex items-center gap-2 ${step === "payment" ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "payment" ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
              {step === "confirmation" ? <CheckCircle2 className="h-4 w-4" /> : "2"}
            </div>
            <span>Payment</span>
          </div>
          <Separator className="flex-1" />
          <div className={`flex items-center gap-2 ${step === "confirmation" ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "confirmation" ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span>Done</span>
          </div>
        </div>

        {/* Shipping Step */}
        {step === "shipping" && (
          <form onSubmit={handleShippingSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={shippingData.fullName}
                onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={shippingData.address}
                onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={shippingData.city}
                  onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select
                  value={shippingData.state}
                  onValueChange={(value) => setShippingData({ ...shippingData, state: value })}
                >
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="MA">Massachusetts</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={shippingData.zipCode}
                  onChange={(e) => setShippingData({ ...shippingData, zipCode: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={shippingData.phone}
                  onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Continue to Payment
            </Button>
          </form>
        )}

        {/* Payment Step */}
        {step === "payment" && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>$5.00</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span>Total</span>
                <span className="text-primary">${(totalPrice + 5).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentData.cardNumber}
                onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={paymentData.cardName}
                onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={paymentData.expiryDate}
                  onChange={(e) => setPaymentData({ ...paymentData, expiryDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={paymentData.cvv}
                  onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep("shipping")} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </form>
        )}

        {/* Confirmation Step */}
        {step === "confirmation" && (
          <div className="space-y-6 text-center py-6">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
            <div className="space-y-2">
              <h3>Thank you for your order!</h3>
              <p className="text-muted-foreground">
                Your order has been confirmed and will be shipped soon.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg text-left space-y-3">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Order Number</p>
                  <p>{orderId}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Shipping Address</p>
                  <p>{shippingData.fullName}</p>
                  <p>{shippingData.address}</p>
                  <p>{shippingData.city}, {shippingData.state} {shippingData.zipCode}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Total Paid</p>
                  <p className="text-primary">${(totalPrice + 5).toFixed(2)}</p>
                </div>
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
