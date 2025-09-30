import React, { useEffect, useMemo, useState } from "react";

function formatAmount(n) {
  return `${n.toFixed(2)} ₡`;
}

export default function Summary() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem("pf_transactions_v2");
    if (raw) setTransactions(JSON.parse(raw));
  }, []);

  const {
    allExpenses,
    allIncomes,
    expensesByTag,
    incomesByTag,
    expensesByDate,
    incomesByDate,
    totalExpenses,
    totalIncomes
  } = useMemo(() => {
    const expenses = transactions.filter(t => t.amount < 0).map(t => ({ ...t, amount: Math.abs(t.amount) }));
    const incomes = transactions.filter(t => t.amount > 0);

    const expensesByTag = {};
    const incomesByTag = {};
    const expensesByDate = {};
    const incomesByDate = {};

    let totalExpenses = 0;
    let totalIncomes = 0;

    expenses.forEach(t => {
      totalExpenses += t.amount;
      (t.tags || []).forEach(tag => {
        expensesByTag[tag] = (expensesByTag[tag] || 0) + t.amount;
      });
      const d = (t.date || "").slice(0,10);
      expensesByDate[d] = (expensesByDate[d] || 0) + t.amount;
    });

    incomes.forEach(t => {
      totalIncomes += t.amount;
      (t.tags || []).forEach(tag => {
        incomesByTag[tag] = (incomesByTag[tag] || 0) + t.amount;
      });
      const d = (t.date || "").slice(0,10);
      incomesByDate[d] = (incomesByDate[d] || 0) + t.amount;
    });

    return {
      allExpenses: expenses,
      allIncomes: incomes,
      expensesByTag,
      incomesByTag,
      expensesByDate,
      incomesByDate,
      totalExpenses,
      totalIncomes
    };
  }, [transactions]);

  // helpers to render maps sorted
  function sortedEntries(map) {
    return Object.entries(map || {}).sort((a,b) => b[1] - a[1]);
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-3">Quick Summary</h3>

      <div className="space-y-4 text-sm">
        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs muted">Total incomes</div>
              <div className="font-semibold text-green-600">{formatAmount(totalIncomes)}</div>
            </div>
            <div>
              <div className="text-xs muted">Total expenses</div>
              <div className="font-semibold text-red-600">{formatAmount(totalExpenses)}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="font-medium mb-2">Expenses per tag</div>
          {sortedEntries(expensesByTag).length === 0 && <div className="text-sm muted">No data</div>}
          <ul>
            {sortedEntries(expensesByTag).map(([tag, amt]) => (
              <li key={tag} className="flex justify-between py-1">
                <div>{tag}</div>
                <div className="text-red-600">{formatAmount(amt)}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="font-medium mb-2">Incomes per tag</div>
          {sortedEntries(incomesByTag).length === 0 && <div className="text-sm muted">No data</div>}
          <ul>
            {sortedEntries(incomesByTag).map(([tag, amt]) => (
              <li key={tag} className="flex justify-between py-1">
                <div>{tag}</div>
                <div className="text-green-600">{formatAmount(amt)}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="font-medium mb-2">Expenses by date</div>
          {sortedEntries(expensesByDate).length === 0 && <div className="text-sm muted">No data</div>}
          <ul>
            {sortedEntries(expensesByDate).map(([date, amt]) => (
              <li key={date} className="flex justify-between py-1">
                <div>{date}</div>
                <div className="text-red-600">{formatAmount(amt)}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="font-medium mb-2">Incomes by date</div>
          {sortedEntries(incomesByDate).length === 0 && <div className="text-sm muted">No data</div>}
          <ul>
            {sortedEntries(incomesByDate).map(([date, amt]) => (
              <li key={date} className="flex justify-between py-1">
                <div>{date}</div>
                <div className="text-green-600">{formatAmount(amt)}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="font-medium mb-2">All expenses (latest)</div>
          {allExpenses.length === 0 && <div className="text-sm muted">No expenses yet</div>}
          <ul>
            {allExpenses.slice(0,6).map(t => (
              <li key={t.id} className="flex justify-between py-1">
                <div className="text-sm">{t.desc} <div className="text-xs muted">{t.tags?.join(", ")}</div></div>
                <div className="text-red-600">{formatAmount(t.amount)}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="font-medium mb-2">All incomes (latest)</div>
          {allIncomes.length === 0 && <div className="text-sm muted">No incomes yet</div>}
          <ul>
            {allIncomes.slice(0,6).map(t => (
              <li key={t.id} className="flex justify-between py-1">
                <div className="text-sm">{t.desc} <div className="text-xs muted">{t.tags?.join(", ")}</div></div>
                <div className="text-green-600">{formatAmount(t.amount)}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}