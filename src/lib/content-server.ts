import "server-only";
import { BLOG_POSTS, type BlogPost } from "./blog";
import { PACKAGES, type Pkg } from "./packages";
import { getContent, setContent } from "./store";

const POSTS_KEY = "posts";
const PACKAGES_KEY = "packages";

/* ───────────── blog posts (static + developer-published) ───────────── */
export async function getDynamicPosts(): Promise<BlogPost[]> {
  return getContent<BlogPost[]>(POSTS_KEY, []);
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const dyn = await getDynamicPosts();
  // newest dynamic first, then the static seed articles
  return [...dyn, ...BLOG_POSTS];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return (await getAllPosts()).find((p) => p.slug === slug);
}

export async function addPost(post: BlogPost): Promise<void> {
  const dyn = await getDynamicPosts();
  await setContent(POSTS_KEY, [post, ...dyn.filter((p) => p.slug !== post.slug)]);
}

export async function deletePost(slug: string): Promise<void> {
  const dyn = await getDynamicPosts();
  await setContent(POSTS_KEY, dyn.filter((p) => p.slug !== slug));
}

/* ───────────── packages (defaults + developer edits) ───────────── */
export async function getPackagesMerged(): Promise<Pkg[]> {
  const stored = await getContent<Pkg[] | null>(PACKAGES_KEY, null);
  return stored && stored.length ? stored : PACKAGES;
}

export async function savePackagesList(list: Pkg[]): Promise<void> {
  await setContent(PACKAGES_KEY, list);
}
