import Papa from 'papaparse';

const CATEGORY_KEYWORDS = {
  'Spotify': '4', // Meelelahutus
  'Netflix': '4',
  'Selver': '1', // Toit
  'Maksimark': '1',
  'Rimi': '1',
  'Prisma': '1',
  'Lidl': '1',
  'Grossi': '1',
  'Bolt': '2', // Transport
  'Uber': '2',
  'Olerex': '2',
  'Circle K': '2',
  'Alexela': '2',
  'IKEA': '3', // Üür/Kodu (simplified mapping)
  'Üür': '3',
  'Palk': '5', // Palk
  'Töötukassa': '5',
};

export const parseLHVCSV = (csvString, categories) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rawData = results.data;
          
          const transactions = rawData
            .filter(row => {
              // Skip micro-savings transfers as they are internal "savings"
              const explanation = (row['Selgitus'] || '').toLowerCase();
              if (explanation.includes('mikrokogumine')) return false;
              return true;
            })
            .map(row => {
              const amount = parseFloat(row['Summa'] || '0');
              const type = amount < 0 ? 'expense' : 'income';
              const description = row['Saaja/maksja nimi'] || row['Selgitus'] || 'Tehing';
              const date = row['Kuupäev'];
              
              // Try to find category by keywords
              let categoryId = categories.find(c => c.type === type)?.id; // Default
              
              for (const [kw, cid] of Object.entries(CATEGORY_KEYWORDS)) {
                if (description.toLowerCase().includes(kw.toLowerCase())) {
                  // Ensure category exists and is of correct type
                  const cat = categories.find(c => c.id === cid);
                  if (cat) {
                    categoryId = cid;
                    break;
                  }
                }
              }

              return {
                id: Math.random().toString(36).substr(2, 9),
                amount: Math.abs(amount),
                description,
                date,
                type,
                categoryId,
                paymentMethod: 'transfer', // Bank transfers are always transfers
                isImported: true
              };
            });
          
          resolve(transactions);
        } catch (error) {
          reject('Faili parsimisel tekkis viga: ' + error.message);
        }
      },
      error: (error) => {
        reject(error.message);
      }
    });
  });
};
