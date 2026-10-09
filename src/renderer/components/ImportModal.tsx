import React, { useState } from 'react';
import { X, UploadCloud, FileText, Check, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';

interface ImportModalProps {
  onClose: () => void;
}

const platforms = [
  { id: 'whatsapp', name: 'WhatsApp', icon: 'W' },
  { id: 'discord', name: 'Discord', icon: 'D' },
];

const ImportModal: React.FC<ImportModalProps> = ({ onClose }) => {
  const { importFromFile } = useAppStore();
  const [dragActive, setDragActive] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsImporting(true);
    try {
      await importFromFile(file, selectedPlatform);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1a1a2e] border border-white/10 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex justify-between items-center p-5 border-b border-white/5 bg-[#16213e]/80">
          <h2 className="text-xl font-semibold text-white">Import Conversation</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Platform Selector */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-3">Select Source Platform (Optional)</label>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`p-3 rounded-lg border text-sm font-medium flex items-center gap-2 transition-all ${
                    selectedPlatform === p.id 
                      ? 'bg-[#6366f1]/20 border-[#6366f1] text-white shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                      : 'bg-[#16213e] border-white/10 text-white/60 hover:bg-white/5 hover:text-white/90'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                    selectedPlatform === p.id ? 'bg-[#6366f1] text-white' : 'bg-white/10'
                  }`}>
                    {p.icon}
                  </div>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${
              dragActive 
                ? 'border-[#6366f1] bg-[#6366f1]/5' 
                : 'border-white/10 bg-[#16213e]/50 hover:bg-[#16213e] hover:border-white/20'
            }`}
          >
            {isImporting ? (
              <div className="flex flex-col items-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-full border-4 border-[#6366f1]/20 border-t-[#6366f1] animate-spin"></div>
                <p className="text-white font-medium">Processing file...</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-[#0f0f23] rounded-full flex items-center justify-center mb-4 shadow-inner border border-white/5">
                  <UploadCloud size={32} className={dragActive ? 'text-[#818cf8]' : 'text-white/40'} />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Drag & drop your chat export here</h3>
                <p className="text-sm text-white/50 mb-6 max-w-xs">
                  Supports JSON, CSV, and TXT files exported from major messaging platforms.
                </p>
                <label className="btn-primary cursor-pointer">
                  Browse Files
                  <input type="file" className="hidden" onChange={handleFileSelect} accept=".json,.csv,.txt" />
                </label>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-white/40 justify-center">
            <AlertCircle size={12} />
            Your files stay local and are never uploaded to the cloud.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
