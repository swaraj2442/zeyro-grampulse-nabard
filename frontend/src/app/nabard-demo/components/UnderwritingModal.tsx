import React, { useState } from 'react';
import { X, ShieldCheck, AlertTriangle } from 'lucide-react';
import apiClient from '../services/apiClient';

interface Props {
  enterpriseId: string;
  onClose: () => void;
}

export default function UnderwritingModal({ enterpriseId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [amount, setAmount] = useState(100000);
  const [tenure, setTenure] = useState(12);

  const handleUnderwrite = async () => {
    setLoading(true);
    try {
      const res = await apiClient.underwrite(enterpriseId, { requestedAmount: amount, requestedTenureMonths: tenure });
      setResult(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-[500px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#16a34a]" /> Request Credit Assessment
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <X size={16} />
          </button>
        </div>
        
        <div className="p-5">
          {!result ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Requested Amount (₹)</label>
                <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Requested Tenure (Months)</label>
                <select value={tenure} onChange={e => setTenure(Number(e.target.value))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]">
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months</option>
                  <option value={24}>24 Months</option>
                  <option value={36}>36 Months</option>
                </select>
              </div>
              
              <button 
                onClick={handleUnderwrite} 
                disabled={loading}
                className="w-full mt-4 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-[13px] py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50">
                {loading ? 'Evaluating...' : 'Run Go Policy Engine'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border flex items-start gap-3 ${result.decision === 'ELIGIBLE' ? 'bg-[#f0fdf4] border-[#bbf7d0]' : 'bg-[#fffbeb] border-[#fde68a]'}`}>
                {result.decision === 'ELIGIBLE' ? <ShieldCheck size={20} className="text-[#16a34a]" /> : <AlertTriangle size={20} className="text-[#f59e0b]" />}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-bold text-gray-900">Decision: {result.decision}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${result.risk_tier === 'LOW' ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#fef3c7] text-[#f59e0b]'}`}>
                      {result.risk_tier} RISK
                    </span>
                  </div>
                  <div className="text-[12px] text-gray-700 mb-2">Probability of Stress: {(result.probability_of_stress * 100).toFixed(1)}%</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                    <div className="bg-white/60 p-2 rounded border border-black/5">
                      <div className="text-gray-500">Max EMI</div>
                      <div className="font-bold text-gray-900">₹{result.max_affordable_emi?.toLocaleString('en-IN') ?? 'N/A'}</div>
                    </div>
                    <div className="bg-white/60 p-2 rounded border border-black/5">
                      <div className="text-gray-500">Recommended Limit</div>
                      <div className="font-bold text-[#16a34a]">₹{result.recommended_limit?.toLocaleString('en-IN') ?? 'N/A'}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-gray-500 uppercase">Reason Codes</div>
                    {result.reason_codes?.map((r: string, i: number) => (
                      <div key={i} className="text-[11px] text-gray-700 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-gray-400" />{r}</div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Provenance Footer */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-1 text-[9px] text-gray-400">
                <div className="flex justify-between"><span>Probability Model:</span> <span className="font-medium text-gray-500">grampulse-uw-v1.0</span></div>
                <div className="flex justify-between"><span>Policy Engine:</span> <span className="font-medium text-gray-500">grampulse-policy-v1.0</span></div>
                <div className="flex justify-between"><span>Calibration:</span> <span className="font-medium text-gray-500">Platt Scaling v1.0</span></div>
              </div>
              
              <button onClick={() => setResult(null)} className="w-full mt-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-[12px] py-2 rounded-lg transition-colors">
                Run Another Simulation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
