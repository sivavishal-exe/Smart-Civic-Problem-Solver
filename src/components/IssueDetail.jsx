import React, { useState } from 'react';
import { ArrowLeft, Clock, MapPin, Phone, ShieldAlert, CheckCircle2, User, ChevronRight, CornerDownRight, X, AlertCircle } from 'lucide-react';
import { CATEGORIES, WARD_OFFICERS, calculateUrgencyScore } from '../data/mockIssues';

export default function IssueDetail({ issueId, issues, setIssues, setCurrentScreen }) {
  const issue = issues.find(i => i.id === issueId);
  const [sliderPos, setSliderPos] = useState(50); // percentage for before/after comparison
  
  // Reporter simulation
  const [inputPhone, setInputPhone] = useState('');
  const [isSimulatedReporter, setIsSimulatedReporter] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  if (!issue) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Issue Not Found</h2>
        <button
          onClick={() => setCurrentScreen('dashboard')}
          className="mt-4 px-4 py-2 bg-tnblue-800 text-white rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const catVal = CATEGORIES[issue.category];

  // Colors based on status
  let statusBadge = 'bg-red-100 text-red-700 border-red-200';
  if (issue.status === 'Assigned') statusBadge = 'bg-orange-100 text-orange-700 border-orange-200';
  if (issue.status === 'In Progress') statusBadge = 'bg-sky-100 text-sky-700 border-sky-200';
  if (issue.status === 'Solved') statusBadge = 'bg-green-100 text-green-700 border-green-200';

  // Urgency score
  const urgency = calculateUrgencyScore(issue);

  // Validate phone number to unlock citizen feedback controls
  const handleVerifyPhone = (e) => {
    e.preventDefault();
    if (inputPhone === issue.reportedByPhone || issue.duplicates.some(d => d.phone === inputPhone)) {
      setIsSimulatedReporter(true);
      setFeedbackSuccess('');
    } else {
      alert("Mobile number does not match any reporter of this issue. For simulation, try: " + issue.reportedByPhone);
    }
  };

  // Citizen confirms issue is fixed
  const handleConfirmFixed = () => {
    const updatedIssues = issues.map(i => {
      if (i.id === issue.id) {
        return {
          ...i,
          updates: [
            ...i.updates,
            {
              status: "Solved",
              date: new Date().toISOString().split("T")[0],
              note: "Citizen Verified: Reporter confirmed the repair is satisfactory. Issue locked."
            }
          ]
        };
      }
      return i;
    });
    setIssues(updatedIssues);
    setFeedbackSuccess("Thank you! Your verification has been locked in the database.");
    setIsSimulatedReporter(false);
    setInputPhone('');
  };

  // Citizen reopens issue
  const handleReopenIssue = () => {
    const updatedIssues = issues.map(i => {
      if (i.id === issue.id) {
        return {
          ...i,
          status: "In Progress",
          daysOpen: i.daysOpen + 1,
          updates: [
            ...i.updates,
            {
              status: "In Progress",
              date: new Date().toISOString().split("T")[0],
              note: "Citizen Reopened: Reporter flagged that the problem is not fully resolved. Status reset to In Progress."
            }
          ]
        };
      }
      return i;
    });
    setIssues(updatedIssues);
    setFeedbackSuccess("Issue reopened. Resubmitted to Ward Officer for inspection.");
    setIsSimulatedReporter(false);
    setInputPhone('');
  };

  const getTimelineIndicator = (stepName) => {
    const statuses = ["Reported", "Assigned", "In Progress", "Solved"];
    const currentIdx = statuses.indexOf(issue.status);
    const targetIdx = statuses.indexOf(stepName);

    if (currentIdx >= targetIdx) {
      if (stepName === 'Solved') return 'bg-tngreen-600 text-white ring-4 ring-tngreen-100';
      if (stepName === 'In Progress') return 'bg-tnblue-500 text-white ring-4 ring-tnblue-100';
      if (stepName === 'Assigned') return 'bg-orange-500 text-white ring-4 ring-orange-100';
      return 'bg-red-500 text-white ring-4 ring-red-100';
    }
    return 'bg-slate-100 text-slate-400 border-2 border-slate-200';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Back navigation */}
      <button
        onClick={() => setCurrentScreen('dashboard')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4.5 w-4.5" />
        <span>Back to Public Dashboard / வரைபடம்</span>
      </button>

      {/* Title Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm font-extrabold text-tnblue-800">{issue.id}</span>
            <span className="text-slate-350">•</span>
            <span className="text-xs font-bold text-slate-500">{issue.location.ward}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            {catVal?.label || issue.category}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Reported on {issue.reportedDate} ({issue.daysOpen} days open)</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Urgency Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-center">
            <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Urgency Score</span>
            <span className="text-base font-black text-slate-800">{urgency}</span>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-xl border font-bold uppercase tracking-wider ${statusBadge}`}>
            {issue.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Photos, Timeline & Slider (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Photos Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-4">
            
            {issue.status === 'Solved' && issue.photoUrlAfter ? (
              <div>
                <h3 className="font-extrabold text-base text-slate-800 mb-1">Interactive Before-After Comparison</h3>
                <p className="text-xs text-slate-400 mb-4">Drag the slider handle sideways to compare the before and after repairs.</p>
                
                {/* Working Drag Slider Container */}
                <div className="relative w-full aspect-video select-none overflow-hidden rounded-2xl border border-slate-200">
                  {/* After photo (Base layer) */}
                  <img 
                    src={issue.photoUrlAfter} 
                    alt="After repair" 
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
                  />
                  <div className="absolute bottom-3 right-3 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded font-black z-30 shadow-md">
                    Resolved / சரி செய்யப்பட்டது
                  </div>

                  {/* Before photo (Top sliding layer) */}
                  <div 
                    className="absolute inset-y-0 left-0 overflow-hidden z-10 pointer-events-none" 
                    style={{ width: `${sliderPos}%` }}
                  >
                    <img 
                      src={issue.photoUrlBefore} 
                      alt="Before repair" 
                      className="absolute inset-0 w-full h-full object-cover max-w-none pointer-events-none" 
                      style={{ width: '100%', height: '100%', minWidth: '400px' }} // fallback sizing
                    />
                    <div className="absolute bottom-3 left-3 bg-red-650 text-white text-[10px] px-2 py-0.5 rounded font-black shadow-md">
                      Before / முன்பு
                    </div>
                  </div>

                  {/* Interactive Input Range */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40"
                  />

                  {/* Slider bar & Center Handle circle */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white shadow z-35 pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-2 border-tnblue-800 shadow-2xl flex items-center justify-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-tnblue-800">
                        <path fillRule="evenodd" d="M15.97 10.97a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H3.75a.75.75 0 010-1.5h13.94l-1.72-1.72a.75.75 0 010-1.06zm-7.94 2.06a.75.75 0 010 1.5H3.75a.75.75 0 010-1.5h4.28zm-4.28-4.5a.75.75 0 010-1.5h16.5a.75.75 0 010 1.5H3.75z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-extrabold text-base text-slate-800 mb-3">Citizen Uploaded Photo</h3>
                <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-video max-h-80 bg-slate-100 relative">
                  <img src={issue.photoUrlBefore} alt="Civic problem" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* Description */}
            <div className="pt-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Issue Description</span>
              <p className="text-sm font-semibold text-slate-700 leading-relaxed bg-slate-50 border border-slate-150 rounded-xl p-4">
                {issue.description}
              </p>
            </div>
          </div>

          {/* Timeline Thread & Updates */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-6">
            <h3 className="font-extrabold text-base text-slate-800 pb-3 border-b border-slate-100">
              Resolution Progress & Stepper
            </h3>

            {/* Progress Stepper Line */}
            <div className="flex items-start justify-between relative px-4 py-2">
              <div className="absolute top-[21px] left-8 right-8 h-0.5 bg-slate-200 -z-10"></div>
              
              {["Reported", "Assigned", "In Progress", "Solved"].map((step, idx) => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow ${getTimelineIndicator(step)}`}>
                    {step === 'Solved' && issue.status === 'Solved' ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-500 mt-2">{step}</span>
                </div>
              ))}
            </div>

            {/* History timeline feed */}
            <div className="space-y-4 pt-4 border-t border-slate-150">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Activity Log</span>
              
              <div className="space-y-4">
                {issue.updates.map((update, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 bg-tnblue-800 rounded-full mt-1.5"></div>
                      {idx < issue.updates.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 mt-1"></div>}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800">{update.status}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{update.date}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{update.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Location, Assigned Worker, Reporter Verification (1 column) */}
        <div className="space-y-6">
          
          {/* Location details card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-3">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Site Details</h3>
            
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4.5 w-4.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">{issue.location.ward}</span>
                  <span className="text-[11px] text-slate-500 leading-relaxed block">{issue.location.address}</span>
                </div>
              </div>
            </div>

            {issue.officerAssigned && (
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center space-x-3 mt-2">
                <div className="bg-tnblue-50 text-tnblue-800 p-2 rounded-full">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Personnel</span>
                  <span className="text-xs font-extrabold text-slate-800">{issue.officerAssigned}</span>
                </div>
              </div>
            )}
          </div>

          {/* Merge & Duplicate details card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Merged Reports</h3>
              <span className="bg-orange-50 text-orange-650 px-2 py-0.5 rounded font-black text-[10px]">
                {issue.duplicateCount + 1} complaints
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              These reports are from residents in the same 50m radius. They have been merged to elevate priority.
            </p>

            <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
              {/* Original Report */}
              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                <div className="flex justify-between text-[10px] text-slate-450 font-bold mb-1">
                  <span>ORIGINAL REPORT</span>
                  <span>{issue.reportedDate}</span>
                </div>
                <p className="text-xs font-medium text-slate-700">{issue.description}</p>
                <div className="flex items-center gap-1 mt-1.5 text-[9px] text-slate-400">
                  <Phone className="h-2.5 w-2.5" />
                  <span>+91 {issue.reportedByPhone.slice(0,3)}***{issue.reportedByPhone.slice(-3)}</span>
                </div>
              </div>

              {/* Merged duplicates */}
              {issue.duplicates && issue.duplicates.map((dup, idx) => (
                <div key={dup.id || idx} className="bg-orange-50/50 rounded-lg p-2.5 border border-orange-100">
                  <div className="flex justify-between text-[10px] text-orange-700 font-bold mb-1">
                    <span>UPVOTE MERGE</span>
                    <span>{dup.reportedDate}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700">{dup.note}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-[9px] text-slate-400">
                    <Phone className="h-2.5 w-2.5" />
                    <span>+91 {dup.phone.slice(0,3)}***{dup.phone.slice(-3)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Verification Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-md space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
              Reporter Feedback & Verification
            </h3>
            
            {feedbackSuccess && (
              <div className="bg-tngreen-50 border border-tngreen-250 text-tngreen-800 p-3 rounded-xl text-xs font-bold">
                {feedbackSuccess}
              </div>
            )}

            {!isSimulatedReporter ? (
              <form onSubmit={handleVerifyPhone} className="space-y-3">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Only the original reporter or merged upvoters can confirm the resolution or reopen the issue.
                </p>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Enter Registered Phone</label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={inputPhone}
                      onChange={(e) => setInputPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit number"
                      className="flex-1 bg-slate-50 border border-slate-355 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-tnblue-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={inputPhone.length < 10}
                      className="bg-tnblue-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl disabled:opacity-50"
                    >
                      Verify / சரிபார்
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setInputPhone(issue.reportedByPhone); setIsSimulatedReporter(true); }}
                    className="text-[9px] font-extrabold text-tngreen-700 hover:text-tngreen-800 block mt-2 text-left"
                  >
                    💡 Demo bypass: Use Registered Phone
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="bg-tngreen-50 border border-tngreen-200 rounded-xl p-3 flex items-center justify-between text-xs">
                  <span className="font-bold text-tngreen-800">Verification Active</span>
                  <button onClick={() => setIsSimulatedReporter(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>

                <div className="flex flex-col gap-2">
                  {issue.status === 'Solved' ? (
                    <>
                      <button
                        onClick={handleConfirmFixed}
                        className="w-full py-3 bg-tngreen-600 hover:bg-tngreen-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center space-x-1.5"
                      >
                        <CheckCircle2 className="h-4.5 w-4.5" />
                        <span>Confirm Problem is Fixed / சரிசெய்யப்பட்டது</span>
                      </button>
                      <button
                        onClick={handleReopenIssue}
                        className="w-full py-3 bg-red-650 hover:bg-red-750 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center space-x-1.5"
                        style={{backgroundColor: '#dc2626'}}
                      >
                        <ShieldAlert className="h-4.5 w-4.5" />
                        <span>Issue Not Solved (Reopen) / மீண்டும் திறக்கவும்</span>
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <Clock className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                      <p className="text-xs font-extrabold text-slate-550">Timeline in Progress</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        This issue has not been marked as Solved by the Ward Officer yet. Once resolved, you can verify it here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
