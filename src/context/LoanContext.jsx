import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api/client';

const LoanContext = createContext(null);

export function LoanProvider({ children }) {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchLoans = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await api.loans.getAll();
            setApplications(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchLoans();
    }, [fetchLoans]);

    const submitApplication = async (formData) => {
        const newApp = await api.loans.submit(formData);
        setApplications(prev => [newApp, ...prev]);
        return newApp;
    };

    const updateStatus = async (id, status, adminNotes = '') => {
        const updated = await api.loans.updateStatus(id, { status, adminNotes });
        setApplications(prev => prev.map(a => a.id === id ? updated : a));
        return updated;
    };

    // Helper: get loans for current customer
    const myApplications = user?.role === 'customer'
        ? applications.filter(a => a.customerId === user.id)
        : applications;

    const latestApplication = myApplications[0] || null;

    return (
        <LoanContext.Provider value={{
            applications, myApplications, latestApplication,
            loading, error, fetchLoans, submitApplication, updateStatus,
        }}>
            {children}
        </LoanContext.Provider>
    );
}

export const useLoan = () => useContext(LoanContext);
