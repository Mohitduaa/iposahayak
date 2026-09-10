// Test the new API
const testAPI = async () => {
  try {
    // Test search with "lg"
    const response = await fetch('https://api.iposahayak.com/api/closed-iposs/app?search=lg&page=1&limit=10');
    const result = await response.json();
    
    console.log('API Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log(`Found ${result.total} IPOs matching "lg"`);
      console.log(`Page ${result.page} of ${result.totalPages}`);
      console.log('First IPO:', result.data[0]?.name);
    }
  } catch (error) {
    console.error('API Error:', error);
  }
};

testAPI();