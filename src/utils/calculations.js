export const calculateSavings = (amount, multiplier = 3) => {
  if (amount <= 0) return 0;
  
  // Rule: Round up to the NEXT whole number
  const rounded = Math.floor(amount) + 1;
  const difference = rounded - amount;
  
  // Multiply difference by the provided multiplier (default 3)
  return Number((difference * multiplier).toFixed(2));
};

export const aggregateByMonth = (transactions, monthlyBalances = {}) => {
  const months = {};
  
  // Sort transactions by date to ensure proper carryover if we were doing it sequentially, 
  // but here we'll do it by looking at keys.
  
  transactions.forEach(t => {
    const month = t.date.substring(0, 7); // YYYY-MM
    if (!months[month]) {
      months[month] = { 
        income: 0, 
        expense: 0, 
        savings: 0, 
        categories: {},
        opening: monthlyBalances[month] || null
      };
    }
    
    if (t.type === 'income') {
      months[month].income += t.amount;
    } else if (t.type === 'expense') {
      months[month].expense += t.amount;
    } else if (t.type === 'saving') {
      months[month].savings += t.amount;
    }
    
    // Breakdown by category
    if (!months[month].categories[t.categoryId]) {
      months[month].categories[t.categoryId] = 0;
    }
    months[month].categories[t.categoryId] += t.amount;
  });

  // Handle auto-carryover and calculating closing balances
  const sortedMonths = Object.keys(months).sort();
  
  sortedMonths.forEach((month, index) => {
    const data = months[month];
    
    // If no manual opening balance, try to carry over from previous month
    if (!data.opening && index > 0) {
      const prevMonth = sortedMonths[index - 1];
      const prevData = months[prevMonth];
      if (prevData.closing) {
        data.opening = { ...prevData.closing };
        data.isCarriedOver = true;
      }
    }
    
    // Closing = Opening + Net Flow
    // Checking: Opening Checking + Income - Expense (Real Cash) - Manual Savings - Transfers Out + Transfers In
    const checkingIn = data.income;
    const checkingOut = data.expense + data.savings;
    
    // Transfers are handled specifically
    const transfersToSavings = transactions
      .filter(t => t.date.startsWith(month) && t.type === 'transfer' && t.direction === 'toSavings')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const transfersToChecking = transactions
      .filter(t => t.date.startsWith(month) && t.type === 'transfer' && t.direction === 'toChecking')
      .reduce((sum, t) => sum + t.amount, 0);

    data.closing = {
      checking: (data.opening?.checking || 0) + checkingIn - checkingOut - transfersToSavings + transfersToChecking,
      savings: (data.opening?.savings || 0) + data.savings + transfersToSavings - transfersToChecking
    };
  });
  
  return months;
};

export const calculateMoMChange = (currentValue, previousValue) => {
  if (!previousValue || previousValue === 0) return null;
  const change = ((currentValue - previousValue) / previousValue) * 100;
  return Number(change.toFixed(1));
};

export const getMonthLabel = (monthStr) => {
  const [year, month] = monthStr.split('-');
  const months = [
    'jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 
    'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'
  ];
  return `${months[parseInt(month) - 1]} ${year}`;
};
