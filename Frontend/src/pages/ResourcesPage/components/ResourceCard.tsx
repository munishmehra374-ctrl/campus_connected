import { useState } from "react";
import api, {
    approveStudyResource,
    deleteStudyResource,
    rejectStudyResource,
    trackStudyResourceDownload,
} from "../../../api";
import type { StudyResource, UploaderRole } from "../data";
import { formatResourceDate, getUploaderName, roleBadgeLabel } from "../data";

interface Props {
    resource: StudyResource;
    role: string;
    userId?: string;
    onAction: () => void;
}

const typeClass = (type: string) =>
    type.toLowerCase().replace(/\s+/g, "-");

const ResourceCard = ({ resource, role, userId, onAction }: Props) => {
    const [busy, setBusy] = useState(false);
    const [localDownloads, setLocalDownloads] = useState(resource.downloadCount ?? 0);

    if (!resource) return null;

    const {
        _id,
        title,
        subject,
        status,
        fileUrl,
        type,
        sem,
        uploaderRole,
        createdAt,
    } = resource;

    const userRole = role?.toLowerCase().trim();
    const isPending = status === "pending";
    const isApproved = status === "approved";
    const isAdmin = userRole === "admin";
    const isSenior = userRole === "senior";

    const uploaderId =
        typeof resource.uploadedBy === "object" ? resource.uploadedBy?._id : resource.uploadedBy;
    const isOwner = userId && uploaderId && userId === uploaderId;
    const canDelete = isAdmin || isOwner;
    const canDownload = isApproved || isSenior || isAdmin;
    const canModerate = isAdmin && isPending;

    const handleApprove = async () => {
        setBusy(true);
        try {
            await approveStudyResource(_id);
            onAction();
        } catch {
            alert("Could not approve resource.");
        } finally {
            setBusy(false);
        }
    };

    const handleReject = async () => {
        if (!window.confirm(`Reject "${title}"?`)) return;
        setBusy(true);
        try {
            await rejectStudyResource(_id);
            onAction();
        } catch {
            alert("Could not reject resource.");
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${title}" permanently?`)) return;
        setBusy(true);
        try {
            await deleteStudyResource(_id);
            onAction();
        } catch {
            alert("Failed to delete resource.");
        } finally {
            setBusy(false);
        }
    };

    const handleDownload = async () => {
        if (!fileUrl) return;
        setBusy(true);
        try {
            const res = await trackStudyResourceDownload(_id);
            setLocalDownloads(res.data.downloadCount);
            const base = api.defaults.baseURL || "";
            window.open(`${base}${res.data.fileUrl || fileUrl}`, "_blank", "noopener,noreferrer");
        } catch {
            const base = api.defaults.baseURL || "";
            window.open(`${base}${fileUrl}`, "_blank", "noopener,noreferrer");
        } finally {
            setBusy(false);
        }
    };

    return (
        <article
            className={`resource-card ${isPending ? "status-pending" : "status-approved"}`}
        >
            <div className="card-top">
                <div className="card-top-left">
                    <span className={`tag tag-${typeClass(type)}`}>{type}</span>
                    {isPending && (isAdmin || isSenior) && (
                        <span className="badge badge-pending">Pending Approval</span>
                    )}
                    {isApproved && (
                        <span className="badge badge-success">Approved</span>
                    )}
                </div>
                <span className="sem">{sem}</span>
            </div>

            <div className="card-body">
                <h3>{title}</h3>
                <p className="subject">{subject}</p>
                <div className="meta">
                    <span className="uploader">Uploaded by {getUploaderName(resource.uploadedBy)}</span>
                </div>
                <div className="badge-row">
                    <span className={`role-badge role-${(uploaderRole || "junior") as UploaderRole}`}>
                        {roleBadgeLabel((uploaderRole || "junior") as UploaderRole)}
                    </span>
                    {createdAt && (
                        <span className="upload-date">{formatResourceDate(createdAt)}</span>
                    )}
                </div>
            </div>

            <div className="card-footer">
                <div className="stats">
                    <span>Downloads: {localDownloads}</span>
                </div>

                <div className="actions">
                    {canModerate && (
                        <>
                            <button
                                type="button"
                                className="approve-btn"
                                disabled={busy}
                                onClick={handleApprove}
                            >
                                Approve
                            </button>
                            <button
                                type="button"
                                className="reject-btn"
                                disabled={busy}
                                onClick={handleReject}
                            >
                                Reject
                            </button>
                        </>
                    )}

                    {canDelete && (
                        <button
                            type="button"
                            className="delete-btn"
                            disabled={busy}
                            onClick={handleDelete}
                            title="Delete resource"
                        >
                            Delete
                        </button>
                    )}

                    {canDownload && fileUrl && (
                        <button
                            type="button"
                            className="download-btn"
                            disabled={busy}
                            onClick={handleDownload}
                        >
                            Download
                        </button>
                    )}

                    {isPending && !isAdmin && !isSenior && isOwner && (
                        <span className="pending-owner-note">Awaiting admin approval</span>
                    )}
                </div>
            </div>
        </article>
    );
};

export default ResourceCard;
