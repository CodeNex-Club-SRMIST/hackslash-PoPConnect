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

const initialUser: UserProfile = {
  name: "Jane Doe",
  img: "/avatar1.png",
  age: 24,
  location: "New York, USA",
  bio: "UI/UX Designer, loves hiking and coffee ☕",
  interests: ["Design", "Hiking", "Coffee", "Photography"],
  skills: ["Figma", "Sketch", "Adobe XD"],
  about:
    "Passionate about creating beautiful user experiences. Always up for a coffee chat and a walk in the park.",
  email: "jane.doe@email.com",
  phone: "+1 234 567 8901",
  latitude: null,
  longitude: null,
  coverPhoto: "",
  funFacts: [],
  visible: true,
  did: "",
};

const defaultProfileFromGoogle = (user: FirebaseUser) => ({
  name: user.displayName || "",
  img: user.photoURL || "/avatar1.png",
  email: user.email || "",
});

export default function ProfilePage() {
  const [user, setUser] = useState(initialUser);
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
          setUser({ ...initialUser, ...googleProfile, ...profile, did });
        } else {
          setUser({ ...initialUser, ...googleProfile, did });
          setEdit(true); // Prompt to complete missing fields
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  }

  function handleArrayChange(type: "interests" | "skills" | "funFacts", idx: number, value: string) {
    setUser((prev) => ({
      ...prev,
      [type]: (Array.isArray(prev[type]) ? prev[type] : []).map((item: string, i: number) => (i === idx ? value : item)),
    }));
  }

  async function handleSave() {
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

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-[#0a0f2c] via-[#1a237e] to-[#0f1e4b] flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-cyan-400/10 p-6 sm:p-10 grid sm:grid-cols-3 gap-8 relative">
        
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
        <div className="col-span-2 space-y-5">
          {/* Bio */}
          <div>
            <h3 className="text-lg text-cyan-200 font-semibold mb-1">Bio</h3>
            {edit ? (
              <textarea
                name="bio"
                value={user.bio}
                onChange={handleChange}
                className="w-full text-base bg-transparent border-b border-cyan-400 text-cyan-100 outline-none resize-none"
              />
            ) : (
              <p className="text-cyan-100 text-base">{user.bio}</p>
            )}
          </div>

          {/* Interests */}
          <div>
            <h3 className="text-lg text-cyan-200 font-semibold mb-1">Interests</h3>
            <div className="flex flex-wrap gap-3">
              {edit
                ? user.interests.map((interest, idx) => (
                    <input
                      key={idx}
                      value={interest}
                      onChange={(e) => handleArrayChange("interests", idx, e.target.value)}
                      className="bg-cyan-400/20 text-cyan-100 px-3 py-2 rounded-full text-sm border border-cyan-400 outline-none"
                    />
                  ))
                : user.interests.map((interest) => (
                    <span
                      key={interest}
                      className="bg-cyan-400/20 text-cyan-100 px-3 py-2 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg text-blue-200 font-semibold mb-1">Skills</h3>
            <div className="flex flex-wrap gap-3">
              {edit
                ? user.skills.map((skill, idx) => (
                    <input
                      key={idx}
                      value={skill}
                      onChange={(e) => handleArrayChange("skills", idx, e.target.value)}
                      className="bg-blue-400/20 text-blue-100 px-3 py-2 rounded-full text-sm border border-blue-400 outline-none"
                    />
                  ))
                : user.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-blue-400/20 text-blue-100 px-3 py-2 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-lg text-cyan-200 font-semibold mb-1">About</h3>
            {edit ? (
              <textarea
                name="about"
                value={user.about}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-cyan-400 text-cyan-100 outline-none resize-none italic text-base"
              />
            ) : (
              <p className="text-cyan-100 italic text-base">{user.about}</p>
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
                <div><strong>Phone:</strong> {user.phone}</div>
              </div>
            )}
          </div>

          {/* Cover Photo */}
          <div className="mb-6">
            <h3 className="text-lg text-cyan-200 font-semibold mb-1">Cover Photo</h3>
            {edit ? (
              <input
                name="coverPhoto"
                value={user.coverPhoto}
                onChange={handleChange}
                className="w-full text-base bg-transparent border-b border-cyan-400 text-cyan-100 outline-none"
                placeholder="Paste image URL or upload (URL only for now)"
              />
            ) : user.coverPhoto ? (
              <img src={user.coverPhoto} alt="Cover" className="w-full h-40 object-cover rounded-2xl mb-2" />
            ) : (
              <div className="w-full h-40 bg-cyan-900/30 rounded-2xl flex items-center justify-center text-cyan-200">No cover photo</div>
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
                  onClick={() => setUser(u => ({ ...u, funFacts: [...(u.funFacts || []), ""] }))}
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
                  onChange={e => setUser(u => ({ ...u, visible: e.target.checked }))}
                />
                <span className="text-cyan-100">Show my profile in Explore</span>
              </label>
            ) : (
              <span className="text-cyan-100">{user.visible === false ? "Hidden" : "Visible"}</span>
            )}
          </div>

          {/* Button */}
          <div className="pt-3">
            {edit ? (
              <button
                onClick={handleSave}
                className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] font-bold py-3 px-6 rounded-lg shadow transition text-base"
              >
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setEdit(true)}
                className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] font-bold py-3 px-6 rounded-lg shadow transition text-base"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Toast */}
        {showSaved && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-5 py-2 rounded-lg shadow font-semibold animate-fadeIn text-base">
            Changes saved!
          </div>
        )}
      </div>

      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
