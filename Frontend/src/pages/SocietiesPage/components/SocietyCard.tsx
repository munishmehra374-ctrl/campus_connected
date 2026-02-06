// src/pages/Societies/components/SocietyCard.tsx
import { Link } from "react-router-dom";

interface Society {
    _id?: string; // MongoDB ID
    id?: number;  // Local ID
    name: string;
    tagline: string;
    description: string;
    members: any[];
    color: string;
}

interface SocietyCardProps {
    society: Society;
}

const SocietyCard = ({ society }: SocietyCardProps) => {
    // Ensure we have a valid ID for the URL
    const societyId = society._id || society.id;

    return (
        <Link to={`/societies/${societyId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="society-card">
                <div className="society-banner" style={{ background: society.color || '#4f7cff' }}>
                    🎓
                </div>
                <div className="society-body">
                    <h3>{society.name}</h3>
                    <span className="tagline">{society.tagline}</span>
                    <p>{society.description}</p>
                    <div className="society-meta">
                        <span>👥 {society.members?.length || 0} members</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default SocietyCard;