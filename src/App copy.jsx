import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit3, Trash2, Save, X, Eye, EyeOff, BookOpen, FileText, 
  Settings, Users, BarChart3, Search, Filter, Calendar, Clock,
  Award, Play, Sparkles, Home, LogOut, RefreshCw, AlertCircle,
  CheckCircle, Upload, ImageIcon
} from 'lucide-react';

// Mock Supabase for demo - Replace with real Supabase setup
const supabase = {
  from: (table) => ({
    select: (columns = '*') => ({
      eq: (col, val) => Promise.resolve({ data: [], error: null }),
      order: (col, options) => Promise.resolve({ data: [], error: null })
    }),
    insert: (data) => ({
      select: (columns = '*') => Promise.resolve({ 
        data: Array.isArray(data) ? data.map((item, index) => ({ 
          ...item, 
          id: Date.now() + index,
          created_at: new Date().toISOString() 
        })) : [{ 
          ...data, 
          id: Date.now(),
          created_at: new Date().toISOString() 
        }], 
        error: null 
      })
    }),
    update: (data) => ({
      eq: (col, val) => Promise.resolve({ data: [{ ...data, id: val }], error: null })
    }),
    delete: () => ({
      eq: (col, val) => Promise.resolve({ data: null, error: null })
    })
  })
};

const AdminTool = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notification, setNotification] = useState(null);

  // Load data from Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load courses - Mock data for demo
      const mockCourses = [
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
          created_at: new Date().toISOString()
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
          created_at: new Date().toISOString()
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
          created_at: new Date().toISOString()
        }
      ];

      const mockArticles = [
        {
          id: 1,
          title: "5 Fun Color Mixing Tips",
          excerpt: "Discover amazing color combinations that will make your art pop!",
          content: "Here are some amazing tips for mixing colors...",
          category: "tips",
          image_emoji: "🎨",
          read_time: "3 min read",
          is_published: true,
          created_at: new Date().toISOString()
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
          created_at: new Date().toISOString()
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
          created_at: new Date().toISOString()
        }
      ];

      setCourses(mockCourses);
      setArticles(mockArticles);
      
      // When using real Supabase, replace with:
      /*
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;
      if (articlesError) throw articlesError;

      setCourses(coursesData || []);
      setArticles(articlesData || []);
      */
      
    } catch (error) {
      showNotification('Error loading data: ' + error.message, 'error');
    }
    setLoading(false);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePublishToggle = async (item, type) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from(type === 'course' ? 'courses' : 'articles')
        .update({ is_published: !item.is_published })
        .eq('id', item.id);

      if (error) throw error;

      // Update local state
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
        `${type} ${item.is_published ? 'unpublished' : 'published'} successfully!`
      );
    } catch (error) {
      showNotification('Error updating status: ' + error.message, 'error');
    }
    setLoading(false);
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from(type === 'course' ? 'courses' : 'articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      if (type === 'course') {
        setCourses(prev => prev.filter(c => c.id !== id));
      } else {
        setArticles(prev => prev.filter(a => a.id !== id));
      }

      showNotification(`${type} deleted successfully!`);
    } catch (error) {
      showNotification('Error deleting item: ' + error.message, 'error');
    }
    setLoading(false);
  };

  const handleSave = async (formData, type) => {
    setLoading(true);
    try {
      if (editingItem) {
        // Update existing item - Mock for demo
        console.log('Updating', type, editingItem.id, 'with data:', formData);
        
        // Update local state
        if (type === 'course') {
          setCourses(prev => prev.map(c => 
            c.id === editingItem.id ? { ...c, ...formData, updated_at: new Date().toISOString() } : c
          ));
        } else {
          setArticles(prev => prev.map(a => 
            a.id === editingItem.id ? { ...a, ...formData, updated_at: new Date().toISOString() } : a
          ));
        }

        showNotification(`${type} updated successfully!`);
        
        // When using real Supabase, replace with:
        /*
        const { error } = await supabase
          .from(type === 'course' ? 'courses' : 'articles')
          .update(formData)
          .eq('id', editingItem.id);

        if (error) throw error;
        */
        
      } else {
        // Create new item - Mock for demo
        const newItem = { 
          ...formData, 
          id: Date.now(), 
          created_at: new Date().toISOString(),
          is_published: false 
        };
        
        console.log('Creating new', type, 'with data:', newItem);
        
        // Add to local state
        if (type === 'course') {
          setCourses(prev => [newItem, ...prev]);
        } else {
          setArticles(prev => [newItem, ...prev]);
        }

        showNotification(`${type} created successfully!`);
        
        // When using real Supabase, replace with:
        /*
        const { data, error } = await supabase
          .from(type === 'course' ? 'courses' : 'articles')
          .insert([formData])
          .select();

        if (error) throw error;

        const newItem = data[0];
        if (type === 'course') {
          setCourses(prev => [newItem, ...prev]);
        } else {
          setArticles(prev => [newItem, ...prev]);
        }
        */
      }

      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      showNotification('Error saving item: ' + error.message, 'error');
      console.error('Save error:', error);
    }
    setLoading(false);
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

  const Sidebar = () => (
    <motion.div 
      className="bg-white shadow-lg w-64 min-h-screen fixed left-0 top-0 z-40"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="text-3xl">🎨</div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Happy Art</h1>
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
    </motion.div>
  );

  const Header = () => (
    <motion.div 
      className="bg-white shadow-sm border-b p-4 ml-64"
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
            onClick={loadData}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            whileHover={{ scale: 1.02 }}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
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

  const Dashboard = () => (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6"
    >
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
      <FilterBar />
      
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

      {filteredCourses.length === 0 && (
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
      <FilterBar />
      
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

      {filteredArticles.length === 0 && (
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
      duration: course?.duration || '',
      lessons: course?.lessons || 0,
      difficulty: course?.difficulty || 'Beginner'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData, 'course');
    };

    return (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              {course ? 'Edit Course' : 'Create New Course'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <motion.button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                <Save size={18} className="mr-2" />
                {loading ? 'Saving...' : 'Save Course'}
              </motion.button>
              <motion.button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
      read_time: article?.read_time || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData, 'article');
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

            <div className="flex space-x-3 pt-4">
              <motion.button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-medium flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                <Save size={18} className="mr-2" />
                {loading ? 'Saving...' : 'Save Article'}
              </motion.button>
              <motion.button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  const Settings = () => (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">General Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
            <input
              type="text"
              defaultValue="Happy Art Town"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              defaultValue="Where creativity comes alive! Join thousands of young artists learning to draw, paint, and create amazing art!"
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Database Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supabase URL</label>
            <input
              type="text"
              placeholder="https://your-project.supabase.co"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supabase Key</label>
            <input
              type="password"
              placeholder="Your Supabase anon key"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64">
        <Header />
        
        <main className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <Dashboard key="dashboard" />}
            {activeTab === 'courses' && <CoursesList key="courses" />}
            {activeTab === 'articles' && <ArticlesList key="articles" />}
            {activeTab === 'settings' && <Settings key="settings" />}
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

      {loading && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
            <RefreshCw className="animate-spin text-purple-500" size={24} />
            <span className="text-gray-700">Loading...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminTool;