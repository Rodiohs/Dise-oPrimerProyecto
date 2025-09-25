import React, { useEffect, useState } from "react";
const STORAGE_KEY = "pf_transactions_v1";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ date: "", desc: "", amount: "" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTransactions(JSON.parse(raw));
    } catch (e) {
      console.error("Failed to read transactions", e);
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
      amount: parseFloat(form.amount)
    };
    setTransactions([tx, ...transactions]);
    setForm({ date: "", desc: "", amount: "" });
  }

  function removeTx(id) {
    setTransactions(transactions.filter((t) => t.id !== id));
  }

  const balance = transactions.reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-3">Transactions</h2>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-gray-500">Balance</div>
          <div className="text-2xl font-bold">{balance.toFixed(2)} ₡</div>
        </div>
      </div>

      <form onSubmit={addTx} className="form-row mb-4">
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
          placeholder="Amount (+ income, - expense)"
          type="number"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <div className="flex items-center">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
            Add
          </button>
        </div>
      </form>

      <ul>
        {transactions.length === 0 && (
          <li className="text-sm text-gray-500">No transactions yet.</li>
        )}
        {transactions.map((t) => (
          <li key={t.id} className="flex items-center justify-between py-2 border-b">
            <div>
              <div className="text-sm font-medium">{t.desc}</div>
              <div className="text-xs text-gray-500">{t.date}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`font-medium ${t.amount < 0 ? "text-red-600" : "text-green-600"}`}>
                {t.amount.toFixed(2)} ₡
              </div>
              <button
                className="text-sm text-red-600"
                onClick={() => removeTx(t.id)}
                aria-label="Remove transaction"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}