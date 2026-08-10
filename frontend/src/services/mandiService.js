// High-Fidelity Mock Service for Indian Mandi Prices (Agmarknet data simulation)
// In a production environment, this would call data.gov.in API:
// fetch(`https://api.data.gov.in/resource/...&api-key=${import.meta.env.VITE_GOV_API_KEY}`)

const MOCK_MANDI_DATA = [
  {
    state: "Haryana",
    district: "Karnal",
    market: "Karnal",
    commodity: "Wheat",
    variety: "Other",
    grade: "FAQ",
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: 2250,
    max_price: 2350,
    modal_price: 2275
  },
  {
    state: "Haryana",
    district: "Kurukshetra",
    market: "Pipli",
    commodity: "Wheat",
    variety: "Local",
    grade: "FAQ",
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: 2200,
    max_price: 2320,
    modal_price: 2260
  },
  {
    state: "Punjab",
    district: "Ludhiana",
    market: "Ludhiana",
    commodity: "Wheat",
    variety: "147 Average",
    grade: "FAQ",
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: 2300,
    max_price: 2410,
    modal_price: 2350
  },
  {
    state: "Haryana",
    district: "Karnal",
    market: "Gharaunda",
    commodity: "Mustard",
    variety: "Mustard",
    grade: "FAQ",
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: 5200,
    max_price: 5450,
    modal_price: 5350
  },
  {
    state: "Uttar Pradesh",
    district: "Agra",
    market: "Agra",
    commodity: "Potato",
    variety: "Desi",
    grade: "FAQ",
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: 1200,
    max_price: 1550,
    modal_price: 1400
  },
  {
    state: "Madhya Pradesh",
    district: "Indore",
    market: "Indore",
    commodity: "Soyabean",
    variety: "Yellow",
    grade: "FAQ",
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: 4500,
    max_price: 4800,
    modal_price: 4650
  },
  {
    state: "Maharashtra",
    district: "Nashik",
    market: "Lasalgaon",
    commodity: "Onion",
    variety: "Red",
    grade: "FAQ",
    arrival_date: new Date().toISOString().split('T')[0],
    min_price: 2500,
    max_price: 3200,
    modal_price: 2800
  }
];

export const fetchMandiPrices = async (filters = {}) => {
  // Simulate network delay between 800ms to 2000ms for realism
  const delay = Math.floor(Math.random() * 1200) + 800;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...MOCK_MANDI_DATA];
      
      // Apply filters if they exist
      if (filters.commodity && filters.commodity !== 'All') {
        filteredData = filteredData.filter(item => 
          item.commodity.toLowerCase() === filters.commodity.toLowerCase()
        );
      }
      
      if (filters.state && filters.state !== 'All') {
        filteredData = filteredData.filter(item => 
          item.state.toLowerCase() === filters.state.toLowerCase()
        );
      }

      if (filters.district && filters.district !== 'All') {
        filteredData = filteredData.filter(item => 
          item.district.toLowerCase() === filters.district.toLowerCase()
        );
      }

      resolve(filteredData);
    }, delay);
  });
};
