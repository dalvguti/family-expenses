import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiService, { ensureCsrfCookie } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuth = useCallback(async () => {
        try {
            const userData = await apiService.getCurrentUser();
            setUser(userData.user);
            setIsAuthenticated(true);
        } catch {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (username, password) => {
        try {
            await ensureCsrfCookie();
            const data = await apiService.login(username, password);
            setUser(data.user);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Login failed',
            };
        }
    };

    const logout = async () => {
        try {
            await ensureCsrfCookie();
            await apiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const updatePassword = async (currentPassword, newPassword) => {
        try {
            await apiService.updatePassword(currentPassword, newPassword);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Password update failed',
            };
        }
    };

    const refreshUser = async () => {
        try {
            const userData = await apiService.getCurrentUser();
            setUser(userData.user);
        } catch (error) {
            console.error('Failed to refresh user data:', error);
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updatePassword,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
