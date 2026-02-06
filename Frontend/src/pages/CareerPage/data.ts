/**
 * TYPE DEFINITIONS FOR DYNAMIC CAREER ROADMAP
 * Updated to support both YouTube links and Local File Uploads (Multer).
 */

// 1. Interface for Senior Advice
export interface SeniorTip {
    author: string;
    text: string;
    date?: string;
}

// 2. Interface for the Unified Resource Library (YouTube & PDFs)
export interface CareerResource {
    _id?: string;
    title: string;
    url: string;      // Can be a YouTube link OR a path like "/uploads/file.pdf"
    type: 'video' | 'material'; // Distinguishes the icon and click behavior
    addedBy?: string; // Shows which Senior contributed the resource
    createdAt?: string;
}

// 3. Main Interface for the Career Domain
export interface CareerDomain {
    _id: string;         // Unique ID from MongoDB
    title: string;       // e.g., "Full Stack Developer"
    description: string; // Long-form info for the Detail Page
    demand: string;      // e.g., "High Demand"
    duration: string;    // e.g., "6-8 Months"
    color: string;       // Hex code for dynamic UI highlights
    skills: string[];    // Array for the Skill Pills
    roadmap: string[];   // Array for the Vertical Roadmap Steps
    seniorTips: SeniorTip[];

    // UPDATED: Now points to the unified resources array
    resources: CareerResource[];
}