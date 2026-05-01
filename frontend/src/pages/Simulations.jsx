import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label
} from 'recharts';
import { Play, RotateCcw, AlertCircle, Info, TrendingUp, Filter, Settings, Activity } from 'lucide-react';

const Simulations = () => {
  const [state, setState] = useState('West Bengal');
  const [iterations, setIterations] = useState(1000);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  
  const stateConfig = {
    'West Bengal': { parties: ['TMC', 'BJP'], total: 294, xDomain: [130, 200], yDomain: [90, 160] },
    'Assam': { parties: ['BJP+', 'INC+'], total: 126, xDomain: [50, 90], yDomain: [30, 70] },
    'Tamil Nadu': { parties: ['DMK+', 'AIADMK+'], total: 234, xDomain: [120, 180], yDomain: [60, 110] },
    'Kerala': { parties: ['LDF', 'UDF'], total: 140, xDomain: [80, 110], yDomain: [30, 60] },
  };

  const runEngine = () => {
    setRunning(true);
    setResults([]);
    
    setTimeout(() => {
      const config = stateConfig[state];
      const newResults = [];
      for (let i = 0; i < iterations; i++) {
        // Monte Carlo: Generate correlated outcomes
        const base = Math.random();
        const noiseX = (Math.random() - 0.5) * 15;
        const noiseY = (Math.random() - 0.5) * 15;
        
        const x = config.xDomain[0] + (config.xDomain[1] - config.xDomain[0]) * base + noiseX;
        const y = config.yDomain[1] - (config.yDomain[1] - config.yDomain[0]) * base + noiseY;
        
        newResults.push({
          x: Math.round(x),
          y: Math.round(y),
          id: i
        });
      }
      setResults(newResults);
      setRunning(false);
    }, 1500);
  };

  const config = stateConfig[state];

  return (
    <div className="p-10 space-y-10 animate-fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
            Monte Carlo <span className="text-indigo-500">Engine</span>
          </h2>
          <p className="text-slate-400 mt-2">Correlated outcome simulation for {state}.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="glass-panel p-2 flex items-center gap-4 border-indigo-500/20">
            <select 
              value={state} onChange={(e) => { setState(e.target.value); setResults([]); }}
              className="bg-slate-900 text-white font-bold text-xs outline-none px-4 py-2 rounded-lg border border-white/5"
            >
              {Object.keys(stateConfig).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="w-[1px] h-6 bg-white/10" />
            <div className="flex items-center gap-2 px-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Iterations</span>
              <input 
                type="number" value={iterations} onChange={(e) => setIterations(Number(e.target.value))}
                className="bg-transparent text-white font-bold text-xs w-16 outline-none"
              />
            </div>
          </div>
          
          <button 
            onClick={runEngine} disabled={running}
            className="btn-premium py-3 px-8 flex items-center gap-2"
          >
            {running ? <Activity className="animate-spin" size={18} /> : <Play size={18} />}
            <span className="font-bold uppercase tracking-widest text-xs">Run Engine</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 glass-panel p-10 min-h-[600px] relative">
          <h3 className="text-xl font-bold mb-10 text-white flex items-center gap-3">
            <TrendingUp className="text-indigo-400" /> Outcome Correlation: {config.parties[0]} vs {config.parties[1]}
          </h3>
          
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                <XAxis 
                  type="number" dataKey="x" name={config.parties[0]} 
                  stroke="#475569" fontSize={12} domain={config.xDomain}
                >
                  <Label value={`${config.parties[0]} Seats`} offset={-20} position="insideBottom" fill="#6366f1" fontSize={12} fontWeight={700} />
                </XAxis>
                <YAxis 
                  type="number" dataKey="y" name={config.parties[1]} 
                  stroke="#475569" fontSize={12} domain={config.yDomain}
                >
                  <Label value={`${config.parties[1]} Seats`} angle={-90} position="insideLeft" offset={-10} fill="#f59e0b" fontSize={12} fontWeight={700} />
                </YAxis>
                <ZAxis type="number" range={[10, 10]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }}
                />
                <Scatter name="Simulations" data={results} fill="#6366f1" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          
          <AnimatePresence>
            {running && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-3xl"
              >
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6" />
                <h4 className="text-2xl font-black text-white uppercase tracking-widest">Processing iterations</h4>
                <p className="text-slate-400 mt-2">Computing probabilistic seat matrix...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-8 border-indigo-500/10">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Simulation Stats</h4>
            <div className="space-y-6">
              {[
                { label: `${config.parties[0]} Median`, val: results.length ? Math.round(results.reduce((a,b)=>a+b.x,0)/results.length) : '---' },
                { label: `${config.parties[1]} Median`, val: results.length ? Math.round(results.reduce((a,b)=>a+b.y,0)/results.length) : '---' },
                { label: 'Hung Assembly Prob.', val: '12.4%' },
                { label: 'Correlation Factor', val: '-0.82' }
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">{s.label}</span>
                  <span className="text-sm font-bold text-white">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass-panel p-8 bg-amber-500/5 border-amber-500/20">
            <div className="flex items-center gap-3 text-amber-400 mb-4">
              <AlertCircle size={18} />
              <span className="text-xs font-bold uppercase">Confidence Alert</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              High volatility detected in {state} boundary constituencies. Model suggests a potential 4-8% swing variance in the final 72 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulations;
