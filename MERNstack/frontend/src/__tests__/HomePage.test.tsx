import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { HomePage } from "../pages/HomePage";
import { ProductCard } from "../components/ProductCard";
import { textbookService, Textbook } from "../lib/textbook-service";
import { toast } from "sonner";

// Mock textbookService
vi.mock("../lib/textbook-service", () => ({
  textbookService: {
    getAllTextbooks: vi.fn(),
  },
}));

// Mock ProductCard to simplify test
vi.mock("../components/ProductCard", () => ({
  ProductCard: ({ product, onClick }: any) => (
    <div data-testid="product-card" onClick={onClick}>
      {product.title}
    </div>
  ),
}));

// Mock ProductDetail to avoid portal issues
vi.mock("../components/ProductDetail", () => ({
  ProductDetail: () => <div data-testid="product-detail" />,
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const sampleTextbooks: Textbook[] = [
  {
    _id: "1",
    title: "Math 101",
    author: "John Doe",
    price: 50,
    condition: "new",
    images: [],
    seller: { name: "Alice" },
    description: "",
    isbn: "123",
    category: "Math",
  },
  {
    _id: "2",
    title: "Physics 101",
    author: "Jane Smith",
    price: 40,
    condition: "used",
    images: [],
    seller: { name: "Bob" },
    description: "",
    isbn: "456",
    category: "Science",
  },
];

describe("HomePage", () => {
  beforeEach(() => {
    (textbookService.getAllTextbooks as any).mockReset();
    (toast.error as any).mockReset();
  });

  it("renders welcome text when no search query", async () => {
    (textbookService.getAllTextbooks as any).mockResolvedValue([]);
    render(<HomePage searchQuery="" />);

    await waitFor(() => {
      expect(screen.getByText(/Find Your Textbooks at Student Prices/i)).toBeInTheDocument();
      expect(screen.getByText(/Buy and sell college textbooks directly/i)).toBeInTheDocument();
    });
  });

  it("loads and displays textbooks from API", async () => {
    (textbookService.getAllTextbooks as any).mockResolvedValue(sampleTextbooks);

    render(<HomePage searchQuery="" />);

    await waitFor(() => {
      expect(screen.getByText("Math 101")).toBeInTheDocument();
      expect(screen.getByText("Physics 101")).toBeInTheDocument();
    });
  });

  it("filters textbooks by category", async () => {
    (textbookService.getAllTextbooks as any).mockResolvedValue(sampleTextbooks);

    render(<HomePage searchQuery="" />);
    await waitFor(() => screen.getByText("Math 101"));

    const scienceButton = screen.getByText("Science");
    fireEvent.click(scienceButton);

    expect(screen.queryByText("Math 101")).not.toBeInTheDocument();
    expect(screen.getByText("Physics 101")).toBeInTheDocument();
  });

  it("filters textbooks by search query", async () => {
    (textbookService.getAllTextbooks as any).mockResolvedValue(sampleTextbooks);

    render(<HomePage searchQuery="Physics" />);
    await waitFor(() => {
      expect(screen.getByText("Physics 101")).toBeInTheDocument();
      expect(screen.queryByText("Math 101")).not.toBeInTheDocument();
    });
  });

  it("opens product detail modal when product clicked", async () => {
    (textbookService.getAllTextbooks as any).mockResolvedValue(sampleTextbooks);

    render(<HomePage searchQuery="" />);
    await waitFor(() => screen.getByText("Math 101"));

    fireEvent.click(screen.getByText("Math 101"));
    expect(screen.getByTestId("product-detail")).toBeInTheDocument();
  });

  it("displays empty state when no textbooks found", async () => {
    (textbookService.getAllTextbooks as any).mockResolvedValue([]);

    render(<HomePage searchQuery="Nonexistent" />);
    await waitFor(() => {
      expect(screen.getByText(/No textbooks found matching your search/i)).toBeInTheDocument();
    });
  });

  it("handles API error gracefully", async () => {
    (textbookService.getAllTextbooks as any).mockRejectedValue(new Error("Failed"));

    render(<HomePage searchQuery="" />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to load textbooks");
    });
  });
});
