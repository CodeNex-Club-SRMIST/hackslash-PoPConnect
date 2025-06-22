import { db } from "../services/firebase";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";

// Create a new event
export async function createEvent(event: { title: string; description: string; date: string; location: string; host: string }) {
  return await addDoc(collection(db, "events"), {
    ...event,
    createdAt: Timestamp.now(),
  });
}

// Get all events
export async function getEvents() {
  const snap = await getDocs(collection(db, "events"));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
