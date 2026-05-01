import React from 'react';
import { Search, Bell, User, Calendar } from 'lucide-react';

const TopBar = () => {
  return (
    <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 bg-slate-950/20 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 w-96 group focus-within:border-indigo-500/50 transition-all">
        <Search className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Search constituencies, candidates..." 
          className="bg-transparent border-none outline-none ml-3 text-sm w-full text-slate-200 placeholder:text-slate-500"
        />
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
