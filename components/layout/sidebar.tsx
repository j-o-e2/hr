'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, LayoutDashboard, CheckSquare, FolderOpen, Users, Calendar, FileText, BarChart3, Settings, Clock, Bell, LogIn, StickyNote } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Tasks', href: '/tasks', icon: CheckSquare },
    { label: 'Notes', href: '/notes', icon: StickyNote },
    { label: 'Employee Management', href: '/employees', icon: Users },
    { label: 'Recruitment', href: '/recruitment', icon: Users },
    { label: 'Attendance', href: '/attendance', icon: LogIn },
    { label: 'Leave Management', href: '/leave', icon: Calendar },
    { label: 'Payroll', href: '/payroll', icon: FileText },
    { label: 'Performance', href: '/performance', icon: BarChart3 },
    { label: 'Training', href: '/training', icon: CheckSquare },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:relative w-64 h-screen bg-sidebar text-sidebar-foreground shadow-lg transform transition-transform duration-300 z-50 flex flex-col lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-sidebar-foreground">HR Portal</h1>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent rounded-lg p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="bg-sidebar-accent/20 rounded-lg p-4">
            <p className="text-xs text-sidebar-foreground font-medium mb-2">HR Manager</p>
            <p className="text-xs text-sidebar-foreground/70">admin@company.com</p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
