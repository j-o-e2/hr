'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Plus, Search, Filter, CheckCircle, XCircle, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function LeavePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [leaveBalances, setLeaveBalances] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        // Fetch leave requests from API
        const requestsResponse = await fetch('/api/leave-requests')
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json()
          setLeaveRequests(requestsData)
        }

        // For now, use mock leave balances data
        // In a real app, this would come from an API
        setLeaveBalances([
          {
            employee: 'John Doe',
            annualLeave: { used: 12, total: 25 },
            sickLeave: { used: 2, total: 10 },
            personalLeave: { used: 1, total: 5 },
          },
          {
            employee: 'Jane Smith',
            annualLeave: { used: 8, total: 25 },
            sickLeave: { used: 0, total: 10 },
            personalLeave: { used: 3, total: 5 },
          },
        ])
      } catch (error) {
        console.error('Failed to fetch leave data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaveData()
  }, [])

  const handleApproveLeave = async (requestId: string) => {
    try {
      console.log('Approving leave request:', requestId)
      const response = await fetch('/api/leave-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: requestId,
          status: 'approved',
          approvedBy: null, // Will be set to current user ID in a real app
          approvedDate: new Date().toISOString(),
        }),
      })

      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (response.ok) {
        // Refresh the leave requests
        const requestsResponse = await fetch('/api/leave-requests')
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json()
          setLeaveRequests(requestsData)
        }
        alert('Leave request approved successfully!')
      } else {
        alert(`Failed to approve leave request: ${responseData.error || responseData.details || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error approving leave:', error)
      alert('Error approving leave request')
    }
  }

  const handleRejectLeave = async (requestId: string) => {
    try {
      const response = await fetch('/api/leave-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: requestId,
          status: 'rejected',
          approvedBy: null, // Will be set to current user ID in a real app
          approvedDate: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        // Refresh the leave requests
        const requestsResponse = await fetch('/api/leave-requests')
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json()
          setLeaveRequests(requestsData)
        }
        alert('Leave request rejected successfully!')
      } else {
        alert('Failed to reject leave request')
      }
    } catch (error) {
      console.error('Error rejecting leave:', error)
      alert('Error rejecting leave request')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Annual Leave': return 'bg-blue-100 text-blue-800'
      case 'Sick Leave': return 'bg-red-100 text-red-800'
      case 'Personal Leave': return 'bg-purple-100 text-purple-800'
      case 'Maternity Leave': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
              <p className="text-muted-foreground">Manage employee leave requests, approvals, and balances</p>
            </div>
            <Button className="flex items-center gap-2" onClick={() => router.push('/leave/new')}>
              <Plus className="w-4 h-4" />
              Request Leave
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold">{leaveRequests.filter(req => req.status === 'pending' || req.status === 'Pending').length}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved This Month</p>
                  <p className="text-2xl font-bold">{leaveRequests.filter(req => {
                    if (req.status !== 'approved' && req.status !== 'Approved') return false;
                    const approvedDate = new Date(req.updatedAt || req.createdAt);
                    const now = new Date();
                    return approvedDate.getMonth() === now.getMonth() && approvedDate.getFullYear() === now.getFullYear();
                  }).length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rejected This Month</p>
                  <p className="text-2xl font-bold">{leaveRequests.filter(req => {
                    if (req.status !== 'rejected' && req.status !== 'Rejected') return false;
                    const rejectedDate = new Date(req.updatedAt || req.createdAt);
                    const now = new Date();
                    return rejectedDate.getMonth() === now.getMonth() && rejectedDate.getFullYear() === now.getFullYear();
                  }).length}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Approval Time</p>
                  <p className="text-2xl font-bold">{(() => {
                    const approvedRequests = leaveRequests.filter(req => (req.status === 'approved' || req.status === 'Approved') && req.updatedAt);
                    if (approvedRequests.length === 0) return '0 days';
                    const totalDays = approvedRequests.reduce((sum, req) => {
                      const created = new Date(req.createdAt);
                      const updated = new Date(req.updatedAt!);
                      const diffTime = Math.abs(updated.getTime() - created.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return sum + diffDays;
                    }, 0);
                    return `${Math.round(totalDays / approvedRequests.length)} days`;
                  })()}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
          </div>

          <Tabs defaultValue="requests" className="space-y-6">
            <TabsList>
              <TabsTrigger value="requests">Leave Requests</TabsTrigger>
              <TabsTrigger value="balances">Leave Balances</TabsTrigger>
              <TabsTrigger value="calendar">Leave Calendar</TabsTrigger>
            </TabsList>

            <TabsContent value="requests">
              {/* Leave Requests */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold">Leave Requests</h2>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input placeholder="Search requests..." className="pl-10 w-64" />
                    </div>
                    <Button variant="outline">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="pb-4 font-medium text-muted-foreground">Employee</th>
                        <th className="pb-4 font-medium text-muted-foreground">Type</th>
                        <th className="pb-4 font-medium text-muted-foreground">Duration</th>
                        <th className="pb-4 font-medium text-muted-foreground">Days</th>
                        <th className="pb-4 font-medium text-muted-foreground">Status</th>
                        <th className="pb-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {leaveRequests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                            No leave requests yet. Submit a request to get started.
                          </td>
                        </tr>
                      ) : (
                        leaveRequests.map((request) => (
                          <tr key={request.id} className="hover:bg-muted/50">
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{request.employee}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <Badge className={getTypeColor(request.type)}>{request.type}</Badge>
                            </td>
                            <td className="py-4 text-sm">
                              {request.startDate} - {request.endDate}
                            </td>
                            <td className="py-4 text-sm">{request.days} days</td>
                            <td className="py-4">
                              <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                            </td>
                            <td className="py-4">
                              <div className="flex gap-2">
                                {request.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-600 border-green-600 hover:bg-green-50"
                                      onClick={() => handleApproveLeave(request.id)}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 border-red-600 hover:bg-red-50"
                                      onClick={() => handleRejectLeave(request.id)}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {request.status !== 'pending' && (
                                  <span className="text-sm text-muted-foreground">
                                    {request.status === 'approved' ? 'Approved' : 'Rejected'}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="balances">
              {/* Leave Balances */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold">Leave Balances</h2>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input placeholder="Search employees..." className="pl-10 w-64" />
                    </div>
                    <Button variant="outline">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {leaveBalances.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground">
                      No leave balances available yet. Add employees or record leave to see balances.
                    </div>
                  ) : (
                    leaveBalances.map((balance, index) => (
                      <div key={index} className="border rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-lg">{balance.employee}</h3>
                          <Badge variant="outline">Total: {balance.annual + balance.sick + balance.personal} days</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Annual Leave</span>
                              <span>{balance.used}/{balance.annual}</span>
                            </div>
                            <Progress value={(balance.used / balance.annual) * 100} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Sick Leave</span>
                              <span>0/{balance.sick}</span>
                            </div>
                            <Progress value={0} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Personal Leave</span>
                              <span>2/{balance.personal}</span>
                            </div>
                            <Progress value={(2 / balance.personal) * 100} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="calendar">
              {/* Leave Calendar */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Leave Calendar</h2>
                <div className="text-center text-muted-foreground">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Calendar view coming soon...</p>
                  <p className="text-sm">Visual representation of leave schedules and conflicts</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}