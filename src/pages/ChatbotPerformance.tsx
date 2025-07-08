import React, { useEffect, useState } from 'react';
import MetricCard from '@/components/MetricCard';
import { 
  MessageSquare, 
  Users, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Globe,
  HelpCircle,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { aiPerformanceAPI, AIPerformanceMetrics } from '@/lib/api';
import { RefreshCw } from 'lucide-react';

const CLIENT_ID = 'demo_clinic'; // Replace with dynamic client id if needed

const ChatbotPerformance = () => {
  const [metrics, setMetrics] = useState<AIPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    aiPerformanceAPI.getPerformanceMetrics(CLIENT_ID)
      .then(setMetrics)
      .catch((err) => setError(err.message || 'Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading AI performance data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <HelpCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading data</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!metrics || metrics.total_conversations === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Performance Data</h3>
        <p className="text-gray-600">No AI performance data available yet.</p>
      </div>
    );
  }

  // Prepare metrics for cards
  const chatbotMetrics = [
    {
      title: 'Total Conversations',
      value: metrics.total_conversations.toLocaleString(),
      change: '',
      changeType: 'positive' as const,
      icon: MessageSquare,
      description: 'WhatsApp & Website chats'
    },
    {
      title: 'FAQs Resolved',
      value: metrics.top_questions.reduce((acc, q) => acc + (q.resolved_rate >= 90 ? q.count : 0), 0).toLocaleString(),
      change: '',
      changeType: 'positive' as const,
      icon: CheckCircle,
      description: 'Automated resolutions'
    },
    {
      title: 'Response Time',
      value: metrics.avg_response_time.toFixed(1) + 's',
      change: '',
      changeType: 'positive' as const,
      icon: Clock,
      description: 'Average response speed'
    },
    {
      title: 'Booking Conversions',
      value: metrics.booking_conversion_rate.toFixed(1) + '%',
      change: '',
      changeType: 'positive' as const,
      icon: TrendingUp,
      description: 'Chat to appointment rate'
    }
  ];

  // Prepare language stats
  const totalLang = Object.values(metrics.language_distribution).reduce((a, b) => a + b, 0) || 1;
  const languageStats = Object.entries(metrics.language_distribution).map(([language, count]) => ({
    language,
    percentage: Math.round((count / totalLang) * 100),
    conversations: count
  }));

  // Prepare hourly activity
  const hourlyActivity = metrics.hourly_activity;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chatbot Performance</h1>
          <p className="text-gray-600 mt-1">Monitor AI assistant effectiveness and patient interactions</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">AI Online</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {chatbotMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Performance Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-green-600" />
              <span>Most Common Questions</span>
            </CardTitle>
            <CardDescription>Top 5 patient inquiries handled by AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.top_questions.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">{item.question}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{item.count} times asked</span>
                      <span className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${item.resolved_rate >= 95 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span>{item.resolved_rate.toFixed(0)}% resolved</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">#{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Language Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-green-600" />
              <span>Language Support</span>
            </CardTitle>
            <CardDescription>Conversation breakdown by language</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {languageStats.map((lang, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{lang.language}</span>
                    <span className="text-sm text-gray-600">{lang.conversations} chats</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${lang.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{lang.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-green-600" />
            <span>Hourly Activity Pattern</span>
          </CardTitle>
          <CardDescription>Chatbot conversation volume throughout the day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between space-x-2 h-48 mb-4">
            {hourlyActivity.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-md transition-all duration-500 hover:from-green-600 hover:to-emerald-500"
                  style={{ height: `${(data.conversations / Math.max(...hourlyActivity.map(d => d.conversations))) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2 font-medium">{data.conversations}</span>
                <span className="text-xs text-gray-400">{data.hour}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <p className="text-sm text-gray-500">Peak hours: 2:00 PM - 4:00 PM</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Update FAQ Responses</h3>
                <p className="text-sm text-gray-600">Improve chatbot answers and add new topics</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Training Analytics</h3>
                <p className="text-sm text-gray-600">Review conversation logs and improve AI</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotPerformance;
