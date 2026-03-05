import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, type LoginRequest, type RegisterRequest, type Result } from '../services/api';

interface User {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<Result<void>>;
  register: (data: RegisterRequest) => Promise<Result<void>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleAuthResponse = (response: { token: string; email: string; firstName: string; lastName: string; roles: string[] }) => {
    localStorage.setItem('token', response.token);
    const userData: User = {
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
      roles: response.roles,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (data: LoginRequest): Promise<Result<void>> => {
    const result = await authApi.login(data);
    if (result.ok) {
      handleAuthResponse(result.data);
      return { ok: true, data: undefined };
    }
    return result;
  };

  const register = async (data: RegisterRequest): Promise<Result<void>> => {
    const result = await authApi.register(data);
    if (result.ok) {
      handleAuthResponse(result.data);
      return { ok: true, data: undefined };
    }
    return result;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
