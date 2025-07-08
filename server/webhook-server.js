const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase configuration
const supabaseUrl = 'https://fsubfiwlvogrrjouvoel.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdWJmaXdsdm9ncnJqb3V2b2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwOTI2NjcsImV4cCI6MjA2MTY2ODY2N30.292RlmCKCF6ow3bsvq5GrFIWKwKaB00mZAznN-WeugI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Webhook endpoint for n8n
app.post('/api/webhook/ai-performance/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const payload = req.body;
    const signature = req.headers['x-webhook-signature'];

    console.log('Received webhook from n8n:', { clientId, payload });

    // Validate required fields
    const { conversation_id, question, response, response_time } = payload;
    
    if (!conversation_id || !question || !response || response_time === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: conversation_id, question, response, response_time'
      });
    }

    // Prepare data for Supabase
    const performanceData = {
      conversation_id,
      patient_id: payload.patient_id,
      question,
      response,
      response_time: Number(response_time),
      satisfaction_score: payload.satisfaction_score ? Number(payload.satisfaction_score) : null,
      language: payload.language || 'English',
      source: payload.source || 'whatsapp',
      resolved: Boolean(payload.resolved || false),
      booking_conversion: Boolean(payload.booking_conversion || false),
      client_id: clientId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('ai_performance')
      .insert(performanceData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: error.message
      });
    }

    console.log('Successfully stored AI performance data:', data);

    res.json({
      success: true,
      message: 'AI performance data received successfully',
      data: {
        id: data.id,
        conversation_id: data.conversation_id,
        client_id: data.client_id
      }
    });

  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI Performance Webhook Server'
  });
});

// Get webhook configuration for n8n
app.get('/api/webhook/config/:clientId', (req, res) => {
  const { clientId } = req.params;
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  
  res.json({
    webhook_url: `${baseUrl}/api/webhook/ai-performance/${clientId}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': process.env.WEBHOOK_SECRET || 'your-webhook-secret'
    },
    expected_payload: {
      conversation_id: 'string (required)',
      patient_id: 'string (optional)',
      question: 'string (required)',
      response: 'string (required)',
      response_time: 'number (required)',
      satisfaction_score: 'number (optional)',
      language: 'string (default: English)',
      source: 'whatsapp | website | phone (default: whatsapp)',
      resolved: 'boolean (default: false)',
      booking_conversion: 'boolean (default: false)'
    },
    example_payload: {
      conversation_id: 'conv_123456',
      patient_id: 'patient_789',
      question: 'What are your operating hours?',
      response: 'Our clinic is open Monday to Friday from 9 AM to 6 PM.',
      response_time: 1.2,
      satisfaction_score: 4.5,
      language: 'English',
      source: 'whatsapp',
      resolved: true,
      booking_conversion: false
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Webhook endpoint: http://localhost:${PORT}/api/webhook/ai-performance/:clientId`);
});

module.exports = app; 