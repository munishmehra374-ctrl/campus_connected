import React, { useState } from "react";
import api from "../../../api";

const CareerModal = ({ closeModal, refreshData }: any) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        demand: "High",
        duration: "",
        skills: "",
        roadmap: "",
        color: "#8b5cf6"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                // Converting comma-separated strings to clean arrays for MongoDB
                skills: formData.skills.split(",").map(s => s.trim()).filter(s => s !== ""),
                roadmap: formData.roadmap.split(",").map(r => r.trim()).filter(r => r !== ""),
                // Initialize resources as an empty array; Seniors will populate this later
                resources: []
            };

            await api.post("/api/career", payload);
            refreshData();
            closeModal();
        } catch (err) {
            console.error("Creation failed", err);
            alert("Failed to create pathway. Please check your connection.");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Design Career Pathway</h2>
                    <p>Create the framework. Seniors will add learning materials later.</p>
                </div>

                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-row">
                        <div className="input-group">
                            <label>Path Title</label>
                            <input
                                placeholder="e.g. AI Engineer"
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group color-picker-group">
                            <label>Accent Color</label>
                            <input
                                type="color"
                                value={formData.color}
                                onChange={e => setFormData({ ...formData, color: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label>Duration</label>
                            <input
                                placeholder="e.g. 6 Months"
                                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label>Market Demand</label>
                            <select onChange={e => setFormData({ ...formData, demand: e.target.value })}>
                                <option value="High">High Demand</option>
                                <option value="Very High">Very High</option>
                                <option value="Essential">Essential</option>
                                <option value="Trending">Trending</option>
                            </select>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Deep-Dive Description</label>
                        <textarea
                            placeholder="Describe the career path in detail..."
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Core Skills (Comma separated)</label>
                        <input
                            placeholder="React, Python, Docker, AWS..."
                            onChange={e => setFormData({ ...formData, skills: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label>Roadmap Steps (Comma separated)</label>
                        <input
                            placeholder="Phase 1: Basics, Phase 2: Advanced Concepts..."
                            onChange={e => setFormData({ ...formData, roadmap: e.target.value })}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                        <button type="submit" className="save-btn">Publish Pathway Shell</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CareerModal;