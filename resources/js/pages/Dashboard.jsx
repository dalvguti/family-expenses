import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalEarnings: 0,
    netBalance: 0,
    currentMonthExpenses: 0,
    currentMonthEarnings: 0,
    currentMonthNet: 0,
    expensesByCategory: [],
    earningsByCategory: [],
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const [statsData, transactions] = await Promise.all([
        apiService.getExpenseStats(),
        apiService.getExpenses({ limit: 5, sort: '-created_at' }),
      ]);

      setStats({
        totalExpenses: statsData.totalExpenses || 0,
        totalEarnings: statsData.totalEarnings || 0,
        netBalance: statsData.netBalance || 0,
        currentMonthExpenses: statsData.currentMonthExpenses || 0,
        currentMonthEarnings: statsData.currentMonthEarnings || 0,
        currentMonthNet: statsData.currentMonthNet || 0,
        expensesByCategory: statsData.expensesByCategory || [],
        earningsByCategory: statsData.earningsByCategory || [],
        recentTransactions: transactions.data || [],
      });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="dashboard">
      <h1>Family Finance Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card net-balance">
          <h3>💼 Net Balance</h3>
          <p className={`stat-value ${stats.netBalance >= 0 ? 'positive' : 'negative'}`}>
            ${Math.abs(stats.netBalance).toFixed(2)}
          </p>
          <span className="stat-label">{stats.netBalance >= 0 ? 'Surplus' : 'Deficit'}</span>
        </div>

        <div className="stat-card earnings">
          <h3>💰 Total Earnings</h3>
          <p className="stat-value positive">${stats.totalEarnings.toFixed(2)}</p>
        </div>
        
        <div className="stat-card expenses">
          <h3>💸 Total Expenses</h3>
          <p className="stat-value negative">${stats.totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      <div className="stats-grid secondary">
        <div className="stat-card">
          <h3>This Month - Earnings</h3>
          <p className="stat-value positive">${stats.currentMonthEarnings.toFixed(2)}</p>
        </div>
        
        <div className="stat-card">
          <h3>This Month - Expenses</h3>
          <p className="stat-value negative">${stats.currentMonthExpenses.toFixed(2)}</p>
        </div>
        
        <div className="stat-card">
          <h3>This Month - Net</h3>
          <p className={`stat-value ${stats.currentMonthNet >= 0 ? 'positive' : 'negative'}`}>
            ${Math.abs(stats.currentMonthNet).toFixed(2)}
          </p>
          <span className="stat-label">{stats.currentMonthNet >= 0 ? 'Surplus' : 'Deficit'}</span>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <h2>Recent Transactions</h2>
          {stats.recentTransactions.length > 0 ? (
            <ul className="expense-list">
              {stats.recentTransactions.map((transaction) => (
                <li key={transaction.id} className={`expense-item ${transaction.transactionType}`}>
                  <div className="expense-info">
                    <span className="transaction-icon">
                      {transaction.transactionType === 'earning' ? '💰' : '💸'}
                    </span>
                    <div>
                      <span className="expense-desc">{transaction.description}</span>
                      <span className="expense-category">{transaction.category}</span>
                    </div>
                  </div>
                  <div className="expense-meta">
                    <span className={`expense-amount ${transaction.transactionType}`}>
                      {transaction.transactionType === 'earning' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                    </span>
                    <span className="expense-date">{new Date(transaction.date).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No transactions recorded yet.</p>
          )}
          <Link to="/expenses" className="view-all-link">View All Transactions →</Link>
        </div>

        <div className="section">
          <h2>Expenses by Category</h2>
          {stats.expensesByCategory.length > 0 ? (
            <ul className="category-list">
              {stats.expensesByCategory.map((cat, index) => (
                <li key={index} className="category-item expense">
                  <span className="category-name">{cat.category}</span>
                  <span className="category-amount negative">${Number(cat.total).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No expense data available.</p>
          )}
        </div>

        <div className="section">
          <h2>Earnings by Category</h2>
          {stats.earningsByCategory.length > 0 ? (
            <ul className="category-list">
              {stats.earningsByCategory.map((cat, index) => (
                <li key={index} className="category-item earning">
                  <span className="category-name">{cat.category}</span>
                  <span className="category-amount positive">${Number(cat.total).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No earning data available.</p>
          )}
        </div>
      </div>

      <div className="quick-actions">
        <Link to="/expenses/new" className="btn btn-primary">Add New Transaction</Link>
        <Link to="/reports" className="btn btn-secondary">View Reports</Link>
      </div>
    </div>
  );
};

export default Dashboard;

