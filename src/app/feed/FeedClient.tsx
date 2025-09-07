"use client";
import SwipeDeck, { type Profile } from "@/components/SwipeDeck";

export default function FeedClient({ profiles }: { profiles: Profile[] }) {
  return (
    <div className="mx-auto max-w-md">
      <SwipeDeck profiles={profiles} />
    </div>
  );
}
