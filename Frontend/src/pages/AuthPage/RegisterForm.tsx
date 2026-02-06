import "./style.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Authfooter from "../../components/Authfooter";
import api from "../../api";

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

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Student-specific validation (Year logic)
        if (role === "Senior" && (year < 3 || year > 4)) {
            setError("Only 3rd and 4th year students can register as Senior.");
            return;
        }

        try {
            // Convert role to backend format
            const backendRole =
                role === "Junior" ? "junior" :
                    role === "Senior" ? "senior" :
                        "admin";

            await api.post("/api/auth/register", {
                name,
                email,
                password,
                role: backendRole,
                // Facultiy/Admin doesn't need a college year
                year: role === "Admin" ? null : year
            });

            navigate("/login");
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed");
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
                {/* Applied the 'register-card' for extra width to fit the form-groups */}
                <form className="auth-form login-card register-card" onSubmit={handleRegister}>
                    <h2>Register</h2>

                    <input
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    {/* ROLE SELECTOR - Now with label styling */}
                    <div className="form-group">
                        <label>Register As:</label>
                        <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                            <option value="Junior">Junior Student</option>
                            <option value="Senior">Senior Student</option>
                            <option value="Admin">Faculty (Admin)</option>
                        </select>
                    </div>

                    {/* CONDITIONAL RENDERING: Year is hidden for Admin/Faculty */}
                    {role !== "Admin" && (
                        <div className="form-group">
                            <label>Year of College:</label>
                            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
                                <option value={1}>1st Year</option>
                                <option value={2}>2nd Year</option>
                                <option value={3}>3rd Year</option>
                                <option value={4}>4th Year</option>
                            </select>
                        </div>
                    )}

                    <input
                        type="email"
                        placeholder="Email Address"
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
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    {error && <p className="error-text">{error}</p>}

                    <button type="submit" className="login-btn">
                        Create Account
                    </button>
                </form>
            </div>

            <Authfooter />
        </div>
    );
};

export default RegisterPage;