import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/ExpenseList.css';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    paidBy: '',
    startDate: '',
    endDate: '',
    transactionType: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await apiService.getExpenses(filters);
      setExpenses(response.data || response);
      setError(null);
    } catch (err) {
      console.log('Failed to load expenses:', err);
      setError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories({ isActive: 'true' });
      setCategories(response.data || response);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiService.getUsers();
      setUsers(response.data || response);
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsers([]);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await apiService.deleteExpense(id);
        setExpenses(expenses.filter(expense => expense.id !== id));
      } catch (err) {
        alert('Failed to delete expense: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      paidBy: '',
      startDate: '',
      endDate: '',
      transactionType: '',
    });
  };

  if (loading) {
    return <div className="loading">Loading expenses...</div>;
  }

  return (
    <div className="expense-list-page">
      <div className="page-header">
        <h1>Transactions</h1>
        <Link to="/expenses/new" className="btn btn-primary">Add New Transaction</Link>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="transactionType">Type:</label>
          <select
            id="transactionType"
            name="transactionType"
            value={filters.transactionType}
            onChange={handleFilterChange}
          >
            <option value="">All</option>
            <option value="expense">Expenses</option>
            <option value="earning">Earnings</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id || cat} value={cat.name || cat}>
                {cat.icon ? `${cat.icon} ` : ''}{cat.name || cat}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="paidBy">Person:</label>
          <select
            id="paidBy"
            name="paidBy"
            value={filters.paidBy}
            onChange={handleFilterChange}
          >
            <option value="">All People</option>
            {users.map((user) => (
              <option key={user.id} value={user.name}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="startDate">From:</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="endDate">To:</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </div>
        
        <button onClick={clearFilters} className="btn btn-secondary">Clear Filters</button>
      </div>

      {error && <div className="error">Error: {error}</div>}

      {expenses.length > 0 ? (
        <table className="expense-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Person</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className={expense.transactionType === 'earning' ? 'earning-row' : 'expense-row'}>
                <td>
                  <span className={`transaction-badge ${expense.transactionType}`}>
                    {expense.transactionType === 'earning' ? '💰' : '💸'}
                  </span>
                </td>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>{expense.description}</td>
                <td><span className="category-badge">{expense.category}</span></td>
                <td className={`amount ${expense.transactionType}`}>
                  {expense.transactionType === 'earning' ? '+' : '-'}${Number(expense.amount).toFixed(2)}
                </td>
                <td>{expense.paidBy}</td>
                <td className="actions">
                  <Link to={`/expenses/${expense.id}/edit`} className="btn-edit">Edit</Link>
                  <button onClick={() => handleDelete(expense.id)} className="btn-delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-data">
          <p>No transactions found. {filters.category || filters.paidBy || filters.transactionType ? 'Try adjusting your filters.' : 'Start by adding a new transaction!'}</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;

