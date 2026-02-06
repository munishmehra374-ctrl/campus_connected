import { useState } from "react";
import api from "../../../api";

const CreateEventModal = ({ onClose }: { onClose: () => void }) => {
    const [form, setForm] = useState({
        title: "", type: "Workshop", capacity: 50,
        date: "", time: "", location: "", organizer: "", description: ""
    });

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/api/events", form);
            alert("Event Successfully Hosted!");
            onClose();
            window.location.reload();
        } catch (err: any) {
            alert(err.response?.data?.message || "Error: Please check all fields.");
        }
    };

    return (
        <div className="modal-overlay">
            <form onSubmit={submit} className="modal-form">
                <h2>Host New Event</h2>
                <input placeholder="Event Title" onChange={e => setForm({ ...form, title: e.target.value })} required />

                <div style={{ display: 'flex', gap: '15px' }}>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ flex: 1 }}>
                        <option value="Workshop">Workshop</option>
                        <option value="Hackathon">Hackathon</option>
                        <option value="Talk">Talk</option>
                        <option value="Competition">Competition</option>
                    </select>
                    <input type="number" placeholder="Max Capacity" style={{ flex: 1 }} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} required />
                </div>

                <input placeholder="Organizer Name" onChange={e => setForm({ ...form, organizer: e.target.value })} required />
                <input placeholder="Location (e.g. Hall A or Zoom Link)" onChange={e => setForm({ ...form, location: e.target.value })} required />

                <div style={{ display: 'flex', gap: '15px' }}>
                    <input type="date" style={{ flex: 1 }} onChange={e => setForm({ ...form, date: e.target.value })} required />
                    <input type="text" placeholder="Time (e.g. 4:00 PM)" style={{ flex: 1 }} onChange={e => setForm({ ...form, time: e.target.value })} required />
                </div>

                <textarea placeholder="Event Description..." rows={3} onChange={e => setForm({ ...form, description: e.target.value })} required />

                <div className="modal-actions">
                    <button type="submit" className="submit-btn">Create Event</button>
                    <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
                </div>
            </form>
        </div>
    );
};
export default CreateEventModal;