import React, { useEffect, useState } from "react";
const STORAGE_KEY = "pf_transactions_v2";

// helper to normalize tags input "a, b" -> ["a","b"]
function parseTags(s) {
  return s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function TransactionsManager() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ date: "", desc: "", amount: "", tags: "" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTransactions(JSON.parse(raw));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  function addTx(e) {
    e.preventDefault();
    if (!form.desc || !form.amount) return;
    const tx = {
      id: Date.now(),
      date: form.date || new Date().toISOString().slice(0, 10),
      desc: form.desc,
      amount: Number(form.amount),
      tags: parseTags(form.tags)
    };
    setTransactions([tx, ...transactions]);
    setForm({ date: "", desc: "", amount: "", tags: "" });
  }

  function removeTx(id) {
    setTransactions(transactions.filter((t) => t.id !== id));
  }

  const income = transactions.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((s,t) => s + t.amount, 0);
  const balance = income + expenses;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-3">Transactions</h2>

      <form onSubmit={addTx} className="grid gap-2 md:grid-cols-4 mb-4">
        <input
          className="form-input border rounded p-2"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <input
          className="form-input border rounded p-2"
          placeholder="Description"
          value={form.desc}
          onChange={(e) => setForm({ ...form, desc: e.target.value })}
        />
        <input
          className="form-input border rounded p-2"
          placeholder="Amount (positive income, negative expense)"
          type="number"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <input
          className="form-input border rounded p-2"
          placeholder="Tags (comma separated, e.g., University, Food)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
        />
        <div className="md:col-span-4 flex gap-2 mt-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">Add</button>
          <button
            type="button"
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={() => { setTransactions([]); localStorage.removeItem(STORAGE_KEY); }}
            title="Clear all transactions"
          >
            Clear all
          </button>
        </div>
      </form>

      <div className="mb-4">
        <div className="flex items-center gap-4 text-sm">
          <div>Balance: <span className="font-semibold">{balance.toFixed(2)} ₡</span></div>
          <div className="text-green-600">Income: {income.toFixed(2)} ₡</div>
          <div className="text-red-600">Expenses: {Math.abs(expenses).toFixed(2)} ₡</div>
        </div>
      </div>

      <ul className="divide-y">
        {transactions.length === 0 && <li className="text-sm text-gray-500 py-4">No transactions yet.</li>}
        {transactions.map((t) => (
          <li key={t.id} className="py-3 flex justify-between items-start">
            <div>
              <div className="font-medium">{t.desc}</div>
              <div className="text-xs text-gray-500">{t.date} • {t.tags.join(", ") || "-"}</div>
            </div>

            <div className="text-right">
              <div className={`font-semibold ${t.amount < 0 ? "text-red-600" : "text-green-600"}`}>
                {t.amount.toFixed(2)} ₡
              </div>
              <button className="text-xs text-red-600 mt-1" onClick={() => removeTx(t.id)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}