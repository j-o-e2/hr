'use client'

import { useState } from 'react'
import { Users, Plus, Search, Filter, Eye, Edit, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function RecruitmentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const jobPostings: any[] = []

  const applicants: any[] = []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Closed': return 'bg-gray-100 text-gray-800'
      case 'Draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const activeJobsCount = jobPostings.filter((job) => job.status === 'Active').length
  const totalApplicantsCount = applicants.length
  const interviewsScheduled = applicants.filter((applicant) => applicant.stage === 'Interview').length
  const offersMade = applicants.filter((applicant) => applicant.stage === 'Offer').length
  const pipelineCounts = {
    Applied: applicants.filter((applicant) => applicant.stage === 'Applied').length,
    Screening: applicants.filter((applicant) => applicant.stage === 'Screening').length,
    Interview: applicants.filter((applicant) => applicant.stage === 'Interview').length,
    Assessment: applicants.filter((applicant) => applicant.stage === 'Assessment').length,
    Offer: applicants.filter((applicant) => applicant.stage === 'Offer').length,
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Applied': return 'bg-blue-100 text-blue-800'
      case 'Screening': return 'bg-yellow-100 text-yellow-800'
      case 'Interview': return 'bg-purple-100 text-purple-800'
      case 'Assessment': return 'bg-orange-100 text-orange-800'
      case 'Offer': return 'bg-green-100 text-green-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
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
              <h1 className="text-3xl font-bold text-foreground">Recruitment Management</h1>
              <p className="text-muted-foreground">Manage job postings, applicants, and hiring pipeline</p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Post New Job
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold">{activeJobsCount}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Applicants</p>
                  <p className="text-2xl font-bold">{totalApplicantsCount}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Interviews Scheduled</p>
                  <p className="text-2xl font-bold">{interviewsScheduled}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Offers Made</p>
                  <p className="text-2xl font-bold">{offersMade}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-orange-500" />
              </div>
            </Card>
          </div>

          <Tabs defaultValue="jobs" className="space-y-6">
            <TabsList>
              <TabsTrigger value="jobs">Job Postings</TabsTrigger>
              <TabsTrigger value="applicants">Applicants</TabsTrigger>
              <TabsTrigger value="pipeline">Hiring Pipeline</TabsTrigger>
            </TabsList>

            <TabsContent value="jobs">
              {/* Job Postings */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold">Job Postings</h2>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input placeholder="Search jobs..." className="pl-10 w-64" />
                    </div>
                    <Button variant="outline">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {jobPostings.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      No job postings yet. Create a new job to start collecting applicants.
                    </div>
                  ) : (
                    jobPostings.map((job) => (
                      <div key={job.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <p className="text-muted-foreground">{job.department}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span>Applicants: {job.applicants}</span>
                              <span>Posted: {job.postedDate}</span>
                              <span>Deadline: {job.deadline}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="applicants">
              {/* Applicants */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold">Applicants</h2>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input placeholder="Search applicants..." className="pl-10 w-64" />
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
                        <th className="pb-4 font-medium text-muted-foreground">Applicant</th>
                        <th className="pb-4 font-medium text-muted-foreground">Position</th>
                        <th className="pb-4 font-medium text-muted-foreground">Stage</th>
                        <th className="pb-4 font-medium text-muted-foreground">Score</th>
                        <th className="pb-4 font-medium text-muted-foreground">Applied Date</th>
                        <th className="pb-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {applicants.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                            No applicants yet. Applicants will show up here once they apply.
                          </td>
                        </tr>
                      ) : (
                        applicants.map((applicant) => (
                          <tr key={applicant.id} className="hover:bg-muted/50">
                            <td className="py-4 font-medium">{applicant.name}</td>
                            <td className="py-4 text-sm">{applicant.position}</td>
                            <td className="py-4">
                              <Badge className={getStageColor(applicant.stage)}>{applicant.stage}</Badge>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <Progress value={applicant.score} className="w-16" />
                                <span className="text-sm">{applicant.score}%</span>
                              </div>
                            </td>
                            <td className="py-4 text-sm">{applicant.appliedDate}</td>
                            <td className="py-4">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
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

            <TabsContent value="pipeline">
              {/* Hiring Pipeline */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Hiring Pipeline</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="font-medium mb-1">Applied</h3>
                    <p className="text-2xl font-bold">{pipelineCounts.Applied}</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-yellow-100 text-yellow-800 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="font-medium mb-1">Screening</h3>
                    <p className="text-2xl font-bold">{pipelineCounts.Screening}</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 text-purple-800 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h3 className="font-medium mb-1">Interview</h3>
                    <p className="text-2xl font-bold">{pipelineCounts.Interview}</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-orange-100 text-orange-800 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="font-medium mb-1">Assessment</h3>
                    <p className="text-2xl font-bold">{pipelineCounts.Assessment}</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 text-green-800 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="font-medium mb-1">Offer</h3>
                    <p className="text-2xl font-bold">{pipelineCounts.Offer}</p>
                  </div>
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