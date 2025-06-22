"use client";
import Link from "next/link";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getUserMatches } from "../../lib/explore/matches";
import { getUserProfile } from "../../lib/profile/userProfile";
import { auth } from "../../lib/services/firebase";

function WalletConnectTrigger() {
  const { openConnectModal } = useConnectModal();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user && openConnectModal) {
        openConnectModal();
      }
    });
    return () => unsubscribe();
  }, [auth, openConnectModal]);

  return null;
}

// Reusable StatCard
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center bg-[#1d2542]/80 backdrop-blur-lg rounded-xl px-5 py-4 border border-cyan-500/20 shadow-md w-24 sm:w-28">
      <span className="text-2xl font-bold text-cyan-300">{value}</span>
      <span className="text-sm text-cyan-100 mt-1">{label}</span>
    </div>
  );
}

// Reusable DashboardCard
function DashboardCard({
  title,
  desc,
  link,
  button,
  icon,
}: {
  title: string;
  desc: string;
  link: string;
  button: string;
  icon: string;
}) {
  return (
    <Link href={link} className="block h-full" aria-label={title}>
      <div className="relative rounded-2xl p-6 sm:p-8 shadow-xl border border-cyan-400/10 bg-[#121934]/90 hover:scale-[1.04] transition-transform duration-200 group flex flex-col items-center h-full">
        <span className="text-5xl mb-4">{icon}</span>
        <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 text-center">{title}</h3>
        <p className="text-cyan-100 text-sm sm:text-base text-center mb-6">{desc}</p>
        <button
          className="mt-auto bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] font-bold py-2 px-6 rounded-lg shadow transition"
          tabIndex={-1}
          aria-label={button}
        >
          {button}
        </button>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    matches: 0,
    activities: 0,
    messages: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        // Fetch matches
        const matches = await getUserMatches(currentUser.uid);
        
        // Fetch user profile for additional stats
        const profile = await getUserProfile(currentUser.uid);
        
        setStats({
          matches: matches.length,
          activities: profile?.activities?.length || 0,
          messages: profile?.messages?.length || 0
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Refresh stats when user changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchStats();
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen font-sans relative overflow-hidden bg-gradient-to-br from-[#0a0f2c] via-[#1a237e] to-[#0f1e4b]">
      {/* Background Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-cyan-400 opacity-20 rounded-full blur-2xl -z-10" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[350px] h-[350px] bg-blue-700 opacity-30 rounded-full blur-2xl -z-10" />

      {/* Navbar */}
      <nav className="sticky top-0 z-20 backdrop-blur-lg bg-[#0a0f2c]/70 rounded-b-2xl shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center py-4 px-3 gap-3 sm:py-5">
          <span className="text-xl sm:text-3xl font-extrabold text-white font-[Poppins] drop-shadow-lg">
            HomieFinder
          </span>
          <div className="flex flex-wrap gap-2 items-center">
            <Link href="/explore" className="text-cyan-200 hover:text-white transition font-semibold px-3 py-1 rounded text-sm sm:text-base">
              Explore
            </Link>
            <Link href="/community" className="text-cyan-200 hover:text-white transition font-semibold px-3 py-1 rounded text-sm sm:text-base">
              Community
            </Link>
            <Link href="/profile" className="text-cyan-200 hover:text-white transition font-semibold px-3 py-1 rounded text-sm sm:text-base">
              Profile
            </Link>
            <Link href="/" className="bg-cyan-400 text-[#0a0f2c] px-4 py-1 rounded-lg font-bold shadow hover:bg-cyan-300 transition text-sm sm:text-base">
              Logout
            </Link>
            <ConnectButton showBalance={false} />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 flex flex-col items-center">
        {/* Welcome Header */}
        <div className="mt-10 sm:mt-14 text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-[Poppins] drop-shadow mb-3">
            Welcome to your Dashboard!
          </h1>
          <p className="text-cyan-100 text-base sm:text-xl font-[Inter]">
            Your productivity hub. Connect, collaborate, and reach your goals.
          </p>
        </div>

        <WalletConnectTrigger />

        {/* Stat Cards */}
        <div className="flex gap-4 flex-wrap justify-center w-full mb-12">
          <StatCard label="Matches" value={loading ? 0 : stats.matches} />
          <StatCard label="Activities" value={loading ? 0 : stats.activities} />
          <StatCard label="Messages" value={loading ? 0 : stats.messages} />
        </div>

        {/* Dashboard Feature Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <DashboardCard
            title="Explore & Connect"
            desc="Find collaborators aligned with your goals."
            link="/explore"
            button="Explore"
            icon="🤝"
          />
          <DashboardCard
            title="Activities & Chats"
            desc="View your chats, events, and activities."
            link="/activities"
            button="View"
            icon="📅"
          />
          <DashboardCard
            title="Trending Events"
            desc="Discover trending events and activities."
            link="/events"
            button="Browse"
            icon="🚀"
          />
        </div>

        {/* Feedback Section */}
        <div className="w-full max-w-xl text-center mb-16">
          <div className="p-6 sm:p-7 bg-[#1d2542]/80 backdrop-blur-lg rounded-xl border border-cyan-400/20 shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">💬 Feedback?</h2>
            <p className="text-cyan-100 mb-4">
              We value your input — help us improve your experience.
            </p>
            <Link
              href="/help"
              className="inline-block bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] font-bold py-2 px-6 rounded-lg shadow transition text-sm sm:text-base"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5 text-center text-xs sm:text-sm text-cyan-200 backdrop-blur-md border-t border-cyan-300/10">
        &copy; {new Date().getFullYear()} HomieFinder. All rights reserved.
      </footer>
    </div>
  );
}
