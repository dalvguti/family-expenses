import axios from 'axios';

export function appBase() {
    const value = document.querySelector('meta[name="app-base"]')?.getAttribute('content') || '';
    return value.replace(/\/$/, '');
}

const api = axios.create({
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
});

api.interceptors.request.use((config) => {
    config.baseURL = `${appBase()}/api`;
    return config;
});

export async function ensureCsrfCookie() {
    await axios.get(`${appBase()}/sanctum/csrf-cookie`, { withCredentials: true });
}

function errorPayload(error) {
    if (error.response) {
        const errors = error.response.data?.errors;
        const firstError = errors ? Object.values(errors).flat()[0] : null;

        return {
            message: firstError
                || error.response.data?.message
                || 'An error occurred',
            status: error.response.status,
            data: error.response.data,
        };
    }

    if (error.request) {
        return {
            message: 'No response from server. Please check your connection.',
            status: 0,
        };
    }

    return {
        message: error.message || 'An unexpected error occurred',
        status: -1,
    };
}

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url || '';
        const onLogin = window.location.pathname.endsWith('/login');

        if (status === 401 && !url.includes('/user') && !url.includes('/login') && !onLogin) {
            window.location.href = `${appBase()}/login`;
        }

        return Promise.reject(errorPayload(error));
    }
);

class ApiService {
    async get(endpoint, params = {}) {
        const response = await api.get(endpoint, { params });
        return response.data;
    }

    async post(endpoint, data) {
        const response = await api.post(endpoint, data);
        return response.data;
    }

    async put(endpoint, data) {
        const response = await api.put(endpoint, data);
        return response.data;
    }

    async patch(endpoint, data) {
        const response = await api.patch(endpoint, data);
        return response.data;
    }

    async delete(endpoint) {
        const response = await api.delete(endpoint);
        return response.data;
    }

    getExpenses(filters = {}) {
        return this.get('/expenses', filters);
    }

    getExpenseById(id) {
        return this.get(`/expenses/${id}`);
    }

    createExpense(expenseData) {
        return this.post('/expenses', expenseData);
    }

    updateExpense(id, expenseData) {
        return this.put(`/expenses/${id}`, expenseData);
    }

    deleteExpense(id) {
        return this.delete(`/expenses/${id}`);
    }

    getUsers() {
        return this.get('/users');
    }

    getUserById(id) {
        return this.get(`/users/${id}`);
    }

    createUser(userData) {
        return this.post('/users', userData);
    }

    updateUser(id, userData) {
        return this.put(`/users/${id}`, userData);
    }

    deleteUser(id) {
        return this.delete(`/users/${id}`);
    }

    getCategories(filters = {}) {
        return this.get('/categories', filters);
    }

    getCategoryById(id) {
        return this.get(`/categories/${id}`);
    }

    createCategory(categoryData) {
        return this.post('/categories', categoryData);
    }

    updateCategory(id, categoryData) {
        return this.put(`/categories/${id}`, categoryData);
    }

    deleteCategory(id) {
        return this.delete(`/categories/${id}`);
    }

    toggleCategoryStatus(id) {
        return this.patch(`/categories/${id}/toggle`);
    }

    getExpenseStats(filters = {}) {
        return this.get('/expenses/stats', filters);
    }

    getMonthlyReport(year, month) {
        return this.get('/reports/monthly', { year, month });
    }

    login(username, password) {
        return this.post('/login', { username, password });
    }

    logout() {
        return this.post('/logout');
    }

    getCurrentUser() {
        return this.get('/user');
    }

    updatePassword(currentPassword, newPassword) {
        return this.put('/auth/password', { currentPassword, newPassword });
    }
}

const apiService = new ApiService();

export default apiService;
