import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, TrendingDown, Minus, Clock, ExternalLink, Calendar, MessageSquareText } from 'lucide-react';

const Sentiment = () => {
  const [state, setState] = useState('West Bengal');
  const [news, setNews] = useState([]);

  const states = ['West Bengal', 'Assam', 'Tamil Nadu', 'Kerala'];

  const allNewsData = {
    'West Bengal': [
      { id: 1, title: "TMC Manifesto 2026: Focus on 'Lakhir Bhandar' expansion and rural industrialization", sentiment: "positive", score: 0.88, time: "Jan 2026", source: "The Telegraph" },
      { id: 2, title: "BJP highlights law and order issues in North Bengal rallies", sentiment: "negative", score: 0.32, time: "Feb 2026", source: "Times of India" },
      { id: 3, title: "Left-Congress alliance holds joint convention in Kolkata", sentiment: "neutral", score: 0.52, time: "Feb 2026", source: "Ganashakti" },
      { id: 4, title: "Sandeshkhali impact: Voters in rural blocks express mixed feelings", sentiment: "negative", score: 0.25, time: "Dec 2025", source: "NDTV" },
      { id: 5, title: "Election Commission identifies 5000+ sensitive booths in state", sentiment: "neutral", score: 0.45, time: "Mar 2026", source: "ANI" },
    ],
    'Assam': [
      { id: 6, title: "Assam CM: 1 Lakh jobs achieved, focus now on 'Atmanirbhar Assam'", sentiment: "positive", score: 0.90, time: "Jan 2026", source: "Assam Tribune" },
      { id: 7, title: "AIUDF and Congress spar over minority vote share in Barak Valley", sentiment: "negative", score: 0.35, time: "Feb 2026", source: "Sentinel" },
      { id: 8, title: "Delimitation process successfully implemented ahead of 2026 cycle", sentiment: "neutral", score: 0.60, time: "Nov 2025", source: "NorthEast Now" },
      { id: 9, title: "Tea garden workers' associations demand higher daily wages", sentiment: "neutral", score: 0.48, time: "Oct 2025", source: "EastMojo" },
    ],
    'Tamil Nadu': [
      { id: 10, title: "DMK's 'Stalin in Your Constituency' 2.0 receives massive response", sentiment: "positive", score: 0.85, time: "Jan 2026", source: "The Hindu" },
      { id: 11, title: "AIADMK manifesto promises 100% reservation for locals in private sector", sentiment: "positive", score: 0.72, time: "Feb 2026", source: "Dinakaran" },
      { id: 12, title: "NTK Seeman gains traction among first-time urban voters", sentiment: "neutral", score: 0.55, time: "Feb 2026", source: "DT Next" },
      { id: 13, title: "NEET exemption debate continues to polarize state narrative", sentiment: "neutral", score: 0.50, time: "Dec 2025", source: "News18 Tamil" },
    ],
    'Kerala': [
      { id: 14, title: "LDF highlights 'Kerala Model' of development in pre-election tour", sentiment: "positive", score: 0.82, time: "Jan 2026", source: "Malayala Manorama" },
      { id: 15, title: "UDF's 'Nyay' scheme promise aims to capture low-income vote", sentiment: "positive", score: 0.75, time: "Feb 2026", source: "Mathrubhumi" },
      { id: 16, title: "Anti-incumbency factors reported in silver-line rail project areas", sentiment: "negative", score: 0.28, time: "Nov 2025", source: "The News Minute" },
      { id: 17, title: "BJP targets Christian heartland in Central Kerala", sentiment: "neutral", score: 0.42, time: "Jan 2026", source: "Asianet News" },
    ]
  };

  useEffect(() => {
    setNews(allNewsData[state]);
  }, [state]);

  return (
    <div className="p-10 space-y-8 animate-fade-in">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Election Narrative & Sentiment</h2>
          <p className="text-slate-400">Contextual analysis of news impact for <span className="text-indigo-400 font-bold">{state}</span>.</p>
        </div>
        
        <div className="glass-panel p-1 flex items-center space-x-1">
          {states.map((s) => (
            <button
              key={s}
              onClick={() => setState(s)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                state === s ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {news.map((item) => (
            <motion.div 
              key={item.id}
              whileHover={{ x: 10 }}
              className="glass-panel p-6 flex items-start space-x-6 group"
            >
              <div className={`p-3 rounded-xl ${
                item.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400' :
                item.sentiment === 'negative' ? 'bg-rose-500/10 text-rose-400' :
                'bg-slate-500/10 text-slate-400'
              }`}>
                <MessageSquareText size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                  <span className="text-xs font-bold text-slate-500 uppercase flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>{item.time}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-3">
                  <span className="text-xs font-bold text-slate-400">{item.source}</span>
                  <div className="w-[1px] h-3 bg-white/10" />
                  <div className="flex items-center space-x-2">
                    {item.sentiment === 'positive' ? <TrendingUp size={14} className="text-emerald-400" /> :
                     item.sentiment === 'negative' ? <TrendingDown size={14} className="text-rose-400" /> :
                     <Minus size={14} className="text-slate-400" />}
                    <span className={`text-xs font-black uppercase ${
                      item.sentiment === 'positive' ? 'text-emerald-400' :
                      item.sentiment === 'negative' ? 'text-rose-400' :
                      'text-slate-400'
                    }`}>{item.sentiment} ({Math.round(item.score * 100)}%)</span>
                  </div>
                </div>
              </div>
              <ExternalLink size={18} className="text-slate-600 group-hover:text-white transition-colors" />
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-8">
            <h3 className="text-xl font-bold mb-6">Aggregate State Sentiment</h3>
            <div className="h-4 bg-slate-900 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500" style={{ width: '55%' }} />
              <div className="h-full bg-slate-700" style={{ width: '25%' }} />
              <div className="h-full bg-rose-500" style={{ width: '20%' }} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-6">
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Pos</p>
                <p className="text-lg font-black text-emerald-400">55%</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Neu</p>
                <p className="text-lg font-black text-slate-400">25%</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Neg</p>
                <p className="text-lg font-black text-rose-400">20%</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 bg-indigo-500/5 border-indigo-500/20">
            <h3 className="text-xl font-bold mb-4">Election Hotspots ({state})</h3>
            <div className="space-y-3">
              {['Manifesto Impact', 'Candidate Approval', 'Alliance Strength', 'Economic Outlook'].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                  <span className="text-xs text-slate-400">{item}</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div key={s} className={`w-1 h-3 rounded-full ${s <= 3 + (i % 2) ? 'bg-indigo-500' : 'bg-white/5'}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sentiment;
