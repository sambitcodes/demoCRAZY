import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { MapContainer, TileLayer, GeoJSON, Tooltip as MapTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Vote, TrendingUp, Users, MapPin, Loader2, Sparkles, Activity, Zap, 
  Info, Database, Calendar, Brain, Settings, Map, ChevronRight, Search,
  ArrowUpRight, ArrowDownRight, Layers, LayoutDashboard
} from 'lucide-react';
import StatCard from '../components/StatCard';
import axios from 'axios';

// State bounding boxes for map centering
const STATE_MAP_CONFIG = {
  'West Bengal': { center: [23.5, 87.8], zoom: 7 },
  'Assam':       { center: [26.2, 92.9], zoom: 7 },
  'Tamil Nadu':  { center: [11.1, 78.7], zoom: 7 },
  'Kerala':      { center: [10.5, 76.5], zoom: 7 },
};

const Overview = () => {
  const [state, setState] = useState('West Bengal');
  const [year, setYear] = useState(2026);
  const [model, setModel] = useState('ensemble');
  const [options, setOptions] = useState(['seats', 'probabilities', 'map', 'constituency']);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [selectedConstituency, setSelectedConstituency] = useState(null);
  const [stateGeoJSON, setStateGeoJSON] = useState(null);

  // Fetch India state GeoJSON for map on mount
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson')
      .then(r => r.json())
      .then(data => setStateGeoJSON(data))
      .catch(() => setStateGeoJSON(null));
  }, []);

  const handlePredict = async () => {
    setLoading(true);
    setPrediction(null);
    setSelectedConstituency(null);
    try {
      const backendUrl = `http://${window.location.hostname}:8000`;
      const response = await axios.post(`${backendUrl}/predict/seats`, {
        state,
        year,
        model_type: model,
        options
      }, { timeout: 15000 });
      if (response.data) {
        setPrediction(response.data);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTargetSeats = (s) => {
    const targets = { 'West Bengal': 294, 'Assam': 126, 'Tamil Nadu': 234, 'Kerala': 140 };
    return targets[s] || 0;
  };

  // Build a colour lookup: partyName -> color from current prediction
  const partyColorMap = {};
  if (prediction?.seats) {
    prediction.seats.forEach(p => { partyColorMap[p.name] = p.color; });
  }

  // Style function for GeoJSON layer – highlight the selected state
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
      {/* Legend note */}
      <p className="text-[10px] text-slate-600 mt-2 text-center">
        Map shows {state} highlighted. Regional hotspots and constituency markers are active in the focus panel →
      </p>
    </div>
  );

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
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="bg-slate-900 text-white font-bold text-sm outline-none px-4 py-2 rounded-lg border border-white/10"
          >
            {['West Bengal', 'Assam', 'Tamil Nadu', 'Kerala'].map(s => (
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
            <span>{loading ? 'Processing...' : 'Run Simulation'}</span>
          </button>
        </div>
      </section>

      {/* Stat cards — show --- until a simulation has run */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Seats" value={(prediction?.total_seats || getTargetSeats(state)).toString()} icon={MapPin} color="indigo" />
        <StatCard title="Leading Party" value={prediction?.leading_party ?? '---'} icon={TrendingUp} color="emerald" />
        <StatCard title="Mean Probability" value={prediction?.mean_probability != null ? `${prediction.mean_probability}%` : '---'} icon={Brain} color="purple" />
        <StatCard title="Swing Factor" value={prediction?.swing_factor != null ? `${prediction.swing_factor > 0 ? '+' : ''}${prediction.swing_factor}%` : '---'} icon={Activity} color="rose" />
        <StatCard title="Simulation ID" value={prediction?.simulation_id ?? '---'} icon={Database} color="blue" />
      </div>

      <AnimatePresence mode="wait">
        {!prediction ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-panel p-32 flex flex-col items-center justify-center text-center border-dashed border-white/10"
          >
            <LayoutDashboard size={64} className="text-slate-700 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">Awaiting Intelligence Feed</h3>
            <p className="text-slate-500">Select a state and click 'Run Simulation' to populate the analysis panels.</p>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">

            {/* Seat Distribution + Vote Share */}
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
                      <Tooltip />
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

            {/* Map + Constituency Focus */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7">
                {renderMap()}
              </div>

              <div className="lg:col-span-5 glass-panel p-8 flex flex-col h-[600px]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                    <Search className="text-indigo-400" /> Constituency Focus
                  </h3>
                  <span className="text-xs text-slate-500">{prediction.constituencies?.length} ACs</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                  {prediction.constituencies?.map(ac => (
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

                      {/* Expanded detail panel */}
                      <AnimatePresence>
                        {selectedConstituency?.id === ac.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pt-3 border-t border-white/10 space-y-2 overflow-hidden"
                          >
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-black/20 rounded-lg p-2 text-center">
                                <p className="text-[9px] text-slate-500 uppercase mb-1">Confidence</p>
                                <p className="text-lg font-black text-white">{ac.prob}%</p>
                              </div>
                              <div className="bg-black/20 rounded-lg p-2 text-center">
                                <p className="text-[9px] text-slate-500 uppercase mb-1">Swing</p>
                                <p className={`text-lg font-black ${ac.swing > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {ac.swing > 0 ? '+' : ''}{ac.swing}%
                                </p>
                              </div>
                            </div>
                            <div className="bg-black/20 rounded-lg p-2 flex justify-between items-center">
                              <span className="text-xs text-slate-400">Projected Winner</span>
                              <span className="text-xs font-black px-2 py-0.5 rounded" style={{ backgroundColor: `${ac.color}25`, color: ac.color }}>
                                {ac.winner}
                              </span>
                            </div>
                            <div className="bg-black/20 rounded-lg p-2 flex justify-between items-center">
                              <span className="text-xs text-slate-400">Status</span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                ac.prob >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                              }`}>{ac.prob >= 80 ? 'Safe' : 'Marginal'}</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Model Comparison Table */}
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
                              m.status === 'Optimal' || m.status === 'Stable' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
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
