import { db } from "@/lib/services/firebase"; 
import { doc, setDoc } from "firebase/firestore";

export async function saveDIDToFirestore(firebaseUID: string, address: string) {
  const did = `did:ethr:${address}`;

  const userDoc = doc(db, "users", firebaseUID);
  await setDoc(userDoc, {
    did,
    wallet: address,
    createdAt: new Date(),
  }, { merge: true });
}
