"use client";

import React from 'react';
import { X, Pencil, Camera, LogOut } from 'lucide-react';

interface ProfileScreenProps {
  onClose?: () => void;
}

export default function ProfileScreen({ onClose }: ProfileScreenProps) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/20 z-[60] backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-[70] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <h2 className="text-[18px] font-bold text-gray-900">User Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Profile Card */}
          <div className="px-6 py-6 border-b border-gray-100 flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#dcfce7] flex items-center justify-center border-2 border-white shadow-sm shrink-0 text-[#16a34a] font-bold text-[24px]">
                R
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-white border-2 border-white hover:bg-gray-700 transition-colors">
                <Camera size={10} />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[16px] font-bold text-gray-900">Rohit Deshmukh</h3>
                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 font-bold rounded text-[9px] flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-green-600"></span> Active</span>
              </div>
              <div className="text-[12px] font-medium text-gray-500 mb-0.5">Regional Manager</div>
              <div className="text-[11px] font-medium text-gray-400 mb-2">Kolhapur Region, Maharashtra</div>
              <div className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 font-bold text-[10px] rounded border border-blue-100">
                EMP-REG-001
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 flex items-center gap-6 border-b border-gray-100 shrink-0">
            <button className="text-[12px] font-bold text-[#16a34a] border-b-2 border-[#16a34a] pb-3 pt-4 px-1">Profile</button>
            <button className="text-[12px] font-semibold text-gray-400 hover:text-gray-600 pb-3 pt-4 px-1">Preferences</button>
            <button className="text-[12px] font-semibold text-gray-400 hover:text-gray-600 pb-3 pt-4 px-1">Security</button>
            <button className="text-[12px] font-semibold text-gray-400 hover:text-gray-600 pb-3 pt-4 px-1">Activity</button>
          </div>

          {/* Tab Content */}
          <div className="p-6 space-y-8">
            
            {/* Personal Information */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[13px] font-bold text-gray-900">Personal Information</h4>
                <button className="flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-2 py-1 shadow-sm bg-white">
                  <Pencil size={10} /> Edit
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div className="text-gray-500 font-medium">Full Name</div>
                  <div className="text-gray-900 font-medium text-right">Rohit Deshmukh</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div className="text-gray-500 font-medium">Email</div>
                  <div className="text-gray-900 font-medium text-right">rohit.deshmukh@nabard.in</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div className="text-gray-500 font-medium">Phone</div>
                  <div className="text-gray-900 font-medium text-right">+91 98234 56789</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div className="text-gray-500 font-medium">Employee ID</div>
                  <div className="text-gray-900 font-medium text-right">EMP-REG-001</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div className="text-gray-500 font-medium">Date of Joining</div>
                  <div className="text-gray-900 font-medium text-right">Apr 12, 2022</div>
                </div>
              </div>
            </div>

            <div className="h-[1px] w-full bg-gray-100"></div>

            {/* Organization Information */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[13px] font-bold text-gray-900">Organization Information</h4>
                <button className="flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-2 py-1 shadow-sm bg-white">
                  <Pencil size={10} /> Edit
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div className="text-gray-500 font-medium">Role</div>
                  <div className="text-gray-900 font-medium text-right">Regional Manager</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div className="text-gray-500 font-medium">Department</div>
                  <div className="text-gray-900 font-medium text-right">Rural Development & Credit</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div className="text-gray-500 font-medium">Region</div>
                  <div className="text-gray-900 font-medium text-right">Kolhapur Region</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div className="text-gray-500 font-medium">Reporting To</div>
                  <div className="text-gray-900 font-medium text-right">State Office, Maharashtra</div>
                </div>
              </div>
            </div>
            
            <div className="h-[1px] w-full bg-gray-100"></div>

            {/* Preferences */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[13px] font-bold text-gray-900">Preferences</h4>
                <button className="flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-2 py-1 shadow-sm bg-white">
                  <Pencil size={10} /> Edit
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div className="text-gray-500 font-medium">Language</div>
                  <div className="text-gray-900 font-medium text-right">English</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div className="text-gray-500 font-medium">Timezone</div>
                  <div className="text-gray-900 font-medium text-right">(GMT +05:30) Asia/Kolkata</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div className="text-gray-500 font-medium">Date Format</div>
                  <div className="text-gray-900 font-medium text-right">DD MMM YYYY</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div className="text-gray-500 font-medium">Time Format</div>
                  <div className="text-gray-900 font-medium text-right">12-hour</div>
                </div>
              </div>
            </div>

            <div className="h-[1px] w-full bg-gray-100"></div>

            {/* Security */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[13px] font-bold text-gray-900">Security</h4>
                <button className="text-[11px] font-bold text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-2 py-1 shadow-sm bg-white">
                  Change Password
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div className="text-gray-500 font-medium">Last Password Change</div>
                  <div className="text-gray-900 font-medium text-right">May 10, 2024 11:20 AM</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div className="text-gray-500 font-medium">Two-Factor Authentication</div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 font-bold rounded text-[10px]">Enabled</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div className="text-gray-500 font-medium">Active Sessions</div>
                  <div className="text-gray-900 font-medium text-right">2 Devices</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Area */}
        <div className="p-6 border-t border-gray-100 bg-white">
          <button className="w-full py-2.5 flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-xl transition-colors font-bold text-[13px]">
             <LogOut size={16} /> Sign Out
          </button>
        </div>

      </div>
    </>
  );
}
