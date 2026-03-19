'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Plus, Search, Filter, Star, Target, Award, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function PerformancePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  const performanceReviews: any[] = []

  const kpis: any[] = []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-blue-600'
    if (rating >= 3.5) return 'text-yellow-600'
    return 'text-red-600'
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
              <h1 className="text-3xl font-bold text-foreground">Performance Management</h1>
              <p className="text-muted-foreground">Track employee performance, goals, and development</p>
            </div>
            <Button className="flex items-center gap-2" onClick={() => alert('Performance review functionality coming soon!')}>
              <Plus className="w-4 h-4" />
              New Review
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Performance Rating</p>
                  <p className="text-2xl font-bold">0/5</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reviews Completed</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Award className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Goals Achieved</p>
                  <p className="text-2xl font-bold">0%</p>
                </div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Top Performers</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
          </div>

          <Tabs defaultValue="reviews" className="space-y-6">
            <TabsList>
              <TabsTrigger value="reviews">Performance Reviews</TabsTrigger>
              <TabsTrigger value="goals">Goals & KPIs</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="reviews">
              {/* Performance Reviews */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold">Performance Reviews</h2>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input placeholder="Search reviews..." className="pl-10 w-64" />
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
                        <th className="pb-4 font-medium text-muted-foreground">Reviewer</th>
                        <th className="pb-4 font-medium text-muted-foreground">Period</th>
                        <th className="pb-4 font-medium text-muted-foreground">Rating</th>
                        <th className="pb-4 font-medium text-muted-foreground">Goals</th>
                        <th className="pb-4 font-medium text-muted-foreground">Status</th>
                        <th className="pb-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {performanceReviews.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                            No performance reviews available yet. Create a review to get started.
                          </td>
                        </tr>
                      ) : (
                        performanceReviews.map((review) => (
                          <tr key={review.id} className="hover:bg-muted/50">
                            <td className="py-4 font-medium">{review.employee}</td>
                            <td className="py-4 text-sm">{review.reviewer}</td>
                            <td className="py-4 text-sm">{review.period}</td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <Star className={`w-4 h-4 ${getRatingColor(review.rating)}`} />
                                <span className={`font-medium ${getRatingColor(review.rating)}`}>
                                  {review.rating}/5
                                </span>
                              </div>
                            </td>
                            <td className="py-4 text-sm">
                              {review.completedGoals}/{review.goals}
                            </td>
                            <td className="py-4">
                              <Badge className={getStatusColor(review.status)}>{review.status}</Badge>
                            </td>
                            <td className="py-4">
                              <Button variant="outline" size="sm">
                                View Details
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

            <TabsContent value="goals">
              {/* Goals & KPIs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Key Performance Indicators</h2>
                  <div className="space-y-6">
                    {kpis.length === 0 ? (
                      <div className="py-10 text-center text-sm text-muted-foreground">
                        No KPIs configured yet. Add goals to start tracking performance.
                      </div>
                    ) : (
                      kpis.map((kpi, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{kpi.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {kpi.value}{kpi.unit} / {kpi.target}{kpi.unit}
                            </span>
                          </div>
                          <Progress value={(kpi.value / kpi.target) * 100} className="h-2" />
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Goal Categories</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Individual Goals</span>
                      <Badge variant="outline">85% Complete</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Team Goals</span>
                      <Badge variant="outline">72% Complete</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Department Goals</span>
                      <Badge variant="outline">91% Complete</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Company Goals</span>
                      <Badge variant="outline">68% Complete</Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              {/* Performance Analytics */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Performance Analytics</h2>
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Advanced analytics and reporting</p>
                  <p className="text-sm">Performance trends, predictive analytics, and detailed insights</p>
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