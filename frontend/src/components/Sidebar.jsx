import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Newspaper, 
  Settings, 
  HelpCircle,
  Database,
  PieChart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/' },
    { icon: BarChart3, label: 'Simulations', path: '/simulations' },
    { icon: Newspaper, label: 'Sentiment', path: '/sentiment' },
    { icon: Database, label: 'Historical', path: '/historical' },
    { icon: PieChart, label: 'Analytics', path: '/analytics' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-72 h-screen fixed left-0 top-0 bg-slate-950/50 border-r border-white/5 p-6 flex flex-col backdrop-blur-xl z-50">
      <div className="flex items-center space-x-3 mb-12 px-2">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <PieChart className="text-white" size={24} />
        </div>
        <h2 className="text-2xl font-black tracking-tighter">
          Demo<span className="text-indigo-500">CRAZY</span>
        </h2>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
          >
            <motion.div
              whileHover={{ x: 5 }}
              className={`nav-item mb-2 ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span className="font-semibold">{item.label}</span>
            </motion.div>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5 space-y-1">
        <Link to="/docs" className="nav-item">
          <HelpCircle size={20} />
          <span>Documentation</span>
        </Link>
        <Link to="/settings" className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
