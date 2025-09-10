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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  

  // Check for existing token on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    
    if (storedToken && storedUser) {
      try {
        // Parse the token to check if it's expired
        const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (tokenPayload.exp > currentTime) {
          // Token is still valid
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Token expired, clear it
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
        }
      } catch (error) {
        console.error('Error parsing stored token:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
    setLoading(false);
  }, []);


  const login = async (username, password) => {
    try {
      const response = await fetch('https://localhost:7242/api/Auth/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      
      // Handle both 'Token' and 'token' property names
      const jwtToken = data.Token || data.token;
      
      // Parse user info from token
      const tokenPayload = JSON.parse(atob(jwtToken.split('.')[1]));
      console.log("JWT Token:", jwtToken);
      console.log("Decoded Payload:", tokenPayload);

      const userData = {
        id: tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
        username: tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        role: tokenPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      };

      // Store in localStorage
      localStorage.setItem('authToken', jwtToken);
      localStorage.setItem('authUser', JSON.stringify(userData));
      
      // Update state
      setToken(jwtToken);
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
  };

  const loginWithToken = (newToken, newUser) =>{
  setToken(newToken);
  setUser(newUser);
  localStorage.setItem("authToken", newToken);
  localStorage.setItem("authUser", JSON.stringify(newUser));
  }

  const isAuthenticated = () => {
    return token !== null && user !== null;
  };

  // Function to get auth headers for API calls
  const getAuthHeaders = (isFormData = false) => {
  if (token) {
    if (isFormData) {
      return {
        'Authorization': `Bearer ${token}`
      };
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
  return isFormData ? {} : { 'Content-Type': 'application/json' };
};

  const value = {
    user,
    token,
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