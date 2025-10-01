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

    // Listen for transaction changes to update spent amounts
    function handleStorageChange(event) {
      if (event.key === TX_KEY) {
        setTransactions(JSON.parse(event.newValue || "[]"));
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
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

      <div className="card mb-6">
        <h3 className="font-medium mb-2">Create Budget</h3>
        <form onSubmit={addBudget} className="grid gap-2 md:grid-cols-3">
          <input className="form-input w-full" placeholder="Budget name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          <input className="form-input w-full" placeholder="Limit (amount)" type="number" value={form.limit} onChange={e=>setForm({...form, limit:e.target.value})} />
          <input className="form-input w-full" placeholder="Tag to track (exact)" value={form.tag} onChange={e=>setForm({...form, tag:e.target.value})} />
          <div className="md:col-span-3 flex gap-2 mt-2">
            <button className="btn btn-primary" type="submit">Add Budget</button> {/* Use btn btn-primary */}
            <button type="button" className="btn btn-neutral-outline" onClick={()=>{ setBudgets([]); localStorage.removeItem(BUDGET_KEY); }}>Clear budgets</button> {/* Use btn btn-neutral-outline */}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {budgets.length === 0 && <div className="text-sm muted">No budgets yet. Create one above.</div>}
        {budgets.map(b => {
          const spent = computeSpent(b);
          const progress = Math.min(100, (spent / Math.max(1, b.limit)) * 100);
          const left = Math.max(0, b.limit - spent);

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
                  <div>Left: <span className="font-medium">{left.toFixed(2)} ₡</span></div>
                </div>

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

                <div className="flex justify-between mt-2 text-xs muted">
                  <div>{Math.round(progress)}%</div>
                  <div><button className="text-sm text-red-600 hover:underline" onClick={()=>removeBudget(b.id)}>Remove</button></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}