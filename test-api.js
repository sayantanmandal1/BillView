// Simple test script to check API connectivity
const API_BASE = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Testing PDF Review Dashboard API...\n');

  // Test 1: Health Check
  try {
    console.log('1️⃣ Testing health endpoint...');
    const response = await fetch(`${API_BASE}/health`);
    const health = await response.json();
    console.log('✅ Health check response:', JSON.stringify(health, null, 2));
    
    if (!health.mongodb.connected) {
      console.log('⚠️  MongoDB not connected - see setup-mongodb.md for setup instructions');
    }
    
    if (!health.ai.gemini && !health.ai.groq) {
      console.log('⚠️  No AI services configured - add API keys to apps/api/.env');
    }
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    console.log('💡 Make sure the API server is running: cd apps/api && npm run dev');
    return;
  }

  // Test 2: Upload endpoint (without file)
  try {
    console.log('\n2️⃣ Testing upload endpoint...');
    const response = await fetch(`${API_BASE}/upload`, { method: 'POST' });
    const result = await response.json();
    console.log('📤 Upload response (expected error):', result);
  } catch (error) {
    console.log('❌ Upload test failed:', error.message);
  }

  // Test 3: Invoices endpoint
  try {
    console.log('\n3️⃣ Testing invoices endpoint...');
    const response = await fetch(`${API_BASE}/invoices`);
    const invoices = await response.json();
    console.log('📋 Invoices response:', invoices);
  } catch (error) {
    console.log('❌ Invoices test failed:', error.message);
  }

  console.log('\n🎉 API test completed!');
}

// Run the test
testAPI().catch(console.error);