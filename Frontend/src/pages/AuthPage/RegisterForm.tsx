import "./style.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import api from "../../api";
import logo from "../../assets/logo.png";

type Role = "Junior" | "Senior" | "Admin";

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();

    const [role, setRole] = useState<Role>("Junior");
    const [year, setYear] = useState<number>(1);
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [error, setError] = useState<string>("");

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!name || !email || !password || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (role === "Senior" && (year < 3 || year > 4)) {
            setError("Only 3rd and 4th year students can register as Senior.");
            return;
        }

        try {
            const backendRole =
                role === "Junior" ? "junior" :
                    role === "Senior" ? "senior" :
                        "admin";

            await api.post("/api/auth/register", {
                name,
                email,
                password,
                role: backendRole,
                year: role === "Admin" ? null : year
            });

            navigate("/login");
        } catch (err: unknown) {
            const message =
                err && typeof err === "object" && "response" in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
            setError(message || "Registration failed");
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg" aria-hidden="true">
                <div className="auth-grid" />
                <div className="auth-blob auth-blob--1" />
                <div className="auth-blob auth-blob--2" />
                <div className="auth-blob auth-blob--3" />
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
                        className="auth-nav-btn"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        className="auth-nav-btn auth-nav-btn--primary auth-nav-btn--active"
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
                        <span>Join the community</span>
                    </div>
                    <h1 className="auth-hero-title">
                        Campus <span className="auth-gradient-text">Connected</span>
                    </h1>
                    <p className="auth-hero-tagline">Connect. Learn. Mentor. Grow.</p>
                    <p className="auth-hero-desc">
                        Create your account and start exploring mentorship, study resources,
                        campus events, and student societies tailored to your role.
                    </p>
                </section>

                <section className="auth-panel auth-fade-in auth-fade-in--delay">
                    <form
                        className="auth-glass-card auth-card--register auth-form"
                        onSubmit={handleRegister}
                    >
                        <div className="auth-card-header">
                            <div className="auth-card-icon">
                                <img src={logo} alt="Campus Connected" />
                            </div>
                            <h2 className="auth-card-title">Create Account</h2>
                            <p className="auth-card-subtitle">
                                Join your campus community today
                            </p>
                        </div>

                        <input
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <div className="form-group">
                            <label htmlFor="register-role">Register as</label>
                            <select
                                id="register-role"
                                value={role}
                                onChange={(e) => setRole(e.target.value as Role)}
                            >
                                <option value="Junior">Junior Student</option>
                                <option value="Senior">Senior Student</option>
                                <option value="Admin">Faculty (Admin)</option>
                            </select>
                        </div>

                        {role !== "Admin" && (
                            <div className="form-group">
                                <label htmlFor="register-year">Year of college</label>
                                <select
                                    id="register-year"
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                >
                                    <option value={1}>1st Year</option>
                                    <option value={2}>2nd Year</option>
                                    <option value={3}>3rd Year</option>
                                    <option value={4}>4th Year</option>
                                </select>
                            </div>
                        )}

                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        {error && <p className="error-text">{error}</p>}

                        <button type="submit" className="login-btn auth-submit">
                            Create Account
                        </button>

                        <p className="auth-switch">
                            Already have an account?{" "}
                            <button
                                type="button"
                                className="auth-switch-link"
                                onClick={() => navigate("/login")}
                            >
                                Sign in
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

export default RegisterPage;
