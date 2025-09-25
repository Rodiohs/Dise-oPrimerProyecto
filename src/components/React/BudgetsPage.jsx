import React, { useEffect, useState } from "react";

const TX_KEY = "pf_transactions_v2";
const BUDGET_KEY = "pf_budgets_v2";

export default function BudgetsPage() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ name: "", limit: "", tag: "" });

  useEffect(() => {
    const rawT = localStorage.getItem(TX_KEY);
    if (rawT) setTransactions(JSON.parse(rawT));
    const rawB = localStorage.getItem(BUDGET_KEY);
    if (rawB) setBudgets(JSON.parse(rawB));
  }, []);

  useEffect(() => {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
  }, [budgets]);

  function addBudget(e) {
    e.preventDefault();
    if (!form.name || !form.limit || !form.tag) return;
    setBudgets([{ id: Date.now(), name: form.name, limit: Number(form.limit), tag: form.tag.trim() }, ...budgets]);
    setForm({ name: "", limit: "", tag: "" });
  }

  function removeBudget(id) {
    setBudgets(budgets.filter(b => b.id !== id));
  }

  // compute spent for a budget by summing transactions whose tags include the budget.tag
  function computeSpent(budget) {
    return transactions
      .filter(t => (t.tags || []).includes(budget.tag))
      .reduce((s, t) => s + (t.amount < 0 ? Math.abs(t.amount) : 0), 0); // only count expenses as spent
  }

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Budgets</h1>
        <p className="text-sm text-gray-600">Create budgets that track expenses by tag.</p>
      </header>

      <div className="card mb-6">
        <h3 className="font-medium mb-2">Create Budget</h3>
        <form onSubmit={addBudget} className="grid gap-2 md:grid-cols-3">
          <input className="form-input border rounded p-2" placeholder="Budget name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          <input className="form-input border rounded p-2" placeholder="Limit (amount)" type="number" value={form.limit} onChange={e=>setForm({...form, limit:e.target.value})} />
          <input className="form-input border rounded p-2" placeholder="Tag to track (exact)" value={form.tag} onChange={e=>setForm({...form, tag:e.target.value})} />
          <div className="md:col-span-3 flex gap-2 mt-2">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded" type="submit">Add Budget</button>
            <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={()=>{ setBudgets([]); localStorage.removeItem(BUDGET_KEY); }}>Clear budgets</button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {budgets.length === 0 && <div className="text-sm text-gray-500">No budgets yet. Create one above.</div>}
        {budgets.map(b => {
          const spent = computeSpent(b);
          const progress = Math.min(100, (spent / Math.max(1, b.limit)) * 100);
          const left = Math.max(0, b.limit - spent);

          return (
            <div key={b.id} className="card">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="font-medium text-lg">{b.name}</div>
                  <div className="text-sm text-gray-500">Tag: <span className="font-medium">{b.tag}</span></div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-500">Limit</div>
                  <div className="font-semibold">{b.limit.toFixed(2)} ₡</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <div>Spent: <span className="font-medium text-red-600">{spent.toFixed(2)} ₡</span></div>
                  <div>Left: <span className="font-medium">{left.toFixed(2)} ₡</span></div>
                </div>

                {/* progress bar */}
                <div className="w-full bg-gray-200 rounded h-4 overflow-hidden">
                  <div
                    className={`h-4 ${progress >= 100 ? "bg-red-600" : "bg-green-500"}`}
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow={Math.round(progress)}
                  />
                </div>

                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <div>{Math.round(progress)}%</div>
                  <div><button className="text-sm text-red-600" onClick={()=>removeBudget(b.id)}>Remove</button></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}