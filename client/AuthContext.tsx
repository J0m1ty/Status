import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext({ auth: false, setAuth: (auth: boolean) => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [auth, setAuth] = useState(false);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);