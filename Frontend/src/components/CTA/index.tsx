import "./style.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CTA = () => {
    const navigate = useNavigate();
    const { isAuth } = useAuth();

    if (isAuth) {
        return (
            <section className="cta">
                <div className="cta-content">
                    <h2>Ready to Explore Campus Opportunities?</h2>
                    <p>
                        Discover workshops, hackathons, mentorship, resources, and career guidance
                        tailored for students.
                    </p>
                    <button type="button" onClick={() => navigate("/campus-hub")}>
                        Explore Campus Hub
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="cta">
            <div className="cta-content">
                <h2>Ready to Get Connected?</h2>
                <p>
                    Join thousands of students who are already building stronger academic
                    communities through Campus Connected.
                </p>
                <button type="button" onClick={() => navigate("/register")}>
                    Get Started for Free
                </button>
            </div>
        </section>
    );
};

export default CTA;
