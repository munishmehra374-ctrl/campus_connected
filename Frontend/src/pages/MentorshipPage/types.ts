export type QuestionStatus = "Pending" | "Unsolved" | "Solved";

export interface ThreadMessage {
    _id: string;
    senderId: string;
    senderName: string;
    senderRole: "junior" | "senior" | "admin";
    content: string;
    createdAt: string;
    deletedAt?: string | null;
}

export interface MentorshipThread {
    _id: string;
    questionId: string;
    juniorId: string;
    seniorId: string;
    seniorName: string;
    linkedPublicAnswerId?: string | null;
    messages: ThreadMessage[];
    messageCount?: number;
    lastActivityAt?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface PublicAnswer {
    _id: string;
    seniorId: string;
    seniorName: string;
    content: string;
    createdAt: string;
}

export interface SolvedMeta {
    solvedAt?: string | null;
    solvedByJuniorId?: string | null;
    helpedBySeniorId?: string | null;
    helpedBySeniorName?: string | null;
}

export interface Question {
    _id: string;
    title: string;
    description: string;
    status: QuestionStatus;
    votes: number;
    tags: string[];
    author: {
        id: string;
        name: string;
        role?: string;
    };
    publicAnswers: PublicAnswer[];
    mentorshipThreads?: MentorshipThread[];
    threadCount?: number;
    solvedMeta?: SolvedMeta;
    solvedByJunior?: boolean;
    hiddenFor?: string[];
    createdAt: string;
}

export type NotificationItem = {
    _id: string;
    type: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
    meta?: {
        questionId?: string;
        threadId?: string;
    };
};
