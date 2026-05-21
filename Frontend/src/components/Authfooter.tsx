import "./authfooter.css";

const AuthFooter = () => {
    return (
        <footer className="auth-footer">
            <div className="auth-footer-content">
                <span>© 2026 Campus Connected</span>
                <span className="auth-footer-dot" aria-hidden="true">
                    ·
                </span>
                <span>support@campusconnected.com</span>
            </div>
        </footer>
    );
};

export default AuthFooter;
