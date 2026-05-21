import { useState } from "react";
import { createEvent } from "../../../api";
import { useAuth } from "../../../context/AuthContext";
import { EVENT_CATEGORIES } from "../types";

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateEventModal = ({ onClose, onSuccess }: Props) => {
    const { user } = useAuth();
    const [form, setForm] = useState({
        title: "",
        type: "Workshop",
        capacity: 50,
        date: "",
        time: "",
        location: "",
        organizer: user?.name || "",
        description: "",
        venueMode: "In-Person",
        registrationDeadline: "",
        tags: "",
        bannerImage: "",
    });
    const [saving, setSaving] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await createEvent({
                ...form,
                capacity: Number(form.capacity),
                tags: form.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
            });
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const msg =
                err && typeof err === "object" && "response" in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : "Could not create event";
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="hub-modal-overlay" onClick={onClose}>
            <form className="hub-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
                <h2>Host Campus Event</h2>
                <p className="hub-modal-sub">Workshops, hackathons, mentor sessions & campus activities</p>

                <input
                    placeholder="Event title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                />
                <textarea
                    placeholder="Description"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                />

                <div className="hub-form-row">
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                        {EVENT_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    <select
                        value={form.venueMode}
                        onChange={(e) => setForm({ ...form, venueMode: e.target.value })}
                    >
                        <option value="In-Person">In-Person</option>
                        <option value="Online">Online</option>
                        <option value="Hybrid">Hybrid</option>
                    </select>
                </div>

                <div className="hub-form-row">
                    <input
                        type="number"
                        min={1}
                        placeholder="Max slots"
                        value={form.capacity}
                        onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                        required
                    />
                    <input
                        placeholder="Organizer name"
                        value={form.organizer}
                        onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                        required
                    />
                </div>

                <input
                    placeholder="Venue / Zoom link"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    required
                />

                <div className="hub-form-row">
                    <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        required
                    />
                    <input
                        placeholder="Time (e.g. 4:00 PM)"
                        value={form.time}
                        onChange={(e) => setForm({ ...form, time: e.target.value })}
                        required
                    />
                </div>

                <div className="hub-form-row">
                    <input
                        type="datetime-local"
                        value={form.registrationDeadline}
                        onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                    />
                    <input
                        placeholder="Tags (comma separated)"
                        value={form.tags}
                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    />
                </div>

                <input
                    placeholder="Banner image URL (optional)"
                    value={form.bannerImage}
                    onChange={(e) => setForm({ ...form, bannerImage: e.target.value })}
                />

                <div className="hub-modal-actions">
                    <button type="button" className="hub-btn-ghost" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="hub-btn-primary" disabled={saving}>
                        {saving ? "Creating…" : "Publish Event"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateEventModal;
