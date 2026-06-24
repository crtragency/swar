import { NextResponse } from "next/server";
import { getAllPosts, addPost, deletePost } from "@/lib/content-server";
import type { BlogPost } from "@/lib/blog";

export const dynamic = "force-dynamic";

const DEV_PASSWORD = process.env.DEV_PASSWORD || "sewardev";
const ok = (req: Request) =>
  (req.headers.get("x-dev-password") || new URL(req.url).searchParams.get("password")) === DEV_PASSWORD;

export async function GET(req: Request) {
  if (!ok(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  // Return every live article (static seed + developer-managed) so the studio
  // can list, edit and delete all of them.
  return NextResponse.json({ posts: await getAllPosts() });
}

export async function POST(req: Request) {
  if (!ok(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let post: BlogPost;
  try {
    post = (await req.json()).post as BlogPost;
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (!post?.slug || !post?.title) return NextResponse.json({ error: "missing post" }, { status: 422 });
  await addPost(post);
  return NextResponse.json({ ok: true, slug: post.slug });
}

export async function DELETE(req: Request) {
  if (!ok(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "missing slug" }, { status: 422 });
  await deletePost(slug);
  return NextResponse.json({ ok: true });
}
