import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, TrendingUp, CheckCircle2, Clock, ShieldCheck, 
  Building2, Users, ArrowUpRight, Activity
} from 'lucide-react';

export const AnalyticsModule: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAnalyticsData(data.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const total = analyticsData?.totalComplaints || 5240;
  const resolved = analyticsData?.resolvedComplaints || 4920;
  const inProgress = analyticsData?.inProgressComplaints || 210;
  const pending = analyticsData?.pendingComplaints || 110;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Title */}
      <div className="p-6 rounded-3xl bg-white border border-[#DADCE0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
            National Governance Metrics
          </span>
          <h1 className="text-2xl font-extrabold text-[#202124] font-heading tracking-tight mt-0.5">
            Public Grievance Analytics & AI Performance
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#16A34A]">
            <Activity className="w-3.5 h-3.5" />
            98.2% Resolution Rate
          </span>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-[#DADCE0] space-y-1">
          <span className="text-xs font-bold text-[#5F6368] block">Total Complaints</span>
          <p className="text-3xl font-extrabold text-[#202124] font-heading">{total.toLocaleString()}</p>
          <span className="text-[10px] text-[#16A34A] font-bold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +12.4% vs last month
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
          <span className="text-xs font-bold text-emerald-900 block">Resolved Cases</span>
          <p className="text-3xl font-extrabold text-[#16A34A] font-heading">{resolved.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-800 font-bold">94% automated verification</span>
        </div>

        <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-1">
          <span className="text-xs font-bold text-blue-900 block">Avg Resolution Time</span>
          <p className="text-3xl font-extrabold text-[#2563EB] font-heading">21.4 hrs</p>
          <span className="text-[10px] text-blue-800 font-bold">Down from 72 hrs in 2025</span>
        </div>

        <div className="p-5 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-1">
          <span className="text-xs font-bold text-purple-900 block">AI Accuracy Score</span>
          <p className="text-3xl font-extrabold text-purple-700 font-heading">97.8%</p>
          <span className="text-[10px] text-purple-800 font-bold">Gemini 3.6 Neural Matrix</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Department Performance Bar Visualizer */}
        <div className="p-6 rounded-3xl bg-white border border-[#DADCE0] space-y-5">
          <div className="flex items-center justify-between border-b border-[#DADCE0] pb-3">
            <h3 className="text-base font-extrabold text-[#202124] font-heading">
              Department Performance & SLA Adherence
            </h3>
            <span className="text-xs font-bold text-[#2563EB]">Resolution SLA</span>
          </div>

          <div className="space-y-4">
            {[
              { name: 'Roads & Highways', percentage: 96, avg: '1.8 Days', color: 'bg-[#2563EB]' },
              { name: 'Water Supply & Sewage', percentage: 98, avg: '1.5 Days', color: 'bg-emerald-600' },
              { name: 'Municipality Sanitation', percentage: 99, avg: '0.9 Days', color: 'bg-amber-500' },
              { name: 'Electricity Board', percentage: 97, avg: '0.8 Days', color: 'bg-indigo-600' },
              { name: 'Public Health', percentage: 95, avg: '1.2 Days', color: 'bg-teal-600' },
              { name: 'Police & Public Safety', percentage: 99, avg: '0.5 Days', color: 'bg-red-600' },
            ].map((dept, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-[#202124]">
                  <span>{dept.name}</span>
                  <span className="text-[#5F6368]">{dept.percentage}% Resolved ({dept.avg})</span>
                </div>
                <div className="w-full h-2.5 bg-[#F8F9FA] border border-[#DADCE0]/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${dept.color} rounded-full transition-all duration-500`}
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Complaint Trends Area Visualizer */}
        <div className="p-6 rounded-3xl bg-white border border-[#DADCE0] space-y-5">
          <div className="flex items-center justify-between border-b border-[#DADCE0] pb-3">
            <h3 className="text-base font-extrabold text-[#202124] font-heading">
              Monthly Complaint Trends & Growth
            </h3>
            <span className="text-xs font-bold text-[#16A34A]">High Resolution Rate</span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
            {[
              { month: 'Jan', total: 60, resolved: 58 },
              { month: 'Feb', total: 72, resolved: 70 },
              { month: 'Mar', total: 85, resolved: 82 },
              { month: 'Apr', total: 95, resolved: 91 },
              { month: 'May', total: 110, resolved: 108 },
              { month: 'Jun', total: 125, resolved: 122 },
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  <div
                    className="w-full bg-blue-100 rounded-t-md hover:bg-blue-200 transition-all relative group"
                    style={{ height: `${(item.total / 130) * 100}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[#202124] opacity-0 group-hover:opacity-100">
                      {item.total}
                    </span>
                  </div>
                  <div
                    className="w-full bg-[#2563EB] rounded-t-md hover:bg-blue-700 transition-all relative group"
                    style={{ height: `${(item.resolved / 130) * 100}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100">
                      {item.resolved}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#5F6368]">{item.month}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-[#5F6368] pt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-100 rounded-xs" /> Total Received
            </div>
            <div className="flex items-center gap-1.5 font-bold text-[#202124]">
              <span className="w-3 h-3 bg-[#2563EB] rounded-xs" /> AI Verified & Resolved
            </div>
          </div>
        </div>

      </div>

      {/* Category Distribution Heatmap Bar */}
      <div className="p-6 rounded-3xl bg-white border border-[#DADCE0] space-y-4">
        <h3 className="text-base font-extrabold text-[#202124] font-heading">
          Category Volume Breakdown
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#DADCE0]">
            <span className="text-xs text-[#5F6368] block">Roads & Potholes</span>
            <span className="text-xl font-bold text-[#202124]">35.1%</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#DADCE0]">
            <span className="text-xs text-[#5F6368] block">Water & Sewage</span>
            <span className="text-xl font-bold text-[#202124]">23.4%</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#DADCE0]">
            <span className="text-xs text-[#5F6368] block">Garbage Disposal</span>
            <span className="text-xl font-bold text-[#202124]">18.7%</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#DADCE0]">
            <span className="text-xs text-[#5F6368] block">Electricity & Power</span>
            <span className="text-xl font-bold text-[#202124]">12.2%</span>
          </div>
        </div>
      </div>

    </div>
  );
};
