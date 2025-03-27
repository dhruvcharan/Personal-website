import Markdown from 'react-markdown';
import post1Content from 'src/posts/blog-1.md?raw';

export interface PostMetadata { 
    title: string;
    date: string;
    slug: string;
    excerpt: string;
    }

export interface Post extends PostMetadata {
    content: string;
}

export const posts: Post[] = [
    {
        title: 'ChatGPT Or how I learned to Stop Prompting and love the process',
        date: '2025-02-19',
        slug: 'chatgpt',
        excerpt: ' A look at the potential n>1th order implications of the pervasive use of LLMs as a proxy for the human brain particularly in Software Development',
        content: post1Content
    }
];

export const getSortedPosts = (): Post[] => {
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getPostBySlug = (slug: string): Post | undefined => {
    return posts.find(post => post.slug === slug);
};
    