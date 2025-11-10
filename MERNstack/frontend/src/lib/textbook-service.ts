import { fetchWithAuth } from "./api";

const API_URL = "https://lamp-stack4331.xyz/api/textbooks";

export interface Textbook {
  _id: string;
  title: string;
  author?: string;
  isbn?: string;
  price: number;
  condition: "new" | "like new" | "used" | "very used";
  description?: string;
  images?: string[];
  category?: 
    | "Math"
    | "Science"
    | "Computer Science"
    | "Engineering"
    | "Business"
    | "Literature"
    | "Language"
    | "Uncategorized";
  seller: string; // User ID
  buyer?: string | null; // User ID of buyer, null if unsold
  createdAt: Date;
}

export interface CreateTextbookData {
  title: string;
  author?: string;
  isbn?: string;
  price: number;
  condition: "new" | "like new" | "used" | "very used";
  description?: string;
  images?: string[];
  category?: 
    | "Math"
    | "Science"
    | "Computer Science"
    | "Engineering"
    | "Business"
    | "Literature"
    | "Language"
    | "Uncategorized";
}

export const textbookService = {
  // Get all textbooks by current user
  async getMyTextbooks(userId: string): Promise<Textbook[]> {
    const response = await fetchWithAuth(`${API_URL}/by-user`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch textbooks");
    }

    const data = await response.json();
    return data.textbooks;
  },

  // Add a new textbook
  async addTextbook(textbookData: CreateTextbookData): Promise<Textbook> {
    const response = await fetchWithAuth(`${API_URL}/add`, {
      method: "POST",
      body: JSON.stringify(textbookData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to add textbook");
    }

    return response.json();
  },

  // Update a textbook
  async updateTextbook(
    id: string,
    updates: Partial<CreateTextbookData>
  ): Promise<Textbook> {
    const response = await fetchWithAuth(`${API_URL}/update`, {
      method: "POST",
      body: JSON.stringify({ id, ...updates }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update textbook");
    }

    const data = await response.json();
    return data.textbook;
  },

  // Delete a textbook
  async deleteTextbook(id: string): Promise<void> {
    const response = await fetchWithAuth(`${API_URL}/delete`, {
      method: "POST",
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete textbook");
    }
  },

  // Search all textbooks (unsold only)
  async searchTextbooks(query: string): Promise<Textbook[]> {
    const response = await fetch(`${API_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ search: query }),
    });

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const data = await response.json();
    // Filter out sold textbooks
    return data.results.filter((t: Textbook) => !t.buyer);
  },

  // Get all textbooks (unsold only)
  async getAllTextbooks(): Promise<Textbook[]> {
    const response = await fetch(`${API_URL}/all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch textbooks");
    }

    const data = await response.json();
    // Filter out sold textbooks
    return data.textbooks.filter((t: Textbook) => !t.buyer);
  },
};
