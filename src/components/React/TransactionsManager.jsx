import React, { useEffect, useState, useMemo } from "react";
import Modal from "./Modal.jsx";

const STORAGE_KEY = "pf_transactions_v2";

function parseTags(s) {
  return s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

// Helper to filter transactions (now also handles accountId)
const filterTransactions = (transactions, selectedAccountIds, filters) => {
  let filteredTransactions = transactions;

  // Account Filter
  if (selectedAccountIds && selectedAccountIds.length > 0) {
    filteredTransactions = filteredTransactions.filter(t => selectedAccountIds.includes(t.accountId));
  }

  // Date Range Filter
  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= startDate);
  }
  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    filteredTransactions = filteredTransactions.filter(t => new Date(t.date) <= endDate);
  }

  // Tags Filter
  if (filters.tags && filters.tags.length > 0) {
    filteredTransactions = filteredTransactions.filter(t => {
      if (!t.tags || t.tags.length === 0) return false; // No tags means no match
      return filters.tags.every(filterTag => t.tags.includes(filterTag)); // "Contains all" logic
    });
  }

  // Description Filter
  if (filters.description) {
    const searchTerm = filters.description.toLowerCase();
    filteredTransactions = filteredTransactions.filter(t =>
      t.desc.toLowerCase().includes(searchTerm)
    );
  }

  // Amount Filter
  if (filters.amount && filters.amountOperator) { // Ensure an amount and operator are defined
    const amountValue = parseFloat(filters.amount);
    if (!isNaN(amountValue)) { // Only proceed if amount is a valid number
      if (filters.amountOperator === 'gt') {
        filteredTransactions = filteredTransactions.filter(t => t.amount > amountValue);
      } else if (filters.amountOperator === 'lt') {
        filteredTransactions = filteredTransactions.filter(t => t.amount < amountValue);
      } else if (filters.amountOperator === 'between') {
        // Assuming filters.amount is a string in the format "min,max"
        const [min, max] = filters.amount.split(',').map(s => parseFloat(s.trim()));
        if (!isNaN(min) && !isNaN(max)) {
          filteredTransactions = filteredTransactions.filter(t => t.amount >= min && t.amount <= max);
        }
      }
    }
  }

  return filteredTransactions;
};


export default function TransactionsManager({ accounts, allTransactions, setAllTransactions, selectedAccountIds }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ date: "", desc: "", amount: "", tags: "", accountId: "" });
  // NEW: Filter state
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    tags: [],
    description: "",
    amount: "",
    amountOperator: "gt", // Set initial operator to "greater than"
  });


  // Memoize filtered transactions
  const transactions = useMemo(() => {
    // console.log("Filtering transactions with", selectedAccountIds, filters);
    return filterTransactions(allTransactions, selectedAccountIds, filters);
  }, [allTransactions, selectedAccountIds, filters]);

  function openAddModal() {
    setForm({
      date: "",
      desc: "",
      amount: "",
      tags: "",
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
    setAllTransactions([tx, ...allTransactions]);
    setModalOpen(false);
  }

  function removeTx(id) {
    setAllTransactions(allTransactions.filter((t) => t.id !== id));
  }


  const income = transactions.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((s,t) => s + t.amount, 0);
  const balance = income + expenses;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-semibold">Transactions</h2>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={openAddModal}>+ Add transaction</button>
        </div>
      </div>

      {/* Transaction Filter Form */}
      <div className="card mb-4">
        <h3 className="text-lg font-medium mb-2">Filter Transactions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

          {/* Date Range */}
          <div>
            <label className="block text-sm muted mb-1">Start Date</label>
            <input
              type="date"
              className="form-input w-full"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm muted mb-1">End Date</label>
            <input
              type="date"
              className="form-input w-full"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>

          {/* Tags: Add tag filter when you have a way to determine possible values or budgets/categories*/}
          <div>
            <label className="block text-sm muted mb-1">Tags</label>
            <input
              type="text"
              className="form-input w-full"
              placeholder="e.g., food, groceries"
              value={filters.tags.join(',')} // Display comma-separated
              onChange={(e) => {
                const tagsArray = e.target.value ? parseTags(e.target.value) : [];
                setFilters({ ...filters, tags: tagsArray });
              }}
            />
          </div>

          {/* Description Search */}
          <div>
            <label className="block text-sm muted mb-1">Description</label>
            <input
              type="text"
              className="form-input w-full"
              placeholder="Search description"
              value={filters.description}
              onChange={(e) => setFilters({ ...filters, description: e.target.value })}
            />
          </div>

          {/* Amount Filtering */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <label className="block text-sm muted mb-1">Amount</label>
              <div className="flex gap-2">
                  <select
                      className="form-select w-24"
                      value={filters.amountOperator}
                      onChange={(e) => setFilters({ ...filters, amountOperator: e.target.value })}
                  >
                      <option value="gt"> &gt; </option>
                      <option value="lt"> &lt; </option>
                      <option value="between"> Between </option>
                  </select>
                  <input
                      type="number"
                      className="form-input w-full"
                      value={filters.amount}
                      onChange={(e) => setFilters({ ...filters, amount: e.target.value })}
                      placeholder="Amount"
                  />
              </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-4 text-sm">
          <div>Balance: <span className="font-semibold">{balance.toFixed(2)} ₡</span></div>
          <div className="text-green-600">Income: {income.toFixed(2)} ₡</div>
          <div className="text-red-600">Expenses: {Math.abs(expenses).toFixed(2)} ₡</div>
        </div>
      </div>

      <div className="text-sm muted mb-2">
          Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}.
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
            <input className="form-input w-full" type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} />
          </div>

          <div>
            <label className="text-sm block mb-1">Description</label>
            <input className="form-input w-full" value={form.desc} onChange={e=>setForm({...form, desc:e.target.value})} />
          </div>

          <div className="grid md:grid-cols-2 gap-2">
            <div>
              <label className="text-sm block mb-1">Amount (positive income, negative expense)</label>
              <input className="form-input w-full" type="number" step="0.01" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} />
            </div>

            <div>
              <label className="text-sm block mb-1">Account</label>
              <select className="form-input w-full" value={form.accountId} onChange={e=>setForm({...form, accountId:e.target.value})}>
                <option value="">Select account</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm block mb-1">Tags (comma separated)</label>
            <input className="form-input w-full" value={form.tags} onChange={e=>setForm({...form, tags:e.target.value})} />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={()=>setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add transaction</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}