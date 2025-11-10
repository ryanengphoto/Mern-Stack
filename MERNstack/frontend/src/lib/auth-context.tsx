import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService, User } from "./auth-service";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ message: string }>;
  submitResetPassword: (token: string, password: string) => Promise<{ message: string }>;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = authService.getStoredToken();
    const storedUser = authService.getUser();
    if (token && storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { user, token } = await authService.login(email, password);
    authService.storeToken(token);
    setUser(user);
  };

  const signup = async (email: string, password: string, name: string) => {
    const { user, token } = await authService.signup(email, password, name);
    authService.storeToken(token);
    setUser(user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = async (updatedUser: Partial<User>) => {
    if (!user) return;
    try {
      const newUser = await authService.updateUser(updatedUser);
      setUser(newUser);
    } catch (err) {
      console.error(err);
      throw err; // allows SettingsPage to catch and show toast
    }
  };

  const resetPassword = async (email: string) => {
    return authService.resetPassword(email);
  };

  const submitResetPassword = async (token: string, password: string) => {
    return authService.submitResetPassword(token, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        resetPassword,
        submitResetPassword,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
