import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ClientAIPerformance from '@/components/ClientAIPerformance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  Star,
  Globe,
  Shield,
  ExternalLink
} from 'lucide-react';

const ClientDashboard = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [searchParams] = useSearchParams();
  const clientName = searchParams.get('name') || 'Klinik Subha';
  const isAuthenticated = searchParams.get('auth') === 'true';

  if (!clientId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Invalid Client Dashboard</CardTitle>
            <CardDescription className="text-center">
              Missing client ID. Please check your dashboard URL.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <a href="/">Return to Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Performance Dashboard</h1>
                <p className="text-sm text-gray-600">Powered by Klinik Subha</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Data</span>
              </Badge>
              {isAuthenticated && (
                <Button variant="outline" size="sm" asChild>
                  <a href="/dashboard" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Admin Panel
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Client Info */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{clientName}</h2>
                <p className="text-gray-600 mt-1">
                  Real-time AI performance insights and analytics
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Performance Dashboard */}
        <ClientAIPerformance 
          clientId={clientId} 
          clientName={clientName}
          isPublic={true}
        />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              © 2024 Klinik Subha. AI Performance Dashboard powered by advanced analytics.
            </p>
            <div className="flex items-center justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Globe className="h-4 w-4" />
                <span>Multi-language Support</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Real-time Updates</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <TrendingUp className="h-4 w-4" />
                <span>Performance Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard; 