import { useState } from "react";
import { postPublicAnswer } from "../../../api";
import type { Question } from "../types";

interface Props {
    questionId: string;
    questionTitle: string;
    onClose: () => void;
    onSuccess: (updated: Question) => void;
}

const PublicAnswerModal = ({ questionId, questionTitle, onClose, onSuccess }: Props) => {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        setError("");
        try {
            const res = await postPublicAnswer(questionId, content.trim());
            onSuccess(res.data);
            onClose();
        } catch (err: unknown) {
            const msg =
                err && typeof err === "object" && "response" in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
            setError(msg || "Failed to post");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-form" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="badge">Public guidance</span>
                    <h2>Share your answer</h2>
                    <p className="modal-subtitle">
                        Question: <strong>{questionTitle}</strong>
                    </p>
                    <p className="modal-hint">
                        This reply is visible to everyone in the mentorship feed. The junior can open a private chat
                        with you to continue the conversation.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <textarea
                        className="modal-textarea"
                        placeholder="Your guidance (visible publicly)…"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={5}
                        required
                    />

                    {error && <p className="modal-error">{error}</p>}

                    <div className="modal-actions">
                        <button type="button" className="btn-outline btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-solid btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? "Posting…" : "Post public answer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PublicAnswerModal;
