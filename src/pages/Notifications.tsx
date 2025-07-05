
import React from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MetricCard from '@/components/MetricCard';

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Appointment Booked',
      message: 'New appointment scheduled for tomorrow at 2:00 PM via WhatsApp',
      time: '5 minutes ago',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Chatbot Response Delayed',
      message: 'WhatsApp chatbot took longer than usual to respond',
      time: '15 minutes ago',
      read: false
    },
    {
      id: 3,
      type: 'info',
      title: 'Weekly Report Ready',
      message: 'Your weekly performance report is now available for download',
      time: '1 hour ago',
      read: true
    },
    {
      id: 4,
      type: 'error',
      title: 'Integration Error',
      message: 'WhatsApp API connection temporarily interrupted',
      time: '2 hours ago',
      read: true
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return X;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated with your clinic's AI performance</p>
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <Bell className="h-4 w-4" />
          <span>Mark All Read</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Alerts"
          value="12"
          change="+3 today"
          changeType="neutral"
          icon={Bell}
          description="Active notifications"
        />
        <MetricCard
          title="Unread"
          value="4"
          change="2 new"
          changeType="positive"
          icon={AlertTriangle}
          description="Require attention"
        />
        <MetricCard
          title="System Status"
          value="Online"
          change="99.9% uptime"
          changeType="positive"
          icon={CheckCircle}
          description="All systems operational"
        />
        <MetricCard
          title="Last Update"
          value="2 min"
          change="Real-time sync"
          changeType="positive"
          icon={Info}
          description="Data freshness"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Recent Notifications</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            return (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-green-50/30' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg bg-gray-100 ${getNotificationColor(notification.type)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      <span className="text-sm text-gray-500">{notification.time}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{notification.message}</p>
                    {!notification.read && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          New
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
