import { useState } from "react";
import { useAuth } from "../../context/AuthContext"; // Ensure path is correct
import ResourcesHero from "./components/ResourcesHero";
import ResourcesFilters from "./components/ResourcesFilters";
import ResourceGrid from "./components/ResourceGrid";
import UploadResource from "./components/UploadResource";
import AdminVerifyPanel from "./components/AdminVerifyPanel";
import "./style.css";

const ResourcesPage = () => {
    const { user, loading } = useAuth(); // Pull real user data
    const [type, setType] = useState("All");
    const [sem, setSem] = useState("All");
    const [search, setSearch] = useState("");

    // Professional handle for loading states
    if (loading) return <div className="loading">Loading resources...</div>;

    // Normalize role to lowercase to avoid "Admin" vs "admin" bugs
    const currentRole = user?.role?.toLowerCase().trim() || "guest";

    return (
        <div className="resources-page">
            <ResourcesHero />

            <ResourcesFilters
                type={type} setType={setType}
                sem={sem} setSem={setSem}
                search={search} setSearch={setSearch}
                role={currentRole} 
            />

            {/* Role-based UI components */}
            {(currentRole === "senior" || currentRole === "admin") && (
                <UploadResource />
            )}

            {currentRole === "admin" && (
                <AdminVerifyPanel />
            )}

            <ResourceGrid
                type={type}
                sem={sem}
                search={search}
                role={currentRole} 
            />
        </div>
    );
};

export default ResourcesPage;