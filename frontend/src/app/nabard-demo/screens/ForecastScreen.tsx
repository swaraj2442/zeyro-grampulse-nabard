"use client";

import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, 
  ComposedChart
} from 'recharts';
import { 
  Download, Calendar, ChevronDown, TrendingUp, IndianRupee, ShieldAlert, Wallet, BarChart2, AlertTriangle, ArrowRight, RotateCcw,
  Search, Filter, RefreshCw, Sparkles, Info, ArrowUp, ArrowDown, CheckCircle2, Users, MapPin, Database, MoreHorizontal,
  ChevronLeft, ChevronRight, CheckCircle, Clock, Droplets, Zap
} from 'lucide-react';
import { useGramPulse } from '../store/GramPulseContext';
import { selectEnterpriseProfile } from '../store/gramPulseSelectors';
import { Screen } from '../GramPulseApp';

// --- MOCK DATA ---


const CLIMATE_DATA = [
  { day: 'Now', actual: 40 },
  { day: '30D', actual: 42 },
  { day: '90D', forecast: 50, lower: 45, upper: 65 },
  { day: '180D', forecast: 65, lower: 55, upper: 80 },
  { day: '365D', forecast: 55, lower: 45, upper: 70 },
];

const INTERVENTION_DATA = [
  { day: 'Now', actual: 0 },
  { day: '30D', actual: 5 },
  { day: '90D', forecast: 12, lower: 8, upper: 16 },
  { day: '180D', forecast: 18, lower: 14, upper: 24 },
  { day: '365D', forecast: 22, lower: 18, upper: 28 },
];


const TABLE_DATA = [
  { ent: 'Shivam Milk Producer Co.', dist: 'Satara', ch: 'Good', ph: 'Excellent', rp: 94, cf: '+ 18%', cf_dir: 'up', cr: 'Low', fc: 92, rec: 'Increase Credit Limit', rec_color: 'text-green-600', updated: 'May 25, 08:30 AM' },
  { ent: 'Patil Dairy Farm', dist: 'Pune', ch: 'Good', ph: 'Good', rp: 86, cf: '+ 10%', cf_dir: 'up', cr: 'Low', fc: 88, rec: 'Maintain Exposure', rec_color: 'text-blue-600', updated: 'May 25, 08:25 AM' },
  { ent: 'Gokul Dairy', dist: 'Kolhapur', ch: 'Moderate', ph: 'Watch', rp: 72, cf: '- 6%', cf_dir: 'down', cr: 'Moderate', fc: 81, rec: 'Monitor Closely', rec_color: 'text-orange-500', updated: 'May 25, 08:20 AM' },
  { ent: 'Krishna Agro Producer Co.', dist: 'Solapur', ch: 'Moderate', ph: 'At Risk', rp: 58, cf: '- 15%', cf_dir: 'down', cr: 'High', fc: 76, rec: 'Intervene Now', rec_color: 'text-red-500', updated: 'May 25, 08:10 AM' },
  { ent: 'Ahmednagar Agro Mills', dist: 'Ahmednagar', ch: 'Good', ph: 'Good', rp: 90, cf: '+ 8%', cf_dir: 'up', cr: 'Low', fc: 89, rec: 'Maintain Exposure', rec_color: 'text-blue-600', updated: 'May 25, 08:15 AM' },
];

interface Props {
  enterprise?: string | null;
  navigateTo?: (s: Screen, ent?: string) => void;
}

// --- COMPONENTS ---

function SparklineMini({ color, isUp }: { color: string, isUp: boolean }) {
  const data = Array.from({length: 8}, () => Math.random() * 10);
  if (isUp) data.sort((a,b) => a-b);
  else data.sort((a,b) => b-a);
  
  return (
    <svg width="40" height="12" viewBox="0 0 40 12">
      <path
        d={`M0,${12 - (data[0]/10)*12} ${data.map((d, i) => `L${(i/7)*40},${12 - (d/10)*12}`).join(' ')}`}
        fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function KpiCardTop({ title, value, delta, isUp, icon: Icon, iconColor, iconBg }: any) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-between">
       <div className="flex items-center gap-2 mb-3">
          <div className={`w-6 h-6 rounded-md ${iconBg} flex items-center justify-center`}>
            <Icon size={12} className={iconColor} />
          </div>
          <span className="text-[11px] font-semibold text-gray-700">{title}</span>
       </div>
       <div className="flex items-end justify-between">
          <div>
            <div className="text-[20px] font-bold text-gray-900 leading-none mb-1">{value}</div>
            <div className={`text-[10px] font-bold flex items-center gap-1 ${isUp ? 'text-green-600' : 'text-red-500'}`}>
              {isUp ? <ArrowUp size={10} /> : <ArrowDown size={10} />} {delta}
            </div>
          </div>
          <div className="pb-1">
             <SparklineMini color={isUp ? "#16a34a" : "#ef4444"} isUp={isUp} />
          </div>
       </div>
    </div>
  );
}

function MiniForecastChart({ title, data, color, subtitle, isUp, why }: any) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm min-w-[280px] shrink-0 flex flex-col">
       <div className="mb-4">
         <h3 className="text-[12px] font-bold text-gray-900">{title}</h3>
         <p className="text-[10px] text-gray-500">{subtitle}</p>
       </div>
       <div className="flex-1 w-full h-[120px] mb-2">
         
           <ComposedChart width={260} height={120} data={data} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
             <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} dy={10} />
             <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => new Intl.NumberFormat('en-IN', { notation: "compact", maximumFractionDigits: 1 }).format(v)} />
             <Tooltip 
               contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px', padding: '8px' }}
               formatter={(value: any, name: string) => [new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value), name]}
             />
             <Area type="monotone" connectNulls={true} dataKey="upper" stroke="none" fill={color} fillOpacity={0.15} />
             <Area type="monotone" connectNulls={true} dataKey="lower" stroke="none" fill="#ffffff" fillOpacity={1} />
             <Line type="monotone" connectNulls={true} dataKey="actual" stroke={color} strokeWidth={2} dot={{ r: 3, fill: color, strokeWidth: 0 }} />
             <Line type="monotone" connectNulls={true} dataKey="forecast" stroke={color} strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3, fill: color, strokeWidth: 0 }} />
           </ComposedChart>
         
       </div>
       <div className="flex items-center justify-center gap-4 text-[9px] font-medium text-gray-500 mb-3">
         <div className="flex items-center gap-1"><div className={`w-3 h-0.5 border-t border-dashed`} style={{ borderColor: color }}/> Base Forecast</div>
         <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm" style={{ backgroundColor: color, opacity: 0.2 }}/> Confidence Interval</div>
       </div>
       <div className="flex items-center justify-between mt-auto border-t border-gray-50 pt-2">
          <span className={`text-[10px] font-bold ${isUp ? 'text-green-600' : 'text-green-600'}`}>
            {why.label}
          </span>
          <button className="text-[10px] font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-0.5">
            Why? <ChevronDown size={12} />
          </button>
       </div>
    </div>
  );
}

function InsightCard({ icon: Icon, iconColor, iconBg, title, conf, desc, signals, impactBg, impactColor, isAlert }: any) {
  return (
    <div className={`bg-white border ${isAlert ? 'border-red-100' : 'border-gray-100'} rounded-xl p-4 shadow-sm min-w-[320px] shrink-0 flex flex-col`}>
       <div className="flex items-start gap-3 mb-3">
         <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
           <Icon size={14} className={iconColor} />
         </div>
         <div className="flex-1">
           <div className="flex items-start justify-between">
             <h4 className="text-[12px] font-bold text-gray-900 leading-snug w-[180px]">{title}</h4>
             <div className="text-right">
               <div className="text-[12px] font-bold text-gray-900 leading-none">{conf}%</div>
               <div className="text-[8px] font-medium text-gray-500 uppercase mt-0.5">Confidence</div>
             </div>
           </div>
         </div>
       </div>
       <p className="text-[11px] text-gray-600 leading-relaxed mb-4 flex-1">
         {desc}
       </p>
       <div className="bg-gray-50 rounded-lg p-3">
         <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500 uppercase mb-2">
           <span>Key Signals</span>
           <span>Impact</span>
         </div>
         <div className="space-y-2">
           {signals.map((sig: any, idx: number) => (
             <div key={idx} className="flex items-center justify-between text-[11px]">
               <span className="text-gray-700 flex items-center gap-1.5">
                 <div className="w-1 h-1 rounded-full bg-gray-400"></div> {sig.label}
               </span>
               <span className={`text-[10px] font-bold ${impactColor}`}>
                 {idx === 0 ? sig.impact : ''}
               </span>
             </div>
           ))}
         </div>
       </div>
    </div>
  );
}

export default function ForecastScreen({ enterprise, navigateTo }: Props) {
  const [forecastData, setForecastData] = useState<any>({
    growth: [], cashflow: [], risk: [], npa: []
  });
  const [loading, setLoading] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      const headers = "Metric,Day,Actual,Forecast,Lower,Upper\n";
      let csv = headers;
      
      if (forecastData && forecastData.growth) {
        forecastData.growth.forEach(row => {
          csv += `Portfolio Outstanding,${row.day},${row.actual != null ? Number(row.actual).toFixed(2) : ''},${row.forecast != null ? Number(row.forecast).toFixed(2) : ''},${row.lower != null ? Number(row.lower).toFixed(2) : ''},${row.upper != null ? Number(row.upper).toFixed(2) : ''}\n`;
        });
        forecastData.cashflow.forEach(row => {
          csv += `Net Cashflow,${row.day},${row.actual != null ? Number(row.actual).toFixed(2) : ''},${row.forecast != null ? Number(row.forecast).toFixed(2) : ''},${row.lower != null ? Number(row.lower).toFixed(2) : ''},${row.upper != null ? Number(row.upper).toFixed(2) : ''}\n`;
        });
        forecastData.npa.forEach(row => {
          csv += `Credit Stress,${row.day},${row.actual != null ? Number(row.actual).toFixed(2) : ''},${row.forecast != null ? Number(row.forecast).toFixed(2) : ''},${row.lower != null ? Number(row.lower).toFixed(2) : ''},${row.upper != null ? Number(row.upper).toFixed(2) : ''}\n`;
        });
      }
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'portfolio_forecast_report.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      
      setIsGeneratingReport(false);
    }, 1500);
  };

  useEffect(() => {
    apiClient.getPortfolioForecastTimeseries()
      .then((res: any) => {
        if (res && res.data) {
          setForecastData(res.data);
        } else {
          setForecastData(res);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const { state, dispatch } = useGramPulse();
  
  // Reusable Timeline Node
  const TimelineNode = ({ days, title, metrics, active }: any) => (
    <div className="flex-1 relative">
      <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-100 z-0" />
      <div className="relative z-10 flex flex-col items-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${active ? 'bg-white border-green-500 text-green-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
           <Clock size={12} />
        </div>
        <div className="text-[12px] font-bold text-gray-900 mt-2 mb-3">{days} Days</div>
        
        <div className="flex gap-4 w-full px-4 justify-between">
           {metrics.map((m: any, i: number) => (
             <div key={i} className="text-center">
               <div className="text-[9px] font-medium text-gray-500 mb-1">{m.label}</div>
               <div className={`text-[11px] font-bold flex items-center justify-center gap-1 ${m.valColor || 'text-gray-900'}`}>
                 {m.icon && <m.icon size={10} />}
                 {m.value}
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12 w-full max-w-[1600px] mx-auto overflow-x-hidden">
      
      {/* 1. Header Area */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-1">Forecast Center</h1>
          <p className="text-[12px] text-gray-500">AI-powered portfolio forecasting across 30, 90, 180 and 365-day horizons.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[12px] font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
            <Filter size={14} /> Filters
          </button>
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-4 py-2 text-[12px] font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
            <Download size={14} /> Export
          </button>
          <button onClick={handleGenerateReport} disabled={isGeneratingReport} className="flex items-center gap-1.5 border border-transparent rounded-xl px-4 py-2 text-[12px] font-semibold text-white bg-[#0f766e] hover:bg-[#0f766e]/90 shadow-sm transition-colors disabled:opacity-75 disabled:cursor-not-allowed">
            <RefreshCw size={14} className={isGeneratingReport ? 'animate-spin' : ''} /> {isGeneratingReport ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* 2. AI Forecast Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-8">
           <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
              <Sparkles size={24} className="text-green-600" />
           </div>
           <div className="flex-1 grid grid-cols-5 gap-8">
             <div className="border-r border-gray-100 pr-6">
                <div className="text-[11px] font-semibold text-gray-500 mb-1.5">AI Forecast Summary</div>
                <div className="text-[16px] font-bold text-green-700 mb-1">Positive</div>
                <div className="text-[11px] text-gray-500">Steady growth with manageable risk</div>
             </div>
             <div className="border-r border-gray-100 pr-6">
                <div className="text-[11px] font-semibold text-gray-500 mb-1.5">Forecast Horizon</div>
                <div className="text-[16px] font-bold text-gray-900 mb-1">365 Days</div>
                <div className="text-[11px] text-gray-500">Multi-horizon forecasting</div>
             </div>
             <div className="border-r border-gray-100 pr-6">
                <div className="text-[11px] font-semibold text-gray-500 mb-1.5">AI Confidence</div>
                <div className="text-[16px] font-bold text-gray-900 mb-1">84%</div>
                <div className="text-[11px] font-bold text-green-600">High Confidence</div>
             </div>
             <div className="border-r border-gray-100 pr-6">
                <div className="text-[11px] font-semibold text-gray-500 mb-1.5">Key Forecast Driver</div>
                <div className="text-[14px] font-bold text-gray-900 mb-1">Repayment Improvement</div>
                <div className="text-[11px] text-gray-500 leading-tight">Stronger cashflows, better rainfall and intervention effectiveness</div>
             </div>
             <div>
                <div className="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center justify-between">
                   Last Model Refresh <Info size={12} className="text-gray-400 cursor-pointer" />
                </div>
                <div className="text-[14px] font-bold text-gray-900 mb-1.5 flex items-center gap-2">
                   May 25, 2024, 08:30 AM <span className="bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">Live</span>
                </div>
                <div className="text-[11px] text-gray-500">Next refresh in 18 hrs</div>
             </div>
           </div>
        </div>
      </div>

      {/* 3. KPI Cards */}
      <div className="grid grid-cols-6 gap-4">
        <KpiCardTop title="Predicted Portfolio Growth" value="18.6%" delta="3.2 pts" isUp={true} icon={TrendingUp} iconColor="text-green-600" iconBg="bg-green-50" />
        <KpiCardTop title="Expected Repayment Rate" value="91.7%" delta="2.6 pts" isUp={true} icon={Wallet} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <KpiCardTop title="Forecasted NPA" value="2.8%" delta="0.6 pts" isUp={true} icon={AlertTriangle} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <KpiCardTop title="Cashflow Stability" value="High" delta="Improving" isUp={true} icon={BarChart2} iconColor="text-emerald-600" iconBg="bg-emerald-50" />
        <KpiCardTop title="Climate Exposure" value="Moderate" delta="Stable" isUp={false} icon={Droplets} iconColor="text-orange-500" iconBg="bg-orange-50" />
        <KpiCardTop title="Portfolio Confidence Score" value="84 /100" delta="4 pts" isUp={true} icon={ShieldAlert} iconColor="text-teal-600" iconBg="bg-teal-50" />
      </div>

      {/* 4. Forecast Dashboard (Charts) */}
      <div>
        <h2 className="text-[14px] font-bold text-gray-900 mb-4 flex items-center gap-2">Forecast Dashboard</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
          <div className="snap-start"><MiniForecastChart title="Portfolio Growth Forecast" subtitle="Projected Portfolio Outstanding (₹ Cr)" data={forecastData.growth} color="#10b981" isUp={true} why={{ label: '+18.6% by 365 days' }} /></div>
          <div className="snap-start"><MiniForecastChart title="Cashflow Forecast" subtitle="Net cash inflow (₹ Cr)" data={forecastData.cashflow} color="#3b82f6" isUp={true} why={{ label: 'Healthy liquidity expected' }} /></div>
          <div className="snap-start"><MiniForecastChart title="Credit Risk Forecast" subtitle="Avg. Risk Score (0-100)" data={forecastData.risk} color="#8b5cf6" isUp={true} why={{ label: 'Risk score improving' }} /></div>
          <div className="snap-start"><MiniForecastChart title="NPA Projection" subtitle="NPAs % of portfolio" data={forecastData.npa} color="#ef4444" isUp={true} why={{ label: 'NPA reduced to 2.8%' }} /></div>
          <div className="snap-start"><MiniForecastChart title="Climate Impact Forecast" subtitle="Climate Risk Index (0-100)" data={CLIMATE_DATA} color="#f59e0b" isUp={false} why={{ label: 'Moderate climate risk' }} /></div>
          <div className="snap-start"><MiniForecastChart title="Intervention Impact Forecast" subtitle="Expected improvement in outcomes" data={INTERVENTION_DATA} color="#14b8a6" isUp={true} why={{ label: '+22% improvement by 365D' }} /></div>
        </div>
      </div>

      {/* 5. Forecast Timeline */}
      <div>
        <h2 className="text-[14px] font-bold text-gray-900 mb-4 flex items-center gap-2">Forecast Timeline</h2>
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex pt-8">
           <TimelineNode 
             days={30} active={true}
             metrics={[
               { label: 'Portfolio Health', value: 'Stable', valColor: 'text-green-600', icon: CheckCircle },
               { label: 'Lending Capacity', value: '₹312 Cr', valColor: 'text-gray-900' },
               { label: 'Risk Trend', value: 'Improving', valColor: 'text-green-600', icon: TrendingUp },
               { label: 'Cashflow Outlook', value: 'Positive', valColor: 'text-green-600' }
             ]}
           />
           <TimelineNode 
             days={90} active={true}
             metrics={[
               { label: 'Climate Outlook', value: 'Stable', valColor: 'text-gray-900' },
               { label: 'Lending Capacity', value: '₹348 Cr', valColor: 'text-gray-900' },
               { label: 'Risk Trend', value: 'Improving', valColor: 'text-green-600', icon: TrendingUp },
               { label: 'Cashflow Outlook', value: 'Strong', valColor: 'text-green-600' }
             ]}
           />
           <TimelineNode 
             days={180} active={true}
             metrics={[
               { label: 'Portfolio Health', value: 'Strong', valColor: 'text-green-600', icon: CheckCircle },
               { label: 'Lending Capacity', value: '₹412 Cr', valColor: 'text-gray-900' },
               { label: 'Risk Trend', value: 'Stable', valColor: 'text-gray-900' },
               { label: 'Cashflow Outlook', value: 'Strong', valColor: 'text-green-600' }
             ]}
           />
           <TimelineNode 
             days={365} active={true}
             metrics={[
               { label: 'Portfolio Health', value: 'Strong', valColor: 'text-green-600', icon: CheckCircle },
               { label: 'Lending Capacity', value: '₹512 Cr', valColor: 'text-gray-900' },
               { label: 'Risk Trend', value: 'Improved', valColor: 'text-green-600', icon: TrendingUp },
               { label: 'Climate Outlook', value: 'Moderate', valColor: 'text-orange-500' }
             ]}
           />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* 6. AI Forecast Insights */}
        <div className="col-span-8 min-w-0">
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">AI Forecast Insights</h2>
             <button className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">View all insights <ArrowRight size={12} /></button>
           </div>
           
           <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
             <div className="snap-start">
               <InsightCard 
                 icon={TrendingUp} iconColor="text-green-600" iconBg="bg-green-50"
                 title="Kolhapur & Satara districts likely to improve" conf={92}
                 desc="Better rainfall, strong cashflows and high intervention success."
                 signals={[ { label: 'Cashflow ↑ 14%', impact: 'High' }, { label: 'Repayment ↑ 6%' }, { label: 'Rainfall: Normal' } ]}
                 impactColor="text-green-600"
               />
             </div>
             <div className="snap-start">
               <InsightCard 
                 icon={AlertTriangle} iconColor="text-red-500" iconBg="bg-red-50" isAlert={true}
                 title="132 enterprises entering watchlist" conf={88}
                 desc="Rising repayment stress and declining cashflows detected."
                 signals={[ { label: 'Payment delays ↑ 22%', impact: 'High' }, { label: 'Cashflow ↓ 15%' }, { label: 'Risk score ↑ 18%' } ]}
                 impactColor="text-red-500"
               />
             </div>
             <div className="snap-start">
               <InsightCard 
                 icon={Droplets} iconColor="text-orange-500" iconBg="bg-orange-50"
                 title="Liquidity stress expected in 60 days" conf={81}
                 desc="Seasonal cash gap predicted in beed, latur and nanded."
                 signals={[ { label: 'Cash inflow ↓ 12%', impact: 'Medium' }, { label: 'Expense pressure ↑' }, { label: 'Working capital gap ↑' } ]}
                 impactColor="text-orange-500"
               />
             </div>
           </div>
        </div>

        {/* 7. Recommended Actions */}
        <div className="col-span-4">
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">Recommended Actions</h2>
             <button className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">View all actions <ArrowRight size={12} /></button>
           </div>
           
           <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-indigo-200 cursor-pointer transition-colors group">
                 <div className="text-[12px] font-bold text-gray-900 mb-1 group-hover:text-indigo-600">Generate Forecast Report</div>
                 <div className="text-[10px] text-gray-500 leading-snug">Download comprehensive forecast report</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-indigo-200 cursor-pointer transition-colors group">
                 <div className="text-[12px] font-bold text-gray-900 mb-1 group-hover:text-indigo-600">Review High-Risk Enterprises</div>
                 <div className="text-[10px] text-gray-500 leading-snug">Analyze enterprises at future risk</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-indigo-200 cursor-pointer transition-colors group">
                 <div className="flex items-center gap-2 mb-1">
                   <div className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><IndianRupee size={10} /></div>
                   <div className="text-[12px] font-bold text-gray-900 leading-tight group-hover:text-indigo-600">Adjust Lending Strategy</div>
                 </div>
                 <div className="text-[10px] text-gray-500 leading-snug">Optimize lending based on forecast outlook</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-indigo-200 cursor-pointer transition-colors group">
                 <div className="flex items-center gap-2 mb-1">
                   <div className="w-5 h-5 rounded bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><Zap size={10} /></div>
                   <div className="text-[12px] font-bold text-gray-900 leading-tight group-hover:text-indigo-600">Run Scenario Simulation</div>
                 </div>
                 <div className="text-[10px] text-gray-500 leading-snug">Test different scenarios and outcomes</div>
              </div>
           </div>
        </div>

      </div>

      {/* 8. Forecast Details */}
      <div>
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">Forecast Details</h2>
           <div className="flex items-center gap-3">
             <div className="relative">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input type="text" placeholder="Search enterprises..." className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-xl text-[11px] w-64 focus:outline-none focus:border-indigo-500" />
             </div>
             <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm">
               <Filter size={12} /> Filters
             </button>
             <button className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm">
               <Download size={12} /> Export
             </button>
           </div>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="p-4 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="p-4">Enterprise</th>
                <th className="p-4">District</th>
                <th className="p-4 text-center">Current Health</th>
                <th className="p-4 text-center">Predicted Health (90D)</th>
                <th className="p-4">Repayment Probability</th>
                <th className="p-4">Cashflow Forecast (90D)</th>
                <th className="p-4 text-center">Climate Risk</th>
                <th className="p-4">Forecast Confidence</th>
                <th className="p-4">AI Recommendation</th>
                <th className="p-4">Updated</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[11px]">
              {TABLE_DATA.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="p-4 font-bold text-gray-900">{row.ent}</td>
                  <td className="p-4 text-gray-600">{row.dist}</td>
                  <td className="p-4 text-center">
                    <span className={`font-bold ${row.ch === 'Good' ? 'text-green-600' : 'text-orange-500'}`}>{row.ch}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`font-bold ${row.ph === 'Excellent' || row.ph === 'Good' ? 'text-green-600' : row.ph === 'Watch' ? 'text-orange-500' : 'text-red-500'}`}>{row.ph}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 w-6">{row.rp}%</span>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${row.rp > 80 ? 'bg-green-500' : row.rp > 60 ? 'bg-orange-400' : 'bg-red-500'}`} style={{ width: `${row.rp}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`font-bold flex items-center gap-1 ${row.cf_dir === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                      {row.cf_dir === 'up' ? <ArrowUp size={10} /> : <ArrowDown size={10} />} {row.cf}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.cr === 'Low' ? 'bg-green-50 text-green-700' : row.cr === 'Moderate' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'}`}>
                      {row.cr}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 w-6">{row.fc}%</span>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${row.fc}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className={`p-4 font-bold ${row.rec_color}`}>{row.rec}</td>
                  <td className="p-4 text-gray-500">{row.updated}</td>
                  <td className="p-4 text-gray-400 cursor-pointer hover:text-gray-900">
                    <MoreHorizontal size={14} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="bg-white p-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <div>Showing 1 to 5 of 1,742 enterprises</div>
            <div className="flex items-center gap-1">
               <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-50"><ChevronLeft size={14} /></button>
               <button className="w-6 h-6 rounded flex items-center justify-center bg-green-50 text-green-700 font-bold border border-green-100">1</button>
               <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-50">2</button>
               <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-50">3</button>
               <span className="px-1">...</span>
               <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-50">349</button>
               <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-50"><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
