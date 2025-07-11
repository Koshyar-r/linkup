import { notFound } from "next/navigation";
import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from "@/actions/profile.action";
import ProfilePageClient from "./ProfilePageClient";
import type { Metadata } from "next";

// ✅ Define PageProps with Promise-wrapped params (Next.js 15+)
interface PageProps {
  params: Promise<{ username: string }>;
}

// ✅ Correctly handle async `params` in metadata generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata | undefined> {
  const { username } = await params;
  const user = await getProfileByUsername(username);

  if (!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
}

// ✅ Correctly handle async `params` in the main page component
export default async function ProfilePageServer({ params }: PageProps) {
  const { username } = await params;
  const user = await getProfileByUsername(username);

  if (!user) notFound();

  const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);

  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isCurrentUserFollowing}
    />
  );
}