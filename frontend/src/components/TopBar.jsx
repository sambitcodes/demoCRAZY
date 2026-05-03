import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Calendar, MapPin, Users, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const TopBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await axios.get(`http://localhost:8000/search?q=${query}`);
        setResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 bg-slate-950/20 backdrop-blur-md sticky top-0 z-40">
      <div className="relative">
        <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 w-96 group focus-within:border-indigo-500/50 transition-all">
          <Search className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search constituencies, candidates..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent border-none outline-none ml-3 text-sm w-full text-slate-200 placeholder:text-slate-500"
          />
          {isSearching && (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
            />
          )}
        </div>

        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-3 glass-panel border border-white/10 shadow-2xl overflow-hidden z-50 p-2"
            >
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-1">
                {results.map((res, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{res.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1"><MapPin size={10} /> {res.state}</span>
                          <span className="flex items-center gap-1"><Users size={10} /> {res.candidate}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-indigo-400">{res.prob}%</span>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Confidence</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] text-slate-600 font-black uppercase">Margin: {res.margin.toLocaleString()}</span>
                          <span className="text-[9px] font-black text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: `${res.color}40`, color: res.color }}>{res.winner}</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(res.margin / 50000) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-slate-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
          <Calendar size={18} />
          <span className="text-sm font-bold">2026 CYCLE</span>
        </div>
        
        <button className="relative p-2.5 text-slate-400 hover:text-white transition-colors">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900" />
        </button>

        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-500 p-[2px]">
          <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
            <User size={20} className="text-indigo-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
