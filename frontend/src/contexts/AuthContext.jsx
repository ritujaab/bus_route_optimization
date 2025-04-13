// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import {
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  signInWithGoogle,
  logout as firebaseLogout
} from '../services/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = async ({ email, password }) => {
    const res = await loginWithEmailAndPassword(email, password);
    if (res.success) {
      setCurrentUser(res.user);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res.success;
  };

  const register = async ({ name, email, password }) => {
    const res = await registerWithEmailAndPassword(name, email, password);
    if (res.success) {
      setCurrentUser(res.user);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res.success;
  };

  const googleSignIn = async () => {
    const res = await signInWithGoogle();
    if (res.success) {
      setCurrentUser(res.user);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res.success;
  };

  const logout = async () => {
    await firebaseLogout();
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    googleSignIn,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
