import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { HomePage } from "../pages/HomePage";
import { vi } from "vitest";

// Mock ProductDetail component (to avoid modal rendering issues)
vi.mock("../components/ProductDetail", () => ({
  ProductDetail: ({ product }: any) => <div data-testid="product-detail">{product?.title}</div>,
}));

// Mock ProductCard component
vi.mock("../components/ProductCard", () => ({
  ProductCard: ({ product, onClick }: any) => (
    <div data-testid="product-card" onClick={onClick}>
      {product.title}
    </div>
  ),
}));

// Mock textbookService
vi.mock("../lib/textbook-service", () => ({
  textbookService: {
    getAllTextbooks: vi.fn(),
  },
}));

import { textbookService } from "../lib/textbook-service";

describe("HomePage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders welcome text when no search query", () => {
    render(<HomePage searchQuery="" />);
    expect(screen.getByText(/Find Your Textbooks at Student Prices/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Buy and sell college textbooks directly/i)
    ).toBeInTheDocument();
  });

  it("loads and displays textbooks from API", async () => {
    (textbookService.getAllTextbooks as any).mockResolvedValueOnce([
      { _id: "1", title: "Math 101", author: "Alice", price: 10, condition: "new", category: "Math" },
      { _id: "2", title: "Physics 101", author: "Bob", price: 15, condition: "used", category: "Science" },
    ]);

    render(<HomePage searchQuery="" />);

    await waitFor(() => {
      expect(screen.getByText(/Math 101/i)).toBeInTheDocument();
      expect(screen.getByText(/Physics 101/i)).toBeInTheDocument();
    });
  });

  it("filters textbooks by category", async () => {
    (textbookService.getAllTextbooks as any).mockResolvedValueOnce([
      { _id: "1", title: "Math 101", author: "Alice", price: 10, condition: "new", category: "Math" },
      { _id: "2", title: "Physics 101", author: "Bob", price: 15, condition: "used", category: "Science" },
    ]);

    render(<HomePage searchQuery="" />);
    await waitFor(() => screen.getByText(/Math 101/i));

    fireEvent.click(screen.getByText("Math"));

    await waitFor(() => {
      expect(screen.getByText(/Math 101/i)).toBeInTheDocument();
      expect(screen.queryByText(/Physics 101/i)).not.toBeInTheDocument();
    });
  });

  it("filters textbooks by search query", async () => {
    (textbookService.getAllTextbooks as any).mockResolvedValueOnce([
      { _id: "1", title: "Math 101", author: "Alice", price: 10, condition: "new", category: "Math" },
      { _id: "2", title: "Physics 101", author: "Bob", price: 15, condition: "used", category: "Science" },
    ]);

    render(<HomePage searchQuery="Physics" />);

    await waitFor(() => {
      expect(screen.getByText(/Physics 101/i)).toBeInTheDocument();
      expect(screen.queryByText(/Math 101/i)).not.toBeInTheDocument();
    });
  });

  it("opens product detail modal when product clicked", async () => {
    (textbookService.getAllTextbooks as any).mockResolvedValueOnce([
      { _id: "1", title: "Math 101", author: "Alice", price: 10, condition: "new", category: "Math" },
    ]);

    render(<HomePage searchQuery="" />);
    await waitFor(() => screen.getByText(/Math 101/i));

    fireEvent.click(screen.getByText(/Math 101/i));

    await waitFor(() => {
      expect(screen.getByTestId("product-detail")).toHaveTextContent("Math 101");
    });
  });

  it("displays empty state when no textbooks found", async () => {
    (textbookService.getAllTextbooks as any).mockResolvedValueOnce([]);

    render(<HomePage searchQuery="Nonexistent" />);

    await waitFor(() => {
      expect(screen.getByText(/No textbooks found/i)).toBeInTheDocument();
    });
  });

  it("handles API error gracefully", async () => {
    (textbookService.getAllTextbooks as any).mockRejectedValueOnce(new Error("Failed"));

    render(<HomePage searchQuery="" />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load textbooks/i)).toBeInTheDocument();
    });
  });
});
