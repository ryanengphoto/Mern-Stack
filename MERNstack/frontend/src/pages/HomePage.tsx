import { useState, useEffect } from "react";
import { ProductCard, Product } from "../components/ProductCard";
import { ProductDetail } from "../components/ProductDetail";
import { textbookService, Textbook } from "../lib/textbook-service";
import { toast } from "sonner";

// Helper function to convert Textbook to Product format
const textbookToProduct = (textbook: Textbook): Product => {
  const conditionMap: Record<string, Product["condition"]> = {
    "new": "New",
    "like new": "Like New",
    "used": "Used",
    "very used": "Very Used",
  };

  return {
    id: textbook._id as any,
    title: textbook.title,
    author: textbook.author || "Unknown Author",
    edition: "",
    price: textbook.price,
    condition: conditionMap[textbook.condition],
    image: textbook.images?.[0] || "",
    seller: typeof textbook.seller === "string" ? "" : (textbook.seller as any)?.name || "",
    location: "",
    description: textbook.description,
    isbn: textbook.isbn || "",
    category: textbook.category || "Uncategorized",
  };
};

interface HomePageProps {
  searchQuery: string;
}

const CATEGORIES = [
  "All",
  "Math",
  "Science",
  "Computer Science",
  "Engineering",
  "Business",
  "Literature",
  "Language",
];

export function HomePage({ searchQuery }: HomePageProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    loadTextbooks();
  }, []);

  const loadTextbooks = async () => {
    try {
      setIsLoading(true);
      const data = await textbookService.getAllTextbooks();
      setTextbooks(data);
    } catch (error) {
      toast.error("Failed to load textbooks");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const products = textbooks.map(textbookToProduct);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Categories */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex gap-4 overflow-x-auto">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all 
                  ${
                    selectedCategory === category
                      ? "bg-accent text-accent-foreground shadow-lg border border-accent-foreground"
                      : "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {!searchQuery && (
          <div className="mb-12 text-center space-y-4">
            <h1>Find Your Textbooks at Student Prices</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Buy and sell college textbooks directly with other students. Save
              money and help the environment.
            </p>
          </div>
        )}

        {searchQuery && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "result" : "results"} for "
              {searchQuery}"
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => handleProductClick(product)}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No textbooks found matching your search.
            </p>
          </div>
        )}
      </main>

      <ProductDetail
        product={selectedProduct}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
