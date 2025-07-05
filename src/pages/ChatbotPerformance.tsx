
import React from 'react';
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

const ChatbotPerformance = () => {
  const chatbotMetrics = [
    {
      title: 'Total Conversations',
      value: '5,678',
      change: '+15% from last week',
      changeType: 'positive' as const,
      icon: MessageSquare,
      description: 'WhatsApp & Website chats'
    },
    {
      title: 'FAQs Resolved',
      value: '4,123',
      change: '+22% from last week',
      changeType: 'positive' as const,
      icon: CheckCircle,
      description: 'Automated resolutions'
    },
    {
      title: 'Response Time',
      value: '1.2s',
      change: '-0.3s improvement',
      changeType: 'positive' as const,
      icon: Clock,
      description: 'Average response speed'
    },
    {
      title: 'Booking Conversions',
      value: '32%',
      change: '+5% from last week',
      changeType: 'positive' as const,
      icon: TrendingUp,
      description: 'Chat to appointment rate'
    }
  ];

  const topQuestions = [
    { question: 'What are your operating hours?', count: 245, resolved: '98%' },
    { question: 'How to book an appointment?', count: 198, resolved: '95%' },
    { question: 'What services do you offer?', count: 167, resolved: '92%' },
    { question: 'Where is your clinic located?', count: 143, resolved: '100%' },
    { question: 'Do you accept insurance?', count: 128, resolved: '88%' }
  ];

  const languageStats = [
    { language: 'English', percentage: 68, conversations: 3856 },
    { language: 'Malay', percentage: 32, conversations: 1822 }
  ];

  const hourlyActivity = [
    { hour: '09:00', conversations: 45 },
    { hour: '10:00', conversations: 62 },
    { hour: '11:00', conversations: 78 },
    { hour: '12:00', conversations: 34 },
    { hour: '13:00', conversations: 28 },
    { hour: '14:00', conversations: 89 },
    { hour: '15:00', conversations: 92 },
    { hour: '16:00', conversations: 67 },
    { hour: '17:00', conversations: 45 }
  ];

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
              {topQuestions.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">{item.question}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{item.count} times asked</span>
                      <span className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${parseInt(item.resolved) >= 95 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span>{item.resolved} resolved</span>
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
