import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, Phone, MessageSquare, Plus, Filter, Check, X as XIcon, Eye, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format as formatDate, parse } from 'date-fns';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

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

const Appointments = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    patient_name: '',
    patient_phone: '',
    patient_ic: '',
    service_type: '',
    preferred_date: '',
    preferred_time: '',
    additional_notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  // Move fetchAppointments outside useEffect
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

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter appointments for the selected date
  const todayStr = formatDate(selectedDate, 'yyyy-MM-dd');
  const todaysAppointments = appointments.filter(
    (appt) => {
      const match = appt.preferred_date === todayStr;
      console.log('Filter:', {
        id: appt.id,
        status: appt.status,
        preferred_date: appt.preferred_date,
        todayStr,
        match
      });
      return match;
    }
  );

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

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Update local state immediately
      setAppointments(prev =>
        prev.map(app => String(app.id) === String(id) ? { ...app, status } : app)
      );

      // Close dialog
      setOpenDialogId(null);

      toast({
        title: "Status Updated!",
        description: `Appointment status changed to ${getStatusLabel(status)}`,
        variant: "default",
      });

      // No delayed fetch needed; realtime will update UI

    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating the appointment status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Appointments</h1>
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => setViewMode('calendar')} className={`mr-2 ${viewMode === 'calendar' ? 'bg-blue-500 text-white' : ''}`}>
          <Calendar className="mr-2" /> Calendar
        </Button>
        <Button onClick={() => setViewMode('list')} className={`mr-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : ''}`}>
          <List className="mr-2" /> List
        </Button>
        <Select onValueChange={(value) => setFilter(value)} value={filter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter appointments" />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {viewMode === 'calendar' && (
        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={(date) => setSelectedDate(date || new Date())}
          className="rounded-md border"
        />
      )}

      {viewMode === 'list' && (
        <div className="grid gap-4">
          {loading ? (
            <p>Loading appointments...</p>
          ) : todaysAppointments.length === 0 ? (
            <p>No appointments for today.</p>
          ) : (
            todaysAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{appointment.patient_name}</CardTitle>
                    <p className="text-sm text-gray-600">{appointment.service_type}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(parse(appointment.preferred_date, 'yyyy-MM-dd', new Date()), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {getStatusLabel(appointment.status)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-800">{appointment.additional_notes}</p>
                  <p className="text-sm text-gray-600">
                    Source: {appointment.source}
                    {appointment.source === 'whatsapp' && (
                      <WhatsAppIcon className="ml-2 inline-block h-4 w-4 text-green-600" />
                    )}
                  </p>
                  <div className="flex items-center mt-2 text-gray-600 text-sm">
                    <User className="h-4 w-4 mr-1" />
                    {appointment.patient_name}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Phone className="h-4 w-4 mr-1" />
                    {appointment.patient_phone}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {appointment.source === 'whatsapp' && (
                      <a href={`https://wa.me/${appointment.patient_phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="underline">
                        WhatsApp
                      </a>
                    )}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {appointment.preferred_date} at {appointment.preferred_time}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {appointment.created_at && formatDate(parse(appointment.created_at, 'yyyy-MM-dd HH:mm:ss', new Date()), 'MMM dd, HH:mm')}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Eye className="h-4 w-4 mr-1" />
                    {appointment.updated_at && formatDate(parse(appointment.updated_at, 'yyyy-MM-dd HH:mm:ss', new Date()), 'MMM dd, HH:mm')}
                  </div>
                  <div className="flex items-center mt-2">
                    <Button
                      variant="outline"
                      onClick={() => setOpenDialogId(appointment.id)}
                      className="mr-2"
                    >
                      <Check className="h-4 w-4 mr-1" /> Update Status
                    </Button>
                    <Dialog open={openDialogId === appointment.id} onOpenChange={(open) => setOpenDialogId(open ? appointment.id : null)}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Appointment Status for {appointment.patient_name}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                              Status:
                            </Label>
                            <Select onValueChange={(value) => handleUpdateStatus(appointment.id, value)} value={appointment.status}>
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Appointments;