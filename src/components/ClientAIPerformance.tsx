import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  Globe, 
  Zap,
  Download,
  RefreshCw,
  Eye,
  Star
} from 'lucide-react';
import { aiPerformanceAPI, AIPerformanceMetrics, AIPerformanceData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ClientAIPerformanceProps {
  clientId: string;
  clientName?: string;
  isPublic?: boolean;
}

const ClientAIPerformance: React.FC<ClientAIPerformanceProps> = ({ 
  clientId, 
  clientName = "Your Clinic",
  isPublic = false 
}) => {
  const [metrics, setMetrics] = useState<AIPerformanceMetrics | null>(null);
  const [conversations, setConversations] = useState<AIPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [metricsData, conversationsData] = await Promise.all([
        aiPerformanceAPI.getPerformanceMetrics(clientId, period),
        aiPerformanceAPI.getClientPerformance(clientId, dateRange || undefined)
      ]);
      
      setMetrics(metricsData);
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error fetching AI performance data:', error);
      toast({
        title: "Error",
        description: "Failed to load AI performance data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clientId, period, dateRange]);

  const handleExportData = () => {
    if (!conversations.length) {
      toast({
        title: "No Data",
        description: "No data available to export.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ['Date', 'Question', 'Response', 'Response Time (s)', 'Language', 'Source', 'Resolved', 'Satisfaction Score'],
      ...conversations.map(conv => [
        new Date(conv.created_at).toLocaleDateString(),
        conv.question,
        conv.response.substring(0, 50) + '...',
        conv.response_time,
        conv.language,
        conv.source,
        conv.resolved ? 'Yes' : 'No',
        conv.satisfaction_score || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-performance-${clientId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "AI performance data has been exported to CSV.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading AI performance data...</span>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Performance Data</h3>
        <p className="text-gray-600">No AI performance data available for this period.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isPublic ? `${clientName} AI Performance` : 'AI Performance Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time insights into your AI assistant's effectiveness
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Select value={period} onValueChange={(value: 'day' | 'week' | 'month') => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.total_conversations.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.avg_response_time.toFixed(1)}s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfaction Score</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.satisfaction_score.toFixed(1)}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Booking Conversion</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.booking_conversion_rate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Most Common Questions</span>
            </CardTitle>
            <CardDescription>Top questions handled by AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.top_questions.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">{item.question}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{item.count} times asked</span>
                      <Badge variant={item.resolved_rate >= 90 ? "default" : "secondary"}>
                        {item.resolved_rate.toFixed(0)}% resolved
                      </Badge>
                    </div>
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
            <CardDescription>Conversations by language</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(metrics.language_distribution).map(([language, count]) => (
                <div key={language} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{language}</span>
                    <span className="text-sm text-gray-600">{count} chats</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                      style={{ width: `${(count / metrics.total_conversations) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-green-600" />
            <span>Recent Conversations</span>
          </CardTitle>
          <CardDescription>Latest AI interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversations.slice(0, 10).map((conversation) => (
              <div key={conversation.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <p className="font-medium text-gray-900">{conversation.question}</p>
                    <Badge variant="outline" className="text-xs">
                      {conversation.source}
                    </Badge>
                    <Badge variant={conversation.resolved ? "default" : "secondary"} className="text-xs">
                      {conversation.resolved ? 'Resolved' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {conversation.response.substring(0, 100)}...
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{new Date(conversation.created_at).toLocaleDateString()}</span>
                    <span>{conversation.response_time}s response time</span>
                    <span>{conversation.language}</span>
                    {conversation.satisfaction_score && (
                      <span className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        {conversation.satisfaction_score}/5
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAIPerformance; 