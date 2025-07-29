import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from './AuthForm';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center">
    <motion.div
      className="bg-white rounded-2xl shadow-2xl p-8 text-center"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-4xl mb-4">🎨</div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Happy Art Town</h2>
      <div className="flex items-center justify-center space-x-2">
        <motion.div
          className="w-3 h-3 bg-purple-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0
          }}
        />
        <motion.div
          className="w-3 h-3 bg-pink-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0.2
          }}
        />
        <motion.div
          className="w-3 h-3 bg-blue-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0.4
          }}
        />
      </div>
      <p className="text-gray-600 mt-4">Loading...</p>
    </motion.div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    return <AuthForm />;
  }

  return children;
};

export default ProtectedRoute;