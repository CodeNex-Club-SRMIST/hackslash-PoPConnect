"use client";

import React, { useState, useRef, useEffect } from 'react';

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

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: 'left' | 'right') => void;
  onRemove: () => void;
  isTop: boolean;
}

export default function SwipeCard({ profile, onSwipe, onRemove, isTop }: SwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const animationFrameRef = useRef<number>();

  const updateDragOffset = (offset: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      setDragOffset(offset);
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTop) return;
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
    currentX.current = 0;
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTop || !isDragging) return;
    e.preventDefault();
    currentX.current = e.touches[0].clientX - startX.current;
    updateDragOffset(currentX.current);
  };

  const handleTouchEnd = () => {
    if (!isTop || !isDragging) return;
    setIsDragging(false);
    
    const swipeThreshold = 100;
    if (Math.abs(currentX.current) > swipeThreshold) {
      const direction = currentX.current > 0 ? 'right' : 'left';
      setIsSwiping(true);
      setTimeout(() => {
        onSwipe(direction);
        setIsSwiping(false);
        setDragOffset(0);
      }, 200);
    } else {
      setDragOffset(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isTop) return;
    setIsDragging(true);
    startX.current = e.clientX;
    currentX.current = 0;
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isTop || !isDragging) return;
    currentX.current = e.clientX - startX.current;
    updateDragOffset(currentX.current);
  };

  const handleMouseUp = () => {
    if (!isTop || !isDragging) return;
    setIsDragging(false);
    
    const swipeThreshold = 100;
    if (Math.abs(currentX.current) > swipeThreshold) {
      const direction = currentX.current > 0 ? 'right' : 'left';
      setIsSwiping(true);
      setTimeout(() => {
        onSwipe(direction);
        setIsSwiping(false);
        setDragOffset(0);
      }, 200);
    } else {
      setDragOffset(0);
    }
  };

  const swipeLeft = () => {
    if (!isTop) return;
    setIsSwiping(true);
    setDragOffset(-300);
    setTimeout(() => {
      onSwipe('left');
      setIsSwiping(false);
      setDragOffset(0);
    }, 200);
  };

  const swipeRight = () => {
    if (!isTop) return;
    setIsSwiping(true);
    setDragOffset(300);
    setTimeout(() => {
      onSwipe('right');
      setIsSwiping(false);
      setDragOffset(0);
    }, 200);
  };

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Calculate rotation and opacity based on drag offset
  const rotation = Math.min(Math.max(dragOffset * 0.1, -30), 30);
  const opacity = isTop ? Math.max(0, 1 - Math.abs(dragOffset) / 200) : 0.8;
  const scale = isTop ? Math.max(0.8, 1 - Math.abs(dragOffset) / 400) : 0.95;

  // Get profile image with fallback
  const getProfileImage = () => {
    if (profile.img && profile.img !== '/avatar1.png') {
      return profile.img;
    }
    return '/default-avatar.png';
  };

  return (
    <div
      ref={cardRef}
      className={`absolute w-full max-w-sm mx-auto transition-all duration-200 ease-out ${
        isTop ? 'z-10' : 'z-0'
      } ${isSwiping ? 'pointer-events-none' : ''}`}
      style={{
        transform: `translateX(${dragOffset}px) rotate(${rotation}deg) scale(${scale})`,
        opacity,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-cyan-400/20 min-h-[500px] max-h-[600px] flex flex-col">
        {/* Profile Image */}
        <div className="relative h-64 w-full flex-shrink-0">
          <img
            src={getProfileImage()}
            alt={profile.name || 'Profile'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/default-avatar.png';
            }}
          />
          
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Swipe indicators */}
          {isTop && (
            <>
              <div 
                className={`absolute top-4 left-4 transform -rotate-12 border-4 border-red-500 text-red-500 px-6 py-2 rounded-lg transition-opacity duration-200 ${
                  dragOffset < -50 ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <span className="text-xl font-bold">NOPE</span>
              </div>
              <div 
                className={`absolute top-4 right-4 transform rotate-12 border-4 border-green-500 text-green-500 px-6 py-2 rounded-lg transition-opacity duration-200 ${
                  dragOffset > 50 ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <span className="text-xl font-bold">LIKE</span>
              </div>
            </>
          )}
        </div>

        {/* Profile Info - Scrollable Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold text-white">
              {profile.name}, <span className="text-cyan-200 font-normal">{profile.age || 'N/A'}</span>
            </h2>
            <div className="text-cyan-300 text-sm">{profile.location || 'Location not set'}</div>
          </div>
          
          {profile.bio && (
            <p className="text-cyan-100 text-lg mb-4">{profile.bio}</p>
          )}
          
          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mb-4">
              <h3 className="text-cyan-200 font-semibold mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.slice(0, 3).map((interest: string) => (
                  <span key={interest} className="bg-cyan-400/20 text-cyan-200 px-3 py-1 rounded-full text-sm">
                    {interest}
                  </span>
                ))}
                {profile.interests.length > 3 && (
                  <span className="text-cyan-300 text-sm">+{profile.interests.length - 3} more</span>
                )}
              </div>
            </div>
          )}
          
          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mb-4">
              <h3 className="text-blue-200 font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.slice(0, 3).map((skill: string) => (
                  <span key={skill} className="bg-blue-400/20 text-blue-200 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
                {profile.skills.length > 3 && (
                  <span className="text-cyan-300 text-sm">+{profile.skills.length - 3} more</span>
                )}
              </div>
            </div>
          )}
          
          {profile.about && (
            <p className="text-cyan-100 text-sm italic">{profile.about}</p>
          )}
        </div>

        {/* Action Buttons */}
        {isTop && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
            <button
              onClick={swipeLeft}
              className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-colors"
              disabled={isDragging || isSwiping}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <button
              onClick={swipeRight}
              className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-colors"
              disabled={isDragging || isSwiping}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 