import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom";
import { HomePage } from "../pages/HomePage";
import { textbookService } from "../lib/textbook-service";
import { toast } from "sonner";

// --- MOCK SERVICES ---
vi.mock("../lib/textbook-service", () => ({
  textbookService: { getAllTextbooks: vi.fn() },
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

// --- MOCK COMPONENTS ---
vi.mock("../components/ProductCard", () => ({
  ProductCard: ({ product, onClick }: any) => (
    <div data-testid="product-card" onClick={onClick}>
      {product.title}
    </div>
  ),
}));

vi.mock("../components/ProductDetail", () => ({
  ProductDetail: ({ product, open }: any) =>
    open ? <div data-testid="product-detail">{product?.title}</div> : null,
}));

describe("HomePage", () => {
  const mockData = [
    { _id: "1", title: "Calculus 101", author: "Stewart", price: 50, condition: "new" },
    { _id: "2", title: "Physics Fundamentals", author: "Halliday", price: 60, condition: "used" },
    { _id: "3", title: "Biology Basics", author: "Campbell", price: 45, condition: "like new" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders textbooks from API", async () => {
    (textbookService.getAllTextbooks as any).mockResolvedValueOnce(mockData);

    render(<HomePage searchQuery="" />);

    // Wait for textbooks to appear
    await waitFor(() => {
      mockData.forEach((book) => {
        expect(screen.getByText(book.title)).toBeInTheDocument();
      });
    });
  });

  it("filters textbooks by search query", async () => {
    (textbookService.getAllTextbooks as any).mockResolvedValueOnce(mockData);

    render(<HomePage searchQuery="physics" />);

    await waitFor(() => {
      expect(screen.getByText("Physics Fundamentals")).toBeInTheDocument();
      expect(screen.queryByText("Calculus 101")).not.toBeInTheDocument();
      expect(screen.queryByText("Biology Basics")).not.toBeInTheDocument();
    });
  });

  it("handles API errors", async () => {
    (textbookService.getAllTextbooks as any).mockRejectedValueOnce(new Error("API failed"));

    render(<HomePage searchQuery="" />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to load textbooks");
    });
  });

  it("opens product detail when clicking a product", async () => {
    (textbookService.getAllTextbooks as any).mockResolvedValueOnce(mockData);

    render(<HomePage searchQuery="" />);

    await waitFor(() => screen.getByText("Calculus 101"));

    fireEvent.click(screen.getByText("Calculus 101"));

    await waitFor(() => {
      expect(screen.getByTestId("product-detail")).toBeInTheDocument();
      expect(screen.getByTestId("product-detail")).toHaveTextContent("Calculus 101");
    });
  });
});
