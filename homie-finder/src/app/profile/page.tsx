"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { auth } from "../../lib/services/firebase";
import { getUserProfile, setUserProfile } from "../../lib/profile/userProfile";
import type { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/services/firebase";

type UserProfile = {
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
};

const defaultProfileFromGoogle = (user: FirebaseUser): UserProfile => ({
  name: user.displayName || user.email?.split('@')[0] || "User",
  img: user.photoURL || "/avatar1.png",
  email: user.email || "",
  age: 0,
  location: "Location not set",
  bio: "",
  interests: [],
  skills: [],
  about: "",
  phone: "",
  latitude: null,
  longitude: null,
  coverPhoto: "",
  funFacts: [],
  visible: true,
  did: "",
});

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [edit, setEdit] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        // Pre-fill with Google info
        let googleProfile = defaultProfileFromGoogle(auth.currentUser);
        const profile = await getUserProfile(auth.currentUser.uid);
        let did = "";
        const didDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (didDoc.exists()) {
          did = didDoc.data().did || "";
        }
        if (profile) {
          setUser({ ...googleProfile, ...profile, did });
        } else {
          // Save the initial profile immediately so user appears in explore
          const initialProfile = { ...googleProfile, did };
          await setUserProfile(auth.currentUser.uid, initialProfile);
          setUser(initialProfile);
          setEdit(true); // Prompt to complete missing fields
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setUser((prev) => prev ? { ...prev, [name]: value } : null);
  }

  function handleArrayChange(type: "interests" | "skills" | "funFacts", idx: number, value: string) {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [type]: (Array.isArray(prev[type]) ? prev[type] : []).map((item: string, i: number) => (i === idx ? value : item)),
      };
    });
  }

  async function handleSave() {
    if (!user) return;
    
    setEdit(false);
    setShowSaved(true);
    if (auth.currentUser) {
      // Get geolocation if not already present
      if (!user.latitude || !user.longitude) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const updatedUser = { ...user, latitude, longitude };
          if (auth.currentUser) {
            await setUserProfile(auth.currentUser.uid, updatedUser);
          }
          setUser(updatedUser);
        }, async (error) => {
          // If user denies location, just save without it
          if (auth.currentUser) {
            await setUserProfile(auth.currentUser.uid, user);
          }
        });
      } else {
        await setUserProfile(auth.currentUser.uid, user);
      }
    }
    setTimeout(() => setShowSaved(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loader" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-200 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-[#0a0f2c] via-[#1a237e] to-[#0f1e4b] flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-cyan-400/10 p-6 sm:p-10 grid sm:grid-cols-3 gap-8 relative">
        
        {/* Back Button */}
        {edit && (
          <button
            onClick={() => setEdit(false)}
            className="absolute top-4 left-4 text-cyan-200 hover:text-white transition font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
        
        {/* Avatar + Basic Info */}
        <div className="col-span-1 flex flex-col items-center text-center">
          <div className="relative w-36 h-36 mb-5">
            <div className="absolute inset-0 rounded-full bg-cyan-500 blur-2xl opacity-30" />
            <div className="rounded-full border-4 border-cyan-400 shadow-lg overflow-hidden w-full h-full bg-[#181f3a]">
              <Image
                src={user.img}
                alt={user.name}
                width={144}
                height={144}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {edit ? (
            <>
              <input
                name="name"
                value={user.name}
                onChange={handleChange}
                className="text-2xl font-bold text-white bg-transparent border-b border-cyan-400 mb-2 text-center outline-none"
              />
              <input
                name="age"
                type="number"
                value={user.age}
                onChange={handleChange}
                className="text-cyan-200 text-base bg-transparent border-b border-cyan-400 mb-2 text-center outline-none w-20"
              />
              <input
                name="location"
                value={user.location}
                onChange={handleChange}
                className="text-cyan-300 text-base bg-transparent border-b border-cyan-400 text-center outline-none"
              />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white leading-tight">
                {user.name}
                <span className="text-cyan-200 font-medium text-xl">, {user.age}</span>
              </h2>
              <p className="text-cyan-300 text-lg mt-1">{user.location}</p>
            </>
          )}

          {/* DID Display */}
          <div className="mt-4 text-cyan-300 text-sm break-words max-w-xs">
            <strong>DID:</strong> {user.did || "Not available"}
          </div>
        </div>

        {/* Profile Details */}
        <div className="col-span-2 space-y-6">
          {/* Bio */}
          <div>
            <h3 className="text-lg text-cyan-200 font-semibold mb-1">Bio</h3>
            {edit ? (
              <textarea
                name="bio"
                value={user.bio}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-cyan-400 text-cyan-100 text-base outline-none resize-none"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-cyan-100 text-base">{user.bio || "No bio yet."}</p>
            )}
          </div>

          {/* About */}
          <div>
            <h3 className="text-lg text-cyan-200 font-semibold mb-1">About</h3>
            {edit ? (
              <textarea
                name="about"
                value={user.about}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-cyan-400 text-cyan-100 text-base outline-none resize-none"
                rows={4}
                placeholder="Share more details about yourself..."
              />
            ) : (
              <p className="text-cyan-100 text-base">{user.about || "No additional information yet."}</p>
            )}
          </div>

          {/* Interests */}
          <div>
            <h3 className="text-lg text-cyan-200 font-semibold mb-1">Interests</h3>
            {edit ? (
              <div className="space-y-2">
                {(user.interests || []).map((interest, idx) => (
                  <input
                    key={idx}
                    value={interest}
                    onChange={e => handleArrayChange("interests", idx, e.target.value)}
                    className="w-full text-base bg-transparent border-b border-cyan-400 text-cyan-100 outline-none"
                    placeholder={`Interest #${idx + 1}`}
                  />
                ))}
                <button
                  type="button"
                  className="mt-2 bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] font-bold py-1 px-4 rounded-lg shadow text-sm"
                  onClick={() => setUser(u => u ? { ...u, interests: [...(u.interests || []), ""] } : null)}
                >Add Interest</button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(user.interests && user.interests.length === 0) ? (
                  <span className="text-cyan-300 text-sm">No interests added yet.</span>
                ) : (
                  user.interests?.map((interest, idx) => (
                    <span key={idx} className="bg-cyan-400/20 text-cyan-200 px-3 py-1 rounded-full text-sm">
                      {interest}
                    </span>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg text-cyan-200 font-semibold mb-1">Skills</h3>
            {edit ? (
              <div className="space-y-2">
                {(user.skills || []).map((skill, idx) => (
                  <input
                    key={idx}
                    value={skill}
                    onChange={e => handleArrayChange("skills", idx, e.target.value)}
                    className="w-full text-base bg-transparent border-b border-cyan-400 text-cyan-100 outline-none"
                    placeholder={`Skill #${idx + 1}`}
                  />
                ))}
                <button
                  type="button"
                  className="mt-2 bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] font-bold py-1 px-4 rounded-lg shadow text-sm"
                  onClick={() => setUser(u => u ? { ...u, skills: [...(u.skills || []), ""] } : null)}
                >Add Skill</button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(user.skills && user.skills.length === 0) ? (
                  <span className="text-cyan-300 text-sm">No skills added yet.</span>
                ) : (
                  user.skills?.map((skill, idx) => (
                    <span key={idx} className="bg-blue-400/20 text-blue-200 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg text-cyan-200 font-semibold mb-1">Contact</h3>
            {edit ? (
              <div className="space-y-2">
                <input
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-cyan-400 text-cyan-100 text-base outline-none"
                />
                <input
                  name="phone"
                  value={user.phone}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-cyan-400 text-cyan-100 text-base outline-none"
                />
              </div>
            ) : (
              <div className="text-cyan-100 space-y-1 text-base">
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Phone:</strong> {user.phone || "Not provided"}</div>
              </div>
            )}
          </div>

          {/* Cover Photo */}
          <div className="mb-6">
            <h3 className="text-lg text-cyan-200 font-semibold mb-1">Cover Photo</h3>
            {edit ? (
              <div className="space-y-3">
                <input
                  name="coverPhoto"
                  value={user.coverPhoto}
                  onChange={handleChange}
                  className="w-full text-base bg-transparent border-b border-cyan-400 text-cyan-100 outline-none"
                  placeholder="Paste image URL here..."
                />
                <div className="text-cyan-300 text-sm">
                  💡 Tip: You can use any image URL from the web. Make sure it's publicly accessible.
                </div>
                {user.coverPhoto && (
                  <div className="mt-3">
                    <p className="text-cyan-200 text-sm mb-2">Preview:</p>
                    <div className="w-full h-32 bg-cyan-900/30 rounded-xl overflow-hidden">
                      <img 
                        src={user.coverPhoto} 
                        alt="Cover preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-cyan-900/30 rounded-xl flex items-center justify-center text-cyan-200 text-sm" style={{display: 'none'}}>
                        Invalid image URL
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : user.coverPhoto ? (
              <div className="w-full h-40 bg-cyan-900/30 rounded-2xl overflow-hidden">
                <img 
                  src={user.coverPhoto} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full bg-cyan-900/30 rounded-2xl flex items-center justify-center text-cyan-200" style={{display: 'none'}}>
                  Cover photo not available
                </div>
              </div>
            ) : (
              <div className="w-full h-40 bg-cyan-900/30 rounded-2xl flex items-center justify-center text-cyan-200">
                No cover photo set
              </div>
            )}
          </div>

          {/* Fun Facts */}
          <div className="mb-6">
            <h3 className="text-lg text-cyan-200 font-semibold mb-1">Fun Facts</h3>
            {edit ? (
              <div className="space-y-2">
                {(user.funFacts || []).map((fact, idx) => (
                  <input
                    key={idx}
                    value={fact}
                    onChange={e => handleArrayChange("funFacts", idx, e.target.value)}
                    className="w-full text-base bg-transparent border-b border-cyan-400 text-cyan-100 outline-none"
                    placeholder={`Fun Fact #${idx + 1}`}
                  />
                ))}
                <button
                  type="button"
                  className="mt-2 bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] font-bold py-1 px-4 rounded-lg shadow text-sm"
                  onClick={() => setUser(u => u ? { ...u, funFacts: [...(u.funFacts || []), ""] } : null)}
                >Add Fun Fact</button>
              </div>
            ) : (
              <ul className="list-disc pl-5 text-cyan-100">
                {(user.funFacts && user.funFacts.length === 0) ? <li>No fun facts yet.</li> : (user.funFacts || []).map((fact, idx) => <li key={idx}>{fact}</li>)}
              </ul>
            )}
          </div>

          {/* Profile Visibility */}
          <div className="mb-6">
            <h3 className="text-lg text-cyan-200 font-semibold mb-1">Profile Visibility</h3>
            {edit ? (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={user.visible !== false}
                  onChange={e => setUser(u => u ? { ...u, visible: e.target.checked } : null)}
                />
                <span className="text-cyan-100">Show my profile in Explore</span>
              </label>
            ) : (
              <span className="text-cyan-100">{user.visible === false ? "Hidden" : "Visible"}</span>
            )}
          </div>

          {/* Button */}
          <div className="flex gap-4">
            {edit ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] font-bold py-3 px-8 rounded-xl shadow-lg transition"
                >
                  Save Profile
                </button>
                <button
                  onClick={() => setEdit(false)}
                  className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEdit(true)}
                className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] font-bold py-3 px-8 rounded-xl shadow-lg transition"
              >
                Edit Profile
              </button>
            )}
          </div>

          {showSaved && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
              Profile saved successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
