'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface TimeEntry {
  id: string;
  taskTitle: string;
  staffMember: string;
  date: string;
  hoursSpent: number;
  estimatedHours: number;
  status: 'on-track' | 'over' | 'under';
  description?: string;
}

export default function TimeTrackingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  const totalEstimated = timeEntries.reduce((sum, entry) => sum + entry.estimatedHours, 0);
  const totalActual = timeEntries.reduce((sum, entry) => sum + entry.hoursSpent, 0);
  const variance = totalActual - totalEstimated;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'over':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'under':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="w-5 h-5" />;
      case 'over':
        return <AlertCircle className="w-5 h-5" />;
      case 'under':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Estimated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEstimated}h</div>
                <p className="text-xs text-muted-foreground mt-1">Planned hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalActual}h</div>
                <p className="text-xs text-muted-foreground mt-1">Hours worked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Variance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {variance > 0 ? '+' : ''}{variance}h
                </div>
                <p className="text-xs text-muted-foreground mt-1">{variance > 0 ? 'Over' : 'Under'} estimate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {((totalEstimated / (totalEstimated + Math.abs(variance))) * 100).toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Estimate accuracy</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Time Entries</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Input type="date" className="w-48" placeholder="From date" />
              <Input type="date" className="w-48" placeholder="To date" />
              <Button>Apply Filter</Button>
            </CardContent>
          </Card>

          {/* Time Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Time Entries</CardTitle>
              <CardDescription>Tracking actual vs estimated hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeEntries.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground">
                    No time entries yet. Start tracking hours to see your team's progress.
                  </div>
                ) : (
                  timeEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-4 border rounded-lg ${getStatusColor(entry.status)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">{getStatusIcon(entry.status)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{entry.taskTitle}</h4>
                              <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                                {entry.staffMember}
                              </span>
                            </div>
                            <p className="text-sm mt-2">
                              <strong>Estimated:</strong> {entry.estimatedHours}h | <strong>Actual:</strong> {entry.hoursSpent}h | 
                              <strong className={entry.status === 'over' ? ' text-red-600' : entry.status === 'under' ? ' text-blue-600' : ' text-green-600'}>
                                {' '}{entry.status === 'over' ? '+' : entry.status === 'under' ? '-' : ''}{Math.abs(entry.hoursSpent - entry.estimatedHours)}h
                              </strong>
                            </p>
                            {entry.description && (
                              <p className="text-sm mt-2 opacity-75">{entry.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-3 py-1 bg-white bg-opacity-50 rounded-full text-xs font-semibold">
                            {entry.status === 'on-track' ? 'On Track' : entry.status === 'over' ? 'Over' : 'Under'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Team Insights</CardTitle>
              <CardDescription>Performance analytics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-sm">Tasks On Track</h4>
                  <p className="text-2xl font-bold text-blue-700 mt-2">1</p>
                  <p className="text-xs text-blue-600 mt-1">33% of tasks</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-sm">Tasks Over Hours</h4>
                  <p className="text-2xl font-bold text-red-700 mt-2">1</p>
                  <p className="text-xs text-red-600 mt-1">33% of tasks</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-sm">Avg. Team Efficiency</h4>
                  <p className="text-2xl font-bold text-green-700 mt-2">96%</p>
                  <p className="text-xs text-green-600 mt-1">Within 10% of estimate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
