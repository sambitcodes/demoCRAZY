import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Newspaper, TrendingUp, TrendingDown, Minus, Clock, 
  ExternalLink, Calendar, MessageSquareText, MapPin, Target, Zap,
  Activity, Loader2
} from 'lucide-react';
import axios from 'axios';

const Sentiment = () => {
  const [state, setState] = useState('West Bengal');
  const [news, setNews] = useState([]);
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(false);

  const states = ['West Bengal', 'Assam', 'Tamil Nadu', 'Kerala'];



  const fetchData = async () => {
    setLoading(true);
    try {
      const backendUrl = `http://${window.location.hostname}:8000`;
      const response = await axios.get(`${backendUrl}/sentiment?state=${state}`);
      setSentimentData(response.data);
      // Use backend news if available, fallback to empty
      setNews(response.data.news || []);
    } catch (err) {
      console.error("Error fetching sentiment data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [state]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const backendUrl = `http://${window.location.hostname}:8000`;
      // Call the scrape endpoint first
      await axios.post(`${backendUrl}/scrape?state=${state}`);
      // Then fetch updated data
      await fetchData();
    } catch (err) {
      console.error("Error scraping data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 space-y-8 animate-fade-in">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">
            Electoral <span className="text-indigo-500">Sentiment</span>
          </h2>
          <p className="text-slate-400 text-lg">Contextual analysis of narrative shifts in <span className="text-white font-bold">{state}</span>.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleRefresh} disabled={loading}
            className="glass-panel p-2.5 px-5 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 border-white/10 hover:border-indigo-500/30 transition-all"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} className="text-amber-400" />}
            {loading ? 'Refreshing Intelligence...' : 'Scrape Live Sentiment'}
          </button>
          
          <div className="glass-panel p-1.5 flex items-center bg-black/20">
            {states.map((s) => (
              <button
                key={s}
                onClick={() => setState(s)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  state === s ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* News Feed */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Newspaper size={18} /> Major Headlines
            </h3>
            {loading && <Loader2 className="animate-spin text-indigo-500" />}
          </div>
          {news.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ x: 10, backgroundColor: "rgba(255,255,255,0.03)" }}
              className="glass-panel p-6 flex items-start space-x-6 group border-transparent hover:border-indigo-500/30 transition-all"
            >
              <div className={`p-4 rounded-2xl ${
                item.sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' :
                item.sentiment === 'Negative' ? 'bg-rose-500/10 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]' :
                'bg-slate-500/10 text-slate-400 shadow-[0_0_15px_rgba(100,116,139,0.1)]'
              }`}>
                <MessageSquareText size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors leading-snug">{item.title}</h4>
                  <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 whitespace-nowrap ml-4">
                    <Calendar size={12} />
                    <span>{item.time}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-4">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Target size={12} /> {item.source}
                  </span>
                  <div className="w-[1px] h-3 bg-white/10" />
                  <div className="flex items-center space-x-2">
                    {item.sentiment === 'Positive' ? <TrendingUp size={14} className="text-emerald-400" /> :
                     item.sentiment === 'Negative' ? <TrendingDown size={14} className="text-rose-400" /> :
                     <Minus size={14} className="text-slate-400" />}
                    <span className={`text-xs font-black uppercase tracking-wider ${
                      item.sentiment === 'Positive' ? 'text-emerald-400' :
                      item.sentiment === 'Negative' ? 'text-rose-400' :
                      'text-slate-400'
                    }`}>{item.sentiment}</span>
                  </div>
                </div>
              </div>
              <ExternalLink size={18} className="text-slate-600 group-hover:text-white transition-colors mt-1" />
            </motion.div>
          ))}
          {news.length === 0 && !loading && (
            <div className="glass-panel p-12 text-center text-slate-500">
              No recent news detected for this region.
            </div>
          )}
        </div>

        {/* Sidebar Analytics */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-8">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <Activity size={20} className="text-indigo-400" /> Aggregate Sentiment
            </h3>
            {sentimentData && (
              <>
                <div className="h-6 bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${sentimentData.aggregate.positive}%` }}
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400" 
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${sentimentData.aggregate.neutral}%` }}
                    className="h-full bg-slate-700" 
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${sentimentData.aggregate.negative}%` }}
                    className="h-full bg-gradient-to-r from-rose-400 to-rose-600" 
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-8">
                  <div className="text-center p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Positive</p>
                    <p className="text-2xl font-black text-emerald-400">{sentimentData.aggregate.positive}%</p>
                  </div>
                  <div className="text-center p-3 bg-slate-500/5 rounded-xl border border-slate-500/10">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Neutral</p>
                    <p className="text-2xl font-black text-slate-300">{sentimentData.aggregate.neutral}%</p>
                  </div>
                  <div className="text-center p-3 bg-rose-500/5 rounded-xl border border-rose-500/10">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Negative</p>
                    <p className="text-2xl font-black text-rose-400">{sentimentData.aggregate.negative}%</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="glass-panel p-8 bg-indigo-500/5 border-indigo-200/10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-indigo-400" /> Election Hotspots
            </h3>
            <div className="space-y-4">
              {sentimentData?.hotspots.map((spot, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-black/20 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-white">{spot.location}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{spot.mentions.toLocaleString()} Mentions</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    spot.sentiment === 'Positive' ? 'text-emerald-400 bg-emerald-500/10' : 'text-indigo-400 bg-indigo-500/10'
                  }`}>{spot.sentiment}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Zap size={20} className="text-amber-400" /> Key Topic Scores
            </h3>
            <div className="space-y-5">
              {sentimentData?.trends?.map((trend, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                    <span>{trend.topic}</span>
                    <span>{trend.score}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${trend.score}%` }}
                      className="h-full bg-indigo-500"
                    />
                  </div>
                </div>
              ))}
              {!sentimentData && !loading && <div className="text-slate-600 text-sm italic">Run simulation for scores...</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default Sentiment;
