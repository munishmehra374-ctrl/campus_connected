import React, { useState } from "react";
import api from "../../../api";

interface AdminControlsProps {
    domainId: string;
    onUpdate: () => void;
}

const AdminControls: React.FC<AdminControlsProps> = ({ domainId, onUpdate }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        // Stop propagation prevents the card's 'onClick' (navigate to details) from firing
        e.stopPropagation();

        const confirmDelete = window.confirm(
            "Are you sure? This will permanently delete this career pathway and all its resources."
        );

        if (confirmDelete) {
            setIsDeleting(true);
            try {
                await api.delete(`/api/career/${domainId}`);
                onUpdate();
            } catch (err) {
                console.error("Delete failed:", err);
                alert("Failed to delete the domain. Please try again.");
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <div className="admin-controls-wrapper" onClick={(e) => e.stopPropagation()}>
            <button
                className={`delete-card-btn ${isDeleting ? "loading" : ""}`}
                onClick={handleDelete}
                disabled={isDeleting}
            >
                {isDeleting ? "Deleting..." : "Delete"}
            </button>
        </div>
    );
};

export default AdminControls;