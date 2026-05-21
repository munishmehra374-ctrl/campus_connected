import type { Question } from "../types";
import QuestionCard from "./QuestionCard";

interface Props {
    questions: Question[];
    onUpdateQuestion?: (q: Question) => void;
}

const QuestionList = ({ questions, onUpdateQuestion }: Props) => {
    const onUpdate = onUpdateQuestion || (() => {});

    return (
        <div className="questions-list">
            {questions.map((q) => (
                <QuestionCard key={q._id} question={q} onUpdate={onUpdate} />
            ))}
        </div>
    );
};

export default QuestionList;
