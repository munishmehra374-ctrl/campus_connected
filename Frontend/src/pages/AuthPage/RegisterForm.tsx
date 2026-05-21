import "./style.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

type AccountType = "junior" | "senior_applicant" | "admin";

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { setIsAuth, setUser } = useAuth();

    const [accountType, setAccountType] = useState<AccountType>("junior");
    const [currentYear, setCurrentYear] = useState<number>(1);
    const [admissionYear, setAdmissionYear] = useState<number>(new Date().getFullYear() - 1);
    const [branch, setBranch] = useState("");
    const [collegeId, setCollegeId] = useState("");
    const [skills, setSkills] = useState("");
    const [linkedIn, setLinkedIn] = useState("");
    const [github, setGithub] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!name || !email || !password || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (accountType === "senior_applicant") {
            if (currentYear < 3 || currentYear > 4) {
                setError("Only 3rd and 4th year students are eligible for mentor access.");
                return;
            }
            if (!collegeId.trim() || !branch.trim() || !skills.trim()) {
                setError("College ID, branch, and skills are required for mentor applications.");
                return;
            }
        }

        try {
            const payload: Record<string, unknown> = {
                name,
                email,
                password,
                accountType,
            };

            if (accountType === "admin") {
                payload.role = "admin";
            } else if (accountType === "junior") {
                payload.role = "junior";
                payload.year = currentYear;
            } else {
                payload.role = "senior_applicant";
                payload.currentYear = currentYear;
                payload.admissionYear = admissionYear;
                payload.branch = branch.trim();
                payload.collegeId = collegeId.trim();
                payload.skills = skills.trim();
                payload.linkedIn = linkedIn.trim();
                payload.github = github.trim();
            }

            const res = await api.post("/api/auth/register", payload);
            const msg =
                res.data.message ||
                (accountType === "senior_applicant"
                    ? "Your mentor application is under review. You currently have junior access until verification is completed."
                    : "Account created successfully.");

            if (accountType === "senior_applicant" && res.data.user) {
                setIsAuth(true);
                setUser(res.data.user);
                navigate("/home", { state: { mentorPendingMessage: msg } });
                return;
            }

            if (accountType === "junior" && res.data.user) {
                setIsAuth(true);
                setUser(res.data.user);
                navigate("/home");
                return;
            }

            setSuccess(msg);
            setTimeout(() => navigate("/login", { state: { infoMessage: msg } }), 1500);
        } catch (err: unknown) {
            const message =
                err && typeof err === "object" && "response" in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
            setError(message || "Registration failed");
        }
    };

    const isSeniorApplicant = accountType === "senior_applicant";

    return (
        <div className="auth-page">
            <div className="auth-bg" aria-hidden="true">
                <div className="auth-grid" />
                <div className="auth-blob auth-blob--1" />
                <div className="auth-blob auth-blob--2" />
                <div className="auth-blob auth-blob--3" />
            </div>

            <header className="auth-navbar">
                <button type="button" className="auth-brand" onClick={() => navigate("/login")}>
                    <img src={logo} alt="" className="auth-brand-logo" />
                    <span>Campus Connected</span>
                </button>
                <div className="auth-nav-actions">
                    <button type="button" className="auth-nav-btn" onClick={() => navigate("/login")}>
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
                        Juniors join instantly. Senior applicants are verified by faculty before mentor
                        privileges unlock.
                    </p>
                </section>

                <section className="auth-panel auth-fade-in auth-fade-in--delay">
                    <form
                        className={`auth-glass-card auth-card--register auth-form ${isSeniorApplicant ? "auth-form--verify" : ""}`}
                        onSubmit={handleRegister}
                    >
                        <div className="auth-card-header">
                            <div className="auth-card-icon">
                                <img src={logo} alt="Campus Connected" />
                            </div>
                            <h2 className="auth-card-title">Create Account</h2>
                            <p className="auth-card-subtitle">Choose your account type to get started</p>
                        </div>

                        <input
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <div className="form-group">
                            <label htmlFor="register-account-type">Register as</label>
                            <select
                                id="register-account-type"
                                value={accountType}
                                onChange={(e) => setAccountType(e.target.value as AccountType)}
                            >
                                <option value="junior">Junior Student</option>
                                <option value="senior_applicant">Senior Applicant (Mentor)</option>
                                <option value="admin">Faculty (Admin)</option>
                            </select>
                        </div>

                        {accountType !== "admin" && (
                            <div className="form-group">
                                <label htmlFor="register-current-year">Current year</label>
                                <select
                                    id="register-current-year"
                                    value={currentYear}
                                    onChange={(e) => setCurrentYear(Number(e.target.value))}
                                >
                                    <option value={1}>1st Year</option>
                                    <option value={2}>2nd Year</option>
                                    <option value={3}>3rd Year</option>
                                    <option value={4}>4th Year</option>
                                </select>
                            </div>
                        )}

                        {isSeniorApplicant && (
                            <div className="auth-verification-block">
                                <p className="auth-verification-title">Mentor verification details</p>
                                {currentYear < 3 || currentYear > 4 ? (
                                    <p className="auth-validation-warn" role="alert">
                                        Only 3rd and 4th year students are eligible for mentor access.
                                    </p>
                                ) : (
                                    <p className="auth-verification-hint">
                                        Your application will be reviewed after signup. Until approved, you
                                        have junior-level access.
                                    </p>
                                )}

                                <input
                                    placeholder="College ID *"
                                    value={collegeId}
                                    onChange={(e) => setCollegeId(e.target.value)}
                                    required
                                />
                                <div className="auth-form-row-2">
                                    <div className="form-group">
                                        <label htmlFor="admission-year">Admission year</label>
                                        <input
                                            id="admission-year"
                                            type="number"
                                            min={2015}
                                            max={2030}
                                            value={admissionYear}
                                            onChange={(e) => setAdmissionYear(Number(e.target.value))}
                                            required
                                        />
                                    </div>
                                    <input
                                        placeholder="Branch / Department *"
                                        value={branch}
                                        onChange={(e) => setBranch(e.target.value)}
                                        required
                                    />
                                </div>
                                <textarea
                                    className="auth-textarea"
                                    placeholder="Skills / Expertise * (e.g. React, DSA, ML)"
                                    rows={3}
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                    required
                                />
                                <input
                                    placeholder="LinkedIn (optional)"
                                    value={linkedIn}
                                    onChange={(e) => setLinkedIn(e.target.value)}
                                />
                                <input
                                    placeholder="GitHub (optional)"
                                    value={github}
                                    onChange={(e) => setGithub(e.target.value)}
                                />
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
                        {success && <p className="auth-success-text">{success}</p>}

                        <button type="submit" className="login-btn auth-submit">
                            {isSeniorApplicant ? "Submit Mentor Application" : "Create Account"}
                        </button>

                        <p className="auth-switch">
                            Already have an account?{" "}
                            <button type="button" className="auth-switch-link" onClick={() => navigate("/login")}>
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
