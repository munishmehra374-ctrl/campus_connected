import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../api";

// 1. Define what a User looks like
interface User {
    _id: string;
    name: string;
    email: string;
    role: "junior" | "senior" | "admin";
}

interface AuthContextType {
    isAuth: boolean;
    user: User | null; // Added user object
    setIsAuth: (value: boolean) => void;
    setUser: (user: User | null) => void; // Ability to update user manually
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuth, setIsAuth] = useState(false);
    const [user, setUser] = useState<User | null>(null); // New state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // 2. Call the profile route we just made
                const res = await api.get("/api/auth/profile");

                // res.data.user because your backend sends { user: { ... } }
                setUser(res.data.user);
                setIsAuth(true);
            } catch (error) {
                setUser(null);
                setIsAuth(false);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuth, user, setIsAuth, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};