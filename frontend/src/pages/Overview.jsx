import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line
} from 'recharts';
import { 
  Vote, TrendingUp, Users, MapPin, Loader2, Sparkles, Activity, Zap, 
  Info, Database, Calendar, Brain, Settings, Map, ChevronRight, Search,
  ArrowUpRight, ArrowDownRight, Layers, LayoutDashboard
} from 'lucide-react';
import StatCard from '../components/StatCard';
import axios from 'axios';

const Overview = () => {
  const [state, setState] = useState('West Bengal');
  const [year, setYear] = useState(2026);
  const [model, setModel] = useState('ensemble');
  const [options, setOptions] = useState(['seats', 'probabilities', 'map', 'constituency']);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [selectedConstituency, setSelectedConstituency] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);

  const handlePredict = async () => {
    setLoading(true);
    setPrediction(null); // Clear stale data immediately
    try {
      const backendUrl = `http://${window.location.hostname}:8000`;
      console.log(`Fetching prediction for ${state}...`);
      const response = await axios.post(`${backendUrl}/predict/seats`, {
        state: state,
        year: year,
        model_type: model,
        options: options
      }, { timeout: 15000 });
      
      if (response.data) {
        setPrediction(response.data);
        console.log("Prediction received:", response.data);
      }
    } catch (err) {
      console.error("Simulation error:", err);
      // Optional: Add a simple error state if needed
    } finally {
      setLoading(false);
    }
  };

  // Remove automatic fetch to withhold results until explicit simulation
  // useEffect(() => {
  //   handlePredict();
  // }, [state]);

  const getTargetSeats = (s) => {
    const targets = { 'West Bengal': 294, 'Assam': 126, 'Tamil Nadu': 234, 'Kerala': 140 };
    return targets[s] || 0;
  };

  const renderMap = () => {
    // High-fidelity simplified paths for the four states
    const statePaths = {
      'West Bengal': "M180,20 L200,40 L190,80 L220,120 L200,160 L240,180 L220,240 L180,260 L140,300 L120,380 L80,350 L100,280 L60,240 L80,180 L40,140 L80,100 L120,80 Z",
      'Assam': "M20,150 L100,120 L200,130 L350,150 L380,200 L320,250 L200,280 L100,260 L20,200 Z",
      'Tamil Nadu': "M150,150 L250,180 L280,250 L250,350 L200,380 L120,350 L100,250 L120,180 Z",
      'Kerala': "M100,150 L130,180 L140,250 L120,380 L80,360 L70,280 L80,200 Z"
    };

    return (
      <div className="glass-panel p-8 relative overflow-hidden h-[500px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Map className="text-indigo-400" /> {state} Forecast Map
          </h3>
          <div className="flex gap-2">
            {prediction?.seats?.map(p => (
              <div key={p.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                <span className="text-[10px] font-bold text-slate-500 uppercase">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative h-full flex items-center justify-center">
          <svg viewBox="0 0 400 400" className="w-full h-full max-w-[400px]">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <motion.path
              d={statePaths[state] || statePaths['West Bengal']}
              fill="rgba(99, 102, 241, 0.05)"
              stroke="#6366f1"
              strokeWidth={1.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            {/* Interactive Constituency Points distributed within the state shape */}
            {prediction?.constituencies?.map((ac, i) => {
              // Stable coordinate mapping
              const coords = [
                {x: 180, y: 100}, {x: 220, y: 150}, {x: 160, y: 200}, 
                {x: 240, y: 220}, {x: 190, y: 280}, {x: 130, y: 320},
                {x: 100, y: 250}, {x: 200, y: 50}, {x: 280, y: 180},
                {x: 150, y: 150}, {x: 210, y: 340}, {x: 80, y: 300}
              ];
              const {x, y} = coords[i] || {x: 200, y: 200};
              
              return (
                <motion.g 
                  key={ac.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <circle
                    cx={x} cy={y} r={hoveredRegion === ac.id ? 10 : 7}
                    fill={ac.color}
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredRegion(ac.id)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    filter={hoveredRegion === ac.id ? "url(#glow)" : "none"}
                  />
                  {hoveredRegion === ac.id && (
                    <circle cx={x} cy={y} r={16} fill="none" stroke={ac.color} strokeWidth={1} className="animate-ping" />
                  )}
                </motion.g>
              );
            })}
          </svg>

          {hoveredRegion !== null && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute bottom-6 right-6 glass-panel p-5 z-20 min-w-[240px] border-indigo-500/50 shadow-2xl"
            >
              {(() => {
                const ac = prediction?.constituencies?.find(c => c.id === hoveredRegion);
                return (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Projection</span>
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    </div>
                    <h4 className="text-lg font-black text-white mb-1">{ac?.name}</h4>
                    <p className="text-[10px] text-slate-500 uppercase mb-4">AC Index: #AC-{ac?.id + 100}</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-xs text-slate-400">Leading</span>
                        <span className="text-xs font-black px-2 py-0.5 rounded" style={{ backgroundColor: `${ac?.color}20`, color: ac?.color }}>{ac?.winner}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-xs text-slate-400">Confidence</span>
                        <span className="text-xs font-bold text-white">{ac?.prob}%</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs text-slate-400">Projected Swing</span>
                        <span className={`text-xs font-bold ${ac?.swing > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {ac?.swing > 0 ? '+' : ''}{ac?.swing}%
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-10 space-y-10 animate-fade-in">
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-white mb-2 uppercase">
            Platform <span className="text-indigo-500">Summary</span>
          </h2>
          <p className="text-slate-400 text-lg">Comprehensive electoral intelligence and predictive diagnostics.</p>
        </div>

        <div className="glass-panel p-2 flex flex-wrap items-center gap-4">
          <select 
            value={state} onChange={(e) => { setState(e.target.value); }}
            className="bg-slate-900 text-white font-bold text-sm outline-none px-4 py-2 rounded-lg border border-white/10"
          >
            {['West Bengal', 'Assam', 'Tamil Nadu', 'Kerala'].map(s => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
          </select>
          <div className="w-[1px] h-8 bg-white/10" />
          <button 
            onClick={handlePredict} disabled={loading}
            className="btn-premium flex items-center space-x-2 py-2.5 px-6"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
            <span>{loading ? 'Processing...' : 'Run Simulation'}</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Seats" value={(prediction?.total_seats || getTargetSeats(state)).toString()} icon={MapPin} color="indigo" />
        <StatCard title="Leading Party" value={prediction?.leading_party || "---"} icon={TrendingUp} color="emerald" />
        <StatCard title="Mean Probability" value={prediction?.mean_probability ? `${prediction.mean_probability}%` : "---"} icon={Brain} color="purple" />
        <StatCard title="Swing Factor" value={prediction?.swing_factor !== undefined ? `${prediction.swing_factor > 0 ? '+' : ''}${prediction.swing_factor}%` : "---"} icon={Activity} color="rose" />
        <StatCard title="Simulation ID" value={prediction?.simulation_id || prediction?.simulation_id || "---"} icon={Database} color="blue" />
      </div>

      <AnimatePresence mode="wait">
        {!prediction ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-panel p-32 flex flex-col items-center justify-center text-center border-dashed border-white/10"
          >
            <LayoutDashboard size={64} className="text-slate-700 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">Awaiting Intelligence Feed</h3>
            <p className="text-slate-500">Select a state and click 'Run Simulation' to populate the analysis panels.</p>
          </motion.div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 glass-panel p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold uppercase tracking-widest text-slate-400">Seat Distribution</h3>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">95% Confidence</span>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prediction.seats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" stroke="#475569" fontSize={12} axisLine={false} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={12} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px' }} />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                        {prediction?.seats?.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-4 glass-panel p-8 flex flex-col items-center justify-center">
                <h3 className="text-xl font-bold uppercase tracking-widest text-slate-400 mb-8">Vote Share %</h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={prediction.seats} dataKey="vote_share" nameKey="name" 
                        cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5}
                      >
                        {prediction?.seats?.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                  {prediction?.seats?.map(p => (
                    <div key={p.name} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <span className="text-xs text-slate-500">{p.name}</span>
                      <span className="text-xs font-bold text-white">{p.vote_share}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7">
                {renderMap()}
              </div>

              <div className="lg:col-span-5 glass-panel p-8 flex flex-col h-[600px]">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                    <Search className="text-indigo-400" /> Constituency Focus
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {prediction?.constituencies?.map(ac => (
                    <motion.div 
                      key={ac.id} whileHover={{ x: 5 }}
                      onClick={() => setSelectedConstituency(ac)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedConstituency?.id === ac.id ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-white">{ac.name}</h4>
                          <span className="text-[10px] text-slate-500 uppercase">AC Code: #{ac.id + 100}</span>
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded ${
                          ac.swing > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {ac.swing > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          {Math.abs(ac.swing).toFixed(1)}% Swing
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Winner: <span className="font-bold" style={{ color: ac.color }}>{ac.winner}</span></span>
                        <span className="text-slate-400">Prob: <span className="text-indigo-400 font-bold">{ac.prob}%</span></span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-12 glass-panel p-8">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                  <Layers className="text-indigo-400" /> Model Side-by-Side Comparison
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="pb-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Model Engine</th>
                        <th className="pb-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Predicted Winner</th>
                        <th className="pb-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Confidence Score</th>
                        <th className="pb-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {prediction?.model_comparison?.map((m, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 text-sm font-bold text-white">{m.model}</td>
                          <td className="py-4 text-sm font-bold text-indigo-400">{m.winner}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${m.confidence}%` }} />
                              </div>
                              <span className="text-xs text-white">{m.confidence}%</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                              m.status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                            }`}>
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Overview;
