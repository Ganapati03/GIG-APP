import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { authAPI } from "../../lib/api";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "freelancer" | "client" | "both";
  avatar?: string;
  bio?: string;
  skills?: string[];
  rating?: number;
  completedGigs?: number;
  createdAt: Date;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: "freelancer" | "client" | "both") => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAPI.getMe();
        if (response.success && response.user) {
          setUser({
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            role: response.user.role || "both",
            bio: response.user.bio,
            skills: response.user.skills,
            rating: response.user.rating,
            completedGigs: response.user.completedGigs,
            createdAt: new Date(response.user.createdAt),
          });
        }
      } catch (error) {
        console.log("Not authenticated");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.success && response.user) {
        const userData: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role || "both",
          bio: response.user.bio,
          skills: response.user.skills,
          rating: response.user.rating,
          completedGigs: response.user.completedGigs,
          createdAt: new Date(response.user.createdAt || new Date()),
        };
        setUser(userData);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Login error:", error);
      return false;
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: "freelancer" | "client" | "both"
  ): Promise<boolean> => {
    try {
      const response = await authAPI.register({ name, email, password, role });
      
      if (response.success && response.user) {
        const userData: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role || role,
          createdAt: new Date(response.user.createdAt),
        };
        setUser(userData);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Signup error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
