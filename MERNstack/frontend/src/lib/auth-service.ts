// Authentication service connected to Express backend
const API_URL = "https://lamp-stack4331.xyz/api";

export interface User {
  _id: string;
  email: string;
  name: string;
  phone?: string;
  balance: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Invalid email or password");
    }

    const data = await response.json();
    this.storeToken(data.token);
    this.storeUser(data.user);
    return data;
  },

  async signup(
    email: string,
    password: string,
    name: string
  ): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Signup failed");
    }

    const data = await response.json();
    this.storeToken(data.token);
    this.storeUser(data.user);
    return data;
  },

  async resetPassword(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Password reset failed");
    }

    return response.json();
  },

  async updateUser(updatedUser: Partial<User>): Promise<User> {
    const token = this.getStoredToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/users/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedUser),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Update failed");
    }

    const data = await response.json();
    this.storeUser(data.user);
    return data.user;
  },

  async addBalance(amount: number): Promise<User> {
    const token = this.getStoredToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/users/addBalance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to add balance");
    }

    const data = await response.json();
    const updatedUser = await this.getUser();
    if (!updatedUser) throw new Error("Failed to fetch updated user");
    return updatedUser;
  },

  getUser(): User | null {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  storeUser(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
  },

  clearUser(): void {
    localStorage.removeItem("user");
  },

  logout(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  },

  getStoredToken(): string | null {
    return localStorage.getItem("auth_token");
  },

  storeToken(token: string): void {
    localStorage.setItem("auth_token", token);
  },
};
