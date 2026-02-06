import { useEffect, useState } from "react";
import axios from "axios";
import ResourceCard from "./ResourceCard";

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
  type: string;
  sem: string;
  search: string;
  role: string;
}

const ResourceGrid = ({ type, sem, search, role }: Props) => {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/resources", { withCredentials: true })
      .then(res => setResources(res.data))
      .catch(err => console.error("Fetch Error:", err));
  }, []);

  const filtered = resources
    .filter(r => r && r.title)
    .filter((r) => {
      const matchType = type === "All" || r.type === type;
      const matchSem = sem === "All" || r.sem === sem;
      const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());

      const userRole = role?.toLowerCase().trim();

      // 🛡️ VISIBILITY LOGIC
      // Senior & Admin: See everything (so they can track pending uploads)
      // Junior/Others: ONLY see approved
      const canSeePending = userRole === "admin" || userRole === "senior";
      const matchStatus = canSeePending ? true : r.status === "approved";

      return matchType && matchSem && matchSearch && matchStatus;
    });

  return (
    <section className="resource-grid-container">
      <p className="count">Showing {filtered.length} resources</p>
      <div className="resource-grid">
        {filtered.map((r) => (
          <ResourceCard key={r._id} resource={r} role={role} />
        ))}
      </div>
    </section>
  );
};

export default ResourceGrid;