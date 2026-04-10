import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight, Wallet, Info, ChevronDown, ChevronUp, ArrowRightLeft } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { calculateMoMChange } from '../utils/calculations';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const Dashboard = ({ stats, transactions, categories, allTransactions, onUpdateBalance, allMonthlyStats }) => {
  const { income, expense, savings, opening, closing } = stats;
  const [showConfig, setShowConfig] = useState(false);

  // Find previous month for comparison
  const sortedMonthKeys = useMemo(() => Object.keys(allMonthlyStats).sort(), [allMonthlyStats]);
  const currentMonthKey = sortedMonthKeys.find(k => allMonthlyStats[k] === stats) || 
                          Object.keys(allMonthlyStats).find(k => allMonthlyStats[k].income === income && allMonthlyStats[k].expense === expense);
  
  // A more robust way to find current month index
  const currentIndex = sortedMonthKeys.indexOf(currentMonthKey);
  const prevMonthKey = currentIndex > 0 ? sortedMonthKeys[currentIndex - 1] : null;
  const prevStats = prevMonthKey ? allMonthlyStats[prevMonthKey] : null;

  // Comparison metrics
  const incomeChange = prevStats ? calculateMoMChange(income, prevStats.income) : null;
  const expenseChange = prevStats ? calculateMoMChange(expense, prevStats.expense) : null;
  const savingsChange = prevStats ? calculateMoMChange(savings, prevStats.savings) : null;

  const totalOpening = (opening?.checking || 0) + (opening?.savings || 0);
  const totalClosing = (closing?.checking || 0) + (closing?.savings || 0);
  const netChange = totalClosing - totalOpening;

  // Pie chart data for expense categories
  const expenseData = Object.entries(stats.categories || {})
    .filter(([catId]) => {
      const cat = categories.find(c => c.id === catId);
      return cat && cat.type === 'expense';
    })
    .map(([catId, amount]) => ({
      name: categories.find(c => c.id === catId)?.name || 'Määramata',
      value: amount
    }));

  // Wealth growth chart data
  const chartData = sortedMonthKeys.map(month => ({
    name: month,
    wealth: (allMonthlyStats[month].closing?.checking || 0) + (allMonthlyStats[month].closing?.savings || 0),
    savings: allMonthlyStats[month].closing?.savings || 0
  }));

  const COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Monthly Starting Balances Config */}
      <div className="glass rounded-3xl overflow-hidden shadow-xl border-white/5">
        <button 
          onClick={() => setShowConfig(!showConfig)}
          className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary-500/10 rounded-lg">
                <Wallet className="text-primary-400 w-5 h-5" />
             </div>
             <div className="text-left">
                <h3 className="font-bold text-white text-sm">Kuu alguse jäägid</h3>
                <p className="text-slate-500 text-xs">Seadista oma pangakontode algseis</p>
             </div>
          </div>
          {showConfig ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
        </button>

        {showConfig && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/10 animate-in">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Arvelduskonto</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={opening?.checking || ''} 
                  onChange={(e) => onUpdateBalance('checking', e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">€</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Säästukonto</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={opening?.savings || ''} 
                  onChange={(e) => onUpdateBalance('savings', e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">€</span>
              </div>
            </div>
            {stats.isCarriedOver && (
              <div className="md:col-span-2 flex items-center gap-2 text-primary-400 text-xs">
                <Info size={14} />
                <span>Need andmed on üle kantud eelmise kuu lõpu seisust. Võid neid soovi korral muuta.</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tulu" 
          amount={income} 
          icon={<TrendingUp className="text-emerald-400" />} 
          color="emerald" 
          comparison={incomeChange}
        />
        <StatCard 
          title="Kulu" 
          amount={expense} 
          icon={<TrendingDown className="text-rose-400" />} 
          color="rose" 
          comparison={expenseChange}
          invertColor={true}
        />
        <StatCard 
          title="Sääst" 
          amount={savings} 
          icon={<PiggyBank className="text-primary-400" />} 
          color="primary" 
          comparison={savingsChange}
        />
        <StatCard 
          title="Kuu muutus" 
          amount={netChange} 
          secondary={true}
          trend={netChange >= 0 ? 'up' : 'down'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wealth Chart */}
        <div className="glass p-6 rounded-3xl min-h-[400px]">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary-400" /> Koguvara kasv
          </h3>
          <div className="h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}€`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="wealth" name="Koguvara" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorWealth)" />
                  <Area type="monotone" dataKey="savings" name="Säästukonto" stroke="#10b981" fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 italic">Andmed puuduvad</div>
            )}
          </div>
        </div>

        {/* Categories Chart */}
        <div className="glass p-6 rounded-3xl min-h-[400px]">
          <h3 className="text-lg font-semibold mb-6">Kulude jaotus</h3>
          <div className="h-72">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 italic">Antud kuul kulutused puuduvad</div>
            )}
          </div>
        </div>
      </div>

      {/* Account Balances Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 md:pb-0">
          <div className="glass p-6 rounded-3xl border border-white/5">
             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Arvelduskonto</p>
             <div className="flex justify-between items-end">
                <div>
                  <p className="text-slate-400 text-[10px]">Alguses</p>
                  <p className="text-lg font-semibold">{formatCurrency(opening?.checking || 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px]">Lõpus (prognoos)</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(closing?.checking || 0)}</p>
                </div>
             </div>
          </div>
          <div className="glass p-6 rounded-3xl border border-emerald-500/10">
             <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest mb-4">Säästukonto</p>
             <div className="flex justify-between items-end">
                <div>
                  <p className="text-slate-400 text-[10px]">Alguses</p>
                  <p className="text-lg font-semibold">{formatCurrency(opening?.savings || 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px]">Lõpus (prognoos)</p>
                  <p className="text-xl font-bold text-emerald-400">{formatCurrency(closing?.savings || 0)}</p>
                </div>
             </div>
          </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, amount, icon, color, secondary, trend, comparison, invertColor }) => (
  <div className={`glass p-6 rounded-3xl transition-transform hover:scale-[1.02] duration-300 ${secondary ? 'border-primary-500/30' : ''}`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-xl ${secondary ? 'bg-primary-500/10' : 'bg-slate-800'}`}>
        {icon || <TrendingUp className="text-slate-400" />}
      </div>
      {trend && (
        <span className={`text-xs px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'} flex items-center gap-1`}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        </span>
      )}
    </div>
    <p className="text-slate-400 text-sm mb-1">{title}</p>
    <h4 className="text-2xl font-bold tracking-tight">{formatCurrency(Math.abs(amount) || 0)}</h4>
    
    {comparison !== null && comparison !== undefined && (
      <div className="mt-3 flex items-center gap-1.5">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
          comparison > 0 
            ? (invertColor ? 'text-rose-400 bg-rose-400/10' : 'text-emerald-400 bg-emerald-400/10')
            : (invertColor ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10')
        }`}>
          {comparison > 0 ? '+' : ''}{comparison}%
        </span>
        <span className="text-slate-500 text-[10px]">vs eelmine kuu</span>
      </div>
    )}
  </div>
);

export default Dashboard;
