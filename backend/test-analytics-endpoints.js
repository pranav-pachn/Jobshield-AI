const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api/analytics';

async function testAnalyticsEndpoints() {
  console.log('🧪 Testing Analytics Endpoints...\n');

  try {
    // Test 1: Risk Distribution
    console.log('1. Testing GET /api/analytics/risk-distribution');
    try {
      const riskResponse = await axios.get(`${BASE_URL}/risk-distribution`);
      console.log('✅ Risk Distribution Response:', JSON.stringify(riskResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Risk Distribution Error:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Scam Trends (default 30 days)
    console.log('2. Testing GET /api/analytics/trends (default 30 days)');
    try {
      const trendsResponse = await axios.get(`${BASE_URL}/trends`);
      console.log('✅ Scam Trends Response:', JSON.stringify(trendsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Scam Trends Error:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Scam Trends (7 days)
    console.log('3. Testing GET /api/analytics/trends?days=7');
    try {
      const trends7Response = await axios.get(`${BASE_URL}/trends?days=7`);
      console.log('✅ Scam Trends (7 days) Response:', JSON.stringify(trends7Response.data, null, 2));
    } catch (error) {
      console.log('❌ Scam Trends (7 days) Error:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Top Indicators (default 10)
    console.log('4. Testing GET /api/analytics/top-indicators (default 10)');
    try {
      const indicatorsResponse = await axios.get(`${BASE_URL}/top-indicators`);
      console.log('✅ Top Indicators Response:', JSON.stringify(indicatorsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Top Indicators Error:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 5: Top Indicators (5 limit)
    console.log('5. Testing GET /api/analytics/top-indicators?limit=5');
    try {
      const indicators5Response = await axios.get(`${BASE_URL}/top-indicators?limit=5`);
      console.log('✅ Top Indicators (5 limit) Response:', JSON.stringify(indicators5Response.data, null, 2));
    } catch (error) {
      console.log('❌ Top Indicators (5 limit) Error:', error.response?.data || error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 6: Invalid parameters
    console.log('6. Testing invalid parameters');
    try {
      const invalidResponse = await axios.get(`${BASE_URL}/trends?days=invalid`);
      console.log('❌ Should have failed but got:', invalidResponse.data);
    } catch (error) {
      console.log('✅ Correctly rejected invalid days parameter:', error.response?.data || error.message);
    }

    try {
      const invalidLimitResponse = await axios.get(`${BASE_URL}/top-indicators?limit=invalid`);
      console.log('❌ Should have failed but got:', invalidLimitResponse.data);
    } catch (error) {
      console.log('✅ Correctly rejected invalid limit parameter:', error.response?.data || error.message);
    }

    console.log('\n🎉 Analytics Endpoint Testing Complete!');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testAnalyticsEndpoints();
}

module.exports = { testAnalyticsEndpoints };
