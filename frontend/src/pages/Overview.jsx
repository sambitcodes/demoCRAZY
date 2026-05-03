import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  TrendingUp, MapPin, Loader2, Activity, Zap, 
  Database, Brain, Map, Search,
  ArrowUpRight, ArrowDownRight, Layers, LayoutDashboard
} from 'lucide-react';
import StatCard from '../components/StatCard';
import axios from 'axios';

// Constant seat totals — never change regardless of simulation
const TOTAL_SEATS = {
  'West Bengal': 294,
  'Assam': 126,
  'Tamil Nadu': 234,
  'Kerala': 140,
};

const STATE_MAP_CONFIG = {
  'West Bengal': { center: [23.5, 87.8], zoom: 7 },
  'Assam':       { center: [26.2, 92.9], zoom: 7 },
  'Tamil Nadu':  { center: [11.1, 78.7], zoom: 7 },
  'Kerala':      { center: [10.5, 76.5], zoom: 7 },
};

const ALL_STATES = ['West Bengal', 'Assam', 'Tamil Nadu', 'Kerala'];

const Overview = () => {
  const [state, setState] = useState('West Bengal');
  const [year] = useState(2026);
  const [model] = useState('ensemble');
  const [options] = useState(['seats', 'probabilities', 'map', 'constituency']);
  const [loading, setLoading] = useState(false);

  // Per-state predictions map: { 'West Bengal': {...data}, 'Kerala': {...data}, ... }
  const [predictions, setPredictions] = useState({});
  const [selectedConstituency, setSelectedConstituency] = useState(null);
  const [stateGeoJSON, setStateGeoJSON] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // The prediction for the *currently selected* state (null if not yet simulated)
  const prediction = predictions[state] ?? null;

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson')
      .then(r => r.json())
      .then(data => setStateGeoJSON(data))
      .catch(() => setStateGeoJSON(null));
  }, []);

  const handleStateChange = (newState) => {
    setState(newState);
    setSelectedConstituency(null);
  };

  const handlePredict = async () => {
    setLoading(true);
    setSelectedConstituency(null);
    setPredictions(prev => ({ ...prev, [state]: null }));
    try {
      const backendUrl = `http://${window.location.hostname}:8000`;
      const response = await axios.post(`${backendUrl}/predict/seats`, {
        state,
        year,
        model_type: model,
        options,
      }, { timeout: 15000 });
      if (response.data) {
        setPredictions(prev => ({ ...prev, [state]: response.data }));
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const partyColorMap = {};
  if (prediction?.seats) {
    prediction.seats.forEach(p => { partyColorMap[p.name] = p.color; });
  }

  const geoJSONStyle = (feature) => {
    const name = feature.properties.NAME_1 || feature.properties.ST_NM || '';
    const isSelected = name === state;
    return {
      fillColor: isSelected ? '#6366f1' : '#1e293b',
      fillOpacity: isSelected ? 0.55 : 0.3,
      color: isSelected ? '#818cf8' : '#334155',
      weight: isSelected ? 2 : 1,
    };
  };

  const mapConfig = STATE_MAP_CONFIG[state] || { center: [22, 80], zoom: 5 };

  const renderMap = () => (
    <div className="glass-panel p-8 relative overflow-hidden h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Map className="text-indigo-400" /> {state} Constituency Map
        </h3>
        <div className="flex gap-2 flex-wrap">
          {prediction?.seats?.map(p => (
            <div key={p.name} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
              <span className="text-[10px] font-bold text-slate-400 uppercase">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="h-[400px] rounded-xl overflow-hidden">
        <MapContainer
          key={state}
          center={mapConfig.center}
          zoom={mapConfig.zoom}
          style={{ height: '100%', width: '100%', background: '#0f172a' }}
          zoomControl={true}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {stateGeoJSON && (
            <GeoJSON
              key={state + JSON.stringify(partyColorMap)}
              data={stateGeoJSON}
              style={geoJSONStyle}
            />
          )}
        </MapContainer>
      </div>
      <p className="text-[10px] text-slate-600 mt-2 text-center">
        Map shows {state} highlighted. Regional hotspots and constituency details are active in the focus panel →
      </p>
    </div>
  );

  const simulatedStates = Object.keys(predictions).filter(s => predictions[s] !== null);

  return (
    <div className="p-10 space-y-10 animate-fade-in">
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-1 uppercase">
            Platform <span className="text-indigo-500">Summary</span>
          </h2>
          <p className="text-slate-400 text-sm font-medium">Comprehensive electoral intelligence and predictive diagnostics.</p>
          {simulatedStates.length > 0 && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10px] text-slate-600 uppercase tracking-widest">Simulated:</span>
              {simulatedStates.map(s => (
                <button
                  key={s}
                  onClick={() => handleStateChange(s)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                    s === state
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                      : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel p-2 flex flex-wrap items-center gap-4">
          <select
            value={state}
            onChange={(e) => handleStateChange(e.target.value)}
            className="bg-slate-900 text-white font-bold text-sm outline-none px-4 py-2 rounded-lg border border-white/10"
          >
            {ALL_STATES.map(s => (
              <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
            ))}
          </select>
          <div className="w-[1px] h-8 bg-white/10" />
          <button
            onClick={handlePredict}
            disabled={loading}
            className="btn-premium flex items-center space-x-2 py-2.5 px-6"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
            <span>{loading ? 'Processing...' : `Run Simulation`}</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Total Seats" 
          value={(prediction?.total_seats || TOTAL_SEATS[state] || 0).toString()} 
          icon={MapPin} 
          color="indigo" 
        />
        <StatCard 
          title="Leading Party" 
          value={prediction?.leading_party ?? '---'} 
          icon={TrendingUp} 
          color="emerald" 
        />
        <StatCard 
          title="Mean Probability" 
          value={prediction?.mean_probability != null ? `${prediction.mean_probability}%` : '---'} 
          icon={Brain} 
          color="purple" 
        />
        <StatCard 
          title="Swing Factor" 
          value={prediction?.swing_factor != null ? `${prediction.swing_factor > 0 ? '+' : ''}${prediction.swing_factor}%` : '---'} 
          icon={Activity} 
          color="rose" 
        />
        <StatCard 
          title="Simulation ID" 
          value={prediction?.simulation_id ?? '---'} 
          icon={Database} 
          color="blue" 
        />
      </div>

      <AnimatePresence mode="wait">
        {!prediction ? (
          <motion.div
            key={`empty-${state}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-panel p-32 flex flex-col items-center justify-center text-center border-dashed border-white/10"
          >
            <LayoutDashboard size={64} className="text-slate-700 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">
              No simulation yet for {state}
            </h3>
            <p className="text-slate-500">
              Click <span className="text-indigo-400 font-semibold">Run Simulation</span> to generate results for this state.
              {simulatedStates.filter(s => s !== state).length > 0 && (
                <span className="block mt-1 text-slate-600">
                  Other simulated states: {simulatedStates.filter(s => s !== state).join(', ')}
                </span>
              )}
            </p>
          </motion.div>
        ) : (
          <motion.div key={`results-${state}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 glass-panel p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold uppercase tracking-widest text-slate-400">
                    Seat Distribution — {state}
                  </h3>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    {prediction.simulation_id}
                  </span>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prediction.seats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" stroke="#475569" fontSize={12} axisLine={false} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={12} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                        contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                      />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                        {prediction.seats.map((e, i) => <Cell key={i} fill={e.color} />)}
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
                        {prediction.seats.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                  {prediction.seats.map(p => (
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                    <Search className="text-indigo-400" /> Constituency Focus
                  </h3>
                  <div className="relative group">
                    <input 
                      type="text"
                      placeholder="Search AC or Candidate..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 pl-8 text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition-all w-48 focus:w-64"
                    />
                    <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {prediction.constituencies?.filter(ac => 
                    ac.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    ac.candidate.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map(ac => (
                    <motion.div
                      key={ac.id}
                      whileHover={{ x: 4 }}
                      onClick={() => setSelectedConstituency(prev => prev?.id === ac.id ? null : ac)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedConstituency?.id === ac.id
                          ? 'bg-indigo-500/10 border-indigo-500/40'
                          : 'bg-white/5 border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-white text-sm">{ac.name}</h4>
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

                      <AnimatePresence>
                        {selectedConstituency?.id === ac.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-white/10 space-y-4 overflow-hidden"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Lead Candidate</p>
                                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                                  <Users size={14} className="text-indigo-400" /> {ac.candidate}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Focus Group</p>
                                <p className="text-[10px] font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded-full">{ac.demographic}</p>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex justify-between items-end">
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Victory Margin</p>
                                <p className="text-xs font-black text-white">{ac.margin.toLocaleString()} votes</p>
                              </div>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(ac.margin / 50000) * 100}%` }}
                                  className="h-full bg-indigo-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-black/20 rounded-lg p-3 text-center border border-white/5">
                                <p className="text-[9px] text-slate-500 uppercase mb-1 font-bold">Confidence</p>
                                <p className="text-xl font-black text-white">{ac.prob}%</p>
                              </div>
                              <div className="bg-black/20 rounded-lg p-3 text-center border border-white/5">
                                <p className="text-[9px] text-slate-500 uppercase mb-1 font-bold">Swing</p>
                                <p className={`text-xl font-black ${ac.swing > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {ac.swing > 0 ? '+' : ''}{ac.swing}%
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button className="flex-1 bg-indigo-500 text-white text-[10px] font-black uppercase py-2 rounded-lg hover:bg-indigo-600 transition-colors">
                                Detailed Analysis
                              </button>
                              <button className="flex-1 bg-white/10 text-white text-[10px] font-black uppercase py-2 rounded-lg hover:bg-white/20 transition-colors">
                                Historical
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
                      {prediction.model_comparison?.map((m, i) => (
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
                              m.status === 'Stable' || m.status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Overview;
