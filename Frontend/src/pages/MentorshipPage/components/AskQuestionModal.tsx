import { useState } from "react";
import api from "../../../api";
import type { Question } from "../types";

interface Props {
    onClose: () => void;
    onSuccess?: (question?: Question) => void;
}

const AskQuestionModal = ({ onClose, onSuccess }: Props) => {
    const [formData, setFormData] = useState({ title: "", description: "", tags: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await api.post("/api/questions", {
                title: formData.title.trim(),
                description: formData.description.trim(),
                tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
            });
            onSuccess?.(res.data);
            onClose();
        } catch (err: unknown) {
            const msg =
                err && typeof err === "object" && "response" in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data
                          ?.message
                    : undefined;
            setError(msg || "Failed to post question.");
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
                    Your question appears immediately — seniors and admins can answer right away.
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
                    {error && <p className="modal-error">{error}</p>}
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
