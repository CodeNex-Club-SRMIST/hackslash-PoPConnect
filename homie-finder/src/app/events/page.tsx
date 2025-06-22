"use client";
import React, { useEffect, useState } from "react";
import { createEvent, getEvents } from "../../lib/events/events";
import { auth } from "../../lib/services/firebase";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", date: "", location: "" });

  useEffect(() => {
    async function fetchEvents() {
      const data = await getEvents();
      setEvents(data);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date || !form.location || !auth.currentUser) return;
    await createEvent({ ...form, host: auth.currentUser.uid });
    setForm({ title: "", description: "", date: "", location: "" });
    const data = await getEvents();
    setEvents(data);
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0f2c] via-[#1a237e] to-[#0f1e4b] items-center justify-center p-8">
      <div className="w-full max-w-xl bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-cyan-400/10 p-8">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Events & Meetups</h1>
        <form onSubmit={handleSubmit} className="space-y-3 mb-8">
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-[#181f3a] text-cyan-100 border border-cyan-400/30 focus:outline-none focus:border-cyan-400"
            placeholder="Event Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />
          <textarea
            className="w-full px-4 py-2 rounded-lg bg-[#181f3a] text-cyan-100 border border-cyan-400/30 focus:outline-none focus:border-cyan-400"
            placeholder="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <input
            type="date"
            className="w-full px-4 py-2 rounded-lg bg-[#181f3a] text-cyan-100 border border-cyan-400/30 focus:outline-none focus:border-cyan-400"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            required
          />
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-[#181f3a] text-cyan-100 border border-cyan-400/30 focus:outline-none focus:border-cyan-400"
            placeholder="Location"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            required
          />
          <button type="submit" className="bg-cyan-400 hover:bg-cyan-300 text-[#0a0f2c] font-bold py-2 px-4 rounded-lg shadow transition text-base">Create Event</button>
        </form>
        {loading ? (
          <div className="text-cyan-200 text-center">Loading...</div>
        ) : events.length === 0 ? (
          <div className="text-cyan-200 text-center">No events yet.</div>
        ) : (
          <ul className="space-y-4">
            {events.map((event) => (
              <li key={event.id} className="bg-[#181f3a] rounded-xl p-4 border border-cyan-400/20">
                <div className="text-cyan-100 font-bold text-lg mb-1">{event.title}</div>
                <div className="text-cyan-200 mb-1">{event.description}</div>
                <div className="text-cyan-300 text-sm mb-1">Date: {event.date}</div>
                <div className="text-cyan-300 text-sm">Location: {event.location}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
