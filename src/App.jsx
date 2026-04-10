import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabase';
import { loadSupabaseData, saveSupabaseTransaction, deleteSupabaseTransaction, updateSupabaseMonthlyBalance, updateSavingsSettings, loadReceipts, exportData, importData, mergeTransactions } from './utils/storage';
import { aggregateByMonth, calculateSavings } from './utils/calculations';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import CategoryManager from './components/CategoryManager';
import SavingsSettings from './components/SavingsSettings';
import ReceiptUpload from './components/ReceiptUpload';
import ImportModal from './components/ImportModal';
import Login from './components/Login';
import { Wallet, List, BarChart3, Settings2, Download, Upload, PiggyBank, FileSpreadsheet, LogOut, Loader2, Receipt } from 'lucide-react';

const App = () => {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [data, setData] = useState({ 
    transactions: [], 
    categories: [], 
    monthlyBalances: {}, 
    receipts: [],
    selectedMonth: new Date().toISOString().substring(0, 7) 
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const supabaseData = await loadSupabaseData();
      const receipts = await loadReceipts();
      if (supabaseData) {
        setData({ ...supabaseData, receipts: receipts || [] });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const selectedMonth = data.selectedMonth || new Date().toISOString().substring(0, 7);
  const setSelectedMonth = (month) => setData({ ...data, selectedMonth: month });

  const stats = useMemo(() => {
    const monthlyData = aggregateByMonth(data.transactions, data.monthlyBalances || {});
    return monthlyData[selectedMonth] || { 
      income: 0, 
      expense: 0, 
      savings: 0, 
      categories: {},
      opening: data.monthlyBalances[selectedMonth] || { checking: 0, savings: 0 },
      closing: { checking: 0, savings: 0 }
    };
  }, [data.transactions, data.monthlyBalances, selectedMonth]);

  const allMonthlyStats = useMemo(() => {
    return aggregateByMonth(data.transactions, data.monthlyBalances || {});
  }, [data.transactions, data.monthlyBalances]);

  const addTransaction = async (transaction) => {
    try {
      const newTx = await saveSupabaseTransaction(transaction);
      let updatedTransactions = [newTx, ...data.transactions];

      // Micro-investing logic
      const settings = data.savingsSettings || { enabled: true, multiplier: 3, round_to_whole: true };
      
      if (settings.enabled && transaction.type === 'expense' && transaction.paymentMethod === 'card') {
        const savingsAmount = calculateSavings(transaction.amount, settings.multiplier || 3);
        if (savingsAmount > 0) {
          const savingsCategory = data.categories.find(c => c.type === 'saving') || data.categories[0];
          const savingsTx = {
            amount: savingsAmount,
            date: transaction.date,
            type: 'saving',
            categoryId: savingsCategory.id,
            description: `Mikrosääst (${transaction.description || 'Kulu'})`,
            related_to: newTx.id
          };
          const savedSavingsTx = await saveSupabaseTransaction(savingsTx);
          updatedTransactions = [savedSavingsTx, ...updatedTransactions];
        }
      }

      setData({ ...data, transactions: updatedTransactions });
    } catch (error) {
      alert('Viga salvestamisel: ' + error.message);
    }
  };

  const updateTransaction = async (updatedTransaction) => {
    try {
      const savedTx = await saveSupabaseTransaction(updatedTransaction);
      const transactions = data.transactions.map(t => 
        t.id === savedTx.id ? savedTx : t
      );
      setData({ ...data, transactions });
      setEditingTransaction(null);
      setActiveTab('history');
    } catch (error) {
      alert('Viga uuendamisel: ' + error.message);
    }
  };

  const deleteTransaction = async (id) => {
    if (confirm('Kas oled kindel, et soovid selle tehingu kustutada?')) {
      try {
        await deleteSupabaseTransaction(id);
        const newTransactions = data.transactions.filter(t => t.id !== id && t.related_to !== id);
        setData({ ...data, transactions: newTransactions });
      } catch (error) {
        alert('Viga kustutamisel: ' + error.message);
      }
    }
  };

  const updateCategory = (categories) => {
    // We'll move category updates to Supabase in Phase 2.5
    setData({ ...data, categories });
  };

  const updateSettings = async (newSettings) => {
    try {
      await updateSavingsSettings(newSettings);
      setData({ ...data, savingsSettings: newSettings });
    } catch (error) {
      alert('Viga seadete salvestamisel: ' + error.message);
    }
  };

  const updateMonthlyBalance = async (month, type, value) => {
    const currentBalances = data.monthlyBalances || {};
    const monthBalances = currentBalances[month] || { checking: 0, savings: 0 };
    const updatedMonthBalances = { ...monthBalances, [type]: Number(value) };
    
    try {
      await updateSupabaseMonthlyBalance(month, updatedMonthBalances);
      const updatedBalances = {
        ...currentBalances,
        [month]: updatedMonthBalances
      };
      setData({ ...data, monthlyBalances: updatedBalances });
    } catch (error) {
      alert('Viga jäägi uuendamisel: ' + error.message);
    }
  };

  const handleImport = (newData) => {
    setData(newData);
    alert('Andmed imporditud! NB: Need on hetkel vaid mälus, salvestamiseks kasuta vormi.');
  };

  const handleLHVImport = async (importedTransactions) => {
    const { transactions, addedCount } = mergeTransactions(data.transactions, importedTransactions);
    // For MVP, we'll suggest manual review or batch save. 
    // For now, let's just push them all to Supabase.
    try {
      const newTxs = importedTransactions.filter(tx => !data.transactions.some(et => et.date === tx.date && et.amount === tx.amount));
      for (const tx of newTxs) {
        const { id, ...txData } = tx; // Remove client-side temp ID
        await saveSupabaseTransaction(txData);
      }
      await fetchData();
      alert(`Import õnnestus! Lisati ${newTxs.length} uut tehingut.`);
      setActiveTab('history');
    } catch (error) {
      alert('Viga importimisel: ' + error.message);
    }
  };

  const availableMonths = useMemo(() => {
    const months = [...new Set(data.transactions.map(t => t.date.substring(0, 7)))];
    const current = new Date().toISOString().substring(0, 7);
    if (!months.includes(current)) months.push(current);
    if (data.selectedMonth && !months.includes(data.selectedMonth)) months.push(data.selectedMonth);
    return months.sort().reverse();
  }, [data.transactions, data.selectedMonth]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-64 transition-all duration-300">
      {/* Sidebar - Same as before with Sign Out */}
      <aside className="fixed bottom-0 left-0 z-50 w-full h-16 glass md:h-screen md:w-64 md:border-r border-white/10 flex md:flex-col items-center py-0 md:py-8">
        <div className="hidden md:flex items-center gap-3 px-6 mb-12">
          <div className="p-2 bg-primary-500 rounded-xl shadow-lg shadow-primary-500/20">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Minu Eelarve</h1>
        </div>

        <nav className="flex md:flex-col w-full px-4 gap-2 h-full md:h-auto items-center md:items-stretch justify-around md:justify-start">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<BarChart3 />} label="Ülevaade" />
          <NavItem active={activeTab === 'form'} onClick={() => { setActiveTab('form'); setEditingTransaction(null); }} icon={<PiggyBank />} label="Lisa" />
          <NavItem active={activeTab === 'receipts'} onClick={() => setActiveTab('receipts')} icon={<Receipt />} label="Tšekid" />
          <NavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<List />} label="Ajalugu" />
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings2 />} label="Seaded" />
        </nav>

        <div className="hidden md:flex flex-col mt-auto w-full px-6 gap-3 mb-6">
          <button onClick={() => exportData(data)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <Download size={18} /> Eksport
          </button>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 transition-colors mt-4"
          >
            <LogOut size={18} /> Logi välja
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-6xl mx-auto animate-in">
        {dataLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="text-slate-400 animate-pulse">Andmete laadimine pilvest...</p>
          </div>
        ) : (
          <>
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
                  {activeTab === 'dashboard' && 'Ülevaade'}
                  {activeTab === 'form' && 'Lisa tehing'}
                  {activeTab === 'receipts' && 'Tšekid ja analüüs'}
                  {activeTab === 'history' && 'Tehingute ajalugu'}
                  {activeTab === 'settings' && 'Rakenduse seaded'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {activeTab === 'dashboard' && 'Kuidas su säästud kasvavad'}
                  {activeTab === 'form' && 'Pane kirja oma tulud ja kulud'}
                  {activeTab === 'receipts' && 'Laadi üles Lidl ja Selver tšekid'}
                  {activeTab === 'history' && 'Sinu viimased tehingud'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                >
                  {availableMonths.map(m => (
                    <option key={m} value={m} className="bg-slate-900">{m}</option>
                  ))}
                </select>
              </div>
            </header>

            {activeTab === 'dashboard' && (
              <Dashboard 
                stats={stats} 
                transactions={data.transactions.filter(t => t.date.startsWith(selectedMonth))}
                categories={data.categories}
                allTransactions={data.transactions}
                onUpdateBalance={(type, val) => updateMonthlyBalance(selectedMonth, type, val)}
                allMonthlyStats={allMonthlyStats}
              />
            )}
            
            {activeTab === 'form' && (
              <TransactionForm 
                categories={data.categories} 
                onSubmit={editingTransaction ? updateTransaction : addTransaction} 
                editingTransaction={editingTransaction}
                onCancel={() => { setEditingTransaction(null); setActiveTab('history'); }}
              />
            )}

            {activeTab === 'receipts' && (
               <div className="space-y-8">
                  <ReceiptUpload onUploadSuccess={() => fetchData()} />
                  <div className="glass rounded-[2rem] p-8 border-white/5">
                     <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <List size={20} className="text-primary-400" /> Viimased tšekid
                     </h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="border-b border-white/10">
                                 <th className="pb-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Kauplus</th>
                                 <th className="pb-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Kuupäev</th>
                                 <th className="pb-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Summa</th>
                                 <th className="pb-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Staatus</th>
                              </tr>
                           </thead>
                           <tbody>
                              {data.receipts && data.receipts.length > 0 ? (
                                 data.receipts.map(r => (
                                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                       <td className="py-4 text-sm font-medium text-white">{r.store_name || 'Tuvastamisel...'}</td>
                                       <td className="py-4 text-sm text-slate-400">{r.date || new Date(r.created_at).toLocaleDateString()}</td>
                                       <td className="py-4 text-sm text-white text-right font-bold">{r.total_amount ? `${r.total_amount}€` : '-'}</td>
                                       <td className="py-4 text-right">
                                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                                             r.status === 'parsed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                          }`}>
                                             {r.status === 'parsed' ? 'Valmis' : 'Ootel'}
                                          </span>
                                       </td>
                                    </tr>
                                 ))
                              ) : (
                                 <tr>
                                    <td colSpan="4" className="py-12 text-center text-slate-500 italic">Üleslaaditud tšekid puuduvad</td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'history' && (
              <TransactionList 
                transactions={data.transactions.filter(t => t.date.startsWith(selectedMonth))}
                categories={data.categories}
                onEdit={(t) => { setEditingTransaction(t); setActiveTab('form'); }}
                onDelete={deleteTransaction}
              />
            )}

            {activeTab === 'settings' && (
              <div className="space-y-12">
                <SavingsSettings 
                  settings={data.savingsSettings || { enabled: true, multiplier: 3, round_to_whole: true }}
                  onUpdate={updateSettings}
                />
                
                <div className="pt-8 border-t border-white/10">
                   <h3 className="text-xl font-bold text-white mb-6 ml-1">Kategooriad</h3>
                   <CategoryManager 
                    categories={data.categories} 
                    onUpdate={updateCategory} 
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImport={handleLHVImport}
        categories={data.categories}
      />
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-200 ${
      active ? 'bg-primary-500/10 text-primary-400' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
    }`}
  >
    {React.cloneElement(icon, { size: 20 })}
    <span className="text-[10px] md:text-sm font-medium">{label}</span>
  </button>
);

export default App;
