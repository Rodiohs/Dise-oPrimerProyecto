import React, { useEffect, useState, useMemo } from "react";
import Modal from "./Modal.jsx";

const DEBT_KEY = "pf_debts_v1";
const PAYMENT_KEY = "pf_payments_v1";

function formatAmount(n) {
  return `${n.toFixed(2)} ₡`;
}

export default function DebtsPage() {
  const [debts, setDebts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [addDebtModalOpen, setAddDebtModalOpen] = useState(false);
  const [addPaymentModalOpen, setAddPaymentModalOpen] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState(null);
  const [debtForm, setDebtForm] = useState({
    name: "",
    lender: "",
    principal: "",
    interestRate: "",
    startDate: "",
    dueDate: "",
  });
  const [paymentForm, setPaymentForm] = useState({
    paymentAmount: "",
    paymentDate: "",
  });

  useEffect(() => {
    // Load debts and payments from localStorage
    const loadData = () => {
      try {
        const rawDebts = localStorage.getItem(DEBT_KEY);
        const rawPayments = localStorage.getItem(PAYMENT_KEY);
        setDebts(rawDebts ? JSON.parse(rawDebts) : []);
        setPayments(rawPayments ? JSON.parse(rawPayments) : []);
      } catch (e) {
        console.error("Failed to load data from localStorage", e);
      }
    };

    loadData();

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (event) => {
      if (event.key === DEBT_KEY || event.key === PAYMENT_KEY) {
        loadData(); // Reload data on changes
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // Save debts and payments to localStorage whenever data changes
    localStorage.setItem(DEBT_KEY, JSON.stringify(debts));
    localStorage.setItem(PAYMENT_KEY, JSON.stringify(payments));
  }, [debts, payments]);


  // Helper functions for add/remove
  const handleAddDebt = (e) => {
    e?.preventDefault(); // Prevent default
    if (!debtForm.name || !debtForm.lender || !debtForm.principal || !debtForm.dueDate) return;
    const newDebt = {
      id: Date.now().toString(),
      name: debtForm.name,
      lender: debtForm.lender,
      principal: parseFloat(debtForm.principal),
      interestRate: parseFloat(debtForm.interestRate) || 0,
      startDate: debtForm.startDate,
      dueDate: debtForm.dueDate,
    };
    setDebts([newDebt, ...debts]);
    setDebtForm({ name: "", lender: "", principal: "", interestRate: "", startDate: "", dueDate: "" });
    setAddDebtModalOpen(false);
  };

  const handleRemoveDebt = (idToRemove) => {
    if (!confirm("Are you sure you want to delete this debt? This will also remove all its payments.")) return;
    setDebts(debts.filter(debt => debt.id !== idToRemove));
    setPayments(payments.filter(payment => payment.debtId !== idToRemove));
  };

  const handleAddPayment = (e) => {
    e?.preventDefault();
    if (!paymentForm.paymentAmount || !paymentForm.paymentDate || !selectedDebtId) return;

    const newPayment = {
      id: Date.now().toString(),
      debtId: selectedDebtId,
      amount: parseFloat(paymentForm.paymentAmount),
      date: paymentForm.paymentDate,
    };
    setPayments([newPayment, ...payments]);
    setPaymentForm({ paymentAmount: "", paymentDate: "" });
    setAddPaymentModalOpen(false);
  };

  // -- HELPER - Calculate remaining balance --
  const calculateRemainingBalance = (debt) => {
    const totalPaid = payments
      .filter(payment => payment.debtId === debt.id)
      .reduce((sum, payment) => sum + payment.amount, 0);

    return debt.principal - totalPaid;
  };


  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Debts & Loans</h1>
        <p className="text-sm muted">Track and manage your debts and loan payments.</p>
      </header>

      <div className="flex justify-end mb-4">
        <button className="btn btn-primary" onClick={() => setAddDebtModalOpen(true)}>+ Add Debt/Loan</button>
      </div>

      <div className="space-y-4">
        {debts.length === 0 && <div className="text-sm muted">No debts or loans added yet.</div>}

        {debts.map(debt => (
          <div key={debt.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-lg">{debt.name}</div>
                <div className="text-sm muted">Lender: {debt.lender}</div>
                <div className="text-xs muted">Due Date: {debt.dueDate}</div>
              </div>

              <div className="text-right">
                <div className="text-sm muted">Remaining</div>
                <div className="font-semibold">{formatAmount(calculateRemainingBalance(debt))}</div>
                <div className="mt-2">
                  <button
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => handleRemoveDebt(debt.id)}
                  >
                    Remove
                  </button>
                  <button
                      className="btn-accent"
                      style={{ marginLeft: '10px' }}
                      onClick={() => {
                        setSelectedDebtId(debt.id);
                        setAddPaymentModalOpen(true);
                      }}
                  >
                    + Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Debt Modal */}
      <Modal open={addDebtModalOpen} title="Add Debt/Loan" onClose={() => setAddDebtModalOpen(false)}>
        <form onSubmit={handleAddDebt} className="space-y-3">
          <div>
            <label className="text-sm block mb-1">Name</label>
            <input className="form-input w-full" placeholder="Loan name" value={debtForm.name} onChange={e => setDebtForm({...debtForm, name: e.target.value})} />
          </div>

          <div>
            <label className="text-sm block mb-1">Lender</label>
            <input className="form-input w-full" placeholder="Who is the lender?" value={debtForm.lender} onChange={e => setDebtForm({...debtForm, lender: e.target.value})} />
          </div>

          <div className="grid md:grid-cols-2 gap-2">
            <div>
              <label className="text-sm block mb-1">Principal</label>
              <input className="form-input w-full" type="number" step="0.01" placeholder="Original amount" value={debtForm.principal} onChange={e => setDebtForm({...debtForm, principal: e.target.value})} />
            </div>

            <div>
              <label className="text-sm block mb-1">Interest Rate (%) (Optional)</label>
              <input className="form-input w-full" type="number" step="0.01" placeholder="e.g., 5.0" value={debtForm.interestRate} onChange={e => setDebtForm({...debtForm, interestRate: e.target.value})} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-2">
            <div>
              <label className="text-sm block mb-1">Start Date</label>
              <input className="form-input w-full" type="date" value={debtForm.startDate} onChange={e => setDebtForm({...debtForm, startDate: e.target.value})} />
            </div>

            <div>
              <label className="text-sm block mb-1">Due Date</label>
              <input className="form-input w-full" type="date" value={debtForm.dueDate} onChange={e => setDebtForm({...debtForm, dueDate: e.target.value})} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-neutral-outline" onClick={() => setAddDebtModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Debt</button>
          </div>
        </form>
      </Modal>

      {/* Add Payment Modal */}
      <Modal open={addPaymentModalOpen} title="Record Payment" onClose={() => setAddPaymentModalOpen(false)}>
        <form onSubmit={handleAddPayment} className="space-y-3">
          <div>
            <label className="text-sm block mb-1">Payment Amount</label>
            <input className="form-input w-full" type="number" step="0.01" placeholder="Payment amount" value={paymentForm.paymentAmount} onChange={e => setPaymentForm({...paymentForm, paymentAmount: e.target.value})} />
          </div>

          <div>
            <label className="text-sm block mb-1">Payment Date</label>
            <input className="form-input w-full" type="date" value={paymentForm.paymentDate} onChange={e => setPaymentForm({...paymentForm, paymentDate: e.target.value})} />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-neutral-outline" onClick={() => setAddPaymentModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Record Payment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}