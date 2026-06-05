import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User, ChevronDown, Shield } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { UserRole } from '../../types';

interface HeaderProps {
  title: string;
}

const roleNameMap: Record<UserRole, string> = {
  service: '客服人员',
  reviewer: '回访人员',
  manager: '管理人员',
};

const roleIconMap: Record<UserRole, string> = {
  service: '👨‍💼',
  reviewer: '📞',
  manager: '👨‍💻',
};

export default function Header({ title }: HeaderProps) {
  const navigate = useNavigate();
  const { currentRole, setCurrentRole } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchText.trim()) {
      navigate('/process', { state: { searchKeyword: searchText.trim() } });
      setSearchText('');
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setShowRoleMenu(false);
  };

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
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="搜索工单编号、标题、姓名、手机号..."
            className="pl-9 pr-4 py-2 w-72 text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-railway-500 focus:border-transparent"
          />
        </div>
        <button className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
        </button>
        <div className="flex items-center space-x-3 pl-4 border-l border-neutral-200">
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center space-x-2 p-1.5 hover:bg-neutral-100 rounded-md transition-colors"
            >
              <Shield className="w-4 h-4 text-railway-500" />
              <span className="text-sm text-neutral-600">{roleNameMap[currentRole]}</span>
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </button>
            {showRoleMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
                {(Object.keys(roleNameMap) as UserRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`w-full px-4 py-2 text-sm text-left flex items-center space-x-2 transition-colors ${
                      currentRole === role
                        ? 'bg-railway-50 text-railway-600'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{roleIconMap[role]}</span>
                    <span>{roleNameMap[role]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="w-8 h-8 bg-railway-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-railway-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-neutral-700">{roleNameMap[currentRole]}</p>
            <p className="text-xs text-neutral-400">客服中心</p>
          </div>
        </div>
      </div>
    </header>
  );
}
