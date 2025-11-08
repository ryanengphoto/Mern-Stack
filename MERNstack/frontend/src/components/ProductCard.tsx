import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

export interface Product {
  id: number;
  title: string;
  author: string;
  edition: string;
  price: number;
  condition: "Like New" | "Used" | "Very Used" | "New";
  image: string;
  seller: string;
  location: string;
  description?: string;
  isbn: string;
}

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="aspect-[3/4] bg-muted relative overflow-hidden">
        <ImageWithFallback
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        <Badge className="absolute top-2 right-2" variant={product.condition === "New" ? "default" : "secondary"}>
          {product.condition}
        </Badge>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="line-clamp-2">{product.title}</h3>
        <p className="text-muted-foreground">{product.author}</p>
        <p className="text-muted-foreground">Edition: {product.edition}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-primary">${product.price.toFixed(2)}</span>
          <span className="text-muted-foreground">{product.location}</span>
        </div>
      </div>
    </Card>
  );
}
