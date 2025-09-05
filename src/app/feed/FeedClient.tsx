"use client";

import { useEffect, useState, useRef } from "react";
import TinderCard from "react-tinder-card";
import Image from "next/image";

type UserCard = {
  id: string;
  name: string | null;
  image: string | null;
  age?: number;
  gender?: string | null;
};

export default function FeedClient() {
  const [cards, setCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const childRefs = useRef<any[]>([]);

  const fetchCards = async (cursor?: string) => {
    setLoading(true);
    const res = await fetch(`/api/feed${cursor ? `?cursor=${cursor}` : ""}`);
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const text = await res.text();
    if (!text) {
      setLoading(false);
      return;
    }
    const data = JSON.parse(text);
    setCards((prev) => [...prev, ...data.users]);
    setNextCursor(data.nextCursor);
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleSwipe = async (dir: string, id: string, idx: number) => {
    if (dir === "right") {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toId: id }),
      });
      const data = await res.json();
      if (data.matched) {
        setAlert("It's a match!");
        setTimeout(() => setAlert(null), 2000);
      }
    } else if (dir === "left") {
      await fetch("/api/dislike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toId: id }),
      });
    }
    setCards((prev) => prev.filter((_, i) => i !== idx));
    if (cards.length <= 3 && nextCursor) {
      fetchCards(nextCursor);
    }
  };

  const swipe = (dir: "left" | "right") => {
    const idx = cards.length - 1;
    if (idx < 0) return;
    childRefs.current[idx].swipe(dir);
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center min-h-screen">
      {alert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
          {alert}
        </div>
      )}
      <div className="relative w-full h-96 mb-6">
        {cards.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400">
            {loading ? "Loading..." : "No more candidates"}
          </div>
        )}
        {cards.map((card, idx) => (
          <TinderCard
            key={card.id}
            ref={(el) => (childRefs.current[idx] = el)}
            onSwipe={(dir) => handleSwipe(dir, card.id, idx)}
            preventSwipe={["up", "down"]}
            className="absolute w-full h-full"
          >
            <div className="bg-white rounded-xl shadow-lg w-full h-full flex flex-col items-center justify-center p-6">
              <div className="w-32 h-32 mb-4 relative">
                {card.image ? (
                  <Image
                    src={card.image}
                    alt={card.name || "Avatar"}
                    fill
                    className="object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-4xl text-gray-400">
                    ?
                  </div>
                )}
              </div>
              <div className="text-lg font-bold">{card.name}</div>
              {card.age && (
                <div className="text-sm text-gray-500 mb-1">{card.age} years</div>
              )}
              <div className="text-sm text-gray-500">{card.gender}</div>
            </div>
          </TinderCard>
        ))}
      </div>
      <div className="flex gap-8 mt-2">
        <button
          className="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow"
          onClick={() => swipe("left")}
        >
          ❌
        </button>
        <button
          className="bg-pink-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow"
          onClick={() => swipe("right")}
        >
          ❤️
        </button>
      </div>
    </div>
  );
}