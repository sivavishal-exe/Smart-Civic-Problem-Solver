import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, SlidersHorizontal, MapPin, Eye, Clock, CheckCircle2, ChevronRight, X, ArrowRight, Layers } from 'lucide-react';
import { CATEGORIES, WARD_OFFICERS } from '../data/mockIssues';

// Map markers generator matching statuses
const createStatusIcon = (status, isSelected) => {
  let color = '#dc2626'; // red - Reported
  if (status === 'Assigned') color = '#ea580c'; // orange
  if (status === 'In Progress') color = '#0284c7'; // sky-blue
  if (status === 'Solved') color = '#16a34a'; // green

  const size = isSelected ? 'w-8 h-8' : 'w-6 h-6';
  const innerSize = isSelected ? 'w-3 h-3' : 'w-2 h-2';

  return L.divIcon({
    html: `<div class="${size} rounded-full border-2 border-white flex items-center justify-center shadow-lg transition-all duration-300 transform ${isSelected ? 'scale-125 z-50 ring-4 ring-offset-2 ring-slate-400' : ''}" style="background-color: ${color}">
             <div class="${innerSize} rounded-full bg-white"></div>
           </div>`,
    className: 'custom-status-icon',
    iconSize: isSelected ? [32, 32] : [24, 24],
    iconAnchor: isSelected ? [16, 16] : [12, 12],
  });
};

// Component to programmatically re-center map when issue selected
function MapRecenter({ center }) {
  const map = useMap();
  if (center) {
    map.setView(center, 15, { animate: true, duration: 0.75 });
  }
  return null;
}

export default function StatusDashboard({ issues, setCurrentScreen, setSelectedIssueId }) {
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  
  // Selected Issue for Detailed Drawer
  const [activeIssueId, setActiveIssueId] = useState(null);
  
  // Mobile UI state: 'map' or 'list' view toggle
  const [mobileView, setMobileView] = useState('map');
  const [showFilters, setShowFilters] = useState(false);

  // Filter Issues
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.id.toLowerCase().includes(search.toLowerCase()) ||
      issue.description.toLowerCase().includes(search.toLowerCase()) ||
      issue.location.address.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = !selectedCategory || issue.category === selectedCategory;
    const matchesStatus = !selectedStatus || issue.status === selectedStatus;
    const matchesWard = !selectedWard || issue.location.ward === selectedWard;

    return matchesSearch && matchesCategory && matchesStatus && matchesWard;
  });

  const activeIssue = issues.find(i => i.id === activeIssueId);

  // Helper for timeline indicator styling
  const getTimelineStepStyle = (issue, stepName) => {
    const statuses = ["Reported", "Assigned", "In Progress", "Solved"];
    const currentIdx = statuses.indexOf(issue.status);
    const targetIdx = statuses.indexOf(stepName);

    if (currentIdx >= targetIdx) {
      if (stepName === 'Solved') return 'bg-tngreen-600 text-white border-tngreen-650';
      if (stepName === 'In Progress') return 'bg-tnblue-500 text-white border-tnblue-550';
      if (stepName === 'Assigned') return 'bg-orange-500 text-white border-orange-550';
      return 'bg-red-500 text-white border-red-550';
    }
    return 'bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-650 border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden bg-slate-100 dark:bg-slate-900 transition-colors duration-250">
      
      {/* Mobile Toggle Bar */}
      <div className="md:hidden flex bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 divide-x divide-slate-200 dark:divide-slate-700 transition-colors duration-250">
        <button
          onClick={() => setMobileView('map')}
          className={`flex-1 py-3 text-center text-sm font-bold transition-all ${
            mobileView === 'map' ? 'bg-tnblue-50 dark:bg-tnblue-950/40 text-tnblue-800 dark:text-tnblue-300 border-b-2 border-tnblue-800' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Map View / வரைபடம்
        </button>
        <button
          onClick={() => setMobileView('list')}
          className={`flex-1 py-3 text-center text-sm font-bold transition-all ${
            mobileView === 'list' ? 'bg-tnblue-50 dark:bg-tnblue-950/40 text-tnblue-800 dark:text-tnblue-300 border-b-2 border-tnblue-800' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          List View ({filteredIssues.length}) / பட்டியல்
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar (List + Filters) */}
        <div className={`w-full md:w-96 flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-20 transition-all duration-300 ${
          mobileView === 'list' ? 'block' : 'hidden md:flex'
        }`}>
          
          {/* Search box & filter trigger */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-3">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search issues, address, ID..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-350 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-850 dark:text-slate-100 focus:ring-2 focus:ring-tnblue-500 focus:outline-none"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-750/50 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters & Sorting
              </span>
              <span className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-full text-[10px]">
                {((selectedCategory ? 1 : 0) + (selectedStatus ? 1 : 0) + (selectedWard ? 1 : 0)) || 'None'}
              </span>
            </button>

            {/* Expandable filters panel */}
            {showFilters && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2.5 animate-fadeIn">
                <div>
                  <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs font-medium text-slate-800 dark:text-slate-200"
                  >
                    <option value="">All Categories</option>
                    {Object.entries(CATEGORIES).map(([key, val]) => (
                      <option key={key} value={key}>{val.label.split(' / ')[0]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs font-medium text-slate-800 dark:text-slate-200"
                  >
                    <option value="">All Statuses</option>
                    <option value="Reported">Reported / பதிவானது</option>
                    <option value="Assigned">Assigned / ஒதுக்கப்பட்டது</option>
                    <option value="In Progress">In Progress / நடந்து கொண்டிருக்கிறது</option>
                    <option value="Solved">Solved / தீர்க்கப்பட்டது</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase tracking-wider mb-1">Ward</label>
                  <select
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs font-medium text-slate-800 dark:text-slate-200"
                  >
                    <option value="">All Wards</option>
                    {Object.keys(WARD_OFFICERS).map(w => (
                      <option key={w} value={w}>{w} - {WARD_OFFICERS[w]?.split(' ')[1]}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => { setSelectedCategory(''); setSelectedStatus(''); setSelectedWard(''); setSearch(''); }}
                  className="w-full text-center text-[10px] font-bold text-red-500 hover:text-red-700 pt-1"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Issues List Container */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
            {filteredIssues.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                <p className="font-bold text-sm">No issues found</p>
                <p className="text-xs mt-1">Try clearing your filters or search keywords</p>
              </div>
            ) : (
              filteredIssues.map((issue) => {
                const catVal = CATEGORIES[issue.category];
                let statusBg = 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/50';
                if (issue.status === 'Assigned') statusBg = 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-900/50';
                if (issue.status === 'In Progress') statusBg = 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900/50';
                if (issue.status === 'Solved') statusBg = 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900/50';

                return (
                  <div
                    key={issue.id}
                    onClick={() => {
                      setActiveIssueId(issue.id);
                      if (mobileView === 'list') setMobileView('map');
                    }}
                    className={`p-4 flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750/30 transition-colors ${
                      activeIssueId === issue.id ? 'bg-tnblue-50 dark:bg-tnblue-950/30 border-l-4 border-tnblue-700' : ''
                    }`}
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-650 bg-slate-100 dark:bg-slate-700">
                      <img src={issue.photoUrlBefore} alt={issue.category} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{catVal?.label || issue.category}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold border ${statusBg}`}>
                          {issue.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{issue.description}</p>
                      
                      <div className="flex items-center justify-between mt-2.5 text-[9px] text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-0.5 font-medium">
                          <MapPin className="h-3 w-3" />
                          {issue.location.ward}
                        </span>
                        <span>{issue.reportedDate}</span>
                        {issue.duplicateCount > 0 && (
                          <span className="bg-orange-55 text-orange-650 px-1.5 py-0.2 rounded font-black text-[8px] uppercase">
                            +{issue.duplicateCount} reported
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className={`flex-1 relative z-10 ${
          mobileView === 'map' ? 'block' : 'hidden md:block'
        }`}>
          <MapContainer 
            center={[10.0110, 77.4735]} 
            zoom={14} 
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredIssues.map((issue) => (
              <Marker
                key={issue.id}
                position={[issue.location.lat, issue.location.lng]}
                icon={createStatusIcon(issue.status, activeIssueId === issue.id)}
                eventHandlers={{
                  click: () => {
                    setActiveIssueId(issue.id);
                  },
                }}
              />
            ))}
            {activeIssue && (
              <MapRecenter center={[activeIssue.location.lat, activeIssue.location.lng]} />
            )}
          </MapContainer>

          {/* Details Slider Overlay (Drawer) */}
          {activeIssue && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:top-4 md:bottom-auto w-auto md:w-96 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-205 dark:border-slate-700 z-25 p-4 sm:p-5 animate-slideUp max-h-[85vh] md:max-h-[90vh] overflow-y-auto flex flex-col justify-between text-slate-800 dark:text-slate-200 transition-all duration-250">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-tnblue-800 dark:text-tnblue-300">{activeIssue.id}</span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{activeIssue.location.ward}</span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">
                    {CATEGORIES[activeIssue.category]?.label || activeIssue.category}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveIssueId(null)}
                  className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 p-1.5 rounded-full transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Photos & Description */}
              <div className="space-y-4 flex-1">
                
                {/* Photo compare or single view */}
                {activeIssue.status === 'Solved' && activeIssue.photoUrlAfter ? (
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Before / After Comparison</span>
                    <div className="grid grid-cols-2 gap-2 h-28 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div className="relative">
                        <img src={activeIssue.photoUrlBefore} alt="Before" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1.5 bg-red-650 text-white text-[9px] px-1 py-0.2 rounded font-bold">Before</span>
                      </div>
                      <div className="relative">
                        <img src={activeIssue.photoUrlAfter} alt="After" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1.5 bg-green-650 text-white text-[9px] px-1 py-0.2 rounded font-bold">Fixed</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 relative">
                    <img src={activeIssue.photoUrlBefore} alt="Issue before" className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">Citizen Upload</span>
                  </div>
                )}

                {/* Description */}
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Description</span>
                  <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                    {activeIssue.description}
                  </p>
                </div>

                {/* Ward address */}
                <div className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-150 dark:border-slate-750">
                  <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{activeIssue.location.address}</span>
                </div>

                {/* Duplicate counter banner */}
                {activeIssue.duplicateCount > 0 && (
                  <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-150 dark:border-orange-900/50 rounded-xl p-2.5 flex items-center space-x-2 text-xs">
                    <span className="bg-orange-500 text-white font-black px-2 py-0.5 rounded text-[10px]">{activeIssue.duplicateCount + 1}</span>
                    <span className="font-bold text-orange-850 dark:text-orange-300">Citizens Reported This Near Site</span>
                  </div>
                )}

                {/* Timeline Stepper */}
                <div className="py-2.5">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-3.5">Status Progress</span>
                  <div className="flex items-center justify-between relative px-2">
                    {/* Progress Connecting Line */}
                    <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-slate-200 dark:bg-slate-700 -z-10"></div>
                    
                    {["Reported", "Assigned", "In Progress", "Solved"].map((step, idx) => (
                      <div key={step} className="flex flex-col items-center relative">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shadow ${getTimelineStepStyle(activeIssue, step)}`}>
                          {step === 'Solved' && activeIssue.status === 'Solved' ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-450 mt-1.5">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                <button
                  onClick={() => {
                    setSelectedIssueId(activeIssue.id);
                    setCurrentScreen('detail');
                  }}
                  className="flex-1 py-3 bg-tnblue-800 hover:bg-tnblue-900 text-white text-xs font-bold rounded-xl shadow-md transition-all duration-150 flex items-center justify-center space-x-1.5"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Full Thread & History</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
