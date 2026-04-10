import React, { useState, useEffect } from 'react';
import { PlusCircle, Utensils, Car, Home, Gamepad, Wallet, PiggyBank, Calendar, ArrowRightLeft, X, CheckCircle } from 'lucide-react';
import { calculateSavings } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';

const iconMap = {
  Utensils, Car, Home, Gamepad, Wallet, PiggyBank, ArrowRightLeft
};

const TransactionForm = ({ categories, onSubmit, editingTransaction, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    categoryId: categories[0]?.id || '',
    date: new Date().toISOString().substring(0, 10),
    type: 'expense',
    paymentMethod: 'card',
    direction: 'toSavings' // Standard transfer direction
  });

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        ...editingTransaction,
        amount: editingTransaction.amount.toString()
      });
    }
  }, [editingTransaction]);

  const selectedCategory = categories.find(c => c.id === formData.categoryId);
  const potentialSavings = formData.type === 'expense' && formData.paymentMethod === 'card' 
    ? calculateSavings(Number(formData.amount)) 
    : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || (!formData.categoryId && formData.type !== 'transfer')) return;

    const submissionData = {
      ...formData,
      amount: Number(formData.amount),
      type: formData.type === 'transfer' ? 'transfer' : (categories.find(c => c.id === formData.categoryId)?.type || 'expense')
    };

    if (submissionData.type !== 'transfer') {
      delete submissionData.direction;
    }

    onSubmit(submissionData);
    
    if (!editingTransaction) {
      setFormData({
        amount: '',
        description: '',
        categoryId: categories[0]?.id,
        date: new Date().toISOString().substring(0, 10),
        type: 'expense',
        paymentMethod: 'card',
        direction: 'toSavings'
      });
    }
  };

  return (
    <div className="glass p-8 rounded-3xl max-w-2xl mx-auto shadow-2xl shadow-black/50 relative">
      {editingTransaction && (
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-bold text-white mb-2">
          {editingTransaction ? 'Muuda tehingut' : 'Lisa uus tehing'}
        </h2>

        <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-2xl">
           {['expense', 'income', 'transfer'].map(type => (
              <button 
                key={type}
                type="button"
                onClick={() => setFormData({...formData, type})}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold transition-all ${
                  formData.type === type 
                    ? (type === 'expense' ? 'bg-rose-500' : type === 'income' ? 'bg-emerald-500' : 'bg-primary-500') + ' text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type === 'expense' ? 'Kulu' : type === 'income' ? 'Tulu' : 'Ülekanne'}
              </button>
           ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Summa (€)</label>
            <input 
              type="number" 
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-mono"
            />
            {potentialSavings > 0 && formData.type === 'expense' && (
              <p className="mt-2 text-primary-400 text-xs flex items-center gap-1">
                <PiggyBank size={14} /> +{formatCurrency(potentialSavings)} kogutakse säästudesse
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Kirjeldus</label>
            <input 
              type="text" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder={formData.type === 'transfer' ? 'Selgitus' : 'Mille eest?'}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {formData.type === 'transfer' ? (
            <div>
              <label className="block text-sm text-slate-400 mb-2">Suund</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, direction: 'toSavings'})}
                  className={`py-4 rounded-2xl border text-sm font-medium transition-all ${formData.direction === 'toSavings' ? 'bg-primary-500/20 border-primary-500 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}
                >
                  Arveldus ➔ Säästu
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, direction: 'toChecking'})}
                  className={`py-4 rounded-2xl border text-sm font-medium transition-all ${formData.direction === 'toChecking' ? 'bg-primary-500/20 border-primary-500 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}
                >
                  Säästu ➔ Arveldus
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Kategooria</label>
                <select 
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                >
                  {categories.filter(c => c.type === (formData.type === 'saving' ? 'saving' : formData.type)).map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Makseviis</label>
                <select 
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                >
                  <option value="card" className="bg-slate-900">Kaardimakse</option>
                  <option value="transfer" className="bg-slate-900">Ülekanne</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-2">Kuupäev</label>
            <input 
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex gap-4">
          {editingTransaction && (
             <button 
               type="button"
               onClick={onCancel}
               className="flex-1 py-5 rounded-2xl border border-white/10 text-slate-400 font-bold hover:text-white transition-all"
             >
               Tühista
             </button>
          )}
          <button 
            type="submit"
            className="flex-[2] bg-primary-500 hover:bg-primary-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2 group"
          >
            {editingTransaction ? <CheckCircle className="opacity-70" /> : <PlusCircle className="group-hover:rotate-90 transition-transform duration-300" />}
            {editingTransaction ? 'Salvesta muudatused' : 'Salvesta tehing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
