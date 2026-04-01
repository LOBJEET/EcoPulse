import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../services/firebase";
import { authService, SignUpData } from "../services/authService";
import { communityAnalyticsService } from "../services/communityAnalyticsService";

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: SignUpData) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    communityAnalyticsService.ensureUserPublicStats(user).catch((err) => {
      console.warn("[auth] ensureUserPublicStats", err);
    });
  }, [user]);

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
  };

  const register = async (data: SignUpData) => {
    await authService.register(data);
  };

  const logout = async () => {
    await authService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
