import React, { createContext, useContext, useMemo, useState } from 'react';

const AppContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const name = sessionStorage.getItem('name');
    const email = sessionStorage.getItem('email');
    return sessionStorage.getItem('auth-token') && name && email ? { name, email } : null;
  });

  const value = useMemo(() => ({
    isLoggedIn: Boolean(sessionStorage.getItem('auth-token') && user),
    userName: user?.name || '',
    user,
    login(nextUser, token) {
      sessionStorage.setItem('auth-token', token);
      sessionStorage.setItem('name', nextUser.name);
      sessionStorage.setItem('email', nextUser.email);
      setUser(nextUser);
    },
    updateUser(nextUser) {
      sessionStorage.setItem('name', nextUser.name);
      sessionStorage.setItem('email', nextUser.email);
      setUser(nextUser);
    },
    logout() {
      sessionStorage.removeItem('auth-token');
      sessionStorage.removeItem('name');
      sessionStorage.removeItem('email');
      setUser(null);
    },
  }), [user]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used inside AuthProvider');
  }
  return context;
};
