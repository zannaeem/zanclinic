
import React from 'react';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MetricCard from '@/components/MetricCard';

const Reports = () => {
  const reports = [
    {
      id: 1,
      title: 'Monthly Performance Report',
      period: 'December 2024',
      generated: '2024-12-28',
      size: '2.4 MB',
      status: 'Ready'
    },
    {
      id: 2,
      title: 'Weekly Chatbot Analytics',
      period: 'Week 52, 2024',
      generated: '2024-12-27',
      size: '1.8 MB',
      status: 'Ready'
    },
    {
      id: 3,
      title: 'Appointment Conversion Report',
      period: 'Q4 2024',
      generated: '2024-12-25',
      size: '3.2 MB',
      status: 'Ready'
    },
    {
      id: 4,
      title: 'Patient Inquiry Analysis',
      period: 'December 2024',
      generated: '2024-12-20',
      size: '1.5 MB',
      status: 'Generating'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Reports</h1>
          <p className="text-gray-600">Download detailed performance analytics and insights</p>
        </div>
        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
          <FileText className="h-4 w-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Reports Generated"
          value="24"
          change="+4 this month"
          changeType="positive"
          icon={FileText}
          description="Total reports created"
        />
        <MetricCard
          title="Download Count"
          value="156"
          change="+12 this week"
          changeType="positive"
          icon={Download}
          description="Times reports accessed"
        />
        <MetricCard
          title="Latest Report"
          value="Today"
          change="Auto-generated"
          changeType="positive"
          icon={Calendar}
          description="Most recent update"
        />
        <MetricCard
          title="Data Coverage"
          value="100%"
          change="Complete data"
          changeType="positive"
          icon={TrendingUp}
          description="Information accuracy"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Available Reports</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {reports.map((report) => (
            <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{report.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{report.period}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Generated: {report.generated}</span>
                      <span>Size: {report.size}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        report.status === 'Ready' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {report.status === 'Ready' && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
