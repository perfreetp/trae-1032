import { Bell, Search, User } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-neutral-700">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索工单..."
            className="pl-9 pr-4 py-2 w-64 text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
          />
        </div>
        <button className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
        </button>
        <div className="flex items-center space-x-3 pl-4 border-l border-neutral-200">
          <div className="w-8 h-8 bg-railway-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-railway-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-neutral-700">管理员</p>
            <p className="text-xs text-neutral-400">客服中心</p>
          </div>
        </div>
      </div>
    </header>
  );
}
