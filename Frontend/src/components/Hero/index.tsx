import "./style.css";
import { useNavigate } from "react-router-dom";

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="hero">
            <h1>
                Connect. Learn. <span>Grow Together.</span>
            </h1>
            <p>
                Campus Connected bridges juniors and seniors through shared resources,
                mentorship, and community.
            </p>
            <div className="hero-buttons">
                <button className="primary-btn"
                onClick={()=>navigate("/societies")}
                >Join the Community
                </button>

                <button
                    className="secondary-btn"
                    onClick={() => navigate("/resources")}
                >
                    Explore Resources
                </button>
            </div>
        </section>
    );
};

export default Hero;
