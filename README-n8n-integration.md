# 🚀 n8n Integration for ZanSocial Clinic

Connect your n8n workflows to the ZanSocial Clinic software and let your clients view their AI performance data in real-time!

## 📋 What's Included

- **Webhook Server**: Receives AI performance data from n8n
- **Client Dashboard**: Public dashboard for clients to view their AI performance
- **Database Schema**: Supabase table for storing AI interactions
- **API Service**: TypeScript API for data management
- **Test Scripts**: Verify your integration is working

## 🎯 Quick Setup

### 1. Start the Webhook Server

```bash
# Install dependencies
cd server
npm install

# Start the server
npm start
```

The webhook server will run on `http://localhost:3001`

### 2. Setup Database

Run the SQL schema in your Supabase SQL editor:

```sql
-- Copy contents from database/ai_performance_schema.sql
```

### 3. Test the Integration

```bash
# Run the test script
npm run test:integration
```

### 4. Access Client Dashboard

Your clients can view their AI performance at:
```
http://localhost:8080/client/YOUR_CLIENT_ID?name=CLINIC_NAME
```

## 🔧 n8n Workflow Setup

### Basic Workflow Structure

```
Trigger → AI Processing → Data Enrichment → Webhook → Response
```

### HTTP Request Node Configuration

- **Method**: `POST`
- **URL**: `http://localhost:3001/api/webhook/ai-performance/YOUR_CLIENT_ID`
- **Headers**:
  ```
  Content-Type: application/json
  X-Webhook-Signature: your-webhook-secret
  ```
- **Body**:
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

## 📊 Available Metrics

Your clients will see:

- **Total Conversations**: Number of AI interactions
- **Average Response Time**: How fast AI responds (seconds)
- **Satisfaction Score**: Patient satisfaction (1-5 scale)
- **Booking Conversion Rate**: % of conversations leading to bookings
- **Language Distribution**: Conversations by language
- **Top Questions**: Most common patient inquiries
- **Recent Conversations**: Latest interactions with details

## 🔗 Dashboard URLs

### Public Client Dashboard
```
http://localhost:8080/client/demo_clinic?name=Demo%20Clinic
```

### Admin Dashboard (with authentication)
```
http://localhost:8080/client/demo_clinic?name=Demo%20Clinic&auth=true
```

## 🛠️ Development

### Start Development Servers

```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start webhook server
npm run webhook:dev
```

### Test Integration

```bash
# Test the complete integration
npm run test:integration
```

### Available Scripts

- `npm run dev` - Start frontend development server
- `npm run webhook:dev` - Start webhook server in development mode
- `npm run webhook:start` - Start webhook server in production mode
- `npm run test:integration` - Test the n8n integration

## 📁 Project Structure

```
zanclinic/
├── src/
│   ├── components/
│   │   └── ClientAIPerformance.tsx    # Client dashboard component
│   ├── lib/
│   │   ├── api.ts                     # API service for AI performance
│   │   └── webhookHandler.ts          # Webhook handling utilities
│   └── pages/
│       └── ClientDashboard.tsx        # Public client dashboard page
├── server/
│   ├── webhook-server.js              # Express webhook server
│   └── package.json                   # Server dependencies
├── database/
│   └── ai_performance_schema.sql      # Supabase database schema
├── scripts/
│   └── test-integration.js            # Integration test script
└── docs/
    └── n8n-integration-guide.md       # Detailed integration guide
```

## 🔒 Security

- Webhook authentication with signature headers
- Client data isolation (each client sees only their data)
- Row Level Security (RLS) in Supabase
- Environment variables for sensitive data

## 🚀 Production Deployment

1. **Deploy webhook server** to cloud provider
2. **Update environment variables** with production URLs
3. **Use HTTPS** for all endpoints
4. **Set up monitoring** and alerts
5. **Configure backups** for database

## 📞 Support

- Check the detailed guide: `docs/n8n-integration-guide.md`
- Run test script: `npm run test:integration`
- Check webhook server logs
- Verify n8n workflow execution

## 🎉 Success!

Once integrated, your clients will have:
- Real-time AI performance insights
- Professional dashboard interface
- Export capabilities for reports
- Multi-language support
- Mobile-responsive design

---

**Ready to connect your n8n workflows? Start with the quick setup above! 🚀** 