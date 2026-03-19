'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function NewTeamMemberPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    hireDate: '',
    location: '',
  })

  const departmentList = ['Engineering', 'Product', 'Design', 'Quality Assurance', 'Marketing', 'Sales', 'HR', 'Finance']
  const roles = [
    'Founder and Director',
    'CTO & Lead Engineer',
    'Lead Business Strategist',
    'Partnership Lead',
    'Operational Manager',
    'Community Liaison',
    'Social Media Strategist',
  ]

  const [filteredDepartments, setFilteredDepartments] = useState<string[]>([])
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Handle department input with suggestions
    if (name === 'department') {
      setShowDepartmentDropdown(true)
      if (value) {
        const filtered = departmentList.filter((d) => d.toLowerCase().includes(value.toLowerCase()))
        setFilteredDepartments(filtered.length > 0 ? filtered : [value])
      } else {
        setFilteredDepartments(departmentList)
      }
    }
  }

  const selectDepartment = (department: string) => {
    setFormData((prev) => ({
      ...prev,
      department,
    }))
    setShowDepartmentDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.department.trim() || !formData.role.trim() || !formData.hireDate.trim()) {
      alert('Please fill in all required fields')
      return
    }

    // Create new member object
    const newMember = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      department: formData.department,
      hire_date: formData.hireDate,
      location: formData.location,
    }

    try {
      // Save to database via API
      const response = await fetch('/api/team-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMember),
      })

      if (!response.ok) {
        throw new Error('Failed to save team member to database')
      }

      const savedMember = await response.json()

      // Also save to localStorage for backup
      const existingMembers = localStorage.getItem('teamMembers') ? JSON.parse(localStorage.getItem('teamMembers')!) : []
      const memberWithDefaults = {
        id: savedMember.id || Date.now().toString(),
        ...newMember,
        status: 'active',
        completionRate: '0%',
        onTimeRate: '0%',
        qualityScore: '0/5',
        tasksAssigned: 0,
        avatar: formData.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase(),
      }
      const updatedMembers = [...existingMembers, memberWithDefaults]
      localStorage.setItem('teamMembers', JSON.stringify(updatedMembers))

      alert('Team member created successfully!')

      // Redirect back to team
      router.push('/team')
    } catch (error) {
      console.error('Error saving team member:', error)
      alert('Failed to save team member. Please try again.')
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
              <Link href="/team" className="flex items-center gap-2 text-primary hover:underline mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Team
              </Link>
              <h1 className="text-3xl font-bold mb-2">Add New Team Member</h1>
              <p className="text-muted-foreground">Add a new member to your team</p>
            </div>

            {/* Form */}
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Department */}
                <div className="relative">
                  <label htmlFor="department" className="block text-sm font-medium mb-2">
                    Department *
                  </label>
                  <Input
                    id="department"
                    name="department"
                    type="text"
                    placeholder="Type or select a department"
                    value={formData.department}
                    onChange={handleChange}
                    onFocus={() => setShowDepartmentDropdown(true)}
                    required
                    autoComplete="off"
                  />
                  {showDepartmentDropdown && filteredDepartments.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-md">
                      {filteredDepartments.map((dept, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-accent first:rounded-t-lg last:rounded-b-lg"
                          onClick={() => selectDepartment(dept)}
                        >
                          {dept}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium mb-2">
                    Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>

                {/* Hire Date */}
                <div>
                  <label htmlFor="hireDate" className="block text-sm font-medium mb-2">
                    Hire Date *
                  </label>
                  <Input
                    id="hireDate"
                    name="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Add Member
                  </Button>
                  <Link href="/team" className="flex-1">
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
