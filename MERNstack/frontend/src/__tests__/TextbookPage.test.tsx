import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TextbookPage from "../pages/TextbookPage";

// mock localStorage
const mockUserData = { id: "123", firstName: "John", lastName: "Doe" };
beforeEach(() => {
  localStorage.setItem("user_data", JSON.stringify(mockUserData));
});

// mock global fetch
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
    expect(screen.getByText(/Search Textbook/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Textbook/i)).toBeInTheDocument();
  });

  it("adds a textbook successfully", async () => {
    (fetch as unknown as jest.Mock).mockResolvedValueOnce({
      text: async () => JSON.stringify({ error: "" }),
    });

    render(<TextbookPage />);
    const input = screen.getByPlaceholderText(/Textbook To Add/i);
    fireEvent.change(input, { target: { value: "Chemistry 101" } });

    fireEvent.click(screen.getByText(/Add Textbook/i));

    await waitFor(() => {
      expect(screen.getByText(/Textbook has been added/i)).toBeInTheDocument();
    });
  });

  it("searches textbooks successfully", async () => {
    (fetch as unknown as jest.Mock).mockResolvedValueOnce({
      text: async () => JSON.stringify({ results: ["Math 101", "Physics 101"] }),
    });

    render(<TextbookPage />);
    const searchInput = screen.getByPlaceholderText(/Textbook To Search For/i);
    fireEvent.change(searchInput, { target: { value: "101" } });

    fireEvent.click(screen.getByText(/Search Textbook/i));

    await waitFor(() => {
      expect(screen.getByText(/Textbook\(s\) have been retrieved/i)).toBeInTheDocument();
      expect(screen.getByText(/Math 101, Physics 101/i)).toBeInTheDocument();
    });
  });

  it("handles add textbook API error", async () => {
    (fetch as unknown as jest.Mock).mockResolvedValueOnce({
      text: async () => JSON.stringify({ error: "Something went wrong" }),
    });

    render(<TextbookPage />);
    const input = screen.getByPlaceholderText(/Textbook To Add/i);
    fireEvent.change(input, { target: { value: "Biology" } });

    fireEvent.click(screen.getByText(/Add Textbook/i));

    await waitFor(() => {
      expect(screen.getByText(/API Error: Something went wrong/i)).toBeInTheDocument();
    });
  });
});
