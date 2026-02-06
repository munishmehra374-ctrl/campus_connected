import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api";
import CareerCard from "./components/index"; // Pointing to the updated Card component
import CareerModal from "./components/CareerModal"; // Pointing to the simplified Admin modal
import type { CareerDomain } from "./data";
import "./style.css";

const CareerPage: React.FC = () => {
    const { user } = useAuth();
    const [domains, setDomains] = useState<CareerDomain[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all domains from backend
    const fetchDomains = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get("/api/career");
            // Sorting newest first 
            const sortedData = res.data.sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setDomains(sortedData);
        } catch (err) {
            console.error("Failed to load career domains:", err);
            setError("Unable to load career pathways. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDomains();
    }, []);

    return (
        <div className="career-page">
            {/* 1. Header Section */}
            <header className="career-header">
                <div className="header-content">
                    <span className="subtitle">Level Up Your Future</span>
                    <h1>Career Roadmap Library</h1>
                    <p className="description">
                        Explore curated pathways, master essential skills, and get
                        insider advice from industry seniors.
                    </p>

                    {/* Only Admins see the Create button for new shells */}
                    {user?.role === "admin" && (
                        <button
                            className="add-main-btn"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <span className="plus-icon">+</span> Create New Pathway
                        </button>
                    )}
                </div>
            </header>

            {/* 2. Main Content Area */}
            <main className="career-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="loader-spinner"></div>
                        <p>Synthesizing roadmaps...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <p>{error}</p>
                        <button className="retry-btn" onClick={fetchDomains}>Retry</button>
                    </div>
                ) : domains.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <h3>No pathways found.</h3>
                        <p>Admins haven't added any career domains yet.</p>
                    </div>
                ) : (
                    <div className="career-grid">
                        {domains.map((domain) => (
                            <CareerCard
                                key={domain._id}
                                domain={domain}
                                fetchDomains={fetchDomains}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* 3. Modal Overlay for Admin Creation */}
            {isModalOpen && (
                <CareerModal
                    closeModal={() => setIsModalOpen(false)}
                    refreshData={fetchDomains}
                />
            )}
        </div>
    );
};

export default CareerPage;