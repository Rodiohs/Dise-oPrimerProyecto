import React, { useEffect, useMemo, useState } from "react";
import Modal from "./Modal.jsx";

const ACC_KEY = "pf_accounts_v1";
const TX_KEY = "pf_transactions_v2";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", start: "" });

  useEffect(() => {
    const rawA = localStorage.getItem(ACC_KEY);
    if (rawA) setAccounts(JSON.parse(rawA));
    const rawT = localStorage.getItem(TX_KEY);
    if (rawT) setTransactions(JSON.parse(rawT));
  }, []);

  useEffect(() => {
    localStorage.setItem(ACC_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    // keep transactions in sync if changed elsewhere
    function onStorage(e) {
      if (e.key === TX_KEY) {
        setTransactions(JSON.parse(e.newValue || "[]"));
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function addAccount(e) {
    e?.preventDefault();
    if (!form.name) return;
    const acc = { id: Date.now().toString(), name: form.name, start: Number(form.start || 0) };
    setAccounts([acc, ...accounts]);
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
    transactions.forEach(t => {
      if (t.accountId && map[t.accountId] !== undefined) {
        map[t.accountId] += t.amount;
      }
    });
    return map;
  }, [accounts, transactions]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-semibold">Accounts</h2>
        <div>
          <button onClick={() => setModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded shadow">
            + Add account
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {accounts.length === 0 && <div className="text-sm text-gray-500">No accounts yet. Click "Add account" to create one.</div>}
        {accounts.map(a => (
          <div key={a.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{a.name}</div>
              <div className="text-xs text-gray-500">Starting: {Number(a.start||0).toFixed(2)} ₡</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Current</div>
              <div className="font-semibold">{(balances[a.id] || 0).toFixed(2)} ₡</div>
              <div className="mt-2">
                <button className="text-sm text-red-600" onClick={() => removeAccount(a.id)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
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
            <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}