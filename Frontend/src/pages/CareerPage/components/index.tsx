import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import AdminControl from "./AdminControls";
import type { CareerDomain } from "../data";
import "../style.css";

interface CareerCardProps {
    domain: CareerDomain;
    fetchDomains: () => void;
}

const CareerCard: React.FC<CareerCardProps> = ({ domain, fetchDomains }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const accentColor = domain.color || "#8b5cf6";

    const handleCardClick = () => {
        navigate(`/career/${domain._id}`);
    };

    return (
        <div
            className="career-card"
            onClick={handleCardClick}
            style={{ cursor: "pointer" }}
        >
            <div
                className="career-left"
                style={{ borderLeft: `6px solid ${accentColor}` }}
            >
                <span
                    className="badge"
                    style={{ color: accentColor, borderColor: accentColor }}
                >
                    {domain.demand}
                </span>

                <h2>{domain.title}</h2>
                <p className="duration">⏱ {domain.duration}</p>

                <div className="resource-count">
                    📚 {domain.resources?.length || 0} Resources
                </div>

                <p className="view-more">View Details →</p>

                {/* ADMIN DELETE BUTTON */}
                {user?.role === "admin" && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <AdminControl
                            domainId={domain._id}
                            onUpdate={fetchDomains}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CareerCard;
