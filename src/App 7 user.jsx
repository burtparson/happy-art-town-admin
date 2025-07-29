import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit3, Trash2, Save, X, Eye, EyeOff, BookOpen, FileText, 
  Settings, Users, BarChart3, Search, Filter, Calendar, Clock,
  Award, Play, Sparkles, Home, LogOut, RefreshCw, AlertCircle,
  CheckCircle, Upload, ImageIcon
} from 'lucide-react';

// Authentication imports
// Use MockAuthContext for testing without Supabase setup
import { AuthProvider, useAuth } from './contexts/AuthContext';
// import { AuthProvider, useAuth } from './contexts/AuthContext'; // Use this for real Supabase
import ProtectedRoute from './components/ProtectedRoute';

// Real Supabase client setup
import { createClient } from '@supabase/supabase-js'
import { uploadImage, validateImage, createImagePreview, deleteImage } from './lib/imageUpload'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Mock data for fallback
const mockCoursesData = [
  {
    id: 1,
    title: "Rainbow Drawing Fun",
    description: "Learn to draw beautiful rainbows with simple steps!",
    age_group: "2-4",
    image_emoji: "🌈",
    duration: "15 mins",
    lessons: 5,
    difficulty: "Beginner",
    is_published: true,
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    title: "Animal Friends",
    description: "Draw cute animals step by step with fun techniques!",
    age_group: "5-8",
    image_emoji: "🐱",
    duration: "20 mins",
    lessons: 8,
    difficulty: "Easy",
    is_published: true,
    created_at: "2024-01-14T10:00:00Z"
  },
  {
    id: 3,
    title: "Space Art Adventure",
    description: "Create amazing space-themed artwork!",
    age_group: "9-12",
    image_emoji: "🚀",
    duration: "30 mins",
    lessons: 12,
    difficulty: "Intermediate",
    is_published: false,
    created_at: "2024-01-13T10:00:00Z"
  }
];

const mockArticlesData = [
  {
    id: 1,
    title: "5 Fun Color Mixing Tips",
    excerpt: "Discover amazing color combinations that will make your art pop!",
    content: "Here are some amazing tips for mixing colors...",
    category: "tips",
    image_emoji: "🎨",
    read_time: "3 min read",
    is_published: true,
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    title: "Drawing Your Pet",
    excerpt: "Step-by-step guide to drawing your furry friends!",
    content: "Follow these steps to draw your beloved pet...",
    category: "tutorials",
    image_emoji: "🐕",
    read_time: "5 min read",
    is_published: true,
    created_at: "2024-01-14T10:00:00Z"
  },
  {
    id: 3,
    title: "Art Inspiration from Nature",
    excerpt: "Find inspiration in the world around you!",
    content: "Nature provides endless inspiration for young artists...",
    category: "inspiration",
    image_emoji: "🍃",
    read_time: "4 min read",
    is_published: false,
    created_at: "2024-01-13T10:00:00Z"
  }
];

const mockSettingsData = {
  site_name: 'Happy Art Town',
  site_description: 'Where creativity comes alive! Join thousands of young artists learning to draw, paint, and create amazing art!',
  contact_email: 'admin@happyarttown.com',
  max_courses_per_user: '10'
};

const AdminTool = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState([]);
  const [articles, setArticles] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Load data from Supabase on component mount
  useEffect(() => {
    loadData();
    loadSettings();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading data from Supabase...');

      // Check if we have valid Supabase credentials
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase credentials not found');
      }

      // Load courses from Supabase
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      // Load articles from Supabase  
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesError) {
        console.error('❌ Error loading courses:', coursesError);
        throw coursesError;
      }

      if (articlesError) {
        console.error('❌ Error loading articles:', articlesError);
        throw articlesError;
      }

      console.log('✅ Courses data:', coursesData);
      console.log('✅ Articles data:', articlesData);
      
      setCourses(coursesData || []);
      setArticles(articlesData || []);
      setUsingMockData(false);
      setLastUpdated(new Date());
      console.log('🎉 Data loading completed!');
      
    } catch (err) {
      console.error('💥 Error loading data:', err);
      setError(`Database connection failed: ${err.message}`);
      
      // Fall back to mock data on any error
      console.log('📦 Using mock data due to error');
      setCourses(mockCoursesData);
      setArticles(mockArticlesData);
      setUsingMockData(true);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    setSettingsLoading(true);
    
    try {
      console.log('🔄 Loading settings from Supabase...');

      // Check if we have valid Supabase credentials
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase credentials not found');
      }

      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*');

      if (settingsError) {
        console.error('❌ Error loading settings:', settingsError);
        throw settingsError;
      }

      console.log('✅ Settings data:', settingsData);
      
      // Convert array of settings to object
      const settingsObj = {};
      if (settingsData) {
        settingsData.forEach(setting => {
          settingsObj[setting.key] = setting.value;
        });
      }
      
      setSettings(settingsObj);
      console.log('🎉 Settings loading completed!');
      
    } catch (err) {
      console.error('💥 Error loading settings:', err);
      
      // Fall back to mock settings on any error
      console.log('📦 Using mock settings due to error');
      setSettings(mockSettingsData);
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveSettings = async (newSettings) => {
    setSettingsLoading(true);
    
    try {
      console.log('💾 Saving settings to Supabase...', newSettings);

      if (usingMockData) {
        // Mock data behavior
        setSettings(newSettings);
        showNotification('Settings saved successfully! (Mock data)');
        return;
      }

      // Check if we have valid Supabase credentials
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase credentials not found');
      }

      // Update each setting individually
      for (const [key, value] of Object.entries(newSettings)) {
        console.log(`🔄 Updating setting: ${key} = ${value}`);
        
        const { error } = await supabase
          .from('settings')
          .upsert({ 
            key: key, 
            value: value,
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'key' 
          });

        if (error) {
          console.error(`❌ Error updating setting ${key}:`, error);
          throw error;
        }
      }

      console.log('✅ All settings saved successfully');
      setSettings(newSettings);
      showNotification('Settings saved successfully!');
      
    } catch (err) {
      console.error('💥 Error saving settings:', err);
      showNotification('Error saving settings: ' + err.message, 'error');
    } finally {
      setSettingsLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      const { error } = await signOut();
      if (error) {
        showNotification('Error logging out: ' + error.message, 'error');
      }
    }
  };

  const handlePublishToggle = async (item, type) => {
    if (usingMockData) {
      // Mock data behavior
      if (type === 'course') {
        setCourses(prev => prev.map(c => 
          c.id === item.id ? { ...c, is_published: !c.is_published } : c
        ));
      } else {
        setArticles(prev => prev.map(a => 
          a.id === item.id ? { ...a, is_published: !a.is_published } : a
        ));
      }
      showNotification(
        `${type} ${item.is_published ? 'unpublished' : 'published'} successfully! (Mock data)`
      );
      return;
    }

    setLoading(true);
    try {
      console.log(`🔄 Toggling publish status for ${type} ID: ${item.id}`);
      
      const tableName = type === 'course' ? 'courses' : 'articles';
      const newStatus = !item.is_published;
      
      const { data, error } = await supabase
        .from(tableName)
        .update({ 
          is_published: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)
        .select();

      if (error) {
        console.error('❌ Error updating status:', error);
        throw error;
      }

      console.log('✅ Status updated:', data);

      // Update local state
      if (type === 'course') {
        setCourses(prev => prev.map(c => 
          c.id === item.id ? { ...c, is_published: newStatus } : c
        ));
      } else {
        setArticles(prev => prev.map(a => 
          a.id === item.id ? { ...a, is_published: newStatus } : a
        ));
      }

      showNotification(
        `${type} ${item.is_published ? 'unpublished' : 'published'} successfully!`
      );
    } catch (error) {
      console.error('💥 Error updating status:', error);
      showNotification('Error updating status: ' + error.message, 'error');
    }
    setLoading(false);
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    if (usingMockData) {
      // Mock data behavior
      if (type === 'course') {
        setCourses(prev => prev.filter(c => c.id !== id));
      } else {
        setArticles(prev => prev.filter(a => a.id !== id));
      }
      showNotification(`${type} deleted successfully! (Mock data)`);
      return;
    }
    
    setLoading(true);
    try {
      console.log(`🗑️ Deleting ${type} ID: ${id}`);
      
      const tableName = type === 'course' ? 'courses' : 'articles';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting:', error);
        throw error;
      }

      console.log('✅ Successfully deleted');

      // Update local state
      if (type === 'course') {
        setCourses(prev => prev.filter(c => c.id !== id));
      } else {
        setArticles(prev => prev.filter(a => a.id !== id));
      }

      showNotification(`${type} deleted successfully!`);
    } catch (error) {
      console.error('💥 Error deleting:', error);
      showNotification('Error deleting item: ' + error.message, 'error');
    }
    setLoading(false);
  };

  const handleSave = async (formData, type) => {
    console.log(`💾 Starting save operation for ${type}:`, formData);
    setLoading(true);
    
    try {
      if (editingItem) {
        // Update existing item
        console.log(`🔄 Updating existing ${type} with ID:`, editingItem.id);
        
        if (usingMockData) {
          // Mock data behavior
          console.log('📦 Mock update:', type, editingItem.id, 'with data:', formData);
          
          if (type === 'course') {
            setCourses(prev => prev.map(c => 
              c.id === editingItem.id ? { ...c, ...formData, updated_at: new Date().toISOString() } : c
            ));
          } else {
            setArticles(prev => prev.map(a => 
              a.id === editingItem.id ? { ...a, ...formData, updated_at: new Date().toISOString() } : a
            ));
          }
          showNotification(`${type} updated successfully! (Mock data)`);
        } else {
          // Real Supabase update
          const tableName = type === 'course' ? 'courses' : 'articles';
          
          const updateData = {
            ...formData,
            updated_at: new Date().toISOString()
          };
          
          console.log(`🔄 Sending update to Supabase table "${tableName}":`, updateData);
          
          const { data, error } = await supabase
            .from(tableName)
            .update(updateData)
            .eq('id', editingItem.id)
            .select();

          if (error) {
            console.error('❌ Supabase update error:', error);
            throw error;
          }

          console.log('✅ Supabase update success:', data);

          // Update local state with returned data
          if (data && data.length > 0) {
            const updatedItem = data[0];
            if (type === 'course') {
              setCourses(prev => prev.map(c => 
                c.id === editingItem.id ? updatedItem : c
              ));
            } else {
              setArticles(prev => prev.map(a => 
                a.id === editingItem.id ? updatedItem : a
              ));
            }
          }
          showNotification(`${type} updated successfully!`);
        }
        
      } else {
        // Create new item
        console.log(`➕ Creating new ${type}`);
        
        if (usingMockData) {
          // Mock data behavior
          const newItem = { 
            ...formData, 
            id: Date.now(), 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_published: false 
          };
          
          console.log('📦 Mock create new', type, 'with data:', newItem);
          
          if (type === 'course') {
            setCourses(prev => [newItem, ...prev]);
          } else {
            setArticles(prev => [newItem, ...prev]);
          }
          showNotification(`${type} created successfully! (Mock data)`);
        } else {
          // Real Supabase insert
          const tableName = type === 'course' ? 'courses' : 'articles';
          
          const insertData = {
            ...formData,
            is_published: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          console.log(`➕ Sending insert to Supabase table "${tableName}":`, insertData);

          const { data, error } = await supabase
            .from(tableName)
            .insert([insertData])
            .select();

          if (error) {
            console.error('❌ Supabase insert error:', error);
            throw error;
          }

          console.log('✅ Supabase insert success:', data);

          if (data && data.length > 0) {
            const newItem = data[0];
            if (type === 'course') {
              setCourses(prev => [newItem, ...prev]);
            } else {
              setArticles(prev => [newItem, ...prev]);
            }
          }
          showNotification(`${type} created successfully!`);
        }
      }

      // Close form and reset state
      console.log('✅ Save operation completed, closing form');
      setShowForm(false);
      setEditingItem(null);
      
    } catch (error) {
      console.error('💥 Save operation failed:', error);
      
      // Show detailed error message
      let errorMessage = 'Error saving item: ';
      if (error.message) {
        errorMessage += error.message;
      } else if (error.details) {
        errorMessage += error.details;
      } else {
        errorMessage += 'Unknown error occurred';
      }
      
      showNotification(errorMessage, 'error');
      
      // Don't close the form on error so user can try again
      console.log('❌ Keeping form open due to error');
    } finally {
      setLoading(false);
      console.log('🏁 Save operation ended');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'published' && course.is_published) ||
      (filterStatus === 'draft' && !course.is_published);
    return matchesSearch && matchesFilter;
  });

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'published' && article.is_published) ||
      (filterStatus === 'draft' && !article.is_published);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter(c => c.is_published).length,
    totalArticles: articles.length,
    publishedArticles: articles.filter(a => a.is_published).length
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const Notification = () => {
    if (!notification) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${
          notification.type === 'error' 
            ? 'bg-red-500 text-white' 
            : 'bg-green-500 text-white'
        }`}
      >
        {notification.type === 'error' ? (
          <AlertCircle size={20} />
        ) : (
          <CheckCircle size={20} />
        )}
        <span>{notification.message}</span>
      </motion.div>
    );
  };

  const ErrorDisplay = () => {
    if (!error) return null;
    
    return (
      <motion.div 
        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          <div>
            <h4 className="font-medium text-yellow-800">Database Connection Issue</h4>
            <p className="text-sm text-yellow-600 mt-1">{error}</p>
            <p className="text-sm text-blue-600 mt-1">
              {usingMockData ? 'Using mock data for demonstration' : 'Some features may be limited'}
            </p>
            <button 
              onClick={loadData}
              className="mt-2 text-sm text-yellow-700 underline hover:text-yellow-800"
            >
              Try reconnecting
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const DataStatus = () => (
    <motion.div 
      className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full animate-pulse ${
          usingMockData ? 'bg-yellow-400' : 'bg-green-400'
        }`}></div>
        <div className="text-sm">
          <span className="font-medium text-blue-800">Data Source:</span>
          <span className="text-blue-600 ml-2">
            {usingMockData ? 'Mock Data' : 'Live from Supabase'} • 
            {courses.length} courses • {articles.length} articles
          </span>
          {lastUpdated && (
            <span className="text-blue-500 ml-2">
              • Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );

  const Sidebar = () => (
    <motion.div 
      className="bg-white shadow-lg w-64 min-h-screen fixed left-0 top-0 z-50 flex flex-col"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6 flex-1">
        <div className="flex items-center space-x-3 mb-8">
          <div className="text-3xl">🎨</div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{settings.site_name || 'Happy Art'}</h1>
            <p className="text-sm text-gray-500">Admin Panel</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
            { id: 'courses', icon: BookOpen, label: 'Courses' },
            { id: 'articles', icon: FileText, label: 'Articles' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map(({ id, icon: Icon, label }) => (
            <motion.button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === id 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </motion.button>
          ))}
        </nav>
      </div>

      {/* User section */}
      <div className="p-6 border-t bg-gray-50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-medium">
            {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {user?.user_metadata?.full_name || 'Admin User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </motion.button>
      </div>
    </motion.div>
  );

  const Header = () => (
    <motion.div 
      className="bg-white shadow-sm border-b p-4 ml-64 relative z-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeTab}</h2>
          <p className="text-gray-500">Manage your art learning content</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={activeTab === 'settings' ? () => { loadData(); loadSettings(); } : loadData}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            whileHover={{ scale: 1.02 }}
            disabled={loading || settingsLoading}
            title="Refresh data from database"
          >
            <RefreshCw size={18} className={(loading || settingsLoading) ? 'animate-spin' : ''} />
            <span className="hidden md:inline">
              {(loading || settingsLoading) ? 'Loading...' : 'Refresh'}
            </span>
          </motion.button>
          
          {(activeTab === 'courses' || activeTab === 'articles') && (
            <motion.button
              onClick={() => {
                setEditingItem(null);
                setShowForm(true);
              }}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={18} />
              <span>Add {activeTab.slice(0, -1)}</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );

  const FilterBar = () => (
    <motion.div 
      className="bg-white p-4 rounded-lg shadow-sm border mb-6"
      variants={fadeInUp}
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>
    </motion.div>
  );

  const LoadingSpinner = () => (
    <motion.div 
      className="flex items-center justify-center py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center space-x-4">
        <motion.div
          className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700">Loading data...</p>
          <p className="text-sm text-gray-500">
            {usingMockData ? 'Using mock data' : 'Fetching from database'}
          </p>
        </div>
      </div>
    </motion.div>
  );

  const Dashboard = () => (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6"
    >
      <ErrorDisplay />
      <DataStatus />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'bg-blue-500', change: '+12%' },
          { title: 'Published Courses', value: stats.publishedCourses, icon: Eye, color: 'bg-green-500', change: '+5%' },
          { title: 'Total Articles', value: stats.totalArticles, icon: FileText, color: 'bg-purple-500', change: '+8%' },
          { title: 'Published Articles', value: stats.publishedArticles, icon: Eye, color: 'bg-pink-500', change: '+3%' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            variants={fadeInUp}
            whileHover={{ y: -5, shadow: "0 10px 25px rgba(0,0,0,0.1)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
              <span className="text-green-500 text-sm font-medium">{stat.change}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            <p className="text-gray-500 text-sm">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp} className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Courses</h3>
          <div className="space-y-3">
            {courses.slice(0, 5).map((course, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">{course.image_emoji}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{course.title}</p>
                  <p className="text-sm text-gray-500">Ages {course.age_group} • {course.difficulty}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.is_published ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {course.is_published ? 'Published' : 'Draft'}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Articles</h3>
          <div className="space-y-3">
            {articles.slice(0, 5).map((article, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">{article.image_emoji}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{article.title}</p>
                  <p className="text-sm text-gray-500 capitalize">{article.category} • {article.read_time}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  article.is_published ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {article.is_published ? 'Published' : 'Draft'}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const CoursesList = () => (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6"
    >
      <ErrorDisplay />
      <DataStatus />
      <FilterBar />
      
      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <motion.div
              key={course.id}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              layout
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{course.image_emoji}</div>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => handlePublishToggle(course, 'course')}
                    className={`p-2 rounded-lg ${
                      course.is_published 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {course.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setEditingItem(course);
                      setShowForm(true);
                    }}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit3 size={16} />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(course.id, 'course')}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Age Group:</span>
                  <span className="font-medium">{course.age_group} years</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Lessons:</span>
                  <span className="font-medium">{course.lessons}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Level:</span>
                  <span className="font-medium">{course.difficulty}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  course.is_published 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {course.is_published ? 'Published' : 'Draft'}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(course.created_at).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredCourses.length === 0 && (
        <motion.div 
          className="text-center py-12"
          variants={fadeInUp}
        >
          <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No courses found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </motion.div>
      )}
    </motion.div>
  );

  const ArticlesList = () => (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6"
    >
      <ErrorDisplay />
      <DataStatus />
      <FilterBar />
      
      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <motion.div
              key={article.id}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              layout
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{article.image_emoji}</div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    article.category === 'tips' ? 'bg-blue-100 text-blue-600' :
                    article.category === 'tutorials' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {article.category}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => handlePublishToggle(article, 'article')}
                    className={`p-2 rounded-lg ${
                      article.is_published 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {article.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setEditingItem(article);
                      setShowForm(true);
                    }}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit3 size={16} />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(article.id, 'article')}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-2">{article.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.excerpt}</p>
              
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-gray-500">{article.read_time}</span>
                <span className="text-gray-400">
                  {new Date(article.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                article.is_published 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {article.is_published ? 'Published' : 'Draft'}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredArticles.length === 0 && (
        <motion.div 
          className="text-center py-12"
          variants={fadeInUp}
        >
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No articles found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </motion.div>
      )}
    </motion.div>
  );

  const CourseForm = ({ course, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      title: course?.title || '',
      description: course?.description || '',
      age_group: course?.age_group || '2-4',
      image_emoji: course?.image_emoji || '🎨',
      image_url: course?.image_url || '',
      duration: course?.duration || '',
      lessons: course?.lessons || 0,
      difficulty: course?.difficulty || 'Beginner'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState(course?.image_url || null);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleImageSelect = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const validation = validateImage(file);
      if (!validation.isValid) {
        showNotification(validation.error, 'error');
        return;
      }

      setSelectedFile(file);
      
      try {
        const preview = await createImagePreview(file);
        setImagePreview(preview);
      } catch (error) {
        showNotification('Error creating preview', 'error');
      }
    };

    const handleImageUpload = async () => {
      if (!selectedFile || usingMockData) {
        if (usingMockData) {
          showNotification('Image upload not available in mock mode', 'error');
        }
        return null;
      }

      setUploadingImage(true);
      try {
        const result = await uploadImage(selectedFile, supabase);
        setFormData(prev => ({ ...prev, image_url: result.url }));
        showNotification('Image uploaded successfully!');
        return result.url;
      } catch (error) {
        showNotification('Image upload failed: ' + error.message, 'error');
        return null;
      } finally {
        setUploadingImage(false);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Validate required fields
      if (!formData.title.trim()) {
        showNotification('Title is required', 'error');
        return;
      }
      
      if (!formData.description.trim()) {
        showNotification('Description is required', 'error');
        return;
      }

      console.log('📝 Form submitted with data:', formData);
      setIsSubmitting(true);
      
      try {
        let finalFormData = { ...formData };
        
        // Upload image if selected
        if (selectedFile && !usingMockData) {
          const uploadedUrl = await handleImageUpload();
          if (uploadedUrl) {
            finalFormData.image_url = uploadedUrl;
          }
        }
        
        await onSave(finalFormData, 'course');
        console.log('✅ Form save completed successfully');
      } catch (error) {
        console.error('❌ Form save failed:', error);
        // Error handling is done in onSave function
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          // Close modal if clicking on backdrop
          if (e.target === e.currentTarget) {
            onCancel();
          }
        }}
      >
        <motion.div
          className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              {course ? 'Edit Course' : 'Create New Course'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 p-2"
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter course title"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter course description"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                <select
                  value={formData.age_group}
                  onChange={(e) => setFormData(prev => ({ ...prev, age_group: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isSubmitting}
                >
                  <option value="2-4">2-4 Years</option>
                  <option value="5-8">5-8 Years</option>
                  <option value="9-12">9-12 Years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isSubmitting}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Easy">Easy</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                <input
                  type="text"
                  value={formData.image_emoji}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_emoji: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl"
                  placeholder="🎨"
                  maxLength="2"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="15 mins"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lessons</label>
                <input
                  type="number"
                  value={formData.lessons}
                  onChange={(e) => setFormData(prev => ({ ...prev, lessons: parseInt(e.target.value) || 0 }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  max="100"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Image</label>
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="course-image-upload"
                      disabled={isSubmitting || uploadingImage}
                    />
                    <label 
                      htmlFor="course-image-upload" 
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <ImageIcon size={32} className="text-gray-400" />
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-purple-600">Click to upload</span> or drag and drop
                      </div>
                      <div className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</div>
                    </label>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {selectedFile.name}
                    </div>
                  )}
                </div>
                
                {imagePreview && (
                  <div className="w-24 h-24">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
              
              {uploadingImage && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-purple-600">
                  <Upload size={16} className="animate-bounce" />
                  <span>Uploading image...</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4 border-t">
              <motion.button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                disabled={isSubmitting}
              >
                <Save size={18} className="mr-2" />
                {isSubmitting ? 'Saving...' : `Save Course`}
              </motion.button>
              <motion.button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                disabled={isSubmitting}
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  const ArticleForm = ({ article, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      title: article?.title || '',
      excerpt: article?.excerpt || '',
      content: article?.content || '',
      category: article?.category || 'tips',
      image_emoji: article?.image_emoji || '📝',
      image_url: article?.image_url || '',
      read_time: article?.read_time || ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState(article?.image_url || null);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleImageSelect = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const validation = validateImage(file);
      if (!validation.isValid) {
        showNotification(validation.error, 'error');
        return;
      }

      setSelectedFile(file);
      
      try {
        const preview = await createImagePreview(file);
        setImagePreview(preview);
      } catch (error) {
        showNotification('Error creating preview', 'error');
      }
    };

    const handleImageUpload = async () => {
      if (!selectedFile || usingMockData) {
        if (usingMockData) {
          showNotification('Image upload not available in mock mode', 'error');
        }
        return null;
      }

      setUploadingImage(true);
      try {
        const result = await uploadImage(selectedFile, supabase);
        setFormData(prev => ({ ...prev, image_url: result.url }));
        showNotification('Image uploaded successfully!');
        return result.url;
      } catch (error) {
        showNotification('Image upload failed: ' + error.message, 'error');
        return null;
      } finally {
        setUploadingImage(false);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      setIsSubmitting(true);
      
      try {
        let finalFormData = { ...formData };
        
        // Upload image if selected
        if (selectedFile && !usingMockData) {
          const uploadedUrl = await handleImageUpload();
          if (uploadedUrl) {
            finalFormData.image_url = uploadedUrl;
          }
        }
        
        await onSave(finalFormData, 'article');
      } catch (error) {
        console.error('❌ Form save failed:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              {article ? 'Edit Article' : 'Create New Article'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows="2"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows="8"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="tips">Tips</option>
                  <option value="tutorials">Tutorials</option>
                  <option value="inspiration">Inspiration</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                <input
                  type="text"
                  value={formData.image_emoji}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_emoji: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl"
                  placeholder="📝"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Read Time</label>
                <input
                  type="text"
                  value={formData.read_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, read_time: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="5 min read"
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Article Image</label>
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="article-image-upload"
                      disabled={isSubmitting || uploadingImage}
                    />
                    <label 
                      htmlFor="article-image-upload" 
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <ImageIcon size={32} className="text-gray-400" />
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-green-600">Click to upload</span> or drag and drop
                      </div>
                      <div className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</div>
                    </label>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {selectedFile.name}
                    </div>
                  )}
                </div>
                
                {imagePreview && (
                  <div className="w-24 h-24">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
              
              {uploadingImage && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-green-600">
                  <Upload size={16} className="animate-bounce" />
                  <span>Uploading image...</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <motion.button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                disabled={isSubmitting || uploadingImage}
              >
                <Save size={18} className="mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Article'}
              </motion.button>
              <motion.button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                disabled={isSubmitting || uploadingImage}
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  const Settings = () => {
    const [settingsForm, setSettingsForm] = useState({
      site_name: settings.site_name || '',
      site_description: settings.site_description || '',
      contact_email: settings.contact_email || '',
      max_courses_per_user: settings.max_courses_per_user || '10'
    });

    const [profileForm, setProfileForm] = useState({
      full_name: user?.user_metadata?.full_name || '',
      email: user?.email || ''
    });

    const [profileLoading, setProfileLoading] = useState(false);

    // Update form when settings are loaded
    useEffect(() => {
      setSettingsForm({
        site_name: settings.site_name || '',
        site_description: settings.site_description || '',
        contact_email: settings.contact_email || '',
        max_courses_per_user: settings.max_courses_per_user || '10'
      });
    }, [settings]);

    // Update profile form when user data changes
    useEffect(() => {
      setProfileForm({
        full_name: user?.user_metadata?.full_name || '',
        email: user?.email || ''
      });
    }, [user]);

    const handleSettingsSubmit = (e) => {
      e.preventDefault();
      saveSettings(settingsForm);
    };

    const handleProfileSubmit = async (e) => {
      e.preventDefault();
      
      setProfileLoading(true);
      try {
        // Update user profile using Supabase auth
        const { error } = await supabase.auth.updateUser({
          data: {
            full_name: profileForm.full_name
          }
        });

        if (error) {
          throw error;
        }

        showNotification('Profile updated successfully!');
      } catch (error) {
        console.error('Profile update error:', error);
        showNotification('Error updating profile: ' + error.message, 'error');
      } finally {
        setProfileLoading(false);
      }
    };

    return (
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="space-y-6 max-w-5xl w-full relative z-0"
      >
        <ErrorDisplay />
        <DataStatus />
        
        {/* Profile Settings */}
        <motion.div variants={fadeInUp} className="bg-white p-6 rounded-xl shadow-lg w-full">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Profile Settings</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your full name"
                  disabled={profileLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  placeholder="Email cannot be changed"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed after registration</p>
              </div>
            </div>
            <div className="flex justify-end">
              <motion.button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
                whileHover={!profileLoading ? { scale: 1.02 } : {}}
                whileTap={!profileLoading ? { scale: 0.98 } : {}}
                disabled={profileLoading}
              >
                <Save size={16} />
                <span>{profileLoading ? 'Updating...' : 'Update Profile'}</span>
              </motion.button>
            </div>
          </form>
        </motion.div>
        
        <motion.div variants={fadeInUp} className="bg-white p-6 rounded-xl shadow-lg w-full">
          <h3 className="text-xl font-bold text-gray-800 mb-4">General Settings</h3>
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input
                type="text"
                value={settingsForm.site_name}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, site_name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Happy Art Town"
                disabled={settingsLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={settingsForm.site_description}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, site_description: e.target.value }))}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Where creativity comes alive! Join thousands of young artists learning to draw, paint, and create amazing art!"
                disabled={settingsLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settingsForm.contact_email}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, contact_email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="admin@happyarttown.com"
                  disabled={settingsLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Courses Per User</label>
                <input
                  type="number"
                  value={settingsForm.max_courses_per_user}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, max_courses_per_user: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="100"
                  disabled={settingsLoading}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <motion.button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
                whileHover={!settingsLoading ? { scale: 1.02 } : {}}
                whileTap={!settingsLoading ? { scale: 0.98 } : {}}
                disabled={settingsLoading}
              >
                <Save size={16} />
                <span>{settingsLoading ? 'Saving...' : 'Save General Settings'}</span>
              </motion.button>
            </div>
          </form>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white p-6 rounded-xl shadow-lg w-full">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Database Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supabase URL</label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                defaultValue={supabaseUrl || ''}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supabase Key</label>
              <input
                type="password"
                placeholder="Your Supabase anon key"
                defaultValue={supabaseAnonKey ? '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••' : ''}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                readOnly
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  usingMockData ? 'bg-red-400' : 'bg-green-400'
                }`}></div>
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> {usingMockData ? '❌ Not connected' : '✅ Connected'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {usingMockData 
                      ? 'Add your Supabase credentials to .env file to connect to your database'
                      : 'Successfully connected to your Supabase database'
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <motion.button
                onClick={() => { loadData(); loadSettings(); }}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading || settingsLoading}
              >
                <RefreshCw size={16} className={(loading || settingsLoading) ? 'animate-spin' : ''} />
                <span>Test Connection</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="bg-white p-6 rounded-xl shadow-lg w-full">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Database Schema</h3>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">Required Tables:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><code className="bg-gray-200 px-2 py-1 rounded">courses</code> - Store course information</p>
                <p><code className="bg-gray-200 px-2 py-1 rounded">articles</code> - Store article content</p>
                <p><code className="bg-gray-200 px-2 py-1 rounded">settings</code> - Store application settings</p>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Tip:</strong> Create these tables in your Supabase dashboard with the required columns to enable full functionality.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-700 mb-2">SQL Commands for Table Creation:</h4>
              <div className="relative">
                <pre className="text-xs text-green-600 bg-green-100 p-3 rounded overflow-x-auto max-h-96 overflow-y-auto">
{`-- Create courses table
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  age_group VARCHAR(10),
  image_emoji VARCHAR(10),
  duration VARCHAR(50),
  lessons INTEGER DEFAULT 0,
  difficulty VARCHAR(50),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create articles table  
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT,
  category VARCHAR(50),
  image_emoji VARCHAR(10),
  read_time VARCHAR(50),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create settings table
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON courses FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON courses FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON courses FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON articles FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON articles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON articles FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON articles FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON settings FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON settings FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON settings FOR DELETE USING (true);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES 
('site_name', 'Happy Art Town', 'Name of the website'),
('site_description', 'Where creativity comes alive! Join thousands of young artists learning to draw, paint, and create amazing art!', 'Website description'),
('contact_email', 'admin@happyarttown.com', 'Contact email for the site'),
('max_courses_per_user', '10', 'Maximum courses a user can create');`}
                </pre>
                <motion.button
                  onClick={() => {
                    navigator.clipboard.writeText(`-- Create courses table
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  age_group VARCHAR(10),
  image_emoji VARCHAR(10),
  duration VARCHAR(50),
  lessons INTEGER DEFAULT 0,
  difficulty VARCHAR(50),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create articles table  
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT,
  category VARCHAR(50),
  image_emoji VARCHAR(10),
  read_time VARCHAR(50),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create settings table
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON courses FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON courses FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON courses FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON articles FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON articles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON articles FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON articles FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON settings FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON settings FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON settings FOR DELETE USING (true);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES 
('site_name', 'Happy Art Town', 'Name of the website'),
('site_description', 'Where creativity comes alive! Join thousands of young artists learning to draw, paint, and create amazing art!', 'Website description'),
('contact_email', 'admin@happyarttown.com', 'Contact email for the site'),
('max_courses_per_user', '10', 'Maximum courses a user can create');`);
                    showNotification('SQL copied to clipboard!');
                  }}
                  className="absolute top-2 right-2 p-2 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Copy SQL
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  };

  // Main render function
  const renderActiveSection = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'courses':
        return <CoursesList />;
      case 'articles':
        return <ArticlesList />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64">
        <Header />
        
        <main className="p-6 relative z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="relative z-0"
            >
              {renderActiveSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {showForm && (
          <>
            {activeTab === 'courses' && (
              <CourseForm
                course={editingItem}
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
              />
            )}
            {activeTab === 'articles' && (
              <ArticleForm
                article={editingItem}
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
              />
            )}
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        <Notification />
      </AnimatePresence>

      {(loading || settingsLoading) && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
            <RefreshCw className="animate-spin text-purple-500" size={24} />
            <span className="text-gray-700">
              {usingMockData ? 'Using mock data...' : 'Loading from database...'}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Main App component with authentication
const App = () => {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AdminTool />
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default App;