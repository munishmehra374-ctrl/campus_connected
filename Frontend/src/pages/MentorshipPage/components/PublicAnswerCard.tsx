import { useState } from "react";

import { MessageSquare, Lock } from "lucide-react";

import { openPrivateMentorshipThread } from "../../../api";

import type { PublicAnswer, Question } from "../types";



interface Props {

    question: Question;

    answer: PublicAnswer;

    isAuthor: boolean;

    onQuestionUpdate: (q: Question) => void;

}



const formatTime = (iso: string) =>

    new Date(iso).toLocaleString(undefined, {

        month: "short",

        day: "numeric",

        hour: "2-digit",

        minute: "2-digit",

    });



const PublicAnswerCard = ({ question, answer, isAuthor, onQuestionUpdate }: Props) => {

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");



    const canOpenPrivate = isAuthor && question.status === "Unsolved";



    const handleOpenChat = async () => {

        setLoading(true);

        setError("");

        try {

            const res = await openPrivateMentorshipThread(question._id, answer._id);

            onQuestionUpdate(res.data);

        } catch (err: unknown) {

            const msg =

                err && typeof err === "object" && "response" in err

                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message

                    : undefined;

            setError(msg || "Could not open chat");

        } finally {

            setLoading(false);

        }

    };



    return (

        <div className="public-answer-card">

            <div className="public-answer-header">

                <div className="thread-avatar small">{answer.seniorName?.charAt(0) || "S"}</div>

                <div>

                    <span className="public-answer-author">{answer.seniorName}</span>

                    <span className="role-badge role-senior">Senior Mentor</span>

                </div>

                <span className="thread-stat public-answer-time">{formatTime(answer.createdAt)}</span>

            </div>

            <p className="public-answer-content">{answer.content}</p>

            {canOpenPrivate && (

                <div className="public-answer-actions">

                    <button

                        type="button"

                        className="thread-action-btn primary"

                        onClick={handleOpenChat}

                        disabled={loading}

                    >

                        <Lock size={14} />

                        {loading ? "Opening…" : "Open private mentorship chat"}

                    </button>

                    <span className="public-answer-hint">

                        <MessageSquare size={12} />

                        Only you and this mentor see the follow-up thread

                    </span>

                </div>

            )}

            {error && <p className="thread-chat-error">{error}</p>}

        </div>

    );

};



export default PublicAnswerCard;

