import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Product } from "./ProductCard";
import { Package, MapPin, User, BookOpen, Calendar, ShoppingCart } from "lucide-react";
import { useCart } from "../lib/cart-context";
import { toast } from "sonner@2.0.3";

interface ProductDetailProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetail({ product, open, onOpenChange }: ProductDetailProps) {
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.title} added to cart`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="product-description">
        <DialogHeader>
          <DialogTitle>{product.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
            <ImageWithFallback
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <div className="text-primary mb-2">${product.price.toFixed(2)}</div>
              <Badge variant={product.condition === "New" ? "default" : "secondary"}>
                {product.condition}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Seller</p>
                  <p>{product.seller}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p>{product.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BookOpen className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Author</p>
                  <p>{product.author}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Edition</p>
                  <p>{product.edition}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Package className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">ISBN</p>
                  <p>{product.isbn}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 pt-2">
              <Button className="w-full" size="lg" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button className="w-full" variant="outline" size="lg">
                Contact Seller
              </Button>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4>About this listing</h4>
              <p className="text-muted-foreground" id="product-description">
                This textbook is in {product.condition.toLowerCase()} condition. 
                {product.condition === "New" && " Never used, no markings or wear."}
                {product.condition === "Like New" && " Minimal wear, no markings."}
                {product.condition === "Used" && " Some wear, may have highlighting."}
                {product.condition === "Very Used" && " Significant wear, but fully readable."}
                \n\n
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
