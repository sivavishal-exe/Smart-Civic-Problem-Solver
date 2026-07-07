import React, { useState } from 'react';
import { ShieldAlert, Map, PlusCircle, UserCheck, Menu, X, Landmark } from 'lucide-react';

export default function Navbar({ currentScreen, setCurrentScreen }) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home / முகப்பு', icon: Landmark },
    { id: 'dashboard', label: 'Dashboard / வரைபடம்', icon: Map },
    { id: 'report', label: 'Report Issue / புகார் அளிக்கவும்', icon: PlusCircle },
    { id: 'officer', label: 'Officer Portal / அதிகாரி', icon: UserCheck },
  ];

  return (
    <nav className="bg-tnblue-800 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentScreen('landing')}>
            <div className="bg-white text-tnblue-800 p-2 rounded-full shadow-inner flex items-center justify-center">
              <Landmark className="h-6 w-6 text-tngreen-700" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight font-heading">SMART THENI</span>
                <span className="bg-tngreen-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">CIVIC</span>
              </div>
              <p className="text-[10px] sm:text-xs text-tnblue-100 font-sans tracking-wide">
                Theni Municipal Corporation • தேனி நகராட்சி
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id || (item.id === 'dashboard' && currentScreen === 'detail');
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentScreen(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-tngreen-700 text-white shadow-md'
                      : 'text-tnblue-100 hover:bg-tnblue-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-tnblue-100 hover:text-white hover:bg-tnblue-700 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-tnblue-900 border-t border-tnblue-750 transition-all duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id || (item.id === 'dashboard' && currentScreen === 'detail');
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentScreen(item.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center space-x-2.5 w-full px-4 py-3 rounded-md text-base font-medium transition-all ${
                    isActive
                      ? 'bg-tngreen-700 text-white'
                      : 'text-tnblue-100 hover:bg-tnblue-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
