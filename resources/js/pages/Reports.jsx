import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import '../styles/Reports.css';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  useEffect(() => {
    fetchReport();
  }, [selectedYear, selectedMonth]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMonthlyReport(selectedYear, selectedMonth);
      setReportData(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!reportData) return;
    
    // Simple CSV export
    const csvContent = [
      ['Type', 'Description', 'Category', 'Amount', 'Person', 'Date'],
      ...(reportData.transactions || []).map(trans => [
        trans.transactionType === 'earning' ? 'Earning' : 'Expense',
        trans.description,
        trans.category,
        trans.amount,
        trans.paidBy,
        trans.date
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${selectedYear}-${selectedMonth}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="loading">Loading report...</div>;
  }

  return (
    <div className="reports-page">
      <h1>Monthly Reports</h1>

      <div className="report-controls">
        <div className="control-group">
          <label htmlFor="year">Year:</label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="month">Month:</label>
          <select
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
        </div>

        <button onClick={handleExport} className="btn btn-primary" disabled={!reportData}>
          Export CSV
        </button>
      </div>

      {error && <div className="error">Error: {error}</div>}

      {reportData && (
        <div className="report-content">
          <div className="report-summary">
            <h2>Summary for {months[selectedMonth - 1]} {selectedYear}</h2>
            <div className="summary-cards">
              <div className="summary-card net-balance">
                <h3>💼 Net Balance</h3>
                <p className={`summary-value ${reportData.netBalance >= 0 ? 'positive' : 'negative'}`}>
                  ${Math.abs(reportData.netBalance || 0).toFixed(2)}
                </p>
                <span className="summary-label">{reportData.netBalance >= 0 ? 'Surplus' : 'Deficit'}</span>
              </div>
              <div className="summary-card earnings">
                <h3>💰 Total Earnings</h3>
                <p className="summary-value positive">${(reportData.totalEarnings || 0).toFixed(2)}</p>
                <span className="summary-label">{reportData.earningCount || 0} transactions</span>
              </div>
              <div className="summary-card expenses">
                <h3>💸 Total Expenses</h3>
                <p className="summary-value negative">${(reportData.totalExpenses || 0).toFixed(2)}</p>
                <span className="summary-label">{reportData.expenseCount || 0} transactions</span>
              </div>
            </div>
          </div>

          <div className="breakdown-grid">
            <div className="report-breakdown">
              <h3>Expenses by Category</h3>
              {reportData.expensesByCategory && reportData.expensesByCategory.length > 0 ? (
                <table className="breakdown-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.expensesByCategory.map((item, index) => (
                      <tr key={index}>
                        <td>{item.category}</td>
                        <td className="negative">${Number(item.total).toFixed(2)}</td>
                        <td>{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No expense data available</p>
              )}
            </div>

            <div className="report-breakdown">
              <h3>Earnings by Category</h3>
              {reportData.earningsByCategory && reportData.earningsByCategory.length > 0 ? (
                <table className="breakdown-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.earningsByCategory.map((item, index) => (
                      <tr key={index}>
                        <td>{item.category}</td>
                        <td className="positive">${Number(item.total).toFixed(2)}</td>
                        <td>{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No earning data available</p>
              )}
            </div>

            <div className="report-breakdown">
              <h3>Expenses by Person</h3>
              {reportData.expensesByPerson && reportData.expensesByPerson.length > 0 ? (
                <table className="breakdown-table">
                  <thead>
                    <tr>
                      <th>Person</th>
                      <th>Amount</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.expensesByPerson.map((item, index) => (
                      <tr key={index}>
                        <td>{item.paidBy}</td>
                        <td className="negative">${Number(item.total).toFixed(2)}</td>
                        <td>{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No person data available</p>
              )}
            </div>

            <div className="report-breakdown">
              <h3>Earnings by Person</h3>
              {reportData.earningsByPerson && reportData.earningsByPerson.length > 0 ? (
                <table className="breakdown-table">
                  <thead>
                    <tr>
                      <th>Person</th>
                      <th>Amount</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.earningsByPerson.map((item, index) => (
                      <tr key={index}>
                        <td>{item.paidBy}</td>
                        <td className="positive">${Number(item.total).toFixed(2)}</td>
                        <td>{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No person data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

