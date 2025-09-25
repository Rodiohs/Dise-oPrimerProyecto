import React, { useEffect, useState } from "react";
const KEY = "pf_mockups_v1";

export default function MockupsManager() {
  const [versions, setVersions] = useState([]);
  const [form, setForm] = useState({ title: "", imageUrl: "", changesRequested: "", devNotes: "" });

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setVersions(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(versions));
  }, [versions]);

  function addVersion(e) {
    e.preventDefault();
    const v = {
      id: Date.now(),
      title: form.title || `v${versions.length + 1}`,
      imageUrl: form.imageUrl || "",
      changesRequested: form.changesRequested || "",
      devNotes: form.devNotes || "",
      createdAt: new Date().toISOString()
    };
    setVersions([v, ...versions]);
    setForm({ title: "", imageUrl: "", changesRequested: "", devNotes: "" });
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-3">Mockups & Versions</h2>

      <form onSubmit={addVersion} className="grid gap-2 md:grid-cols-4 mb-4">
        <input
          className="form-input border rounded p-2 md:col-span-1"
          placeholder="Version title (e.g., v1.0)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          className="form-input border rounded p-2 md:col-span-1"
          placeholder="Image URL (public/mockups/ or external URL)"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />
        <input
          className="form-input border rounded p-2 md:col-span-1"
          placeholder="Client changes requested"
          value={form.changesRequested}
          onChange={(e) => setForm({ ...form, changesRequested: e.target.value })}
        />
        <div className="md:col-span-1 flex items-center">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded" type="submit">
            Add Version
          </button>
        </div>

        <textarea
          className="form-textarea border rounded p-2 md:col-span-4"
          placeholder="Developer notes (optional)"
          value={form.devNotes}
          onChange={(e) => setForm({ ...form, devNotes: e.target.value })}
        />
      </form>

      <div>
        {versions.length === 0 && <p className="text-sm text-gray-500">No versions yet.</p>}
        {versions.map((v) => (
          <div key={v.id} className="border rounded p-3 mb-3">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <div className="font-medium">{v.title}</div>
                  <div className="text-xs text-gray-500">{new Date(v.createdAt).toLocaleString()}</div>
                </div>
                {v.imageUrl ? (
                  <img src={v.imageUrl} alt={v.title} className="mt-2 rounded max-w-xs border" />
                ) : (
                  <div className="mt-2 text-sm text-gray-500 italic">No image provided</div>
                )}

                <div className="mt-2 text-sm">
                  <div><strong>Client changes requested:</strong> {v.changesRequested || <em>None</em>}</div>
                  <div className="mt-1"><strong>Dev notes:</strong> {v.devNotes || <em>None</em>}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}