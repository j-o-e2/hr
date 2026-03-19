'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Search, Filter, Download, Eye, Calculator, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function PayrollPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  const payrollRecords: any[] = []

  const salaryStructure: any[] = []

  const handleRunPayroll = () => {
    alert('Payroll processing initiated. This would calculate salaries for all employees and generate payroll records.')
    // In a real implementation, this would:
    // 1. Fetch all active employees
    // 2. Calculate salaries based on their salary structure
    // 3. Apply deductions and allowances
    // 4. Generate payroll records
    // 5. Update payroll status
  }

  const handleAddSalaryRecord = () => {
    alert('Add salary record functionality. This would open a form to manually add or update employee salary information.')
    // In a real implementation, this would navigate to a form or open a modal
  }

  const handleViewRecord = (recordId: string) => {
    alert(`Viewing payroll record ${recordId}. This would show detailed payroll information.`)
    // In a real implementation, this would open a detailed view or modal
  }

  const handleDownloadRecord = (recordId: string) => {
    alert(`Downloading payroll record ${recordId}. This would generate a PDF payslip.`)
    // In a real implementation, this would generate and download a PDF
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processed': return 'bg-green-100 text-green-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Failed': return 'bg-red-100 text-red-800'
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
              <h1 className="text-3xl font-bold text-foreground">Payroll Management</h1>
              <p className="text-muted-foreground">Manage salaries, payroll processing, and employee compensation</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2" onClick={() => handleRunPayroll()}>
                <Calculator className="w-4 h-4" />
                Run Payroll
              </Button>
              <Button className="flex items-center gap-2" onClick={() => handleAddSalaryRecord()}>
                <Plus className="w-4 h-4" />
                Add Salary Record
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Payroll</p>
                  <p className="text-2xl font-bold">KSH 0</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Processed This Month</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <FileText className="w-8 h-8 text-yellow-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Salary</p>
                  <p className="text-2xl font-bold">KSH 0</p>
                </div>
                <Calculator className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
          </div>

          <Tabs defaultValue="records" className="space-y-6">
            <TabsList>
              <TabsTrigger value="records">Payroll Records</TabsTrigger>
              <TabsTrigger value="structure">Salary Structure</TabsTrigger>
              <TabsTrigger value="taxes">Tax Management</TabsTrigger>
            </TabsList>

            <TabsContent value="records">
              {/* Payroll Records */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold">Payroll Records</h2>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input placeholder="Search records..." className="pl-10 w-64" />
                    </div>
                    <Button variant="outline">
                      <Filter className="w-4 h-4" />
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="pb-4 font-medium text-muted-foreground">Employee</th>
                        <th className="pb-4 font-medium text-muted-foreground">Period</th>
                        <th className="pb-4 font-medium text-muted-foreground">Basic Salary (KSH)</th>
                        <th className="pb-4 font-medium text-muted-foreground">Allowances (KSH)</th>
                        <th className="pb-4 font-medium text-muted-foreground">Deductions (KSH)</th>
                        <th className="pb-4 font-medium text-muted-foreground">Net Salary (KSH)</th>
                        <th className="pb-4 font-medium text-muted-foreground">Status</th>
                        <th className="pb-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {payrollRecords.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                            No payroll records yet. Run payroll or add a record to get started.
                          </td>
                        </tr>
                      ) : (
                        payrollRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-muted/50">
                            <td className="py-4 font-medium">{record.employee}</td>
                            <td className="py-4 text-sm">{record.period}</td>
                            <td className="py-4 text-sm">KSH {record.basicSalary.toLocaleString()}</td>
                            <td className="py-4 text-sm">KSH {record.allowances.toLocaleString()}</td>
                            <td className="py-4 text-sm">KSH {record.deductions.toLocaleString()}</td>
                            <td className="py-4 font-semibold">KSH {record.netSalary.toLocaleString()}</td>
                            <td className="py-4">
                              <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                            </td>
                            <td className="py-4">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleViewRecord(record.id)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDownloadRecord(record.id)}>
                                  <Download className="w-4 h-4" />
                                </Button>
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

            <TabsContent value="structure">
              {/* Salary Structure */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Salary Components</h2>
                  <div className="space-y-4">
                    {salaryStructure.length === 0 ? (
                      <div className="py-10 text-center text-sm text-muted-foreground">
                        No salary components configured yet.
                      </div>
                    ) : (
                      salaryStructure.map((component, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{component.component}</span>
                          <div className="text-right">
                            <span className="font-medium">KSH {component.amount.toLocaleString()}</span>
                            <span className="text-sm text-muted-foreground ml-2">({component.percentage}%)</span>
                          </div>
                        </div>
                      ))
                    )}
                    <div className="border-t pt-4 flex justify-between items-center font-semibold">
                      <span>Total CTC</span>
                      <span>KSH 0</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Salary Breakdown</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Basic</span>
                      <span className="font-medium">KSH 50,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">HRA</span>
                      <span className="font-medium">KSH 15,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Conveyance</span>
                      <span className="font-medium">KSH 19,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">LTA</span>
                      <span className="font-medium">KSH 10,000</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between font-semibold">
                      <span>Gross Monthly</span>
                      <span>KSH 94,200</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="taxes">
              {/* Tax Management */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Tax Management</h2>
                <div className="text-center text-muted-foreground">
                  <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Tax calculation and management features</p>
                  <p className="text-sm">Automatic tax calculations, TDS management, and compliance reporting</p>
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