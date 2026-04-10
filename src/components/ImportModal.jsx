import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { parseLHVCSV } from '../utils/csvParser';
import { formatCurrency } from '../utils/formatters';

const ImportModal = ({ isOpen, onClose, onImport, categories }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const transactions = await parseLHVCSV(text, categories);
        setPreview(transactions);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Faili lugemisel tekkis viga');
      setLoading(false);
    };
    reader.readAsText(selectedFile);
  };

  const confirmImport = () => {
    onImport(preview);
    onClose();
    setFile(null);
    setPreview([]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in">
      <div className="glass w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <Upload className="w-5 h-5 text-primary-400" />
            </div>
            <h2 className="text-xl font-bold text-white">LHV CSV Import</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto">
          {!file ? (
            <div className="border-2 border-dashed border-white/10 rounded-3xl p-12 text-center hover:border-primary-500/50 transition-colors group">
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                className="hidden" 
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-white font-medium mb-1">Vali LHV väljavõtte fail (.csv)</p>
                <p className="text-slate-500 text-sm">Lohistage fail siia või klõpsake avamiseks</p>
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              {loading ? (
                <div className="py-12 text-center text-slate-400">Analüüsin faili...</div>
              ) : error ? (
                <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl flex gap-4 items-start">
                  <AlertCircle className="text-rose-400 shrink-0" />
                  <div>
                    <h3 className="text-rose-400 font-semibold mb-1">Viga</h3>
                    <p className="text-rose-400/80 text-sm">{error}</p>
                    <button onClick={() => setFile(null)} className="mt-4 text-xs font-bold uppercase tracking-wider underline">Proovi uuesti</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-400 text-sm">Leitud <span className="text-white font-bold">{preview.length}</span> tehingut</p>
                    <button onClick={() => setFile(null)} className="text-xs text-primary-400 hover:underline">Vaheta faili</button>
                  </div>
                  <div className="space-y-2">
                    {preview.slice(0, 10).map((tx, idx) => (
                      <div key={idx} className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white truncate max-w-[200px]">{tx.description}</p>
                          <p className="text-[10px] text-slate-500">{tx.date}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </p>
                          <p className="text-[10px] text-slate-500">
                             {categories.find(c => c.id === tx.categoryId)?.name || 'Määramata'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {preview.length > 10 && (
                      <p className="text-center text-slate-500 text-xs py-4">...ja veel {preview.length - 10} tehingut</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 bg-white/5 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-slate-400 font-bold hover:text-white transition-colors">
            Tühista
          </button>
          <button 
            disabled={!preview.length || loading}
            onClick={confirmImport}
            className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={20} />
            Impordi tehingud
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
