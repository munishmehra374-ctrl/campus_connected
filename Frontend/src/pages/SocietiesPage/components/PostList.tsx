// import PostCard from "./PostCard";

// // 1. Define the Post interface locally so we don't depend on static mock data
// interface SocietyPost {
//     id?: string | number;
//     _id?: string;
//     title: string;
//     content: string;
//     date?: string;
// }

// interface Props {
//     posts: SocietyPost[];
// }

// const PostList = ({ posts }: Props) => {
//     // 2. Add a safety check: If there are no posts, show a friendly message
//     if (!posts || posts.length === 0) {
//         return (
//             <div className="no-posts">
//                 <p>No announcements yet. Stay tuned!</p>
//             </div>
//         );
//     }

//     return (
//         <div className="posts-list">
//             {posts.map((p) => (
//                 // 3. Use MongoDB _id or local id for the key
//                 <PostCard key={p._id || p.id} post={p} />
//             ))}
//         </div>
//     );
// };

// export default PostList;