import React, { useEffect } from 'react';
import Titlebar from './components/Titlebar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ConversationView from './components/ConversationView';
import Settings from './components/Settings';
import ProcessingOverlay from './components/ProcessingOverlay';
import { useAppStore } from './store/appStore';

function App() {
  const currentView = useAppStore(state => state.currentView);
  const isProcessing = useAppStore(state => state.isProcessing);
  const initStore = useAppStore(state => state.initStore);

  useEffect(() => {
    if (initStore) {
      initStore();
    }
  }, [initStore]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f0f23] text-[#e2e8f0] overflow-hidden">
      <Titlebar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#0f0f23] p-6 relative">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'conversation' && <ConversationView />}
          {currentView === 'settings' && <Settings />}
        </main>
        {isProcessing && <ProcessingOverlay />}
      </div>
    </div>
  );
}

export default App;
