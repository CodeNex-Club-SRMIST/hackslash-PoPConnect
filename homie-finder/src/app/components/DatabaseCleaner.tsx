"use client";

import React, { useState } from 'react';
import { auth } from '../../lib/services/firebase';
import { db } from '../../lib/services/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function DatabaseCleaner() {
  const [isCleaning, setIsCleaning] = useState(false);
  const [message, setMessage] = useState('');

  const cleanSampleUsers = async () => {
    if (!auth.currentUser) {
      setMessage('Please log in first');
      return;
    }

    setIsCleaning(true);
    setMessage('');

    try {
      // Get all users
      const usersSnap = await getDocs(collection(db, "users"));
      let deletedCount = 0;

      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        
        // Check if it's a sample user (has sample_user_ in the ID or specific sample data)
        if (userDoc.id.includes('sample_user_') || 
            userData.email?.includes('@email.com') ||
            userData.name === 'Alex Chen' ||
            userData.name === 'Sarah Johnson' ||
            userData.name === 'Mike Rodriguez' ||
            userData.name === 'Emma Wilson' ||
            userData.name === 'David Kim') {
          
          await deleteDoc(doc(db, "users", userDoc.id));
          deletedCount++;
        }
      }

      setMessage(`Cleaned up ${deletedCount} sample users from the database.`);
    } catch (error) {
      console.error('Error cleaning database:', error);
      setMessage('Error cleaning database. Please try again.');
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={cleanSampleUsers}
        disabled={isCleaning}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition disabled:opacity-50"
      >
        {isCleaning ? 'Cleaning...' : 'Clean Sample Users'}
      </button>
      
      {message && (
        <div className="absolute bottom-full left-0 mb-2 p-3 bg-[#131a3a] rounded-lg border border-red-400/30 text-red-200 text-sm max-w-xs">
          {message}
        </div>
      )}
    </div>
  );
} 