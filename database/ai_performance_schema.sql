-- Create AI Performance table for storing chatbot interactions
CREATE TABLE IF NOT EXISTS ai_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    patient_id TEXT,
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    response_time DECIMAL(5,2) NOT NULL, -- in seconds
    satisfaction_score DECIMAL(3,2), -- 1-5 scale
    language TEXT DEFAULT 'English',
    source TEXT DEFAULT 'whatsapp' CHECK (source IN ('whatsapp', 'website', 'phone')),
    resolved BOOLEAN DEFAULT false,
    booking_conversion BOOLEAN DEFAULT false,
    client_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_performance_client_id ON ai_performance(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_performance_created_at ON ai_performance(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_performance_conversation_id ON ai_performance(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_performance_source ON ai_performance(source);
CREATE INDEX IF NOT EXISTS idx_ai_performance_language ON ai_performance(language);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_ai_performance_updated_at 
    BEFORE UPDATE ON ai_performance 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE ai_performance ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read their own data
CREATE POLICY "Users can view their own AI performance data" ON ai_performance
    FOR SELECT USING (auth.uid()::text = client_id OR client_id = 'public');

-- Policy to allow webhook insertions (for n8n)
CREATE POLICY "Allow webhook insertions" ON ai_performance
    FOR INSERT WITH CHECK (true);

-- Policy to allow updates from webhooks
CREATE POLICY "Allow webhook updates" ON ai_performance
    FOR UPDATE USING (true);

-- Create a view for aggregated metrics
CREATE OR REPLACE VIEW ai_performance_metrics AS
SELECT 
    client_id,
    COUNT(*) as total_conversations,
    AVG(response_time) as avg_response_time,
    AVG(satisfaction_score) as avg_satisfaction_score,
    COUNT(CASE WHEN booking_conversion THEN 1 END) * 100.0 / COUNT(*) as booking_conversion_rate,
    COUNT(CASE WHEN resolved THEN 1 END) * 100.0 / COUNT(*) as resolution_rate,
    COUNT(CASE WHEN source = 'whatsapp' THEN 1 END) as whatsapp_conversations,
    COUNT(CASE WHEN source = 'website' THEN 1 END) as website_conversations,
    COUNT(CASE WHEN source = 'phone' THEN 1 END) as phone_conversations,
    COUNT(CASE WHEN language = 'English' THEN 1 END) as english_conversations,
    COUNT(CASE WHEN language = 'Malay' THEN 1 END) as malay_conversations,
    MAX(created_at) as last_conversation
FROM ai_performance
GROUP BY client_id;

-- Create a function to get top questions for a client
CREATE OR REPLACE FUNCTION get_top_questions(client_id_param TEXT, limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
    question TEXT,
    count BIGINT,
    resolved_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ap.question,
        COUNT(*) as count,
        (COUNT(CASE WHEN ap.resolved THEN 1 END) * 100.0 / COUNT(*)) as resolved_rate
    FROM ai_performance ap
    WHERE ap.client_id = client_id_param
    GROUP BY ap.question
    ORDER BY count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get hourly activity for a client
CREATE OR REPLACE FUNCTION get_hourly_activity(client_id_param TEXT, date_from DATE DEFAULT CURRENT_DATE - INTERVAL '7 days')
RETURNS TABLE (
    hour TEXT,
    conversations BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TO_CHAR(created_at, 'HH24:00') as hour,
        COUNT(*) as conversations
    FROM ai_performance
    WHERE client_id = client_id_param 
    AND created_at >= date_from
    GROUP BY TO_CHAR(created_at, 'HH24:00')
    ORDER BY hour;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing
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
('conv_002', 'patient_002', 'How do I book an appointment?', 'You can book an appointment by calling us at +60123456789 or through our website. Would you like me to help you schedule one?', 1.8, 4.0, 'English', 'website', true, true, 'demo_clinic'),
('conv_003', 'patient_003', 'Apa perkhidmatan yang anda tawarkan?', 'Kami menawarkan perkhidmatan perubatan umum, pemeriksaan kesihatan, dan rawatan penyakit biasa. Adakah anda ingin mengetahui lebih lanjut?', 2.1, 4.8, 'Malay', 'whatsapp', true, false, 'demo_clinic'),
('conv_004', 'patient_004', 'Where is your clinic located?', 'Our clinic is located at 123 Medical Street, Kuala Lumpur. We are easily accessible by public transport.', 0.9, 5.0, 'English', 'whatsapp', true, false, 'demo_clinic'),
('conv_005', 'patient_005', 'Do you accept insurance?', 'Yes, we accept most major insurance providers. Please bring your insurance card when you visit.', 1.5, 4.2, 'English', 'phone', true, false, 'demo_clinic')
ON CONFLICT DO NOTHING; 