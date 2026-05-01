import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Vote, TrendingUp, Users, MapPin, Loader2, Sparkles, ChevronRight, Activity, Zap, Info, Database } from 'lucide-react';
import StatCard from './StatCard';

const Dashboard = () => {
  const [state, setState] = useState('West Bengal');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const handlePredict = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 2500));
      setPrediction({
        seats: [
          { name: 'TMC', value: 165, color: '#6366f1' },
          { name: 'BJP', value: 110, color: '#f59e0b' },
          { name: 'INC+', value: 15, color: '#10b981' },
          { name: 'Others', value: 4, color: '#64748b' }
        ],
        probability: [
          { name: 'Stability', value: 78 },
          { name: 'Volatility', value: 22 }
        ],
        swing: [
          { month: 'Jan', value: 12 }, { month: 'Feb', value: 18 }, { month: 'Mar', value: 15 },
          { month: 'Apr', value: 25 }, { month: 'May', value: 32 }
        ]
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 space-y-10 animate-fade-in">
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Election Forecast <span className="text-indigo-500">Live</span>
          </h2>
          <p className="text-slate-400 text-lg">Real-time probabilistic analysis for legislative assembly cycles.</p>
        </div>

        <div className="glass-panel p-2 flex items-center space-x-2">
          {['West Bengal', 'Assam', 'Tamil Nadu', 'Kerala'].map((s) => (
            <button
              key={s}
              onClick={() => setState(s)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                state === s ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {s}
            </button>
          ))}
          <div className="w-[1px] h-8 bg-white/10 mx-2" />
          <button 
            onClick={handlePredict}
            disabled={loading}
            className="btn-premium flex items-center space-x-2 py-2.5"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
            <span>{loading ? 'Processing...' : 'Run Simulation'}</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Target Seats" value="294" icon={MapPin} color="indigo" />
        <StatCard title="Win Probability" value="78%" icon={TrendingUp} color="emerald" />
        <StatCard title="Voter Sentiment" value="Bullish" icon={Activity} color="amber" />
        <StatCard title="Data Points" value="1.2M+" icon={Database} color="rose" />
      </div>

      <AnimatePresence mode="wait">
        {!prediction ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel p-32 flex flex-col items-center justify-center text-center border-dashed border-white/10"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse" />
              <div className="relative w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center border border-white/10">
                <Sparkles size={48} className="text-indigo-400" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Neural Engine Standby</h3>
            <p className="text-slate-400 max-w-lg text-lg leading-relaxed">
              Our ensemble models are ready to ingest the latest polling and demographic data. Select a state above to initiate the Monte Carlo simulation engine.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            <div className="lg:col-span-8 glass-panel p-8">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-2xl font-bold text-white">Projected Seat Share</h3>
                  <p className="text-slate-500 text-sm mt-1">Based on 1,500 simulation iterations</p>
                </div>
                <div className="flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-500/20 text-xs font-bold uppercase tracking-widest">
                  <Activity size={14} />
                  <span>Live Feed</span>
                </div>
              </div>
              
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prediction.seats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#94a3b8" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 700 }}
                    />
                    <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px' }}
                    />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={50}>
                      {prediction.seats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className="glass-panel p-8 flex flex-col items-center justify-center relative overflow-hidden h-[300px]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                <h4 className="text-lg font-bold text-slate-400 mb-6 uppercase tracking-widest">Stability Index</h4>
                <div className="relative w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prediction.probability}
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={10}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill="#6366f1" />
                        <Cell fill="rgba(255,255,255,0.05)" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white">{prediction.probability[0].value}%</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Confidence</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-8 space-y-6">
                <div className="flex items-center space-x-3 text-indigo-400 font-bold text-sm uppercase tracking-wider">
                  <Info size={16} />
                  <span>Key Drivers</span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Rural Shift', val: '+4.2%' },
                    { label: 'Urban Hold', val: '-1.5%' },
                    { label: 'Swing Index', val: 'Strong' }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-slate-400 font-medium">{item.label}</span>
                      <span className="text-white font-bold">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-12 glass-panel p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">Sentiment Trajectory</h3>
                <div className="flex space-x-4 text-xs font-bold text-slate-500">
                  <span className="flex items-center space-x-1"><div className="w-2 h-2 rounded-full bg-indigo-500" /> <span>Positive</span></span>
                  <span className="flex items-center space-x-1"><div className="w-2 h-2 rounded-full bg-slate-700" /> <span>Base</span></span>
                </div>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={prediction.swing}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="month" stroke="#475569" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#6366f1" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorVal)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
