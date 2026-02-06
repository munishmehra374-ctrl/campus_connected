import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api"; // Path to your axios instance
import "./create.css";

const CreateSociety = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        tagline: "",
        description: "",
        category: "Technical",
        president: "",
        color: "#4f7cff"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/api/societies", formData);
            alert("Society created successfully!");
            navigate("/societies"); // Redirect back to hub
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to create society");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-society-page">
            <div className="create-card">
                <h2>Initialize New Society</h2>
                <p>Fill in the details to establish a new student organization.</p>

                <form onSubmit={handleSubmit} className="create-form">
                    <div className="form-group">
                        <label>Society Name</label>
                        <input name="name" type="text" placeholder="e.g. Google Developer Group" required onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Tagline</label>
                        <input name="tagline" type="text" placeholder="e.g. Innovating the future" required onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" rows={4} placeholder="What is this society about?" required onChange={handleChange} />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>President Name</label>
                            <input name="president" type="text" placeholder="Full Name" required onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select name="category" onChange={handleChange}>
                                <option value="Technical">Technical</option>
                                <option value="Cultural">Cultural</option>
                                <option value="Sports">Sports</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Theme Color</label>
                        <input name="color" type="color" defaultValue="#4f7cff" onChange={handleChange} className="color-picker" />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => navigate("/societies")}>Cancel</button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? "Creating..." : "Establish Society"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSociety;