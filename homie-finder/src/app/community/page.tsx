"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "../../lib/services/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where, onSnapshot } from "firebase/firestore";
import Link from "next/link";

// Types
interface Server {
  id: string;
  name: string;
  description: string;
  category: string;
  privacy: 'public' | 'private';
  memberCount: number;
  onlineCount: number;
  tags: string[];
  skills: string[];
  location: string;
  rules: string;
  minAge: number;
  maxMembers: number;
  visibility: 'listed' | 'unlisted';
  createdBy: string;
  createdAt: any;
  members: string[];
  isFavorited?: boolean;
}

interface CreateServerData {
  name: string;
  description: string;
  category: string;
  privacy: 'public' | 'private';
  tags: string[];
  skills: string[];
  location: string;
  rules: string;
  minAge: number;
  maxMembers: number;
  visibility: 'listed' | 'unlisted';
}

interface User {
  id: string;
  name: string;
  email: string;
  img?: string;
  online?: boolean;
  lastSeen?: any;
}

// Server Management Modal Component
const ServerManagementModal = ({
  server,
  onClose,
  onUpdate,
  currentUser
}: {
  server: Server;
  onClose: () => void;
  onUpdate: (serverId: string, updates: any) => void;
  currentUser: any;
}) => {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'settings'>('overview');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const membersData: User[] = [];

        for (const memberId of server.members || []) {
          const userDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", memberId)));
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            membersData.push({
              id: memberId,
              name: userData.name || 'Unknown User',
              email: userData.email || '',
              img: userData.img,
              online: Math.random() > 0.5, // Simulate online status for demo
              lastSeen: new Date()
            });
          }
        }

        setMembers(membersData);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [server.members]);

  const handleRemoveMember = async (memberId: string) => {
    try {
      const updatedMembers = server.members.filter(id => id !== memberId);
      await updateDoc(doc(db, "servers", server.id), {
        members: updatedMembers,
        memberCount: updatedMembers.length
      });
      onUpdate(server.id, { members: updatedMembers, memberCount: updatedMembers.length });
      setMembers(members.filter(m => m.id !== memberId));
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const onlineMembers = members.filter(m => m.online);
  const offlineMembers = members.filter(m => !m.online);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#131a3a] rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-cyan-400/30">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Manage Server: {server.name}</h1>
          <button
            onClick={onClose}
            className="text-cyan-200 hover:text-white text-2xl font-bold transition"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-[#1d2542]/50 rounded-xl p-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'overview'
              ? 'bg-cyan-400 text-[#0a0f2c]'
              : 'text-cyan-200 hover:text-white'
              }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'members'
              ? 'bg-cyan-400 text-[#0a0f2c]'
              : 'text-cyan-200 hover:text-white'
              }`}
          >
            👥 Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'settings'
              ? 'bg-cyan-400 text-[#0a0f2c]'
              : 'text-cyan-200 hover:text-white'
              }`}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1d2542]/50 rounded-xl p-4 border border-cyan-400/20">
                <h3 className="text-lg font-semibold text-white mb-2">📈 Statistics</h3>
                <div className="space-y-2 text-cyan-200">
                  <div>Total Members: {server.memberCount}</div>
                  <div>Online Now: {onlineMembers.length}</div>
                  <div>Max Capacity: {server.maxMembers}</div>
                </div>
              </div>
              <div className="bg-[#1d2542]/50 rounded-xl p-4 border border-cyan-400/20">
                <h3 className="text-lg font-semibold text-white mb-2">🔒 Privacy</h3>
                <div className="space-y-2 text-cyan-200">
                  <div>Type: {server.privacy === 'public' ? '🌍 Public' : '🔒 Private'}</div>
                  <div>Visibility: {server.visibility === 'listed' ? '📋 Listed' : '🔗 Unlisted'}</div>
                  <div>Min Age: {server.minAge}+</div>
                </div>
              </div>
              <div className="bg-[#1d2542]/50 rounded-xl p-4 border border-cyan-400/20">
                <h3 className="text-lg font-semibold text-white mb-2">📍 Location</h3>
                <div className="space-y-2 text-cyan-200">
                  <div>Region: {server.location || 'Global'}</div>
                  <div>Category: {server.category}</div>
                  <div>Created: {server.createdAt?.toDate?.() ?
                    new Date(server.createdAt.toDate()).toLocaleDateString() : 'Recently'}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#1d2542]/50 rounded-xl p-4 border border-cyan-400/20">
              <h3 className="text-lg font-semibold text-white mb-4">📝 Description</h3>
              <p className="text-cyan-200">{server.description}</p>
            </div>

            {server.rules && (
              <div className="bg-[#1d2542]/50 rounded-xl p-4 border border-cyan-400/20">
                <h3 className="text-lg font-semibold text-white mb-4">📋 Rules & Guidelines</h3>
                <p className="text-cyan-200 whitespace-pre-wrap">{server.rules}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Server Members</h3>
              <div className="text-cyan-200">
                {onlineMembers.length} online • {offlineMembers.length} offline
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                <p className="text-cyan-200">Loading members...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Online Members */}
                {onlineMembers.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-green-200 mb-3">🟢 Online ({onlineMembers.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {onlineMembers.map(member => (
                        <div key={member.id} className="bg-[#1d2542]/50 rounded-xl p-4 border border-green-400/20 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyan-400/20 rounded-full flex items-center justify-center">
                              {member.img ? (
                                <img src={member.img} alt={member.name} className="w-10 h-10 rounded-full" />
                              ) : (
                                <span className="text-lg">👤</span>
                              )}
                            </div>
                            <div>
                              <div className="text-white font-semibold">{member.name}</div>
                              <div className="text-cyan-200 text-sm">{member.email}</div>
                            </div>
                          </div>
                          {member.id !== server.createdBy && (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Offline Members */}
                {offlineMembers.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-200 mb-3">⚫ Offline ({offlineMembers.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {offlineMembers.map(member => (
                        <div key={member.id} className="bg-[#1d2542]/50 rounded-xl p-4 border border-gray-400/20 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-400/20 rounded-full flex items-center justify-center">
                              {member.img ? (
                                <img src={member.img} alt={member.name} className="w-10 h-10 rounded-full opacity-50" />
                              ) : (
                                <span className="text-lg opacity-50">👤</span>
                              )}
                            </div>
                            <div>
                              <div className="text-gray-300 font-semibold">{member.name}</div>
                              <div className="text-gray-400 text-sm">
                                Last seen: {member.lastSeen?.toLocaleDateString() || 'Unknown'}
                              </div>
                            </div>
                          </div>
                          {member.id !== server.createdBy && (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-[#1d2542]/50 rounded-xl p-4 border border-cyan-400/20">
              <h3 className="text-lg font-semibold text-white mb-4">⚠️ Danger Zone</h3>
              <p className="text-cyan-200 mb-4">
                These actions cannot be undone. Please be careful.
              </p>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this server? This action cannot be undone.')) {
                    // Handle server deletion
                    onClose();
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                🗑️ Delete Server
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Server Card Component
const ServerCard = ({
  server,
  onJoin,
  onDelete,
  onFavorite,
  onManage,
  currentUserId
}: {
  server: Server;
  onJoin: (serverId: string) => void;
  onDelete: (serverId: string) => void;
  onFavorite: (serverId: string) => void;
  onManage: (server: Server) => void;
  currentUserId: string;
}) => {
  const [isFavorited, setIsFavorited] = useState(server.isFavorited || false);
  const [onlineCount, setOnlineCount] = useState(server.onlineCount || 0);
  const isOwner = server.createdBy === currentUserId;
  const isMember = server.members?.includes(currentUserId);

  useEffect(() => {
    // Simulate real-time online count updates
    const interval = setInterval(() => {
      const baseCount = server.memberCount || 0;
      const onlinePercentage = Math.random() * 0.4 + 0.1; // 10-50% online
      setOnlineCount(Math.floor(baseCount * onlinePercentage));
    }, 5000);

    return () => clearInterval(interval);
  }, [server.memberCount]);

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    onFavorite(server.id);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'gaming': return '🎮';
      case 'study': return '📚';
      case 'social': return '👥';
      case 'business': return '💼';
      case 'tech': return '💻';
      case 'music': return '🎵';
      case 'sports': return '⚽';
      default: return '🌟';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20 hover:scale-[1.02] transition-transform">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-cyan-400/20 rounded-xl flex items-center justify-center text-2xl">
            {getCategoryIcon(server.category)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{server.name}</h3>
            <div className="flex items-center gap-2 text-sm text-cyan-200">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${server.privacy === 'private' ? 'bg-red-400/20 text-red-200' : 'bg-green-400/20 text-green-200'
                }`}>
                {server.privacy === 'private' ? '🔒 Private' : '🌍 Public'}
              </span>
              {server.location && <span>📍 {server.location}</span>}
            </div>
          </div>
        </div>
        <button
          onClick={handleFavorite}
          className="text-2xl hover:scale-110 transition-transform"
          aria-label={isFavorited ? 'Unfavorite server' : 'Favorite server'}
        >
          {isFavorited ? '❤️' : '🤍'}
        </button>
      </div>

      <p className="text-cyan-100 text-sm mb-4">{server.description}</p>

      {server.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {server.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 bg-cyan-400/20 text-cyan-200 rounded-lg text-xs">
              #{tag}
            </span>
          ))}
          {server.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-400/20 text-gray-200 rounded-lg text-xs">
              +{server.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm text-cyan-200">
          <span>👥 {server.memberCount}/{server.maxMembers}</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            {onlineCount} online
          </span>
        </div>
        <div className="text-xs text-cyan-200">
          {server.minAge}+ age
        </div>
      </div>

      <div className="flex gap-2">
        {isOwner ? (
          <button
            onClick={() => onDelete(server.id)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold transition"
          >
            Delete Server
          </button>
        ) : isMember ? (
          <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold cursor-not-allowed">
            Already Joined
          </button>
        ) : (
          <button
            onClick={() => onJoin(server.id)}
            className="flex-1 bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] py-2 px-4 rounded-lg font-semibold transition"
          >
            {server.privacy === 'private' ? 'Request Join' : 'Join Server'}
          </button>
        )}

        {isOwner && (
          <button
            onClick={() => onManage(server)}
            className="bg-[#1d2542] hover:bg-[#2a3655] text-cyan-200 py-2 px-4 rounded-lg font-semibold transition"
          >
            Manage
          </button>
        )}
      </div>
    </div>
  );
};

// Create Server Form Component
const CreateServerForm = ({
  onClose,
  onSubmit
}: {
  onClose: () => void;
  onSubmit: (data: CreateServerData) => void;
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CreateServerData>({
    name: '',
    description: '',
    category: 'gaming',
    privacy: 'public',
    tags: [],
    skills: [],
    location: '',
    rules: '',
    minAge: 13,
    maxMembers: 100,
    visibility: 'listed',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'minAge' || name === 'maxMembers' ? parseInt(value) || 0 : value
    }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'tags' | 'skills') => {
    const values = e.target.value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: values }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderStep = () => {
    switch (step) {
      case 1: return (
        <>
          <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-cyan-200 text-sm font-semibold mb-2">Server Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-[#1d2542]/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-white placeholder-cyan-200/50 focus:outline-none focus:border-cyan-400"
                placeholder="Enter server name..."
              />
            </div>
            <div>
              <label className="block text-cyan-200 text-sm font-semibold mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full bg-[#1d2542]/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-white placeholder-cyan-200/50 focus:outline-none focus:border-cyan-400"
                placeholder="Describe your server..."
              />
            </div>
            <div>
              <label className="block text-cyan-200 text-sm font-semibold mb-2">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => handleArrayChange(e, 'tags')}
                className="w-full bg-[#1d2542]/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-white placeholder-cyan-200/50 focus:outline-none focus:border-cyan-400"
                placeholder="gaming, esports, tournaments"
              />
            </div>
            <div>
              <label className="block text-cyan-200 text-sm font-semibold mb-2">Skills/Interests (comma separated)</label>
              <input
                type="text"
                value={formData.skills.join(', ')}
                onChange={(e) => handleArrayChange(e, 'skills')}
                className="w-full bg-[#1d2542]/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-white placeholder-cyan-200/50 focus:outline-none focus:border-cyan-400"
                placeholder="strategy, teamwork, communication"
              />
            </div>
          </div>
        </>
      );

      case 2: return (
        <>
          <h2 className="text-xl font-bold text-white mb-6">Server Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-cyan-200 text-sm font-semibold mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full bg-[#1d2542]/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="gaming">🎮 Gaming</option>
                <option value="study">📚 Study</option>
                <option value="social">👥 Social</option>
                <option value="business">💼 Business</option>
                <option value="tech">💻 Tech</option>
                <option value="music">🎵 Music</option>
                <option value="sports">⚽ Sports</option>
              </select>
            </div>
            <div>
              <label className="block text-cyan-200 text-sm font-semibold mb-2">Privacy *</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 text-cyan-200">
                  <input
                    type="radio"
                    name="privacy"
                    value="public"
                    checked={formData.privacy === 'public'}
                    onChange={handleChange}
                    className="text-cyan-400"
                  />
                  🌍 Public (Anyone can join)
                </label>
                <label className="flex items-center gap-3 text-cyan-200">
                  <input
                    type="radio"
                    name="privacy"
                    value="private"
                    checked={formData.privacy === 'private'}
                    onChange={handleChange}
                    className="text-cyan-400"
                  />
                  🔒 Private (Invite only)
                </label>
              </div>
            </div>
            <div>
              <label className="block text-cyan-200 text-sm font-semibold mb-2">Visibility *</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 text-cyan-200">
                  <input
                    type="radio"
                    name="visibility"
                    value="listed"
                    checked={formData.visibility === 'listed'}
                    onChange={handleChange}
                    className="text-cyan-400"
                  />
                  📋 Listed (Visible in discovery)
                </label>
                <label className="flex items-center gap-3 text-cyan-200">
                  <input
                    type="radio"
                    name="visibility"
                    value="unlisted"
                    checked={formData.visibility === 'unlisted'}
                    onChange={handleChange}
                    className="text-cyan-400"
                  />
                  🔗 Unlisted (Only via invite link)
                </label>
              </div>
            </div>
          </div>
        </>
      );

      case 3: return (
        <>
          <h2 className="text-xl font-bold text-white mb-6">Community Guidelines</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-cyan-200 text-sm font-semibold mb-2">Location/Region</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-[#1d2542]/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-white placeholder-cyan-200/50 focus:outline-none focus:border-cyan-400"
                placeholder="Global, US, Europe, etc."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-cyan-200 text-sm font-semibold mb-2">Minimum Age *</label>
                <input
                  type="number"
                  name="minAge"
                  min="13"
                  max="100"
                  value={formData.minAge}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#1d2542]/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-cyan-200 text-sm font-semibold mb-2">Maximum Members *</label>
                <input
                  type="number"
                  name="maxMembers"
                  min="10"
                  max="10000"
                  value={formData.maxMembers}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#1d2542]/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-cyan-200 text-sm font-semibold mb-2">Rules/Guidelines</label>
              <textarea
                name="rules"
                value={formData.rules}
                onChange={handleChange}
                rows={4}
                className="w-full bg-[#1d2542]/50 border border-cyan-400/30 rounded-lg px-4 py-3 text-white placeholder-cyan-200/50 focus:outline-none focus:border-cyan-400"
                placeholder="List your community rules and guidelines..."
              />
            </div>
          </div>
        </>
      );

      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#131a3a] rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-cyan-400/30">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Create Server</h1>
          <button
            type="button"
            onClick={onClose}
            className="text-cyan-200 hover:text-white text-2xl font-bold transition"
          >
            ×
          </button>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex gap-2">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition ${step === stepNumber
                  ? 'bg-cyan-400 text-[#0a0f2c]'
                  : step > stepNumber
                    ? 'bg-green-400 text-white'
                    : 'bg-[#1d2542] text-cyan-200'
                  }`}
                onClick={() => step > stepNumber && setStep(stepNumber)}
              >
                {stepNumber}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            {renderStep()}
          </div>

          <div className="flex gap-4 justify-end">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="bg-[#1d2542] hover:bg-[#2a3655] text-cyan-200 px-6 py-3 rounded-lg font-semibold transition"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] px-6 py-3 rounded-lg font-semibold transition"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] px-6 py-3 rounded-lg font-semibold transition"
              >
                Create Server
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Community Page
export default function CommunityPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        fetchServers();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchServers = async () => {
    try {
      setLoading(true);
      const serversSnap = await getDocs(collection(db, "servers"));
      const serversData = serversSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Server[];
      setServers(serversData);
    } catch (error) {
      console.error("Error fetching servers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateServer = async (serverData: CreateServerData) => {
    if (!currentUser) return;

    try {
      const newServer = {
        ...serverData,
        createdBy: currentUser.uid,
        createdAt: new Date(),
        memberCount: 1,
        onlineCount: 1,
        members: [currentUser.uid],
      };

      await addDoc(collection(db, "servers"), newServer);
      await fetchServers();
      setShowForm(false);
    } catch (error) {
      console.error("Error creating server:", error);
    }
  };

  const handleJoinServer = async (serverId: string) => {
    if (!currentUser) return;

    try {
      const serverRef = doc(db, "servers", serverId);
      const server = servers.find(s => s.id === serverId);

      if (server && !server.members?.includes(currentUser.uid)) {
        await updateDoc(serverRef, {
          members: [...(server.members || []), currentUser.uid],
          memberCount: (server.memberCount || 0) + 1
        });
        await fetchServers();
      }
    } catch (error) {
      console.error("Error joining server:", error);
    }
  };

  const handleDeleteServer = async (serverId: string) => {
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, "servers", serverId));
      await fetchServers();
    } catch (error) {
      console.error("Error deleting server:", error);
    }
  };

  const handleFavorite = async (serverId: string) => {
    // TODO: Implement favorite functionality
    console.log("Favorite server:", serverId);
  };

  const handleManageServer = (server: Server) => {
    setSelectedServer(server);
    setShowManagementModal(true);
  };

  const handleUpdateServer = async (serverId: string, updates: any) => {
    try {
      await updateDoc(doc(db, "servers", serverId), updates);
      await fetchServers();
    } catch (error) {
      console.error("Error updating server:", error);
    }
  };

  const filteredServers = servers.filter(server => {
    if (filter === 'all') return true;
    if (filter === 'my-servers') return server.createdBy === currentUser?.uid;
    if (filter === 'joined') return server.members?.includes(currentUser?.uid);
    return server.category === filter;
  });

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0f2c] via-[#1a237e] to-[#0f1e4b] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-700 opacity-30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400 opacity-20 rounded-full blur-2xl -z-10" />

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-cyan-200 text-lg">Loading communities...</p>
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
        <div className="max-w-6xl mx-auto flex justify-between items-center py-4 px-6">
          <Link href="/dashboard" className="text-cyan-200 hover:text-white transition font-semibold">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">Community Hub</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] px-4 py-2 rounded-lg font-bold shadow-lg transition"
          >
            + Create Server
          </button>
        </div>
      </header>

      {/* Main Content */}
      <section className="flex-1 max-w-6xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 bg-[#1d2542]/50 rounded-xl p-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${filter === 'all'
              ? 'bg-cyan-400 text-[#0a0f2c]'
              : 'text-cyan-200 hover:text-white'
              }`}
          >
            🌟 All Servers ({servers.length})
          </button>
          <button
            onClick={() => setFilter('my-servers')}
            className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${filter === 'my-servers'
              ? 'bg-cyan-400 text-[#0a0f2c]'
              : 'text-cyan-200 hover:text-white'
              }`}
          >
            👑 My Servers ({servers.filter(s => s.createdBy === currentUser?.uid).length})
          </button>
          <button
            onClick={() => setFilter('joined')}
            className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${filter === 'joined'
              ? 'bg-cyan-400 text-[#0a0f2c]'
              : 'text-cyan-200 hover:text-white'
              }`}
          >
            🤝 Joined ({servers.filter(s => s.members?.includes(currentUser?.uid)).length})
          </button>
          <button
            onClick={() => setFilter('gaming')}
            className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${filter === 'gaming'
              ? 'bg-cyan-400 text-[#0a0f2c]'
              : 'text-cyan-200 hover:text-white'
              }`}
          >
            🎮 Gaming
          </button>
          <button
            onClick={() => setFilter('study')}
            className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${filter === 'study'
              ? 'bg-cyan-400 text-[#0a0f2c]'
              : 'text-cyan-200 hover:text-white'
              }`}
          >
            📚 Study
          </button>
          <button
            onClick={() => setFilter('social')}
            className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${filter === 'social'
              ? 'bg-cyan-400 text-[#0a0f2c]'
              : 'text-cyan-200 hover:text-white'
              }`}
          >
            👥 Social
          </button>
        </div>

        {/* Servers Grid */}
        {filteredServers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {filter === 'my-servers' ? 'No servers created yet' :
                filter === 'joined' ? 'No servers joined yet' :
                  'No servers found'}
            </h3>
            <p className="text-cyan-200 mb-6">
              {filter === 'my-servers' ? 'Create your first server to get started!' :
                filter === 'joined' ? 'Join some servers to see them here!' :
                  'Be the first to create a server in this category!'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] px-8 py-3 rounded-xl font-bold shadow-lg transition"
            >
              Create Server
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServers.map(server => (
              <ServerCard
                key={server.id}
                server={server}
                onJoin={handleJoinServer}
                onDelete={handleDeleteServer}
                onFavorite={handleFavorite}
                onManage={handleManageServer}
                currentUserId={currentUser?.uid || ''}
              />
            ))}
          </div>
        )}
      </section>

      {/* Create Server Form */}
      {showForm && (
        <CreateServerForm
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateServer}
        />
      )}

      {/* Server Management Modal */}
      {showManagementModal && selectedServer && (
        <ServerManagementModal
          server={selectedServer}
          onClose={() => {
            setShowManagementModal(false);
            setSelectedServer(null);
          }}
          onUpdate={handleUpdateServer}
          currentUser={currentUser}
        />
      )}
    </main>
  );
}