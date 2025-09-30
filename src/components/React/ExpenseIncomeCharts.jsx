import React, { useEffect, useMemo, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components. Ensure these are registered once.
ChartJS.register(ArcElement, Tooltip, Legend);

// TX_KEY no longer needed here, transactions come from props

// Helper to format currency
function formatAmount(n) {
  return `${n.toFixed(2)} ₡`;
}

// Function to get theme-dependent colors for charts
function getChartThemeColors(isDarkMode) {
  return {
    textColor: isDarkMode ? 'rgb(226, 232, 240)' : 'rgb(17, 24, 39)', // var(--text-color)
    mutedColor: isDarkMode ? 'rgb(148, 163, 184)' : 'rgb(100, 116, 139)', // var(--muted)
    defaultSegmentColors: [
      'rgb(75, 192, 192)', // Teal
      'rgb(255, 99, 132)',  // Red-pink
      'rgb(54, 162, 235)',  // Blue
      'rgb(255, 206, 86)',  // Yellow
      'rgb(153, 102, 255)', // Purple
      'rgb(255, 159, 64)',  // Orange
      'rgb(199, 199, 199)', // Gray (for 'No Tag' or 'Others')
      'rgb(100, 181, 246)', // Light Blue
      'rgb(255, 138, 101)', // Coral
    ],
  };
}

// Helper to filter transactions
const filterTransactionsByAccounts = (transactions, selectedAccountIds) => {
  if (!selectedAccountIds || selectedAccountIds.length === 0) {
    return []; // If no accounts are selected, return an empty array
  }
  return transactions.filter(t => selectedAccountIds.includes(t.accountId));
};


export default function ExpenseIncomeCharts({ allTransactions, selectedAccountIds }) { // Receive allTransactions prop
  // allTransactions state and useEffect for loading/saving removed, now handled by DashboardApp
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const htmlElement = document.documentElement;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(htmlElement.classList.contains('dark'));
        }
      });
    });
    observer.observe(htmlElement, { attributes: true, attributeFilter: ['class'] });
    setIsDarkMode(htmlElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  const transactions = useMemo(() => {
    return filterTransactionsByAccounts(allTransactions, selectedAccountIds); // Use allTransactions prop here
  }, [allTransactions, selectedAccountIds]); // Depend on allTransactions prop

  const { chartData, totalExpenses } = useMemo(() => {
    const expensesByTag = {};
    let total = 0;

    transactions.filter(t => t.amount < 0).forEach(t => {
      const expenseAmount = Math.abs(t.amount);
      total += expenseAmount;
      if (t.tags && t.tags.length > 0) {
        t.tags.forEach(tag => {
          expensesByTag[tag] = (expensesByTag[tag] || 0) + expenseAmount;
        });
      } else {
        expensesByTag['No Tag'] = (expensesByTag['No Tag'] || 0) + expenseAmount;
      }
    });

    const sortedTags = Object.entries(expensesByTag).sort(([, a], [, b]) => b - a);
    const labels = sortedTags.map(([tag]) => tag);
    const data = sortedTags.map(([, amount]) => amount);

    return {
      chartData: { labels, data },
      totalExpenses: total,
    };
  }, [transactions]); // Depend on filtered transactions

  const themeColors = getChartThemeColors(isDarkMode);

  const doughnutChartData = {
    labels: chartData.labels,
    datasets: [{
      data: chartData.data,
      backgroundColor: themeColors.defaultSegmentColors,
      hoverOffset: 8,
      borderColor: themeColors.textColor,
      borderWidth: 1,
    }],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: themeColors.textColor,
          font: {
            size: 13,
          },
          padding: 10,
          boxWidth: 12,
        },
      },
      title: {
        display: true,
        text: `Expenses by Tag (Total: ${formatAmount(totalExpenses)})`,
        color: themeColors.textColor,
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = (value / totalExpenses * 100).toFixed(1);
            return `${label}: ${formatAmount(value)} (${percentage}%)`;
          }
        },
        backgroundColor: isDarkMode ? 'rgba(30,41,59,0.9)' : 'rgba(255,255,255,0.9)',
        titleColor: themeColors.textColor,
        bodyColor: themeColors.textColor,
        borderColor: themeColors.mutedColor,
        borderWidth: 1,
      }
    },
    cutout: '70%',
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-3">Expenses Overview</h2>
      {chartData.data.length > 0 ? (
        <div style={{ maxWidth: '100%', height: '350px' }}>
          <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
        </div>
      ) : (
        <p className="muted text-center py-8">
          {selectedAccountIds.length === 0
            ? "Select one or more accounts to view expense charts."
            : "No expenses with tags for selected accounts yet."}
        </p>
      )}
    </div>
  );
}