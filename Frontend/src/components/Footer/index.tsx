import "./style.css";

const Footer = () => {
    return (
        <>
            {/* Curved glowing line (Netflix style) */}
            <div className="footer-curve"></div>

            <footer className="footer">
                <div className="footer-top">
                    <div className="footer-brand">
                        <h2>Campus Connected</h2>
                        <p>
                            Bridging generations of students through shared knowledge,
                            mentorship, and community. Preserving the culture of academic
                            inheritance.
                        </p>

                        <div className="footer-socials">
                            <span>🐦</span>
                            <span>💼</span>
                            <span>📷</span>
                        </div>
                    </div>

                    <div className="footer-links">
                        <h3>Quick Links</h3>
                        <ul>
                            <li>Resource Hub</li>
                            <li>Mentorship</li>
                            <li>Events</li>
                            <li>Career Guidance</li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h3>Support</h3>
                        <ul>
                            <li>Help Center</li>
                            <li>Contact Us</li>
                            <li>Privacy Policy</li>
                            <li>Terms of Service</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2024 Campus Connected. All rights reserved.</p>
                    <p>Made with ❤️ for students everywhere</p>
                </div>
            </footer>
        </>
    );
};

export default Footer;
