"use client";

import React, { useState, useEffect } from "react";
import { auth } from "../../lib/services/firebase";
import { getUserMatches } from "../../lib/explore/matches";
import { getUserProfile } from "../../lib/profile/userProfile";
import Link from "next/link";

interface Match {
  id: string;
  users: string[];
  createdAt: any;
  otherUser?: {
    id: string;
    name: string;
    img: string;
    bio: string;
  };
}

interface Activity {
  id: string;
  type: 'chat' | 'event' | 'hackathon' | 'meetup';
  title: string;
  description: string;
  date: any;
  participants: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
}

export default function ActivitiesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedTab, setSelectedTab] = useState<'chats' | 'events' | 'all'>('chats');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        setCurrentUser(user);
        try {
          // Fetch matches
          const userMatches = await getUserMatches(user.uid);
          
          // Fetch other user details for each match
          const matchesWithUserDetails = await Promise.all(
            userMatches.map(async (match: any) => {
              const otherUserId = match.users.find((id: string) => id !== user.uid);
              if (otherUserId) {
                const otherUserProfile = await getUserProfile(otherUserId);
                return {
                  ...match,
                  otherUser: otherUserProfile ? {
                    id: otherUserId,
                    name: otherUserProfile.name || 'Unknown User',
                    img: otherUserProfile.img || '/avatar1.png',
                    bio: otherUserProfile.bio || 'No bio available'
                  } : {
                    id: otherUserId,
                    name: 'Unknown User',
                    img: '/avatar1.png',
                    bio: 'No bio available'
                  }
                };
              }
              return match;
            })
          );
          
          // Fetch user profile for additional stats
          const profile = await getUserProfile(user.uid);
          
          setMatches(matchesWithUserDetails as Match[]);
          setActivities(profile?.activities || []);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredActivities = activities.filter(activity => {
    if (selectedTab === 'chats') return activity.type === 'chat';
    if (selectedTab === 'events') return activity.type !== 'chat';
    return true;
  });

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0f2c] via-[#1a237e] to-[#0f1e4b] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-700 opacity-30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 opacity-20 rounded-full blur-2xl -z-10" />
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-cyan-200 text-lg">Loading your activities...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0f2c] via-[#1a237e] to-[#0f1e4b] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-700 opacity-30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 opacity-20 rounded-full blur-2xl -z-10" />
      
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-lg bg-[#0a0f2c]/70 rounded-b-2xl shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center py-4 px-6">
          <Link href="/dashboard" className="text-cyan-200 hover:text-white transition font-semibold">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">Activities & Chats</h1>
          <div className="text-cyan-200 text-sm">
            {matches.length} matches
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="flex-1 max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-[#1d2542]/50 rounded-xl p-2">
          <button
            onClick={() => setSelectedTab('chats')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              selectedTab === 'chats'
                ? 'bg-cyan-400 text-[#0a0f2c]'
                : 'text-cyan-200 hover:text-white'
            }`}
          >
            💬 Chats ({matches.length})
          </button>
          <button
            onClick={() => setSelectedTab('events')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              selectedTab === 'events'
                ? 'bg-cyan-400 text-[#0a0f2c]'
                : 'text-cyan-200 hover:text-white'
            }`}
          >
            📅 Events ({activities.filter(a => a.type !== 'chat').length})
          </button>
          <button
            onClick={() => setSelectedTab('all')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              selectedTab === 'all'
                ? 'bg-cyan-400 text-[#0a0f2c]'
                : 'text-cyan-200 hover:text-white'
            }`}
          >
            🎯 All Activities
          </button>
        </div>

        {/* Content */}
        {selectedTab === 'chats' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Your Matches & Chats</h2>
            
            {matches.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-white mb-2">No matches yet</h3>
                <p className="text-cyan-200 mb-6">
                  Start exploring to find people to connect with!
                </p>
                <Link
                  href="/explore"
                  className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] px-8 py-3 rounded-xl font-bold shadow-lg transition"
                >
                  Start Exploring
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20 hover:scale-[1.02] transition-transform"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                        {match.otherUser?.img ? (
                          <img 
                            src={match.otherUser.img} 
                            alt={match.otherUser.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">👤</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {match.otherUser?.name || 'Unknown User'}
                        </h3>
                        <p className="text-cyan-200 text-sm">
                          Matched {match.createdAt?.toDate?.() ? 
                            new Date(match.createdAt.toDate()).toLocaleDateString() : 
                            'Recently'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-cyan-100 text-sm mb-4">
                      {match.otherUser?.bio || 'Start a conversation to learn more!'}
                    </p>
                    
                    <div className="flex gap-2">
                      <Link
                        href={`/chat/${match.id}`}
                        className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] py-2 px-4 rounded-lg font-semibold text-center transition"
                      >
                        Chat
                      </Link>
                      <Link
                        href={`/user/${match.otherUser?.id}`}
                        className="bg-[#1d2542] hover:bg-[#2a3655] text-cyan-200 py-2 px-4 rounded-lg font-semibold transition"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'events' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Events & Activities</h2>
            
            {activities.filter(a => a.type !== 'chat').length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-white mb-2">No events yet</h3>
                <p className="text-cyan-200 mb-6">
                  Check out trending events to discover activities!
                </p>
                <Link
                  href="/events"
                  className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] px-8 py-3 rounded-xl font-bold shadow-lg transition"
                >
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.filter(a => a.type !== 'chat').map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20 hover:scale-[1.02] transition-transform"
                  >
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                        activity.type === 'hackathon' ? 'bg-purple-400/20' :
                        activity.type === 'meetup' ? 'bg-green-400/20' :
                        'bg-blue-400/20'
                      }`}>
                        <span className="text-2xl">
                          {activity.type === 'hackathon' ? '💻' :
                           activity.type === 'meetup' ? '🤝' : '📅'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{activity.title}</h3>
                        <p className="text-cyan-200 text-sm">
                          {activity.date?.toDate?.() ? 
                            new Date(activity.date.toDate()).toLocaleDateString() : 
                            'TBD'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-cyan-100 text-sm mb-4">{activity.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        activity.status === 'upcoming' ? 'bg-yellow-400/20 text-yellow-200' :
                        activity.status === 'ongoing' ? 'bg-green-400/20 text-green-200' :
                        'bg-gray-400/20 text-gray-200'
                      }`}>
                        {activity.status}
                      </span>
                      <span className="text-cyan-200 text-sm">
                        {activity.participants.length} participants
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'all' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">All Activities</h2>
            
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-white mb-2">No activities yet</h3>
                <p className="text-cyan-200 mb-6">
                  Start exploring and check out trending events to see activities here!
                </p>
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/explore"
                    className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] px-6 py-3 rounded-xl font-bold shadow-lg transition"
                  >
                    Explore
                  </Link>
                  <Link
                    href="/events"
                    className="bg-[#1d2542] hover:bg-[#2a3655] text-cyan-200 px-6 py-3 rounded-xl font-bold shadow-lg transition"
                  >
                    Browse Events
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20 hover:scale-[1.01] transition-transform"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                          activity.type === 'chat' ? 'bg-cyan-400/20' :
                          activity.type === 'hackathon' ? 'bg-purple-400/20' :
                          activity.type === 'meetup' ? 'bg-green-400/20' :
                          'bg-blue-400/20'
                        }`}>
                          <span className="text-2xl">
                            {activity.type === 'chat' ? '💬' :
                             activity.type === 'hackathon' ? '💻' :
                             activity.type === 'meetup' ? '🤝' : '📅'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{activity.title}</h3>
                          <p className="text-cyan-200 text-sm">
                            {activity.date?.toDate?.() ? 
                              new Date(activity.date.toDate()).toLocaleDateString() : 
                              'TBD'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          activity.status === 'upcoming' ? 'bg-yellow-400/20 text-yellow-200' :
                          activity.status === 'ongoing' ? 'bg-green-400/20 text-green-200' :
                          'bg-gray-400/20 text-gray-200'
                        }`}>
                          {activity.status}
                        </span>
                        {activity.type === 'chat' && (
                          <Link
                            href={`/chat/${activity.id}`}
                            className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] py-2 px-4 rounded-lg font-semibold transition"
                          >
                            Chat
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-cyan-100 text-sm mt-4">{activity.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
} 