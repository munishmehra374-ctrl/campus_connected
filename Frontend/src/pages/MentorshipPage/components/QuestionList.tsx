import type { Question } from "../data";
import QuestionCard from "./QuestionCard";

interface Props {
    questions: Question[];
}

const QuestionList = ({ questions }: Props) => {
    return (
        <div className="questions-list">
            {questions.map((q) => (
                <QuestionCard key={q.id} question={q} />
            ))}
        </div>
    );
};

export default QuestionList;
