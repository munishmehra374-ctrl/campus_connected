export interface Question {
    _id: string;          // MongoDB unique ID
    title: string;        // Question title
    description: string;  // Detailed explanation
    status: "Pending" | "Unsolved" | "Solved"; // Current state
    votes: number;        // Number of upvotes
    tags: string[];       // Array of categories
    author: {
        id: string;       // User ID of the asker
        name: string;     // Name of the asker
    };
    answers: {            // Array of senior responses
        content: string;
        seniorName: string;
        createdAt: string;
    }[];
    createdAt: string;    // Timestamp from backend
}