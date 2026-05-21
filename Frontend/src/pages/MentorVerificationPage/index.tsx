import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    fetchPendingMentorApplications,
    approveMentorApplication,
    rejectMentorApplication,
} from "../../api";
import "./style.css";

interface MentorApplicant {
    _id: string;
    name: string;
    email: string;
    year?: number;
    branch?: string;
    admissionYear?: number;
    collegeId?: string;
    skillsRaw?: string;
    linkedIn?: string;
    github?: string;
    verificationStatus: string;
}

const MentorVerificationPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [applicants, setApplicants] = useState<MentorApplicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetchPendingMentorApplications();
            setApplicants(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === "admin") load();
    }, [user?.role]);

    if (authLoading) return null;
    if (user?.role !== "admin") return <Navigate to="/home" replace />;

    const handleApprove = async (id: string) => {
        setBusyId(id);
        try {
            await approveMentorApplication(id);
            setApplicants((prev) => prev.filter((a) => a._id !== id));
        } catch {
            alert("Could not approve application");
        } finally {
            setBusyId(null);
        }
    };

    const handleReject = async (id: string) => {
        const reason = window.prompt("Rejection reason (optional):") || undefined;
        setBusyId(id);
        try {
            await rejectMentorApplication(id, reason);
            setApplicants((prev) => prev.filter((a) => a._id !== id));
        } catch {
            alert("Could not reject application");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="mentor-verify-page">
            <header className="mentor-verify-header">
                <div>
                    <span className="mentor-verify-badge">Admin · Faculty</span>
                    <h1>Senior Mentor Verification</h1>
                    <p>Review mentor applications. College ID and verification details are admin-only.</p>
                </div>
                <button type="button" className="mentor-verify-refresh" onClick={load}>
                    Refresh
                </button>
            </header>

            {loading ? (
                <p className="mentor-verify-empty">Loading applications…</p>
            ) : applicants.length === 0 ? (
                <p className="mentor-verify-empty">No pending mentor applications.</p>
            ) : (
                <div className="mentor-verify-grid">
                    {applicants.map((app) => (
                        <article key={app._id} className="mentor-verify-card glass">
                            <div className="mentor-verify-card-top">
                                <h2>{app.name}</h2>
                                <span className="status-pill pending">Pending Verification</span>
                            </div>
                            <p className="mentor-verify-email">{app.email}</p>

                            <div className="mentor-verify-public">
                                <span>Year {app.year}</span>
                                <span>{app.branch}</span>
                                <span>Adm. {app.admissionYear}</span>
                            </div>

                            <div className="mentor-verify-sensitive">
                                <h3>Verification details (admin only)</h3>
                                <p>
                                    <strong>College ID:</strong> {app.collegeId}
                                </p>
                                <p>
                                    <strong>Skills:</strong> {app.skillsRaw}
                                </p>
                                {app.linkedIn && (
                                    <p>
                                        <strong>LinkedIn:</strong> {app.linkedIn}
                                    </p>
                                )}
                                {app.github && (
                                    <p>
                                        <strong>GitHub:</strong> {app.github}
                                    </p>
                                )}
                            </div>

                            <div className="mentor-verify-actions">
                                <button
                                    type="button"
                                    className="btn-approve"
                                    disabled={busyId === app._id}
                                    onClick={() => handleApprove(app._id)}
                                >
                                    Approve Mentor
                                </button>
                                <button
                                    type="button"
                                    className="btn-reject"
                                    disabled={busyId === app._id}
                                    onClick={() => handleReject(app._id)}
                                >
                                    Reject
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MentorVerificationPage;
