import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, beforeEach, afterEach, vi, MockedFunction } from "vitest";
import TextbookPage from "../pages/TextbookPage";

// --- MOCK LOCAL STORAGE ---
const mockUserData = { id: "123", firstName: "John", lastName: "Doe" };
beforeEach(() => {
  localStorage.setItem("user_data", JSON.stringify(mockUserData));
});

// --- MOCK GLOBAL FETCH ---
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("TextbookPage / TextbookUI", () => {
  it("renders input fields and buttons", () => {
    render(<TextbookPage />);
    expect(screen.getByPlaceholderText(/Textbook To Search For/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Textbook To Add/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Search Textbook/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Add Textbook/i })[0]).toBeInTheDocument();
  });

  it("adds a textbook successfully", async () => {
    const fetchMock = globalThis.fetch as MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValueOnce({
      text: async () => JSON.stringify({ error: "" }),
    } as any);

    render(<TextbookPage />);
    const input = screen.getByPlaceholderText(/Textbook To Add/i);
    fireEvent.change(input, { target: { value: "Chemistry 101" } });

    const addButton = screen.getAllByRole("button", { name: /Add Textbook/i })[0];
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/Textbook has been added/i)).toBeInTheDocument();
    });
  });

  it("searches textbooks successfully", async () => {
    const fetchMock = globalThis.fetch as MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValueOnce({
      text: async () => JSON.stringify({ results: ["Math 101", "Physics 101"] }),
    } as any);

    render(<TextbookPage />);
    const searchInput = screen.getByPlaceholderText(/Textbook To Search For/i);
    fireEvent.change(searchInput, { target: { value: "101" } });

    const searchButton = screen.getByRole("button", { name: /Search Textbook/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/Textbook\(s\) have been retrieved/i)).toBeInTheDocument();
      expect(screen.getByText(/Math 101, Physics 101/i)).toBeInTheDocument();
    });
  });

  it("handles add textbook API error", async () => {
    const fetchMock = globalThis.fetch as MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValueOnce({
      text: async () => JSON.stringify({ error: "Something went wrong" }),
    } as any);

    render(<TextbookPage />);
    const input = screen.getByPlaceholderText(/Textbook To Add/i);
    fireEvent.change(input, { target: { value: "Biology" } });

    const addButton = screen.getAllByRole("button", { name: /Add Textbook/i })[0];
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/API Error: Something went wrong/i)).toBeInTheDocument();
    });
  });
});
