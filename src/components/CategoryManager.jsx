import React, { useState } from 'react';
import { Plus, Trash2, Tag, Wallet, TrendingDown, PiggyBank } from 'lucide-react';

const CategoryManager = ({ categories, onUpdate }) => {
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' });

  const addCategory = () => {
    if (!newCategory.name) return;
    const id = Math.random().toString(36).substr(2, 9);
    onUpdate([...categories, { ...newCategory, id, icon: 'Tag' }]);
    setNewCategory({ name: '', type: 'expense' });
  };

  const removeCategory = (id) => {
    if (categories.length <= 1) return;
    onUpdate(categories.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="glass p-8 rounded-3xl">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Plus size={20} className="text-primary-400" /> Lisa uus kategooria
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            value={newCategory.name}
            onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
            placeholder="Kategooria nimi"
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <select 
            value={newCategory.type}
            onChange={(e) => setNewCategory({...newCategory, type: e.target.value})}
            className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="expense" className="bg-slate-900">Kulu</option>
            <option value="income" className="bg-slate-900">Tulu</option>
            <option value="saving" className="bg-slate-900">Sääst</option>
          </select>
          <button 
            onClick={addCategory}
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-4 rounded-2xl transition-all"
          >
            Lisa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['income', 'expense', 'saving'].map(type => (
          <div key={type} className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-2 flex items-center gap-2">
              {type === 'income' && <Wallet size={14} className="text-emerald-400" />}
              {type === 'expense' && <TrendingDown size={14} className="text-rose-400" />}
              {type === 'saving' && <PiggyBank size={14} className="text-primary-400" />}
              {type === 'income' ? 'Tulud' : type === 'expense' ? 'Kulud' : 'Säästud'}
            </h4>
            <div className="space-y-2">
              {categories.filter(c => c.type === type).map(cat => (
                <div key={cat.id} className="glass px-6 py-4 rounded-2xl flex items-center justify-between group transition-all hover:bg-white/5">
                  <div className="flex items-center gap-3">
                    <Tag size={16} className="text-slate-600" />
                    <span className="text-white font-medium">{cat.name}</span>
                  </div>
                  <button 
                    onClick={() => removeCategory(cat.id)}
                    className="p-2 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;
