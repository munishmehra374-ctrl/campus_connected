import { useState, useEffect } from "react";
import "./style.css";
import api from "../../api";
import QuestionCard from "./components/QuestionCard";
import AskQuestionModal from "./components/AskQuestionModal";
import { useAuth } from "../../context/AuthContext";

const MentorshipPage = () => {
    const { user }: any = useAuth();
    const [questions, setQuestions] = useState([]);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [isAskModalOpen, setIsAskModalOpen] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await api.get("/api/questions");
                setQuestions(res.data);
            } catch (err) { console.error(err); }
        };
        fetchQuestions();
    }, []);

    const filteredQuestions = questions.filter((q: any) => {
        const matchSearch = q.title.toLowerCase().includes(search.toLowerCase());
        const isVisible = q.status !== "Pending" || user?.role === "admin" || user?._id === q.author?.id;
        const matchStatus = filter === "All" ? true : q.status === filter;
        return matchSearch && matchStatus && isVisible;
    });

    return (
        <div className="mentorship-page">
            <section className="mentorship-hero">
                <span className="badge">💬 Mentorship Q&A</span>
                <h1>Get Guidance from Seniors</h1>
                <p>Questions are moderated by admins to ensure quality guidance.</p>
            </section>

            <div className="mentor-search-container">
                <div className="search-row">
                    <input
                        type="text"
                        className="search-box"
                        placeholder="🔍 Search questions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {user?.role === "junior" && (
                        <button className="ask-btn" onClick={() => setIsAskModalOpen(true)}>
                            + Ask Question
                        </button>
                    )}
                </div>

                <div className="mentor-filters">
                    {["All", "Solved", "Unsolved"].map((f) => (
                        <button
                            key={f}
                            className={`filter-btn ${filter === f ? "active" : ""}`}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                    {user?.role === "admin" && (
                        <button
                            className={`filter-btn ${filter === "Pending" ? "active" : ""}`}
                            onClick={() => setFilter("Pending")}
                        >
                            Pending Approval
                        </button>
                    )}
                </div>
            </div>

            <div className="questions-list">
                {filteredQuestions.map((q: any) => (
                    <QuestionCard key={q._id} question={q} />
                ))}
            </div>

            {isAskModalOpen && <AskQuestionModal onClose={() => setIsAskModalOpen(false)} />}
        </div>
    );
};

export default MentorshipPage;