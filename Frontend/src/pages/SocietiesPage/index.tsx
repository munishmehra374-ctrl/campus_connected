import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchSocieties } from "../../api";
import SocietyList from "./components/SocietyList";
import "./style.css";

const SocietiesPage = () => {
    const [societies, setSocieties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const loadSocieties = async () => {
            try {
                const res = await fetchSocieties();
                setSocieties(res.data);
            } catch (err) {
                console.error("Error fetching societies:", err);
            } finally {
                setLoading(false);
            }
        };
        loadSocieties();
    }, []);

    const canCreate = user?.role === "admin";
    const isSeniorAssigned = societies.some(s => s.leadId?._id === user?._id);

    return (
        <div className="societies-page">
            <section className="societies-hero">
                <div className="hero-content">
                    <span className="badge">👥 Society Hub</span>
                    <div className="hero-header-flex">
                        <h1>Campus Societies & Clubs</h1>
                        {canCreate && (
                            <button
                                className="create-society-btn"
                                onClick={() => navigate("/societies/create")}
                            >
                                + Create Society
                            </button>
                        )}
                    </div>
                    <p>
                        {user?.role === "senior" && isSeniorAssigned
                            ? "You are currently managing a society dashboard."
                            : "Discover student-run societies and stay updated with campus life."}
                    </p>
                </div>
            </section>

            <div className="societies-container">
                {loading ? (
                    <div className="loader">
                        <div className="spinner"></div>
                        <p>Fetching Societies...</p>
                    </div>
                ) : (
                    <>
                        <div className="list-header">
                            <h2>All Societies</h2>
                            <span className="count-badge">{societies.length} Found</span>
                        </div>

                        <SocietyList societies={societies} />
                    </>
                )}
            </div>
        </div>
    );
};

export default SocietiesPage;