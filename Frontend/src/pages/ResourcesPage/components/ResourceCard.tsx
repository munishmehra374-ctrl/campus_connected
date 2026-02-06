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

  return (
    <div className={`resource-card ${isPending ? "status-pending" : "status-approved"}`}>
      <div className="card-top">
        <div className="card-top-left">
          <span className={`tag ${type?.toLowerCase()}`}>{type}</span>
          
          {/* ✅ DYNAMIC LABELS */}
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
          {/* ✅ Admin Only Button */}
          {isAdmin && isPending && (
            <button className="approve-btn" onClick={handleApprove}>
              Verify & Approve
            </button>
          )}

          {/* ✅ Download Visibility: Show if approved, OR if Senior/Admin is checking it */}
          {(isApproved || isSenior || isAdmin) && fileUrl && (
            <a href={`http://localhost:5000${fileUrl}`} target="_blank" className="download-btn">
              Download Resource
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;