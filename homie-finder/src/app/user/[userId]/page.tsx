"use client";

import React, { useState, useEffect, use } from "react";
import { auth } from "../../../lib/services/firebase";
import { getUserProfile } from "../../../lib/profile/userProfile";
import { saveMatch, matchExists } from "../../../lib/explore/matches";
import Link from "next/link";
import Image from "next/image";

interface UserProfilePageProps {
  params: Promise<{
    userId: string;
  }>;
}

interface UserProfile {
  name: string;
  img: string;
  age: number;
  location: string;
  bio: string;
  interests: string[];
  skills: string[];
  about: string;
  email: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  coverPhoto?: string;
  funFacts?: string[];
  visible?: boolean;
  did?: string;
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const { userId } = use(params);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isMatch, setIsMatch] = useState(false);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile(userId);
        
        if (profile) {
          
          const typedProfile: UserProfile = {
            name: profile.name || 'Unknown User',
            img: profile.img || '/avatar1.png',
            age: profile.age || 0,
            location: profile.location || 'Location not set',
            bio: profile.bio || 'No bio available',
            interests: profile.interests || [],
            skills: profile.skills || [],
            about: profile.about || '',
            email: profile.email || '',
            phone: profile.phone || '',
            latitude: profile.latitude || null,
            longitude: profile.longitude || null,
            coverPhoto: profile.coverPhoto,
            funFacts: profile.funFacts || [],
            visible: profile.visible !== false,
            did: profile.did || ''
          };
          
          setUserProfile(typedProfile);
          
          if (currentUser) {
            const matchExistsResult = await matchExists(currentUser.uid, userId);
            setIsMatch(matchExistsResult);
          }
        } else {
          setError("User profile not found");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, currentUser]);

  const handleCreateMatch = async () => {
    if (!currentUser || !userProfile) return;

    try {
      setIsLoadingMatch(true);
      await saveMatch(currentUser.uid, userId);
      setIsMatch(true);
    } catch (error) {
      console.error("Error creating match:", error);
    } finally {
      setIsLoadingMatch(false);
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      0.5 - Math.cos(dLat) / 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        (1 - Math.cos(dLon)) / 2;
    return Math.round(R * 2 * Math.asin(Math.sqrt(a)));
  };

  const getDistanceFromCurrentUser = () => {
    if (!userProfile?.latitude || !userProfile?.longitude || !currentUser) return null;
    
    // For demo purposes, using a random location for current user
    // In real app, you'd get this from user's profile
    const currentUserLat = 40.7128; // New York coordinates for demo
    const currentUserLon = -74.0060;
    
    return getDistance(
      currentUserLat,
      currentUserLon,
      userProfile.latitude,
      userProfile.longitude
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0f2c] via-[#1a237e] to-[#0f1e4b] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-700 opacity-30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 opacity-20 rounded-full blur-2xl -z-10" />
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-cyan-200 text-lg">Loading profile...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !userProfile) {
    return (
      <main className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0f2c] via-[#1a237e] to-[#0f1e4b] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-700 opacity-30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 opacity-20 rounded-full blur-2xl -z-10" />
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
            <p className="text-cyan-200 mb-6">{error || "This user profile doesn't exist"}</p>
            <Link
              href="/activities"
              className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] px-6 py-3 rounded-xl font-bold shadow-lg transition"
            >
              Back to Activities
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const distance = getDistanceFromCurrentUser();

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0f2c] via-[#1a237e] to-[#0f1e4b] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-700 opacity-30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 opacity-20 rounded-full blur-2xl -z-10" />
      
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-lg bg-[#0a0f2c]/70 rounded-b-2xl shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between py-4 px-6">
          <Link href="/activities" className="text-cyan-200 hover:text-white transition font-semibold">
            ← Back to Activities
          </Link>
          <h1 className="text-xl font-bold text-white">User Profile</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <section className="flex-1 max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-cyan-400/20 overflow-hidden">
          {/* Cover Photo */}
          {userProfile.coverPhoto && (
            <div className="h-48 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 relative">
              <Image
                src={userProfile.coverPhoto}
                alt="Cover"
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Profile Header */}
          <div className="relative px-6 py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-cyan-400 shadow-lg overflow-hidden bg-[#181f3a]">
                  <Image
                    src={userProfile.img}
                    alt={userProfile.name}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                </div>
                {distance && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    📍 {distance}km away
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {userProfile.name}
                  <span className="text-cyan-200 font-medium text-2xl ml-2">
                    {userProfile.age}
                  </span>
                </h2>
                <p className="text-cyan-300 text-lg mb-3">
                  📍 {userProfile.location}
                </p>
                <p className="text-cyan-100 text-base mb-4">
                  {userProfile.bio}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {isMatch ? (
                    <Link
                      href={`/chat/${[currentUser?.uid, userId].sort().join('_')}`}
                      className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] px-6 py-3 rounded-xl font-bold shadow-lg transition"
                    >
                      💬 Start Chat
                    </Link>
                  ) : (
                    <button
                      onClick={handleCreateMatch}
                      disabled={isLoadingMatch}
                      className="bg-cyan-400 hover:bg-cyan-300 disabled:bg-gray-600 disabled:cursor-not-allowed text-[#0a0f2c] px-6 py-3 rounded-xl font-bold shadow-lg transition"
                    >
                      {isLoadingMatch ? 'Creating Match...' : '🤝 Create Match'}
                    </button>
                  )}
                  
                  <button className="bg-[#1d2542] hover:bg-[#2a3655] text-cyan-200 px-6 py-3 rounded-xl font-bold shadow-lg transition">
                    📤 Share Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-6 pb-8 space-y-8">
            {/* About Section */}
            {userProfile.about && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">About</h3>
                <p className="text-cyan-100 leading-relaxed">
                  {userProfile.about}
                </p>
              </div>
            )}

            {/* Interests */}
            {userProfile.interests && userProfile.interests.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-cyan-400/20 text-cyan-200 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {userProfile.skills && userProfile.skills.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-400/20 text-blue-200 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Fun Facts */}
            {userProfile.funFacts && userProfile.funFacts.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Fun Facts</h3>
                <ul className="space-y-2">
                  {userProfile.funFacts.map((fact, index) => (
                    <li key={index} className="text-cyan-100 flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-cyan-200">
                  <span className="text-lg">📧</span>
                  <span>{userProfile.email}</span>
                </div>
                {userProfile.phone && (
                  <div className="flex items-center gap-3 text-cyan-200">
                    <span className="text-lg">📱</span>
                    <span>{userProfile.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* DID Information */}
            {userProfile.did && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Decentralized ID</h3>
                <div className="bg-[#1d2542]/50 rounded-lg p-4 border border-cyan-400/20">
                  <p className="text-cyan-200 text-sm break-all font-mono">
                    {userProfile.did}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
} 