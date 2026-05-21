import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import {
    fetchSocietyById,
    toggleJoinSociety,
    assignSeniorLead,
    addWorkshopApi,
    deleteWorkshopApi,
    deleteSociety
} from "../../../../api";
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

            // Check membership (works if members array contains IDs or Objects)
            const members = res.data.members || [];
            setIsMember(members.some((m: any) => (typeof m === 'string' ? m : m._id) === user?._id));
        } catch (err) {
            console.error("Error loading society:", err);
            navigate("/societies");
        }
    };

    useEffect(() => {
        if (user) loadData();
    }, [id, user]);

    const handleJoinAction = async () => {
        try {
            await toggleJoinSociety(id!);
            loadData();
        } catch (err) {
            alert("Could not update membership status.");
        }
    };

    const handleDeleteSociety = async () => {
        if (window.confirm("Are you sure you want to disband this society? This action cannot be undone.")) {
            await deleteSociety(id!);
            navigate("/societies");
        }
    };

    if (!society) return <div className="loading">Loading Society Details...</div>;

    // --- PERMISSION LOGIC ---
    const isAdmin = user?.role === "admin";
    const isSenior = user?.role === "senior";
    const isJunior = user?.role === "junior";

    // Check if the current user is the actual assigned lead
    const isAssignedLead = isSenior && society.leadId?._id === user?._id;

    // Logic: Admins and Seniors can manage workshops
    const canManageWorkshops = isAdmin || isSenior;

    // Logic: Only Seniors can claim lead, and only if no lead is assigned
    const canClaimLead = isSenior && !society.leadId;

    return (
        <div className="dashboard-container">
            <header className="dash-header">
                <div>
                    <h1>{society.name}</h1>
                    <p className="member-count">👥 {society.members?.length || 0} Members</p>
                </div>
                <div className="header-actions">
                    {/* JUNIOR JOIN/LEAVE */}
                    {isJunior && (
                        <button onClick={handleJoinAction} className={isMember ? "leave-btn" : "join-btn"}>
                            {isMember ? "Leave Society" : "Join Society"}
                        </button>
                    )}

                    {/* SENIOR CLAIM LEADERSHIP */}
                    {canClaimLead && (
                        <button
                            onClick={async () => {
                                try {
                                    await assignSeniorLead(id!);
                                    loadData();
                                    alert("Success: You are now the Lead of this society!");
                                } catch (err: any) {
                                    const msg = err.response?.data?.message || "Failed to claim leadership";
                                    alert(msg);
                                }
                            }}
                            className="claim-btn"
                        >
                            Claim Lead
                        </button>
                    )}

                    {/* ADMIN DELETE SOCIETY */}
                    {isAdmin && (
                        <button onClick={handleDeleteSociety} className="del-society-btn">
                            Delete Society
                        </button>
                    )}
                </div>
            </header>

            <div className="dash-grid">
                {/* ABOUT SECTION */}
                <section className="about-box">
                    <h3>About</h3>
                    <p>{society.description}</p>
                    <div className="meta">
                        <span>
                            <strong>Lead:</strong> {society.leadId?.name || "No Senior Assigned"}
                        </span>
                        <span>
                            <strong>Category:</strong> {society.category}
                        </span>
                    </div>
                </section>

                {/* WORKSHOPS SECTION */}
                <section className="workshop-box">
                    <h3>🗓️ Upcoming Workshops</h3>

                    {/* FORM: Visible to Admins and Seniors */}
                    {canManageWorkshops && (
                        <form className="add-workshop-form" onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                await addWorkshopApi(id!, wsData);
                                setWsData({ title: "", body: "", date: "", time: "" });
                                loadData();
                                alert("Workshop scheduled successfully!");
                            } catch (err: any) {
                                const msg = err.response?.data?.message || "Error adding workshop. Check permissions.";
                                alert(msg);
                            }
                        }}>
                            <input
                                placeholder="Workshop Title"
                                value={wsData.title}
                                onChange={e => setWsData({ ...wsData, title: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Details & Location"
                                value={wsData.body}
                                onChange={e => setWsData({ ...wsData, body: e.target.value })}
                                required
                            />
                            <div className="form-row">
                                <input
                                    type="date"
                                    value={wsData.date}
                                    onChange={e => setWsData({ ...wsData, date: e.target.value })}
                                    required
                                />
                                <input
                                    type="time"
                                    value={wsData.time}
                                    onChange={e => setWsData({ ...wsData, time: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit">Schedule Workshop</button>
                        </form>
                    )}

                    {/* WORKSHOP LIST */}
                    <div className="ws-list">
                        {society.workshops && society.workshops.length > 0 ? (
                            society.workshops.map((ws: any) => (
                                <div key={ws._id} className="ws-card">
                                    <div className="ws-info">
                                        <h4>{ws.title}</h4>
                                        <p>{ws.body}</p>
                                    </div>
                                    <div className="ws-footer">
                                        <span>📅 {ws.date} | ⏰ {ws.time}</span>

                                        {/* DELETE: Admins and Seniors can delete */}
                                        {canManageWorkshops && (
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm("Delete this workshop?")) {
                                                        try {
                                                            await deleteWorkshopApi(id!, ws._id);
                                                            loadData();
                                                        } catch (err) {
                                                            alert("Failed to delete workshop.");
                                                        }
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
                        ) : (
                            <p className="empty-msg">No workshops scheduled yet.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SocietyDetail;