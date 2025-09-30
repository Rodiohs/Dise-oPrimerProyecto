import React, { useEffect, useState } from "react";
import Accounts from "./Accounts.jsx";
import TransactionsManager from "./TransactionsManager.jsx";
import ExpenseIncomeCharts from "./ExpenseIncomeCharts.jsx";

const ACC_KEY = "pf_accounts_v1";
const TX_KEY = "pf_transactions_v2"; // Key for transactions

export default function DashboardApp() {
  const [accounts, setAccounts] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // NEW STATE: all transactions
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);

  // Load accounts and allTransactions from localStorage on component mount
  useEffect(() => {
    try {
      const rawAccounts = localStorage.getItem(ACC_KEY);
      if (rawAccounts) {
        const parsedAccounts = JSON.parse(rawAccounts);
        setAccounts(parsedAccounts);
        setSelectedAccountIds([]); // Start with none selected
      }

      const rawTransactions = localStorage.getItem(TX_KEY);
      if (rawTransactions) {
        setAllTransactions(JSON.parse(rawTransactions));
      }
    } catch (e) {
      console.error("Failed to load initial data from localStorage", e);
    }
  }, []);

  // Save accounts to localStorage whenever accounts state changes
  useEffect(() => {
    localStorage.setItem(ACC_KEY, JSON.stringify(accounts));
    // When accounts list changes, ensure selectedAccountIds only contains existing IDs.
    setSelectedAccountIds(prevIds =>
      prevIds.filter(id => accounts.some(acc => acc.id === id))
    );
  }, [accounts]);

  // Save allTransactions to localStorage whenever allTransactions state changes
  useEffect(() => {
    localStorage.setItem(TX_KEY, JSON.stringify(allTransactions));
  }, [allTransactions]);


  // Handle account selection
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
            // Accounts also needs allTransactions to calculate current balances
            allTransactions={allTransactions}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          {/* Pass accounts, allTransactions, setAllTransactions, and selectedAccountIds */}
          <TransactionsManager
            accounts={accounts}
            allTransactions={allTransactions}
            setAllTransactions={setAllTransactions}
            selectedAccountIds={selectedAccountIds}
          />
        </div>

        <aside className="card">
          {/* Pass allTransactions and selectedAccountIds to ExpenseIncomeCharts */}
          <ExpenseIncomeCharts
            allTransactions={allTransactions}
            selectedAccountIds={selectedAccountIds}
          />
        </aside>
      </div>
    </div>
  );
}