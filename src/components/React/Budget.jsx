import React, { useEffect, useState } from "react";
const KEY = "pf_budgets_v1";

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [newB, setNewB] = useState({ name: "", limit: "" });

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setBudgets(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(budgets));
  }, [budgets]);

  function addBudget(e) {
    e.preventDefault();
    if (!newB.name || !newB.limit) return;
    setBudgets([{ id: Date.now(), name: newB.name, limit: Number(newB.limit) }, ...budgets]);
    setNewB({ name: "", limit: "" });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Budgets</h2>
      <form onSubmit={addBudget} className="flex gap-2 mb-4 flex-col sm:flex-row">
        <input
          className="form-input border rounded p-2 flex-1"
          value={newB.name}
          onChange={(e) => setNewB({ ...newB, name: e.target.value })}
          placeholder="Category"
        />
        <input
          className="form-input border rounded p-2"
          value={newB.limit}
          onChange={(e) => setNewB({ ...newB, limit: e.target.value })}
          placeholder="Limit"
          type="number"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">
          Add
        </button>
      </form>

      <ul>
        {budgets.length === 0 && <li className="text-sm text-gray-500">No budgets yet.</li>}
        {budgets.map((b) => (
          <li key={b.id} className="py-2 border-b flex justify-between">
            <div>
              <div className="font-medium">{b.name}</div>
              <div className="text-xs text-gray-500">Limit</div>
            </div>
            <div className="font-semibold">{b.limit.toFixed(2)} ₡</div>
          </li>
        ))}
      </ul>
    </div>
  );
}