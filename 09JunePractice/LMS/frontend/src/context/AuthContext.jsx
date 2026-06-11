import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile on mount if token exists
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch('/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setUser(result.data);
          } else {
            // Token is invalid/expired
            handleLogout();
          }
        } else {
          handleLogout();
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        // Do not log out on pure network issues, just stop loading
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const handleLogin = async (email, password) => {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Login failed');
    }

    const { token: userToken, user: userData } = result.data;
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);
    return userData;
  };

  const handleRegister = async (name, email, password, role) => {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, role })
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Registration failed');
    }

    const { token: userToken, user: userData } = result.data;
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);
    return userData;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
