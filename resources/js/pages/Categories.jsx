import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import Category from '../models/Category';
import '../styles/Common.css';
import '../styles/Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3498db',
    icon: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCategories();
      setCategories(response.data || response);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const category = new Category(formData);
    
    if (!category.isValid()) {
      setError('Please provide a category name');
      return;
    }

    try {
      setLoading(true);
      
      if (editingCategory) {
        await apiService.updateCategory(editingCategory.id, category.toJSON());
      } else {
        await apiService.createCategory(category.toJSON());
      }
      
      await fetchCategories();
      resetForm();
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3498db',
      icon: category.icon || '',
      isActive: category.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await apiService.deleteCategory(id);
        setCategories(categories.filter(cat => cat.id !== id));
      } catch (err) {
        setError(err.message || 'Failed to delete category');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await apiService.toggleCategoryStatus(id);
      await fetchCategories();
    } catch (err) {
      setError(err.message || 'Failed to toggle category status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3498db',
      icon: '',
      isActive: true,
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  if (loading && categories.length === 0) {
    return <div className="loading">Loading categories...</div>;
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1>Expense Categories</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="category-form-container">
          <h2>{editingCategory ? 'Edit Category' : 'New Category'}</h2>
          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Category Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Groceries, Utilities"
                />
              </div>

              <div className="form-group">
                <label htmlFor="color">Color</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#3498db"
                    className="color-text"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Optional description"
              />
            </div>

            <div className="form-group">
              <label htmlFor="icon">Icon (emoji or text)</label>
              <input
                type="text"
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                placeholder="🛒"
                maxLength="10"
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                Active (available for use)
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="categories-grid">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category.id} className={`category-card ${!category.isActive ? 'inactive' : ''}`}>
              <div className="category-header">
                <div className="category-info">
                  <div 
                    className="category-color" 
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon && <span className="category-icon">{category.icon}</span>}
                  </div>
                  <div>
                    <h3>{category.name}</h3>
                    {category.description && <p className="category-desc">{category.description}</p>}
                  </div>
                </div>
                <div className="category-status">
                  <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="action-buttons">
                <button 
                  onClick={() => handleEdit(category)} 
                  className="icon-btn btn-edit"
                  data-tooltip="Edit"
                  aria-label="Edit category"
                >
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </button>
                <button 
                  onClick={() => handleToggleStatus(category.id)} 
                  className={`icon-btn btn-toggle ${!category.isActive ? 'activate' : ''}`}
                  data-tooltip={category.isActive ? 'Deactivate' : 'Activate'}
                  aria-label={category.isActive ? 'Deactivate category' : 'Activate category'}
                >
                  {category.isActive ? (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                  )}
                </button>
                <button 
                  onClick={() => handleDelete(category.id)} 
                  className="icon-btn btn-delete"
                  data-tooltip="Delete"
                  aria-label="Delete category"
                >
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-categories">
            <p>No categories yet. Click "Add Category" to create your first category!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;

