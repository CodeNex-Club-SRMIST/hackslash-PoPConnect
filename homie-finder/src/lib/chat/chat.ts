import { db } from "../services/firebase";
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: any;
  type: 'text' | 'image' | 'file';
}

export interface Chat {
  id: string;
  matchId: string;
  participants: string[];
  lastMessage?: Message;
  lastMessageTime?: any;
  unreadCount?: number;
}

// Send a message in a chat
export async function sendMessage(chatId: string, senderId: string, content: string, type: 'text' | 'image' | 'file' = 'text') {
  const messageData = {
    senderId,
    content,
    timestamp: new Date(),
    type,
  };

  await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
}

// Get real-time messages for a chat
export function subscribeToMessages(chatId: string, callback: (messages: Message[]) => void) {
  const q = query(
    collection(db, `chats/${chatId}/messages`),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    callback(messages);
  });
}

// Get or create a chat for a match
export async function getOrCreateChat(matchId: string, participants: string[]) {
  // Check if chat already exists
  const chatQuery = query(
    collection(db, 'chats'),
    where('matchId', '==', matchId)
  );

  // For now, we'll create a new chat
  // In a real implementation, you'd check if one exists first
  const chatData = {
    matchId,
    participants,
    createdAt: new Date(),
  };

  const chatRef = await addDoc(collection(db, 'chats'), chatData);
  return chatRef.id;
}

// Get chat details
export async function getChatDetails(chatId: string) {
  const chatDoc = await getDoc(doc(db, 'chats', chatId));
  if (chatDoc.exists()) {
    return { id: chatDoc.id, ...chatDoc.data() } as Chat;
  }
  return null;
}

// Get user's chats
export async function getUserChats(userId: string) {
  const chatsQuery = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', userId)
  );

  // This would need to be implemented with getDocs
  // For now, returning empty array
  return [];
} 