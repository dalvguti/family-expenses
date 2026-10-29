/**
 * Category Model
 * Represents an expense category
 */
class Category {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.description = data.description || '';
    this.color = data.color || '#3498db';
    this.icon = data.icon || '';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  // Validation method
  isValid() {
    return this.name.trim() !== '';
  }

  // Convert to plain object for API
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      color: this.color,
      icon: this.icon,
      isActive: this.isActive,
    };
  }
}

export default Category;

