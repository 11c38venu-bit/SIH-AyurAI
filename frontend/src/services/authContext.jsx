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
    id: 'pat-101',
    name: 'Ananya S. Rao',
    role: 'patient',
    uhid: 'AYUR-2026-0891',
    tokenNumber: 'A-024',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'ananya.rao@example.com',
  },
  doctor: {
    id: 'doc-1',
    name: 'Vaidya Dr. K. Rajesh Sharma',
    qualification: 'BAMS, MD (Kayachikitsa - BHU)',
    role: 'doctor',
    roomNo: 'OPD-102',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    email: 'doctor@demo.ayurai',
  },
  staff: {
    id: 'st-1',
    name: 'Nurse S. Meenakshi',
    role: 'staff',
    desk: 'Main OPD Registration Counter 1',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    email: 'staff@demo.ayurai',
  },
  admin: {
    id: 'adm-1',
    name: 'Medical Superintendent (Admin)',
    role: 'admin',
    title: 'Medical Superintendent & AYUSH Director',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'admin@demo.ayurai',
  },
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('ayurai_access_token') || 'demo-auth-token';
    } catch {
      return 'demo-auth-token';
    }
  });

  const [role, setRoleState] = useState(() => {
    try {
      const savedRole = localStorage.getItem('ayurai_active_role');
      return savedRole && DEFAULT_USERS[savedRole] ? savedRole : 'doctor';
    } catch {
      return 'doctor';
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ayurai_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      const savedRole = localStorage.getItem('ayurai_active_role') || 'doctor';
      return DEFAULT_USERS[savedRole] || DEFAULT_USERS.doctor;
    } catch (e) {
      console.warn('Failed to parse saved user', e);
    }
    return DEFAULT_USERS.doctor;
  });

  const [loading, setLoading] = useState(false);

  // Auto-clear on explicit logout
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

  // Initial validation & hydration: in Demo Mode keep local state safely
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('ayurai_access_token');
      const isRealBackendActive = import.meta.env.VITE_DEMO_MODE === 'false';

      if (storedToken && isRealBackendActive && !storedToken.startsWith('demo-')) {
        try {
          const meData = await authApi.getMe();
          if (isMounted && meData) {
            const backendRole = (meData.role || 'staff').toLowerCase();
            const hydratedUser = {
              id: meData.id,
              name: meData.full_name || meData.username || DEFAULT_USERS[backendRole]?.name,
              email: meData.email,
              role: backendRole,
              avatar: DEFAULT_USERS[backendRole]?.avatar || DEFAULT_USERS.doctor.avatar,
            };
            setToken(storedToken);
            setRoleState(backendRole);
            setCurrentUser(hydratedUser);
            localStorage.setItem('ayurai_active_role', backendRole);
            localStorage.setItem('ayurai_user', JSON.stringify(hydratedUser));
          }
        } catch (error) {
          console.warn('Stored JWT session validation failed, using demo fallback', error);
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [handleAuthExpired]);

  // Switch active role with instant demo authentication
  const switchRole = (newRole) => {
    const roleKey = (newRole || 'patient').toLowerCase();
    setRoleState(roleKey);
    localStorage.setItem('ayurai_active_role', roleKey);

    const targetUser = DEFAULT_USERS[roleKey] || DEFAULT_USERS.patient;
    const demoToken = `demo-${roleKey}-token`;

    setToken(demoToken);
    setCurrentUser(targetUser);

    localStorage.setItem('ayurai_access_token', demoToken);
    localStorage.setItem('ayurai_user', JSON.stringify(targetUser));

    return targetUser;
  };

  const loginWithCredentials = async (username, password) => {
    setLoading(true);
    const uname = (username || '').toLowerCase().trim();

    // Determine target demo role from username
    let targetRole = 'patient';
    if (uname.includes('doc') || uname.includes('rajesh') || uname.includes('sharma')) {
      targetRole = 'doctor';
    } else if (uname.includes('staff') || uname.includes('nurse') || uname.includes('meenakshi')) {
      targetRole = 'staff';
    } else if (uname.includes('admin') || uname.includes('super')) {
      targetRole = 'admin';
    } else if (uname.includes('pat') || uname.includes('ananya')) {
      targetRole = 'patient';
    }

    // Try real backend if explicitly configured
    if (import.meta.env.VITE_DEMO_MODE === 'false') {
      try {
        const authData = await authApi.login(username, password);
        if (authData?.access_token) {
          const accessToken = authData.access_token;
          localStorage.setItem('ayurai_access_token', accessToken);
          setToken(accessToken);

          let userProfile = authData.user;
          try {
            const me = await authApi.getMe();
            if (me) userProfile = me;
          } catch (e) {
            console.warn('Post-login /auth/me fallback', e);
          }

          const backendRole = (userProfile?.role || authData.role || targetRole).toLowerCase();
          setRoleState(backendRole);
          localStorage.setItem('ayurai_active_role', backendRole);

          const userObj = {
            id: userProfile?.id,
            name: userProfile?.full_name || userProfile?.username || DEFAULT_USERS[backendRole]?.name,
            email: userProfile?.email || username,
            role: backendRole,
            avatar: DEFAULT_USERS[backendRole]?.avatar || DEFAULT_USERS.doctor.avatar,
          };
          localStorage.setItem('ayurai_user', JSON.stringify(userObj));
          setCurrentUser(userObj);
          setLoading(false);
          return { success: true, role: backendRole, user: userObj };
        }
      } catch (error) {
        console.warn('Backend login attempt failed, falling back to instant demo login', error);
      }
    }

    // Instant Offline Demo Authentication
    const demoToken = `demo-${targetRole}-token`;
    const userObj = {
      ...DEFAULT_USERS[targetRole],
      email: username || DEFAULT_USERS[targetRole].email,
    };

    localStorage.setItem('ayurai_access_token', demoToken);
    localStorage.setItem('ayurai_active_role', targetRole);
    localStorage.setItem('ayurai_user', JSON.stringify(userObj));

    setToken(demoToken);
    setRoleState(targetRole);
    setCurrentUser(userObj);
    setLoading(false);

    return { success: true, role: targetRole, user: userObj };
  };

  const login = (chosenRole, customData = null) => {
    const roleKey = (chosenRole || 'patient').toLowerCase();
    switchRole(roleKey);
    if (customData) {
      setCurrentUser((prev) => {
        const updated = prev ? { ...prev, ...customData } : customData;
        localStorage.setItem('ayurai_user', JSON.stringify(updated));
        return updated;
      });
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
        isAuthenticated: Boolean(token && currentUser),
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
