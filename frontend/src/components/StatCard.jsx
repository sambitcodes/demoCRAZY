import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, translateY: -5 }}
      className="glass-card p-6 flex items-center space-x-5"
    >
      <div className={`p-4 rounded-2xl bg-indigo-500/10 text-indigo-400`}>
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
