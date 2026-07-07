import React from 'react';
import { Landmark, ArrowRight, Camera, Brain, UserCheck, CheckCircle2, ChevronRight, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { CATEGORIES } from '../data/mockIssues';

// Helper to create simple marker icons matching issue status
const createMiniIcon = (status) => {
  let color = '#dc2626'; // red
  if (status === 'Assigned') color = '#ea580c'; // orange
  if (status === 'In Progress') color = '#0284c7'; // blue
  if (status === 'Solved') color = '#16a34a'; // green

  return L.divIcon({
    html: `<div class="w-4 h-4 rounded-full border border-white flex items-center justify-center shadow-md animate-pulse" style="background-color: ${color}"></div>`,
    className: 'custom-mini-icon',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

export default function LandingPage({ issues, setCurrentScreen, setSelectedIssueId }) {
  // Compute dynamic stats
  const totalReported = issues.length;
  // Let's assume Solved issues are the ones resolved. Let's add the duplicates merged (which count as separate reports from citizens).
  const totalCitizenReports = issues.reduce((acc, issue) => acc + 1 + (issue.duplicateCount || 0), 0);
  const totalResolved = issues.filter(i => i.status === 'Solved').reduce((acc, issue) => acc + 1 + (issue.duplicateCount || 0), 0);
  
  // Unique wards list
  const uniqueWards = new Set(issues.map(i => i.location.ward).filter(Boolean));
  const activeWardsCount = uniqueWards.size;

  // Recent 3 issues to preview
  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.reportedDate) - new Date(a.reportedDate))
    .slice(0, 3);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-height-full text-slate-800 dark:text-slate-200 transition-colors duration-250">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-tnblue-900 via-tnblue-800 to-tngreen-900 text-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative Temple Emblem Background */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <Landmark className="w-96 h-96" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs sm:text-sm font-semibold text-tngreen-300 mb-6 border border-white/10">
            <span className="bg-tngreen-500 w-2 h-2 rounded-full animate-ping"></span>
            <span>Government of Tamil Nadu • Theni Municipal Initiative</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-heading mb-4 text-white leading-tight">
            See it. Report it. <br className="hidden sm:inline" />
            <span className="text-tngreen-400">Track it fixed.</span>
          </h1>
          <p className="text-xl sm:text-2xl font-medium mb-2 text-slate-200">
            கண்டறிவோம். புகார் அளிப்போம். தீர்வு காண்போம்.
          </p>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 mb-10 font-sans leading-relaxed">
            A transparent platform for citizens of Theni to report local issues like potholed roads, street light failures, or drainage blocks directly to Ward Officers. Powered by instant AI categorization.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => setCurrentScreen('report')}
              className="w-full sm:w-auto bg-tngreen-600 hover:bg-tngreen-700 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-150 flex items-center justify-center space-x-2"
            >
              <Camera className="h-5 w-5" />
              <span>Report an Issue / புகார் செய்க</span>
            </button>
            <button
              onClick={() => setCurrentScreen('dashboard')}
              className="w-full sm:w-auto bg-white/15 hover:bg-white/20 text-white text-lg font-semibold px-8 py-4 rounded-xl border border-white/20 hover:border-white/40 backdrop-blur-md transition-all duration-150 flex items-center justify-center space-x-2"
            >
              <span>View Public Map / வரைபடத்தை காண்க</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 sm:p-8 transition-colors duration-250">
          <div className="flex items-center space-x-4 p-2 md:border-r border-slate-100 dark:border-slate-700">
            <div className="bg-tnblue-50 dark:bg-tnblue-950/50 text-tnblue-700 dark:text-tnblue-300 p-4 rounded-xl">
              <Camera className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Citizen Reports Logged</p>
              <p className="text-3xl font-black text-tnblue-900 dark:text-tnblue-100">{totalCitizenReports}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Total individual complaints filed</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-2 md:border-r border-slate-100 dark:border-slate-700">
            <div className="bg-tngreen-50 dark:bg-tngreen-950/50 text-tngreen-700 dark:text-tngreen-300 p-4 rounded-xl">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Issues Resolved</p>
              <p className="text-3xl font-black text-tngreen-700 dark:text-tngreen-350">{totalResolved}</p>
              <p className="text-xs text-tngreen-600 dark:text-tngreen-400 font-medium">
                {Math.round((totalResolved / (totalCitizenReports || 1)) * 100)}% resolution rate
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-2">
            <div className="bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 p-4 rounded-xl">
              <Landmark className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Wards</p>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-200">{activeWardsCount}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Theni municipal wards covered</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">How the Platform Works</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-2">
            A transparent, closed-loop resolution system connecting citizen concerns to action on the ground.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/3 left-1/8 right-1/8 h-0.5 bg-slate-200 dark:bg-slate-700 -z-10"></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center text-center bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative">
            <span className="absolute -top-4 bg-tnblue-700 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center border-4 border-slate-50 dark:border-slate-900 shadow">1</span>
            <div className="bg-tnblue-50 dark:bg-tnblue-950/40 text-tnblue-800 dark:text-tnblue-200 p-4 rounded-full mb-4">
              <Camera className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">1. Snap & Upload</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Take a photo of the civic issue. Our system automatically fetches your GPS coordinates.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative">
            <span className="absolute -top-4 bg-tnblue-700 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center border-4 border-slate-50 dark:border-slate-900 shadow">2</span>
            <div className="bg-tngreen-50 dark:bg-tngreen-950/40 text-tngreen-700 dark:text-tngreen-300 p-4 rounded-full mb-4">
              <Brain className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">2. AI Detects</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI automatically classifies the issue category and checks for nearby duplicates within 50m.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative">
            <span className="absolute -top-4 bg-tnblue-700 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center border-4 border-slate-50 dark:border-slate-900 shadow">3</span>
            <div className="bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 p-4 rounded-full mb-4">
              <UserCheck className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">3. Ward Assigned</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The issue is dispatched to the respective Ward Officer based on location boundaries.
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative">
            <span className="absolute -top-4 bg-tnblue-700 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center border-4 border-slate-50 dark:border-slate-900 shadow">4</span>
            <div className="bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 p-4 rounded-full mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">4. Track Resolved</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track progress on a live map. Officers post "After" photos upon resolution for verification.
            </p>
          </div>
        </div>
      </div>

      {/* Map Preview & Recent Activity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Map Preview Left (2 columns) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-md flex flex-col transition-all duration-250">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MapPin className="text-tngreen-600" />
                  Live Issue Map Preview
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Showing active and resolved problems across Theni wards</p>
              </div>
              <button 
                onClick={() => setCurrentScreen('dashboard')}
                className="text-xs font-bold text-tnblue-700 dark:text-tnblue-400 hover:text-tnblue-800 dark:hover:text-tnblue-300 flex items-center gap-0.5"
              >
                Open Dashboard <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            
            {/* Leaflet Map Preview */}
            <div className="h-72 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative z-10">
              <MapContainer 
                center={[10.0110, 77.4735]} 
                zoom={13} 
                scrollWheelZoom={false}
                zoomControl={false}
                attributionControl={false}
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {issues.map(issue => (
                  <Marker 
                    key={issue.id}
                    position={[issue.location.lat, issue.location.lng]}
                    icon={createMiniIcon(issue.status)}
                  >
                    <Popup>
                      <div className="text-xs font-sans text-slate-900">
                        <p className="font-bold">{CATEGORIES[issue.category]?.label || issue.category}</p>
                        <p className="text-slate-500 truncate max-w-[120px]">{issue.location.address}</p>
                        <span className={`inline-block px-1 rounded text-[10px] text-white font-bold mt-1`} style={{
                          backgroundColor: issue.status === 'Solved' ? '#16a34a' : issue.status === 'In Progress' ? '#0284c7' : issue.status === 'Assigned' ? '#ea580c' : '#dc2626'
                        }}>
                          {issue.status}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-850/95 px-2.5 py-2 rounded-lg border border-slate-250 dark:border-slate-700 z-20 shadow-sm text-[10px] space-y-1 flex flex-col text-slate-850 dark:text-slate-200 transition-all duration-250">
                <span className="font-bold text-slate-850 dark:text-white mb-0.5">Map Pins key:</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-650"></span> Reported / பதிவானது</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-650" style={{backgroundColor: '#ea580c'}}></span> Assigned / ஒதுக்கப்பட்டது</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span> In Progress / வேலை நடக்கிறது</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-600"></span> Solved / தீர்க்கப்பட்டது</span>
              </div>
            </div>
          </div>

          {/* Recent Activity Right (1 column) */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-md flex flex-col justify-between transition-all duration-250">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-1">Recent Reports</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Latest complaints submitted by citizens</p>
              
              <div className="space-y-4">
                {recentIssues.map((issue) => {
                  const catInfo = CATEGORIES[issue.category];
                  let statusBg = 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50';
                  if (issue.status === 'Assigned') statusBg = 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50';
                  if (issue.status === 'In Progress') statusBg = 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/50';
                  if (issue.status === 'Solved') statusBg = 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50';

                  return (
                    <div 
                      key={issue.id} 
                      onClick={() => {
                        setSelectedIssueId(issue.id);
                        setCurrentScreen('detail');
                      }}
                      className="group flex gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700/80 hover:border-tnblue-100 dark:hover:border-tnblue-800 hover:bg-slate-50 dark:hover:bg-slate-750/30 cursor-pointer transition-all duration-200"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-650">
                        <img 
                          src={issue.photoUrlBefore} 
                          alt={issue.category} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 truncate">{catInfo?.label || issue.category}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-bold ${statusBg}`}>
                            {issue.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{issue.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-slate-400 dark:text-slate-550">{issue.location.ward} • {issue.location.address.split(',')[0]}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-550 font-medium">{issue.reportedDate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setCurrentScreen('dashboard')}
              className="mt-6 w-full py-3 bg-tnblue-50 dark:bg-tnblue-950/40 text-tnblue-800 dark:text-tnblue-300 text-sm font-bold rounded-xl hover:bg-tnblue-100 dark:hover:bg-tnblue-900/60 transition-colors duration-150 flex items-center justify-center space-x-1.5"
            >
              <span>Explore All Reports</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
