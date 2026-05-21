import { useCallback, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ResourcesHero from "./components/ResourcesHero";
import ResourcesFilters from "./components/ResourcesFilters";
import ResourceGrid from "./components/ResourceGrid";
import UploadResource from "./components/UploadResource";
import AdminVerifyPanel from "./components/AdminVerifyPanel";
import "./style.css";

const ResourcesPage = () => {
    const { user, loading } = useAuth();
    const [type, setType] = useState("All");
    const [sem, setSem] = useState("All");
    const [search, setSearch] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
    }, []);

    if (loading) return <div className="resources-page loading-state">Loading resources...</div>;

    const currentRole = user?.role?.toLowerCase().trim() || "guest";
    const canUpload = currentRole === "junior" || currentRole === "senior" || currentRole === "admin";

    return (
        <div className="resources-page">
            <ResourcesHero />

            <ResourcesFilters
                type={type}
                setType={setType}
                sem={sem}
                setSem={setSem}
                search={search}
                setSearch={setSearch}
            />

            {canUpload && (
                <UploadResource role={currentRole} onSuccess={handleRefresh} />
            )}

            {currentRole === "admin" && (
                <AdminVerifyPanel refreshKey={refreshKey} onAction={handleRefresh} />
            )}

            <ResourceGrid
                type={type}
                sem={sem}
                search={search}
                role={currentRole}
                userId={user?._id}
                refreshKey={refreshKey}
                onRefresh={handleRefresh}
            />
        </div>
    );
};

export default ResourcesPage;
