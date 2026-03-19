'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function NewLeaveRequestPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [teamMembers, setTeamMembers] = useState<string[]>([])
  const [formData, setFormData] = useState({
    employee: '',
    leaveType: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: '',
  })

  const leaveTypes = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave']

  useEffect(() => {
    // Load team members from localStorage
    if (typeof window !== 'undefined') {
      const savedMembers = localStorage.getItem('teamMembers')
      if (savedMembers) {
        try {
          const members = JSON.parse(savedMembers)
          setTeamMembers(members.map((m: any) => m.name))
        } catch (e) {
          console.error('Failed to load team members')
        }
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.employee.trim() || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields')
      return
    }

    // Validate dates
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      alert('End date must be after start date')
      return
    }

    // Calculate days
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const newLeaveRequest = {
      employee: formData.employee,
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days: days,
      reason: formData.reason,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    }

    try {
      // Save to database via API
      const response = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLeaveRequest),
      })

      if (!response.ok) {
        throw new Error('Failed to save leave request to database')
      }

      // Also save to localStorage for backup
      const existingRequests = localStorage.getItem('leaveRequests') ? JSON.parse(localStorage.getItem('leaveRequests')!) : []
      const updatedRequests = [...existingRequests, { id: Date.now().toString(), ...newLeaveRequest }]
      localStorage.setItem('leaveRequests', JSON.stringify(updatedRequests))

      alert('Leave request submitted successfully!')

      // Redirect back to leave
      router.push('/leave')
    } catch (error) {
      console.error('Error saving leave request:', error)
      alert('Failed to submit leave request. Please try again.')
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="mb-6">
              <Link href="/leave" className="flex items-center gap-2 text-primary hover:underline mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Leave Management
              </Link>
              <h1 className="text-3xl font-bold mb-2">Request Leave</h1>
              <p className="text-muted-foreground">Submit a leave request</p>
            </div>

            {/* Form */}
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Employee */}
                <div>
                  <label htmlFor="employee" className="block text-sm font-medium mb-2">
                    Employee *
                  </label>
                  <select
                    id="employee"
                    name="employee"
                    value={formData.employee}
                    onChange={handleChange}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select an employee</option>
                    {teamMembers.map((member) => (
                      <option key={member} value={member}>
                        {member}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Leave Type */}
                <div>
                  <label htmlFor="leaveType" className="block text-sm font-medium mb-2">
                    Leave Type
                  </label>
                  <select
                    id="leaveType"
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleChange}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm"
                  >
                    {leaveTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                    Start Date *
                  </label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                    End Date *
                  </label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Reason */}
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium mb-2">
                    Reason (Optional)
                  </label>
                  <Textarea
                    id="reason"
                    name="reason"
                    placeholder="Enter reason for leave"
                    value={formData.reason}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Submit Request
                  </Button>
                  <Link href="/leave" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
