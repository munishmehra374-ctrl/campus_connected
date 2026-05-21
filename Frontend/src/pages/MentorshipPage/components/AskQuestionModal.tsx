import { useState } from "react";
import api from "../../../api";

interface Props {
    onClose: () => void;
    onSuccess?: () => void;
}

const AskQuestionModal = ({ onClose, onSuccess }: Props) => {
    const [formData, setFormData] = useState({ title: "", description: "", tags: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/api/questions", {
                title: formData.title,
                description: formData.description,
                tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
            });
            onSuccess?.();
            onClose();
        } catch {
            alert("Failed to post.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-form" onClick={(e) => e.stopPropagation()}>
                <span className="badge">New Discussion</span>
                <h2>Ask the Community</h2>
                <p className="modal-hint">
                    Seniors can each start their own mentorship thread on your question.
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="modal-input"
                        placeholder="Question title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                    <textarea
                        className="modal-textarea"
                        placeholder="Describe your question in detail…"
                        rows={6}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        className="modal-input"
                        placeholder="Tags (DSA, Placements, React)"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                    <div className="modal-actions">
                        <button type="submit" className="mini-btn answer-btn" disabled={loading}>
                            {loading ? "Posting…" : "Post Question"}
                        </button>
                        <button type="button" className="mini-btn danger" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AskQuestionModal;
