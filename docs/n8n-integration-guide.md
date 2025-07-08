# n8n Integration Guide for ZanSocial Clinic

This guide will help you connect your n8n workflows to the ZanSocial Clinic software so your clients can view their AI performance data in real-time.

## 🚀 Quick Start

### 1. Setup the Webhook Server

First, start the webhook server that will receive data from n8n:

```bash
cd server
npm install
npm start
```

The server will run on `http://localhost:3001` by default.

### 2. Setup Supabase Database

Run the SQL schema in your Supabase SQL editor:

```sql
-- Copy and paste the contents of database/ai_performance_schema.sql
```

### 3. Configure n8n Workflow

#### Step 1: Create a new n8n workflow

1. Open your n8n instance
2. Create a new workflow
3. Add a trigger node (e.g., HTTP Request, WhatsApp, etc.)

#### Step 2: Add AI Processing Node

Add an AI service node (OpenAI, Claude, etc.) to process patient inquiries.

#### Step 3: Add HTTP Request Node

Add an HTTP Request node to send data to your webhook:

**Configuration:**
- Method: `POST`
- URL: `http://localhost:3001/api/webhook/ai-performance/YOUR_CLIENT_ID`
- Headers:
  ```
  Content-Type: application/json
  X-Webhook-Signature: your-webhook-secret
  ```
- Body (JSON):
  ```json
  {
    "conversation_id": "{{ $json.conversation_id }}",
    "patient_id": "{{ $json.patient_id }}",
    "question": "{{ $json.question }}",
    "response": "{{ $json.ai_response }}",
    "response_time": "{{ $json.response_time }}",
    "satisfaction_score": "{{ $json.satisfaction_score }}",
    "language": "{{ $json.language }}",
    "source": "{{ $json.source }}",
    "resolved": "{{ $json.resolved }}",
    "booking_conversion": "{{ $json.booking_conversion }}"
  }
  ```

## 📊 Example n8n Workflow

Here's a complete example workflow for WhatsApp integration:

### Workflow Structure:
```
WhatsApp Trigger → AI Processing → Data Enrichment → Webhook → Success Response
```

### Node Configurations:

#### 1. WhatsApp Trigger Node
- **Type**: WhatsApp Business API
- **Event**: Message Received
- **Output**: 
  ```json
  {
    "message": "What are your operating hours?",
    "from": "+60123456789",
    "timestamp": "2024-01-15T10:30:00Z",
    "conversation_id": "conv_123456"
  }
  ```

#### 2. AI Processing Node (OpenAI)
- **Type**: OpenAI
- **Model**: gpt-3.5-turbo
- **Prompt**:
  ```
  You are a helpful medical clinic assistant. Respond to the patient's question professionally and accurately.
  
  Patient Question: {{ $json.message }}
  
  Context: This is a medical clinic in Malaysia. Operating hours: Mon-Fri 9AM-6PM, Sat 9AM-2PM.
  
  Provide a helpful response:
  ```
- **Output**:
  ```json
  {
    "ai_response": "Our clinic is open Monday to Friday from 9 AM to 6 PM, and Saturday from 9 AM to 2 PM. We're closed on Sundays and public holidays.",
    "response_time": 1.2
  }
  ```

#### 3. Data Enrichment Node (Function)
- **Type**: Function
- **Code**:
  ```javascript
  const startTime = new Date();
  
  return {
    conversation_id: $input.first().json.conversation_id,
    patient_id: $input.first().json.from,
    question: $input.first().json.message,
    response: $input.first().json.ai_response,
    response_time: $input.first().json.response_time,
    satisfaction_score: null, // Will be updated later
    language: "English", // Detect language here
    source: "whatsapp",
    resolved: true,
    booking_conversion: false
  };
  ```

#### 4. Webhook Node
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `http://localhost:3001/api/webhook/ai-performance/demo_clinic`
- **Headers**:
  ```
  Content-Type: application/json
  X-Webhook-Signature: your-webhook-secret
  ```
- **Body**: `{{ $json }}`

#### 5. Success Response Node
- **Type**: WhatsApp Business API
- **Action**: Send Message
- **To**: `{{ $('WhatsApp Trigger').first().json.from }}`
- **Message**: `{{ $('AI Processing').first().json.ai_response }}`

## 🔗 Client Dashboard Access

### Public Dashboard URL
Your clients can access their AI performance dashboard at:
```
http://localhost:8080/client/YOUR_CLIENT_ID?name=CLINIC_NAME
```

### Example URLs:
- `http://localhost:8080/client/demo_clinic?name=Dr.%20Chen's%20Clinic`
- `http://localhost:8080/client/clinic_123?name=Medical%20Center%20ABC`

### Admin Dashboard
For authenticated access to the full admin dashboard:
```
http://localhost:8080/client/YOUR_CLIENT_ID?name=CLINIC_NAME&auth=true
```

## 📈 Data Flow

1. **Patient sends message** → WhatsApp/Website/Phone
2. **n8n receives trigger** → Processes with AI
3. **AI generates response** → Calculates response time
4. **n8n sends to webhook** → Stores in Supabase
5. **Client views dashboard** → Real-time performance data

## 🔧 Configuration Options

### Environment Variables
Create a `.env` file in the `server` directory:

```env
WEBHOOK_PORT=3001
BASE_URL=http://localhost:3001
WEBHOOK_SECRET=your-secure-webhook-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Client IDs
Use unique client IDs for each clinic:
- `demo_clinic` - Demo clinic
- `clinic_001` - Dr. Chen's Clinic
- `clinic_002` - Medical Center ABC
- etc.

## 📊 Available Metrics

The dashboard displays:
- **Total Conversations**: Number of AI interactions
- **Average Response Time**: How fast AI responds
- **Satisfaction Score**: Patient satisfaction (1-5 scale)
- **Booking Conversion Rate**: % of conversations that lead to bookings
- **Language Distribution**: Conversations by language
- **Top Questions**: Most common patient inquiries
- **Recent Conversations**: Latest interactions

## 🛠️ Troubleshooting

### Common Issues:

1. **Webhook not receiving data**
   - Check if webhook server is running
   - Verify URL and port
   - Check n8n workflow execution logs

2. **Database connection errors**
   - Verify Supabase credentials
   - Check if table exists
   - Ensure RLS policies are correct

3. **Dashboard not loading data**
   - Check client ID in URL
   - Verify data exists in database
   - Check browser console for errors

### Debug Commands:

```bash
# Check webhook server health
curl http://localhost:3001/api/health

# Get webhook configuration
curl http://localhost:3001/api/webhook/config/demo_clinic

# Test webhook endpoint
curl -X POST http://localhost:3001/api/webhook/ai-performance/demo_clinic \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "test_123",
    "question": "Test question",
    "response": "Test response",
    "response_time": 1.0
  }'
```

## 🔒 Security Considerations

1. **Webhook Authentication**: Use the `X-Webhook-Signature` header
2. **Client Isolation**: Each client can only see their own data
3. **Rate Limiting**: Implement rate limiting on webhook endpoints
4. **HTTPS**: Use HTTPS in production
5. **Environment Variables**: Store secrets in environment variables

## 📞 Support

For technical support or questions:
- Check the logs in your webhook server
- Verify n8n workflow execution
- Test webhook endpoints manually
- Review Supabase database logs

## 🚀 Production Deployment

For production deployment:

1. **Deploy webhook server** to a cloud provider (Heroku, DigitalOcean, AWS)
2. **Update BASE_URL** in environment variables
3. **Use HTTPS** for all endpoints
4. **Set up monitoring** for webhook server
5. **Configure backups** for Supabase database
6. **Set up alerts** for webhook failures

---

**Happy integrating! 🎉** 