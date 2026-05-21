import { useState, useEffect, useCallback } from "react";

import "./style.css";

import { fetchQuestions } from "../../api";

import QuestionCard from "./components/QuestionCard";

import AskQuestionModal from "./components/AskQuestionModal";

import { useAuth } from "../../context/AuthContext";

import type { Question } from "./types";



const MentorshipPage = () => {

    const { user } = useAuth();

    const [questions, setQuestions] = useState<Question[]>([]);

    const [filter, setFilter] = useState("All");

    const [search, setSearch] = useState("");

    const [isAskModalOpen, setIsAskModalOpen] = useState(false);

    const [loading, setLoading] = useState(true);



    const loadQuestions = useCallback(async () => {

        try {

            const res = await fetchQuestions();

            setQuestions(res.data);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    }, []);



    useEffect(() => {

        loadQuestions();

    }, [loadQuestions]);



    const handleQuestionUpdate = (updated: Question) => {

        setQuestions((prev) => prev.map((q) => (q._id === updated._id ? updated : q)));

    };



    const handleQuestionHide = (questionId: string) => {

        setQuestions((prev) => prev.filter((q) => q._id !== questionId));

    };



    const filteredQuestions = questions.filter((q) => {

        const matchSearch =

            q.title.toLowerCase().includes(search.toLowerCase()) ||

            q.description.toLowerCase().includes(search.toLowerCase());

        const isVisible =

            q.status !== "Pending" ||

            user?.role === "admin" ||

            user?._id === q.author?.id;

        const matchStatus =

            filter === "All"

                ? true

                : filter === "Open"

                  ? q.status === "Unsolved"

                  : filter === "Solved"

                    ? q.status === "Solved"

                    : q.status === filter;

        return matchSearch && matchStatus && isVisible;

    });



    return (

        <div className="mentorship-page">

            <section className="mentorship-hero">

                <span className="badge">Mentorship Hub</span>

                <h1>Build Real Mentor Relationships</h1>

                <p className="moderation-notice">

                    Public answers build community knowledge. Private chats with mentors stay between you and them —

                    start a private thread from any public answer.

                </p>

            </section>



            <div className="mentor-search-container">

                <div className="search-row">

                    <input

                        type="text"

                        className="search-box"

                        placeholder="Search discussions…"

                        value={search}

                        onChange={(e) => setSearch(e.target.value)}

                    />

                    {user?.role === "junior" && (

                        <button type="button" className="ask-btn" onClick={() => setIsAskModalOpen(true)}>

                            + Ask Question

                        </button>

                    )}

                </div>



                <div className="mentor-filters">

                    {["All", "Open", "Solved", "Pending"].map((f) => {

                        if (f === "Pending" && user?.role !== "admin") return null;

                        return (

                            <button

                                key={f}

                                type="button"

                                className={`filter-btn ${filter === f ? "active" : ""}`}

                                onClick={() => setFilter(f)}

                            >

                                {f === "Open" ? "Open" : f}

                            </button>

                        );

                    })}

                </div>

            </div>



            <div className="questions-list">

                {loading && <p className="loading-text">Loading mentorship discussions…</p>}

                {!loading && filteredQuestions.length === 0 && (

                    <p className="empty-text">No discussions found. Be the first to ask!</p>

                )}

                {filteredQuestions.map((q) => (

                    <QuestionCard

                        key={q._id}

                        question={q}

                        onUpdate={handleQuestionUpdate}

                        onHide={handleQuestionHide}

                        pollActive

                    />

                ))}

            </div>



            {isAskModalOpen && (

                <AskQuestionModal

                    onClose={() => setIsAskModalOpen(false)}

                    onSuccess={() => {

                        setIsAskModalOpen(false);

                        loadQuestions();

                    }}

                />

            )}

        </div>

    );

};



export default MentorshipPage;

