import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fsubfiwlvogrrjouvoel.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdWJmaXdsdm9ncnJqb3V2b2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwOTI2NjcsImV4cCI6MjA2MTY2ODY2N30.292RlmCKCF6ow3bsvq5GrFIWKwKaB00mZAznN-WeugI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Webhook-Signature');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { clientId } = req.query;
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

    res.status(200).json({
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
} 