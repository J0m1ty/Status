import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../store/useAuth';

export const Logout = () => {
    const navigate = useNavigate();
    const logout = useAuth(s => s.logout);

    useEffect(() => {
        logout();
        navigate('/', { replace: true });
    }, [logout, navigate]);

    return null;
}
