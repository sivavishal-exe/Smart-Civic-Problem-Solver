import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import ReportIssuePage from './components/ReportIssuePage';
import StatusDashboard from './components/StatusDashboard';
import OfficerDashboard from './components/OfficerDashboard';
import IssueDetail from './components/IssueDetail';
import { seedIssues } from './data/mockIssues';

import 'leaflet/dist/leaflet.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [issues, setIssues] = useState(seedIssues);

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
            setIssues={setIssues}
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
            setIssues={setIssues}
          />
        );
      case 'detail':
        return (
          <IssueDetail
            issueId={selectedIssueId}
            issues={issues}
            setIssues={setIssues}
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
