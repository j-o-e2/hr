'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Download, FileText, TrendingUp, Users, DollarSign, Calendar, PieChart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

interface ReportData {
  type: string
  stats: any
  data: any[]
}

export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')

  const reportCategories = [
    {
      title: 'Task Management',
      description: 'Task completion rates, productivity metrics, and project analytics',
      icon: BarChart3,
      reports: [
        { name: 'Task Overview', type: 'tasks' },
        { name: 'Project Progress', type: 'tasks' }
      ]
    },
    {
      title: 'Leave Management',
      description: 'Leave requests, approval rates, and absence analytics',
      icon: Calendar,
      reports: [
        { name: 'Leave Summary', type: 'leave' },
        { name: 'Leave Trends', type: 'leave' }
      ]
    },
    {
      title: 'Attendance Reports',
      description: 'Attendance patterns, punctuality, and time tracking',
      icon: Users,
      reports: [
        { name: 'Attendance Overview', type: 'attendance' },
        { name: 'Punctuality Report', type: 'attendance' }
      ]
    },
    {
      title: 'Performance Analytics',
      description: 'Performance metrics, KPIs, and employee productivity',
      icon: TrendingUp,
      reports: [
        { name: 'Performance Summary', type: 'performance' },
        { name: 'KPI Dashboard', type: 'performance' }
      ]
    },
    {
      title: 'Payroll Reports',
      description: 'Salary distributions, payroll costs, and compensation analysis',
      icon: DollarSign,
      reports: [
        { name: 'Payroll Summary', type: 'overview' },
        { name: 'Cost Analysis', type: 'overview' }
      ]
    },
    {
      title: 'Executive Overview',
      description: 'High-level business metrics and organizational insights',
      icon: PieChart,
      reports: [
        { name: 'Business Overview', type: 'overview' },
        { name: 'Executive Summary', type: 'overview' }
      ]
    }
  ]

  const handleGenerateReport = async (reportType: string) => {
    setLoading(true)
    setCurrentReport(null)

    try {
      const now = new Date()
      let startDate = ''
      let endDate = ''

      // Calculate date range based on selected period
      switch (selectedPeriod) {
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
          break
        case 'quarterly':
          const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
          const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0)
          startDate = quarterStart.toISOString().split('T')[0]
          endDate = quarterEnd.toISOString().split('T')[0]
          break
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
          endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]
          break
      }

      const response = await fetch(`/api/reports?type=${reportType}&startDate=${startDate}&endDate=${endDate}`)
      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const data = await response.json()
      setCurrentReport(data)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    if (!currentReport) return

    const dataStr = JSON.stringify(currentReport, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

    const exportFileDefaultName = `${currentReport.type}-report-${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
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
              <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
              <p className="text-muted-foreground">Generate comprehensive HR reports and analytics</p>
            </div>
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              {currentReport && (
                <Button variant="outline" className="flex items-center gap-2" onClick={exportReport}>
                  <Download className="w-4 h-4" />
                  Export Report
                </Button>
              )}
            </div>
          </div>

          {/* Current Report Display */}
          {loading && (
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating report...</span>
              </div>
            </Card>
          )}

          {currentReport && !loading && (
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold capitalize">{currentReport.type} Report</h2>
                <Badge variant="secondary">{selectedPeriod}</Badge>
              </div>

              {/* Report Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(currentReport.stats).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="text-2xl font-bold text-primary">{String(value)}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Report Data Preview */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {currentReport.data.length > 0 && Object.keys(currentReport.data[0]).slice(0, 5).map(key => (
                        <th key={key} className="text-left p-2 font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentReport.data.slice(0, 10).map((row: any, index: number) => (
                      <tr key={index} className="border-b">
                        {Object.values(row).slice(0, 5).map((value: any, cellIndex: number) => (
                          <td key={cellIndex} className="p-2">
                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {currentReport.data.length > 10 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Showing first 10 of {currentReport.data.length} records
                  </p>
                )}
              </div>
            </Card>
          )}

          <Tabs defaultValue="categories" className="space-y-6">
            <TabsList>
              <TabsTrigger value="categories">Report Categories</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
              <TabsTrigger value="custom">Custom Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="categories">
              {/* Report Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportCategories.map((category, index) => {
                  const Icon = category.icon
                  return (
                    <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{category.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                          <div className="space-y-2">
                            {category.reports.map((report, reportIndex) => (
                              <div key={reportIndex} className="flex items-center justify-between">
                                <span className="text-sm">{report.name}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleGenerateReport(report.type)}
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Download className="w-3 h-3" />
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="scheduled">
              {/* Scheduled Reports */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Scheduled Reports</h2>
                <div className="text-center text-muted-foreground">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">Scheduled reports feature coming soon.</p>
                  <p className="text-sm">This will allow you to automate report generation and delivery.</p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="custom">
              {/* Custom Reports */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Create Custom Report</h2>
                <div className="text-center text-muted-foreground">
                  <PieChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Custom report builder</p>
                  <p className="text-sm">Create tailored reports with specific metrics and filters</p>
                  <Button className="mt-4" disabled>Build Custom Report</Button>
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