import React, { useEffect, useState, useMemo } from "react";
import Modal from "./Modal.jsx";

// STORAGE_KEY for transactions still here, but state managed by DashboardApp
// ACC_KEY not needed here, accounts come from props

function parseTags(s) {
  return s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

// Helper to filter transactions
const filterTransactionsByAccounts = (transactions, selectedAccountIds) => {
  if (!selectedAccountIds || selectedAccountIds.length === 0) {
    return [];
  }
  return transactions.filter(t => selectedAccountIds.includes(t.accountId));
};


export default function TransactionsManager({ accounts, allTransactions, setAllTransactions, selectedAccountIds }) { // Receive new props
  // allTransactions state and useEffect for loading/saving removed, now handled by DashboardApp
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ date: "", desc: "", amount: "", tags: "", accountId: "" });

  // Filter transactions based on selectedAccountIds
  const transactions = useMemo(() => {
    return filterTransactionsByAccounts(allTransactions, selectedAccountIds); // Use allTransactions prop here
  }, [allTransactions, selectedAccountIds]); // Depend on allTransactions prop

  function openAddModal() {
    setForm({
      date: "",
      desc: "",
      amount: "",
      tags: "",
      // Pre-select the first currently selected account if available
      accountId: selectedAccountIds.length > 0 ? selectedAccountIds[0] : accounts[0]?.id || ""
    });
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
    setAllTransactions([tx, ...allTransactions]); // Update via prop setter
    setModalOpen(false);
  }

  function removeTx(id) {
    setAllTransactions(allTransactions.filter((t) => t.id !== id)); // Update via prop setter
  }

  const income = transactions.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((s,t) => s + t.amount, 0);
  const balance = income + expenses;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-semibold">Transactions</h2>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={openAddModal}>+ Add transaction</button>
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
        {transactions.length === 0 && (
          <li className="text-sm muted py-4 text-center">
            {selectedAccountIds.length === 0 && accounts.length > 0
              ? "Select one or more accounts to view transactions."
              : "No transactions matching selected accounts yet."}
          </li>
        )}
        {transactions.map((t) => (
          <li key={t.id} className="py-3 flex justify-between items-start">
            <div>
              <div className="font-medium">{t.desc}</div>
              <div className="text-xs muted">
                {t.date} • {t.tags.join(", ") || "-"} • {accounts.find(a => a.id === t.accountId)?.name || "—"}
              </div>
            </div>

            <div className="text-right">
              <div className={`font-semibold ${t.amount < 0 ? "text-red-600" : "text-green-600"}`}>{t.amount.toFixed(2)} ₡</div>
              <button className="text-xs text-red-600 mt-1 hover:underline" onClick={() => removeTx(t.id)}>Remove</button>
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
            <button type="submit" className="btn-primary">Add transaction</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}