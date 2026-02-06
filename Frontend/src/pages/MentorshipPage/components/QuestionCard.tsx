import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api";
import AnswerModal from "./AnswerModal";

const QuestionCard = ({ question }: { question: any }) => {
    const { user }: any = useAuth();
    const [showAnswerModal, setShowAnswerModal] = useState(false);
    const [isResolving, setIsResolving] = useState(false);

    const userRole = user?.role?.toLowerCase();
    const isAuthor = user?._id === question.author?.id;
    const hasAnswers = question.answers && question.answers.length > 0;

    const handleApprove = async () => {
        try { await api.patch(`/api/questions/${question._id}/approve`); window.location.reload(); }
        catch (err) { alert("Approval failed"); }
    };

    const handleDelete = async () => {
        if (window.confirm("Delete this question?")) {
            try { await api.delete(`/api/questions/${question._id}`); window.location.reload(); }
            catch (err) { alert("Delete failed"); }
        }
    };

    const handleMarkSolved = async () => {
        if (window.confirm("Are you satisfied with the guidance?")) {
            setIsResolving(true);
            try { await api.patch(`/api/questions/${question._id}/resolve`); window.location.reload(); }
            catch (err) { alert("Error"); }
            finally { setIsResolving(false); }
        }
    };

    return (
        <div className={`question-card ${question.status === 'Solved' ? 'solved-card' : ''}`}>
            <div className="question-content">
                <span className={`status-tag ${question.status?.toLowerCase()}`}>
                    {question.status === 'Solved' ? 'Solved' : question.status}
                </span>

                <h3>{question.title}</h3>
                <p className="description">{question.description}</p>

                {hasAnswers && (
                    <div className="answers-container">
                        <h4 className="guidance-label">Senior Guidance</h4>
                        {question.answers.map((ans: any, index: number) => (
                            <div key={index} className="answer-bubble">
                                <p className="answer-text">{ans.content}</p>
                                <span className="senior-name-tag">By {ans.seniorName || "Senior Mentor"}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="card-actions">
                    {userRole === "admin" && (
                        <>
                            {question.status === "Pending" && <button className="action-btn success-btn" onClick={handleApprove}>Approve</button>}
                            <button className="action-btn delete-btn" onClick={handleDelete}>Delete</button>
                        </>
                    )}

                    {userRole === "senior" && question.status === "Unsolved" && (
                        <button className="action-btn answer-btn" onClick={() => setShowAnswerModal(true)}>Give Guidance</button>
                    )}

                    {isAuthor && question.status === "Unsolved" && hasAnswers && (
                        <button className="solve-confirm-btn" onClick={handleMarkSolved} disabled={isResolving}>
                            {isResolving ? "..." : "Mark as Solved"}
                        </button>
                    )}
                </div>
            </div>

            {showAnswerModal && <AnswerModal questionId={question._id} questionTitle={question.title} onClose={() => setShowAnswerModal(false)} />}
        </div>
    );
};

export default QuestionCard;