import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  ClipboardList,
  PhoneCall,
  BookOpen,
  Wrench,
  BarChart3,
  Train,
  Shield,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';
import type { UserRole } from '../../types';

const allMenuItems = [
  { path: '/', label: '工单总览', icon: LayoutDashboard, roles: ['service', 'reviewer', 'manager'] as UserRole[] },
  { path: '/channel', label: '渠道接入', icon: Inbox, roles: ['service', 'manager'] as UserRole[] },
  { path: '/process', label: '工单处理', icon: ClipboardList, roles: ['service', 'manager'] as UserRole[] },
  { path: '/review', label: '旅客回访', icon: PhoneCall, roles: ['reviewer', 'manager'] as UserRole[] },
  { path: '/standards', label: '服务标准', icon: BookOpen, roles: ['service', 'reviewer', 'manager'] as UserRole[] },
  { path: '/rectify', label: '整改跟踪', icon: Wrench, roles: ['manager'] as UserRole[] },
  { path: '/analysis', label: '质量分析', icon: BarChart3, roles: ['manager'] as UserRole[] },
  { path: '/audit', label: '权限审计', icon: Shield, roles: ['manager'] as UserRole[] },
];

export default function Sidebar() {
  const location = useLocation();
  const { currentRole } = useAppStore();

  const menuItems = allMenuItems.filter((item) => item.roles.includes(currentRole));

  return (
    <aside className="w-60 bg-neutral-700 text-white flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="h-16 flex items-center px-5 border-b border-neutral-600">
        <Train className="w-8 h-8 text-railway-400 mr-3" />
        <span className="text-lg font-semibold">铁路服务质量</span>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center px-5 py-3 text-sm transition-colors relative',
                isActive
                  ? 'bg-railway-600 text-white'
                  : 'text-neutral-300 hover:bg-neutral-600 hover:text-white'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-railway-400" />
              )}
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-neutral-600 text-xs text-neutral-400">
        <p>版本 v1.0.0</p>
        <p className="mt-1">© 2024 铁路客户服务中心</p>
      </div>
    </aside>
  );
}
