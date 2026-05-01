import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'bg-indigo-500/10 text-indigo-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    purple: 'bg-purple-500/10 text-purple-400',
    rose: 'bg-rose-500/10 text-rose-400',
    amber: 'bg-amber-500/10 text-amber-400'
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02, translateY: -5 }}
      className="glass-panel p-6 flex items-center space-x-5"
    >
      <div className={`p-4 rounded-2xl ${colorMap[color] || colorMap.indigo}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-black text-white mt-1">{value}</h3>
      </div>
    </motion.div>
  );
};

export default StatCard;
