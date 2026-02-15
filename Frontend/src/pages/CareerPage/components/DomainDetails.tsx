import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import SeniorAction from "../components/SeniorActions";
import "./style.css";

const DomainDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [domain, setDomain] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDomainDetails = useCallback(async () => {
        if (!id || id === "undefined") return;
        try {
            const res = await api.get(`/api/career/${id}`);
            setDomain(res.data);
        } catch (err) {
            console.error("Error fetching domain:", err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDomainDetails();
    }, [fetchDomainDetails]);

    const handleDeleteResource = async (e: React.MouseEvent, resourceId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm("Are you sure you want to delete this resource?")) return;

        try {
            await api.delete(`/api/career/${id}/resource/${resourceId}`);
            fetchDomainDetails();
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete resource.");
        }
    };

    const getResourceUrl = (path: string | undefined | null) => {
        if (!path) return "#";
        if (path.startsWith("http")) return path;
        return `http://localhost:5000${path}`;
    };

    if (loading) return <div className="loader">Loading...</div>;
    if (!domain) return <div className="error-msg">Domain not found.</div>;

    return (
        <div className="details-page-wrapper">
            <div className="details-container">
                {/* 1. ADMIN INFORMATION SECTION */}
                <header className="details-header" style={{ borderLeft: `6px solid ${domain.color || '#8b5cf6'}` }}>
                    <h1>{domain.title}</h1>
                    <p className="description-text">{domain.description}</p>
                    <div className="meta-bar">
                        <span><strong>Expected Duration:</strong> {domain.duration || "Flexible"}</span>
                        <span><strong>Demand:</strong> {domain.demand || "High"}</span>
                    </div>
                </header>

                {/* 2. ADMIN DATA: SKILLS */}
                {domain.skills?.length > 0 && (
                    <section className="details-section">
                        <h3>Core Skills to Master</h3>
                        <div className="skills-container">
                            {domain.skills.map((skill: string, i: number) => (
                                <span key={i} className="skill-pill">{skill}</span>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. ADMIN DATA: ROADMAP STEPS */}
                {domain.roadmap?.length > 0 && (
                    <section className="details-section">
                        <h3>Step-by-Step Learning Journey</h3>
                        <div className="roadmap-wrapper">
                            {domain.roadmap.map((step: string, i: number) => (
                                <div key={i} className="roadmap-card">
                                    <div className="step-circle">{i + 1}</div>
                                    <p className="step-content">{step}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 4. CURATED RESOURCES SECTION */}
                <section className="details-section">
                    <h3>Curated Resources</h3>
                    <div className="video-links-container">
                        {domain.resources?.length > 0 ? (
                            domain.resources.map((res: any) => (
                                <div key={res._id} className="resource-card-wrapper">
                                    <a
                                        href={getResourceUrl(res.url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="video-resource-card"
                                    >
                                        <div className="play-icon">
                                            {res.type === "video" ? "▶" : "📄"}
                                        </div>
                                        <div className="video-info">
                                            <h4>{res.title || "Untitled"}</h4>
                                            <p>{res.type === "video" ? "YouTube Video" : "PDF/Material"}</p>
                                        </div>
                                    </a>

                                    {(user?.role === "senior" || user?.role === "admin") && (
                                        <button
                                            className="delete-resource-btn"
                                            onClick={(e) => handleDeleteResource(e, res._id)}
                                            title="Delete Resource"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No additional resources added yet.</p>
                        )}
                    </div>
                </section>

                {/* SENIOR ACTIONS PANEL */}
                {user?.role === "senior" && (
                    <section className="senior-panel">
                        <h3>Contribute to this Pathway</h3>
                        <SeniorAction domainId={id!} onUpdate={fetchDomainDetails} />
                    </section>
                )}
            </div>
        </div>
    );
};

export default DomainDetails;