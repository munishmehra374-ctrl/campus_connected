import { useState } from "react";
import api from "../../../api";
import { useAuth } from "../../../context/AuthContext";

interface AnswerModalProps {
    questionId: string;
    questionTitle: string;
    onClose: () => void;
}

const AnswerModal = ({ questionId, questionTitle, onClose }: AnswerModalProps) => {
    const { user } = useAuth();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            await api.post(`/api/questions/${questionId}/answer`, {
                content,
                seniorName: user?.name // Sending the Senior's name
            });
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("Failed to submit answer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-form">
                <div className="modal-header">
                    <h2>Provide Guidance</h2>
                    <p className="modal-subtitle">Answering: <strong>{questionTitle}</strong></p>
                </div>

                <form onSubmit={handleSubmit}>
                    <textarea
                        className="modal-textarea"
                        placeholder="Share your experience and advice..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-outline btn-cancel"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-solid btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Posting..." : "Post Guidance"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AnswerModal; // Check this line for the "AnswerMo" typo!