'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, User, Mail, Phone, Trash2, Edit, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function TeamPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [teamMembers, setTeamMembers] = useState<any[]>([])

  useEffect(() => {
    // Load team members from localStorage on mount
    if (typeof window !== 'undefined') {
      const savedMembers = localStorage.getItem('teamMembers')
      if (savedMembers) {
        try {
          const parsedMembers = JSON.parse(savedMembers)
          setTeamMembers(Array.isArray(parsedMembers) ? parsedMembers : [])
        } catch (e) {
          setTeamMembers([])
        }
      }
    }
  }, [])

  const deleteMember = (id: string) => {
    const updatedMembers = teamMembers.filter(member => member.id !== id)
    setTeamMembers(updatedMembers)

    // Persist removal to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('teamMembers', JSON.stringify(updatedMembers))
    }
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Team Members</h1>
                <p className="text-muted-foreground">Manage and monitor team performance</p>
              </div>
              <Link href="/team/new">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Member
                </Button>
              </Link>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <Card key={member.id} className="p-6 hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://avatar.vercel.sh/${member.name}`} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="px-2">
                      <Star className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{member.department}</Badge>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-border">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Completion</p>
                      <p className="font-bold text-sm">{member.completionRate}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">On-Time</p>
                      <p className="font-bold text-sm">{member.onTimeRate}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Quality</p>
                      <p className="font-bold text-sm">{member.qualityScore}</p>
                    </div>
                  </div>

                  {/* Tasks Info */}
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Active Tasks</p>
                    <div className="bg-muted rounded-lg px-3 py-2 text-center">
                      <p className="font-bold text-lg">{member.tasksAssigned}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/team/${member.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        View Details
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="px-3">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="px-3 text-destructive hover:text-destructive" onClick={() => deleteMember(member.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {teamMembers.length === 0 && (
              <Card className="p-12 text-center">
                <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No team members</h3>
                <p className="text-muted-foreground mb-4">Add your first team member to get started</p>
                <Link href="/team/new">
                  <Button>Add Member</Button>
                </Link>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
