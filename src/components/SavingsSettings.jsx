import React from 'react';
import { PiggyBank, Info, CheckCircle2 } from 'lucide-react';

const SavingsSettings = ({ settings, onUpdate }) => {
  const multipliers = [1, 2, 3, 4, 5, 10];

  const toggleSavings = () => {
    onUpdate({ ...settings, enabled: !settings.enabled });
  };

  const setMultiplier = (m) => {
    onUpdate({ ...settings, multiplier: m });
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6 md:p-8 border-white/5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <PiggyBank size={120} />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <PiggyBank className="text-primary-400" /> Mikrosäästmine
            </h3>
            <p className="text-slate-400 text-sm max-w-md">
              Automaatne säästmine kaardimaksetelt. Ümardame summad järgmise täiseeuroni ja korrutame vahe sinu valitud kordajaga.
            </p>
          </div>
          
          <button 
            onClick={toggleSavings}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
              settings.enabled ? 'bg-primary-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                settings.enabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {settings.enabled && (
           <div className="space-y-8 animate-in relative z-10">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Säästude kordaja</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {multipliers.map(m => (
                    <button
                      key={m}
                      onClick={() => setMultiplier(m)}
                      className={`py-3 rounded-2xl font-bold transition-all border ${
                        settings.multiplier === m 
                          ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/20' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {m}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-primary-500/5 border border-primary-500/10 rounded-2xl p-4 flex gap-3">
                 <div className="p-2 bg-primary-500/10 rounded-lg h-fit">
                    <Info size={18} className="text-primary-400" />
                 </div>
                 <div className="text-sm italic text-slate-400">
                    <p className="mb-2">
                      <span className="text-white font-medium">Näide:</span> Kui ostad kohvi hinnaga <span className="text-white">3.40€</span>, siis säästuks läheb <span className="text-primary-400">{(0.6 * settings.multiplier).toFixed(2)}€</span> ({(1 - 0.4).toFixed(1)}€ * {settings.multiplier}x).
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-primary-400/80">
                       <CheckCircle2 size={12} />
                       <span>Sääst tekkib vaid kaardimaksete puhul</span>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default SavingsSettings;
