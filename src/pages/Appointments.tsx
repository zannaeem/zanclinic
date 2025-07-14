import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, Phone, MessageSquare, Plus, Filter, Check, X as XIcon, Eye, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format as formatDate, parse } from 'date-fns';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Helper functions for date range filtering
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Website', value: 'website' },
  { label: 'WhatsApp', value: 'whatsapp' },
];

// WhatsApp SVG Icon
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 32 32"
    fill="currentColor"
    width={props.width || 20}
    height={props.height || 20}
    {...props}
  >
    <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.828-2.205A12.94 12.94 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22.917c-1.97 0-3.89-.52-5.56-1.5l-.396-.234-4.65 1.308 1.25-4.53-.258-.417A9.93 9.93 0 016 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.44-7.26c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.165-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.058-.173-.297-.018-.457.13-.605.134-.134.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.67-1.612-.917-2.21-.242-.58-.487-.5-.67-.51-.173-.007-.372-.009-.57-.009-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.48 0 1.463 1.065 2.877 1.214 3.075.149.198 2.1 3.21 5.09 4.374.712.307 1.267.49 1.7.627.714.227 1.364.195 1.877.118.573-.085 1.758-.719 2.007-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347z" />
  </svg>
);

// WhatsApp message template generator
const getWhatsAppMessage = (appointment: any, clinicNumber = '60162235212') => {
  const name = appointment.patient_name || appointment.patientName || '';
  const service = appointment.service_type || appointment.type || '';
  const date = appointment.preferred_date || appointment.date || '';
  const time = (appointment.preferred_time || appointment.time || '').slice(0,5); // HH:mm
  let status = appointment.status;
  if (status === 'confirmed') status = 'confirmed';
  else if (status === 'cancelled') status = 'cancelled';
  else status = 'pending';
  // Friendly status text
  const statusText = status === 'confirmed' ? 'confirmed' : status === 'cancelled' ? 'cancelled' : 'pending';
  return (
    `Hello ${name}, this is Klinik Subha. We would like to inform you that your appointment for ${service} on ${date} at ${time} has been *${statusText}*.` +
    `\nIf you have any questions or need to reschedule, please contact us at +${clinicNumber}.` +
    `\nThank you and have a great day!`
  );
};

// Helper for status label
function getStatusLabel(status: string) {
  if (status === 'pending') return 'Pending';
  if (status === 'confirmed') return 'Confirmed';
  if (status === 'cancelled') return 'Cancelled';
  return status;
}

  // WhatsApp message generator
  function generateWhatsAppUrl(appointment: any) {
    let phone = appointment.patient_phone || '60162235212';
    phone = phone.replace(/\D/g, '');
    if (!phone.startsWith('60')) {
      if (phone.startsWith('0')) {
        phone = '60' + phone.substring(1);
      } else if (phone.length === 10 || phone.length === 11) {
        phone = '60' + phone;
      }
    }
    const dateStr = appointment.preferred_date || 'not specified';
    const timeStr = appointment.preferred_time || 'not specified';
    let message = `Hello ${appointment.patient_name || 'Patient'}, this is Klinik Subha. Your appointment for ${appointment.service_type || 'consultation'} has been ${appointment.status || 'scheduled'} for ${dateStr} ${timeStr}. Please contact us at +60162235212 if you have any questions.`;
    message = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${message}`;
  }

const Appointments = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  // Add state for selected appointment
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);

  // Fetch appointments
  const fetchAppointments = async () => {
    setLoading(true);
    let query = supabase.from('appointments').select('*');
    if (filter === 'website') query = query.eq('source', 'website');
    if (filter === 'whatsapp') query = query.eq('source', 'whatsapp');
    const { data } = await query;
    setAppointments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  useEffect(() => {
    // Subscribe to changes in the appointments table
    const channel = supabase
      .channel('public:appointments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          fetchAppointments();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Date range filters
  const today = new Date();
  const todayStr = formatDate(selectedDate, 'yyyy-MM-dd');
  const weekStart = formatDate(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = formatDate(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const monthStart = formatDate(startOfMonth(today), 'yyyy-MM-dd');
  const monthEnd = formatDate(endOfMonth(today), 'yyyy-MM-dd');

  const todayAppointments = appointments.filter(a => a.preferred_date === todayStr);
  const weekAppointments = appointments.filter(a => a.preferred_date >= weekStart && a.preferred_date <= weekEnd);
  const monthAppointments = appointments.filter(a => a.preferred_date >= monthStart && a.preferred_date <= monthEnd);

  // Summary counts
  const confirmedCount = todayAppointments.filter(a => a.status === 'confirmed').length;
  const pendingCount = todayAppointments.filter(a => a.status === 'pending').length;
  const whatsappCount = todayAppointments.filter(a => a.source === 'whatsapp').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'whatsapp': return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'website': return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'phone': return <Phone className="h-4 w-4 text-gray-600" />;
      default: return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  // Approve/Cancel handlers
  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setAppointments(prev => prev.map(app => String(app.id) === String(id) ? { ...app, status } : app));
      toast({ title: 'Status Updated!', description: `Appointment status changed to ${getStatusLabel(status)}` });
      setSelectedAppointment(null);
    } catch (error: any) {
      toast({ title: 'Update Failed', description: error.message || 'Error updating appointment.', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Calendar className="h-6 w-6 text-green-600 mb-2" />
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <div className="text-gray-600">Today's Appointments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Check className="h-6 w-6 text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{confirmedCount}</div>
            <div className="text-gray-600">Confirmed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Clock className="h-6 w-6 text-yellow-600 mb-2" />
            <div className="text-2xl font-bold">{pendingCount}</div>
            <div className="text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <MessageSquare className="h-6 w-6 text-green-600 mb-2" />
            <div className="text-2xl font-bold">{whatsappCount}</div>
            <div className="text-gray-600">Via WhatsApp</div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Bookers by Period */}
      <div className="mb-6">
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="mb-2">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
          <TabsContent value="today">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-2">Today's Bookers</h3>
              {todayAppointments.length === 0 ? (
                <p className="text-gray-500 text-sm">No appointments booked today.</p>
              ) : (
                <ul className="list-disc pl-5">
                  {todayAppointments.map(a => (
                    <li key={a.id} className="mb-1">{a.patient_name} <span className="text-xs text-gray-400">({a.service_type})</span></li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
          <TabsContent value="week">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-2">This Week's Bookers</h3>
              {weekAppointments.length === 0 ? (
                <p className="text-gray-500 text-sm">No appointments booked this week.</p>
              ) : (
                <ul className="list-disc pl-5">
                  {weekAppointments.map(a => (
                    <li key={a.id} className="mb-1">{a.patient_name} <span className="text-xs text-gray-400">({a.service_type})</span> <span className="text-xs text-gray-400">{a.preferred_date}</span></li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
          <TabsContent value="month">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-2">This Month's Bookers</h3>
              {monthAppointments.length === 0 ? (
                <p className="text-gray-500 text-sm">No appointments booked this month.</p>
              ) : (
                <ul className="list-disc pl-5">
                  {monthAppointments.map(a => (
                    <li key={a.id} className="mb-1">{a.patient_name} <span className="text-xs text-gray-400">({a.service_type})</span> <span className="text-xs text-gray-400">{a.preferred_date}</span></li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Filters and New Appointment Button */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="flex gap-2">
          <Button variant={filter === 'website' ? 'default' : 'outline'} onClick={() => setFilter('website')}>Website</Button>
          <Button variant={filter === 'whatsapp' ? 'default' : 'outline'} onClick={() => setFilter('whatsapp')}>WhatsApp</Button>
          <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
        </div>
        <Button className="flex items-center" variant="default">
          <Plus className="h-4 w-4 mr-2" /> New Appointment
        </Button>
      </div>

      {/* Main Content: Calendar and Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setSelectedDate(date || new Date())}
              className="rounded-md border"
            />
            <div className="mt-2 text-sm text-gray-600">
              Selected: {formatDate(selectedDate, 'MMM dd, yyyy')}
              <br />
              {todayAppointments.length} appointments scheduled
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading appointments...</p>
            ) : todayAppointments.length === 0 ? (
              <p>No appointments for today.</p>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-lg font-bold text-green-700">{appointment.preferred_time}</div>
                      <div>
                        <div className="font-semibold">{appointment.patient_name}</div>
                        <div className="text-xs text-gray-500">{appointment.service_type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(appointment.status)}>{getStatusLabel(appointment.status)}</Badge>
                      <Button size="sm" variant="outline" onClick={() => setSelectedAppointment(appointment)}>View</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Appointment Details Modal */}
      <Dialog open={!!selectedAppointment} onOpenChange={open => setSelectedAppointment(open ? selectedAppointment : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedAppointment.patient_name || 'N/A'}</p>
              <p><strong>Service:</strong> {selectedAppointment.service_type || 'N/A'}</p>
              <p><strong>Date:</strong> {selectedAppointment.preferred_date || 'N/A'}</p>
              <p><strong>Time:</strong> {selectedAppointment.preferred_time || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedAppointment.patient_phone || 'N/A'}</p>
              <p><strong>IC/Email:</strong> {selectedAppointment.patient_ic || 'N/A'}</p>
              <p><strong>Notes:</strong> {selectedAppointment.additional_notes || 'N/A'}</p>
              <p><strong>Status:</strong> {getStatusLabel(selectedAppointment.status) || 'N/A'}</p>
              <p><strong>Submitted:</strong> {selectedAppointment.created_at ? new Date(selectedAppointment.created_at).toLocaleString() : 'N/A'}</p>
            </div>
          )}
          <DialogFooter className="flex gap-2 mt-4">
            <Button disabled={updating || !selectedAppointment || selectedAppointment.status === 'confirmed'} variant="default" onClick={() => handleUpdateStatus(selectedAppointment.id, 'confirmed')}>Approve</Button>
            <Button disabled={updating || !selectedAppointment || selectedAppointment.status === 'cancelled'} variant="destructive" onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}>Cancel</Button>
            {selectedAppointment && selectedAppointment.patient_phone && (
              <a
                href={generateWhatsAppUrl(selectedAppointment)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                style={{ textDecoration: 'none' }}
              >
                <MessageSquare className="h-4 w-4 mr-2" /> WhatsApp
              </a>
            )}
            <Button variant="outline" onClick={() => setSelectedAppointment(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;