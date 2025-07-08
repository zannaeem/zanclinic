import { aiPerformanceAPI, AIPerformanceData } from './api';

// Webhook handler for n8n integration
export class WebhookHandler {
  private static instance: WebhookHandler;
  private webhookSecret: string;

  private constructor() {
    // In production, this should come from environment variables
    this.webhookSecret = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
  }

  public static getInstance(): WebhookHandler {
    if (!WebhookHandler.instance) {
      WebhookHandler.instance = new WebhookHandler();
    }
    return WebhookHandler.instance;
  }

  // Handle incoming webhook from n8n
  async handleWebhook(payload: any, signature?: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Validate webhook signature (optional but recommended)
      if (signature && !this.validateSignature(payload, signature)) {
        return {
          success: false,
          message: 'Invalid webhook signature'
        };
      }

      // Extract AI performance data from n8n payload
      const performanceData = this.extractPerformanceData(payload);
      
      if (!performanceData) {
        return {
          success: false,
          message: 'Invalid payload format'
        };
      }

      // Store the data in Supabase
      const savedData = await aiPerformanceAPI.receivePerformanceData(performanceData);

      return {
        success: true,
        message: 'AI performance data received successfully',
        data: savedData
      };

    } catch (error) {
      console.error('Webhook handler error:', error);
      return {
        success: false,
        message: 'Internal server error'
      };
    }
  }

  // Extract and validate performance data from n8n payload
  private extractPerformanceData(payload: any): Omit<AIPerformanceData, 'id' | 'created_at' | 'updated_at'> | null {
    try {
      // Expected n8n payload structure
      const {
        conversation_id,
        patient_id,
        question,
        response,
        response_time,
        satisfaction_score,
        language = 'English',
        source = 'whatsapp',
        resolved = false,
        booking_conversion = false,
        client_id
      } = payload;

      // Validate required fields
      if (!conversation_id || !question || !response || response_time === undefined) {
        return null;
      }

      return {
        conversation_id,
        patient_id,
        question,
        response,
        response_time: Number(response_time),
        satisfaction_score: satisfaction_score ? Number(satisfaction_score) : undefined,
        language,
        source,
        resolved: Boolean(resolved),
        booking_conversion: Boolean(booking_conversion),
        client_id: client_id || 'default'
      };

    } catch (error) {
      console.error('Error extracting performance data:', error);
      return null;
    }
  }

  // Validate webhook signature
  private validateSignature(payload: any, signature: string): boolean {
    // This is a basic implementation - you should use proper HMAC validation
    // For now, we'll just check if the signature exists
    return signature && signature.length > 0;
  }

  // Generate webhook URL for n8n
  generateWebhookUrl(clientId: string): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
    return `${baseUrl}/api/webhook/ai-performance/${clientId}`;
  }

  // Get webhook configuration for n8n
  getWebhookConfig(clientId: string) {
    return {
      url: this.generateWebhookUrl(clientId),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': this.webhookSecret
      },
      expectedPayload: {
        conversation_id: 'string (required)',
        patient_id: 'string (optional)',
        question: 'string (required)',
        response: 'string (required)',
        response_time: 'number (required)',
        satisfaction_score: 'number (optional)',
        language: 'string (default: English)',
        source: 'whatsapp | website | phone (default: whatsapp)',
        resolved: 'boolean (default: false)',
        booking_conversion: 'boolean (default: false)',
        client_id: 'string (default: default)'
      }
    };
  }
}

// Export singleton instance
export const webhookHandler = WebhookHandler.getInstance(); 