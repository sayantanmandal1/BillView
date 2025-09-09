const Groq = require('groq-sdk');
require('dotenv').config({ path: './apps/api/.env' });

async function testGroqModel() {
  if (!process.env.GROQ_API_KEY) {
    console.log('❌ GROQ_API_KEY not found in environment');
    return;
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    console.log('🚀 Testing Groq API with new model...');
    
    const completion = await groq.chat.completions.create({
      messages: [{ 
        role: 'user', 
        content: 'Extract invoice data from this text and return JSON: Invoice #123, Date: 2025-01-01, Total: $100.00' 
      }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content || '';
    console.log('✅ Groq API working with new model');
    console.log('📥 Response:', content.substring(0, 200) + '...');
    
  } catch (error) {
    console.error('❌ Groq API test failed:', error.message);
  }
}

testGroqModel();