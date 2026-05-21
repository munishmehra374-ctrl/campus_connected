import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    fetchNotifications,
    fetchUnreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
} from "../api";
import type { NotificationItem } from "../pages/MentorshipPage/types";
import "./notification-bell.css";

const NotificationBell = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    const refresh = async () => {
        try {
            const [listRes, countRes] = await Promise.all([
                fetchNotifications(),
                fetchUnreadNotificationCount(),
            ]);
            setItems(listRes.data);
            setCount(countRes.data?.count ?? 0);
        } catch {
            /* ignore */
        }
    };

    useEffect(() => {
        refresh();
        const t = setInterval(refresh, 15000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("click", onDoc);
        return () => document.removeEventListener("click", onDoc);
    }, []);

    const onItemClick = async (n: NotificationItem) => {
        try {
            await markNotificationRead(n._id);
            setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
            setCount((c) => Math.max(0, c - 1));
        } catch {
            /* ignore */
        }
        if (n.meta?.questionId) navigate("/mentorship");
        setOpen(false);
    };

    return (
        <div className="notif-bell-wrap" ref={ref}>
            <button
                type="button"
                className="notif-bell-btn"
                aria-label="Notifications"
                onClick={() => {
                    setOpen(!open);
                    refresh();
                }}
            >
                <Bell size={20} />
                {count > 0 && <span className="notif-badge">{count > 9 ? "9+" : count}</span>}
            </button>
            {open && (
                <div className="notif-dropdown">
                    <div className="notif-dropdown-head">
                        <span>Notifications</span>
                        {count > 0 && (
                            <button type="button" className="notif-mark-all" onClick={() => markAllNotificationsRead().then(refresh)}>
                                Mark all read
                            </button>
                        )}
                    </div>
                    <ul className="notif-list">
                        {items.length === 0 && <li className="notif-empty">No notifications yet</li>}
                        {items.map((n) => (
                            <li key={n._id}>
                                <button
                                    type="button"
                                    className={`notif-item ${n.read ? "read" : ""}`}
                                    onClick={() => onItemClick(n)}
                                >
                                    <strong>{n.title}</strong>
                                    {n.body && <span>{n.body}</span>}
                                    <time>{new Date(n.createdAt).toLocaleString()}</time>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
