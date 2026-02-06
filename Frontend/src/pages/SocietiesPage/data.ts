export interface Society {
    id: number;
    name: string;
    tagline: string;
    description: string;
    members: number;
    events: number;
    color: string;
}

export interface SocietyPost {
    id: number;
    society: string;
    tag: "Announcement" | "Volunteer" | "Workshop";
    title: string;
    description: string;
    time: string;
    likes: number;
    action?: string;
}

export const societiesData: Society[] = [
    {
        id: 1,
        name: "CodeClub",
        tagline: "Code. Build. Innovate.",
        description: "The coding enthusiasts' hub. We organize bootcamps, contests, and project showcases.",
        members: 450,
        events: 24,
        color: "linear-gradient(135deg,#4f7cff,#6a5cff)"
    },
    {
        id: 2,
        name: "AI/ML Club",
        tagline: "Exploring the future of intelligence",
        description: "Dedicated to artificial intelligence and machine learning research and projects.",
        members: 280,
        events: 18,
        color: "linear-gradient(135deg,#c850c0,#4158d0)"
    },
    {
        id: 3,
        name: "Blockchain Society",
        tagline: "Decentralize everything",
        description: "Building the Web3 future. Workshops on smart contracts, DeFi, and NFTs.",
        members: 120,
        events: 12,
        color: "linear-gradient(135deg,#ff7a18,#ff3d00)"
    },
    {
        id: 4,
        name: "Design Circle",
        tagline: "Where pixels meet purpose",
        description: "UI/UX design, graphic design, and creative workshops for aspiring designers.",
        members: 200,
        events: 15,
        color: "linear-gradient(135deg,#ec4899,#ef4444)"
    },
    {
        id: 5,
        name: "Photography Club",
        tagline: "Capturing moments",
        description: "Photo walks, editing workshops, and exhibitions. All skill levels welcome!",
        members: 180,
        events: 20,
        color: "linear-gradient(135deg,#22c55e,#06b6d4)"
    },
    {
        id: 6,
        name: "Robotics Club",
        tagline: "Building tomorrow’s machines",
        description: "From Arduino to advanced robotics. Participate in competitions and build cool bots!",
        members: 150,
        events: 10,
        color: "linear-gradient(135deg,#0ea5e9,#2563eb)"
    }
];

export const postsData: SocietyPost[] = [
    {
        id: 1,
        society: "CodeClub",
        tag: "Announcement",
        title: "Web Dev Bootcamp Registration Open!",
        description: "Learn React, Node.js and deployment in our intensive bootcamp. Limited seats available!",
        time: "2 hours ago",
        likes: 45
    },
    {
        id: 2,
        society: "AI/ML Club",
        tag: "Volunteer",
        title: "Looking for ML Project Team Members",
        description: "Starting a computer vision project for traffic analysis. Need 3 more team members.",
        time: "5 hours ago",
        likes: 32,
        action: "Volunteer"
    },
    {
        id: 3,
        society: "Design Circle",
        tag: "Workshop",
        title: "Figma Workshop This Saturday",
        description: "Free hands-on Figma workshop for beginners. Bring your laptops!",
        time: "1 day ago",
        likes: 78
    },
    {
        id: 4,
        society: "Blockchain Society",
        tag: "Volunteer",
        title: "Volunteers Needed for Tech Fest Booth",
        description: "Help us run the blockchain demo booth at the annual tech fest. Certificates provided.",
        time: "2 days ago",
        likes: 23,
        action: "Volunteer"
    },
    {
        id: 5,
        society: "Photography Club",
        tag: "Announcement",
        title: "Photo Exhibition Submission Open",
        description: "Submit your best campus shots for our annual exhibition. Theme: Campus Life.",
        time: "3 days ago",
        likes: 56
    }
];
