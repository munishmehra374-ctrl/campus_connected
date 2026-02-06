import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { fetchSocietyById, toggleJoinSociety, assignSeniorLead, addWorkshopApi, deleteWorkshopApi, deleteSociety } from "../../../../api";
import "./detail.css";

const SocietyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [society, setSociety] = useState<any>(null);
    const [wsData, setWsData] = useState({ title: "", body: "", date: "", time: "" });
    const [isMember, setIsMember] = useState(false);

    const loadData = async () => {
        try {
            const res = await fetchSocietyById(id!);
            setSociety(res.data);
            // Check membership (backend usually returns IDs or Objects in members array)
            const members = res.data.members || [];
            setIsMember(members.some((m: any) => (typeof m === 'string' ? m : m._id) === user?._id));
        } catch (err) { navigate("/societies"); }
    };

    useEffect(() => { if (user) loadData(); }, [id, user]);

    const handleJoinAction = async () => {
        await toggleJoinSociety(id!);
        loadData();
    };

    const handleDeleteSociety = async () => {
        if (window.confirm("Disband this society?")) {
            await deleteSociety(id!);
            navigate("/societies");
        }
    };

    if (!society) return <div className="loading">Loading...</div>;

    const isLead = (user?.role === "senior" && society.leadId?._id === user?._id) || user?.role === "admin";
    const canClaimLead = user?.role === "senior" && !society.leadId;

    return (
        <div className="dashboard-container">
            <header className="dash-header">
                <div>
                    <h1>{society.name}</h1>
                    <p className="member-count">👥 {society.members?.length || 0} Members</p>
                </div>
                <div className="header-actions">
                    {/* JUNIOR VIEW */}
                    {user?.role === "junior" && (
                        <button onClick={handleJoinAction} className={isMember ? "leave-btn" : "join-btn"}>
                            {isMember ? "Leave Society" : "Join Society"}
                        </button>
                    )}

                    {/* SENIOR VIEW - Updated with error handling */}
                    {canClaimLead && (
                        <button
                            onClick={async () => {
                                try {
                                    await assignSeniorLead(id!);
                                    loadData();
                                    alert("Success: You are now the Lead of this society!");
                                } catch (err: any) {
                                    // This extracts the "Already leading a society" message from your backend
                                    const msg = err.response?.data?.message || "Failed to claim leadership";
                                    alert(msg);
                                }
                            }}
                            className="claim-btn"
                        >
                            Claim Lead
                        </button>
                    )}

                    {/* ADMIN VIEW */}
                    {user?.role === "admin" && <button onClick={handleDeleteSociety} className="del-society-btn">Delete Society</button>}
                </div>
            </header>

            <div className="dash-grid">
                <section className="about-box">
                    <h3>About</h3>
                    <p>{society.description}</p>
                    <div className="meta">
                        <span><strong>Lead:</strong> {society.leadId?.name || "No Senior Assigned"}</span>
                        <span><strong>Category:</strong> {society.category}</span>
                    </div>
                </section>

                <section className="workshop-box">
                    <h3>🗓️ Workshops</h3>
                    {isLead && (
                        <form className="add-workshop-form" onSubmit={async (e) => {
                            e.preventDefault();
                            await addWorkshopApi(id!, wsData);
                            setWsData({ title: "", body: "", date: "", time: "" });
                            loadData();
                        }}>
                            <input placeholder="Workshop Title" value={wsData.title} onChange={e => setWsData({ ...wsData, title: e.target.value })} required />
                            <textarea placeholder="Details" value={wsData.body} onChange={e => setWsData({ ...wsData, body: e.target.value })} required />
                            <div className="form-row">
                                <input type="date" value={wsData.date} onChange={e => setWsData({ ...wsData, date: e.target.value })} required />
                                <input type="time" value={wsData.time} onChange={e => setWsData({ ...wsData, time: e.target.value })} required />
                            </div>
                            <button type="submit">Schedule Workshop</button>
                        </form>
                    )}

                    <div className="ws-list">
                        {society.workshops?.length > 0 ? (
                            society.workshops.map((ws: any) => (
                                <div key={ws._id} className="ws-card">
                                    <h4>{ws.title}</h4>
                                    <p>{ws.body}</p>
                                    <div className="ws-footer">
                                        <span>📅 {ws.date} | ⏰ {ws.time}</span>
                                        {isLead && (
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm("Delete workshop?")) {
                                                        await deleteWorkshopApi(id!, ws._id);
                                                        loadData();
                                                    }
                                                }}
                                                className="del-btn"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : <p className="empty-msg">No workshops scheduled yet.</p>}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SocietyDetail;