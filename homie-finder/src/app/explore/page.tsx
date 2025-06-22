"use client";

import React, { useState, useEffect } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../lib/services/firebase";
import { auth } from "../../lib/services/firebase";
import { saveSwipe, isMutualLike } from "../../lib/explore/swipe";
import { saveMatch } from "../../lib/explore/matches";
import SwipeCard from "../components/SwipeCard";
import DatabaseCleaner from "../components/DatabaseCleaner";
import Link from "next/link";

// Profile type definition
interface Profile {
  id: string;
  visible: boolean;
  name?: string;
  age?: number;
  img?: string;
  location?: string;
  bio?: string;
  about?: string;
  interests?: string[];
  skills?: string[];
  latitude?: number;
  longitude?: number;
  email?: string;
  phone?: string;
}

// Helper to calculate distance between two lat/lng points (Haversine formula)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    0.5 - Math.cos(dLat) / 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      (1 - Math.cos(dLon)) / 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

export default function ExplorePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [matchNotification, setMatchNotification] = useState<{ show: boolean; profile: Profile | null }>({
    show: false,
    profile: null,
  });

  useEffect(() => {
    // Ask for location permission on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          setLocationError("Location permission denied. Please enable location to find nearby buddies.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  useEffect(() => {
    async function fetchProfiles() {
      try {
        setIsLoading(true);
        const snap = await getDocs(collection(db, "users"));
        let data = snap.docs.map(doc => ({ id: doc.id, visible: true, ...doc.data() } as Profile));
        
        // Filter out current user and invisible profiles
        const currentUser = auth.currentUser;
        if (currentUser) {
          data = data.filter((p) => p.id !== currentUser.uid && p.visible !== false);
        }

        // Filter by distance if location is available
        if (userLocation) {
          data = data.filter((p) =>
            p.latitude && p.longitude &&
            getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, p.latitude, p.longitude) <= 25
          );
        }

        setProfiles(data);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfiles();
  }, [userLocation]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("No authenticated user");
      return;
    }

    try {
      // Save the swipe
      await saveSwipe(currentUser.uid, currentProfile.id, direction);

      // If it's a right swipe, check for mutual match
      if (direction === 'right') {
        const isMatch = await isMutualLike(currentUser.uid, currentProfile.id);
        
        if (isMatch) {
          // Create a match
          await saveMatch(currentUser.uid, currentProfile.id);
          
          // Show match notification
          setMatchNotification({
            show: true,
            profile: currentProfile,
          });

          setTimeout(() => {
            setMatchNotification({ show: false, profile: null });
          }, 3000);
        }
      }

      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error("Error processing swipe:", error);
    }
  };

  const resetProfiles = () => {
    setCurrentIndex(0);
  };

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];
  const hasMoreProfiles = currentIndex < profiles.length;

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0f2c] via-[#1a237e] to-[#0f1e4b] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-700 opacity-30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 opacity-20 rounded-full blur-2xl -z-10" />
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-cyan-200 text-lg">Finding buddies near you...</p>
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
          <h1 className="text-2xl font-bold text-white">Explore</h1>
          <div className="text-cyan-200 text-sm">
            {currentIndex + 1} / {profiles.length}
          </div>
        </div>
      </header>

      {/* Location Error */}
      {locationError && (
        <div className="text-red-400 text-center p-4 bg-red-500/10 mx-4 mt-4 rounded-lg">
          {locationError}
        </div>
      )}

      {/* Main Content */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {!hasMoreProfiles ? (
          
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-4">You've seen everyone!</h2>
            <p className="text-cyan-200 mb-8">
              Check back later for new buddies in your area, or try expanding your search radius.
            </p>
            <button
              onClick={resetProfiles}
              className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] px-8 py-3 rounded-xl font-bold shadow-lg transition"
            >
              Start Over
            </button>
          </div>
        ) : (
          // Swipe Cards
          <div className="relative w-full max-w-sm h-[600px] mx-auto">
            {/* Next card (background) */}
            {nextProfile && (
              <SwipeCard
                profile={nextProfile}
                onSwipe={() => {}}
                onRemove={() => {}}
                isTop={false}
              />
            )}
            
            {/* Current card (top) */}
            {currentProfile && (
              <SwipeCard
                profile={currentProfile}
                onSwipe={handleSwipe}
                onRemove={() => setCurrentIndex(prev => prev + 1)}
                isTop={true}
              />
            )}
          </div>
        )}
      </section>

      {/* Database Cleaner (temporary) */}
      <DatabaseCleaner />

      {/* Match Notification */}
      {matchNotification.show && matchNotification.profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#131a3a] rounded-2xl p-8 max-w-md mx-4 text-center border border-cyan-400/30">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">It's a Match!</h2>
            <p className="text-cyan-200 mb-4">
              You and {matchNotification.profile.name} liked each other!
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/activities"
                className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] px-6 py-2 rounded-lg font-bold transition"
              >
                Start Chatting
              </Link>
              <button
                onClick={() => setMatchNotification({ show: false, profile: null })}
                className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-bold transition"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}