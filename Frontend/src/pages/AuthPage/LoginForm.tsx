import "./style.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Sparkles } from "lucide-react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

interface LoginData {
    email: string;
    password: string;
}

const FEATURES = ["Mentorship", "Resources", "Events", "Communities"];

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setIsAuth, setUser } = useAuth();

    const [formData, setFormData] = useState<LoginData>({
        email: "",
        password: "",
    });

    const [error, setError] = useState<string>("");
    const [infoMessage, setInfoMessage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const state = location.state as { infoMessage?: string } | null;
        if (state?.infoMessage) {
            setInfoMessage(state.infoMessage);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setInfoMessage("");
        setIsSubmitting(true);

        try {
            const res = await api.post("/api/auth/login", {
                email: formData.email,
                password: formData.password,
            });

            setIsAuth(true);
            setUser(res.data.user);
            if (res.data.message && res.data.message !== "Login successful") {
                setInfoMessage(res.data.message);
            }
            navigate("/home");
        } catch (err: unknown) {
            const message =
                err && typeof err === "object" && "response" in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
            setError(message || "Invalid email or password");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg" aria-hidden="true">
                <div className="auth-grid" />
                <div className="auth-blob auth-blob--1" />
                <div className="auth-blob auth-blob--2" />
                <div className="auth-blob auth-blob--3" />
                <div className="auth-orb auth-orb--1" />
                <div className="auth-orb auth-orb--2" />
            </div>

            <header className="auth-navbar">
                <button
                    type="button"
                    className="auth-brand"
                    onClick={() => navigate("/login")}
                >
                    <img src={logo} alt="" className="auth-brand-logo" />
                    <span>Campus Connected</span>
                </button>

                <div className="auth-nav-actions">
                    <button
                        type="button"
                        className="auth-nav-btn auth-nav-btn--active"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        className="auth-nav-btn auth-nav-btn--primary"
                        onClick={() => navigate("/register")}
                    >
                        Sign Up
                    </button>
                </div>
            </header>

            <div className="auth-split">
                <section className="auth-hero auth-fade-in">
                    <div className="auth-hero-badge">
                        <Sparkles size={14} />
                        <span>Your campus, connected</span>
                    </div>

                    <h1 className="auth-hero-title">
                        Campus <span className="auth-gradient-text">Connected</span>
                    </h1>

                    <p className="auth-hero-tagline">Connect. Learn. Mentor. Grow.</p>

                    <p className="auth-hero-desc">
                        A unified platform where students collaborate through mentorship,
                        shared resources, campus events, and vibrant communities — all in one place.
                    </p>

                    <ul className="auth-feature-pills">
                        {FEATURES.map((feature) => (
                            <li key={feature}>{feature}</li>
                        ))}
                    </ul>
                </section>

                <section className="auth-panel auth-fade-in auth-fade-in--delay">
                    <form className="auth-glass-card" onSubmit={handleLogin} noValidate>
                        <div className="auth-card-header">
                            <div className="auth-card-icon">
                                <img src={logo} alt="Campus Connected" />
                            </div>
                            <h2 className="auth-card-title">Welcome Back</h2>
                            <p className="auth-card-subtitle">
                                Sign in to access your dashboard
                            </p>
                        </div>

                        <div className="auth-fields">
                            <label className="auth-field" htmlFor="login-email">
                                <span className="auth-field-label">Email</span>
                                <div className="auth-input-wrap">
                                    <Mail className="auth-input-icon" size={18} strokeWidth={2} />
                                    <input
                                        id="login-email"
                                        type="email"
                                        name="email"
                                        placeholder="you@university.edu"
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </label>

                            <label className="auth-field" htmlFor="login-password">
                                <span className="auth-field-label">Password</span>
                                <div className="auth-input-wrap">
                                    <Lock className="auth-input-icon" size={18} strokeWidth={2} />
                                    <input
                                        id="login-password"
                                        type="password"
                                        name="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        autoComplete="current-password"
                                        required
                                    />
                                </div>
                            </label>
                        </div>

                        <div className="auth-forgot-row">
                            <button
                                type="button"
                                className="auth-forgot-link"
                                onClick={() =>
                                    setInfoMessage(
                                        "Password reset is coming soon. Contact your admin."
                                    )
                                }
                            >
                                Forgot password?
                            </button>
                        </div>

                        {infoMessage && (
                            <p className="auth-info" role="status">
                                {infoMessage}
                            </p>
                        )}

                        {error && (
                            <p className="auth-error" role="alert">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Signing in…" : "Sign In"}
                        </button>

                        <p className="auth-switch">
                            Don&apos;t have an account?{" "}
                            <button
                                type="button"
                                className="auth-switch-link"
                                onClick={() => navigate("/register")}
                            >
                                Create account
                            </button>
                        </p>
                    </form>
                </section>
            </div>

            <footer className="auth-page-footer">
                <span>© 2026 Campus Connected</span>
            </footer>
        </div>
    );
};

export default LoginPage;
