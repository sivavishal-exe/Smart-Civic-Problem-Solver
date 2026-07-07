import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import ReportIssuePage from './components/ReportIssuePage';
import StatusDashboard from './components/StatusDashboard';
import OfficerDashboard from './components/OfficerDashboard';
import IssueDetail from './components/IssueDetail';
import { seedIssues } from './data/mockIssues';
import { supabase, isSupabaseReady, mapDbToIssue, mapIssueToDb } from './supabaseClient';

import 'leaflet/dist/leaflet.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [issues, setIssues] = useState(seedIssues);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 1. Fetch Issues from Supabase on mount (with automatic seeding if db is empty)
  useEffect(() => {
    if (!isSupabaseReady) return;

    const loadData = async () => {
      try {
        console.log("Supabase configured. Attempting to fetch issues...");
        const { data, error } = await supabase
          .from('issues')
          .select(`
            *,
            updates (*),
            duplicates (*)
          `);

        if (error) throw error;

        if (data && data.length > 0) {
          console.log(`Fetched ${data.length} issues successfully from Supabase.`);
          const frontendIssues = data.map(mapDbToIssue);
          // Sort by reported date descending
          const sorted = frontendIssues.sort((a, b) => new Date(b.reportedDate) - new Date(a.reportedDate));
          setIssues(sorted);
        } else {
          // SEEDING: Database is empty, pre-fill with our 9 mock issues
          console.log("Supabase database is empty. Auto-seeding with initial civic reports...");
          
          for (let issue of seedIssues) {
            // A. Insert issue row
            const dbRow = mapIssueToDb(issue);
            const { error: issueErr } = await supabase.from('issues').insert(dbRow);
            if (issueErr) console.error("Error seeding issue row:", issueErr);

            // B. Insert updates timeline
            if (issue.updates && issue.updates.length > 0) {
              const updatesRows = issue.updates.map(u => ({
                issue_id: issue.id,
                status: u.status,
                date: u.date,
                note: u.note
              }));
              const { error: updErr } = await supabase.from('updates').insert(updatesRows);
              if (updErr) console.error("Error seeding updates:", updErr);
            }

            // C. Insert duplicates
            if (issue.duplicates && issue.duplicates.length > 0) {
              const dupsRows = issue.duplicates.map(d => ({
                issue_id: issue.id,
                reported_date: d.reportedDate,
                phone: d.phone,
                note: d.note
              }));
              const { error: dupErr } = await supabase.from('duplicates').insert(dupsRows);
              if (dupErr) console.error("Error seeding duplicates:", dupErr);
            }
          }

          // Reload fresh seeded data
          const { data: freshData, error: reloadErr } = await supabase
            .from('issues')
            .select('*, updates(*), duplicates(*)');
          
          if (!reloadErr && freshData) {
            const sortedSeeded = freshData.map(mapDbToIssue).sort((a, b) => new Date(b.reportedDate) - new Date(a.reportedDate));
            setIssues(sortedSeeded);
            console.log("Seeding complete. Synced local state with seeded database.");
          }
        }
      } catch (err) {
        console.error("Supabase integration error (falling back to local memory):", err.message);
      }
    };

    loadData();
  }, []);

  // Helper: Upload Base64 image to Supabase Storage Bucket 'civic-photos'
  const uploadBase64ToStorage = async (base64Data, prefix = 'photo') => {
    if (!base64Data || !base64Data.startsWith('data:image')) {
      return base64Data; // Already public URL or not a base64 string
    }

    try {
      const response = await fetch(base64Data);
      const blob = await response.blob();
      const extension = blob.type.split('/')[1] || 'jpg';
      const filePath = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}.${extension}`;

      const { data, error } = await supabase.storage
        .from('civic-photos')
        .upload(filePath, blob, { contentType: blob.type });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('civic-photos')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err) {
      console.error("Storage upload failed (using base64 inline fallback):", err);
      return base64Data;
    }
  };

  // 2. State-change Interceptor: Sync local changes to remote database
  const syncStateToSupabase = async (prevIssues, nextIssues) => {
    if (!isSupabaseReady) return;

    // A. Sync new ticket creation
    if (nextIssues.length > prevIssues.length) {
      const addedIssues = nextIssues.filter(n => !prevIssues.some(p => p.id === n.id));
      for (let issue of addedIssues) {
        try {
          console.log(`Uploading files and writing new issue ${issue.id} to Supabase...`);
          // 1. Upload photo to storage
          const publicUrl = await uploadBase64ToStorage(issue.photoUrlBefore, 'before');
          const issueWithUrl = { ...issue, photoUrlBefore: publicUrl };

          // 2. Insert into issues table
          const dbRow = mapIssueToDb(issueWithUrl);
          await supabase.from('issues').insert(dbRow);

          // 3. Insert initial updates logs
          for (let u of issue.updates) {
            await supabase.from('updates').insert({
              issue_id: issue.id,
              status: u.status,
              date: u.date,
              note: u.note
            });
          }
        } catch (err) {
          console.error("Error creating remote ticket:", err);
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
          console.log(`Syncing modifications for issue ${nextIssue.id} to Supabase...`);

          // 1. Upload "after" photo if newly updated
          let afterUrl = nextIssue.photoUrlAfter;
          if (afterPhotoChanged && nextIssue.photoUrlAfter && nextIssue.photoUrlAfter.startsWith('data:image')) {
            afterUrl = await uploadBase64ToStorage(nextIssue.photoUrlAfter, 'after');
          }

          const issueWithUrl = { ...nextIssue, photoUrlAfter: afterUrl };

          // 2. Update issue row
          const dbRow = mapIssueToDb(issueWithUrl);
          await supabase
            .from('issues')
            .update(dbRow)
            .eq('id', nextIssue.id);

          // 3. Write new updates entries
          const newUpdates = (nextIssue.updates || []).filter(nu => 
            !(prevIssue.updates || []).some(pu => pu.note === nu.note && pu.status === nu.status)
          );
          for (let u of newUpdates) {
            await supabase.from('updates').insert({
              issue_id: nextIssue.id,
              status: u.status,
              date: u.date,
              note: u.note
            });
          }

          // 4. Write new duplicates entries
          if (duplicatesCountChanged) {
            const newDups = (nextIssue.duplicates || []).filter(nd => 
              !(prevIssue.duplicates || []).some(pd => pd.phone === nd.phone && pd.reportedDate === nd.reportedDate)
            );
            for (let d of newDups) {
              await supabase.from('duplicates').insert({
                issue_id: nextIssue.id,
                reported_date: d.reportedDate,
                phone: d.phone,
                note: d.note
              });
            }
          }
        } catch (err) {
          console.error(`Error updating issue ${nextIssue.id}:`, err);
        }
      }
    }
  };

  // Wrapper for setIssues that triggers background database sync
  const updateIssuesAndSync = (newIssuesOrFn) => {
    setIssues(prevIssues => {
      const nextIssues = typeof newIssuesOrFn === 'function' ? newIssuesOrFn(prevIssues) : newIssuesOrFn;
      syncStateToSupabase(prevIssues, nextIssues);
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
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-250">
      {/* Navigation Header */}
      <Navbar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} theme={theme} setTheme={setTheme} />

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
              © {new Date().getFullYear()} Theni Municipal Corporation. All rights reserved. Developed by Sivavishal and Nithish Krishna for public administration.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
