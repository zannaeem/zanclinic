import React, { useState, useRef } from 'react';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MetricCard from '@/components/MetricCard';
import { aiPerformanceAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';

const CLIENT_ID = 'demo_clinic'; // Replace with dynamic client id if needed

const Reports = () => {
  const [downloading, setDownloading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [weeklyPdfLoading, setWeeklyPdfLoading] = useState(false);
  const { toast } = useToast();
  const chartRef = useRef<HTMLCanvasElement>(null);

  const handleDownloadCSV = async () => {
    setDownloading(true);
    try {
      const data = await aiPerformanceAPI.getClientPerformance(CLIENT_ID);
      if (!data || data.length === 0) {
        toast({
          title: 'No Data',
          description: 'No AI performance data available to export.',
          variant: 'destructive',
        });
        setDownloading(false);
        return;
      }
      const csvContent = [
        [
          'Date',
          'Question',
          'Response',
          'Response Time (s)',
          'Language',
          'Source',
          'Resolved',
          'Satisfaction Score',
          'Booking Conversion'
        ],
        ...data.map(row => [
          new Date(row.created_at).toLocaleString(),
          row.question,
          row.response.replace(/\n/g, ' ').substring(0, 100) + (row.response.length > 100 ? '...' : ''),
          row.response_time,
          row.language,
          row.source,
          row.resolved ? 'Yes' : 'No',
          row.satisfaction_score ?? 'N/A',
          row.booking_conversion ? 'Yes' : 'No'
        ])
      ].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-performance-${CLIENT_ID}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: 'Export Successful',
        description: 'AI performance data has been exported to CSV.',
      });
    } catch (err) {
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting the data.',
        variant: 'destructive',
      });
    }
    setDownloading(false);
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      // Fetch metrics and top questions
      const metrics = await aiPerformanceAPI.getPerformanceMetrics(CLIENT_ID);
      const data = await aiPerformanceAPI.getClientPerformance(CLIENT_ID);
      if (!metrics || metrics.total_conversations === 0) {
        toast({
          title: 'No Data',
          description: 'No AI performance data available to export.',
          variant: 'destructive',
        });
        setPdfLoading(false);
        return;
      }
      const doc = new jsPDF();
      // Cover page
      doc.setFontSize(20);
      doc.text('ZanSocial Clinic', 14, 20);
      doc.setFontSize(16);
      doc.text('Monthly Performance Report', 14, 32);
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 40);
      doc.text(`Client: Dr. Chen's Clinic`, 14, 48);
      doc.text(`Month: ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`, 14, 56);
      doc.setDrawColor(0, 200, 120);
      doc.line(14, 60, 196, 60);

      // Key metrics
      doc.setFontSize(14);
      doc.text('Key Metrics', 14, 72);
      doc.setFontSize(12);
      doc.text(`Total Conversations: ${metrics.total_conversations.toLocaleString()}`, 14, 80);
      doc.text(`Avg. Response Time: ${metrics.avg_response_time.toFixed(1)}s`, 14, 88);
      doc.text(`Booking Conversion Rate: ${metrics.booking_conversion_rate.toFixed(1)}%`, 14, 96);
      doc.text(`Satisfaction Score: ${metrics.satisfaction_score.toFixed(2)}/5`, 14, 104);

      // Top Questions Table
      doc.setFontSize(14);
      doc.text('Top 5 Questions', 14, 116);
      autoTable(doc, {
        startY: 120,
        head: [['Question', 'Asked', 'Resolved %']],
        body: metrics.top_questions.map(q => [q.question, q.count, q.resolved_rate.toFixed(0) + '%'])
      });

      // Language Breakdown Table
      let langY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 150;
      doc.setFontSize(14);
      doc.text('Language Breakdown', 14, langY);
      autoTable(doc, {
        startY: langY + 4,
        head: [['Language', 'Conversations']],
        body: Object.entries(metrics.language_distribution).map(([lang, count]) => [lang, count])
      });

      // Summary
      let summaryY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 200;
      doc.setFontSize(14);
      doc.text('Summary & Insights', 14, summaryY);
      doc.setFontSize(12);
      doc.text([
        `- Your AI assistant handled ${metrics.total_conversations} conversations this month.`,
        `- Average response time was ${metrics.avg_response_time.toFixed(1)} seconds.`,
        `- ${metrics.booking_conversion_rate.toFixed(1)}% of conversations led to bookings.`,
        `- Most common question: ${metrics.top_questions[0]?.question || 'N/A'}`,
        `- Peak hours: ${metrics.hourly_activity.sort((a, b) => b.conversations - a.conversations)[0]?.hour || 'N/A'}`
      ], 14, summaryY + 8);

      // Save
      doc.save(`Monthly-Performance-Report-${CLIENT_ID}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast({
        title: 'PDF Exported',
        description: 'Monthly Performance Report has been downloaded.',
      });
    } catch (err) {
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting the PDF.',
        variant: 'destructive',
      });
    }
    setPdfLoading(false);
  };

  const handleDownloadWeeklyPDF = async () => {
    setWeeklyPdfLoading(true);
    try {
      const metrics = await aiPerformanceAPI.getPerformanceMetrics(CLIENT_ID, 'week');
      if (!metrics || metrics.total_conversations === 0) {
        toast({
          title: 'No Data',
          description: 'No AI performance data available to export.',
          variant: 'destructive',
        });
        setWeeklyPdfLoading(false);
        return;
      }
      // Use the hidden canvas in the DOM
      const canvas = chartRef.current;
      if (!canvas) throw new Error('Chart canvas not found');
      // Prepare chart data
      const labels = metrics.hourly_activity.map(h => h.hour);
      const data = metrics.hourly_activity.map(h => h.conversations);
      // Render chart
      const chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Conversations',
            data,
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgba(5, 150, 105, 1)',
            borderWidth: 1
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
          animation: false
        }
      });
      // Wait for chart to render
      await new Promise(resolve => setTimeout(resolve, 800));
      // Convert chart to image
      const chartImage = await html2canvas(canvas).then(c => c.toDataURL('image/png'));
      chart.destroy();
      // Generate PDF (same as before)
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('ZanSocial Clinic', 14, 20);
      doc.setFontSize(16);
      doc.text('Weekly Chatbot Analytics', 14, 32);
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 40);
      doc.text(`Client: Dr. Chen's Clinic`, 14, 48);
      doc.text(`Week: ${getCurrentWeekString()}`, 14, 56);
      doc.setDrawColor(0, 200, 120);
      doc.line(14, 60, 196, 60);
      doc.setFontSize(14);
      doc.text('Key Metrics', 14, 72);
      doc.setFontSize(12);
      doc.text(`Total Conversations: ${metrics.total_conversations.toLocaleString()}`, 14, 80);
      doc.text(`Avg. Response Time: ${metrics.avg_response_time.toFixed(1)}s`, 14, 88);
      doc.text(`Booking Conversion Rate: ${metrics.booking_conversion_rate.toFixed(1)}%`, 14, 96);
      doc.text(`Satisfaction Score: ${metrics.satisfaction_score.toFixed(2)}/5`, 14, 104);
      doc.setFontSize(14);
      doc.text('Hourly Activity', 14, 116);
      doc.addImage(chartImage, 'PNG', 14, 120, 180, 60);
      let tableY = 185;
      doc.setFontSize(14);
      doc.text('Top 5 Questions', 14, tableY);
      // @ts-ignore
      autoTable(doc, {
        startY: tableY + 4,
        head: [['Question', 'Asked', 'Resolved %']],
        body: metrics.top_questions.map(q => [q.question, q.count, q.resolved_rate.toFixed(0) + '%'])
      });
      let langY = ((doc as any).lastAutoTable?.finalY || 250) + 10;
      doc.setFontSize(14);
      doc.text('Language Breakdown', 14, langY);
      // @ts-ignore
      autoTable(doc, {
        startY: langY + 4,
        head: [['Language', 'Conversations']],
        body: Object.entries(metrics.language_distribution).map(([lang, count]) => [lang, count])
      });
      let summaryY = ((doc as any).lastAutoTable?.finalY || 300) + 10;
      doc.setFontSize(14);
      doc.text('Summary & Insights', 14, summaryY);
      doc.setFontSize(12);
      doc.text([
        `- Your AI assistant handled ${metrics.total_conversations} conversations this week.`,
        `- Average response time was ${metrics.avg_response_time.toFixed(1)} seconds.`,
        `- ${metrics.booking_conversion_rate.toFixed(1)}% of conversations led to bookings.`,
        `- Most common question: ${metrics.top_questions[0]?.question || 'N/A'}`,
        `- Peak hours: ${metrics.hourly_activity.sort((a, b) => b.conversations - a.conversations)[0]?.hour || 'N/A'}`
      ], 14, summaryY + 8);
      doc.save(`Weekly-Chatbot-Analytics-${CLIENT_ID}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast({
        title: 'PDF Exported',
        description: 'Weekly Chatbot Analytics has been downloaded.',
      });
    } catch (err) {
      console.error('PDF Export Error:', err);
      toast({
        title: 'Export Failed',
        description: `There was an error exporting the PDF: ${err instanceof Error ? err.message : String(err)}`,
        variant: 'destructive',
      });
    }
    setWeeklyPdfLoading(false);
  };

  function getCurrentWeekString() {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    return `Week ${week}, ${now.getFullYear()}`;
  }

  const reports = [
    {
      id: 1,
      title: 'Monthly Performance Report',
      period: 'December 2024',
      generated: '2024-12-28',
      size: '2.4 MB',
      status: 'Ready',
      pdf: true,
      pdfType: 'monthly'
    },
    {
      id: 2,
      title: 'Weekly Chatbot Analytics',
      period: 'Week 52, 2024',
      generated: '2024-12-27',
      size: '1.8 MB',
      status: 'Ready',
      pdf: true,
      pdfType: 'weekly'
    },
    {
      id: 3,
      title: 'Appointment Conversion Report',
      period: 'Q4 2024',
      generated: '2024-12-25',
      size: '3.2 MB',
      status: 'Ready',
      pdf: false
    },
    {
      id: 4,
      title: 'Patient Inquiry Analysis',
      period: 'December 2024',
      generated: '2024-12-20',
      size: '1.5 MB',
      status: 'Generating',
      pdf: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Reports</h1>
          <p className="text-gray-600">Download detailed performance analytics and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            onClick={handleDownloadCSV}
            disabled={downloading}
          >
            <Download className="h-4 w-4 mr-2" />
            {downloading ? 'Exporting...' : 'Download CSV'}
          </Button>
          <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            <FileText className="h-4 w-4 mr-2" />
            Generate New Report
          </Button>
        </div>
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
                  {report.status === 'Ready' && report.pdf && report.pdfType === 'monthly' && (
                    <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={pdfLoading}>
                      <Download className="h-4 w-4 mr-2" />
                      {pdfLoading ? 'Exporting...' : 'Download PDF'}
                    </Button>
                  )}
                  {report.status === 'Ready' && report.pdf && report.pdfType === 'weekly' && (
                    <Button variant="outline" size="sm" onClick={handleDownloadWeeklyPDF} disabled={weeklyPdfLoading}>
                      <Download className="h-4 w-4 mr-2" />
                      {weeklyPdfLoading ? 'Exporting...' : 'Download PDF'}
                    </Button>
                  )}
                  {report.status === 'Ready' && !report.pdf && (
                    <Button variant="outline" size="sm" disabled>
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
      {/* Hidden canvas for chart rendering */}
      <canvas
        ref={chartRef}
        style={{ position: 'absolute', left: '-9999px', top: 0, width: 600, height: 300 }}
        width={600}
        height={300}
      />
    </div>
  );
};

export default Reports;
