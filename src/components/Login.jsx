import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Wallet, Mail, Loader2, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Sisselogimise link on saadetud sinu e-mailile!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 font-sans">
      <div className="w-full max-w-md animate-in">
        <div className="glass p-8 md:p-10 rounded-[2rem] border-white/5 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="p-4 bg-primary-500 rounded-2xl shadow-lg shadow-primary-500/20 mb-6">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Minu Eelarve</h1>
            <p className="text-slate-400 text-sm">Sünkrooni oma eelarve kõikide seadmete vahel</p>
          </div>

          {message ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center animate-in">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
              <p className="text-emerald-400 font-medium mb-4">{message}</p>
              <button 
                onClick={() => setMessage(null)}
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Kasuta teist e-maili
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 ml-1">
                  E-posti aadress
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-primary-400 text-slate-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="nimi@näide.ee"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-600"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/40 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2 group overflow-hidden relative"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Saada sisselogimise link
                    <span className="absolute right-0 top-0 h-full w-12 flex items-center justify-center translate-x-full group-hover:translate-x-0 transition-transform bg-black/10">
                      <Mail size={18} />
                    </span>
                  </>
                )}
              </button>
              
              <p className="text-center text-slate-500 text-[10px] leading-relaxed px-4">
                Me saadame sulle sisselogimiseks unikaalse lingi. 
                Parooli ei ole vaja meeles pidada.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
