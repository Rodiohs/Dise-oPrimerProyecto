import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal.jsx";

// ACC_KEY and TX_KEY are now managed by DashboardApp (TX_KEY needed for balances here)
const TX_KEY = "pf_transactions_v2"; // Keep local import for fallback/initial balance calc logic if needed.

export default function Accounts({ accounts, setAccounts, selectedAccountIds, onSelectAccount, allTransactions }) { // Receive new prop: allTransactions
  // transactions state removed, now using props for calculating balances
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", start: "" });

  // No useEffect for local transaction load/storage listener needed here, using props for transactions
  // The balances use the `allTransactions` prop directly.

  function addAccount(e) {
    e?.preventDefault();
    if (!form.name) return;
    const newAccount = { id: Date.now().toString(), name: form.name, start: Number(form.start || 0) };
    setAccounts([newAccount, ...accounts]);
    setForm({ name: "", start: "" });
    setModalOpen(false);
  }

  function removeAccount(id) {
    if (!confirm("Remove account? Transactions remain but won't be linked.")) return;
    setAccounts(accounts.filter(a => a.id !== id));
  }

  const balances = useMemo(() => {
    const map = {};
    accounts.forEach(a => { map[a.id] = (a.start || 0); });
    allTransactions.forEach(t => { // Use allTransactions prop here
      if (t.accountId && map[t.accountId] !== undefined) {
        map[t.accountId] += t.amount;
      }
    });
    return map;
  }, [accounts, allTransactions]); // Depend on accounts prop and allTransactions prop

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-semibold">Accounts</h2>
        <div>
          <button onClick={() => setModalOpen(true)} className="btn-primary px-4 py-2 rounded shadow">
            + Add account
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {accounts.length === 0 && <div className="text-sm muted col-span-full">No accounts yet. Click "Add account" to create one.</div>}
        {accounts.map(a => {
          const isSelected = selectedAccountIds.includes(a.id);
          return (
            <div
              key={a.id}
              className={`card selectable ${isSelected ? 'selected-card' : ''}`}
              onClick={() => onSelectAccount(a.id)}
              role="button"
              tabIndex="0"
              aria-pressed={isSelected}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs muted">Starting: {Number(a.start || 0).toFixed(2)} ₡</div>
                </div>
                <div className="text-right">
                  <div className="text-sm muted">Current</div>
                  <div className="font-semibold">{(balances[a.id] || 0).toFixed(2)} ₡</div>
                </div>
              </div>
              <div className="mt-2 text-right">
                  <button className="text-sm text-red-600 hover:underline" onClick={(e) => { e.stopPropagation(); removeAccount(a.id); }}>Remove</button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={modalOpen} title="Create account" onClose={() => setModalOpen(false)}>
        <form onSubmit={addAccount} className="space-y-3">
          <div>
            <label className="text-sm block mb-1">Account name</label>
            <input className="form-input border rounded p-2 w-full" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>

          <div>
            <label className="text-sm block mb-1">Starting amount</label>
            <input className="form-input border rounded p-2 w-full" type="number" value={form.start} onChange={e => setForm({...form, start: e.target.value})} />
          </div>

          <div className="flex justify-end gap-2">
            <button type="submit" className="btn-primary px-4 py-2 rounded">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}