import React from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend
} from 'recharts';
import { Brain, Cpu, BarChart3, Database, CheckCircle2, AlertCircle } from 'lucide-react';

const Analytics = () => {
  // Mock performance data from training runs
  const modelPerformance = [
    { name: 'XGBoost', accuracy: 92, rmse: 12.4, color: '#f59e0b' },
    { name: 'LightGBM', accuracy: 91, rmse: 13.1, color: '#10b981' },
    { name: 'Ensemble', accuracy: 94, rmse: 10.2, color: '#6366f1' },
    { name: 'FFN', accuracy: 88, rmse: 15.6, color: '#8b5cf6' },
    { name: 'LSTM', accuracy: 85, rmse: 18.2, color: '#ec4899' },
  ];

  const featureImportance = [
    { feature: 'Historical Vote Share', value: 85 },
    { feature: 'Anti-Incumbency', value: 72 },
    { feature: 'News Sentiment', value: 68 },
    { feature: 'Turnout Delta', value: 55 },
    { feature: 'Alliances', value: 90 },
    { feature: 'Demographics', value: 45 },
  ];

  const trainingHistory = [
    { epoch: 10, loss: 1200 },
    { epoch: 20, loss: 950 },
    { epoch: 30, loss: 820 },
    { epoch: 40, loss: 790 },
    { epoch: 50, loss: 783 },
  ];

  return (
    <div className="p-10 space-y-10 animate-fade-in">
      <header>
        <h2 className="text-3xl font-bold text-white mb-2">Model Analytics & Backtesting</h2>
        <p className="text-slate-400">Deep dive into the performance metrics of the ensemble modeling pipeline.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Training Status', val: 'Completed', icon: CheckCircle2, color: 'emerald' },
          { title: 'Avg. Accuracy', val: '94.2%', icon: Cpu, color: 'indigo' },
          { title: 'Data Points', val: '1.2M+', icon: Database, color: 'rose' }
        ].map((stat, i) => {
          const colorMap = {
            emerald: 'bg-emerald-500/10 text-emerald-400',
            indigo: 'bg-indigo-500/10 text-indigo-400',
            rose: 'bg-rose-500/10 text-rose-400'
          };
          return (
            <div key={i} className="glass-panel p-6 flex items-center space-x-6">
              <div className={`p-4 rounded-2xl ${colorMap[stat.color]}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.title}</p>
                <h4 className="text-2xl font-black text-white">{stat.val}</h4>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8">
          <h3 className="text-xl font-bold mb-8 flex items-center space-x-3">
            <BarChart3 className="text-indigo-400" />
            <span>Model Comparison (Accuracy)</span>
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                <Bar dataKey="accuracy" radius={[8, 8, 0, 0]}>
                  {modelPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-8">
          <h3 className="text-xl font-bold mb-8 flex items-center space-x-3">
            <Brain className="text-indigo-400" />
            <span>Feature Importance Matrix</span>
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={featureImportance}>
                <PolarGrid stroke="#ffffff10" />
                <PolarAngleAxis dataKey="feature" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar
                  name="Importance"
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 glass-panel p-8">
          <h3 className="text-xl font-bold mb-8 flex items-center space-x-3">
            <Cpu className="text-indigo-400" />
            <span>Training Loss Convergence</span>
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trainingHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="epoch" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                <Line 
                  type="monotone" 
                  dataKey="loss" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
