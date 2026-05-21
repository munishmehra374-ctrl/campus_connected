import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./style.css";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // CHANGE 1: Pull 'user' and 'setUser' from your AuthContext
    const { isAuth, setIsAuth, setUser, user, loading } = useAuth();

    const [showConfirm, setShowConfirm] = useState(false);

    const links = [
        { name: "Home", path: "/home" },
        { name: "Resources", path: "/resources" },
        { name: "Mentorship", path: "/mentorship" },
        { name: "Campus Hub", path: "/campus-hub" },
        { name: "Career", path: "/career" },
    ];

    const handleLogout = async () => {
        try {
            await api.post("/api/auth/logout");
            setIsAuth(false);
            // CHANGE 2: Wipe user data from state on logout
            setUser(null); 
            setShowConfirm(false);
            navigate("/login");
        } catch (err) {
            console.error("Logout failed", err);
            setIsAuth(false);
            setUser(null);
            setShowConfirm(false);
            navigate("/login");
        }
    };

    if (loading) return null;

    return (
        <>
            <nav className="navbar">
                <div className="logo" onClick={() => navigate("/home")}>
                    <img src={logo} alt="logo" className="logo-img" />
                    <span>Campus Connected</span>
                </div>

                <ul className="nav-links">
                    {links.map((link) => {
                        const isActive =
                            location.pathname === link.path ||
                            (link.path === "/campus-hub" &&
                                (location.pathname.startsWith("/campus-hub") ||
                                    location.pathname.startsWith("/events") ||
                                    location.pathname.startsWith("/societies")));
                        return (
                        <li
                            key={link.name}
                            className={isActive ? "nav-item active-link" : "nav-item"}
                            onClick={() => navigate(link.path)}
                        >
                            {link.name}
                        </li>
                        );
                    })}
                </ul>

                <div className="nav-actions">
                    {!isAuth ? (
                        <>
                            <button className="login-btn" onClick={() => navigate("/login")}>
                                Login
                            </button>
                            <button className="get-started-btn" onClick={() => navigate("/register")}>
                                Register
                            </button>
                        </>
                    ) : (
                        // CHANGE 3: Display the user's name and a role-based badge
                        <div className="user-nav-container">
                            <div className="user-profile-info">
                                <span className="user-greeting">Hi, {user?.name}</span>
                                <span className={`role-tag ${user?.role}`}>
                                    {user?.role}
                                </span>
                            </div>
                            <button className="logout-trigger-btn" onClick={() => setShowConfirm(true)}>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {showConfirm && (
                <div className="logout-overlay" onClick={() => setShowConfirm(false)}>
                    <div className="logout-card" onClick={(e) => e.stopPropagation()}>
                        <div className="logout-emoji">👋</div>
                        <h3>See you soon!</h3>
                        <p>Are you sure you want to log out, <strong>{user?.name}</strong>?</p>
                        <div className="logout-modal-btns">
                            <button className="confirm-logout-btn" onClick={handleLogout}>Logout</button>
                            <button className="cancel-logout-btn" onClick={() => setShowConfirm(false)}>Stay</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;