import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Download, Filter, Table as TableIcon, Calendar, Search } from 'lucide-react';

const Historical = () => {
  const [activeTab, setActiveTab] = useState('assembly');
  const [state, setState] = useState('West Bengal');
  const [dataFiles, setDataFiles] = useState([]);

  const states = ["West Bengal", "Assam", "Tamil Nadu", "Kerala"];

  useEffect(() => {
    // Mock fetching files based on selection
    if (activeTab === 'assembly') {
      const years = [2001, 2006, 2011, 2016, 2021];
      setDataFiles(years.map(y => ({ 
        name: `${state.replace(' ', '_')}_${y}.csv`, 
        year: y, 
        type: 'Assembly', 
        records: 'Approx 5k rows' 
      })));
    } else {
      setDataFiles([
        { name: 'ge_2004.csv', year: 2004, type: 'General', records: 'Approx 8k rows' },
        { name: 'ge_2009.csv', year: 2009, type: 'General', records: 'Approx 9k rows' }
      ]);
    }
  }, [activeTab, state]);

  return (
    <div className="p-10 space-y-10 animate-fade-in">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Historical Election Archive</h2>
          <p className="text-slate-400">Access and download normalized historical datasets for model training.</p>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveTab('assembly')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'assembly' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Assembly (VS)
          </button>
          <button 
            onClick={() => setActiveTab('general')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            General (LS)
          </button>
        </div>
      </header>

      {activeTab === 'assembly' && (
        <div className="flex flex-wrap gap-4">
          {states.map(s => (
            <button
              key={s}
              onClick={() => setState(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${state === s ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'border-white/5 text-slate-500 hover:border-white/20'}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div className="glass-panel overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="flex items-center space-x-3">
              <TableIcon className="text-indigo-400" size={20} />
              <h3 className="font-bold">Dataset Inventory</h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search files..." 
                className="bg-slate-900 border border-white/5 rounded-lg py-1.5 pl-10 pr-4 text-xs outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-slate-500 border-b border-white/5">
                  <th className="px-8 py-4">Filename</th>
                  <th className="px-8 py-4">Year</th>
                  <th className="px-8 py-4">Type</th>
                  <th className="px-8 py-4">Size/Records</th>
                  <th className="px-8 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {dataFiles.map((file, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-5 font-medium text-slate-200">{file.name}</td>
                    <td className="px-8 py-5">
                      <span className="bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded text-[10px] font-bold">
                        {file.year}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-slate-400 text-xs">{file.type}</td>
                    <td className="px-8 py-5 text-slate-400 text-xs">{file.records}</td>
                    <td className="px-8 py-5">
                      <button className="p-2 bg-indigo-500 rounded-lg text-white hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20">
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 flex items-start space-x-6">
            <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500">
              <Calendar size={32} />
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2">Ingestion Pipeline</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                All data is normalized using the TCPD format, including constituency mapping and party name cleaning. Total historical records: 150k+.
              </p>
              <button className="mt-4 text-indigo-400 text-xs font-bold flex items-center space-x-1 hover:text-indigo-300 transition-colors">
                <span>View Schema Documentation</span>
                <Database size={12} />
              </button>
            </div>
          </div>

          <div className="glass-panel p-8 flex items-start space-x-6">
            <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <Filter size={32} />
            </div>
            <div>
              <h4 className="text-xl font-bold mb-2">Backtesting Status</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Models are currently trained on GE 2014 & 2019 data. GE 2004/2009 data is being backtested for long-term swing analysis.
              </p>
              <div className="mt-4 flex items-center space-x-2">
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '85%' }} />
                </div>
                <span className="text-[10px] font-bold text-emerald-400">85%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Historical;
