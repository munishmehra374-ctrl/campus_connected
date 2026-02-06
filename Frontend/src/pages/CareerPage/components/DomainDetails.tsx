import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import SeniorAction from "../components/SeniorActions";
import "./style.css";

const DomainDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [domain, setDomain] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDomainDetails = useCallback(async () => {
        if (!id || id === "undefined") {
            console.error("Invalid domain ID");
            setLoading(false);
            return;
        }

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

    const getResourceUrl = (path: string | undefined | null) => {
        if (!path) return "#";
        if (path.startsWith("http")) return path;
        return `http://localhost:5000${path}`;
    };

    if (loading) {
        return (
            <div className="loader-container">
                <div className="loader"></div>
            </div>
        );
    }

    if (!domain) {
        return (
            <div className="error-msg">
                Domain not found. Please go back and try again.
            </div>
        );
    }

    return (
        <div className="details-page-wrapper">
            <div className="details-container">

                {/* HEADER */}
                <header className="details-header">
                    <h1>{domain.title}</h1>
                    <p>{domain.description}</p>
                </header>

                {/* ROADMAP */}
                <section className="details-section">
                    <h3>Roadmap</h3>

                    <div className="vertical-roadmap">
                        {domain.roadmap?.length > 0 ? (
                            domain.roadmap.map((step: string, i: number) => (
                                <div key={i} className="roadmap-item">
                                    <span
                                        className="roadmap-dot"
                                        style={{ background: domain.color || "#8b5cf6" }}
                                    ></span>
                                    <span>{step}</span>
                                </div>
                            ))
                        ) : (
                            <p>No roadmap added yet.</p>
                        )}
                    </div>
                </section>

                {/* RESOURCES */}
                <section className="details-section">
                    <h3>Curated Resources</h3>

                    <div className="video-links-container">
                        {domain.resources?.length > 0 ? (
                            domain.resources.map((res: any, i: number) => {
                                if (!res || !res.url) return null;

                                return (
                                    <a
                                        key={i}
                                        href={getResourceUrl(res.url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="video-resource-card"
                                    >
                                        <div className="play-icon">
                                            {res.type === "video" ? "▶" : "📄"}
                                        </div>

                                        <div className="video-info">
                                            <h4>{res.title || "Untitled Resource"}</h4>
                                            <p>{res.type === "video" ? "YouTube" : "PDF"}</p>
                                        </div>
                                    </a>
                                );
                            })
                        ) : (
                            <p>No resources yet.</p>
                        )}
                    </div>
                </section>

                {/* UPLOAD PANEL (MOVED DOWN) */}
                {(user?.role === "senior") && id && (
                    <section className="senior-panel">
                        <h3>Upload Resource</h3>
                        <SeniorAction domainId={id} onUpdate={fetchDomainDetails} />
                    </section>
                )}

            </div>
        </div>
    );
};

export default DomainDetails;
