import "./style.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Authfooter from "../../components/Authfooter";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

interface LoginData {
    email: string;
    password: string;
}

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    // CHANGE 1: Destructure setUser alongside setIsAuth
    const { setIsAuth, setUser } = useAuth();

    const [formData, setFormData] = useState<LoginData>({
        email: "",
        password: "",
    });

    const [error, setError] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            // CHANGE 2: Capture the response from the server
            const res = await api.post("/api/auth/login", {
                email: formData.email,
                password: formData.password,
            });

            // CHANGE 3: Update BOTH auth status and user data
            // res.data.user contains the name, email, and role from your backend
            setIsAuth(true);
            setUser(res.data.user);

            navigate("/home");
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid email or password");
        }
    };

    return (
        <div className="login-bg">
            <div className="login-top-bar">
                <h1 className="brand">Campus Connected</h1>
                <div className="top-actions">
                    <button onClick={() => navigate("/login")} className="top-btn">
                        Login
                    </button>
                    <button onClick={() => navigate("/register")} className="top-btn primary">
                        Sign Up
                    </button>
                </div>
            </div>

            <div className="login-center">
                <form className="auth-form login-card" onSubmit={handleLogin}>
                    <h2>Login</h2>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    {error && <p className="error-text">{error}</p>}

                    <button type="submit" className="login-btn">
                        Login
                    </button>
                </form>
            </div>

            <Authfooter />
        </div>
    );
};

export default LoginPage;