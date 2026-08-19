"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Sparkles, ChevronDown, CalendarDays, Loader2, Building, MapPin } from 'lucide-react';
import { Screen } from '../GramPulseApp';
import { useGramPulseStore } from '../store/useGramPulseStore';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

interface HeaderProps {
  currentScreen: Screen;
  setCurrentScreen: (s: Screen) => void;
  navigateTo?: (s: Screen, ent?: string) => void;
  onProfileClick?: () => void;
}

export default function Header({ currentScreen, setCurrentScreen, navigateTo, onProfileClick }: HeaderProps) {
  const { selectedState, selectedDistrict, selectedSector, setFilter } = useGramPulseStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const [openDropdown, setOpenDropdown] = useState<'state' | 'district' | 'sector' | null>(null);

  // Fetch filter options
  const { data: filterOptions } = useQuery({
    queryKey: ['filter-options'],
    queryFn: () => apiClient.getFilterOptions().then(res => res.data),
    staleTime: Infinity,
  });

  // Fetch search results
  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ['search-enterprises', searchQuery],
    queryFn: () => apiClient.searchEnterprises(searchQuery).then(res => res.data),
    enabled: searchQuery.length > 1,
    staleTime: 60000,
  });

  // Handle outside click for dropdowns and search
  const headerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStateChange = (state: string) => {
    setFilter('selectedState', state);
    setFilter('selectedDistrict', 'All Districts'); // Reset district
    setOpenDropdown(null);
  };

  const handleDistrictChange = (district: string) => {
    setFilter('selectedDistrict', district);
    setOpenDropdown(null);
  };

  const handleSectorChange = (sector: string) => {
    setFilter('selectedSector', sector);
    setOpenDropdown(null);
  };

  const SCREENS_WITH_FILTERS: Screen[] = [
    'overview', 'portfolio', 'explorer', 
    'intelligence_climate', 'intelligence_warning', 'intelligence_market', 'intelligence_behaviour', 'intelligence_sector'
  ];
  const showFilters = SCREENS_WITH_FILTERS.includes(currentScreen);

  const districtsForState = filterOptions?.districts?.[selectedState] || [];

  return (
    <header ref={headerRef} className="h-[60px] shrink-0 bg-transparent flex items-center px-2 gap-4 z-50 w-full mb-2 relative">
      
      {/* Search */}
      <div className="flex items-center gap-2 max-w-[280px] w-full text-gray-400 relative">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search enterprises, districts, sectors..."
          className="w-full text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
        />

        {/* Search Results Dropdown */}
        {isSearchFocused && searchQuery.length > 1 && (
          <div className="absolute top-full left-0 mt-2 w-[320px] bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 overflow-hidden">
             {isSearching ? (
               <div className="flex items-center gap-2 px-4 py-3 text-[12px] text-gray-500">
                 <Loader2 size={14} className="animate-spin" /> Searching...
               </div>
             ) : searchResults?.length > 0 ? (
               <div className="flex flex-col">
                 {searchResults.map((ent: any) => (
                   <button 
                     key={ent.entity_id}
                     onClick={() => {
                        setIsSearchFocused(false);
                        setSearchQuery('');
                        if (navigateTo) navigateTo('twin', ent.entity_id);
                     }}
                     className="flex flex-col px-4 py-2 hover:bg-gray-50 text-left transition-colors"
                   >
                     <div className="text-[12px] font-bold text-gray-900">{ent.name}</div>
                     <div className="text-[10px] text-gray-500 flex items-center gap-2 mt-0.5">
                       <span className="flex items-center gap-0.5"><MapPin size={10} /> {ent.district}, {ent.state}</span>
                       <span className="flex items-center gap-0.5"><Building size={10} /> {ent.sector}</span>
                     </div>
                   </button>
                 ))}
               </div>
             ) : (
               <div className="px-4 py-3 text-[12px] text-gray-500">No results found for "{searchQuery}"</div>
             )}
          </div>
        )}
      </div>

      <div className="w-[1px] h-6 bg-gray-200 mx-2" />

      {/* Filters Area */}
      {showFilters ? (
        <div className="flex-1 flex items-center gap-4">

        
        {/* State Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'state' ? null : 'state')}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors text-gray-700 ${openDropdown === 'state' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <span className="text-[13px] font-semibold">{selectedState || 'All States'}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          
          {openDropdown === 'state' && filterOptions?.states && (
            <div className="absolute top-full left-0 mt-1 w-[180px] bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 max-h-[300px] overflow-y-auto">
               <button onClick={() => handleStateChange('All States')} className="w-full text-left px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-50">All States</button>
               {filterOptions.states.map((s: string) => (
                 <button key={s} onClick={() => handleStateChange(s)} className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-50 ${selectedState === s ? 'font-bold text-indigo-600 bg-indigo-50/50' : 'text-gray-700'}`}>
                   {s}
                 </button>
               ))}
            </div>
          )}
        </div>

        {/* District Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'district' ? null : 'district')}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors text-gray-700 ${openDropdown === 'district' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <span className="text-[13px] font-medium">{selectedDistrict}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          
          {openDropdown === 'district' && (
            <div className="absolute top-full left-0 mt-1 w-[180px] bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 max-h-[300px] overflow-y-auto">
               <button onClick={() => handleDistrictChange('All Districts')} className="w-full text-left px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-50">All Districts</button>
               {districtsForState.map((d: string) => (
                 <button key={d} onClick={() => handleDistrictChange(d)} className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-50 ${selectedDistrict === d ? 'font-bold text-indigo-600 bg-indigo-50/50' : 'text-gray-700'}`}>
                   {d}
                 </button>
               ))}
            </div>
          )}
        </div>

        {/* Sector Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'sector' ? null : 'sector')}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors text-gray-700 ${openDropdown === 'sector' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <span className="text-[13px] font-medium">{selectedSector}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          
          {openDropdown === 'sector' && filterOptions?.sectors && (
            <div className="absolute top-full left-0 mt-1 w-[180px] bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 max-h-[300px] overflow-y-auto">
               <button onClick={() => handleSectorChange('All Sectors')} className="w-full text-left px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-50">All Sectors</button>
               {filterOptions.sectors.map((s: string) => (
                 <button key={s} onClick={() => handleSectorChange(s)} className={`w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-50 ${selectedSector === s ? 'font-bold text-indigo-600 bg-indigo-50/50' : 'text-gray-700'}`}>
                   {s}
                 </button>
               ))}
            </div>
          )}
        </div>
        
        <div className="w-[1px] h-6 bg-gray-200 mx-2" />

        {/* Date Range Picker */}
        <button className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1.5 rounded-md transition-colors text-gray-700">
          <CalendarDays size={14} className="text-gray-400" />
          <span className="text-[13px] font-medium">May 19 - May 25, 2024</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>
      ) : (
         <div className="flex-1" />
      )}

      {/* Right End: Actions & Profile */}
      <div className="flex items-center gap-5 ml-auto">
        
        {/* Ask AI Button */}
        <button 
          onClick={() => setCurrentScreen('copilot')}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 transition-colors shadow-sm"
        >
          <Sparkles size={14} className="text-indigo-600" />
          <span className="text-[12px] font-bold text-indigo-700">Ask AI</span>
        </button>
        
        {/* Notification Bell */}
        <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
          <Bell size={18} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        {/* Avatar */}
        <button onClick={() => onProfileClick ? onProfileClick() : setCurrentScreen('profile')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-sm">
            <span className="text-[12px] font-bold text-white">R</span>
          </div>
        </button>

      </div>
    </header>
  );
}
