import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../api";

export interface AuthUser {
    _id: string;
    name: string;
    email: string;
    role: "junior" | "senior" | "admin";
    year?: number;
    branch?: string;
    admissionYear?: number;
    appliedRole?: "none" | "senior";
    verificationStatus?: "none" | "pending_verification" | "approved" | "rejected";
    mentorVerified?: boolean;
    isSeniorApplicant?: boolean;
    skills?: string[];
}

interface AuthContextType {
    isAuth: boolean;
    user: AuthUser | null;
    setIsAuth: (value: boolean) => void;
    setUser: (user: AuthUser | null) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuth, setIsAuth] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get("/api/auth/profile");
                setUser(res.data.user);
                setIsAuth(true);
            } catch {
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

export function isVerifiedSeniorUser(user: AuthUser | null): boolean {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (user.role !== "senior") return false;
    return Boolean(user.mentorVerified);
}
