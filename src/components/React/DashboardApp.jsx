import React from "react";
import Accounts from "./Accounts.jsx";
import TransactionsManager from "./TransactionsManager.jsx";
import Summary from "./Summary.jsx";

export default function DashboardApp() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-600">Add incomes and expenses, assign them to accounts, and tag them for budgets.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 card">
          <Accounts />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <TransactionsManager />
        </div>

        <aside className="card">
          <Summary />
        </aside>
      </div>
    </div>
  );
}