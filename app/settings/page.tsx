'use client'

import { useState } from 'react'
import { Save, Bell, Lock, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [saved, setSaved] = useState(false)

  const [settings, setSettings] = useState({
    // Profile Settings
    name: 'Operations Manager',
    email: 'admin@company.com',
    phone: '+254 (0) 123 456 789',

    // Notification Settings
    emailNotifications: true,
    taskReminders: true,
    deadlineAlerts: true,
    weeklyReports: true,
    dailyDigest: false,

    // App Settings
    theme: 'auto',
    language: 'English',
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleInputChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleToggle = (field: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold mb-2">Settings</h1>
              <p className="text-muted-foreground">Manage your account and application preferences</p>
            </div>

            {/* Save Success Message */}
            {saved && (
              <div className="p-4 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Settings saved successfully!
              </div>
            )}

            {/* Profile Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Profile Settings</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Full Name</Label>
                  <Input
                    value={settings.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Email Address</Label>
                  <Input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Phone Number</Label>
                  <Input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </Card>

            {/* Notification Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Notification Preferences</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive important updates via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={() => handleToggle('emailNotifications')}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Task Reminders</p>
                    <p className="text-xs text-muted-foreground">Get reminded about assigned tasks</p>
                  </div>
                  <Switch
                    checked={settings.taskReminders}
                    onCheckedChange={() => handleToggle('taskReminders')}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Deadline Alerts</p>
                    <p className="text-xs text-muted-foreground">Alert me about upcoming deadlines</p>
                  </div>
                  <Switch
                    checked={settings.deadlineAlerts}
                    onCheckedChange={() => handleToggle('deadlineAlerts')}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Weekly Reports</p>
                    <p className="text-xs text-muted-foreground">Receive weekly performance reports</p>
                  </div>
                  <Switch
                    checked={settings.weeklyReports}
                    onCheckedChange={() => handleToggle('weeklyReports')}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Daily Digest</p>
                    <p className="text-xs text-muted-foreground">Get a daily summary of activities</p>
                  </div>
                  <Switch
                    checked={settings.dailyDigest}
                    onCheckedChange={() => handleToggle('dailyDigest')}
                  />
                </div>
              </div>
            </Card>

            {/* Application Settings */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Application Settings</h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Theme</Label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleInputChange('theme', e.target.value)}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System Preference)</option>
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Language</Label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="English">English</option>
                    <option value="Swahili">Swahili</option>
                    <option value="French">French</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Security Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Security</h2>
              </div>

              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Lock className="w-4 h-4 mr-2" />
                  Enable Two-Factor Authentication
                </Button>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 border-destructive/50 bg-destructive/5">
              <h2 className="text-xl font-semibold mb-4 text-destructive">Danger Zone</h2>

              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive bg-transparent">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
                <Button variant="destructive" className="w-full justify-start">
                  Delete Account
                </Button>
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
