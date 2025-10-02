import React, { useEffect, useState } from "react";
import Modal from "./Modal.jsx"; // Make sure the path is correct

const GUARANTEE_KEY = "pf_guarantees_v1";

export default function GuaranteesPage() {
  const [guarantees, setGuarantees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", amount: "", date: "" });

  useEffect(() => {
    // Load guarantees from localStorage
    try {
      const rawGuarantees = localStorage.getItem(GUARANTEE_KEY);
      if (rawGuarantees) {
        setGuarantees(JSON.parse(rawGuarantees));
      }
    } catch (e) {
      console.error("Failed to load guarantees from localStorage", e);
    }
  }, []);

  useEffect(() => {
    // Save guarantees to localStorage whenever the guarantees state changes
    localStorage.setItem(GUARANTEE_KEY, JSON.stringify(guarantees));
  }, [guarantees]);

  function addGuarantee(e) {
    e?.preventDefault(); // Prevent default form submission
    if (!form.name || !form.amount || !form.date) return;

    const newGuarantee = {
      id: Date.now().toString(),
      name: form.name,
      description: form.description,
      amount: parseFloat(form.amount),
      date: form.date,
    };

    setGuarantees([newGuarantee, ...guarantees]);
    setForm({ name: "", description: "", amount: "", date: "" });
    setModalOpen(false);
  }

  function removeGuarantee(id) {
    setGuarantees(guarantees.filter(g => g.id !== id));
  }


  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Guarantees</h1>
        <p className="text-sm muted">Track your guarantees and warranties.</p>
      </header>

      <div className="flex justify-end mb-4">
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Add Guarantee</button>
      </div>

      <div className="space-y-4">
        {guarantees.length === 0 && <div className="text-sm muted">No guarantees added yet.</div>}
        {guarantees.map(g => (
          <div key={g.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{g.name}</div>
                <div className="text-sm muted">{g.description || "No description"}</div>
                <div className="text-xs muted">Expires: {g.date}</div>
              </div>
              <div className="text-right">
                <div className="text-sm muted">Amount</div>
                <div className="font-semibold">{g.amount.toFixed(2)} ₡</div>
                <div className="mt-2">
                  <button className="text-sm text-red-600 hover:underline" onClick={() => removeGuarantee(g.id)}>Remove</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} title="Add Guarantee" onClose={() => setModalOpen(false)}>
        <form onSubmit={addGuarantee} className="space-y-3">
          <div>
            <label className="text-sm block mb-1">Name</label>
            <input className="form-input w-full" placeholder="e.g., Laptop Warranty" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>

          <div>
            <label className="text-sm block mb-1">Description</label>
            <input className="form-input w-full" placeholder="Details" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          <div className="grid md:grid-cols-2 gap-2">
            <div>
              <label className="text-sm block mb-1">Amount (if applicable)</label>
              <input className="form-input w-full" type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
            </div>
            <div>
              <label className="text-sm block mb-1">Expiry Date</label>
              <input className="form-input w-full" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
          </div>


          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-neutral-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Guarantee</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}