import { db } from "../services/firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";

// Save a swipe (right/left) from one user to another
export async function saveSwipe(fromUid: string, toUid: string, direction: "right" | "left") {
  await setDoc(doc(db, "swipes", `${fromUid}_${toUid}`), {
    from: fromUid,
    to: toUid,
    direction,
    createdAt: new Date(),
  });
}

// Check if two users have mutually swiped right
export async function isMutualLike(uid1: string, uid2: string) {
  const swipe1 = await getDoc(doc(db, "swipes", `${uid1}_${uid2}`));
  const swipe2 = await getDoc(doc(db, "swipes", `${uid2}_${uid1}`));
  return (
    swipe1.exists() && swipe1.data().direction === "right" &&
    swipe2.exists() && swipe2.data().direction === "right"
  );
}
