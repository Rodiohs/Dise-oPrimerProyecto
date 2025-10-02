import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal.jsx"; // Make sure the path is correct

const TX_KEY = "pf_transactions_v2";
const BUDGET_KEY = "pf_budgets_v2";

// Helper to format currency
function formatAmount(n) {
  return `${n.toFixed(2)} ₡`;
}

export default function BudgetsPage() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false); // State to control the modal visibility
  const [form, setForm] = useState({ name: "", limit: "", tag: "", startDate: "", endDate: "" }); // NEW: include startDate, endDate

  useEffect(() => {
    const rawT = localStorage.getItem(TX_KEY);
    if (rawT) setTransactions(JSON.parse(rawT));
    const rawB = localStorage.getItem(BUDGET_KEY);
    if (rawB) setBudgets(JSON.parse(rawB));

    // Listen for transaction changes to update spent amounts. The new chart needs this.
    function handleStorageChange(event) {
      if (event.key === TX_KEY) {
        setTransactions(JSON.parse(event.newValue || "[]"));
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []); // Dependency array: only run on component mount

  useEffect(() => {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
  }, [budgets]);

  function addBudget(e) {
    e?.preventDefault(); // Prevent default form submission
    if (!form.name || !form.limit || !form.tag) return;

    const newBudget = {
      id: Date.now().toString(), // Generate a unique ID (useDate.now() + Math.random() for more uniqueness)
      name: form.name,
      limit: Number(form.limit),
      tag: form.tag.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
    };

    setBudgets([newBudget, ...budgets]);
    setForm({ name: "", limit: "", tag: "", startDate: "", endDate: "" });
    setModalOpen(false);
  }

  function removeBudget(id) {
    setBudgets(budgets.filter(b => b.id !== id));
  }

  // compute spent for a budget by summing transactions whose tags match the budget.tag
  function computeSpent(budget) {
    return transactions
      .filter(t => (t.tags || []).includes(budget.tag))
      .reduce((s, t) => s + (t.amount < 0 ? Math.abs(t.amount) : 0), 0);
  }

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Budgets</h1>
        <p className="text-sm muted">Create budgets that track expenses by tag.</p>
      </header>

      <div className="flex justify-end mb-4">
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Add Budget</button>
      </div>

      <div className="space-y-4">
        {budgets.length === 0 && <div className="text-sm muted">No budgets yet. Create one above.</div>}
        {budgets.map(b => {
          const spent = computeSpent(b);
          const progress = Math.min(100, (spent / Math.max(1, b.limit)) * 100); // Clamp progress to 100%

          return (
            <div key={b.id} className="card">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="font-medium text-lg">{b.name}</div>
                  <div className="text-sm muted">Tag: <span className="font-medium">{b.tag}</span></div>
                </div>

                <div className="text-right">
                  <div className="text-sm muted">Limit</div>
                  <div className="font-semibold">{b.limit.toFixed(2)} ₡</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <div>Spent: <span className="font-medium text-red-600">{spent.toFixed(2)} ₡</span></div>
                  <div>Left: <span className="font-medium">{formatAmount(Math.max(0, b.limit - spent))}</span></div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700"> {/* Light/Dark mode support */}
                  <div
                    className="h-3 rounded-full bg-green-500"
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow={Math.round(progress)}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs muted">
                  <div>Start: {b.startDate || "-"}</div>
                  <div>End: {b.endDate || "-"}</div>
                  <div>{Math.round(progress)}%</div>
                  <div><button className="text-sm text-red-600 hover:underline" onClick={()=>removeBudget(b.id)}>Remove</button></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for adding a budget */}
      <Modal open={isModalOpen} title="Create budget" onClose={() => setModalOpen(false)}>
        <form onSubmit={addBudget} className="space-y-3">
          <div>
            <label className="text-sm block mb-1">Budget name</label>
            <input className="form-input w-full" placeholder="e.g., Groceries" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>

          <div>
            <label className="text-sm block mb-1">Limit</label>
            <input className="form-input w-full" type="number" placeholder="Monthly budget limit" value={form.limit} onChange={e => setForm({...form, limit: e.target.value})} />
          </div>

          <div>
            <label className="text-sm block mb-1">Tag</label>
            <input className="form-input w-full" placeholder="Matching Tag" value={form.tag} onChange={e => setForm({...form, tag: e.target.value})} />
          </div>

          <div className="grid md:grid-cols-2 gap-2">
            <div>
              <label className="text-sm block mb-1">Start Date (Optional)</label>
              <input className="form-input w-full" type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
            </div>

            <div>
              <label className="text-sm block mb-1">End Date (Optional)</label>
              <input className="form-input w-full" type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}