import React, { useEffect, useState } from "react";
import Accounts from "./Accounts.jsx";
import TransactionsManager from "./TransactionsManager.jsx";
import ExpenseIncomeCharts from "./ExpenseIncomeCharts.jsx";

const ACC_KEY = "pf_accounts_v1";
const TX_KEY = "pf_transactions_v2";

export default function DashboardApp() {
  const [accounts, setAccounts] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);

  useEffect(() => {
    try {
      const rawAccounts = localStorage.getItem(ACC_KEY);
      if (rawAccounts) {
        const parsedAccounts = JSON.parse(rawAccounts);
        setAccounts(parsedAccounts);
        setSelectedAccountIds([]);
      }

      const rawTransactions = localStorage.getItem(TX_KEY);
      if (rawTransactions) {
        setAllTransactions(JSON.parse(rawTransactions));
      }
    } catch (e) {
      console.error("Failed to load initial data from localStorage", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(ACC_KEY, JSON.stringify(accounts));
    setSelectedAccountIds(prevIds =>
      prevIds.filter(id => accounts.some(acc => acc.id === id))
    );
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(TX_KEY, JSON.stringify(allTransactions));
  }, [allTransactions]);

  const handleSelectAccount = (accountId) => {
    setSelectedAccountIds(prevSelected => {
      if (prevSelected.includes(accountId)) {
        return prevSelected.filter(id => id !== accountId);
      } else {
        return [...prevSelected, accountId];
      }
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm muted">Select accounts below to filter transactions and charts.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 card">
          <Accounts
            accounts={accounts}
            setAccounts={setAccounts}
            selectedAccountIds={selectedAccountIds}
            onSelectAccount={handleSelectAccount}
            allTransactions={allTransactions}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <TransactionsManager
            accounts={accounts}
            allTransactions={allTransactions}
            setAllTransactions={setAllTransactions}
            selectedAccountIds={selectedAccountIds}
          />
        </div>

        <aside className="card">
          <ExpenseIncomeCharts
            allTransactions={allTransactions}
            selectedAccountIds={selectedAccountIds}
          />
        </aside>
      </div>
    </div>
  );
}