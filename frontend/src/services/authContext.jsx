import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from './authApi';

const AuthContext = createContext(null);

export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  STAFF: 'staff',
  ADMIN: 'admin',
};

const DEFAULT_USERS = {
  patient: {
    id: 1,
    name: 'Ananya S. Rao',
    role: 'patient',
    uhid: 'AYUR-2026-0891',
    tokenNumber: 'A-024',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'ananya.rao@example.com',
  },
  doctor: {
    id: 2,
    name: 'Vaidya Dr. K. Rajesh Sharma',
    qualification: 'BAMS, MD (Kayachikitsa)',
    role: 'doctor',
    roomNo: 'OPD-102',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    email: 'doctor@ayurai.com',
  },
  staff: {
    id: 3,
    name: 'Meenakshi Sundaram',
    role: 'staff',
    desk: 'Main OPD Registration Counter 1',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    email: 'staff@ayurai.com',
  },
  admin: {
    id: 4,
    name: 'System Administrator',
    role: 'admin',
    title: 'Medical Superintendent & AYUSH Director',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'admin@ayurai.com',
  },
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('ayurai_access_token') || null;
    } catch {
      return null;
    }
  });

  const [role, setRoleState] = useState(() => {
    try {
      const savedRole = localStorage.getItem('ayurai_active_role');
      return savedRole && DEFAULT_USERS[savedRole] ? savedRole : 'patient';
    } catch {
      return 'patient';
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ayurai_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.warn('Failed to parse saved user', e);
    }
    return DEFAULT_USERS[role] || DEFAULT_USERS.patient;
  });

  const [loading, setLoading] = useState(false);

  // Auto-clear on 401 unauthorized events from API client
  const handleAuthExpired = useCallback(() => {
    setToken(null);
    setRoleState('patient');
    setCurrentUser(DEFAULT_USERS.patient);
    try {
      localStorage.removeItem('ayurai_access_token');
      localStorage.removeItem('ayurai_user');
      localStorage.setItem('ayurai_active_role', 'patient');
    } catch (e) {
      console.warn('Storage cleanup warning', e);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('ayurai:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('ayurai:auth-expired', handleAuthExpired);
  }, [handleAuthExpired]);

  // Synchronize role switch with real JWT tokens or default profiles
  const switchRole = async (newRole) => {
    const roleKey = (newRole || 'patient').toLowerCase();
    setRoleState(roleKey);
    localStorage.setItem('ayurai_active_role', roleKey);

    const defaultCredentials = {
      doctor: { username: 'doctor@ayurai.com', password: 'doctor123' },
      staff: { username: 'staff@ayurai.com', password: 'staff123' },
      admin: { username: 'admin@ayurai.com', password: 'admin123' },
    };

    if (defaultCredentials[roleKey]) {
      try {
        const { username, password } = defaultCredentials[roleKey];
        const authData = await authApi.login(username, password);
        if (authData?.access_token) {
          localStorage.setItem('ayurai_access_token', authData.access_token);
          setToken(authData.access_token);
          const userData = {
            id: authData.user?.id || DEFAULT_USERS[roleKey].id,
            name: authData.user?.full_name || DEFAULT_USERS[roleKey].name,
            email: authData.user?.email || DEFAULT_USERS[roleKey].email,
            role: roleKey,
            avatar: DEFAULT_USERS[roleKey].avatar,
          };
          localStorage.setItem('ayurai_user', JSON.stringify(userData));
          setCurrentUser(userData);
          return userData;
        }
      } catch (e) {
        console.warn('Backend login for role switch fallback to mock profile', e);
      }
    }

    const fallbackUser = DEFAULT_USERS[roleKey] || DEFAULT_USERS.patient;
    setCurrentUser(fallbackUser);
    localStorage.setItem('ayurai_user', JSON.stringify(fallbackUser));
    return fallbackUser;
  };

  const loginWithCredentials = async (username, password) => {
    setLoading(true);
    try {
      const authData = await authApi.login(username, password);
      if (authData?.access_token) {
        localStorage.setItem('ayurai_access_token', authData.access_token);
        setToken(authData.access_token);

        const backendRole = (authData.role || authData.user?.role || 'staff').toLowerCase();
        setRoleState(backendRole);
        localStorage.setItem('ayurai_active_role', backendRole);

        const userObj = {
          id: authData.user?.id,
          name: authData.user?.full_name,
          email: authData.user?.email,
          role: backendRole,
          avatar: DEFAULT_USERS[backendRole]?.avatar || DEFAULT_USERS.doctor.avatar,
        };
        localStorage.setItem('ayurai_user', JSON.stringify(userObj));
        setCurrentUser(userObj);
        return { success: true, role: backendRole, user: userObj };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      return { success: false, message: error.userMessage || error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const login = (chosenRole, customData = null) => {
    const roleKey = (chosenRole || 'patient').toLowerCase();
    switchRole(roleKey);
    if (customData) {
      setCurrentUser((prev) => ({ ...prev, ...customData }));
    }
  };

  const logout = () => {
    handleAuthExpired();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user: currentUser,
        isAuthenticated: Boolean(token || role === 'patient'),
        loading,
        switchRole,
        login,
        loginWithCredentials,
        logout,
        availableRoles: ROLES,
        defaultUsers: DEFAULT_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
