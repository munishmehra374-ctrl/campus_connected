import { useEffect, useRef, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { sendThreadMessage, deleteThreadMessage } from "../../../api";
import type { MentorshipThread, Question } from "../types";

interface ThreadChatProps {
    question: Question;
    thread: MentorshipThread;
    currentUserId: string;
    userRole: string;
    onQuestionUpdate: (updated: Question) => void;
}

const formatTime = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

const roleLabel = (role: string) => {
    if (role === "senior") return "Senior Mentor";
    if (role === "admin") return "Admin";
    return "Junior";
};

const ThreadChat = ({ question, thread, currentUserId, userRole, onQuestionUpdate }: ThreadChatProps) => {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    const visibleMessages = thread.messages.filter((m) => !m.deletedAt);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [visibleMessages.length]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || sending) return;

        setSending(true);
        setError("");
        try {
            const res = await sendThreadMessage(question._id, thread._id, message.trim());
            onQuestionUpdate(res.data);
            setMessage("");
        } catch (err: unknown) {
            const msg =
                err && typeof err === "object" && "response" in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
            setError(msg || "Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!window.confirm("Remove this message?")) return;
        try {
            const res = await deleteThreadMessage(question._id, thread._id, messageId);
            onQuestionUpdate(res.data);
        } catch {
            alert("Could not delete message");
        }
    };

    return (
        <div className="thread-chat">
            <div className="thread-chat-messages">
                {visibleMessages.map((msg) => {
                    const isOwn = String(msg.senderId) === String(currentUserId);
                    const isSenior = msg.senderRole === "senior";

                    return (
                        <div
                            key={msg._id}
                            className={`chat-bubble-row ${isOwn ? "own" : "other"} ${isSenior ? "senior" : "junior"}`}
                        >
                            <div className={`chat-bubble ${isSenior ? "bubble-senior" : "bubble-junior"}`}>
                                <div className="bubble-header">
                                    <span className="bubble-avatar">{msg.senderName?.charAt(0) || "?"}</span>
                                    <span className="bubble-sender">{msg.senderName}</span>
                                    <span className={`role-badge role-${msg.senderRole}`}>
                                        {roleLabel(msg.senderRole)}
                                    </span>
                                    {(isOwn || userRole === "admin") && (
                                        <button
                                            type="button"
                                            className="bubble-delete"
                                            title="Delete message"
                                            onClick={() => handleDeleteMessage(msg._id)}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <p className="bubble-content">{msg.content}</p>
                                <span className="bubble-time">{formatTime(msg.createdAt)}</span>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {error && <p className="thread-chat-error">{error}</p>}

            <form className="thread-chat-input" onSubmit={handleSend}>
                <input
                    type="text"
                    placeholder="Type a private message…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={sending}
                />
                <button type="submit" className="chat-send-btn" disabled={sending || !message.trim()}>
                    <Send size={18} />
                    <span>{sending ? "…" : "Send"}</span>
                </button>
            </form>
        </div>
    );
};

export default ThreadChat;
