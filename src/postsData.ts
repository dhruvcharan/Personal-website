export interface PostMetadata {
  title: string;
  date: string; 
  slug: string;
  excerpt: string;
  markdownPath: string; 
}

export const postsMetadata: PostMetadata[] = [
    {
      title: 'ChatGPT Or how I learned to Stop Prompting and love the process',
      date: '2025-02-19',
      slug: 'chatgpt',
      excerpt: ' A look at the potential n>1th order implications of the pervasive use of LLMs as a proxy for the human brain particularly in Software Development',
      markdownPath: '/posts/blog-1.md' 
    },
];

export const getSortedPostsMetadata = (): PostMetadata[] => {
  return postsMetadata.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const getPostMetadataBySlug = (slug: string): PostMetadata | undefined => {
    return postsMetadata.find(post => post.slug === slug);
    }