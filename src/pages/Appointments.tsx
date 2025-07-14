import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, Phone, MessageSquare, Plus, Filter, Check, X as XIcon, Eye } from 'lucide-react';
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
        description: `Appointment status changed to ${status}`,
        variant: "default",
      });

      // Optionally, re-fetch after a short delay
      setTimeout(() => fetchAppointments(), 1500);

    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: "There was an error updating the appointment status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Ensure date is in YYYY-MM-DD format
      let formattedDate = form.preferred_date;
      if (formattedDate && formattedDate.includes('/')) {
        const [day, month, year] = formattedDate.split('/');
        formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      // Ensure time is in HH:mm:ss format
      let formattedTime = form.preferred_time;
      if (formattedTime && formattedTime.length === 5) {
        formattedTime = formattedTime + ':00';
      }
      const { error } = await supabase.from('appointments').insert({
        patient_name: form.patient_name,
        patient_phone: form.patient_phone,
        patient_ic_email: form.patient_ic,
        service_type: form.service_type,
        preferred_date: formattedDate,
        preferred_time: formattedTime,
        additional_notes: form.additional_notes,
        status: 'pending',
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Appointment Booked!",
        description: `Successfully booked appointment for ${form.patient_name} on ${formattedDate}`,
        variant: "default",
      });

      setForm({ patient_name: '', patient_phone: '', patient_ic: '', service_type: '', preferred_date: '', preferred_time: '', additional_notes: '' });
      let query = supabase.from('appointments').select('*');
      if (filter === 'website') query = query.eq('source', 'website');
      if (filter === 'whatsapp') query = query.eq('source', 'whatsapp');
      const { data } = await query;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error booking the appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Appointments</h1>
          <p className="text-gray-600 mt-1">
            Manage your clinic appointments and schedule
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {FILTERS.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f.value)}
                className={filter === f.value ? 'bg-white shadow-sm' : ''}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className={viewMode === 'calendar' ? 'bg-white shadow-sm' : ''}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-white shadow-sm' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            List
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Book New Appointment</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleBookAppointment}>
                <div>
                  <Label htmlFor="patient_name">Patient Name</Label>
                  <Input id="patient_name" name="patient_name" value={form.patient_name} onChange={handleFormChange} placeholder="Enter patient name" required />
                </div>
                <div>
                  <Label htmlFor="patient_phone">Phone Number</Label>
                  <Input id="patient_phone" name="patient_phone" value={form.patient_phone} onChange={handleFormChange} placeholder="+60123456789" required />
                </div>
                <div>
                  <Label htmlFor="patient_ic">IC Number</Label>
                  <Input id="patient_ic" name="patient_ic" value={form.patient_ic} onChange={handleFormChange} placeholder="Enter IC number" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferred_date">Date</Label>
                    <Input id="preferred_date" name="preferred_date" type="date" value={form.preferred_date} onChange={handleFormChange} required />
                  </div>
                  <div>
                    <Label htmlFor="preferred_time">Time</Label>
                    <Input id="preferred_time" name="preferred_time" type="time" value={form.preferred_time} onChange={handleFormChange} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="service_type">Appointment Type</Label>
                  <Select name="service_type" value={form.service_type} onValueChange={val => setForm(f => ({ ...f, service_type: val }))} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="followup">Follow-up</SelectItem>
                      <SelectItem value="checkup">Check-up</SelectItem>
                      <SelectItem value="treatment">Treatment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="additional_notes">Additional Notes</Label>
                  <textarea id="additional_notes" name="additional_notes" value={form.additional_notes} onChange={handleFormChange} className="border rounded px-3 py-2 w-full" rows={2} placeholder="Enter any notes..." />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" disabled={submitting}>
                  {submitting ? 'Booking...' : 'Book Appointment'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-green-600">{todaysAppointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">{todaysAppointments.filter(a => a.status === 'confirmed').length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{todaysAppointments.filter(a => a.status === 'pending').length}</p>
              </div>
              <User className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Via WhatsApp</p>
                <p className="text-2xl font-bold text-emerald-600">{todaysAppointments.filter(a => a.source === 'whatsapp').length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Calendar</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                Selected: {formatDate(selectedDate, 'MMMM d, yyyy')}
              </p>
              <p className="text-sm text-green-600">
                {todaysAppointments.length} appointments scheduled
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Today's Schedule</span>
              </div>
              <Badge variant="outline">
                {formatDate(selectedDate, 'MMM d, yyyy')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : todaysAppointments.length === 0 ? (
                <div className="text-center text-gray-500">No appointments for this date.</div>
              ) : todaysAppointments.map((appointment) => {
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{appointment.preferred_time || appointment.time}</div>
                        <div className="text-xs text-gray-500">{appointment.service_type || appointment.type}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{appointment.patient_name || appointment.patientName}</h3>
                          {getSourceIcon(appointment.source)}
                        </div>
                        <p className="text-sm text-gray-600">{appointment.additional_notes}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status === 'pending' ? 'Pending' : appointment.status === 'confirmed' ? 'Confirmed' : appointment.status === 'cancelled' ? 'Cancelled' : appointment.status}
                      </Badge>
                      {/* Only show View button in the list */}
                      <Dialog open={openDialogId === appointment.id} onOpenChange={open => setOpenDialogId(open ? appointment.id : null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-blue-600 border-blue-300" title="View Appointment Details">
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Appointment Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2">
                            <div><strong>Patient Name:</strong> {appointment.patient_name || appointment.patientName}</div>
                            <div><strong>Phone:</strong> {appointment.patient_phone || appointment.phone}</div>
                            <div><strong>IC:</strong> {appointment.patient_ic || appointment.patient_ic_email}</div>
                            <div><strong>Service Type:</strong> {appointment.service_type || appointment.type}</div>
                            <div><strong>Date:</strong> {appointment.preferred_date || appointment.date}</div>
                            <div><strong>Time:</strong> {appointment.preferred_time || appointment.time}</div>
                            <div><strong>Notes:</strong> {appointment.additional_notes}</div>
                            <div><strong>Status:</strong> {appointment.status === 'pending' ? 'Pending' : appointment.status === 'confirmed' ? 'Confirmed' : appointment.status === 'cancelled' ? 'Cancelled' : appointment.status}</div>
                          </div>
                          {/* Show WhatsApp, Approve/Cancel in dialog if still pending */}
                          {appointment.status === 'pending' && (
                            <div className="flex space-x-2 mt-4">
                              <Button
                                size="sm"
                                className="bg-[#25D366] hover:bg-[#1ebe57] text-white p-2 rounded-full shadow-none border-none"
                                asChild
                              >
                                <a
                                  href={`https://wa.me/${(appointment.patient_phone || appointment.phone || '').replace(/^0/, '60').replace(/[^\d]/g, '')}?text=${encodeURIComponent(getWhatsAppMessage(appointment) || '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Send WhatsApp Message"
                                  className="inline-flex items-center"
                                >
                                  <WhatsAppIcon width={20} height={20} />
                                </a>
                              </Button>
                              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}>
                                <Check className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}>
                                <XIcon className="h-4 w-4 mr-1" /> Cancel
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Appointments;
