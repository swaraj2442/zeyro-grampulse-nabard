"use client";

import React, { useState } from 'react';
import { X, CheckCircle, Save, Wifi, DollarSign, Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

import { useGramPulseActions } from '../store/useGramPulseActions';

interface DataEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataEntryModal({ isOpen, onClose }: DataEntryModalProps) {
  const { addFinancialRecord } = useGramPulseActions();
  const [entryType, setEntryType] = useState<'income' | 'expense' | 'savings' | 'loan'>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [enterprise, setEnterprise] = useState('RE-00124'); // Defaulting to the demo enterprise ID
  const [isSaved, setIsSaved] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct dummy financial record based on input
    const numAmount = Number(amount);
    const record = {
      enterpriseId: enterprise,
      month: new Date().toISOString().slice(0, 7), // current YYYY-MM
      operatingInflow: entryType === 'income' ? numAmount : 0,
      operatingOutflow: entryType === 'expense' ? numAmount : 0,
      savings: entryType === 'savings' ? numAmount : 0,
      loanRepayment: entryType === 'loan' ? numAmount : 0,
      inventoryCost: 0
    };

    const result = await addFinancialRecord(record);
    
    let msg = 'Forecast recalculated.';
    if (result.previousRiskLevel !== result.currentRiskLevel) {
      msg += ` Risk moved: ${result.previousRiskLevel} → ${result.currentRiskLevel}`;
    }
    setResultMsg(msg);
    setIsSaved(true);
    
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-green-700 px-5 py-4 text-white flex items-center justify-between">
          <div>
            <h3 className="text-[16px] font-bold">Micro-Enterprise Data Entry</h3>
            <p className="text-[11px] text-green-100 mt-0.5">Record income, expenses & cash flows (Offline Ready)</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        {isSaved ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle size={28} />
            </div>
            <h4 className="text-[16px] font-bold text-gray-900">Monthly Records Updated!</h4>
            <p className="text-[12px] text-gray-500">{resultMsg || 'Cached locally in offline store. AI cash flow model updated.'}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Enterprise Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wide mb-1">Target Enterprise</label>
              <select 
                value={enterprise} 
                onChange={e => setEnterprise(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[12px] text-gray-800 focus:outline-none focus:border-green-600"
              >
                <option value="RE-00124">Shakti Poultry Farm (RE-00124) · Micro Enterprise</option>
                <option value="E-001">Ramesh Dairy (E-001) · SHG</option>
                <option value="E-002">Shiv Poultry Farm (E-002) · FPO</option>
                <option value="E-003">Lakshmi Handicrafts (E-003) · SHG</option>
              </select>
            </div>

            {/* Entry Type Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Record Type</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'income', label: 'Income', icon: ArrowDownLeft, color: 'border-green-600 bg-green-50 text-green-700' },
                  { id: 'expense', label: 'Expense', icon: ArrowUpRight, color: 'border-red-600 bg-red-50 text-red-700' },
                  { id: 'savings', label: 'Savings', icon: Wallet, color: 'border-blue-600 bg-blue-50 text-blue-700' },
                  { id: 'loan', label: 'Repayment', icon: DollarSign, color: 'border-purple-600 bg-purple-50 text-purple-700' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEntryType(item.id as any)}
                    className={`py-2 px-1 rounded-lg border text-[11px] font-semibold flex flex-col items-center gap-1 transition-all ${
                      entryType === item.id ? item.color : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon size={14} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wide mb-1">Amount (₹)</label>
              <input 
                type="number" 
                required
                placeholder="e.g. 12500" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[14px] font-bold text-gray-900 focus:outline-none focus:border-green-600"
              />
            </div>

            {/* Category / Description */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wide mb-1">Category / Note</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Milk Collection Sales / Fodder Purchase / UPI Deposit" 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[12px] text-gray-800 focus:outline-none focus:border-green-600"
              />
            </div>

            {/* Offline Status Footer */}
            <div className="bg-gray-50 rounded-lg p-2.5 flex items-center justify-between text-[10px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <Wifi size={12} className="text-emerald-600" />
                <span>Offline Storage Active · Will sync when network restores</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 border border-gray-200 rounded-lg py-2 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 bg-green-700 hover:bg-green-800 text-white rounded-lg py-2 text-[12px] font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Save size={14} /> Save Record
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
