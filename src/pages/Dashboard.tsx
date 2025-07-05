
import React from 'react';
import MetricCard from '@/components/MetricCard';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const metrics = [
    {
      title: 'Total Patient Inquiries',
      value: '2,847',
      change: '+12% from last month',
      changeType: 'positive' as const,
      icon: Users,
      description: 'WhatsApp + Website inquiries'
    },
    {
      title: 'Appointments Booked',
      value: '1,234',
      change: '+8% from last month',
      changeType: 'positive' as const,
      icon: Calendar,
      description: 'Automated + Manual bookings'
    },
    {
      title: 'Chatbot Conversations',
      value: '5,678',
      change: '+15% from last month',
      changeType: 'positive' as const,
      icon: MessageSquare,
      description: 'AI-handled conversations'
    },
    {
      title: 'Conversion Rate',
      value: '43.3%',
      change: '+2.1% from last month',
      changeType: 'positive' as const,
      icon: TrendingUp,
      description: 'Inquiry to appointment rate'
    }
  ];

  const recentActivity = [
    { time: '2 mins ago', action: 'New WhatsApp booking', patient: 'Sarah M.', status: 'confirmed' },
    { time: '5 mins ago', action: 'Chatbot FAQ resolved', patient: 'Anonymous', status: 'resolved' },
    { time: '8 mins ago', action: 'Appointment reminder sent', patient: 'John D.', status: 'sent' },
    { time: '12 mins ago', action: 'New website inquiry', patient: 'Lisa K.', status: 'pending' },
  ];

  const systemStatus = [
    { service: 'WhatsApp Bot', status: 'online', uptime: '99.9%' },
    { service: 'Website Integration', status: 'online', uptime: '99.7%' },
    { service: 'Booking System', status: 'online', uptime: '99.8%' },
    { service: 'SMS Notifications', status: 'maintenance', uptime: '98.2%' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Monitor your clinic's AI performance and automation</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">Last updated: Just now</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Today's Activity</span>
            </CardTitle>
            <CardDescription>Real-time updates from your clinic's AI systems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'confirmed' ? 'bg-green-500' :
                      activity.status === 'resolved' ? 'bg-blue-500' :
                      activity.status === 'sent' ? 'bg-purple-500' :
                      'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.patient}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>System Status</span>
            </CardTitle>
            <CardDescription>Monitor all your integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemStatus.map((system, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      system.status === 'online' ? 'bg-green-500 animate-pulse' :
                      system.status === 'maintenance' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{system.service}</p>
                      <p className="text-xs text-gray-500">Uptime: {system.uptime}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    system.status === 'online' ? 'bg-green-100 text-green-700' :
                    system.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {system.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Update Chatbot</h3>
                <p className="text-sm text-gray-600">Modify FAQs and responses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Booking Settings</h3>
                <p className="text-sm text-gray-600">Configure appointment slots</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">WhatsApp Setup</h3>
                <p className="text-sm text-gray-600">Configure WhatsApp integration</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
