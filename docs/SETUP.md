# Task Management System - Setup Guide

## Quick Start

This is a complete Next.js + Supabase task management and performance tracking system built for small tech hubs in Kenya.

## Prerequisites

1. Node.js 18+ installed
2. Supabase account (free tier available)
3. Git installed
4. A code editor (VS Code recommended)

## Installation

### 1. Clone or Download the Project
```bash
git clone <repo-url>
cd task-management-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to SQL Editor in your Supabase dashboard
4. Copy the entire contents of `/scripts/init-db.sql`
5. Paste into a new SQL query and execute
6. This creates all necessary tables and indexes

### 4. Add Environment Variables

Create a `.env.local` file in the project root. The project prefers server-side env vars but will fall back to `NEXT_PUBLIC_...` if needed.

Recommended (server-side):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

Or (client-visible):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Get these values from:
- Supabase Dashboard → Settings → API
- Copy the `Project URL` and `anon` key

For convenience an example file is included at the project root: `.env.local.example`.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Overview

### Dashboard (`/`)
- Quick overview of all metrics
- 8 team members tracked
- 3 active projects
- 5 upcoming deadlines
- Real-time performance KPIs

### Task Management (`/tasks`)
- Create new tasks
- Assign to team members
- Set priorities (High, Medium, Low)
- Track status (Todo, In Progress, Done)
- Set deadlines and estimated hours

### Projects (`/projects`)
- Organize tasks by project
- Track project status
- View team members on project
- Monitor progress

### Team Management (`/team`)
- View all team members
- Track individual performance
- Monitor workload distribution
- View attendance and completion rates

### Attendance (`/attendance`)
- Daily attendance tracking
- Check-in/check-out times
- Absence and late tracking
- Monthly summaries
- Attendance rate calculations

### Time Tracking (`/time-tracking`)
- Log hours on tasks
- Compare estimated vs actual
- Identify over/under allocated tasks
- Team efficiency metrics
- Accuracy insights

### Calendar (`/calendar`)
- Visual deadline overview
- Mark deadlines
- Filter by status
- See upcoming tasks

### Notes (`/notes`)
- Create and organize notes
- Link to tasks or projects
- Search functionality
- Tag system

### Notifications (`/notifications`)
- Deadline reminders
- Task assignment alerts
- Overdue notifications
- Unread tracking
- Notification settings

### Reporting (`/reporting`)
- Productivity charts
- Team performance analysis
- Time tracking reports
- Attendance reports
- Export capabilities

### Settings (`/settings`)
- Manage KPI targets
- Configure thresholds
- User preferences
- Notification settings

## Database Schema

### Core Tables

#### team_members
```sql
- id (UUID)
- name (String)
- email (String, unique)
- role (String)
- department (String)
- status (String: active, inactive, on-leave)
- hire_date (Date)
```

#### projects
```sql
- id (UUID)
- name (String)
- description (Text)
- status (String: active, completed, on-hold)
- start_date (Date)
- end_date (Date)
- owner_id (Foreign key to team_members)
```

#### tasks
```sql
- id (UUID)
- title (String)
- description (Text)
- project_id (Foreign key)
- assigned_to (Foreign key to team_members)
- status (String: todo, in_progress, done, late)
- priority (String: high, medium, low)
- due_date (Date)
- estimated_hours (Numeric)
- actual_hours (Numeric)
- completed_at (Timestamp)
```

#### attendance
```sql
- id (UUID)
- team_member_id (Foreign key)
- date (Date)
- status (String: present, absent, late, half-day)
- check_in_time (Time)
- check_out_time (Time)
- notes (Text)
```

#### time_tracking
```sql
- id (UUID)
- task_id (Foreign key)
- team_member_id (Foreign key)
- date (Date)
- hours_spent (Numeric)
- description (Text)
```

#### task_attachments
```sql
- id (UUID)
- task_id (Foreign key)
- file_name (String)
- file_url (Text)
- file_type (String)
- file_size (Integer)
- uploaded_by (Foreign key to team_members)
```

#### notifications
```sql
- id (UUID)
- team_member_id (Foreign key)
- task_id (Foreign key)
- type (String: deadline, task-assignment, etc.)
- title (String)
- message (Text)
- read (Boolean)
```

#### performance_kpis
```sql
- id (UUID)
- team_member_id (Foreign key)
- month (Date)
- tasks_completed (Integer)
- on_time_completion_rate (Numeric)
- average_completion_time (Numeric)
- quality_score (Numeric)
- attendance_rate (Numeric)
- productivity_score (Numeric)
```

## Key Performance Indicators (KPIs)

1. **Attendance Rate** - Team presence percentage (Target: 90%+)
2. **On-Time Completion** - Tasks completed by deadline (Target: 85%+)
3. **Time Accuracy** - Estimated vs actual hours (Target: 90%+)
4. **Task Completion Rate** - Tasks finished (Target: 80%+)
5. **Quality Score** - Work quality rating (Target: 4.5+/5)
6. **Workload Balance** - Tasks per person (Target: 2-4 active)

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Connect your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

### Deploy to Other Platforms

The app can be deployed to:
- Railway.app
- Render.com
- AWS Amplify
- DigitalOcean
- Heroku
- Any Node.js hosting

All require the same environment variables.

## Backup & Data Safety

### Regular Backups
Supabase automatically backs up your data, but you should:

1. **Weekly Export**: Export important data to CSV
2. **Monthly Archive**: Archive reports for compliance
3. **Monitor Storage**: Free tier has 500MB limit (sufficient for small teams)

### Data Retention
- Keep attendance records for 2 years
- Archive completed projects after 1 year
- Delete old notifications after 3 months

## Usage Tips

### For Operations Manager

1. **Daily**: Check notifications for overdue tasks
2. **Weekly**: Review time tracking accuracy and workload balance
3. **Monthly**: Generate reports for team meeting
4. **Quarterly**: Analyze trends and adjust processes

### For Team Members

1. **Daily**: Log hours on tasks
2. **Weekly**: Review assigned tasks and deadlines
3. **Monthly**: Check performance metrics

## Troubleshooting

### Database Connection Issues
- Verify Supabase URL and key are correct
- Check if database tables exist (run SQL script again)
- Ensure .env.local file is in project root

### Page Loading Slowly
- Clear browser cache
- Check Supabase connection
- Verify database indexes are created

### Data Not Showing
- Refresh the page
- Check browser console for errors
- Verify data exists in Supabase database

## Support & Documentation

- **Feature Details**: See `/docs/FEATURES.md`
- **KPI Definitions**: See `/docs/KPIs.md`
- **Database Schema**: See tables above

## Scaling Guidelines

### From 3 to 10 Team Members
- Current system handles without changes
- Recommend adding more project managers
- Consider role-based access control

### From 10 to 50+ Team Members
- Add department-level tracking
- Implement team hierarchies
- Add budget and cost tracking
- Consider API integrations

## Next Steps

1. ✅ Database is set up
2. ✅ All pages are created
3. ✅ KPI tracking is implemented
4. 📝 Add sample data for testing
5. 🚀 Deploy to production
6. 👥 Onboard your team
7. 📊 Run first month's reports

## Contact & Support

For issues or questions:
- Check documentation files
- Review database schema
- Test with sample data
- Contact your development team

---

**Last Updated**: January 2024
**Version**: 1.0.0
**Status**: Production Ready
