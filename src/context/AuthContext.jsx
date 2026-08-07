import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('lendai_user');
        const token = localStorage.getItem('lendai_token');
        if (stored && token) {
            setUser(JSON.parse(stored));
        }
        setLoading(false);
    }, []);

    const login = async (email, password, adminCode = '') => {
        const data = await api.auth.login({ email, password, adminCode });
        localStorage.setItem('lendai_token', data.token);
        localStorage.setItem('lendai_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    };

    const register = async (name, email, password, role = 'customer', adminCode = '') => {
        const data = await api.auth.register({ name, email, password, role, adminCode });
        localStorage.setItem('lendai_token', data.token);
        localStorage.setItem('lendai_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('lendai_token');
        localStorage.removeItem('lendai_user');
        setUser(null);
    };

    if (loading) return null;

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
