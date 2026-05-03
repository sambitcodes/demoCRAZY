import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Users, TrendingUp, MapPin, Activity, 
  Shield, Zap, History, Download, Share2, Info
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import axios from 'axios';

const ConstituencyDetail = () => {
  const { state, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        // Read parameters passed from the main dashboard
        const candidate = searchParams.get('candidate') || "Local Candidate";
        const winner = searchParams.get('winner') || "TBD";
        const color = searchParams.get('color') || "#6366f1";
        const margin = parseInt(searchParams.get('margin')) || 15000;
        const prob = parseInt(searchParams.get('prob')) || 85;
        const swing = parseFloat(searchParams.get('swing')) || 0;
        const demographic = searchParams.get('demographic') || "General";

        const isBankura = id.toLowerCase().includes('bankura');
        
        const mockData = {
          id: id,
          name: id.replace(/-/g, ' '),
          state: state,
          candidate: candidate,
          party: winner,
          color: color,
          margin: margin,
          total_votes: 217986 if isBankura else 1250000,
          turnout: 80.79 if isBankura else 82.4,
          confidence: prob,
          swing: swing,
          demographics: [
            { category: demographic, value: 45, trend: "up" },
            { category: "Urban Youth", value: 25, trend: "up" },
            { category: "Rural Farmers", value: 20, trend: "down" },
            { category: "Others", value: 10, trend: "stable" }
          ],
          historical: [
            { year: 2014, votes: 120000, winner: "INC" },
            { year: 2016, votes: 150000, winner: "TMC" },
            { year: 2019, votes: 180000, winner: "BJP" },
            { year: 2021, votes: isBankura ? 95466 : 190000, winner: isBankura ? "BJP (Niladri Dana)" : "TMC" },
            { year: 2026, votes: isBankura ? 110000 : 210000, winner: winner }
          ],
          topic_scores: [
            { topic: "Development", score: 88 },
            { topic: "Security", score: 72 },
            { topic: "Inflation", score: 45 },
            { topic: "Employment", score: 92 }
          ]
        };
        setTimeout(() => {
          setData(mockData);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, state]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => window.close()}
            className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3 text-slate-500 text-xs font-black uppercase tracking-widest mb-1">
              <MapPin size={14} /> {data.state}
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase">{data.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/5">
            <Download size={20} /> Export PDF
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
            <Share2 size={20} /> Share Report
          </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column - Key Stats */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <section className="glass-panel p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Shield size={120} className="text-indigo-500" />
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Projected Winner</p>
            <h2 className="text-6xl font-black mb-2" style={{ color: data.color }}>{data.party}</h2>
            <p className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Users size={20} className="text-slate-400" /> {data.candidate}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Confidence</p>
                <p className="text-2xl font-black text-white">{data.confidence}%</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Swing Factor</p>
                <p className={`text-2xl font-black ${data.swing >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {data.swing >= 0 ? '+' : ''}{data.swing}%
                </p>
              </div>
            </div>
          </section>

          <section className="glass-panel p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 uppercase tracking-tight">
              <Activity className="text-indigo-400" size={20} /> Voter Sentiment Trends
            </h3>
            <div className="space-y-6">
              {data.topic_scores.map((t, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-300">{t.topic}</span>
                    <span className="text-sm font-black text-white">{t.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${t.score}%` }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Center Column - Historical & Visuals */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <section className="glass-panel p-8">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 uppercase tracking-tight">
                <History className="text-indigo-400" size={20} /> Historical Growth
              </h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.historical}>
                    <defs>
                      <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="year" stroke="#475569" fontSize={12} axisLine={false} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={12} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="votes" stroke="#6366f1" fillOpacity={1} fill="url(#colorVotes)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="glass-panel p-8">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 uppercase tracking-tight">
                <Zap className="text-amber-400" size={20} /> Demographic Pulse
              </h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.demographics}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.demographics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#64748b'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <section className="glass-panel p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold flex items-center gap-2 uppercase tracking-tight">
                <TrendingUp className="text-indigo-400" size={20} /> Regional Insight Matrix
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-black">
                <Info size={14} /> LIVE ANALYTICS
              </div>
            </div>
            <div className="grid grid-cols-4 gap-6">
              {[
                { label: "Margin of Victory", val: data.margin.toLocaleString(), icon: Activity },
                { label: "Voter Turnout", val: `${data.turnout}%`, icon: Users },
                { label: "Anti-Incumbency", val: "Low", icon: Shield },
                { label: "Swing Factor", val: `+${data.swing}%`, icon: TrendingUp }
              ].map((item, i) => (
                <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group">
                  <item.icon size={24} className="text-slate-500 group-hover:text-indigo-400 mb-4 transition-colors" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-2xl font-black text-white">{item.val}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ConstituencyDetail;
