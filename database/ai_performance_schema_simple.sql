-- Simple AI Performance table setup (handles existing objects)
-- Run this in Supabase SQL Editor

-- Create table if not exists
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

-- Create indexes if not exist
CREATE INDEX IF NOT EXISTS idx_ai_performance_client_id ON ai_performance(client_id);
CREATE INDEX IF NOT EXISTS idx_ai_performance_created_at ON ai_performance(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_performance_conversation_id ON ai_performance(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_performance_source ON ai_performance(source);
CREATE INDEX IF NOT EXISTS idx_ai_performance_language ON ai_performance(language);

-- Drop trigger if exists, then recreate
DROP TRIGGER IF EXISTS update_ai_performance_updated_at ON ai_performance;

-- Create function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_ai_performance_updated_at 
    BEFORE UPDATE ON ai_performance 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE ai_performance ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own AI performance data" ON ai_performance;
DROP POLICY IF EXISTS "Allow webhook insertions" ON ai_performance;
DROP POLICY IF EXISTS "Allow webhook updates" ON ai_performance;
DROP POLICY IF EXISTS "Allow public reads" ON ai_performance;

-- Create policies
CREATE POLICY "Allow webhook insertions" ON ai_performance
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public reads" ON ai_performance
    FOR SELECT USING (true);

CREATE POLICY "Allow webhook updates" ON ai_performance
    FOR UPDATE USING (true);

-- Insert sample data (only if table is empty)
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
) 
SELECT 
    'conv_001', 'patient_001', 'What are your operating hours?', 'Our clinic is open Monday to Friday from 9 AM to 6 PM, and Saturday from 9 AM to 2 PM.', 1.2, 4.5, 'English', 'whatsapp', true, false, 'demo_clinic'
WHERE NOT EXISTS (SELECT 1 FROM ai_performance WHERE conversation_id = 'conv_001');

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
) 
SELECT 
    'conv_002', 'patient_002', 'How do I book an appointment?', 'You can book an appointment by calling us at +60123456789 or through our website.', 1.8, 4.0, 'English', 'website', true, true, 'demo_clinic'
WHERE NOT EXISTS (SELECT 1 FROM ai_performance WHERE conversation_id = 'conv_002');

-- Verify the setup
SELECT 
    'Table created successfully' as status,
    COUNT(*) as total_records
FROM ai_performance; 