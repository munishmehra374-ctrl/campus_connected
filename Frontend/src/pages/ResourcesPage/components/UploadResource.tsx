import { useState } from "react";
import { uploadStudyResource } from "../../../api";
import { RESOURCE_CATEGORIES, SEMESTERS } from "../data";

interface Props {
    role: string;
    onSuccess: () => void;
}

const UPLOAD_SEMESTERS = SEMESTERS.filter((s) => s !== "All");

const UploadResource = ({ role, onSuccess }: Props) => {
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [type, setType] = useState<string>(RESOURCE_CATEGORIES[0]);
    const [sem, setSem] = useState<string>(UPLOAD_SEMESTERS[0]);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const isJunior = role === "junior";
    const isSeniorOrAdmin = role === "senior" || role === "admin";

    const handleUpload = async () => {
        if (!title.trim() || !subject.trim()) {
            setError("Title and subject are required.");
            return;
        }
        if (!file) {
            setError("Please attach a PDF or study file.");
            return;
        }

        setError("");
        setSuccess("");
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("title", title.trim());
            formData.append("subject", subject.trim());
            formData.append("type", type);
            formData.append("sem", sem);
            formData.append("file", file);

            await uploadStudyResource(formData);

            setTitle("");
            setSubject("");
            setType(RESOURCE_CATEGORIES[0]);
            setSem(UPLOAD_SEMESTERS[0]);
            setFile(null);

            setSuccess(
                isJunior
                    ? "Uploaded successfully. Pending admin approval."
                    : "Uploaded and published successfully."
            );
            onSuccess();
        } catch {
            setError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <section className="upload-section">
            <div className="upload-header">
                <h3>Upload Study Resource</h3>
                {isJunior && (
                    <p className="upload-hint">
                        Junior uploads require admin approval before they appear publicly.
                    </p>
                )}
                {isSeniorOrAdmin && (
                    <p className="upload-hint upload-hint-success">
                        Your uploads are published immediately — no approval needed.
                    </p>
                )}
            </div>

            <input
                placeholder="Resource title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <input
                placeholder="Subject (e.g. Data Structures)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
            />

            <select value={type} onChange={(e) => setType(e.target.value)}>
                {RESOURCE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                        {cat}
                    </option>
                ))}
            </select>

            <select value={sem} onChange={(e) => setSem(e.target.value)}>
                {UPLOAD_SEMESTERS.map((s) => (
                    <option key={s} value={s}>
                        {s}
                    </option>
                ))}
            </select>

            <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            {error && <p className="upload-error">{error}</p>}
            {success && <p className="upload-success">{success}</p>}

            <button type="button" onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload Resource"}
            </button>
        </section>
    );
};

export default UploadResource;
