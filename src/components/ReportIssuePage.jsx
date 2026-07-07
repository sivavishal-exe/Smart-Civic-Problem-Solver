import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Upload, Brain, Check, ShieldAlert, ArrowRight, RefreshCw, Smartphone, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { CATEGORIES, mockAIClassify, calculateDistanceInMeters, WARD_OFFICERS } from '../data/mockIssues';

// Location Pin Icon
const pinIcon = L.divIcon({
  html: `<div class="w-8 h-8 rounded-full border-2 border-white bg-tnblue-600 flex items-center justify-center shadow-lg animate-bounce">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
             <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
           </svg>
         </div>`,
  className: 'custom-user-pin',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Interactive map handler to drop pin on click
function LocationMarker({ position, setPosition, setAddress }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      // Mock reverse geocoding to address
      setAddress(`Near ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E, Theni`);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={pinIcon} />
  );
}

export default function ReportIssuePage({ issues, setIssues, setCurrentScreen, setSelectedIssueId }) {
  // Form State
  const [photo, setPhoto] = useState(null); // base64 string
  const [photoName, setPhotoName] = useState("");
  const [location, setLocation] = useState([10.0110, 77.4735]); // default Theni center
  const [address, setAddress] = useState("Theni Junction Road, Theni");
  const [ward, setWard] = useState("Ward 3");
  const [category, setCategory] = useState("Garbage");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  
  // Verification Mock
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  
  // UI states
  const [isScanning, setIsScanning] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  // Auto detect location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          // check if inside broad Theni area (roughly lat 9.8-10.2, lng 77.2-77.7), else keep default
          if (lat > 9.8 && lat < 10.2 && lng > 77.2 && lng < 77.7) {
            setLocation([lat, lng]);
            setAddress(`Detected Location: ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E, Theni`);
          }
        },
        (err) => console.log("Geolocation error: ", err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Handle Photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoName(file.name);
    
    // Read photo as base64 DataURL
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setPhoto(uploadEvent.target.result);
      
      // Trigger Mock AI detection
      setIsScanning(true);
      setAiResult(null);
      
      setTimeout(() => {
        const result = mockAIClassify(file.name, description);
        setCategory(result.category);
        setAiResult(result);
        setIsScanning(false);
      }, 1500);
    };
    reader.readAsDataURL(file);
  };

  // Run AI manually if text changes
  const runManualAI = () => {
    if (!photo && !description) return;
    setIsScanning(true);
    setTimeout(() => {
      const result = mockAIClassify(photoName || "text_input.jpg", description);
      setCategory(result.category);
      setAiResult(result);
      setIsScanning(false);
    }, 1000);
  };

  // Geolocation triggers
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation([lat, lng]);
        setAddress(`Verified GPS: ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E, Theni`);
      });
    }
  };

  // Send OTP
  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    setOtpSent(true);
    // Simulate SMS delivery
  };

  // Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpCode === "1234" || otpCode.length === 4) {
      setOtpVerified(true);
    } else {
      alert("Invalid OTP! For demo purposes, enter '1234' or any 4-digit code.");
    }
  };

  // Submit Report
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!otpVerified) {
      alert("Please verify your phone number via OTP first.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Duplicate check (same category, within 50m of an open issue)
      const duplicateThresholdMeters = 50;
      let matchedIssue = null;

      for (let issue of issues) {
        if (issue.status !== "Solved" && issue.category === category) {
          const dist = calculateDistanceInMeters(
            location[0],
            location[1],
            issue.location.lat,
            issue.location.lng
          );
          if (dist <= duplicateThresholdMeters) {
            matchedIssue = issue;
            break;
          }
        }
      }

      if (matchedIssue) {
        // Increment duplicate count in existing issue
        const updatedIssues = issues.map((issue) => {
          if (issue.id === matchedIssue.id) {
            const currentCount = issue.duplicateCount || 0;
            const updatedDuplicates = [...(issue.duplicates || [])];
            updatedDuplicates.push({
              id: `DUP-${Date.now()}`,
              reportedDate: new Date().toISOString().split("T")[0],
              phone: phone,
              note: description || "Reported near this site."
            });
            
            // Recompute daysOpen and updates
            return {
              ...issue,
              duplicateCount: currentCount + 1,
              duplicates: updatedDuplicates,
              updates: [
                ...issue.updates,
                {
                  status: issue.status,
                  date: new Date().toISOString().split("T")[0],
                  note: `Merged duplicate report from citizen (${phone.slice(0, 4)}***${phone.slice(-3)}). Total merges: ${currentCount + 1}.`
                }
              ]
            };
          }
          return issue;
        });

        setIssues(updatedIssues);
        setSuccessResult({
          type: 'duplicate',
          issueId: matchedIssue.id,
          ward: matchedIssue.location.ward,
          address: matchedIssue.location.address,
          matches: matchedIssue.duplicateCount + 1,
          category: category
        });
      } else {
        // Create new issue
        const newId = `THN-2026-0${issues.length + 1}`;
        const newIssue = {
          id: newId,
          category: category,
          description: description || `No description provided.`,
          location: {
            lat: location[0],
            lng: location[1],
            address: address,
            ward: ward
          },
          status: "Reported",
          reportedDate: new Date().toISOString().split("T")[0],
          daysOpen: 0,
          duplicateCount: 0,
          reportedByPhone: phone,
          officerAssigned: "",
          photoUrlBefore: photo || "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80",
          photoUrlAfter: "",
          updates: [
            {
              status: "Reported",
              date: new Date().toISOString().split("T")[0],
              note: `Issue reported by citizen. ${aiResult ? `AI auto-detected Category: ${category} (${aiResult.confidence}% confidence)` : 'Category selected manually.'}`
            }
          ],
          duplicates: []
        };

        setIssues([newIssue, ...issues]);
        setSuccessResult({
          type: 'new',
          issueId: newId,
          ward: ward,
          address: address,
          category: category
        });
      }
      setIsSubmitting(false);
    }, 1500);
  };

  const handleReset = () => {
    setPhoto(null);
    setPhotoName("");
    setLocation([10.0110, 77.4735]);
    setAddress("Theni Junction Road, Theni");
    setWard("Ward 3");
    setCategory("Garbage");
    setDescription("");
    setPhone("");
    setOtpSent(false);
    setOtpCode("");
    setOtpVerified(false);
    setAiResult(null);
    setSuccessResult(null);
  };

  // SUCCESS SCREEN
  if (successResult) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-tngreen-50 text-tngreen-600 rounded-full mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Report Submitted / பதிவு செய்யப்பட்டது
          </h2>
          <p className="text-slate-500 mb-6 font-medium text-sm">
            Thank you. Your civic complaint has been registered in the Smart Theni database.
          </p>

          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 text-left mb-8 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-500">ISSUE ID</span>
              <span className="font-mono font-bold text-tnblue-800 text-base">{successResult.issueId}</span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-500">CATEGORY</span>
              <span className="text-sm font-bold text-slate-800">{CATEGORIES[successResult.category]?.label.split(' / ')[0]}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-500">WARD & VILLAGE</span>
              <span className="text-sm font-bold text-slate-800">{successResult.ward} ({WARD_OFFICERS[successResult.ward]?.split(' ')[1] || 'Theni Central'})</span>
            </div>

            <div className="text-xs text-slate-500">
              <span className="font-semibold block mb-0.5">LOCATION</span>
              <span className="font-medium text-slate-700">{successResult.address}</span>
            </div>

            {successResult.type === 'duplicate' && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5 flex items-start space-x-2.5 mt-2">
                <ShieldAlert className="w-5 h-5 text-orange-650 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-orange-850">Duplicate Match Detected!</h4>
                  <p className="text-[11px] text-orange-700 mt-0.5 leading-relaxed">
                    This matches an existing open issue in the same category within 50 meters. To increase resolution priority, we have merged your complaint with <strong>{successResult.issueId}</strong> (total {successResult.matches} citizen reports).
                  </p>
                </div>
              </div>
            )}

            {successResult.type === 'new' && (
              <div className="bg-tngreen-50 border border-tngreen-200 rounded-xl p-3.5 flex items-start space-x-2.5 mt-2">
                <Check className="w-5 h-5 text-tngreen-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-tngreen-800">Unique Report Logged</h4>
                  <p className="text-[11px] text-tngreen-700 mt-0.5 leading-relaxed">
                    No active duplicates were found nearby. A new worker request has been created and logged. Assigned Ward Officers will review it shortly.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setSelectedIssueId(successResult.issueId);
                setCurrentScreen('detail');
              }}
              className="flex-1 py-3 bg-tnblue-800 hover:bg-tnblue-900 text-white font-bold rounded-xl shadow-md transition-all duration-150 flex items-center justify-center space-x-1.5"
            >
              <span>Track Resolution Timeline</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
            
            <button
              onClick={handleReset}
              className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all duration-150"
            >
              File Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Report a Civic Problem / புகார் அளிக்கவும்</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload a photo, pinpoint the location, and submit it. Our system routes it to the local ward officer.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Form Details (2 columns) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          
          {/* Photo Upload Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md">
            <label className="block text-sm font-extrabold text-slate-800 mb-3">
              1. Upload Photo / புகைப்படம் பதிவேற்றவும் <span className="text-red-500">*</span>
            </label>
            
            {!photo ? (
              <div className="border-2 border-dashed border-slate-350 hover:border-tnblue-400 rounded-xl p-8 text-center cursor-pointer transition-colors duration-150 relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-slate-100 p-4 rounded-full text-slate-500 mb-3">
                    <Upload className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Drag & Drop photo here, or browse</p>
                  <p className="text-xs text-slate-400 mt-1">Supports camera snapshot or image file upload</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video max-h-64 bg-slate-100">
                  <img src={photo} alt="Civic problem preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setPhoto(null); setPhotoName(""); setAiResult(null); }}
                    className="absolute top-3 right-3 bg-red-650 hover:bg-red-750 text-white p-2 rounded-full shadow-lg transition-colors font-bold text-xs"
                    style={{backgroundColor: '#dc2626'}}
                  >
                    Remove / நீக்கு
                  </button>
                </div>
                
                {/* AI Scanning Status */}
                {isScanning && (
                  <div className="bg-tnblue-50 border border-tnblue-200 rounded-xl p-4 flex items-center space-x-3 justify-center animate-pulse">
                    <RefreshCw className="h-5 w-5 text-tnblue-700 animate-spin" />
                    <span className="text-sm font-semibold text-tnblue-900">AI scanning image for categories...</span>
                  </div>
                )}

                {/* AI Category Detected Badge */}
                {aiResult && !isScanning && (
                  <div className="bg-tngreen-50 border border-tngreen-200 rounded-xl p-4 flex items-start space-x-3">
                    <div className="bg-tngreen-100 text-tngreen-700 p-2 rounded-full">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-tngreen-900 flex items-center gap-1.5">
                        AI Categorization Complete
                        <span className="bg-tngreen-200 text-tngreen-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                          {aiResult.confidence}% Match
                        </span>
                      </h4>
                      <p className="text-xs text-tngreen-700 mt-0.5">
                        Identified as <strong>{CATEGORIES[aiResult.category]?.label.split(' / ')[0]}</strong>. You can manually adjust the category below if incorrect.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Location Picker Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-extrabold text-slate-800">
                2. Pinpoint Location / இடம் <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleLocateMe}
                className="text-xs font-bold text-tnblue-700 hover:text-tnblue-900 flex items-center gap-1 bg-tnblue-50 px-2.5 py-1.5 rounded-lg border border-tnblue-100 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>Use My GPS / என் இடம்</span>
              </button>
            </div>

            {/* Address bar */}
            <div className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
              <MapPin className="text-slate-400 h-4.5 w-4.5 flex-shrink-0" />
              <span className="truncate">{address}</span>
            </div>

            {/* Small leaflet map to click/drag marker */}
            <div className="h-56 w-full rounded-xl overflow-hidden border border-slate-200 relative">
              <MapContainer 
                center={location} 
                zoom={14} 
                className="h-full w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={location} setPosition={setLocation} setAddress={setAddress} />
              </MapContainer>
              <div className="absolute top-2 right-2 bg-white/95 px-2 py-1 rounded border border-slate-200 text-[10px] text-slate-500 z-20">
                Click map to reposition pin
              </div>
            </div>

            {/* Ward Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                Select Ward / வார்டு எண்
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-tnblue-500 focus:outline-none"
              >
                {Object.keys(WARD_OFFICERS).map((w) => (
                  <option key={w} value={w}>{w} - {WARD_OFFICERS[w]?.split(' ')[1] || 'Theni Core'}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Form details (Category & Description) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-4">
            <label className="block text-sm font-extrabold text-slate-800">
              3. Issue Category & Description / விவரம்
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                Category / வகை
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-tnblue-500 focus:outline-none"
              >
                {Object.entries(CATEGORIES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Description / விளக்கம் (Optional)
                </label>
                <button
                  type="button"
                  onClick={runManualAI}
                  disabled={!description}
                  className="text-[10px] font-bold text-tngreen-700 hover:text-tngreen-800 flex items-center gap-0.5 disabled:opacity-50"
                >
                  <Brain className="h-3 w-3" /> Re-run AI Category Predictor
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                placeholder="E.g., Large pothole in front of library. / நூலகத்திற்கு முன்பாக பெரிய சாலை பழுது ஏற்பட்டுள்ளது."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-tnblue-500 focus:outline-none placeholder:text-slate-400"
              ></textarea>
            </div>
          </div>

        </form>

        {/* Right Side: OTP Verification / Submit Control (1 column) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-4">
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5 pb-3 border-b border-slate-100">
              <Smartphone className="text-tnblue-700" />
              Citizen Verification
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              We require a valid phone number to prevent spam and allow you to reopen the issue or confirm when fixed.
            </p>

            {!otpSent ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Mobile Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-tnblue-500 focus:outline-none"
                    maxLength="10"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={phone.length < 10}
                  className="w-full py-3 bg-tnblue-700 hover:bg-tnblue-800 text-white text-xs font-extrabold rounded-xl shadow transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Verification OTP / குறியீட்டைப் பெறு
                </button>
              </div>
            ) : !otpVerified ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                    Enter OTP sent to {phone.slice(0,3)}***{phone.slice(-3)}
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="Enter 4-digit OTP"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-tnblue-500 focus:outline-none text-center tracking-widest text-lg"
                    maxLength="4"
                    required
                  />
                  <p className="text-[10px] text-tngreen-700 font-bold mt-1.5 text-center">
                    💡 Demo Mode: Enter "1234" to bypass
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpCode.length < 4}
                  className="w-full py-3 bg-tngreen-600 hover:bg-tngreen-700 text-white text-xs font-extrabold rounded-xl shadow transition-all duration-150 disabled:opacity-50"
                >
                  Verify Code / சரிபார்
                </button>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Change Phone Number
                </button>
              </div>
            ) : (
              <div className="bg-tngreen-50 border border-tngreen-250 rounded-xl p-3.5 flex items-center space-x-2">
                <Check className="h-5 w-5 text-tngreen-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-extrabold text-tngreen-800">Phone Verified</p>
                  <p className="text-[10px] text-tngreen-700">+91 {phone.slice(0,3)}***{phone.slice(-3)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setOtpVerified(false); setOtpSent(false); setOtpCode(""); }}
                  className="text-[10px] font-bold text-slate-400 hover:text-red-500"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs text-slate-400 leading-relaxed space-y-2">
            <h4 className="font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="h-4 w-4" /> Duplicate Protection Policy
            </h4>
            <p>
              To prevent fragmented tickets, reports within 50m of another open issue in the same category are auto-merged. This bundles citizen votes and elevates the problem's urgency in the officer dashboard.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!photo || !otpVerified || isSubmitting}
            className={`w-full py-4 text-white text-lg font-black rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 ${
              !photo || !otpVerified || isSubmitting
                ? 'bg-slate-350 cursor-not-allowed opacity-60 shadow-none hover:transform-none'
                : 'bg-tngreen-600 hover:bg-tngreen-700 hover:shadow-xl'
            }`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Logging Complaint...</span>
              </>
            ) : (
              <>
                <span>Submit Complaint / சமர்ப்பி</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
