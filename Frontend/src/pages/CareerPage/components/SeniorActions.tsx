import React, { useState } from "react";
import api from "../../../api";

interface Props {
    domainId: string;   // FIX: no longer optional
    onUpdate: () => void;
}

const SeniorAction = ({ domainId, onUpdate }: Props) => {
    const [title, setTitle] = useState("");
    const [type, setType] = useState("video");
    const [file, setFile] = useState<File | null>(null);
    const [url, setUrl] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // SAFETY GUARD
        if (!domainId) {
            alert("Domain ID missing.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("type", type);

        if (type === "video") {
            if (!url) {
                alert("Please enter a video URL.");
                return;
            }
            formData.append("url", url);
        } else {
            if (!file) {
                alert("Please select a PDF file.");
                return;
            }
            formData.append("file", file);
        }

        try {
            await api.post(`/api/career/${domainId}/resource`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setTitle("");
            setUrl("");
            setFile(null);

            onUpdate();
            alert("Published successfully!");
        } catch (err) {
            console.error(err);
            alert("Upload failed.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <input
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
            />

            <select value={type} onChange={e => setType(e.target.value)}>
                <option value="video">Video URL</option>
                <option value="material">PDF File</option>
            </select>

            {type === "video" ? (
                <input
                    placeholder="URL"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                />
            ) : (
                <input
                    type="file"
                    accept=".pdf"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                />
            )}

            <button type="submit">Upload</button>
        </form>
    );
};

export default SeniorAction;
