'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Plus, Search, Filter, Award, Clock, Users, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function TrainingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  const trainingPrograms: any[] = []

  const certifications: any[] = []

  const employeeProgress: any[] = []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Completed': return 'bg-blue-100 text-blue-800'
      case 'Expiring Soon': return 'bg-yellow-100 text-yellow-800'
      case 'Expired': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-blue-500'
    if (progress >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
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
              <h1 className="text-3xl font-bold text-foreground">Training & Development</h1>
              <p className="text-muted-foreground">Manage employee training programs, certifications, and skill development</p>
            </div>
            <Button className="flex items-center gap-2" onClick={() => alert('Training program creation functionality coming soon!')}>
              <Plus className="w-4 h-4" />
              New Training Program
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Programs</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Enrolled</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completions</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Certifications</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Award className="w-8 h-8 text-orange-500" />
              </div>
            </Card>
          </div>

          <Tabs defaultValue="programs" className="space-y-6">
            <TabsList>
              <TabsTrigger value="programs">Training Programs</TabsTrigger>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
              <TabsTrigger value="progress">Employee Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="programs">
              {/* Training Programs */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold">Training Programs</h2>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input placeholder="Search programs..." className="pl-10 w-64" />
                    </div>
                    <Button variant="outline">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {trainingPrograms.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      No training programs found. Add a program to begin tracking learning.
                    </div>
                  ) : (
                    trainingPrograms.map((program) => (
                      <div key={program.id} className="border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{program.title}</h3>
                            <p className="text-muted-foreground">{program.type}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span>Duration: {program.duration}</span>
                              <span>Started: {program.startDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(program.status)}>{program.status}</Badge>
                            <Button variant="outline" size="sm">
                              Manage
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{program.enrolled}</p>
                            <p className="text-sm text-muted-foreground">Enrolled</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{program.completed}</p>
                            <p className="text-sm text-muted-foreground">Completed</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600">
                              {Math.round((program.completed / program.enrolled) * 100)}%
                            </p>
                            <p className="text-sm text-muted-foreground">Completion Rate</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="certifications">
              {/* Certifications */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold">Employee Certifications</h2>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input placeholder="Search certifications..." className="pl-10 w-64" />
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
                        <th className="pb-4 font-medium text-muted-foreground">Certification</th>
                        <th className="pb-4 font-medium text-muted-foreground">Issuer</th>
                        <th className="pb-4 font-medium text-muted-foreground">Issue Date</th>
                        <th className="pb-4 font-medium text-muted-foreground">Expiry Date</th>
                        <th className="pb-4 font-medium text-muted-foreground">Status</th>
                        <th className="pb-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {certifications.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                            No certifications recorded yet. Add certifications as employees complete training.
                          </td>
                        </tr>
                      ) : (
                        certifications.map((cert) => (
                          <tr key={cert.id} className="hover:bg-muted/50">
                            <td className="py-4 font-medium">{cert.employee}</td>
                            <td className="py-4 text-sm">{cert.certification}</td>
                            <td className="py-4 text-sm">{cert.issuer}</td>
                            <td className="py-4 text-sm">{cert.issueDate}</td>
                            <td className="py-4 text-sm">{cert.expiryDate}</td>
                            <td className="py-4">
                              <Badge className={getStatusColor(cert.status)}>{cert.status}</Badge>
                            </td>
                            <td className="py-4">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="progress">
              {/* Employee Progress */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold">Employee Training Progress</h2>
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
                  {employeeProgress.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      No progress data yet. Track employee progress as they complete training.
                    </div>
                  ) : (
                    employeeProgress.map((progress, index) => (
                      <div key={index} className="border rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="font-semibold">{progress.employee}</h3>
                            <p className="text-sm text-muted-foreground">{progress.course}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={getStatusColor(progress.status)}>{progress.status}</Badge>
                            <span className="text-sm font-medium">{progress.progress}%</span>
                          </div>
                        </div>
                        <Progress value={progress.progress} className="h-2" />
                      </div>
                    ))
                  )}
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