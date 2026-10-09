import React from 'react';
import { User, Cpu, Shield, HardDrive, AlertTriangle, Info } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const Settings: React.FC = () => {
  const { userSettings, updateSettings } = useAppStore();

  return (
    <div className="h-full max-w-3xl mx-auto py-8 animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-[#94a3b8]">Manage your preferences and AI model configuration.</p>
      </div>

      <div className="space-y-6">
        {/* User Profile */}
        <section className="card p-6 bg-[#16213e]/50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
            <User size={18} className="text-[#818cf8]" /> Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Display Name</label>
              <p className="text-xs text-white/40 mb-3">Used to detect mentions and assignments in conversations.</p>
              <input 
                type="text" 
                value={userSettings.displayName}
                onChange={(e) => updateSettings({ displayName: e.target.value })}
                className="input-field w-full max-w-md"
              />
            </div>
          </div>
        </section>

        {/* AI Settings */}
        <section className="card p-6 bg-[#16213e]/50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
            <Cpu size={18} className="text-[#c084fc]" /> AI Configuration
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">Processing Quality</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['fast', 'balanced', 'thorough'] as const).map(quality => (
                  <button
                    key={quality}
                    onClick={() => updateSettings({ modelQuality: quality })}
                    className={`p-3 rounded-lg border text-sm text-left transition-all ${
                      userSettings.modelQuality === quality
                        ? 'bg-[#6366f1]/20 border-[#6366f1] text-white'
                        : 'bg-[#0f0f23] border-white/10 text-white/60 hover:border-white/30'
                    }`}
                  >
                    <div className="font-medium capitalize mb-1">{quality}</div>
                    <div className="text-xs opacity-70">
                      {quality === 'fast' && 'Quick processing, basic extraction.'}
                      {quality === 'balanced' && 'Good mix of speed and detail.'}
                      {quality === 'thorough' && 'Deep analysis, slower processing.'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={userSettings.autoProcess}
                  onChange={(e) => updateSettings({ autoProcess: e.target.checked })}
                />
                <div className="w-11 h-6 bg-[#0f0f23] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/80 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6366f1] border border-white/10"></div>
              </div>
              <div>
                <div className="text-sm font-medium text-white/90">Auto-process on import</div>
                <div className="text-xs text-white/40">Automatically start AI processing when a new chat is imported</div>
              </div>
            </label>
          </div>
        </section>

        {/* Data & Privacy */}
        <section className="card p-6 bg-[#16213e]/50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
            <Shield size={18} className="text-[#22c55e]" /> Data & Privacy
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-[#0f0f23] rounded-lg border border-white/5">
              <HardDrive size={20} className="text-[#94a3b8] mt-0.5" />
              <div>
                <div className="text-sm font-medium text-white/90">Local Storage Location</div>
                <div className="text-xs text-white/50 font-mono mt-1">IndexedDB / scrunch-chat-db</div>
                <div className="text-xs text-[#22c55e] mt-1 flex items-center gap-1">
                  <Check size={12} /> All data is stored locally on your device.
                </div>
              </div>
            </div>

            <button className="flex items-center gap-2 text-sm text-[#ef4444] hover:bg-[#ef4444]/10 px-3 py-2 rounded-md transition-colors border border-transparent hover:border-[#ef4444]/20 mt-4">
              <AlertTriangle size={16} /> Clear All Data
            </button>
          </div>
        </section>

        {/* About */}
        <section className="text-center py-4 space-y-2">
          <div className="flex items-center justify-center gap-2 text-white/40">
            <Info size={14} />
            <span className="text-xs">Scrunch Chat v1.0.0</span>
          </div>
          <p className="text-xs text-white/30 max-w-md mx-auto">
            Committed to privacy. Built with React, Electron, and local AI technology.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Settings;
