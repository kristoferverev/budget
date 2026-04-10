import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'minu_eelarve_andmed';

// Default categories to seed for new users
export const DEFAULT_CATEGORIES = [
  { name: 'Toit', type: 'expense', icon: 'Utensils' },
  { name: 'Transport', type: 'expense', icon: 'Car' },
  { name: 'Üür', type: 'expense', icon: 'Home' },
  { name: 'Meelelahutus', type: 'expense', icon: 'Gamepad' },
  { name: 'Palk', type: 'income', icon: 'Wallet' },
  { name: 'Säästud', type: 'saving', icon: 'PiggyBank' },
];

export const loadSupabaseData = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 1. Fetch Categories
  let { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  // 2. Seed default categories if none exist
  if (!categories || categories.length === 0) {
    const categoriesWithUser = DEFAULT_CATEGORIES.map(cat => ({ ...cat, user_id: user.id }));
    const { data: seededCats, error: seedError } = await supabase
      .from('categories')
      .insert(categoriesWithUser)
      .select();
    
    if (seedError) console.error('Error seeding categories:', seedError);
    categories = seededCats || [];
  }

  // 3. Fetch Transactions
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  // 4. Fetch Monthly Balances
  const { data: balances, error: balError } = await supabase
    .from('monthly_balances')
    .select('*');

  // Convert balances array to map { [month]: { checking, savings } }
  const monthlyBalances = (balances || []).reduce((acc, bal) => {
    acc[bal.month] = { checking: Number(bal.checking), savings: Number(bal.savings) };
    return acc;
  }, {});

  // 5. Fetch Savings Settings
  const { data: settings, error: setError } = await supabase
    .from('savings_settings')
    .select('*')
    .single();

  return {
    transactions: transactions || [],
    categories: categories || [],
    monthlyBalances,
    savingsSettings: settings || { enabled: true, multiplier: 3, round_to_whole: true },
    selectedMonth: new Date().toISOString().substring(0, 7)
  };
};

export const saveSupabaseTransaction = async (transaction) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const txData = {
    ...transaction,
    user_id: user.id
  };
  
  // Remove client-side id if it's not a UUID
  if (txData.id && txData.id.length < 20) delete txData.id;

  const { data, error } = await supabase
    .from('transactions')
    .upsert(txData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteSupabaseTransaction = async (id) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const updateSupabaseMonthlyBalance = async (month, balances) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('monthly_balances')
    .upsert({
      user_id: user.id,
      month,
      checking: balances.checking,
      savings: balances.savings
    });

  if (error) throw error;
};

export const updateSavingsSettings = async (settings) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('savings_settings')
    .upsert({
      user_id: user.id,
      ...settings,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
};

export const uploadReceipt = async (file, metadata = {}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  // 1. Upload file to Storage
  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // 2. Save metadata to Database
  const { data, error: dbError } = await supabase
    .from('receipts')
    .insert({
      user_id: user.id,
      file_path: filePath,
      status: 'pending',
      ...metadata
    })
    .select()
    .single();

  if (dbError) throw dbError;
  return data;
};

export const loadReceipts = async () => {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const exportData = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `eelarve_export_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const mergeTransactions = (existing, imported) => {
  const newTransactions = [...existing];
  let addedCount = 0;

  imported.forEach(tx => {
    const exists = existing.some(et => 
      et.date === tx.date && 
      Math.abs(et.amount - tx.amount) < 0.01 && 
      (et.description === tx.description || et.description.includes(tx.description) || tx.description.includes(et.description))
    );

    if (!exists) {
      newTransactions.push(tx);
      addedCount++;
    }
  });

  return { transactions: newTransactions, addedCount };
};
