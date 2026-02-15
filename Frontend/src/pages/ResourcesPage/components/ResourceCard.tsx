import axios from "axios";

interface Resource {
  _id: string;
  type: string;
  sem: string;
  title: string;
  subject: string;
  author: string;
  time: string;
  views: number;
  downloads: number;
  status: "pending" | "approved";
  fileUrl: string;
}

interface Props {
  resource: Resource;
  role: string;
}

const ResourceCard = ({ resource, role }: Props) => {
  if (!resource) return null;

  const { _id, title, subject, author, time, views, downloads, status, fileUrl, type, sem } = resource;

  const userRole = role?.toLowerCase().trim();
  const isPending = status === "pending";
  const isApproved = status === "approved";
  const isAdmin = userRole === "admin";
  const isSenior = userRole === "senior";

  const handleApprove = async () => {
    try {
      await axios.put(`http://localhost:5000/api/resources/${_id}/approve`, {}, { withCredentials: true });
      alert("Resource successfully verified!");
      window.location.reload();
    } catch (err) {
      alert("Unauthorized action.");
    }
  };

  // --- NEW DELETE HANDLER ---
const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/resources/${_id}`, { 
          withCredentials: true 
        });
        
        // No alert here! It just refreshes immediately.
        window.location.reload(); 
      } catch (err) {
        console.error(err);
        alert("Failed to delete."); // Only show alert if something goes wrong
      }
    }
  };

  return (
    <div className={`resource-card ${isPending ? "status-pending" : "status-approved"}`}>
      <div className="card-top">
        <div className="card-top-left">
          <span className={`tag ${type?.toLowerCase()}`}>{type}</span>

          {isPending && (isAdmin || isSenior) && (
            <span className="badge badge-pending">🕒 Pending Verification</span>
          )}

          {isApproved && (
            <span className="badge badge-success">✅ Success / Approved</span>
          )}
        </div>
        <span className="sem">{sem}</span>
      </div>

      <div className="card-body">
        <h3>{title}</h3>
        <p className="subject">{subject}</p>
        <div className="meta">
          <span>👤 {author}</span>
          <span>⏱ {time}</span>
        </div>
      </div>

      <div className="card-footer">
        <div className="stats">
          <span>👁 {views}</span>
          <span>⬇ {downloads}</span>
        </div>

        <div className="actions">
          {/* ✅ Admin Only Approve Button */}
          {isAdmin && isPending && (
            <button className="approve-btn" onClick={handleApprove}>
              Verify & Approve
            </button>
          )}

          {/* ✅ Admin (or Senior) Delete Button */}
          {(isAdmin) && (
            <button className="delete-btn" onClick={handleDelete} title="Delete Resource">
              🗑️ Delete
            </button>
          )}

          {/* ✅ Download Visibility */}
          {(isApproved || isSenior || isAdmin) && fileUrl && (
            <a href={`http://localhost:5000${fileUrl}`} target="_blank" className="download-btn" rel="noreferrer">
              Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;