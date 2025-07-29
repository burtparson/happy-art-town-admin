import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock users database
  const mockUsers = [
    {
      id: '1',
      email: 'admin@happyarttown.com',
      password: 'admin123',
      user_metadata: {
        full_name: 'Admin User'
      }
    }
  ];

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setSession({ user: userData });
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const signUp = async (email, password, userData = {}) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        user_metadata: {
          full_name: userData.full_name || 'User'
        }
      };

      // Add to mock database (in real app, this would be saved to backend)
      mockUsers.push({ ...newUser, password });

      return { data: { user: newUser }, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Find user in mock database
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      const { password: _, ...userWithoutPassword } = foundUser;
      
      setUser(userWithoutPassword);
      setSession({ user: userWithoutPassword });
      setIsAuthenticated(true);
      
      // Save to localStorage for persistence
      localStorage.setItem('mockUser', JSON.stringify(userWithoutPassword));

      return { data: { user: userWithoutPassword }, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      
      // Remove from localStorage
      localStorage.removeItem('mockUser');

      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    // Simulate password reset
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    if (!foundUser) {
      return { data: null, error: new Error('User not found') };
    }

    return { data: { message: 'Password reset email sent' }, error: null };
  };

  const updateProfile = async (updates) => {
    setLoading(true);
    
    try {
      const updatedUser = {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          ...updates
        }
      };
      
      setUser(updatedUser);
      localStorage.setItem('mockUser', JSON.stringify(updatedUser));
      
      return { data: { user: updatedUser }, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    supabase: null // Mock mode doesn't have supabase
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};