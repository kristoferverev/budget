import React, { useState } from 'react';
import { Trash2, Edit2, ArrowUpRight, ArrowDownRight, PiggyBank, Search, Filter, ArrowRightLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

const TransactionList = ({ transactions, categories, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  if (transactions.length === 0) {
    return (
      <div className="glass p-12 rounded-3xl text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="text-slate-600" />
        </div>
        <p className="text-slate-400">Ühtegi tehingut ei leitud.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Header */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Otsi tehingute hulgast..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {['all', 'income', 'expense', 'saving', 'transfer'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                filterType === type 
                  ? 'bg-primary-500 border-primary-500 text-white' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {type === 'all' ? 'Kõik' : type === 'income' ? 'Tulud' : type === 'expense' ? 'Kulud' : type === 'saving' ? 'Säästud' : 'Ülekanded'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((t) => {
            const category = categories.find((c) => c.id === t.categoryId);
            return (
              <div key={t.id} className="glass p-4 md:p-6 rounded-2xl flex items-center justify-between group transition-all hover:bg-white/5 border border-transparent hover:border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 
                    t.type === 'expense' ? 'bg-rose-500/10 text-rose-400' :
                    'bg-primary-500/10 text-primary-400'
                  }`}>
                    {t.type === 'income' ? <ArrowUpRight size={20} /> : 
                     t.type === 'saving' ? <PiggyBank size={20} /> :
                     t.type === 'transfer' ? <ArrowRightLeft size={20} /> :
                     <ArrowDownRight size={20} />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{t.description || category?.name || 'Tehing'}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{formatDate(t.date)}</span>
                      <span>•</span>
                      <span>{category?.name || (t.type === 'transfer' ? 'Sisemine ülekanne' : 'Määramata')}</span>
                      {(t.type === 'transfer' || t.type === 'saving') && t.direction && (
                         <>
                           <span>•</span>
                           <span className="text-primary-400/80">
                             {t.direction === 'toSavings' ? 'Arveldus ➔ Säästu' : 'Säästu ➔ Arveldus'}
                           </span>
                         </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:gap-8">
                  <span className={`text-base md:text-lg font-bold font-mono ${
                    t.type === 'income' ? 'text-emerald-400' : 
                    t.type === 'expense' ? 'text-white' : 
                    'text-primary-400'
                  }`}>
                    {t.type === 'income' ? '+' : (t.type === 'transfer' ? '' : '-')}
                    {formatCurrency(t.amount)}
                  </span>
                  <div className="flex items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => onEdit(t)}
                      className="p-2 text-slate-500 hover:text-primary-400 hover:bg-primary-400/10 rounded-lg"
                      title="Muuda"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg"
                      title="Kustuta"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-slate-500 italic">
            Filtrile vastavaid tehinguid ei leitud.
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
