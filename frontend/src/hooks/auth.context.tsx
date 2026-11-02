import { createContext, useState, useContext, useEffect} from "react";
import { getMe } from "../api/axios";
import axios from "axios";


type User = {
  userId: number;
};

type AuthContextType = {
  user: User | null;
  setAuth: (userId: number) => void;
  setUserData: (data: User) => void;
  clearAuth: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null)
const AuthProvider = ({ children } : { children: React.ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const data = await getMe()
      
      setUser(data)
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 401) {
          setUser(null);
        } else {
          console.error(e.message);
        }
      } else {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    checkAuth()
  },[])

  const setAuth = (userId: number) => {
    setUser({ userId })
  }

  const setUserData = (data: User) => {
    setUser(data)
  }

  const clearAuth = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setAuth, setUserData, clearAuth, loading}}>
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

export default AuthProvider;