import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, ShieldAlert, Shield, Search, LayoutGrid, BarChart2, Eye, User, MoreHorizontal, ChevronDown } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList, Legend } from 'recharts';
import overviewIcon from './overview.svg';
import analyticsIcon from './analytics.svg';
import preaiIcon from './preai.svg';
import clusterIcon from './cluster.svg';
import aiIcon from './ai.svg';
import reportIcon from './report.svg';
import targetIcon from './target.svg';
import calendarIcon from './calendar.svg';
import calendar2Icon from './calendar2.svg';
import cursorIcon from './cursor.svg';
import upIcon from './up.svg';
import starsIcon from './stars.svg';
import treeIcon from './tree.svg';

// Color palettes matching your design
const COLORS = ['#10CC0D', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
const RISK_COLORS = { 
  'Very Low': '#22C55E',   // Green
  'Low': '#FACC15',        // Yellow
  'High': '#FB923C', 
  'Critical': '#EF4444' 
};
const getOutcomeColor = (outcome) => {
  if (outcome === 'Fail' || outcome === 'Withdrawn') return 'text-red-500';
  if (outcome === 'Pass' || outcome === 'Distinction') return 'text-green-500';
  return 'text-white';
};

const getRiskColor = (risk) => {
  if (risk === 'Critical' || risk === 'High') return 'text-red-500';
  if (risk === 'Moderate' || risk === 'Medium') return 'text-yellow-500';
  if (risk === 'Low') return 'text-green-500';
  return 'text-white';
};

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [shapTab, setShapTab] = useState('negative');
  const [isPrescriptiveLoading, setIsPrescriptiveLoading] = useState(false);
  const [prescriptiveError, setPrescriptiveError] = useState(null);
  // Fetch Overview Data on Initial Load
  useEffect(() => {
    const fetchOverviewData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/overview/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Save the live Django data to your React state
        setDashboardData(data); 
      } catch (error) {
        console.error("Failed to fetch overview data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []); // The empty array [] means this runs exactly once when the app loads
  // const [prescriptiveData, setPrescriptiveData] = useState({
  //   student_context: {
  //     student_id: 32551,
  //     cluster_name: "Early Dropouts",
  //     current_risk_level: "Critical",
  //     current_prediction: "Fail",
  //     target_outcome: "Pass"
  //   },
  //   ai_advisor_report: {
  //     top_metrics: {
  //       top_priority: "Assessments & Engagement",
  //       intervention_confidence_percent: 82,
  //       estimated_outcome_shift: "Fail -> Pass",
  //       similar_students_improved_percent: 73
  //     },
  //     recommended_action_plan: [
  //       {
  //         title: "Submit Assignments Early",
  //         description: "Submit tasks 3 days before deadlines to completely avoid late penalties.",
  //         timeline_tag: "Short Term",
  //         duration: "(0-2 Weeks)"
  //       },
  //       {
  //         title: "Boost Assessment Scores",
  //         description: "Review past feedback and core materials to push your average score above 60%.",
  //         timeline_tag: "Short Term",
  //         duration: "(2-4 Weeks)"
  //       },
  //       {
  //         title: "Increase VLE Engagement",
  //         description: "Access course forums and resources at least 3 times a week to build consistency.",
  //         timeline_tag: "Medium Term",
  //         duration: "(4-8 Weeks)"
  //       },
  //       {
  //         title: "Start assessments early and maintain consistency",
  //         description: "Attempt assessments in the first two weeks and avoid last-minute rush",
  //         timeline_tag: "Long Term",
  //         duration: "(8+ Weeks)"
  //       },
  //       {
  //         title: "Mirror Peer Success",
  //         description: "Match the weekly activity metrics of your top-performing Digital Twins to secure a pass.",
  //         timeline_tag: "Long Term",
  //         duration: "(8+ Weeks)"
  //       }
  //     ]
  //   },
  //   risk_simulator: {
  //     what_if_analysis: {
  //       behaviors: [
  //         { name: "Assessment Mean Score", current_val: 72, recommended_val: ">=72", risk_score_impact: -0.18 },
  //         { name: "Early Engagement Ratio", current_val: 1.1, recommended_val: ">=1.5", risk_score_impact: -0.20 },
  //         { name: "Weighted Score Total", current_val: 72, recommended_val: ">=72", risk_score_impact: -0.18 },
  //         { name: "Minimum Assessment Score", current_val: 36, recommended_val: ">=50", risk_score_impact: -0.16 }
  //       ],
  //       total_potential_risk_reduction: -0.70
  //     },
  //     post_intervention_predictions: {
  //       probability_distribution: [
  //         { name: "Fail", value: 15.2, fill: "#EF4444" },
  //         { name: "Pass", value: 63.7, fill: "#10CC0D" },
  //         { name: "Distinction", value: 12.1, fill: "#3B82F6" },
  //         { name: "Withdrawn", value: 9.0, fill: "#9CA3AF" }
  //       ],
  //       most_likely_outcome: "Pass",
  //       confidence_percent: 63.7,
  //       new_risk_score: 1.12,
  //       max_risk_score: 4.0
  //     }
  //   }
  // });

  const [prescriptiveData, setPrescriptiveData] = useState(null);
  const fetchPrescriptiveData = async (studentId) => {
    // 1. Safety check
    if (!studentId) return; 

    // 2. Prep the UI (turn on the spinner, clear old data)
    setIsPrescriptiveLoading(true);
    setPrescriptiveError(null);
    setPrescriptiveData(null); 
    
    try {
      // 3. Hit the real Django backend!
      const response = await fetch(`/api/prescriptive-ai/${studentId}/`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: Failed to fetch AI recommendations.`);
      }
      
      // 4. Parse the JSON and push it into the state
      const data = await response.json();
      setPrescriptiveData(data);
      
    } catch (err) {
      console.error(err);
      setPrescriptiveError(err.message);
    } finally {
      // 5. Turn off the spinner
      setIsPrescriptiveLoading(false);
    }
  };


  if (loading) return <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center text-2xl">Loading Dashboard...</div>;

  const cards = dashboardData?.cards || {};
  const donut_chart = dashboardData?.donut_chart || [];
  const bar_chart = dashboardData?.bar_chart || [];

  // Calculate total for percentages
  const totalStudents = cards?.total_students || 0;

  // NEW: Calculate percentages for the bar chart
  const enhancedBarData = bar_chart.map(item => ({
    ...item,
    percentage: ((item.count / totalStudents) * 100).toFixed(2) + '%'
  }));

  // NEW: Custom Tooltip to match text color with the bar
  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const barColor = RISK_COLORS[data.risk_level] || '#8B5CF6';
      return (
        <div className="bg-[#1F2937] p-3 rounded-lg shadow-xl border border-gray-700">
          <p className="font-bold text-base mb-1" style={{ color: barColor }}>{data.risk_level}</p>
          <p className="text-gray-300 text-sm">Count: {data.count}</p>
        </div>
      );
    }
    return null;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery) return; // Don't search if the bar is empty

    try {
      // Fetch the real ML predictions from your Django backend
      const response = await fetch(`http://127.0.0.1:8000/api/analytics/${searchQuery}/`);
      
      if (!response.ok) {
        throw new Error('Student not found or server error');
      }

      const realData = await response.json();
      
      // Update the dashboard with the actual machine learning data!
      setAnalyticsData(realData); 
      
    } catch (error) {
      console.error("Error fetching student analytics:", error);
      alert("Could not find this student or model failed. Check the console for details.");
    }
  };
  if (!dashboardData && activeTab === 'overview') {
    return <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center">Loading Overview Data...</div>;
  }

  const queue = dashboardData?.high_risk_queue || [];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F7FA] flex flex-col items-center">
      
      {/* 1. The New Navbar */}
      <div className="w-full max-w-7xl px-4 flex items-center justify-between py-5 bg-[#0A0A0F] mb-8">
        
        {/* Logo Area */}
        <div className="flex items-center gap-4">
          {/* Gradient SSAP Logo */}
          <span className="font-agu text-[42px] font-bold bg-gradient-to-r from-[#1E4BED] to-[#9012EA] text-transparent bg-clip-text tracking-wider leading-none">
            SSAP
          </span>
          <div className="flex flex-col justify-center">
            <span className="font-space text-[#F5F7FA] text-[16px] leading-tight">Smart Students</span>
            <span className="font-space text-[#F5F7FA] text-[16px] leading-tight">Analytics Platform</span>
          </div>
        </div>

        
        {/* Navigation Tabs */}
            <div className="flex items-center gap-1 bg-[#12131A] p-1.5 rounded-[16px] w-fit mb-6">
              
              <button 
                onClick={() => setActiveTab('overview')}
                className={`flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-[12px] transition-all ${
                  activeTab === 'overview' 
                    ? 'bg-[#1F1E38] text-[#F5F7FA]' 
                    : 'text-[#AEB5C5] hover:text-[#F5F7FA] hover:bg-[#1F1E38]/50'
                }`}
              >
                <img src={overviewIcon} alt="Overview" className="w-5 h-5" />
                <span className="font-manrope text-[16px] font-semibold whitespace-nowrap">Overview</span>
              </button>

              <button 
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-[12px] transition-all ${
                  activeTab === 'analytics' 
                    ? 'bg-[#1F1E38] text-[#F5F7FA]' 
                    : 'text-[#AEB5C5] hover:text-[#F5F7FA] hover:bg-[#1F1E38]/50'
                }`}
              >
                <img src={analyticsIcon} alt="Analytics" className="w-5 h-5" />
                <span className="font-manrope text-[16px] font-semibold whitespace-nowrap">Analytics</span>
              </button>

              <button 
                onClick={() => {
                      setActiveTab('prescriptive');
                      fetchPrescriptiveData(analyticsData?.student_id);
                    }}
                className={`flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-[12px] transition-all ${
                  activeTab === 'prescriptive' 
                    ? 'bg-[#1F1E38] text-[#F5F7FA]' 
                    : 'text-[#AEB5C5] hover:text-[#F5F7FA] hover:bg-[#1F1E38]/50'
                }`}
              >
                <img src={preaiIcon} alt="Prescriptive AI" className="w-5 h-5" />
                <span className="font-manrope text-[16px] font-semibold whitespace-nowrap">Prescriptive AI</span>
              </button>
              
            </div>

        {/* Admin Profile (183x57, bg #12131A, 8px radius, NO borders) */}
        <div className="w-[183px] h-[57px] flex items-center justify-between bg-[#12131A] px-4 rounded-[8px] cursor-pointer hover:bg-[#1F1E38] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#AEB5C5] bg-gray-800/50">
              <User size={16} />
            </div>
            <div className="flex flex-col">
              <span className="font-manrope text-white text-[14px] font-medium leading-none mb-1">Admin</span>
              <span className="font-jakarta text-[#AEB5C5] text-[11px] leading-none">Administrator</span>
            </div>
          </div>
          {/* Using ChevronDown to match your Figma image */}
          <ChevronDown size={16} className="text-[#AEB5C5]" />
        </div>
        
      </div>

      {/* Main Content Wrapper to center it nicely like a dashboard */}
      
      <div className="w-full max-w-7xl px-4">
        {/* Render Overview Page */}
        {activeTab === 'overview' && (
          <>        
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="font-manrope text-[36px] text-3xl font-bold mb-1">Welcome Back, Administrator</h1>
              <p className="font-jakarta text-[20px] text-gray-400">Here's what you need for today</p>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {(() => {
                const total = cards?.total_students || 1; // Default to 1 to prevent NaN
                const highRisk = cards?.high_risk || 0;
                const criticalRisk = cards?.critical_risk || 0;
                const avgScore = cards?.avg_score || 0;

                const highRiskPct = (highRisk / total) * 100;
                const criticalRiskPct = (criticalRisk / total) * 100;
                const avgScorePct = (avgScore / 4) * 100; // Assuming the score is out of 4

                return (
                  <>
                    {/* Total Students */}
                    <MetricCard 
                      title="Total Students" 
                      value={total} 
                      icon={<Users size={24} />} 
                      colorClass="bg-[#6366F1]" 
                      subtitle="100% of population" 
                      percentage={100}
                    />
                    
                    {/* High Risk Students */}
                    <MetricCard 
                      title="High Risk Students" 
                      value={highRisk} 
                      icon={<AlertTriangle size={24} />} 
                      colorClass="bg-[#F59E0B]" 
                      subtitle={`${highRiskPct.toFixed(2)}% of population`} 
                      percentage={highRiskPct}
                    />

                    {/* Critical Risk Students */}
                    <MetricCard 
                      title="Critical Risk Students" 
                      value={criticalRisk} 
                      icon={<ShieldAlert size={24} />} 
                      colorClass="bg-[#EF4444]" 
                      subtitle={`${criticalRiskPct.toFixed(2)}% of population`} 
                      percentage={criticalRiskPct}
                    />

                    {/* Avg. Risk Score */}
                    <MetricCard 
                      title="Avg. Risk Score" 
                      value={avgScore} 
                      icon={<Shield size={24} />} 
                      colorClass="bg-[#3B82F6]" 
                      subtitle="On a scale of 0-4" 
                      percentage={avgScorePct}
                    />
                  </>
                );
              })()}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              
              {/* Donut Chart: Risk by Segment (UPDATED WITH ROBUST COLORS) */}
              <div className="bg-[#12131A] p-6 rounded-xl shadow-lg flex flex-col">
                <h2 className="font-manrope text-[20px] text-lg font-semibold mb-6">Risk Distribution By Segment</h2>
                
                <div className="flex-1 flex items-center justify-between">
                  
                  {(() => {
                    // Robust color matching function
                    const getClusterColor = (clusterName) => {
                      const name = (clusterName || "").toLowerCase();
                      if (name.includes("risk")) return "#EF4444";       // Red
                      if (name.includes("struggling")) return "#F59E0B"; // Orange
                      if (name.includes("achiever")) return "#10CC0D";   // Green
                      if (name.includes("consistent")) return "#3B82F6"; // Blue
                      if (name.includes("early") || name.includes("dropout")) return "#8B5CF6"; // Purple
                      return "#9CA3AF"; // Default Gray
                    };

                    return (
                      <>
                        {/* Left Side: The Chart with Text Inside */}
                        <div className="w-1/3 h-64 relative flex items-center justify-center">
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-bold text-white z-10">{totalStudents.toLocaleString()}</span>
                            <span className="text-sm text-gray-400 z-10">Total</span>
                          </div>
                          
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={donut_chart} dataKey="count" nameKey="cluster_name" cx="50%" cy="50%" innerRadius="65%" outerRadius="100%" stroke="none">
                                {donut_chart.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={getClusterColor(entry.cluster_name)} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', zIndex: 50 }} itemStyle={{ color: '#fff' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Right Side: The Detailed Legend Table */}
                        <div className="w-2/3 pl-6">
                          <table className="w-full text-sm text-left">
                            <thead>
                              <tr className="text-[#F5F7FA] border-b border-[#F5F7FA8F]">
                                <th className="font-manrope pb-2 text-[12px] font-medium w-1/2">Segment</th>
                                <th className="font-manrope pb-2 text-[12px] font-medium text-right w-1/4 pr-4">Students</th>
                                <th className="font-manrope pb-2 text-[12px] font-medium text-right w-1/4">Percentage</th>
                              </tr>
                            </thead>
                            <tbody>
                              {donut_chart.map((entry, index) => {
                                const percentage = ((entry.count / totalStudents) * 100).toFixed(2);
                                return (
                                  <tr key={index} className="border-b border-[#F5F7FA8F] hover:bg-gray-800/30 transition-colors">
                                    <td className="font-jakarta text-[12px] py-3 flex items-center gap-2">
                                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: getClusterColor(entry.cluster_name) }}></div>
                                      <span className="text-[#F5F7FA] truncate max-w-[180px]" title={entry.cluster_name}>{entry.cluster_name}</span>
                                    </td>
                                    <td className="font-space py-3 text-right pr-4 font-medium text-white">{entry.count}</td>
                                    <td className="font-space py-3 text-right text-[#F5F7FA]">{percentage}%</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Bar Chart: Risk Overview (UPDATED) */}
              <div className="bg-[#12131A] p-6 rounded-xl shadow-lg flex flex-col">
                <h2 className="font-manrope text-[20px] text-lg font-semibold mb-2">Risk Distribution Overview</h2>
                <span className="font-jakarta text-[12px]text-xs text-gray-400 mb-4">No. of Students</span>
                
                <div className="flex-1 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    {/* Notice we are using enhancedBarData here now */}
                    <BarChart data={enhancedBarData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      {/* Faint horizontal lines */}
                      <CartesianGrid vertical={false} stroke="#F5F7FA8F" />
                      
                      <XAxis dataKey="risk_level" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12, fontFamily: 'Space Grotesk' }} tickLine={false} axisLine={false} />
                      
                      <Tooltip cursor={{ fill: '#1F2937', opacity: 0.4 }} content={<CustomBarTooltip />} />
                      
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={70}>
                        {/* 3. Add fontFamily to the LabelList */}
                        <LabelList dataKey="percentage" position="insideBottom" fill="#ffffff" offset={15} style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'Space Grotesk' }} />
                        {enhancedBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.risk_level] || '#8B5CF6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* High Risk Student Queue Table */}
            <div className="bg-[#12131A] p-6 rounded-xl shadow-lg overflow-x-auto mb-10">
              
              <div className="flex items-center mb-6">
                <h2 className="font-manrope text-[20px] font-semibold text-[#F5F7FA]">
                  High Risk Student Queue
                </h2>
              </div>

              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-[#F5F7FA4D]">
                    {/* Fixed Percentage Widths Applied Here */}
                    <th className="font-manrope text-[16px] text-[#F5F7FA] font-medium pb-4 pl-4 w-[5%]">#</th>
                    <th className="font-manrope text-[16px] text-[#F5F7FA] font-medium pb-4 w-[20%]">
                      Student ID 
                    </th>
                    <th className="font-manrope text-[16px] text-[#F5F7FA] font-medium pb-4 w-[15%]">Risk Level</th>
                    <th className="font-manrope text-[16px] text-[#F5F7FA] font-medium pb-4 w-[20%]">Cluster</th>
                    <th className="font-manrope text-[16px] text-[#F5F7FA] font-medium pb-4 w-[10%]">Risk Score</th>
                    <th className="font-manrope text-[16px] text-[#F5F7FA] font-medium pb-4 w-[30%]">Key Risk Factors</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((student, index) => (
                    <tr key={index} className="border-b border-[#F5F7FA4D] hover:bg-[#1F1E38] transition-colors">
                      
                      <td className="font-jakarta text-[14px] text-[#AEB5C5] py-4 pl-4">{index + 1}</td>
                      
                      <td className="font-jakarta text-[14px] text-[#F5F7FA] py-4 truncate">
                        {student.id_student}
                        {student.code_module && (
                          <span className="text-[#AEB5C5] text-[12px] ml-2">
                            ({student.code_module})
                          </span>
                        )}
                      </td>
                      
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded text-[12px] font-semibold ${student.risk_level === 'Critical' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-orange-500/20 text-orange-500 border border-orange-500/30'}`}>
                          {student.risk_level}
                        </span>
                      </td>
                      
                      <td className="font-jakarta text-[14px] text-[#AEB5C5] py-4 truncate">{student.cluster_name}</td>
                      
                      <td className={`font-jakarta text-[14px] py-4 ${
                        ['Critical', 'High'].includes(student.risk_level) ? 'text-red-500' : 'text-[#AEB5C5]'
                      }`}>
                        {student.risk_score}
                      </td>
                      
                      <td className="font-jakarta text-[14px] text-[#AEB5C5] py-4 pr-4 truncate">
                        {/* Temporarily hardcoding realistic risk factors based on the row index */}
                        {student.key_risk_factors || [
                          "Low early engagement", 
                          "Missed recent assignment", 
                          "Declining assessment scores", 
                          "Infrequent logins", 
                          "Low total clicks"
                        ][index % 5]}
                      </td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Render Analytics Page */}
        {activeTab === 'analytics' && (
          <div className="w-full animate-fade-in">
            
            {/* Search Bar Section & Top Right Controls */}
            <div className="flex items-center justify-between mb-8 mt-2">
              
              {/* Search Bar (798x36px, 30px radius, 1.5px border at ~56% opacity) */}
              <form onSubmit={handleSearch} className="relative w-[798px] h-[36px]">
                {/* Search Icon doubles as a submit button */}
                <button type="submit" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#AEB5C5] hover:text-[#F5F7FA] transition-colors">
                  <Search size={16} />
                </button>
                <input 
                  type="text" 
                  placeholder="Search by Student ID" 
                  className="w-full h-full bg-[#0A0A0F] border-[1.5px] border-[#FFFFFF8F] rounded-[30px] pl-12 pr-4 text-[#F5F7FA] font-jakarta text-[14px] focus:outline-none focus:border-indigo-400 transition-colors placeholder-[#AEB5C5]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              {/* Selected Student ID & Clear Button */}
              {analyticsData && (
                <div className="flex items-center gap-6">
                  <div className="flex flex-col text-right">
                    <span className="font-jakarta text-[11px] text-[#AEB5C5] leading-tight">Selected Student</span>
                    <span className="font-space text-[14px] font-bold text-[#F5F7FA] leading-tight">
                      ID : {analyticsData.student_id}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setAnalyticsData(null);
                    }}
                    className="h-[36px] px-6 rounded-[30px] border-[1.5px] border-[#FFFFFF8F] font-jakarta text-[14px] text-[#F5F7FA] hover:bg-[#1F1E38] transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Student Header Data (bg #12131A80, perfectly top-aligned) */}
            {analyticsData && (
              <div className="bg-[#12131A80] rounded-[16px] px-8 py-6 flex justify-between items-center mb-10">
                
                <div className="flex flex-col gap-2">
                  <span className="font-jakarta text-[12px] text-[#AEB5C5]">Selected Student ID</span>
                  <span className="font-space text-[36px] font-bold text-[#F5F7FA] leading-none tracking-tight">
                    {analyticsData.student_id}
                  </span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className="font-jakarta text-[12px] text-[#AEB5C5]">Cluster</span>
                  <span className="font-manrope text-[20px] font-semibold text-[#F5F7FA] leading-none">
                    {analyticsData.cluster}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-jakarta text-[12px] text-[#AEB5C5]">Risk Level</span>
                  <span className={`font-manrope text-[20px] font-semibold leading-none ${analyticsData.risk_level === 'Critical' ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>
                    {analyticsData.risk_level}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-jakarta text-[12px] text-[#AEB5C5]">Risk Score</span>
                  <span className={`font-space text-[20px] font-bold leading-none ${analyticsData.risk_level === 'Critical' ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>
                    {analyticsData.risk_score}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-jakarta text-[12px] text-[#AEB5C5]">Predicted Outcome</span>
                  <span className={`font-manrope text-[20px] font-semibold leading-none ${analyticsData.predicted_outcome === 'Fail' ? 'text-[#EF4444]' : 'text-[#10CC0D]'}`}>
                    {analyticsData.predicted_outcome}
                  </span>
                </div>

                <div className="flex flex-col gap-2 border-r border-[#F5F7FA1A] pr-8">
                  <span className="font-jakarta text-[12px] text-[#AEB5C5]">Behavioral Risk Index</span>
                  <span className="font-space text-[20px] font-bold text-[#F5F7FA] leading-none">
                    {analyticsData.behavioral_risk_index}
                  </span>
                </div>

                {/* Right Side: See Recommendations Button */}
                <div className="flex items-center pl-2">
                  <button 
                    onClick={() => {
                      setActiveTab('prescriptive');
                      fetchPrescriptiveData(analyticsData.student_id);
                    }}
                    className="flex items-center gap-3 bg-[#7C5CFC] hover:bg-[#6023FA] text-[#F5F7FA] rounded-[8px] px-5 py-2.5 transition-all shadow-[0_4px_15px_rgba(124,92,252,0.2)]"
                  >
                    <div className="flex flex-col text-left font-manrope font-semibold text-[13px] leading-tight">
                      <span>See</span>
                      <span>Recommendations</span>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>

              </div>
            )}


            {/* Middle Row: Probabilities, SHAP, Cluster */}
            {analyticsData && (
              <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1.15fr_1fr] gap-6 mb-8 items-stretch">
                
                {/* 1. Predicted Outcome & Probabilities */}
                <div className="bg-[#12131A] rounded-[16px] p-6 shadow-lg flex flex-col h-full">
                  
                  <h3 className="font-manrope text-[20px] font-semibold text-[#F5F7FA] mb-4">
                    Predicted Outcome & Probabilities
                  </h3>
                  
                  <div className="flex-1 flex items-center justify-between gap-6">
                    
                    {/* Left Side: Donut Chart */}
                    <div className="w-[50%] h-[200px] relative flex items-center justify-center">
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-3 text-center">
                        <span className="font-manrope text-[22px] font-bold text-[#F5F7FA] leading-tight tracking-tight w-full truncate">
                          {analyticsData.predicted_outcome}
                        </span>
                        <span className="font-space text-[20px] font-bold text-[#F5F7FA] leading-tight mt-1">
                          {analyticsData.probabilities.find(p => p.name === analyticsData.predicted_outcome)?.value || 0}%
                        </span>
                        <span className="font-jakarta text-[11px] text-[#AEB5C5] mt-1">
                          Probability
                        </span>
                      </div>
                      
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={analyticsData.probabilities} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            innerRadius="75%" 
                            outerRadius="100%" 
                            stroke="none"
                          >
                            {analyticsData.probabilities.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Right Side: Legend Table */}
                    <div className="w-[50%] flex flex-col justify-center">
                      <div className="border-t border-[#F5F7FA4D]">
                        {analyticsData.probabilities.map((prob, i) => (
                          <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#F5F7FA4D] gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: prob.fill }}></div>
                              <span className="font-jakarta text-[15px] font-medium text-[#F5F7FA] truncate">{prob.name}</span>
                            </div>
                            <span className="font-space text-[15px] text-[#F5F7FA] shrink-0">{prob.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                  </div>

                  {/* Bottom: Entropy */}
                  <p className="font-jakarta text-[14px] text-[#AEB5C5] mt-auto pt-2">
                    Prediction Entropy : <span className="font-space text-[#F5F7FA]">{analyticsData.prediction_entropy}</span>
                  </p>
                  
                </div>

                {/* 2. Key Risk Drivers */}
                <div className="bg-[#12131A] rounded-[16px] p-6 shadow-lg flex flex-col h-full">
                  
                  {/* Header */}
                  <h3 className="font-manrope text-[20px] font-semibold text-[#F5F7FA] mb-4">
                    Key Risk Drivers
                  </h3>

                  {/* Toggle Switch Container */}
                  <div className="flex bg-[#151620] p-1 rounded-lg w-fit mb-6">
                    <button 
                      onClick={() => setShapTab('negative')}
                      className={`px-4 py-1.5 text-[14px] font-jakarta font-medium text-[#F5F7FA] rounded-md transition-all ${shapTab === 'negative' ? 'bg-[#1F1E38]' : 'bg-transparent hover:bg-[#1F1E38]'}`}
                    >
                      Negative Impact
                    </button>
                    <button 
                      onClick={() => setShapTab('positive')}
                      className={`px-4 py-1.5 text-[14px] font-jakarta font-medium text-[#F5F7FA] rounded-md transition-all ${shapTab === 'positive' ? 'bg-[#1F1E38]' : 'bg-transparent hover:bg-[#1F1E38]'}`}
                    >
                      Positive Impact
                    </button>
                  </div>
                  
                  {/* SHAP Bars Container */}
                  <div className="space-y-5 flex-1 flex flex-col justify-center">
                    {(() => {
                      // Filter for positive/negative, sort by magnitude, and take the top 5
                      const filteredFactors = analyticsData.shap_factors
                        .filter(f => shapTab === 'negative' ? f.impact < 0 : f.impact > 0)
                        .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
                        .slice(0, 5);

                      if (filteredFactors.length === 0) {
                        return <div className="text-[#F5F7FA] text-[12px] font-jakarta">No {shapTab} drivers found.</div>;
                      }

                      const maxImpact = Math.max(...filteredFactors.map(f => Math.abs(f.impact))) || 1;
                      
                      return filteredFactors.map((factor, idx) => {
                        const isNegative = factor.impact < 0;
                        const widthPct = (Math.abs(factor.impact) / maxImpact) * 100;
                        
                        return (
                          <div key={idx} className="flex items-center justify-between">
                            {/* Feature Name (Updated to 12px #F5F7FA) */}
                            <span className="font-jakarta text-[12px] text-[#F5F7FA] w-[45%] truncate pr-4" title={factor.feature}>
                              {factor.feature}
                            </span>
                            
                            {/* Bar Container - growing to the right from a vertical axis */}
                            <div className="w-[35%] flex items-center">
                              <div className="w-px h-4 bg-[#F5F7FA4D] mr-2 shrink-0"></div>
                              <div 
                                className={`h-1.5 rounded-full ${isNegative ? 'bg-[#EF4444]' : 'bg-[#10CC0D]'}`} 
                                style={{ width: `${widthPct}%` }}
                              ></div>
                            </div>
                            
                            {/* Exact Impact Number (Space Grotesk) */}
                            <span className={`font-space text-[14px] w-[20%] text-right ${isNegative ? 'text-[#EF4444]' : 'text-[#10CC0D]'}`}>
                              {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(3)}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* 3. Cluster Information */}
                <div className="bg-[#12131A] rounded-[16px] p-6 shadow-lg flex flex-col h-full">
                  
                  <h3 className="font-manrope text-[20px] font-semibold text-[#F5F7FA] mb-6">
                    Cluster Information
                  </h3>
                  
                  <div className="flex items-center gap-4 mb-4">
                     {/* Updated Icon from cluster.svg */}
                     <img src={clusterIcon} alt="Cluster" className="w-[48px] h-[48px] shrink-0" />
                     
                     <span className="font-jakarta text-[32px] font-semibold text-[#F5F7FA] leading-none tracking-tight">
                        {analyticsData.cluster}
                     </span>
                  </div>
                  
                  {/* Dynamic Cluster Description */}
                  <p className="font-jakarta text-[12px] font-normal text-[#F5F7FA] mb-8 leading-relaxed max-w-[363px]">
                    {analyticsData.cluster_description || "Behavioral and learning patterns currently under analysis for this segment."}
                  </p>
                  
                  {/* Dynamic Stats */}
                  <div className="flex flex-col gap-6 mt-auto">
                    <div className="flex justify-between items-center">
                      <span className="font-jakarta text-[14px] text-[#F5F7FA]">Students in Cluster</span>
                      <span className="font-space text-[14px] text-[#F5F7FA]">
                        {analyticsData.cluster_student_count || 0} ({analyticsData.cluster_percentage || 0}%)
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-jakarta text-[14px] text-[#F5F7FA]">Average Risk Score</span>
                      <span className="font-space text-[14px] text-[#F5F7FA]">
                        {analyticsData.cluster_avg_risk_score || "0.0"}/5
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-jakarta text-[14px] text-[#F5F7FA]">Common Outcome</span>
                      <span className="font-jakarta text-[14px] text-[#F5F7FA]">
                        {analyticsData.cluster_common_outcome || "N/A"}
                      </span>
                    </div>
                  </div>
                  
                </div>

              </div>
            )}

            {/* Bottom Row: Peer Comparison & Digital Twins */}
            {analyticsData && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8 items-stretch">
              
              {/* 1. Performance vs Peer Group Card */}
              <div className="bg-[#12131A] rounded-[16px] p-6 shadow-lg flex flex-col h-full w-full">
                
                {/* Header & Legend */}
                <div className="flex flex-col mb-8 gap-4">
                  <h3 className="font-manrope text-[20px] font-semibold text-[#F5F7FA]">
                    Performance vs Peer Group
                  </h3>
                  
                  <div className="flex items-center gap-6 font-jakarta text-[12px] text-[#AEB5C5]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-1.5 bg-[#F5F7FA] rounded-full shrink-0"></div>
                      <span className="text-[#F5F7FA]">This Student</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-1.5 border border-dashed border-[#10CC0D] bg-transparent rounded-full shrink-0"></div>
                      <span className="text-[#F5F7FA]">Successful Peers average</span>
                    </div>
                  </div>
                </div>

                {/* Bar Chart Container */}
                <div className="w-full flex-1 min-h-[250px]">
                  {(() => {
                    const normalizedData = (analyticsData.peer_comparison || []).map(item => {
                      const studentVal = Number(item.student) || 0;
                      const peerVal = Number(item.peers) || 0;
                      const maxVal = Math.max(studentVal, peerVal) || 1;
                      
                      return {
                        ...item,
                        displayStudent: (studentVal / maxVal) * 100,
                        displayPeers: (peerVal / maxVal) * 100,
                        origStudent: studentVal,
                        origPeers: peerVal
                      };
                    });

                    const CustomXAxisTick = ({ x, y, payload }) => {
                      let line1 = payload.value;
                      let line2 = "";
                      
                      if (payload.value.includes("Assessment Mean")) { line1 = "Assessment Mean"; line2 = "Score"; }
                      if (payload.value.includes("Early Engagement")) { line1 = "Early Engagement"; line2 = "Ratio"; }
                      if (payload.value.includes("Weighted Total")) { line1 = "Weighted Total"; line2 = "Score"; }

                      return (
                        <g transform={`translate(${x},${y})`}>
                          {/* We removed dy from text, and applied it to the tspans directly */}
                          <text x={0} y={0} textAnchor="middle" fill="#F5F7FA" fontSize={12} fontFamily="Plus Jakarta Sans">
                            {/* dy="16" pushes the first line below the bars */}
                            <tspan x="0" dy="16">{line1}</tspan>
                            {/* dy="16" pushes the second line below the first line */}
                            {line2 && <tspan x="0" dy="16">{line2}</tspan>}
                          </text>
                        </g>
                      );
                    };

                    const CustomTooltip = ({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#151620] border border-[#F5F7FA4D] rounded-[8px] p-3 shadow-lg z-50 relative">
                            <p className="font-jakarta text-[12px] text-[#F5F7FA] mb-2 font-semibold">{label}</p>
                            <p className="font-jakarta text-[12px] text-[#F5F7FA] flex justify-between gap-6">
                              <span>This Student:</span> 
                              <span className="font-space font-bold">{data.origStudent}</span>
                            </p>
                            <p className="font-jakarta text-[12px] text-[#10CC0D] flex justify-between gap-6 mt-1">
                              <span>Peers Average:</span> 
                              <span className="font-space font-bold">{data.origPeers}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    };

                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        {/* bottom: 50 ensures the container has plenty of room for both lines of text */}
                        <BarChart data={normalizedData} margin={{ top: 10, right: 10, left: 10, bottom: 50 }} barGap={6}>
                          <CartesianGrid horizontal={false} vertical={false} />
                          <XAxis 
                            dataKey="metric" 
                            interval={0} 
                            tick={<CustomXAxisTick />} 
                            tickLine={false} 
                            axisLine={false}
                          />
                          <YAxis hide={true} domain={[0, 100]} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff0a' }} />
                          
                          <Bar dataKey="displayStudent" fill="#F5F7FA" radius={[4, 4, 0, 0]} barSize={36} />
                          <Bar 
                            dataKey="displayPeers" 
                            fill="#10CC0D1A" 
                            stroke="#10CC0D" 
                            strokeDasharray="4 4" 
                            strokeWidth={1.5} 
                            radius={[4, 4, 0, 0]} 
                            barSize={36} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>
              </div>


              {/* 2. Digital Twin Match Card (Typography & Colors Fixed) */}
              <div className="bg-[#12131A] rounded-[16px] p-6 shadow-lg flex flex-col h-full w-full justify-between">
                <div>
                  {/* Top Bar inside card */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-manrope text-[20px] font-semibold text-[#F5F7FA]">
                        Digital Twin Match
                      </h3>
                      <p className="font-jakarta text-[12px] text-[#AEB5C5]">
                        Comparing behavioral learning patterns
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-jakarta text-[11px] text-[#AEB5C5] block">Similarity Score</span>
                      <span className="font-space text-[24px] font-bold text-[#10CC0D]">
                        {analyticsData.similarity_score}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Top 3 Successful Peers */}
                    <div>
                      <h4 className="font-manrope text-[16px] font-semibold text-[#F5F7FA] mb-1">
                        Top 3 Successful Peers
                      </h4>
                      <p className="font-jakarta text-[12px] text-[#AEB5C5] mb-4 leading-relaxed">
                        The three most behaviorally similar students who successfully completed the course.
                      </p>
                      
                      <div className="space-y-3">
                        {analyticsData.digital_twins.map((twin, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-[#151620] border border-[#F5F7FA4D] px-4 py-2.5 rounded-[10px]">
                            <span className="font-jakarta text-[14px] text-[#F5F7FA]">
                              {idx + 1}. ID : <span className="font-space">{twin.id}</span>
                            </span>
                            <span className="font-jakarta text-[14px] text-[#AEB5C5]">
                              Similarity : <span className="font-space text-[#10CC0D] font-semibold">{twin.similarity}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Improvement Gaps */}
                    <div>
                      <h4 className="font-manrope text-[16px] font-semibold text-[#F5F7FA] mb-1">
                        Key Improvement Gaps
                      </h4>
                      <p className="font-jakarta text-[12px] text-[#AEB5C5] mb-4 leading-relaxed">
                        Closing these academic differences can improve predicted outcomes.
                      </p>
                      
                      <div className="space-y-4">
                        {(() => {
                          // 1. Get the real data from the bar chart next to it
                          const dynamicGaps = (analyticsData.peer_comparison || [])
                            // 2. Only keep metrics where the student is strictly BEHIND the peer average
                            .filter(item => Number(item.student) < Number(item.peers))
                            // 3. Sort them by the largest percentage gap
                            .sort((a, b) => {
                              const gapA = (Number(a.peers) - Number(a.student)) / (Number(a.peers) || 1);
                              const gapB = (Number(b.peers) - Number(b.student)) / (Number(b.peers) || 1);
                              return gapB - gapA;
                            })
                            // 4. Take the top 2 biggest gaps to fit the UI nicely
                            .slice(0, 2);

                          // 5. If they have no gaps, praise them!
                          if (dynamicGaps.length === 0) {
                            return (
                              <div className="font-jakarta text-[13px] text-[#10CC0D] bg-[#10CC0D1A] p-3 rounded-lg border border-[#10CC0D4D] mt-4">
                                Student is currently outperforming the successful peer average across all key metrics!
                              </div>
                            );
                          }

                          return dynamicGaps.map((gap, idx) => (
                            <div key={idx} className="border-b border-[#F5F7FA4D] pb-3 last:border-0">
                              <span className="font-jakarta text-[13px] text-[#AEB5C5] block mb-1">
                                {gap.metric}
                              </span>
                              <div className="flex items-center gap-3 font-space text-[14px]">
                                {/* Force 2 decimal places for the student score */}
                                <span className="text-[#F5F7FA]">
                                  {Number(gap.student).toFixed(2)}
                                </span>
                                
                                <span className="text-[#AEB5C5]">&rarr;</span>
                                
                                {/* Force 2 decimal places for the peer target */}
                                <span className="text-[#10CC0D] font-semibold">
                                  {Number(gap.peers).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            )}
          </div>
        )}

        {/* Render Prescriptive AI Page */}
        {activeTab === 'prescriptive' && (
          <div className="w-full animate-fade-in">
            
            {/* The crucial opening curly brace for the Javascript logic was missing! */}
            {isPrescriptiveLoading ? (
              
              <div className="flex flex-col items-center justify-center min-h-[600px] gap-5">
                <div className="w-12 h-12 border-4 border-[#7C5CFC] border-t-transparent rounded-full animate-spin"></div>
                <div className="flex flex-col items-center gap-1">
                   <p className="font-manrope text-[18px] font-semibold text-[#F5F7FA]">Running ML Counterfactuals...</p>
                   <p className="font-jakarta text-[13px] text-[#AEB5C5]">Generating personalized action plan</p>
                </div>
              </div>

            ) : prescriptiveError ? (
              
              <div className="flex items-center justify-center min-h-[600px] text-[#EF4444] font-manrope">
                Error: {prescriptiveError}
              </div>

            ) : prescriptiveData ? (
              
              <>
                {/* 1. Global Context Banner (Top Row - 2 Blocks) */}
                <div className="flex items-center gap-6 mb-8 w-full">
                  
                  {/* Block 1: Student Info */}
                  <div className="bg-[#12131A] rounded-[16px] p-5 w-[329px] h-[114px] flex items-center justify-between shrink-0 shadow-lg border border-[#F5F7FA0A]">
                    <div className="flex flex-col gap-1">
                      <span className="font-jakarta text-[12px] text-[#AEB5C5]">Selected Student ID</span>
                      <span className="font-space text-[36px] font-bold text-[#F5F7FA] leading-none tracking-tight">
                        {prescriptiveData.student_context.student_id}
                      </span>
                    </div>
                    <div className="flex flex-col justify-center gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-jakarta text-[10px] text-[#AEB5C5] leading-tight">Cluster</span>
                        <span className="font-manrope text-[14px] font-semibold text-[#F5F7FA] leading-tight">
                          {prescriptiveData.student_context.cluster_name}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-jakarta text-[10px] text-[#AEB5C5] leading-tight">Risk Level</span>
                        <span className={`font-manrope text-[14px] font-semibold leading-tight ${
                          prescriptiveData.student_context.current_risk_level === 'Critical' ? 'text-[#FF0000]' : 'text-[#F59E0B]'
                        }`}>
                          {prescriptiveData.student_context.current_risk_level}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Block 2: AI Branding & Outcome Shift */}
                  <div className="bg-[#12131A] rounded-[16px] px-8 py-5 flex-1 h-[114px] flex items-center justify-between shadow-lg border border-[#F5F7FA0A]">
                    <div className="flex items-center gap-5">
                      <img src={aiIcon} alt="Prescriptive AI" className="w-[60px] h-[60px] shrink-0" />
                      <div className="flex flex-col gap-1.5">
                        <span className="font-manrope text-[20px] font-semibold text-[#F5F7FA] leading-none">Prescriptive AI</span>
                        <span className="font-jakarta text-[14px] text-[#AEB5C5] leading-tight max-w-[380px]">
                          AI-powered recommendations and personalized actions to help improve student outcomes
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 border-l border-[#F5F7FA1A] pl-8 h-full py-1">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <span className="font-jakarta text-[12px] text-[#AEB5C5] leading-none">Current Prediction</span>
                        <span className={`font-manrope text-[24px] font-bold leading-none ${
                          ['Fail', 'Withdrawn'].includes(prescriptiveData.student_context.current_prediction) 
                            ? 'text-[#FF0000]' 
                            : 'text-[#22C55E]'
                        }`}>
                          {prescriptiveData.student_context.current_prediction}
                        </span>
                      </div>
                      <span className="text-[#F5F7FA] text-2xl font-light">&rarr;</span>
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <span className="font-jakarta text-[12px] text-[#AEB5C5] leading-none">Target Outcome</span>
                        <span className="font-manrope text-[24px] font-bold text-[#22C55E] leading-none">
                          {prescriptiveData.student_context.target_outcome}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. Main 2-Column Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10 items-stretch">
                  
                  {/* Left Column: AI Advisor Report Container */}
                  <div className="bg-[#12131A] rounded-[16px] p-6 shadow-lg flex flex-col border border-[#F5F7FA0A]">
                    
                    <div className="flex items-start gap-4 mb-8">
                        <img src={reportIcon} alt="Report" className="w-[42px] h-[42px] shrink-0 mt-1" />
                        <div className="flex flex-col gap-1.5">
                          <h2 className="font-manrope text-[24px] font-semibold text-[#F5F7FA] leading-none">AI Advisor Report</h2>
                          <p className="font-jakarta text-[14px] text-[#AEB5C5] leading-tight">
                              Personalized actionable recommendations based on AI analysis
                          </p>
                        </div>
                    </div>

                    <div className="flex items-stretch justify-between p-6 rounded-[12px] border border-[#F5F7FA1A] mb-10 bg-[#12131A]">
                        <div className="flex flex-col items-center text-center flex-1">
                          <img src={targetIcon} alt="Target" className="mb-3 w-6 h-6" />
                          <span className="font-jakarta text-[12px] text-[#AEB5C5] mb-2">Top Priority</span>
                          <span className="font-manrope text-[16px] font-semibold text-[#7C5CFC] leading-tight max-w-[120px]">
                            {prescriptiveData.ai_advisor_report.top_metrics.top_priority}
                          </span>
                        </div>

                        <div className="w-px bg-[#F5F7FA1A] my-2"></div>

                        <div className="flex flex-col items-center text-center flex-1">
                          <svg className="mb-3 text-[#F5F7FA] w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                          <span className="font-jakarta text-[12px] text-[#AEB5C5] mb-2">Intervention Confidence</span>
                          <span className="font-manrope text-[16px] font-semibold text-[#7C5CFC] leading-none">
                            {prescriptiveData.ai_advisor_report.top_metrics.intervention_confidence_percent}%
                          </span>
                        </div>

                        <div className="w-px bg-[#F5F7FA1A] my-2"></div>

                        {/* Shift */}
                    <div className="flex flex-col items-center justify-center text-center flex-1">
                       <svg className="mb-3 text-[#22C55E] w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                       <span className="font-jakarta text-[12px] text-[#AEB5C5] mb-2">Estimated Outcome Shift</span>
                       <div className="flex items-center gap-1">
                          <span className={`font-manrope text-[16px] font-semibold ${
                            ['Fail', 'Withdrawn'].includes(prescriptiveData.student_context.current_prediction) ? 'text-[#FF0000]' : 'text-[#22C55E]'
                          }`}>
                            {prescriptiveData.student_context.current_prediction}
                          </span>
                          <span className="text-[#AEB5C5] text-[14px]">&rarr;</span>
                          <span className="font-manrope text-[16px] font-semibold text-[#22C55E]">
                            {prescriptiveData.student_context.target_outcome}
                          </span>
                       </div>
                    </div>

                        <div className="w-px bg-[#F5F7FA1A] my-2"></div>

                        <div className="flex flex-col items-center text-center flex-1">
                          <svg className="mb-3 text-[#F5F7FA] w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                          <span className="font-jakarta text-[12px] text-[#AEB5C5] mb-2">Similar Students Improved</span>
                          <span className="font-manrope text-[16px] font-semibold text-[#7C5CFC] leading-none">
                            {prescriptiveData.ai_advisor_report.top_metrics.similar_students_improved_percent}%
                          </span>
                        </div>
                    </div>

                    <h3 className="font-manrope text-[20px] font-semibold text-[#F5F7FA] mb-1">Recommended Action Plan</h3>
                    <p className="font-jakarta text-[14px] text-[#AEB5C5] mb-6">Step-by-step actions to improve the predicted outcome</p>

                    <div className="flex flex-col gap-4 flex-1">
                        {prescriptiveData.ai_advisor_report.recommended_action_plan.map((action, idx, arr) => {
                          const isLast = idx === arr.length - 1;
                          const bgColors = ['bg-[#7C5CFC]/50', 'bg-[#2D70F7]/50', 'bg-[#FDA41A]/50', 'bg-[#22C55E]/50'];
                          const iconBg = isLast ? 'bg-transparent' : bgColors[idx % 4];

                          const renderIcon = () => {
                            if (idx === 0) return <img src={calendarIcon} alt="Calendar" className="w-6 h-6" />;
                            if (idx === 1) return <img src={calendar2Icon} alt="Calendar 2" className="w-6 h-6" />;
                            if (idx === 2) return <img src={cursorIcon} alt="Cursor" className="w-6 h-6" />;
                            if (idx === 3) return <img src={upIcon} alt="Up" className="w-6 h-6" />;
                            if (isLast) return <img src={starsIcon} alt="Start" className="w-6 h-6" />;
                          };

                          return (
                            <div 
                              key={idx} 
                              className={`flex items-center justify-between p-3 rounded-[12px] transition-all ${
                                isLast ? 'bg-[#0A0A0F] mt-2' : 'bg-transparent'
                              }`}
                              style={isLast ? {
                                boxShadow: 'inset 0px 4px 25px 0px rgba(96, 35, 250, 0.25), inset 0px -4px 20px 0px rgba(96, 35, 250, 0.25)'
                              } : {}}
                            >
                                <div className="flex items-center gap-4 w-full">
                                  <div className={`w-12 h-12 rounded-[8px] flex items-center justify-center shrink-0 ${iconBg}`}>
                                      {renderIcon()}
                                  </div>
                                  
                                  <div className="flex flex-col justify-center">
                                    <span className={`font-manrope font-semibold mb-0.5 ${isLast ? 'text-[16px] text-[#7C5CFC]' : 'text-[14px] text-[#F5F7FA]'}`}>
                                      {isLast ? "Start assesments early and maintain consistency" : action.title}
                                    </span>
                                    <span className={`font-jakarta ${isLast ? 'text-[10px] text-[#AEB5C5]' : 'text-[10px] text-[#AEB5C5]'}`}>
                                      {isLast ? "Follow the plan. Track Progress. Achieve your goal." : action.description}
                                    </span>
                                  </div>
                                </div>

                                {!isLast && (
                                  <div className="flex flex-col items-center justify-center rounded-[8px] border border-[#F5F7FA33] bg-[#151620] shrink-0 w-[101px] h-[48px]">
                                    <span className="font-jakarta text-[12px] font-medium text-[#F5F7FA] leading-tight mb-0.5">{action.timeline_tag}</span>
                                    <span className="font-jakarta text-[10px] text-[#AEB5C5] leading-tight">{action.duration}</span>
                                  </div>
                                )}
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Right Column: Risk Simulator Container */}
                  <div className="bg-[#12131A] rounded-[16px] p-6 shadow-lg flex flex-col border border-[#F5F7FA0A] h-full">
                    
                    <div className="flex items-start gap-4 mb-6">
                        <img src={treeIcon} alt="Risk Simulator" className="w-[42px] h-[42px] shrink-0 mt-1" />
                        <div className="flex flex-col gap-1.5">
                          <h2 className="font-manrope text-[24px] font-semibold text-[#F5F7FA] leading-none">Risk Simulator & Algorithmic Resource</h2>
                          <p className="font-jakarta text-[14px] text-[#AEB5C5] leading-tight">
                              See how changes in Key Behaviors can improve the outcome
                          </p>
                        </div>
                    </div>

                    <div className="bg-[#0A0A0F] rounded-[12px] p-5 mb-6">
                        <h3 className="font-manrope text-[16px] font-semibold text-[#F5F7FA] mb-1.5">1. What If Analysis</h3>
                        <p className="font-jakarta text-[12px] text-[#AEB5C5] mb-4">Adjust Key Behaviors to see potential improvement in the risk score.</p>
                        
                        <div className="border border-[#F5F7FA8F] rounded-[8px] overflow-hidden">
                          <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-[#F5F7FA1A]">
                                    <th className="font-jakarta text-[12px] font-medium text-[#AEB5C5] pb-3 pt-3 pl-4 w-[45%]">Behavior</th>
                                    <th className="font-jakarta text-[12px] font-medium text-[#AEB5C5] pb-3 pt-3 text-center w-[15%]">Current</th>
                                    <th className="font-jakarta text-[12px] font-medium text-[#AEB5C5] pb-3 pt-3 text-center w-[20%]">Recommended</th>
                                    <th className="font-jakarta text-[12px] font-medium text-[#AEB5C5] pb-3 pt-3 pr-4 text-right w-[20%]">Risk Score Impact</th>
                                </tr>
                              </thead>
                              <tbody>
                                {prescriptiveData.risk_simulator.what_if_analysis.behaviors.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-[#1F1E38]/30 transition-colors">
                                      <td className="font-manrope text-[12px] text-[#F5F7FA] py-2.5 pl-4">{item.name}</td>
                                      <td className="font-space text-[12px] text-[#F5F7FA] py-2.5 text-center">{item.current_val}</td>
                                      <td className="font-space text-[12px] text-[#F5F7FA] py-2.5 text-center">{item.recommended_val}</td>
                                      <td className="font-space text-[12px] font-medium text-[#22C55E] py-2.5 pr-4 text-right">
                                          {item.risk_score_impact > 0 ? '+' : ''}{Number(item.risk_score_impact).toFixed(2)}
                                      </td>
                                    </tr>
                                ))}
                              </tbody>
                              <tfoot className="border-t border-[#F5F7FA33]">
                                <tr>
                                    <td colSpan="3" className="font-jakarta text-[16px] font-medium text-[#22C55E] pt-4 pb-3 pl-4">Total Potential Risk Reduction</td>
                                    <td className="font-space text-[16px] font-bold text-[#22C55E] pt-4 pb-3 pr-4 text-right">
                                      {Number(prescriptiveData.risk_simulator.what_if_analysis.total_potential_risk_reduction).toFixed(2)}
                                    </td>
                                </tr>
                              </tfoot>
                          </table>
                        </div>
                    </div>

                    <div className="bg-[#0A0A0F] rounded-[12px] p-5 flex-1 flex flex-col">
                        <h3 className="font-manrope text-[16px] font-semibold text-[#F5F7FA] mb-1.5">2. Outcome probability after changes</h3>
                        <p className="font-jakarta text-[12px] text-[#AEB5C5] mb-6">Predicted probability distribution after meeting recommended targets</p>

                        <div className="flex items-stretch justify-between gap-6 flex-1 min-h-[280px]">
                          
                          <div className="w-[65%] h-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                  data={prescriptiveData.risk_simulator.post_intervention_predictions.probability_distribution} 
                                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                    <CartesianGrid vertical={false} horizontal={false} />
                                    <XAxis 
                                      dataKey="name" 
                                      stroke="#AEB5C5" 
                                      tick={{ fill: '#AEB5C5', fontSize: 10, fontFamily: 'Plus Jakarta Sans' }} 
                                      tickLine={false} 
                                      axisLine={false}
                                      dy={10}
                                    />
                                    <YAxis 
                                      stroke="#AEB5C5" 
                                      tick={{ fill: '#AEB5C5', fontSize: 10, fontFamily: 'Manrope' }} 
                                      tickLine={false} 
                                      axisLine={false}
                                      tickFormatter={(value) => `${value}%`}
                                      domain={[0, 100]}
                                    />
                                    <Tooltip 
                                      cursor={{ fill: '#ffffff0a' }}
                                      contentStyle={{ backgroundColor: '#151620', borderColor: '#F5F7FA1A', borderRadius: '8px' }}
                                      itemStyle={{ color: '#F5F7FA', fontFamily: 'Manrope' }}
                                      formatter={(value) => [`${value}%`, 'Probability']}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={48}>
                                      {prescriptiveData.risk_simulator.post_intervention_predictions.probability_distribution.map((entry, index) => {
                                          let barColor = '#AEB5C5';
                                          if (entry.name === 'Fail') barColor = '#FF0000';
                                          if (entry.name === 'Pass') barColor = '#22C55E';
                                          if (entry.name === 'Distinction') barColor = '#38BDF8';
                                          
                                          return <Cell key={`cell-${index}`} fill={barColor} />;
                                      })}
                                    </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                          </div>

                          <div className="w-[35%] h-full flex flex-col justify-center gap-6 border border-[#F5F7FA1A] bg-transparent rounded-[12px] p-5">
                              
                              <div className="flex flex-col">
                                <span className="font-jakarta text-[10px] text-[#AEB5C5] mb-1">Most likely outcome</span>
                                <span className="font-manrope text-[20px] font-bold text-[#22C55E] leading-none">
                                    {prescriptiveData.risk_simulator.post_intervention_predictions.most_likely_outcome}
                                </span>
                              </div>

                              <div className="flex flex-col">
                                <span className="font-jakarta text-[10px] text-[#AEB5C5] mb-1">Confidence</span>
                                <span className="font-manrope text-[20px] font-bold text-[#F5F7FA] leading-none">
                                    {prescriptiveData.risk_simulator.post_intervention_predictions.confidence_percent}%
                                </span>
                              </div>

                              <div className="flex flex-col">
                                <span className="font-jakarta text-[10px] text-[#AEB5C5] mb-1">Risk score after changes</span>
                                <span className="font-manrope text-[16px] font-bold text-[#22C55E] leading-none">
                                    {Number(prescriptiveData.risk_simulator.post_intervention_predictions.new_risk_score).toFixed(2)}
                                    <span className="text-[#AEB5C5] text-[14px]"> / {Number(prescriptiveData.risk_simulator.post_intervention_predictions.max_risk_score).toFixed(1)}</span>
                                </span>
                              </div>
                              
                          </div>
                        </div>

                    </div>
                  </div>

                </div>
              </>

            ) : (
              
              <div className="flex items-center justify-center min-h-[600px] text-[#AEB5C5] font-jakarta">
                No recommendation data available. Please select a student from the Analytics tab.
              </div>

            )}
            
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, colorClass, subtitle, percentage }) {
  // Check if value exists before calling toLocaleString, fallback to '0'
  const displayValue = (value !== undefined && value !== null) 
    ? (typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(2) : value.toLocaleString()) 
    : '0';

  // Ensure percentage stays between 0 and 100 for the CSS width
  const safePercentage = Math.min(Math.max(percentage || 0, 0), 100);

  return (
    <div className="flex flex-col w-[281px] h-[138px] rounded-[16px] pt-[12px] pr-[16px] pb-[12px] pl-[16px] gap-[10px] bg-[#12131A] shadow-lg relative overflow-hidden transition-all hover:border-gray-700 hover:bg-[#151c2b]">
      
      {/* Top Section: Icon and Numbers */}
      <div className="flex items-center gap-3">
        {/* Icon Container - Uses the passed color class */}
        <div className={`w-[52px] h-[52px] flex items-center justify-center rounded-xl text-white ${colorClass}`}>
          {icon}
        </div>
        
        {/* Text Container */}
        {/* Text Container */}
        <div className="flex flex-col justify-center">
          <h3 className="font-jakarta text-[16px] text-[#F5F7FA] font-medium mb-1">
            {title}
          </h3>
          <div className="font-space text-[36px] font-bold text-[#F5F7FA] leading-none tracking-tight">
            {displayValue}
          </div>
        </div>
      </div>

      {/* Bottom Section: Subtitle and Progress Bar */}
      <div className="mt-auto flex flex-col gap-2">
        {subtitle && (
          <div className="font-jakarta text-[12px] text-[#AEB5C5] font-medium">
            {subtitle}
          </div>
        )}
        
        {/* Progress Bar Container (Gray Background) */}
        <div className="h-[3px] w-full bg-gray-700 rounded-full overflow-hidden">
          {/* Active Progress Line (Colored) */}
          <div 
            className={`h-full rounded-full ${colorClass}`} 
            style={{ width: `${safePercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default App;