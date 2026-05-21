import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./style.css";

const MentorStatusBanner = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    if (user.role === "admin") {
        return (
            <div className="mentor-status-banner mentor-status-banner--admin">
                <span>Faculty admin tools</span>
                <button type="button" onClick={() => navigate("/mentor-verifications")}>
                    Review mentor applications →
                </button>
            </div>
        );
    }

    if (user.verificationStatus === "pending_verification" || user.isSeniorApplicant) {
        return (
            <div className="mentor-status-banner mentor-status-banner--pending">
                <span className="mentor-status-pill">Pending Mentor Verification</span>
                <p>
                    Your mentor application is under review. You currently have junior access until
                    verification is completed.
                </p>
            </div>
        );
    }

    if (user.role === "senior" && user.mentorVerified) {
        return (
            <div className="mentor-status-banner mentor-status-banner--verified">
                <span className="mentor-status-pill verified">Verified Mentor</span>
            </div>
        );
    }

    return null;
};

export default MentorStatusBanner;
