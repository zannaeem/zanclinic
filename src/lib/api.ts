import { supabase } from './supabaseClient';

// Types for AI performance data
export interface AIPerformanceData {
  id?: string;
  conversation_id: string;
  patient_id?: string;
  question: string;
  response: string;
  response_time: number;
  satisfaction_score?: number;
  language: string;
  source: 'whatsapp' | 'website' | 'phone';
  resolved: boolean;
  booking_conversion?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIPerformanceMetrics {
  total_conversations: number;
  avg_response_time: number;
  satisfaction_score: number;
  booking_conversion_rate: number;
  language_distribution: Record<string, number>;
  top_questions: Array<{ question: string; count: number; resolved_rate: number }>;
  hourly_activity: Array<{ hour: string; conversations: number }>;
}

// API endpoints for n8n integration
export const aiPerformanceAPI = {
  // Get AI performance data for clients
  async getClientPerformance(clientId: string, dateRange?: { start: string; end: string }) {
    let query = supabase
      .from('ai_performance')
      .select('*')
      .eq('client_id', clientId);

    if (dateRange) {
      query = query.gte('created_at', dateRange.start).lte('created_at', dateRange.end);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get aggregated metrics for dashboard
  async getPerformanceMetrics(clientId: string, period: 'day' | 'week' | 'month' = 'week') {
    const { data, error } = await supabase
      .from('ai_performance')
      .select('*')
      .eq('client_id', clientId);

    if (error) throw error;

    // Calculate metrics
    const metrics: AIPerformanceMetrics = {
      total_conversations: data.length,
      avg_response_time: data.reduce((acc, item) => acc + item.response_time, 0) / data.length || 0,
      satisfaction_score: data.reduce((acc, item) => acc + (item.satisfaction_score || 0), 0) / data.length || 0,
      booking_conversion_rate: (data.filter(item => item.booking_conversion).length / data.length) * 100,
      language_distribution: {},
      top_questions: [],
      hourly_activity: []
    };

    // Calculate language distribution
    const languageCount = data.reduce((acc, item) => {
      acc[item.language] = (acc[item.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    metrics.language_distribution = languageCount;

    // Calculate top questions
    const questionCount = data.reduce((acc, item) => {
      acc[item.question] = (acc[item.question] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    metrics.top_questions = Object.entries(questionCount)
      .map(([question, count]) => ({
        question,
        count: count as number,
        resolved_rate: (data.filter(item => item.question === question && item.resolved).length / (count as number)) * 100
      }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, 5);

    // Calculate hourly activity
    const hourlyCount = data.reduce((acc, item) => {
      const hour = new Date(item.created_at).getHours().toString().padStart(2, '0') + ':00';
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    metrics.hourly_activity = Object.entries(hourlyCount)
      .map(([hour, conversations]) => ({ hour, conversations: conversations as number }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    return metrics;
  },

  // Webhook endpoint for n8n to send data
  async receivePerformanceData(performanceData: Omit<AIPerformanceData, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('ai_performance')
      .insert({
        ...performanceData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update performance data
  async updatePerformanceData(id: string, updates: Partial<AIPerformanceData>) {
    const { data, error } = await supabase
      .from('ai_performance')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Webhook utilities for n8n integration
export const webhookUtils = {
  // Generate webhook URL for n8n
  getWebhookUrl(clientId: string) {
    // Use Vercel deployment URL in production
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-vercel-app.vercel.app' 
      : window.location.origin;
    return `${baseUrl}/api/webhook/ai-performance/${clientId}`;
  },

  // Validate webhook signature (for security)
  validateWebhookSignature(payload: string, signature: string, secret: string) {
    // Implement HMAC validation here
    // This is a placeholder - you should implement proper signature validation
    return true;
  }
}; 