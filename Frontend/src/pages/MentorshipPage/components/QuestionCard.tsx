import { useState, useEffect, useCallback, useMemo } from "react";

import { useAuth, isVerifiedSeniorUser } from "../../../context/AuthContext";

import api, { fetchQuestionById, markQuestionSolved, reopenQuestion, hideQuestionFromFeed } from "../../../api";

import ThreadPanel from "./ThreadPanel";

import PublicAnswerModal from "./PublicAnswerModal";

import PublicAnswerCard from "./PublicAnswerCard";

import type { Question } from "../types";



interface QuestionCardProps {

    question: Question;

    onUpdate: (updated: Question) => void;

    onHide?: (questionId: string) => void;

    pollActive?: boolean;

}



const QuestionCard = ({ question, onUpdate, onHide, pollActive = false }: QuestionCardProps) => {

    const { user } = useAuth();

    const [showPublicModal, setShowPublicModal] = useState(false);

    const [localQuestion, setLocalQuestion] = useState(question);

    const [markingSolved, setMarkingSolved] = useState(false);



    const userRole = user?.role?.toLowerCase() || "";
    const canAnswerAsSenior = isVerifiedSeniorUser(user) || userRole === "admin";

    const isAuthor = String(user?._id) === String(localQuestion.author?.id);

    const threads = localQuestion.mentorshipThreads || [];

    const publicAnswers = localQuestion.publicAnswers || [];

    const hasPrivateThreads = threads.length > 0;



    const seniorAlreadyPublic = useMemo(

        () => publicAnswers.some((a) => String(a.seniorId) === String(user?._id)),

        [publicAnswers, user?._id]

    );



    const mentorOptions = useMemo(() => {

        const map = new Map<string, { id: string; name: string }>();

        for (const a of publicAnswers) {

            map.set(String(a.seniorId), { id: String(a.seniorId), name: a.seniorName });

        }

        for (const t of threads) {

            map.set(String(t.seniorId), { id: String(t.seniorId), name: t.seniorName });

        }

        return Array.from(map.values());

    }, [publicAnswers, threads]);



    const [helpedSeniorId, setHelpedSeniorId] = useState("");

    useEffect(() => {
        if (localQuestion.status === "Solved" && localQuestion.solvedMeta?.helpedBySeniorId) {
            setHelpedSeniorId(String(localQuestion.solvedMeta.helpedBySeniorId));
        } else if (localQuestion.status !== "Solved") {
            setHelpedSeniorId("");
        }
    }, [localQuestion.status, localQuestion.solvedMeta?.helpedBySeniorId]);

    const handleQuestionUpdate = (updated: Question) => {

        setLocalQuestion(updated);

        onUpdate(updated);

    };



    const refreshQuestion = useCallback(async () => {

        try {

            const res = await fetchQuestionById(localQuestion._id);

            handleQuestionUpdate(res.data);

        } catch {

            /* ignore poll errors */

        }

    }, [localQuestion._id]);



    useEffect(() => {

        setLocalQuestion(question);

    }, [question]);



    useEffect(() => {

        if (!pollActive) return;

        if (publicAnswers.length === 0 && threads.length === 0) return;

        const interval = setInterval(refreshQuestion, 4000);

        return () => clearInterval(interval);

    }, [pollActive, refreshQuestion, publicAnswers.length, threads.length]);



    const handleDeleteQuestion = async () => {
        if (!window.confirm("Delete this question and all related threads?")) return;
        try {
            await api.delete(`/api/questions/${localQuestion._id}`);
            onHide?.(localQuestion._id);
        } catch {
            alert("Delete failed");
        }
    };



    const handleHideDiscussion = async () => {

        if (

            !window.confirm(

                "Remove this discussion from your feed? Others will still see it."

            )

        ) {

            return;

        }

        try {

            await hideQuestionFromFeed(localQuestion._id);

            onHide?.(localQuestion._id);

        } catch {

            alert("Could not hide discussion");

        }

    };



    const handleMarkSolved = async () => {

        setMarkingSolved(true);

        try {

            const body =

                helpedSeniorId && mentorOptions.some((m) => m.id === helpedSeniorId)

                    ? {

                          helpedBySeniorId: helpedSeniorId,

                          helpedBySeniorName:

                              mentorOptions.find((m) => m.id === helpedSeniorId)?.name || "",

                      }

                    : {};

            const res = await markQuestionSolved(localQuestion._id, body);

            handleQuestionUpdate(res.data);

        } catch (e: unknown) {

            const msg =

                e && typeof e === "object" && "response" in e

                    ? (e as { response?: { data?: { message?: string } } }).response?.data?.message

                    : "Could not mark solved";

            alert(msg);

        } finally {

            setMarkingSolved(false);

        }

    };



    const handleReopen = async () => {

        try {

            const res = await reopenQuestion(localQuestion._id);

            handleQuestionUpdate(res.data);

        } catch {

            alert("Could not reopen");

        }

    };



    const local = localQuestion;



    const solvedMentorName = local.solvedMeta?.helpedBySeniorName?.trim();

    const solvedLine =
        local.status === "Solved" ? (
            <p className="solved-by-line">
                <span className="solved-check">✓</span>
                {solvedMentorName ? (
                    <>
                        Solved by <strong>{solvedMentorName}</strong>
                    </>
                ) : (
                    "Marked as solved"
                )}
            </p>
        ) : null;



    return (

        <article className={`question-card ${local.status === "Solved" ? "solved-card" : ""}`}>

            <div className="question-content">

                <div className="question-top-row">

                    <span className={`status-tag ${local.status?.toLowerCase()}`}>

                        {local.status === "Unsolved" ? "Open" : local.status}

                    </span>

                    {publicAnswers.length > 0 && (

                        <span className="thread-count-badge">{publicAnswers.length} public answers</span>

                    )}

                    {hasPrivateThreads &&

                    (isAuthor ||

                        threads.some((t) => String(t.seniorId) === String(user?._id)) ||

                        userRole === "admin") && (

                        <span className="thread-count-badge private-badge">

                            {threads.length} private chat{threads.length !== 1 ? "s" : ""}

                        </span>

                    )}

                </div>



                <h3>{local.title}</h3>

                <p className="description">{local.description}</p>



                {local.tags?.length > 0 && (

                    <div className="question-tags">

                        {local.tags.map((tag) => (

                            <span key={tag} className="tag-chip">

                                {tag}

                            </span>

                        ))}

                    </div>

                )}



                <p className="question-author">

                    Asked by <strong>{local.author?.name}</strong>

                </p>



                {solvedLine}



                <section className="public-answers-section">

                    <h4 className="threads-heading">Public mentor answers</h4>

                    <p className="threads-subheading">

                        Visible to everyone. Open a private chat with a mentor to continue off the public feed.

                    </p>

                    {publicAnswers.length === 0 ? (

                        <p className="empty-inline">No public answers yet.</p>

                    ) : (

                        publicAnswers.map((ans, idx) => (
                            <PublicAnswerCard
                                key={ans._id || `${ans.seniorId}-${idx}`}
                                question={local}
                                answer={ans}
                                isAuthor={isAuthor}
                                onQuestionUpdate={handleQuestionUpdate}
                            />
                        ))

                    )}

                </section>



                {hasPrivateThreads && (isAuthor || threads.some((t) => String(t.seniorId) === String(user?._id)) || userRole === "admin") && (

                    <section className="threads-section private-threads-section">

                        <h4 className="threads-heading">Your private mentorship chats</h4>

                        <p className="threads-subheading">

                            Only you and the mentor in each thread can read these messages.

                        </p>

                        {threads.map((thread, index) => (

                            <ThreadPanel

                                key={thread._id}

                                question={local}

                                thread={thread}

                                currentUserId={user?._id || ""}

                                userRole={userRole}

                                isAuthor={isAuthor}

                                defaultExpanded={index === 0 && (isAuthor || String(thread.seniorId) === String(user?._id))}

                                onQuestionUpdate={handleQuestionUpdate}

                            />

                        ))}

                    </section>

                )}



                {isAuthor && (local.status === "Unsolved" || local.status === "Pending") && (

                    <div className="mark-solved-box glass-panel">

                        <p className="mark-solved-title">Mark as solved</p>

                        <p className="modal-hint">

                            When you&apos;re done, mark this question solved. You can reopen it anytime.

                        </p>

                        {mentorOptions.length > 0 && (

                            <label className="mark-solved-select">

                                <span>Credit a mentor (optional)</span>

                                <select value={helpedSeniorId} onChange={(e) => setHelpedSeniorId(e.target.value)}>

                                    <option value="">— Select —</option>

                                    {mentorOptions.map((m) => (

                                        <option key={m.id} value={m.id}>

                                            {m.name}

                                        </option>

                                    ))}

                                </select>

                            </label>

                        )}

                        <button

                            type="button"

                            className="action-btn solve-confirm-btn"

                            onClick={handleMarkSolved}

                            disabled={markingSolved}

                        >

                            {markingSolved ? "Saving…" : "Mark as solved"}

                        </button>

                    </div>

                )}



                {isAuthor && local.status === "Solved" && (

                    <button type="button" className="action-btn reopen-btn" onClick={handleReopen}>

                        Reopen question

                    </button>

                )}



                <div className="card-actions">

                    <button

                        type="button"

                        className="action-btn hide-feed-btn"

                        onClick={handleHideDiscussion}

                    >

                        Hide discussion

                    </button>



                    {userRole === "admin" && (
                        <button type="button" className="action-btn delete-btn" onClick={handleDeleteQuestion}>
                            Delete question
                        </button>
                    )}



                    {canAnswerAsSenior &&
                        (local.status === "Unsolved" || local.status === "Pending") &&
                        !seniorAlreadyPublic && (

                        <button

                            type="button"

                            className="action-btn answer-btn"

                            onClick={() => setShowPublicModal(true)}

                        >

                            Post public guidance

                        </button>

                    )}



                    {canAnswerAsSenior && seniorAlreadyPublic && (

                        <span className="action-hint">You already shared a public answer on this question</span>

                    )}

                </div>

            </div>



            {showPublicModal && (

                <PublicAnswerModal

                    questionId={local._id}

                    questionTitle={local.title}

                    onClose={() => setShowPublicModal(false)}

                    onSuccess={handleQuestionUpdate}

                />

            )}

        </article>

    );

};



export default QuestionCard;

