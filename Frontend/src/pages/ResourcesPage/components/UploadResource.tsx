import { useState } from "react";
import axios from "axios";

const UploadResource = () => {
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [type, setType] = useState("Notes");
    const [sem, setSem] = useState("Sem 1");
    const [file, setFile] = useState<File | null>(null);

    const handleUpload = async () => {
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("subject", subject);
            formData.append("type", type);
            formData.append("sem", sem);
            if (file) formData.append("file", file);

            await axios.post(
                "http://localhost:5000/api/resources",
                formData,
                { withCredentials: true }
            );

            alert("Uploaded (pending admin approval)");
            window.location.reload();
        } catch (err) {
            console.log(err);
            alert("Upload failed");
        }
    };

    return (
        <section className="upload-section">
            <h3>Upload Resource</h3>

            <input placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
            <input placeholder="Subject" onChange={(e) => setSubject(e.target.value)} />

            <select onChange={(e) => setType(e.target.value)}>
                <option>Notes</option>
                <option>Paper</option>
            </select>

            <select onChange={(e) => setSem(e.target.value)}>
                <option>Sem 1</option>
                <option>Sem 2</option>
                <option>Sem 3</option>
            </select>

            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button onClick={handleUpload}>Upload</button>
        </section>
    );
};

export default UploadResource;
