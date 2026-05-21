import { useState } from "react";

import { ChevronDown, ChevronUp, MessageCircle, Reply, Trash2 } from "lucide-react";

import ThreadChat from "./ThreadChat";

import ConfirmModal from "./ConfirmModal";

import { deleteMentorshipThread } from "../../../api";

import type { MentorshipThread, Question } from "../types";



interface ThreadPanelProps {

    question: Question;

    thread: MentorshipThread;

    currentUserId: string;

    userRole: string;

    isAuthor: boolean;

    defaultExpanded?: boolean;

    onQuestionUpdate: (updated: Question) => void;

}



const formatTime = (iso: string) =>

    new Date(iso).toLocaleString(undefined, {

        month: "short",

        day: "numeric",

        hour: "2-digit",

        minute: "2-digit",

    });



const ThreadPanel = ({

    question,

    thread,

    currentUserId,

    userRole,

    isAuthor,

    defaultExpanded = false,

    onQuestionUpdate,

}: ThreadPanelProps) => {

    const [expanded, setExpanded] = useState(defaultExpanded);

    const [showDelete, setShowDelete] = useState(false);



    const visibleCount = thread.messages?.filter((m) => !m.deletedAt).length ?? 0;

    const messageCount = thread.messageCount ?? visibleCount;

    const lastMsg = thread.messages?.filter((m) => !m.deletedAt).slice(-1)[0];

    const preview = lastMsg?.content || "No messages yet — say hello.";



    const isThreadSenior = String(thread.seniorId) === String(currentUserId);

    const canChat =

        userRole === "admin" ||

        isAuthor ||

        isThreadSenior;



    const canDeleteThread =

        userRole === "admin" ||

        isAuthor ||

        isThreadSenior;



    const handleDeleteThread = async () => {

        try {

            const res = await deleteMentorshipThread(question._id, thread._id);

            onQuestionUpdate(res.data);

            setShowDelete(false);

        } catch {

            alert("Could not delete conversation");

        }

    };



    return (

        <article className={`thread-panel private-thread ${expanded ? "expanded" : ""}`}>

            <div className="thread-private-label">

                <MessageCircle size={12} /> Private • {question.author?.name} &amp; {thread.seniorName}

            </div>

            <div className="thread-panel-header">

                <div className="thread-senior-info">

                    <div className="thread-avatar">{thread.seniorName?.charAt(0) || "S"}</div>

                    <div>

                        <span className="thread-senior-name">{thread.seniorName}</span>

                        <span className="role-badge role-senior">Senior Mentor</span>

                    </div>

                </div>



                <div className="thread-meta">

                    <span className="thread-stat">

                        <MessageCircle size={14} />

                        {messageCount} {messageCount === 1 ? "message" : "messages"}

                    </span>

                    <span className="thread-stat">

                        {formatTime(thread.lastActivityAt || thread.updatedAt || thread.createdAt)}

                    </span>

                </div>



                <div className="thread-panel-actions">

                    {canChat && (

                        <button

                            type="button"

                            className="thread-action-btn primary"

                            onClick={() => setExpanded(!expanded)}

                        >

                            <Reply size={14} />

                            {expanded ? "Minimize" : "Open mentorship chat"}

                        </button>

                    )}

                    <button

                        type="button"

                        className="thread-action-btn"

                        onClick={() => setExpanded(!expanded)}

                        aria-expanded={expanded}

                    >

                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}

                        {expanded ? "Collapse" : "Expand thread"}

                    </button>

                    {canDeleteThread && (

                        <button

                            type="button"

                            className="thread-action-btn danger-outline"

                            onClick={() => setShowDelete(true)}

                            title="Delete this private conversation"

                        >

                            <Trash2 size={14} />

                        </button>

                    )}

                </div>

            </div>



            {!expanded && <p className="thread-preview">{preview}</p>}



            {expanded && canChat && question.status !== "Solved" && (

                <ThreadChat

                    question={question}

                    thread={thread}

                    currentUserId={currentUserId}

                    userRole={userRole}

                    onQuestionUpdate={onQuestionUpdate}

                />

            )}



            {expanded && canChat && question.status === "Solved" && (

                <p className="thread-readonly-note">

                    This question is marked solved. Reopen it from the card to continue messaging.

                </p>

            )}



            {expanded && !canChat && (

                <p className="thread-readonly-note">

                    Private thread — only participants can view messages.

                </p>

            )}



            {showDelete && (

                <ConfirmModal

                    title="Delete private conversation?"

                    message="This removes the mentorship thread for both you and the other person. This cannot be undone."

                    confirmLabel="Delete conversation"

                    onCancel={() => setShowDelete(false)}

                    onConfirm={handleDeleteThread}

                />

            )}

        </article>

    );

};



export default ThreadPanel;

