import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import axios from 'axios';
import { Calendar, CheckCircle2, Clock, BookOpen, Download } from 'lucide-react';

const Plan = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generatePlan = async () => {
      setLoading(true);
      try {
        const res = await axios.post('http://localhost:8000/api/plan', { days: 7 });
        setPlan(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    generatePlan();
  }, []);

  if (loading || !plan) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-xl font-medium">CrewAI Agents are finalizing your personalized plan...</p>
      </div>
    );
  }

  // Parse daily schedule mock text into something rendered nicely
  const parseSchedule = (scheduleText) => {
    return scheduleText.split('.').filter(s => s.trim()).map(s => s.trim());
  };

  const scheduleItems = parseSchedule(plan.daily_schedule);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans pb-16">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your AI Study Plan</h1>
            <p className="text-gray-400">Optimized for high-yield topics over {plan.timeline_days} days</p>
          </div>
          <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 py-2 px-4 rounded-lg font-medium border border-gray-600 transition-colors text-sm">
            <Download size={16} /> Export PDF
          </button>
        </div>

        {/* Priority Topics Section */}
        <section className="mb-10">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-gray-700 pb-2 mb-4">
            <TargetIcon /> High Priority Topics (Must Master)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.priority_topics.map((topic, i) => (
              <div key={i} className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="text-red-400 shrink-0 mt-0.5" size={20} />
                <span className="font-medium text-red-50">{topic}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section>
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-gray-700 pb-2 mb-6">
            <Calendar size={24} className="text-blue-400" /> Day-by-Day Roadmap
          </h2>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-blue-500/50 before:to-transparent">
            {scheduleItems.map((item, i) => (
              <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Timeline dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-900 bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  {i + 1}
                </div>
                
                {/* Content */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-xl transition-all hover:border-blue-500/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-blue-400">Phase {i+1}</span>
                    <Clock size={16} className="text-gray-500" />
                  </div>
                  <p className="text-gray-300 leading-relaxed">{item}</p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-700 flex items-center gap-2 text-sm text-gray-400">
                    <BookOpen size={16} /> Recommended Practice: 10 Questions
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

const TargetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);

export default Plan;
