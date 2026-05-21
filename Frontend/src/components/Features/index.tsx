import { useNavigate } from "react-router-dom";
import "./style.css";

interface Feature {
    title: string;
    route: string;
}

const features: Feature[] = [
    { title: "Resource Hub", route: "/resources" },
    { title: "Mentorship Q&A", route: "/mentorship" },
    { title: "Events & Workshops", route: "/campus-hub" },
    { title: "Verified Resources", route: "/resources" },
    { title: "Career Roadmaps", route: "/career" },
];

const Features = () => {
    const navigate = useNavigate();

    return (
        <section className="features">
            <h2>Everything You Need, In One Place</h2>

            <div className="feature-grid">
                {features.map((f) => (
                    <div
                        key={f.title}
                        className="feature-card"
                        onClick={() => navigate(f.route)}
                    >
                        <h3>{f.title}</h3>
                        <button className="feature-btn">Explore →</button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Features;
