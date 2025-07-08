# 🚀 Vercel Deployment Guide

## 📋 Prerequisites

1. **Supabase Database Setup** ✅
   - You already have the Supabase project
   - Just need to add the new table

2. **GitHub Repository** ✅
   - Your code is ready for deployment

## 🔧 Step 1: Setup Database

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Open your project: `fsubfiwlvogrrjouvoel`
3. Go to **SQL Editor**
4. Run this SQL:

```sql
-- Create AI Performance table for storing chatbot interactions
CREATE TABLE IF NOT EXISTS ai_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    patient_id TEXT,
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    response_time DECIMAL(5,2) NOT NULL,
    satisfaction_score DECIMAL(3,2),
    language TEXT DEFAULT 'English',
    source TEXT DEFAULT 'whatsapp' CHECK (source IN ('whatsapp', 'website', 'phone')),
    resolved BOOLEAN DEFAULT false,
    booking_conversion BOOLEAN DEFAULT false,
    client_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_performance_client_id ON ai_performance(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_performance_created_at ON ai_performance(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_performance_conversation_id ON ai_performance(conversation_id);

-- Enable RLS
ALTER TABLE ai_performance ENABLE ROW LEVEL SECURITY;

-- Allow webhook insertions
CREATE POLICY "Allow webhook insertions" ON ai_performance
    FOR INSERT WITH CHECK (true);

-- Allow public reads (for client dashboards)
CREATE POLICY "Allow public reads" ON ai_performance
    FOR SELECT USING (true);

-- Insert sample data
INSERT INTO ai_performance (
    conversation_id, 
    patient_id, 
    question, 
    response, 
    response_time, 
    satisfaction_score, 
    language, 
    source, 
    resolved, 
    booking_conversion, 
    client_id
) VALUES 
('conv_001', 'patient_001', 'What are your operating hours?', 'Our clinic is open Monday to Friday from 9 AM to 6 PM, and Saturday from 9 AM to 2 PM.', 1.2, 4.5, 'English', 'whatsapp', true, false, 'demo_clinic'),
('conv_002', 'patient_002', 'How do I book an appointment?', 'You can book an appointment by calling us at +60123456789 or through our website.', 1.8, 4.0, 'English', 'website', true, true, 'demo_clinic')
ON CONFLICT DO NOTHING;
```

## 🚀 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add n8n integration and Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Select the repository

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**
   Add these in Vercel dashboard:
   ```
   VITE_SUPABASE_URL=https://fsubfiwlvogrrjouvoel.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdWJmaXdsdm9ncnJqb3V2b2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwOTI2NjcsImV4cCI6MjA2MTY2ODY2N30.292RlmCKCF6ow3bsvq5GrFIWKwKaB00mZAznN-WeugI
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Option B: Deploy via CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow prompts**
   - Link to existing project or create new
   - Set environment variables when prompted

## 🔗 Step 3: Update Webhook URLs

After deployment, you'll get a URL like: `https://your-app.vercel.app`

### Update n8n Webhook URL

In your n8n workflow, update the HTTP Request node:

**Old URL**: `http://localhost:3001/api/webhook/ai-performance/demo_clinic`

**New URL**: `https://your-app.vercel.app/api/webhook/ai-performance/demo_clinic`

### Update API Service

Update the webhook URL in `src/lib/api.ts`:

```typescript
getWebhookUrl(clientId: string) {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-app.vercel.app'  // Replace with your actual Vercel URL
    : window.location.origin;
  return `${baseUrl}/api/webhook/ai-performance/${clientId}`;
}
```

## 📊 Step 4: Test the Deployment

### Test Webhook Endpoint
```bash
curl -X POST https://your-app.vercel.app/api/webhook/ai-performance/demo_clinic \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": "test_001",
    "question": "Test question",
    "response": "Test response",
    "response_time": 1.0
  }'
```

### Test Health Check
```bash
curl https://your-app.vercel.app/api/health
```

### Access Client Dashboard
```
https://your-app.vercel.app/client/demo_clinic?name=Demo%20Clinic
```

## 🔧 Step 5: Configure n8n

### n8n Workflow Setup

1. **Create new workflow** in n8n
2. **Add trigger** (WhatsApp, HTTP, etc.)
3. **Add AI processing** (OpenAI, Claude, etc.)
4. **Add HTTP Request node**:

**Configuration:**
- **Method**: `POST`
- **URL**: `https://your-app.vercel.app/api/webhook/ai-performance/YOUR_CLIENT_ID`
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

## 🎯 Step 6: Share with Clients

### Client Dashboard URLs

**Public Dashboard:**
```
https://your-app.vercel.app/client/YOUR_CLIENT_ID?name=CLINIC_NAME
```

**Examples:**
- `https://your-app.vercel.app/client/demo_clinic?name=Dr.%20Chen's%20Clinic`
- `https://your-app.vercel.app/client/clinic_123?name=Medical%20Center%20ABC`

### Admin Dashboard (with authentication):
```
https://your-app.vercel.app/client/YOUR_CLIENT_ID?name=CLINIC_NAME&auth=true
```

## 🔒 Security Notes

1. **Environment Variables**: All sensitive data is in Vercel environment variables
2. **CORS**: Webhook endpoints allow cross-origin requests
3. **Rate Limiting**: Consider adding rate limiting for production
4. **HTTPS**: Vercel automatically provides HTTPS

## 📈 Monitoring

### Vercel Analytics
- View deployment logs in Vercel dashboard
- Monitor function execution times
- Check for errors in real-time

### Supabase Monitoring
- Monitor database performance
- Check RLS policies
- View query logs

## 🚀 Success!

Your n8n integration is now:
- ✅ **Deployed** to Vercel
- ✅ **Database** configured
- ✅ **Webhooks** ready
- ✅ **Client dashboards** accessible
- ✅ **Production-ready**

**Next**: Configure your n8n workflows and start collecting real AI performance data!

---

**Need help?** Check the logs in Vercel dashboard or Supabase dashboard for debugging. 