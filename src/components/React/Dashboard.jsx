import React from "react";
import Transactions from "./Transactions.jsx";
import Budget from "./Budget.jsx";
import MockupsManager from "./MockupsManager.jsx";

export default function Dashboard() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Personal Finance Prototype</h1>
        <p className="text-sm text-gray-600 mt-1">
          Simple prototype for tracking transactions, budgets and mockup versions.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="card">
          <Budget />
        </section>

        <section className="card">
          <h2 className="text-xl font-medium mb-3">Snapshot</h2>
          <p className="text-gray-600">Quick actions and summary will go here.</p>
        </section>
      </div>

      <div className="mt-6 card">
        <Transactions />
      </div>

      <div className="mt-6 card">
        <MockupsManager />
      </div>
    </div>
  );
}