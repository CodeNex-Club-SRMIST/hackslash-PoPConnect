"use client";
import React, { useEffect, useState } from "react";
import { getUserMatches } from "../../lib/explore/matches";
import { auth } from "../../lib/services/firebase";
import Link from "next/link";

export default function ChatListPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      if (auth.currentUser) {
        const data = await getUserMatches(auth.currentUser.uid);
        setMatches(data);
      }
      setLoading(false);
    }
    fetchMatches();
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0f2c] via-[#1a237e] to-[#0f1e4b] items-center justify-center p-8">
      <div className="w-full max-w-xl bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-cyan-400/10 p-8">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Your Matches</h1>
        {loading ? (
          <div className="text-cyan-200 text-center">Loading...</div>
        ) : matches.length === 0 ? (
          <div className="text-cyan-200 text-center">No matches yet.</div>
        ) : (
          <ul className="space-y-4">
            {matches.map((match) => {
              // Find the other user's id
              const otherUserId = match.users.find((id: string) => id !== auth.currentUser?.uid);
              return (
                <li key={match.id} className="flex items-center justify-between bg-[#181f3a] rounded-xl p-4 border border-cyan-400/20">
                  <span className="text-cyan-100 font-semibold">Match with: {otherUserId}</span>
                  <Link href={`/chat/${match.id}`} className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] font-bold py-2 px-4 rounded-lg shadow transition text-base">Chat</Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
