'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, AlertCircle, CheckCircle, Clock, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  type: 'deadline' | 'task-assignment' | 'task-completion' | 'comment' | 'overdue';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired?: boolean;
  daysUntilDeadline?: number;
}

export default function NotificationsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        try {
          const tasks = JSON.parse(savedTasks);
          const today = new Date();
          const generatedNotifications: Notification[] = [...notifications];

          tasks.forEach((task: any) => {
            if (task.dueDate) {
              const dueDate = new Date(task.dueDate);
              const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

              const existingAssignmentNotif = generatedNotifications.some(n => 
                n.type === 'task-assignment' && n.message.includes(task.title)
              );
              
              if (!existingAssignmentNotif && task.assignedTo) {
                generatedNotifications.push({
                  id: `assignment-${task.id}`,
                  type: 'task-assignment',
                  title: `New Task Assigned: ${task.title}`,
                  message: `${task.assignedTo} has been assigned to "${task.title}". Priority: ${task.priority || 'Normal'}`,
                  timestamp: 'just now',
                  read: false,
                  actionRequired: false,
                });
              }

              if (daysUntilDue < 0 && task.status !== 'completed') {
                const existingOverdueNotif = generatedNotifications.some(n => 
                  n.type === 'overdue' && n.message.includes(task.title)
                );
                
                if (!existingOverdueNotif) {
                  generatedNotifications.push({
                    id: `overdue-${task.id}`,
                    type: 'overdue',
                    title: `OVERDUE: ${task.title}`,
                    message: `The task "${task.title}" assigned to ${task.assignedTo} is ${Math.abs(daysUntilDue)} days overdue.`,
                    timestamp: 'now',
                    read: false,
                    actionRequired: true,
                    daysUntilDeadline: daysUntilDue,
                  });
                }
              }
              else if (daysUntilDue > 0 && daysUntilDue <= 3 && task.status !== 'completed') {
                const existingDeadlineNotif = generatedNotifications.some(n => 
                  n.type === 'deadline' && n.message.includes(task.title)
                );
                
                if (!existingDeadlineNotif) {
                  generatedNotifications.push({
                    id: `deadline-${task.id}`,
                    type: 'deadline',
                    title: `Deadline Reminder: ${task.title}`,
                    message: `The task "${task.title}" assigned to ${task.assignedTo} is due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}.`,
                    timestamp: 'now',
                    read: false,
                    actionRequired: true,
                    daysUntilDeadline: daysUntilDue,
                  });
                }
              }
            }
          });

          const uniqueNotifications = generatedNotifications.reduce((acc: Notification[], notif) => {
            const exists = acc.some(n => n.id === notif.id);
            if (!exists) acc.push(notif);
            return acc;
          }, []);

          setNotifications(uniqueNotifications.sort((a, b) => {
            const aRead = a.read ? 1 : 0;
            const bRead = b.read ? 1 : 0;
            return aRead - bRead;
          }));
        } catch (e) {
          console.error('Error loading tasks for notifications:', e);
        }
      }
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline': return <AlertCircle className="w-5 h-5" />;
      case 'overdue': return <AlertCircle className="w-5 h-5" />;
      case 'task-assignment': return <Clock className="w-5 h-5" />;
      case 'task-completion': return <CheckCircle className="w-5 h-5" />;
      case 'comment': return <Bell className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string, read: boolean) => {
    if (read) return 'bg-muted border-border';
    switch (type) {
      case 'overdue': return 'bg-red-100 border-red-300';
      case 'deadline': return 'bg-orange-50 border-orange-200';
      case 'task-assignment': return 'bg-blue-50 border-blue-200';
      case 'task-completion': return 'bg-green-50 border-green-200';
      case 'comment': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Unread</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {notifications.filter(n => n.type === 'task-assignment' && !n.read).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">New assignments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {notifications.filter(n => n.type === 'deadline' && !n.read).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Due soon</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">
                  {notifications.filter(n => n.type === 'overdue').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Action needed</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Notifications</CardTitle>
                  <CardDescription>Your recent alerts and updates</CardDescription>
                </div>
                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                  >
                    Mark All as Read
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 border rounded-lg transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="mt-1 flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm break-words">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-sm mt-1 opacity-75 break-words">
                            {notification.message}
                          </p>
                          <p className="text-xs mt-2 opacity-50">{notification.timestamp}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Read
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure your preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold text-sm">Deadline Reminders</h4>
                  <p className="text-xs text-muted-foreground mt-1">Get notified before deadline</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold text-sm">Task Assignments</h4>
                  <p className="text-xs text-muted-foreground mt-1">Notify when tasks are assigned</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold text-sm">Overdue Tasks</h4>
                  <p className="text-xs text-muted-foreground mt-1">Alert for overdue tasks</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
