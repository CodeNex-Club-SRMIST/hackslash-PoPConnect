'use client';

import { useState } from 'react';
import '../globals.css';

// ---------------- Types ----------------
type Server = {
  id: number;
  name: string;
  description: string;
  category: string;
  privacy: 'public' | 'private';
  memberCount: number;
  onlineCount: number;
  status: 'online' | 'offline' | 'busy';
  tags: string[];
  skills: string[];
  location: string;
  rules: string;
  minAge: number;
  maxMembers: number;
  visibility: 'listed' | 'unlisted';
  inviteLink?: string;
  isFavorited?: boolean;
};

// ---------------- Dummy Servers ----------------
const mockServers: Server[] = [
  {
    id: 1,
    name: 'Gaming Legends',
    description: 'For competitive gamers and esports enthusiasts',
    category: 'gaming',
    privacy: 'public',
    memberCount: 1243,
    onlineCount: 87,
    status: 'online',
    tags: ['esports', 'tournaments', 'FPS'],
    skills: ['gaming', 'strategy'],
    location: 'Global',
    rules: 'Be respectful, no cheating',
    minAge: 13,
    maxMembers: 5000,
    visibility: 'listed',
  },
  {
    id: 2,
    name: 'PRANAU',
    description: 'Red Bull gives you wings',
    category: 'gaming',
    privacy: 'public',
    memberCount: 500,
    onlineCount: 23,
    status: 'online',
    tags: ['eggs', 'proteins', 'chickens'],
    skills: ['speedrunning'],
    location: 'Global',
    rules: 'No sleep allowed',
    minAge: 13,
    maxMembers: 1000,
    visibility: 'listed',
  },
  {
    id: 3,
    name: 'Jain Server',
    description: 'Join the ascetic gaming revolution',
    category: 'social',
    privacy: 'private',
    memberCount: 1,
    onlineCount: 0,
    status: 'offline',
    tags: ['meditation', 'no-meat'],
    skills: [],
    location: 'India',
    rules: 'Vegetarian only',
    minAge: 18,
    maxMembers: 100,
    visibility: 'unlisted',
  }
];

// ---------------- Components ----------------
const ServerCard = ({ server }: { server: Server }) => {
  const [isFavorited, setIsFavorited] = useState(server.isFavorited || false);

  return (
    <div className="server-card">
      <div className="server-content">
        <div className="server-header">
          <div>
            <h3>{server.name}</h3>
            <div className="server-meta">
              <span className={`privacy-label ${server.privacy}`}>
                {server.privacy === 'private' ? '🔒 Private' : '🌍 Public'}
              </span>
              {server.location && <span>📍 {server.location}</span>}
              {server.minAge && <span>👶 {server.minAge}+</span>}
            </div>
          </div>
          <button 
            onClick={() => setIsFavorited(!isFavorited)} 
            className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
            aria-label={isFavorited ? 'Unfavorite server' : 'Favorite server'}
          >
            {isFavorited ? '❤️' : '🤍'}
          </button>
        </div>
        <p className="server-description">{server.description}</p>
        {server.tags.length > 0 && (
          <div className="server-tags">
            {server.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}
        <div className="server-stats">
          <span>👥 {server.memberCount}/{server.maxMembers}</span>
          <button className="join-btn">
            {server.privacy === 'private' ? 'Request Join' : 'Join Server'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ... (Keep the rest of the code: CreateServerForm, CommunityPage as-is)

const CreateServerForm = ({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: Server) => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Omit<Server, 'id' | 'memberCount' | 'onlineCount' | 'status' | 'messageCount'>>({
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
    inviteLink: '',
    
    
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'minAge' || name === 'maxMembers' ? parseInt(value) || 0 : value
    }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'tags' | 'skills') => {
    const values = e.target.value.split(',').map(item => item.trim());
    setFormData(prev => ({ ...prev, [field]: values }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: Date.now(),
      memberCount: 1,
      onlineCount: 1,
      status: 'online',
      messageCount: 0
    } as Server);
  };

  const renderStep = () => {
    switch(step) {
      case 1: return (
        <>
          <h2>Basic Information</h2>
          <div className="form-group">
            <label>Server Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} />
          </div>
          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input type="text" value={formData.tags.join(', ')} onChange={(e) => handleArrayChange(e, 'tags')} />
          </div>
          <div className="form-group">
            <label>Skills/Interests (comma separated)</label>
            <input type="text" value={formData.skills.join(', ')} onChange={(e) => handleArrayChange(e, 'skills')} />
          </div>
        </>
      );

      case 2: return (
        <>
          <h2>Server Settings</h2>
          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="gaming">Gaming</option>
              <option value="study">Study</option>
              <option value="social">Social</option>
              <option value="business">Business</option>
            </select>
          </div>
          <div className="form-group">
            <label>Privacy *</label>
            <div className="radio-group">
              <label>
                <input type="radio" name="privacy" value="public" checked={formData.privacy === 'public'} onChange={handleChange} />
                Public (Anyone can join)
              </label>
              <label>
                <input type="radio" name="privacy" value="private" checked={formData.privacy === 'private'} onChange={handleChange} />
                Private (Invite only)
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Visibility *</label>
            <div className="radio-group">
              <label>
                <input type="radio" name="visibility" value="listed" checked={formData.visibility === 'listed'} onChange={handleChange} />
                Listed (Visible in discovery)
              </label>
              <label>
                <input type="radio" name="visibility" value="unlisted" checked={formData.visibility === 'unlisted'} onChange={handleChange} />
                Unlisted (Only via invite link)
              </label>
            </div>
          </div>
        </>
      );

      case 3: return (
        <>
          <h2>Community Guidelines</h2>
          <div className="form-group">
            <label>Location/Region</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Minimum Age *</label>
            <input type="number" name="minAge" min="13" max="100" value={formData.minAge} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Maximum Members *</label>
            <input type="number" name="maxMembers" min="10" max="10000" value={formData.maxMembers} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Rules/Guidelines</label>
            <textarea name="rules" value={formData.rules} onChange={handleChange} rows={5} placeholder="List your community rules..." />
          </div>
        </>
      );

      default: return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <div className="form-header">
            <h1>Create Server</h1>
            <button type="button" onClick={onClose} className="close-btn">×</button>
          </div>

          <div className="form-steps">
            {[1, 2, 3].map((stepNumber) => (
              <div 
                key={stepNumber} 
                className={`step-indicator ${step === stepNumber ? 'active' : step > stepNumber ? 'completed' : ''}`}
                onClick={() => step > stepNumber && setStep(stepNumber)}
              >
                {stepNumber}
              </div>
            ))}
          </div>

          <div className="form-body">
            {renderStep()}
          </div>

          <div className="form-actions">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="secondary-btn">
                Back
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={() => setStep(step + 1)} className="primary-btn">
                Next
              </button>
            ) : (
              <button type="submit" className="primary-btn">
                Create Server
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default function CommunityPage() {
  const [servers, setServers] = useState<Server[]>(mockServers);
  const [showForm, setShowForm] = useState(false);

  const handleCreateServer = (newServer: Omit<Server, 'id'>) => {
    const server: Server = {
      ...newServer,
      id: Date.now(),
      memberCount: 1,
      onlineCount: 1,
      status: 'online',
     
      
      tags: newServer.tags || [],
      skills: newServer.skills || [],
    };
    setServers([...servers, server]);
    setShowForm(false);
  };

  return (
    <div className="community-container">
      <div className="community-header">
        <h1>Community Hub</h1>
        <button onClick={() => setShowForm(true)} className="create-server-btn">
          + Create Server
        </button>
      </div>
      <div className="servers-grid">
        {servers.map(server => <ServerCard key={server.id} server={server} />)}
      </div>
      {showForm && <CreateServerForm onClose={() => setShowForm(false)} onSubmit={handleCreateServer} />}
    </div>
  );
}