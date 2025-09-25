import React, { useEffect, useState } from "react";
const KEY = "pf_meetings_v1";

export default function MeetingLog() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ date: "", purpose: "", attendees: "", duration: "", client: "", points: "" });

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setEntries(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(entries));
  }, [entries]);

  function addEntry(e) {
    e.preventDefault();
    setEntries([{ id: Date.now(), ...form, createdAt: new Date().toISOString() }, ...entries]);
    setForm({ date: "", purpose: "", attendees: "", duration: "", client: "", points: "" });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-3">Meeting Log (Bitácora)</h1>

      <form onSubmit={addEntry} className="grid gap-2 md:grid-cols-2 mb-4">
        <input className="form-input border rounded p-2" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <input className="form-input border rounded p-2" placeholder="Purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
        <input className="form-input border rounded p-2" placeholder="Attendees (comma separated)" value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })} />
        <input className="form-input border rounded p-2" placeholder="Duration (mins)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
        <input className="form-input border rounded p-2" placeholder="Client (who acted as client this week)" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
        <textarea className="form-textarea border rounded p-2 md:col-span-2" placeholder="Points to work on / notes" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} />
        <div className="md:col-span-2">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded" type="submit">Add meeting</button>
        </div>
      </form>

      <ul>
        {entries.length === 0 && <li className="text-sm text-gray-500">No meetings yet.</li>}
        {entries.map((e) => (
          <li key={e.id} className="py-3 border-b">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{e.purpose || "Meeting"}</div>
                <div className="text-xs text-gray-500">{e.date || new Date(e.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="text-sm text-gray-600">Client: <span className="font-medium">{e.client || "-"}</span></div>
            </div>
            <div className="mt-2 text-sm text-gray-700">
              <div><strong>Attendees:</strong> {e.attendees || "-"}</div>
              <div><strong>Duration:</strong> {e.duration || "-"} mins</div>
              <div className="mt-1"><strong>Notes:</strong> {e.points || "-"}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}