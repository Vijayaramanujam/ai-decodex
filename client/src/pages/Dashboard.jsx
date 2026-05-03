import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import apiClient from '../api/client';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, CartesianGrid
} from 'recharts';
import { BookOpen, TrendingUp, Target, Loader2, AlertTriangle, ArrowRight, Zap, Sparkles, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const COLORS = {
  High: '#ff3366', // accent-secondary
  Medium: '#ff9900', // accent-warn
  Low: '#ccff00' // accent-primary
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get('/dashboard');
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-[#ccff00]" />
        </motion.div>
        <span className="mt-4 font-display text-2xl tracking-widest text-[#ccff00] animate-pulse">ANALYZING INTEL...</span>
      </div>
    );
  }

  if (!data || !data.success) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center font-body">
        <Header />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 border border-[#333] bg-[#0f1115] rounded-none flex flex-col items-center max-w-md text-center mt-20 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-[#ff3366]"></div>
          <AlertTriangle className="h-16 w-16 text-[#ff3366] mb-4" />
          <h2 className="text-3xl font-display uppercase tracking-widest mb-2">No Intel Found</h2>
          <p className="text-gray-400 mb-6 font-body">Please upload and analyze a past paper to initialize your dashboard metrics.</p>
          <Link to="/upload" className="w-full flex items-center justify-center gap-2 bg-[#ccff00] text-black px-6 py-4 font-bold uppercase tracking-widest hover:bg-[#b3e600] transition-colors">
            Initialize Upload <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  const { topics, data: dashboardMetrics } = data;
  const totalQuestions = dashboardMetrics?.year_trend?.reduce((acc, curr) => acc + curr.count, 0) || 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-body pb-16 relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#ccff00] opacity-[0.03] blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#ff3366] opacity-[0.03] blur-[120px] rounded-full pointer-events-none z-0"></div>
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-6 pt-16 pb-8 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="text-[#ccff00]" size={20} />
                <span className="text-[#ccff00] uppercase tracking-[0.2em] text-sm font-bold">System Active</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-display uppercase tracking-wider">
                Intel <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ccff00] to-[#ff3366]">Dashboard</span>
              </h1>
              <p className="text-gray-400 mt-3 max-w-xl text-lg">Real-time analysis and predictive insights extracted from your academic database.</p>
            </div>
            <Link to="/plan" className="group relative inline-flex items-center gap-3 bg-transparent border border-white/20 hover:border-[#ccff00]/50 px-8 py-4 uppercase font-bold tracking-widest text-sm transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 w-0 bg-[#ccff00] transition-all duration-300 ease-out group-hover:w-full"></div>
              <span className="relative z-10 text-white group-hover:text-black transition-colors flex items-center gap-2">
                Generate Plan <Zap size={16} />
              </span>
            </Link>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {/* Stat Card 1 */}
            <motion.div variants={itemVariants} className="relative group p-[1px] bg-gradient-to-b from-white/10 to-transparent hover:from-[#ccff00]/30 transition-all duration-500">
              <div className="h-full bg-[#0a0a0a] p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20">
                    <BookOpen size={24}/>
                  </div>
                  <Activity className="text-gray-600 group-hover:text-[#ccff00] transition-colors" size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Identified Topics</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-display text-white">{topics?.length || 0}</p>
                    <span className="text-[#ccff00] text-sm font-bold">+Active</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stat Card 2 */}
            <motion.div variants={itemVariants} className="relative group p-[1px] bg-gradient-to-b from-white/10 to-transparent hover:from-[#ff3366]/30 transition-all duration-500">
              <div className="h-full bg-[#0a0a0a] p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-[#ff3366]/10 text-[#ff3366] border border-[#ff3366]/20">
                    <Target size={24}/>
                  </div>
                  <Activity className="text-gray-600 group-hover:text-[#ff3366] transition-colors" size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Syllabus Coverage</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-display text-white">{dashboardMetrics?.syllabus_coverage || 0}%</p>
                    <div className="h-1 flex-1 bg-[#1a1a1a] ml-4 overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${dashboardMetrics?.syllabus_coverage || 0}%` }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="absolute top-0 left-0 h-full bg-[#ff3366]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stat Card 3 */}
            <motion.div variants={itemVariants} className="relative group p-[1px] bg-gradient-to-b from-white/10 to-transparent hover:from-[#ff9900]/30 transition-all duration-500">
              <div className="h-full bg-[#0a0a0a] p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-[#ff9900]/10 text-[#ff9900] border border-[#ff9900]/20">
                    <TrendingUp size={24}/>
                  </div>
                  <Activity className="text-gray-600 group-hover:text-[#ff9900] transition-colors" size={20} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Analyzed Queries</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-display text-white">{totalQuestions}</p>
                    <span className="text-gray-500 text-sm">Data points</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Topic Frequency Chart */}
            <motion.div variants={itemVariants} className="bg-[#0a0a0a] border border-white/5 p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ccff00]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl font-display uppercase tracking-widest">Topic Priority <span className="text-gray-500">// Matrix</span></h2>
                <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-2"><span className="w-2 h-2 bg-[#ff3366]"></span> High</span>
                  <span className="flex items-center gap-2"><span className="w-2 h-2 bg-[#ff9900]"></span> Med</span>
                  <span className="flex items-center gap-2"><span className="w-2 h-2 bg-[#ccff00]"></span> Low</span>
                </div>
              </div>
              
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topics || []} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis type="number" stroke="#333" tick={{fill: '#666', fontFamily: 'Space Grotesk'}} axisLine={{stroke: '#333'}} tickLine={false} />
                    <YAxis dataKey="topic" type="category" stroke="#666" width={120} tick={{fill: '#999', fontSize: 12, fontFamily: 'Space Grotesk'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#0f1115', border: '1px solid #333', borderRadius: '0px', color: '#fff', fontFamily: 'Space Grotesk' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="frequency" barSize={16} radius={[0, 4, 4, 0]}>
                      {(topics || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.priority] || '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Year Trend Chart */}
            <motion.div variants={itemVariants} className="bg-[#0a0a0a] border border-white/5 p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff3366]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display uppercase tracking-widest">Chronological <span className="text-gray-500">// Trends</span></h2>
              </div>
              
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardMetrics?.year_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff3366" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ff3366" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                    <XAxis dataKey="year" stroke="#666" tick={{fill: '#999', fontFamily: 'Space Grotesk'}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#666" tick={{fill: '#999', fontFamily: 'Space Grotesk'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f1115', border: '1px solid #333', borderRadius: '0px', fontFamily: 'Space Grotesk' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#ff3366" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorCount)" 
                      activeDot={{ r: 8, fill: '#ccff00', stroke: '#000', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </motion.div>

        </main>
      </div>
    </div>
  );
};

export default Dashboard;
