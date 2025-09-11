import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check for existing user on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('authUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // First, login to get the cookie set
      const loginResponse = await fetch('https://localhost:7242/api/Auth/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Important: include cookies in requests
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        throw new Error(errorText);
      }

      // After successful login, get user info
      const userInfoResponse = await fetch('https://localhost:7242/api/Auth/GetUserInfo', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include the cookie that was just set
      });

      if (!userInfoResponse.ok) {
        const errorText = await userInfoResponse.text();
        throw new Error('Failed to get user info: ' + errorText);
      }

      const userData = await userInfoResponse.json();
      
      // Store user info in localStorage
      localStorage.setItem('authUser', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await fetch('https://localhost:7242/api/Auth/Register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          username: username,
          email: email,
          password: password
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authUser');
    setUser(null);
  };

  const loginWithToken = (newUser) => {
    setUser(newUser);
    localStorage.setItem("authUser", JSON.stringify(newUser));
  }

  const isAuthenticated = () => {
    return user !== null;
  };

  // Function to get auth headers for API calls (now only returns Content-Type)
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json'
    };
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated,
    getAuthHeaders,
    loginWithToken,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;