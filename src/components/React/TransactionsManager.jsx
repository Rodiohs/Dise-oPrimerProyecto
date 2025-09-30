import React, { useEffect, useState } from "react";
import Modal from "./Modal.jsx";

const STORAGE_KEY = "pf_transactions_v2";
const ACC_KEY = "pf_accounts_v1";

function parseTags(s) {
  return s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function TransactionsManager() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ date: "", desc: "", amount: "", tags: "", accountId: "" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTransactions(JSON.parse(raw));
      const rawA = localStorage.getItem(ACC_KEY);
      if (rawA) setAccounts(JSON.parse(rawA));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  function openAddModal() {
    setForm({ date: "", desc: "", amount: "", tags: "", accountId: accounts[0]?.id || "" });
    setModalOpen(true);
  }

  function addTx(e) {
    e?.preventDefault();
    if (!form.desc || !form.amount) return;
    if (!form.accountId) {
      alert("Please select an account.");
      return;
    }
    const tx = {
      id: Date.now(),
      date: form.date || new Date().toISOString().slice(0, 10),
      desc: form.desc,
      amount: Number(form.amount),
      tags: parseTags(form.tags),
      accountId: form.accountId
    };
    setTransactions([tx, ...transactions]);
    setModalOpen(false);
  }

  function removeTx(id) {
    setTransactions(transactions.filter((t) => t.id !== id));
  }

  const income = transactions.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((s,t) => s + t.amount, 0);
  const balance = income + expenses;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-semibold">Transactions</h2>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={openAddModal}>+ Add transaction</button>
          <button className="bg-gray-200 px-3 py-2 rounded" onClick={() => { setTransactions([]); localStorage.removeItem(STORAGE_KEY); }}>Clear all</button>
        </div>
      </div>

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
              <div className="text-xs text-gray-500">{t.date} • {t.tags.join(", ") || "-"} • {accounts.find(a=>a.id===t.accountId)?.name || "—"}</div>
            </div>

            <div className="text-right">
              <div className={`font-semibold ${t.amount < 0 ? "text-red-600" : "text-green-600"}`}>{t.amount.toFixed(2)} ₡</div>
              <button className="text-xs text-red-600 mt-1" onClick={() => removeTx(t.id)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>

      <Modal open={modalOpen} title="Add transaction" onClose={() => setModalOpen(false)}>
        <form onSubmit={addTx} className="space-y-3">
          <div>
            <label className="text-sm block mb-1">Date</label>
            <input className="form-input border rounded p-2 w-full" type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} />
          </div>

          <div>
            <label className="text-sm block mb-1">Description</label>
            <input className="form-input border rounded p-2 w-full" value={form.desc} onChange={e=>setForm({...form, desc:e.target.value})} />
          </div>

          <div className="grid md:grid-cols-2 gap-2">
            <div>
              <label className="text-sm block mb-1">Amount (positive income, negative expense)</label>
              <input className="form-input border rounded p-2 w-full" type="number" step="0.01" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} />
            </div>

            <div>
              <label className="text-sm block mb-1">Account</label>
              <select className="form-input border rounded p-2 w-full" value={form.accountId} onChange={e=>setForm({...form, accountId:e.target.value})}>
                <option value="">Select account</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm block mb-1">Tags (comma separated)</label>
            <input className="form-input border rounded p-2 w-full" value={form.tags} onChange={e=>setForm({...form, tags:e.target.value})} />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={()=>setModalOpen(false)}>Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add transaction</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}