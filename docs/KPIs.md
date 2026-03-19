# Performance KPIs - Task Management System

## Overview
This document defines the Key Performance Indicators (KPIs) tracked by the Task Management System for a small tech hub team in Kenya.

## Core KPIs

### 1. **Team Attendance Rate** (Monthly)
- **Description**: Percentage of team members present on scheduled working days
- **Target**: 90%+
- **Formula**: (Present Days / Total Working Days) × 100
- **Data Source**: Attendance tracking module
- **Business Impact**: Ensures team availability and productivity

### 2. **On-Time Task Completion** (Monthly)
- **Description**: Percentage of tasks completed on or before their deadline
- **Target**: 85%+
- **Formula**: (Tasks Completed On Time / Total Tasks Completed) × 100
- **Data Source**: Tasks and Deadlines tables
- **Business Impact**: Measures reliability and planning accuracy

### 3. **Time Estimate Accuracy** (Monthly)
- **Description**: How accurately estimated hours match actual hours spent
- **Target**: 90%+
- **Formula**: 1 - (|Estimated Hours - Actual Hours| / Estimated Hours) × 100
- **Data Source**: Time Tracking table
- **Business Impact**: Improves future project planning and resource allocation

### 4. **Task Completion Rate** (Monthly)
- **Description**: Percentage of assigned tasks that are completed
- **Target**: 80%+
- **Formula**: (Completed Tasks / Total Assigned Tasks) × 100
- **Data Source**: Tasks table
- **Business Impact**: Measures team capacity and workload management

### 5. **Average Task Completion Time** (Monthly)
- **Description**: Average number of days from task creation to completion
- **Target**: < 5 days (varies by project complexity)
- **Formula**: Sum of all task durations / Number of completed tasks
- **Data Source**: Tasks table (created_at to completed_at)
- **Business Impact**: Identifies process bottlenecks and inefficiencies

### 6. **Quality Score** (Per Team Member, Monthly)
- **Description**: Manager-assigned quality rating of completed work
- **Scale**: 1-5 (5 being excellent)
- **Target**: 4.5+
- **Data Source**: Performance Metrics table
- **Business Impact**: Ensures quality standards and identifies training needs

### 7. **Workload Per Team Member** (Weekly/Monthly)
- **Description**: Number of active/completed tasks per team member
- **Metrics**:
  - Active Tasks (should be 2-4 per person for optimal productivity)
  - Completed Tasks (target: 8-12 per month depending on complexity)
  - Hours Tracked vs. Working Hours
- **Data Source**: Tasks and Time Tracking tables
- **Business Impact**: Prevents overload and ensures fair workload distribution

### 8. **Project On-Time Completion** (Per Project)
- **Description**: Percentage of projects delivered on or before deadline
- **Target**: 90%+
- **Formula**: (Projects Completed On Time / Total Projects Completed) × 100
- **Data Source**: Projects and Tasks tables
- **Business Impact**: Measures project management effectiveness

## Dashboard KPIs Display

The main dashboard displays these KPIs in real-time:
- **Attendance Rate**: Green indicator when ≥90%, yellow when 80-90%, red when <80%
- **On-Time Completion**: Shows percentage with trend indicator
- **Time Estimate Accuracy**: Shows percentage with variance analysis
- **Pending Notifications**: Count of deadline reminders and alerts

## Access & Reporting

### Who Can View
- **Operations Manager**: Full access to all KPIs and detailed analytics
- **Team Members**: Limited view of personal performance metrics only

### Reports Available
1. **Weekly Report**: Tasks completed, hours tracked, attendance
2. **Monthly Report**: Full KPI summary, team performance, trends
3. **Project Report**: Per-project KPIs and completion status
4. **Individual Report**: Per-team-member performance metrics

### Data Export
All reports can be exported as PDF or CSV for record-keeping and stakeholder presentations.

## Data Collection Points

| Module | Data Collected | Frequency |
|--------|---------------|-----------|
| Tasks | Status, estimated/actual hours, deadline | Per task |
| Attendance | Check-in/out, status, notes | Daily |
| Time Tracking | Hours spent per task | Daily |
| Notes | Task-related notes and documents | As needed |
| Notifications | Deadline alerts, task updates | Real-time |

## Performance Tiers

### Green (Excellent)
- Attendance: 95%+
- On-Time Completion: 90%+
- Time Accuracy: 95%+
- Quality Score: 4.7+

### Yellow (Satisfactory)
- Attendance: 85-94%
- On-Time Completion: 75-89%
- Time Accuracy: 85-94%
- Quality Score: 4.0-4.6

### Red (Needs Improvement)
- Attendance: <85%
- On-Time Completion: <75%
- Time Accuracy: <85%
- Quality Score: <4.0

## Monthly Review Process

1. **Generate Report**: Create comprehensive KPI report on the last working day of the month
2. **Analyze Trends**: Identify improvements and areas needing attention
3. **Team Meeting**: Present KPIs to team and discuss results
4. **Action Items**: Document any corrective actions needed
5. **Archive**: Store report for historical tracking

## Integration with Other Features

- **Attendance Module**: Feeds into team availability metrics
- **Time Tracking Module**: Provides time estimate accuracy data
- **Notifications**: Alerts for tasks approaching deadlines (impacts on-time completion)
- **Reporting**: Generates visual dashboards and exportable reports
- **Settings**: Configure KPI targets and alert thresholds

## Scalability Notes

As the team grows from 3-10+ people:
- KPIs remain consistent
- Add department/team-level KPIs
- Implement role-based performance metrics
- Consider introducing team-level bonuses tied to KPIs
