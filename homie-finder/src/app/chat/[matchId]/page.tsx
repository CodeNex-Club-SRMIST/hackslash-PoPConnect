"use client";
import React, { useState, useEffect, useRef } from "react";
import { auth } from "../../../lib/services/firebase";
import { getUserProfile } from "../../../lib/profile/userProfile";
import { getChatDetails, subscribeToMessages, sendMessage, Message } from "../../../lib/chat";
import Link from "next/link";

interface ChatPageProps {
  params: {
    matchId: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [chatId, setChatId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const initializeChat = async () => {
      if (!currentUser) return;

      try {
        // Get match details to find the other user
        const matchUsers = params.matchId.split('_');
        const otherUserId = matchUsers.find(id => id !== currentUser.uid);
        
        if (otherUserId) {
          // Get other user's profile
          const otherUserProfile = await getUserProfile(otherUserId);
          setOtherUser(otherUserProfile);

          // Use matchId as chatId for now
          const newChatId = params.matchId;
          setChatId(newChatId);

          // Subscribe to messages
          const unsubscribe = subscribeToMessages(newChatId, (newMessages) => {
            setMessages(newMessages);
            setLoading(false);
          });

          return unsubscribe;
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        setLoading(false);
      }
    };

    const unsubscribe = initializeChat();
    return () => {
      if (unsubscribe) {
        unsubscribe.then(unsub => {
          if (unsub) unsub();
        });
      }
    };
  }, [params.matchId, currentUser]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !chatId) return;

    try {
      await sendMessage(chatId, currentUser.uid, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0f2c] via-[#1a237e] to-[#0f1e4b] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-700 opacity-30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 opacity-20 rounded-full blur-2xl -z-10" />
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-cyan-200 text-lg">Loading chat...</p>
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
        <div className="max-w-4xl mx-auto flex items-center py-4 px-6">
          <Link href="/activities" className="text-cyan-200 hover:text-white transition font-semibold mr-4">
            ← Back
          </Link>
          <div className="flex items-center flex-1">
            <div className="w-10 h-10 bg-cyan-400/20 rounded-full flex items-center justify-center mr-3 overflow-hidden">
              {otherUser?.img ? (
                <img 
                  src={otherUser.img} 
                  alt={otherUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg">👤</span>
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                {otherUser?.name || 'Chat'}
              </h1>
              <p className="text-cyan-200 text-sm">
                {otherUser?.location || 'Location not set'}
              </p>
            </div>
          </div>
          <Link
            href={`/user/${otherUser?.id || ''}`}
            className="bg-[#1d2542] hover:bg-[#2a3655] text-cyan-200 px-4 py-2 rounded-lg font-semibold transition"
          >
            View Profile
          </Link>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-cyan-400/20 h-[600px] flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-cyan-200">Start a conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.senderId === currentUser?.uid;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-cyan-400 text-[#0a0f2c]'
                          : 'bg-white/10 text-cyan-100'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-[#0a0f2c]/70' : 'text-cyan-200/70'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-cyan-400/20">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white/10 text-cyan-100 placeholder-cyan-300/50 rounded-xl px-4 py-3 border border-cyan-400/30 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-cyan-400 hover:bg-cyan-300 disabled:bg-gray-600 disabled:cursor-not-allowed text-[#0a0f2c] px-6 py-3 rounded-xl font-semibold transition"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
