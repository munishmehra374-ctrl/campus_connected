import SocietyCard from "./SocietyCard";

// 1. Define the same interface used in the Card for consistency
interface Society {
    _id?: string;
    id?: number;
    name: string;
    tagline: string;
    description: string;
    members: any[];
    color: string;
}

interface Props {
    societies: Society[];
}

const SocietyList = ({ societies }: Props) => {
    return (
        <div className="society-grid">
            {societies.map((s) => (
                /* 2. Update the key to use _id from MongoDB, falling back to id */
                <SocietyCard key={s._id || s.id} society={s} />
            ))}
        </div>
    );
};

export default SocietyList;