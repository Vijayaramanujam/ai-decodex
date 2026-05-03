import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid
} from 'recharts';
import { BookOpen, TrendingUp, Target, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = {
  High: '#ef4444', 
  Medium: '#f59e0b', 
  Low: '#10b981'
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/dashboard');
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold">No Analysis Found</h2>
        <p className="text-gray-400 mt-2">Please upload a past paper first.</p>
        <Link to="/upload" className="mt-6 bg-blue-600 px-6 py-2 rounded-lg font-medium">Go to Upload</Link>
      </div>
    );
  }

  const { topics, data: dashboardMetrics } = data;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans pb-10">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Exam Analysis Dashboard</h1>
            <p className="text-gray-400">AI-generated insights from your uploaded past papers</p>
          </div>
          <Link to="/plan/generate" className="flex items-center gap-2 bg-blue-600 py-3 px-6 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-colors">
            Generate Study Plan <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center gap-4">
              <div className="p-4 bg-blue-500/20 rounded-lg text-blue-400"><BookOpen size={28}/></div>
              <div>
                <p className="text-gray-400 text-sm">Identified Topics</p>
                <p className="text-3xl font-bold text-white">{topics.length}</p>
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center gap-4">
              <div className="p-4 bg-green-500/20 rounded-lg text-green-400"><Target size={28}/></div>
              <div>
                <p className="text-gray-400 text-sm">Syllabus Coverage</p>
                <p className="text-3xl font-bold text-white">{dashboardMetrics.syllabus_coverage}%</p>
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center gap-4">
              <div className="p-4 bg-purple-500/20 rounded-lg text-purple-400"><TrendingUp size={28}/></div>
              <div>
                <p className="text-gray-400 text-sm">Total Questions Analyzed</p>
                <p className="text-3xl font-bold text-white">
                  {dashboardMetrics.year_trend.reduce((acc, curr) => acc + curr.count, 0)}
                </p>
              </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Topic Frequency Chart */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-bold mb-6">Topic Frequency (Weighted)</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topics} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis dataKey="topic" type="category" stroke="#9ca3af" width={100} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="frequency" radius={[0, 4, 4, 0]}>
                    {topics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.priority] || '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 justify-center mt-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> High Priority</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Medium</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Low</span>
            </div>
          </div>

          {/* Year Trend Chart */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h2 className="text-xl font-bold mb-6">Year-on-Year Trend</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardMetrics.year_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="year" stroke="#9ca3af" tick={{fill: '#9ca3af'}} />
                  <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
