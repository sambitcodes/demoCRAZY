import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Newspaper, TrendingUp, TrendingDown, Minus, Clock, 
  ExternalLink, Calendar, MessageSquareText, MapPin, Target, Zap,
  Activity, Loader2, RefreshCw, AlertCircle
} from 'lucide-react';
import axios from 'axios';

const Sentiment = () => {
  const [state, setState] = useState('West Bengal');
  const [news, setNews] = useState([]);
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState(null);

  const states = ['West Bengal', 'Assam', 'Tamil Nadu', 'Kerala'];

  const fetchData = async (s = state) => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = `http://${window.location.hostname}:8000`;
      const response = await axios.get(`${backendUrl}/sentiment?state=${encodeURIComponent(s)}`);
      const data = response.data;
      setSentimentData(data);
      setNews(data.news || []);
    } catch (err) {
      console.error('Error fetching sentiment data:', err);
      setError('Could not load sentiment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(state);
  }, [state]);

  const handleScrape = async () => {
    setScraping(true);
    setError(null);
    try {
      const backendUrl = `http://${window.location.hostname}:8000`;
      await axios.post(`${backendUrl}/scrape?state=${encodeURIComponent(state)}`);
      await fetchData(state);
    } catch (err) {
      console.error('Error scraping data:', err);
      setError('Scrape failed. Showing cached data.');
      await fetchData(state);
    } finally {
      setScraping(false);
    }
  };

  const SentimentIcon = ({ sentiment }) => {
    if (sentiment === 'Positive') return <TrendingUp size={14} className="text-emerald-400" />;
    if (sentiment === 'Negative') return <TrendingDown size={14} className="text-rose-400" />;
    return <Minus size={14} className="text-slate-400" />;
  };

  const sentimentColor = (s) => {
    if (s === 'Positive') return 'text-emerald-400';
    if (s === 'Negative') return 'text-rose-400';
    return 'text-slate-400';
  };

  const sentimentBg = (s) => {
    if (s === 'Positive') return 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.08)]';
    if (s === 'Negative') return 'bg-rose-500/10 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.08)]';
    return 'bg-slate-500/10 text-slate-400';
  };

  return (
    <div className="p-10 space-y-8 animate-fade-in">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tight">
            Electoral <span className="text-indigo-500">Sentiment</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Live narrative intelligence for{' '}
            <span className="text-white font-bold">{state}</span>.
          </p>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <button 
            onClick={handleScrape}
            disabled={loading || scraping}
            className="glass-panel p-2.5 px-5 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 border-white/10 hover:border-indigo-500/30 transition-all disabled:opacity-50"
          >
            {scraping
              ? <Loader2 size={14} className="animate-spin" />
              : <Zap size={14} className="text-amber-400" />}
            {scraping ? 'Scraping Live Data...' : 'Scrape Live Sentiment'}
          </button>
          
          <div className="glass-panel p-1.5 flex items-center bg-black/20 flex-wrap gap-1">
            {states.map((s) => (
              <button
                key={s}
                onClick={() => setState(s)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  state === s
                    ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* News Feed */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Newspaper size={18} /> Sentiment-Driving Headlines
            </h3>
            {loading && <Loader2 className="animate-spin text-indigo-500" size={18} />}
          </div>

          <AnimatePresence mode="wait">
            {loading && news.length === 0 ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-panel p-6 animate-pulse">
                    <div className="h-4 bg-slate-700 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-slate-800 rounded w-1/2" />
                  </div>
                ))}
              </motion.div>
            ) : news.length > 0 ? (
              <motion.div key="news" className="space-y-4">
                {news.map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ x: 8, backgroundColor: 'rgba(255,255,255,0.03)' }}
                    className="glass-panel p-6 flex items-start space-x-5 group border-transparent hover:border-indigo-500/30 transition-all cursor-pointer"
                    onClick={() => item.url && window.open(item.url, '_blank')}
                  >
                    <div className={`p-4 rounded-2xl flex-shrink-0 ${sentimentBg(item.sentiment)}`}>
                      <MessageSquareText size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                          {item.title}
                        </h4>
                        <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 whitespace-nowrap flex-shrink-0">
                          <Calendar size={11} />
                          {item.time}
                        </span>
                      </div>
                      {item.summary && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{item.summary}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-3">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Target size={11} /> {item.source}
                        </span>
                        <div className="w-[1px] h-3 bg-white/10" />
                        <div className="flex items-center space-x-1.5">
                          <SentimentIcon sentiment={item.sentiment} />
                          <span className={`text-xs font-black uppercase tracking-wider ${sentimentColor(item.sentiment)}`}>
                            {item.sentiment}
                          </span>
                          {item.sentiment_score !== undefined && (
                            <span className="text-[10px] text-slate-600 ml-1">
                              ({item.sentiment_score > 0 ? '+' : ''}{item.sentiment_score})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {item.url && (
                      <ExternalLink size={16} className="text-slate-600 group-hover:text-white transition-colors mt-1 flex-shrink-0" />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-panel p-12 text-center text-slate-500 flex flex-col items-center gap-3"
              >
                <Newspaper size={40} className="text-slate-700" />
                <p>No recent news detected. Click <strong className="text-white">Scrape Live Sentiment</strong> to fetch latest articles.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Analytics */}
        <div className="lg:col-span-4 space-y-6">
          {/* Aggregate Sentiment */}
          <div className="glass-panel p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Activity size={20} className="text-indigo-400" /> Aggregate Sentiment
            </h3>
            {sentimentData ? (
              <>
                <div className="h-6 bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
                  <motion.div 
                    key={`pos-${state}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${sentimentData.aggregate.positive}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400" 
                  />
                  <motion.div 
                    key={`neu-${state}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${sentimentData.aggregate.neutral}%` }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="h-full bg-slate-700" 
                  />
                  <motion.div 
                    key={`neg-${state}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${sentimentData.aggregate.negative}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-rose-400 to-rose-600" 
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-6">
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
                {sentimentData.last_scraped && (
                  <p className="text-[10px] text-slate-600 mt-4 text-center flex items-center justify-center gap-1">
                    <Clock size={10} /> Last updated: {sentimentData.last_scraped}
                  </p>
                )}
              </>
            ) : (
              <div className="text-slate-600 text-sm italic text-center py-4">Loading sentiment data...</div>
            )}
          </div>

          {/* Election Hotspots */}
          <div className="glass-panel p-8 bg-indigo-500/5 border-indigo-200/10">
            <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
              <MapPin size={20} className="text-indigo-400" /> Election Hotspots
            </h3>
            <div className="space-y-3">
              {sentimentData?.hotspots?.length > 0 ? (
                sentimentData.hotspots.map((spot, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-black/20 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-white">{spot.location}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{spot.mentions.toLocaleString()} Mentions</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      spot.sentiment === 'Positive' ? 'text-emerald-400 bg-emerald-500/10' :
                      spot.sentiment === 'Negative' ? 'text-rose-400 bg-rose-500/10' :
                      'text-indigo-400 bg-indigo-500/10'
                    }`}>{spot.sentiment}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-600 text-sm italic text-center py-4">No hotspot data yet.</div>
              )}
            </div>
          </div>

          {/* Key Topic Scores */}
          <div className="glass-panel p-8">
            <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
              <Zap size={20} className="text-amber-400" /> Key Topic Scores
            </h3>
            <div className="space-y-5">
              {sentimentData?.trends?.length > 0 ? (
                sentimentData.trends.map((trend, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                      <span>{trend.topic}</span>
                      <span className={trend.score >= 70 ? 'text-emerald-400' : trend.score >= 45 ? 'text-amber-400' : 'text-rose-400'}>
                        {trend.score}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <motion.div 
                        key={`${state}-${trend.topic}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${trend.score}%` }}
                        transition={{ duration: 0.7, delay: i * 0.1 }}
                        className={`h-full rounded-full ${
                          trend.score >= 70 ? 'bg-emerald-500' : trend.score >= 45 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-600 text-sm italic">No topic data yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sentiment;
