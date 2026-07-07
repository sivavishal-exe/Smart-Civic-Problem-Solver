import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldAlert, CheckCircle2, AlertTriangle, Clock, Hammer, Image, Upload, User, ArrowRight, Info, Check, RefreshCw } from 'lucide-react';
import { CATEGORIES, WARD_OFFICERS, calculateUrgencyScore, getSeverityWeight } from '../data/mockIssues';

export default function OfficerDashboard({ issues, setIssues }) {
  // Officer Role Simulation
  // Allow switching between Wards or Super Admin
  const [activeWard, setActiveWard] = useState('All Wards');
  
  // Update state helper
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [tempStatus, setTempStatus] = useState('');
  const [tempWorker, setTempWorker] = useState('');
  const [afterPhoto, setAfterPhoto] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter issues based on selected Ward
  const wardIssues = issues.filter(issue => {
    if (activeWard === 'All Wards') return true;
    return issue.location.ward === activeWard;
  });

  // Calculate Urgency Scores and Sort
  const sortedIssues = wardIssues
    .map(issue => ({
      ...issue,
      urgencyScore: calculateUrgencyScore(issue)
    }))
    .sort((a, b) => {
      // Unsolved first, then higher urgency score
      if (a.status === 'Solved' && b.status !== 'Solved') return 1;
      if (a.status !== 'Solved' && b.status === 'Solved') return -1;
      return b.urgencyScore - a.urgencyScore;
    });

  // Compute analytics
  const openIssues = issues.filter(i => i.status !== 'Solved');
  const resolvedIssues = issues.filter(i => i.status === 'Solved');
  
  // Avg resolution time calculation
  const totalResolvedDays = resolvedIssues.reduce((acc, issue) => acc + (issue.daysOpen || 1), 0);
  const avgResolutionTime = resolvedIssues.length > 0 ? (totalResolvedDays / resolvedIssues.length).toFixed(1) : "3.0";

  // Top Problem Category calculation
  const categoryCounts = openIssues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(CATEGORIES).map(([key, val]) => ({
    name: key.split(' ')[0], // short name
    value: categoryCounts[key] || 0,
    color: val.color
  }));

  // Find top category
  let topCategory = "None";
  let maxCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topCategory = cat;
    }
  });

  const handleOpenUpdateModal = (issue) => {
    setSelectedIssueId(issue.id);
    setTempStatus(issue.status);
    setTempWorker(issue.officerAssigned || WARD_OFFICERS[issue.location.ward] || '');
    setAfterPhoto(issue.photoUrlAfter || '');
  };

  // Handle local image upload for the "After" solved image
  const handleAfterPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setAfterPhoto(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    if (tempStatus === 'Solved' && !afterPhoto) {
      alert("Please upload a resolution (After) photo before marking the issue as Solved.");
      return;
    }

    setIsUpdating(true);

    setTimeout(() => {
      const updatedIssues = issues.map(issue => {
        if (issue.id === selectedIssueId) {
          const statusChanged = issue.status !== tempStatus;
          const currentTimestamp = new Date().toISOString().split("T")[0];
          
          let newUpdates = [...issue.updates];
          if (statusChanged) {
            newUpdates.push({
              status: tempStatus,
              date: currentTimestamp,
              note: `Status updated by Officer to ${tempStatus}. Assigned personnel: ${tempWorker || 'Unassigned'}.`
            });
          }

          return {
            ...issue,
            status: tempStatus,
            officerAssigned: tempWorker,
            photoUrlAfter: tempStatus === 'Solved' ? afterPhoto : issue.photoUrlAfter,
            updates: newUpdates
          };
        }
        return issue;
      });

      setIssues(updatedIssues);
      setIsUpdating(false);
      setSelectedIssueId(null);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Title Bar with Ward Selection */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-md">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Hammer className="text-tnblue-800" />
            Ward Officer Management Portal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Analyze, assign workers, and update status of reports in your administrative boundary.
          </p>
        </div>

        {/* Login / Ward Selector */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-350 rounded-xl px-3 py-2">
          <User className="h-4.5 w-4.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logged In As:</span>
          <select
            value={activeWard}
            onChange={(e) => setActiveWard(e.target.value)}
            className="bg-transparent border-none text-xs font-black text-tnblue-800 focus:outline-none cursor-pointer"
          >
            <option value="All Wards">Super Admin (All Wards)</option>
            {Object.keys(WARD_OFFICERS).map(w => (
              <option key={w} value={w}>{w} - {WARD_OFFICERS[w]?.split(' ')[1]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left 3 summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:col-span-3">
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Issues Pending</span>
              <AlertTriangle className="h-5 w-5 text-orange-650" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-slate-800">{sortedIssues.filter(i => i.status !== 'Solved').length}</p>
              <p className="text-xs text-slate-500 mt-1">Requires immediate attention</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Avg Resolution Time</span>
              <Clock className="h-5 w-5 text-tnblue-700" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-tnblue-800">{avgResolutionTime} Days</p>
              <p className="text-xs text-slate-500 mt-1">Target is under 5 days</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Top Category</span>
              <ShieldAlert className="h-5 w-5 text-red-650" />
            </div>
            <div className="mt-4">
              <p className="text-xl font-black text-red-650 truncate">{CATEGORIES[topCategory]?.label.split(' / ')[0] || "None"}</p>
              <p className="text-xs text-slate-500 mt-2">Active complaints: {maxCount}</p>
            </div>
          </div>

        </div>

        {/* Right Recharts bar chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-5 flex flex-col">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Open Issues by Category</span>
          <div className="flex-1 min-h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="value" fill="#0055a5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Urgency Formula Explain Card */}
      <div className="bg-gradient-to-r from-tnblue-50 to-tngreen-50 border border-tnblue-100 rounded-2xl p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-tnblue-800 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold text-sm text-tnblue-900">How Urgency Score is Computed / அவசர நிலை மதிப்பீடு</h4>
          <p className="text-xs text-slate-650 mt-1 leading-relaxed">
            Urgency score automatically ranks citizen reports so you can work on key issues first. The formula is:
          </p>
          <code className="inline-block bg-white text-slate-900 border border-slate-200 rounded px-2 py-1 text-xs font-mono font-bold mt-2">
            Urgency = (Duplicate Reports × 2) + Category Severity Weight + Days Open
          </code>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[10px] font-semibold text-slate-500">
            <span>🔴 Public Safety: 10</span>
            <span>💧 Water Leakage: 7</span>
            <span>🛣️ Road Damage: 6</span>
            <span>🚽 Drainage: 6</span>
            <span>🐂 Stray Cattle: 5</span>
            <span>💡 Street Light: 4</span>
            <span>🗑️ Garbage: 4</span>
            <span>❓ Other: 3</span>
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-extrabold text-xl text-slate-900">
            Active Issues for {activeWard}
          </h3>
          <span className="bg-slate-100 text-slate-650 px-2.5 py-1 rounded-full text-xs font-bold">
            Total {sortedIssues.length} Complaints
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="py-4 px-6">Photo & ID</th>
                <th className="py-4 px-6">Category & Severity</th>
                <th className="py-4 px-6 text-center">Urgency</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Reported & Age</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sortedIssues.map((issue) => {
                const catWeight = getSeverityWeight(issue.category);
                let statusColor = 'bg-red-100 text-red-700 border-red-200';
                if (issue.status === 'Assigned') statusColor = 'bg-orange-100 text-orange-700 border-orange-200';
                if (issue.status === 'In Progress') statusColor = 'bg-sky-100 text-sky-700 border-sky-200';
                if (issue.status === 'Solved') statusColor = 'bg-green-100 text-green-700 border-green-200';

                return (
                  <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Photo & ID */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                          <img src={issue.photoUrlBefore} alt={issue.id} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="font-extrabold text-sm text-tnblue-800 block">{issue.id}</span>
                          <span className="text-[10px] font-bold text-slate-400">{issue.location.ward}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category & Severity */}
                    <td className="py-4.5 px-6">
                      <span className="font-extrabold text-sm text-slate-800 block">{CATEGORIES[issue.category]?.label.split(' / ')[0]}</span>
                      <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block mt-0.5">
                        Severity Weight: {catWeight}
                      </span>
                    </td>

                    {/* Urgency Score */}
                    <td className="py-4.5 px-6 text-center">
                      <div className="inline-block relative group">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-xs border ${
                          issue.status === 'Solved'
                            ? 'bg-slate-100 text-slate-400 border-slate-200'
                            : issue.urgencyScore >= 12
                            ? 'bg-red-50 text-red-650 border-red-200 animate-pulse'
                            : issue.urgencyScore >= 8
                            ? 'bg-orange-50 text-orange-650 border-orange-200'
                            : 'bg-yellow-50 text-yellow-750 border-yellow-200'
                        }`}>
                          {issue.status === 'Solved' ? '-' : issue.urgencyScore}
                        </span>
                        
                        {/* Formula tooltip */}
                        <div className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 bg-slate-900 text-white rounded p-2 text-[9px] w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 leading-relaxed shadow-lg">
                          Math: (Duplicates: {issue.duplicateCount} × 2) + Severity: {catWeight} + Age: {issue.daysOpen} days open = <strong>{issue.urgencyScore}</strong>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-4.5 px-6">
                      <span className="text-xs font-semibold text-slate-750 block truncate max-w-[200px]">{issue.location.address.split(',')[0]}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block truncate max-w-[200px]">{issue.location.address}</span>
                    </td>

                    {/* Age/Reported */}
                    <td className="py-4.5 px-6">
                      <span className="text-xs font-semibold text-slate-800 block">{issue.reportedDate}</span>
                      <span className={`text-[10px] font-bold ${issue.status === 'Solved' ? 'text-slate-400' : 'text-slate-500'}`}>
                        {issue.status === 'Solved' ? `Resolved in ${issue.daysOpen}d` : `${issue.daysOpen} days open`}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4.5 px-6">
                      <span className={`text-[10px] px-2 py-0.8 rounded font-extrabold border uppercase tracking-wider ${statusColor}`}>
                        {issue.status}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-4.5 px-6 text-right">
                      <button
                        onClick={() => handleOpenUpdateModal(issue)}
                        className="text-xs font-bold text-tnblue-800 hover:text-white hover:bg-tnblue-800 border border-tnblue-200 hover:border-tnblue-800 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Manage / மாற்று
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update/Manage Overlay Modal */}
      {selectedIssueId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            
            <div className="bg-tnblue-800 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-lg">Manage Civic Issue {selectedIssueId}</h3>
                <p className="text-xs text-tnblue-100">Update worker delegation, status, and resolution photo</p>
              </div>
              <button
                onClick={() => setSelectedIssueId(null)}
                className="text-tnblue-200 hover:text-white font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveChanges} className="p-6 space-y-5">
              
              {/* Status Selector */}
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Issue Status</label>
                <select
                  value={tempStatus}
                  onChange={(e) => setTempStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-tnblue-500 focus:outline-none"
                >
                  <option value="Reported">Reported (Logged & Awaiting Officer Review)</option>
                  <option value="Assigned">Assigned (Worker Assigned to Site)</option>
                  <option value="In Progress">In Progress (Maintenance Underway)</option>
                  <option value="Solved">Solved (Work Complete & Verified)</option>
                </select>
              </div>

              {/* Assigned Officer / Plumber / Worker */}
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Assigned Personnel</label>
                <input
                  type="text"
                  value={tempWorker}
                  onChange={(e) => setTempWorker(e.target.value)}
                  placeholder="E.g., Plumber M. Kumar, Municipal Zone 3"
                  className="w-full bg-slate-50 border border-slate-350 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-tnblue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Upload "After" photo ONLY if Solved is selected */}
              {tempStatus === 'Solved' && (
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    Upload Solution (After) Photo <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[10px] text-slate-400 mb-2">A photo of the completed repair work must be posted for citizen review.</p>

                  {!afterPhoto ? (
                    <div className="border-2 border-dashed border-slate-350 hover:border-tngreen-500 rounded-xl p-6 text-center cursor-pointer transition-colors relative bg-slate-50">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAfterPhotoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                      />
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="h-6 w-6 text-slate-400 mb-1" />
                        <span className="text-xs font-bold text-slate-600">Select repair photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 h-32 bg-slate-50">
                      <img src={afterPhoto} alt="After repair preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAfterPhoto('')}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700 font-bold text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedIssueId(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 bg-tnblue-800 hover:bg-tnblue-900 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
