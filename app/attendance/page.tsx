'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, CheckCircle, Clock, User, Plus, Trash2 } from 'lucide-react';
import { useAttendance } from '@/hooks/use-attendance';

interface AttendanceRecord {
  id: string;
  memberName: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  checkIn?: string;
  checkOut?: string;
  notes?: string;
  attended?: boolean;
}

export default function AttendancePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const { addAttendance, deleteAttendance, fetchAttendance, loading, error } = useAttendance()

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newCheckIn, setNewCheckIn] = useState('09:00');
  const [newCheckOut, setNewCheckOut] = useState('17:00');
  const [newStatus, setNewStatus] = useState<'present' | 'absent' | 'late' | 'half-day'>('present');
  const [newNotes, setNewNotes] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);

  // Load attendance records on mount and when date changes
  useEffect(() => {
    const loadRecords = async () => {
      const records = await fetchAttendance(selectedDate)
      setAttendanceRecords(records || [])
    }
    loadRecords()
  }, [selectedDate, fetchAttendance])

  // Monthly summary state
  const [presentDays, setPresentDays] = useState(0);
  const [absentDays, setAbsentDays] = useState(0);
  const [lateArrivals, setLateArrivals] = useState(0);
  const [workingDays, setWorkingDays] = useState(0);
  const [absentNotes, setAbsentNotes] = useState('Approved leave');
  const [lateNotes, setLateNotes] = useState('Minutes late on average');
  const [editingMonthly, setEditingMonthly] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'absent':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'late':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'half-day':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5" />;
      case 'absent':
        return <Clock className="w-5 h-5" />;
      case 'late':
        return <Clock className="w-5 h-5" />;
      case 'half-day':
        return <Clock className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const attendanceRate = ((attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length) * 100).toFixed(1);

  const toggleAttendance = (id: string) => {
    setAttendanceRecords(attendanceRecords.map(record => 
      record.id === id ? { ...record, attended: !record.attended } : record
    ));
  };

  const addMember = async () => {
    if (newMemberName.trim()) {
      const newRecord: AttendanceRecord = {
        id: '',
        memberName: newMemberName,
        date: selectedDate,
        status: newStatus,
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        notes: newNotes,
        attended: newStatus === 'present' || newStatus === 'late',
      };
      
      try {
        const savedRecord = await addAttendance(newRecord)
        if (savedRecord && savedRecord.id) {
          setAttendanceRecords([...attendanceRecords, savedRecord])
          setNewMemberName('');
          setNewCheckIn('09:00');
          setNewCheckOut('17:00');
          setNewStatus('present');
          setNewNotes('');
          setShowAddMember(false);
        }
      } catch (err) {
        console.error('Failed to add member:', err)
      }
    }
  };

  const removeMember = async (id: string) => {
    try {
      await deleteAttendance(id)
      setAttendanceRecords(attendanceRecords.filter(record => record.id !== id))
    } catch (err) {
      console.error('Failed to remove member:', err)
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="p-8 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Present</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendanceRecords.filter(r => r.status === 'present').length}</div>
                <p className="text-xs text-muted-foreground mt-1">Today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Late Arrivals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{attendanceRecords.filter(r => r.status === 'late').length}</div>
                <p className="text-xs text-muted-foreground mt-1">Today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{attendanceRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{attendanceRecords.filter(r => r.status === 'absent').length}</div>
                <p className="text-xs text-muted-foreground mt-1">Today</p>
              </CardContent>
            </Card>
          </div>

          {/* Date Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
              <CardDescription>View attendance for a specific date</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-48"
              />
              <Button>Filter</Button>
            </CardContent>
          </Card>

          {/* Attendance Records */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Today's Attendance</CardTitle>
                  <CardDescription>Staff attendance records for {selectedDate}</CardDescription>
                </div>
                <Button 
                  onClick={() => setShowAddMember(!showAddMember)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddMember && (
                <div className="mb-6 p-4 border rounded-lg bg-muted">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Member Name *</label>
                      <Input
                        placeholder="Enter member name"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Check In</label>
                        <Input
                          type="time"
                          value={newCheckIn}
                          onChange={(e) => setNewCheckIn(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Check Out</label>
                        <Input
                          type="time"
                          value={newCheckOut}
                          onChange={(e) => setNewCheckOut(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as 'present' | 'absent' | 'late' | 'half-day')}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="half-day">Half Day</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Notes</label>
                      <Input
                        placeholder="Add any notes (optional)"
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button onClick={addMember} className="flex-1">Add Member</Button>
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setShowAddMember(false);
                          setNewMemberName('');
                          setNewCheckIn('09:00');
                          setNewCheckOut('17:00');
                          setNewStatus('present');
                          setNewNotes('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {attendanceRecords.map((record) => (
                  <div
                    key={record.id}
                    className={`p-4 border rounded-lg ${getStatusColor(record.status)} flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Checkbox
                        checked={record.attended || false}
                        onCheckedChange={() => toggleAttendance(record.id)}
                        className="w-5 h-5"
                      />
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">{getStatusIcon(record.status)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <h4 className="font-semibold">{record.memberName}</h4>
                            {record.status === 'late' && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Late</span>}
                          </div>
                          <p className="text-sm mt-2">
                            {record.checkIn ? (
                              <span className="inline-block mr-4"><strong>In:</strong> {record.checkIn}</span>
                            ) : null}
                            {record.checkOut ? (
                              <span className="inline-block"><strong>Out:</strong> {record.checkOut}</span>
                            ) : null}
                            {!record.checkIn && !record.checkOut && (
                              <span className="text-muted-foreground">No time recorded</span>
                            )}
                          </p>
                          {record.notes && <p className="text-sm mt-1 opacity-75"><strong>Notes:</strong> {record.notes}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-3 py-1 bg-white bg-opacity-50 rounded-full text-xs font-semibold">
                        {record.attended ? 'Attended' : 'Not Attended'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(record.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monthly Attendance Summary</CardTitle>
                  <CardDescription>Attendance overview for January 2024</CardDescription>
                </div>
                <Button 
                  onClick={() => setEditingMonthly(!editingMonthly)}
                  variant="outline"
                  size="sm"
                >
                  {editingMonthly ? 'Done' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editingMonthly ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Present Days</label>
                      <Input
                        type="number"
                        value={presentDays}
                        onChange={(e) => setPresentDays(parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Working Days Total</label>
                      <Input
                        type="number"
                        value={workingDays}
                        onChange={(e) => setWorkingDays(parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Absent Days</label>
                      <Input
                        type="number"
                        value={absentDays}
                        onChange={(e) => setAbsentDays(parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Absent Days Notes</label>
                      <Input
                        value={absentNotes}
                        onChange={(e) => setAbsentNotes(e.target.value)}
                        placeholder="e.g., Approved leave"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Late Arrivals</label>
                      <Input
                        type="number"
                        value={lateArrivals}
                        onChange={(e) => setLateArrivals(parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Late Arrivals Notes</label>
                      <Input
                        value={lateNotes}
                        onChange={(e) => setLateNotes(e.target.value)}
                        placeholder="e.g., Minutes late on average"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setEditingMonthly(false)} className="flex-1">Save Changes</Button>
                    <Button variant="outline" onClick={() => setEditingMonthly(false)} className="flex-1">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-sm text-green-900">Present Days</h4>
                    <p className="text-2xl font-bold text-green-700 mt-2">{presentDays}</p>
                    <p className="text-xs text-green-600 mt-1">Out of {workingDays} working days</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-sm text-red-900">Absent Days</h4>
                    <p className="text-2xl font-bold text-red-700 mt-2">{absentDays}</p>
                    <p className="text-xs text-red-600 mt-1">{absentNotes}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-sm text-yellow-900">Late Arrivals</h4>
                    <p className="text-2xl font-bold text-yellow-700 mt-2">{lateArrivals}</p>
                    <p className="text-xs text-yellow-600 mt-1">{lateNotes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
