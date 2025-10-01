import React, { useEffect, useMemo, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components once
ChartJS.register(ArcElement, Tooltip, Legend);

const TX_KEY = "pf_transactions_v2"; // Key for transactions data in localStorage

// Helper to format currency
function formatAmount(n) {
  return `${n.toFixed(2)} ₡`;
}

// Helper to safely get computed CSS variable values (still needed for non-text colors)
const getSafeCssVar = (name, fallbackRgb) => {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const computed = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (computed) {
      if (computed.startsWith('rgb(') || computed.startsWith('rgba(')) return computed;
      if (computed.match(/^\d{1,3},\s*\d{1,3},\s*\d{1,3}$/)) return `rgb(${computed})`;
    }
  }
  return `rgb(${fallbackRgb})`;
};

// Function to get theme-dependent colors for charts
function getChartThemeColors(isDarkMode) {
  const segmentColorsLight = [
    'rgb(59, 130, 246)',  // QL Light Primary Blue
    'rgb(16, 185, 129)',  // QL Light Accent Green
    'rgb(251, 191, 36)',  // Yellow-400
    'rgb(239, 68, 68)',   // Red-500
    'rgb(147, 51, 234)',  // Purple-600
    'rgb(236, 72, 153)',  // Pink-500
    'rgb(107, 114, 128)', // Gray-500 (muted)
  ];
  const segmentColorsDark = [
    'rgb(52, 211, 153)',  // QL Dark Primary Green
    'rgb(251, 191, 36)',  // QL Dark Accent Yellow
    'rgb(96, 165, 250)',  // Blue-400
    'rgb(248, 113, 113)', // Red-400
    'rgb(192, 132, 252)', // Purple-400
    'rgb(244, 114, 182)', // Pink-400
    'rgb(148, 163, 184)', // Gray-400 (muted dark)
  ];

  // FIXED CHART TEXT COLOR: A visible gray for both light and dark backgrounds
  const fixedChartTextColor = 'rgb(100, 116, 139)'; // Tailwind Slate-500 / Gray-500 equivalent
  const fixedChartMutedColor = 'rgb(156, 163, 175)'; // Tailwind Gray-400 equivalent

  // Get current theme-dependent UI colors for background/borders (still dynamic)
  const surfaceColor = getSafeCssVar('--surface', isDarkMode ? '31, 41, 55' : '243, 244, 246');
  const cardBgColor = getSafeCssVar('--card-bg', isDarkMode ? '10, 15, 30' : '255, 255, 255');

  const chartBorderColor = fixedChartMutedColor.replace('rgb', 'rgba').replace(')', ', 0.5)');


  return {
    textColor: fixedChartTextColor, // Now fixed gray
    mutedColor: fixedChartMutedColor, // Now fixed gray
    defaultSegmentColors: isDarkMode ? segmentColorsDark : segmentColorsLight,
    tooltipBgColor: surfaceColor,
    chartBorderColor: chartBorderColor,
    chartBackgroundColor: cardBgColor // Still dynamic from theme
  };
}

const filterTransactionsByAccounts = (transactions, selectedAccountIds) => {
  if (!selectedAccountIds || selectedAccountIds.length === 0) {
    return [];
  }
  return transactions.filter(t => selectedAccountIds.includes(t.accountId));
};


export default function ExpenseIncomeCharts({ allTransactions, selectedAccountIds }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const bodyElement = document.body;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const newDarkModeState = bodyElement.classList.contains('dark-mode');
          setIsDarkMode(newDarkModeState);
          // Update Chart.js global defaults when theme changes
          const themeColors = getChartThemeColors(newDarkModeState);
          ChartJS.defaults.color = themeColors.textColor; // Global text color (fixed gray)
          ChartJS.defaults.borderColor = themeColors.chartBorderColor; // Global border color
          ChartJS.defaults.font.family = "'Inter', 'Montserrat', sans-serif"; // Explicitly set font
          ChartJS.defaults.backgroundColor = themeColors.chartBackgroundColor; // Global canvas background

          // Tooltip defaults (will also use fixed gray for text)
          ChartJS.defaults.plugins.tooltip.titleColor = themeColors.textColor;
          ChartJS.defaults.plugins.tooltip.bodyColor = themeColors.textColor;
          ChartJS.defaults.plugins.tooltip.backgroundColor = themeColors.tooltipBgColor;
        }
      });
    });
    observer.observe(bodyElement, { attributes: true, attributeFilter: ['class'] });

    // Set initial dark mode state and Chart.js defaults
    const initialDarkMode = bodyElement.classList.contains('dark-mode');
    setIsDarkMode(initialDarkMode);
    const initialThemeColors = getChartThemeColors(initialDarkMode);
    ChartJS.defaults.color = initialThemeColors.textColor;
    ChartJS.defaults.borderColor = initialThemeColors.chartBorderColor;
    ChartJS.defaults.font.family = "'Inter', 'Montserrat', sans-serif";
    ChartJS.defaults.backgroundColor = initialThemeColors.chartBackgroundColor;

    ChartJS.defaults.plugins.tooltip.titleColor = initialThemeColors.textColor;
    ChartJS.defaults.plugins.tooltip.bodyColor = initialThemeColors.textColor;
    ChartJS.defaults.plugins.tooltip.backgroundColor = initialThemeColors.tooltipBgColor;

    return () => observer.disconnect();
  }, []);

  const [localAllTransactions, setLocalAllTransactions] = useState([]);
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadTransactions = () => {
      try {
        const rawTransactions = localStorage.getItem(TX_KEY);
        setLocalAllTransactions(rawTransactions ? JSON.parse(rawTransactions) : []);
      } catch (e) {
        console.error("Failed to load transactions for charts", e);
        setLocalAllTransactions([]);
      }
    };
    loadTransactions();
    function handleStorageChange(event) {
      if (event.key === TX_KEY) {
        loadTransactions();
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);


  const transactionsToChart = useMemo(() => {
    const sourceTransactions = allTransactions && allTransactions.length > 0 ? allTransactions : localAllTransactions;
    return filterTransactionsByAccounts(sourceTransactions, selectedAccountIds);
  }, [allTransactions, localAllTransactions, selectedAccountIds]);


  const { chartData, totalExpenses } = useMemo(() => {
    const expensesByTag = {};
    let total = 0;

    transactionsToChart.filter(t => t.amount < 0).forEach(t => {
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
  }, [transactionsToChart]);


  const themeColors = useMemo(() => getChartThemeColors(isDarkMode), [isDarkMode]);

  const doughnutChartData = {
    labels: chartData.labels,
    datasets: [{
      data: chartData.data.length > 0 ? chartData.data : [1],
      backgroundColor: chartData.data.length > 0 ? themeColors.defaultSegmentColors : [`rgba(100, 116, 139, 0.2)`],
      hoverOffset: 8,
      borderColor: themeColors.chartBorderColor,
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
          color: themeColors.textColor, // Uses fixed gray
          font: {
            size: 13,
            family: "'Inter', 'Montserrat', sans-serif",
          },
          padding: 10,
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      title: {
        display: true,
        text: `Expenses by Tag (Total: ${formatAmount(totalExpenses)})`,
        color: themeColors.textColor, // Uses fixed gray
        font: {
          size: 16,
          weight: 'bold',
          family: "'Inter', 'Montserrat', sans-serif",
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (chartData.data.length === 0) return 'No data';
            const label = context.label || '';
            const value = context.parsed;
            const percentage = (value / totalExpenses * 100).toFixed(1);
            return `${label}: ${formatAmount(value)} (${percentage}%)`;
          }
        },
        backgroundColor: themeColors.tooltipBgColor, // Still dynamic
        titleColor: themeColors.textColor, // Uses fixed gray
        bodyColor: themeColors.textColor, // Uses fixed gray
        borderColor: themeColors.mutedColor, // Uses fixed gray
        borderWidth: 1,
        bodyFont: {
          family: "'Inter', sans-serif",
        },
        titleFont: {
          family: "'Montserrat', sans-serif",
          weight: 'bold',
        }
      }
    },
    cutout: '70%',
    backgroundColor: themeColors.chartBackgroundColor, // Still dynamic
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-3">Expenses Overview</h2>
      {totalExpenses > 0 ? (
        <div style={{ maxWidth: '100%', height: '350px' }}>
          <Doughnut key={isDarkMode ? 'dark-chart' : 'light-chart'} data={doughnutChartData} options={doughnutChartOptions} />
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