import React, { useState, useRef } from 'react';
import { uploadReceipt } from '../utils/storage';
import { Upload, FileText, X, CheckCircle2, Loader2, Camera, AlertCircle } from 'lucide-react';

const ReceiptUpload = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = async (file) => {
    // Only allow images and PDFs
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Palun vali pilt (JPG, PNG) või PDF fail.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await uploadReceipt(file);
      setSuccess(true);
      if (onUploadSuccess) onUploadSuccess(result);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Üleslaadimine ebaõnnestus: ' + (err.message || 'Tundmatu viga'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`relative glass rounded-[2rem] border-2 border-dashed transition-all duration-300 p-8 md:p-12 text-center ${
          dragActive ? 'border-primary-500 bg-primary-500/10 scale-[1.01]' : 'border-white/10 hover:border-white/20'
        } ${uploading ? 'pointer-events-none opacity-80' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleChange}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-4 py-4 animate-in">
            <div className="relative">
               <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="text-primary-400 w-6 h-6" />
               </div>
            </div>
            <div>
               <h4 className="text-lg font-bold text-white mb-1">Faili edastamine...</h4>
               <p className="text-slate-500 text-sm">Salvestame tšekki turvaliselt Supabase hoidlasse</p>
            </div>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center gap-4 py-4 animate-in">
            <div className="p-4 bg-emerald-500/20 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
            <div>
               <h4 className="text-lg font-bold text-emerald-400 mb-1">Tšekk üles laaditud!</h4>
               <p className="text-slate-500 text-sm">Asume kohe sisu parsimise juurde</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-4">
               <button 
                 onClick={() => inputRef.current?.click()}
                 className="p-6 bg-primary-500/10 rounded-3xl text-primary-400 hover:bg-primary-500/20 transition-all group"
               >
                 <Upload className="w-10 h-10 group-hover:-translate-y-1 transition-transform" />
               </button>
               <button 
                 onClick={() => {
                   inputRef.current.setAttribute('capture', 'environment');
                   inputRef.current?.click();
                 }}
                 className="p-6 bg-indigo-500/10 rounded-3xl text-indigo-400 hover:bg-indigo-500/20 transition-all group md:hidden"
               >
                 <Camera className="w-10 h-10 group-hover:scale-110 transition-transform" />
               </button>
            </div>
            
            <div>
              <h4 className="text-xl font-bold text-white mb-2">Lisa uus tšekk</h4>
              <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                Lohista tšekk siia või vali fail oma seadmest. Toetame Lidl ja Selver faile.
              </p>
              <button 
                onClick={() => inputRef.current?.click()}
                className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-2xl font-semibold border border-white/10 transition-all"
              >
                Vali fail
              </button>
            </div>

            {error && (
               <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-400/10 px-4 py-2 rounded-xl border border-rose-400/20 animate-in">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="ml-2 hover:text-white">
                     <X size={14} />
                  </button>
               </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-8 opacity-50">
         <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <span className="w-2 h-2 rounded-full bg-primary-500" /> Lidl digitee
         </div>
         <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Selver Partnerkaart
         </div>
      </div>
    </div>
  );
};

export default ReceiptUpload;
