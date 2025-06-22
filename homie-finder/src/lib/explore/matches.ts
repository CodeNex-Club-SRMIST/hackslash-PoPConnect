import { db } from "../services/firebase";
import { collection, addDoc, getDocs, query, where, doc, setDoc, getDoc } from "firebase/firestore";
import { getOrCreateChat } from "../chat/chat";

// Save a match between two users
export async function saveMatch(userA: string, userB: string) {
  // Always store matches with sorted user IDs for uniqueness
  const [uid1, uid2] = [userA, userB].sort();
  const matchId = `${uid1}_${uid2}`;
  
  await setDoc(doc(db, "matches", matchId), {
    users: [uid1, uid2],
    createdAt: new Date(),
  });

  // Automatically create a chat for the match
  try {
    await getOrCreateChat(matchId, [uid1, uid2]);
  } catch (error) {
    console.error("Error creating chat for match:", error);
  }

  return matchId;
}

// Check if a match exists
export async function matchExists(userA: string, userB: string) {
  const [uid1, uid2] = [userA, userB].sort();
  const matchId = `${uid1}_${uid2}`;
  const matchDoc = await getDoc(doc(db, "matches", matchId));
  return matchDoc.exists();
}

// Get all matches for a user
export async function getUserMatches(uid: string) {
  const q = query(collection(db, "matches"), where("users", "array-contains", uid));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
