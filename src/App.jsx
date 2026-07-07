import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import ReportIssuePage from './components/ReportIssuePage';
import StatusDashboard from './components/StatusDashboard';
import OfficerDashboard from './components/OfficerDashboard';
import IssueDetail from './components/IssueDetail';
import { seedIssues } from './data/mockIssues';
import { database, storage, isFirebaseReady } from './firebaseClient';
import { ref, set, onValue } from 'firebase/database';
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';

import 'leaflet/dist/leaflet.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [issues, setIssues] = useState(seedIssues);

  // 1. Listen to Realtime Database on mount (with automatic seeding if db is empty)
  useEffect(() => {
    if (!isFirebaseReady) return;

    console.log("Firebase RTD configured. Listening to issues path...");
    const dbIssuesRef = ref(database, 'issues');
    
    // Set up real-time listener
    const unsubscribe = onValue(dbIssuesRef, async (snapshot) => {
      const val = snapshot.val();
      
      if (val) {
        // Convert keyed object to list
        const parsedList = Object.values(val);
        console.log(`Realtime Database updated: fetched ${parsedList.length} issues.`);
        // Sort issues by reported date descending
        const sorted = parsedList.sort((a, b) => new Date(b.reportedDate) - new Date(a.reportedDate));
        setIssues(sorted);
      } else {
        // SEEDING: Database is empty, pre-fill with our 9 mock issues
        console.log("Realtime Database is empty. Seeding database with initial issues...");
        const seedObj = {};
        seedIssues.forEach(issue => {
          seedObj[issue.id] = issue;
        });
        
        await set(dbIssuesRef, seedObj);
        console.log("Seed data pushed to Realtime Database.");
      }
    }, (error) => {
      console.error("Realtime Database listener error (using local memory):", error.message);
    });

    return () => unsubscribe();
  }, []);

  // Helper: Upload Base64 image to Firebase Storage Bucket 'civic-photos'
  const uploadBase64ToFirebase = async (base64Data, prefix = 'photo') => {
    if (!base64Data || !base64Data.startsWith('data:image')) {
      return base64Data; // Already public URL or not a base64 string
    }

    try {
      const filePath = `civic-photos/${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`;
      const storeRef = storageRef(storage, filePath);
      
      // Upload string using 'data_url' format
      await uploadString(storeRef, base64Data, 'data_url');

      // Get public download URL
      const publicUrl = await getDownloadURL(storeRef);
      return publicUrl;
    } catch (err) {
      console.error("Firebase storage upload failed (using base64 inline fallback):", err);
      return base64Data;
    }
  };

  // 2. State-change Interceptor: Sync local changes to remote Realtime Database
  const syncStateToFirebase = async (prevIssues, nextIssues) => {
    if (!isFirebaseReady) return;

    // A. Sync new ticket creation
    if (nextIssues.length > prevIssues.length) {
      const addedIssues = nextIssues.filter(n => !prevIssues.some(p => p.id === n.id));
      for (let issue of addedIssues) {
        try {
          console.log(`Uploading file and writing new issue ${issue.id} to Realtime Database...`);
          // 1. Upload photo to Firebase Storage
          const publicUrl = await uploadBase64ToFirebase(issue.photoUrlBefore, 'before');
          const issueWithUrl = { ...issue, photoUrlBefore: publicUrl };

          // 2. Write details to database: /issues/THN-XXXX
          await set(ref(database, `issues/${issue.id}`), issueWithUrl);
        } catch (err) {
          console.error("Error creating remote Realtime DB ticket:", err);
        }
      }
      return;
    }

    // B. Sync modifications, status changes, or duplicate merges
    for (let nextIssue of nextIssues) {
      const prevIssue = prevIssues.find(p => p.id === nextIssue.id);
      if (!prevIssue) continue;

      const statusChanged = prevIssue.status !== nextIssue.status;
      const officerChanged = prevIssue.officerAssigned !== nextIssue.officerAssigned;
      const afterPhotoChanged = prevIssue.photoUrlAfter !== nextIssue.photoUrlAfter;
      const duplicatesCountChanged = (nextIssue.duplicates || []).length > (prevIssue.duplicates || []).length;

      if (statusChanged || officerChanged || afterPhotoChanged || duplicatesCountChanged) {
        try {
          console.log(`Syncing modifications for issue ${nextIssue.id} to Realtime Database...`);

          // 1. Upload "after" photo if newly updated
          let afterUrl = nextIssue.photoUrlAfter;
          if (afterPhotoChanged && nextIssue.photoUrlAfter && nextIssue.photoUrlAfter.startsWith('data:image')) {
            afterUrl = await uploadBase64ToFirebase(nextIssue.photoUrlAfter, 'after');
          }

          const issueWithUrl = { ...nextIssue, photoUrlAfter: afterUrl };

          // 2. Overwrite issue key with updated details
          await set(ref(database, `issues/${nextIssue.id}`), issueWithUrl);
        } catch (err) {
          console.error(`Error updating Realtime DB issue ${nextIssue.id}:`, err);
        }
      }
    }
  };

  // Wrapper for setIssues that triggers background database sync
  const updateIssuesAndSync = (newIssuesOrFn) => {
    setIssues(prevIssues => {
      const nextIssues = typeof newIssuesOrFn === 'function' ? newIssuesOrFn(prevIssues) : newIssuesOrFn;
      syncStateToFirebase(prevIssues, nextIssues);
      return nextIssues;
    });
  };

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return (
          <LandingPage
            issues={issues}
            setCurrentScreen={setCurrentScreen}
            setSelectedIssueId={setSelectedIssueId}
          />
        );
      case 'report':
        return (
          <ReportIssuePage
            issues={issues}
            setIssues={updateIssuesAndSync}
            setCurrentScreen={setCurrentScreen}
            setSelectedIssueId={setSelectedIssueId}
          />
        );
      case 'dashboard':
        return (
          <StatusDashboard
            issues={issues}
            setCurrentScreen={setCurrentScreen}
            setSelectedIssueId={setSelectedIssueId}
          />
        );
      case 'officer':
        return (
          <OfficerDashboard
            issues={issues}
            setIssues={updateIssuesAndSync}
          />
        );
      case 'detail':
        return (
          <IssueDetail
            issueId={selectedIssueId}
            issues={issues}
            setIssues={updateIssuesAndSync}
            setCurrentScreen={setCurrentScreen}
          />
        );
      default:
        return (
          <LandingPage
            issues={issues}
            setCurrentScreen={setCurrentScreen}
            setSelectedIssueId={setSelectedIssueId}
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Navigation Header */}
      <Navbar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />

      {/* Main Content Area */}
      <main className="flex-grow">
        {renderActiveScreen()}
      </main>

      {/* Government Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4 border-t-4 border-tngreen-700">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Info */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-lg tracking-wider font-heading">
              தேனி நகராட்சி • Smart Theni
            </h4>
            <p className="text-xs leading-relaxed max-w-sm">
              Smart Theni Civic Problem Solver is an official public-welfare initiative of the Theni Allinagaram Municipal Corporation, Tamil Nadu. Designed for transparent and accountable local governance.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Quick Links / இணைப்புகள்</h4>
            <ul className="text-xs space-y-2">
              <li>
                <button onClick={() => setCurrentScreen('landing')} className="hover:text-tngreen-450 transition-colors">
                  Home / முகப்பு
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentScreen('dashboard')} className="hover:text-tngreen-450 transition-colors">
                  Live Public Map / வரைபடம்
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentScreen('report')} className="hover:text-tngreen-450 transition-colors">
                  Report Civic Issue / புகார் செய்ய
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentScreen('officer')} className="hover:text-tngreen-450 transition-colors">
                  Officer Portal / அதிகாரிகள் பக்கம்
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency helpline & Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Contact Helpdesk / உதவிக்கு</h4>
            <p className="text-xs">
              <strong>Toll Free:</strong> 1800-425-XXXX (TN Civic Helpline)<br />
              <strong>WhatsApp:</strong> +91 94454-XXXXX (Municipal Grievance)<br />
              <strong>Email:</strong> commr.theni@tn.gov.in
            </p>
            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
              © {new Date().getFullYear()} Theni Municipal Corporation. All rights reserved. Developed for public administration.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
