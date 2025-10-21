import { useState } from "react";
import { Header } from "../components/Header";
import { ProductCard, Product } from "../components/ProductCard";
import { ProductDetail } from "../components/ProductDetail";
import { CartDrawer } from "../components/CartDrawer";
import { CheckoutDialog } from "../components/checkout/CheckoutDialog";

// Mock data for textbooks
const mockProducts: Product[] = [
  {
    id: 1,
    title: "Campbell Biology",
    author: "Jane B. Reece, Lisa A. Urry",
    edition: "11th Edition",
    price: 89.99,
    condition: "Like New",
    image:
      "https://images.unsplash.com/photo-1484172555456-bfd1451460cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaW9sb2d5JTIwdGV4dGJvb2t8ZW58MXx8fHwxNzYwMTc1NzQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    seller: "Sarah M.",
    location: "Boston, MA",
    isbn: "978-0134093413",
  },
  {
    id: 2,
    title: "Calculus: Early Transcendentals",
    author: "James Stewart",
    edition: "8th Edition",
    price: 75.5,
    condition: "Good",
    image:
      "https://images.unsplash.com/photo-1676302440263-c6b4cea29567?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRoZW1hdGljcyUyMGJvb2tzfGVufDF8fHx8MTc2MDIwMTI3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    seller: "John D.",
    location: "Stanford, CA",
    isbn: "978-1285741550",
  },
  {
    id: 3,
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    edition: "4th Edition",
    price: 120.0,
    condition: "New",
    image:
      "https://images.unsplash.com/photo-1706469980815-e2c54ace4560?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMHNjaWVuY2UlMjBib29rc3xlbnwxfHx8fDE3NjAyMDEyNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    seller: "MIT Bookstore",
    location: "Cambridge, MA",
    isbn: "978-0262046305",
  },
  {
    id: 4,
    title: "Chemistry: The Central Science",
    author: "Theodore L. Brown",
    edition: "14th Edition",
    price: 95.0,
    condition: "Like New",
    image:
      "https://images.unsplash.com/photo-1694230155228-cdde50083573?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVtaXN0cnklMjBsYWJ8ZW58MXx8fHwxNzYwMjAxMjgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    seller: "Emily R.",
    location: "Austin, TX",
    isbn: "978-0134414232",
  },
  {
    id: 5,
    title: "Physics for Scientists and Engineers",
    author: "Raymond A. Serway",
    edition: "10th Edition",
    price: 110.0,
    condition: "Good",
    image:
      "https://images.unsplash.com/photo-1683389377942-00afd2ea2b64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaHlzaWNzJTIwYm9va3N8ZW58MXx8fHwxNzYwMjAxMjgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    seller: "Physics Club",
    location: "Berkeley, CA",
    isbn: "978-1337553278",
  },
  {
    id: 6,
    title: "Organic Chemistry",
    author: "Paula Yurkanis Bruice",
    edition: "8th Edition",
    price: 85.0,
    condition: "Acceptable",
    image:
      "https://images.unsplash.com/photo-1588912914017-923900a34710?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXh0Ym9va3MlMjBjb2xsZWdlfGVufDF8fHx8MTc2MDIwMTI3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    seller: "Michael K.",
    location: "Seattle, WA",
    isbn: "978-0134042282",
  },
  {
    id: 7,
    title: "Linear Algebra and Its Applications",
    author: "David C. Lay",
    edition: "6th Edition",
    price: 70.0,
    condition: "Good",
    image:
      "https://images.unsplash.com/photo-1676302440263-c6b4cea29567?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRoZW1hdGljcyUyMGJvb2tzfGVufDF8fHx8MTc2MDIwMTI3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    seller: "Alex P.",
    location: "Ann Arbor, MI",
    isbn: "978-0134995991",
  },
  {
    id: 8,
    title: "Fundamentals of Database Systems",
    author: "Ramez Elmasri",
    edition: "7th Edition",
    price: 92.5,
    condition: "Like New",
    image:
      "https://images.unsplash.com/photo-1706469980815-e2c54ace4560?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMHNjaWVuY2UlMjBib29rc3xlbnwxfHx8fDE3NjAyMDEyNzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    seller: "CS Department",
    location: "Chicago, IL",
    isbn: "978-0133970777",
  },
  {
    id: 9,
    title: "Molecular Biology of the Cell",
    author: "Bruce Alberts",
    edition: "6th Edition",
    price: 105.0,
    condition: "Good",
    image:
      "https://images.unsplash.com/photo-1484172555456-bfd1451460cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaW9sb2d5JTIwdGV4dGJvb2t8ZW58MXx8fHwxNzYwMTc1NzQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    seller: "Jennifer L.",
    location: "New York, NY",
    isbn: "978-0815344322",
  },
];

interface HomePageProps {
  searchQuery: string;
}

export function HomePage({ searchQuery }: HomePageProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredProducts = mockProducts.filter(
    (product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Categories - only on home page */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex gap-4 overflow-x-auto">
            {[
              "All",
              "Math",
              "Science",
              "Computer Science",
              "Engineering",
              "Business",
              "Literature",
              "Languages",
            ].map((category) => (
              <button
                key={category}
                className="px-3 py-1.5 rounded-md hover:bg-accent whitespace-nowrap transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        {!searchQuery && (
          <div className="mb-12 text-center space-y-4">
            <h1>Find Your Textbooks at Student Prices</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Buy and sell college textbooks directly with other students. Save
              money and help the environment.
            </p>
          </div>
        )}

        {/* Results count */}
        {searchQuery && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "result" : "results"} for "
              {searchQuery}"
            </p>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => handleProductClick(product)}
            />
          ))}
        </div>

        {/* No results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No textbooks found matching your search.
            </p>
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductDetail
        product={selectedProduct}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
