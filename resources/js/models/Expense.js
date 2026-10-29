/**
 * Expense Model
 * Represents an expense entry in the family billing system
 */
class Expense {
  constructor(data = {}) {
    this.id = data.id || null;
    this.description = data.description || '';
    this.amount = data.amount || 0;
    this.category = data.category || '';
    this.date = data.date || new Date().toISOString().split('T')[0];
    this.paidBy = data.paidBy || '';
    this.transactionType = data.transactionType || 'expense';
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  // Validation method
  isValid() {
    return (
      this.description.trim() !== '' &&
      this.amount > 0 &&
      this.category.trim() !== '' &&
      this.paidBy.trim() !== '' &&
      ['expense', 'earning'].includes(this.transactionType)
    );
  }

  // Convert to plain object for API
  toJSON() {
    return {
      id: this.id,
      description: this.description,
      amount: this.amount,
      category: this.category,
      date: this.date,
      paidBy: this.paidBy,
      transactionType: this.transactionType,
    };
  }
}

export default Expense;

