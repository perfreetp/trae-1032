import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles: Record<string, string> = {
  '/': '工单总览',
  '/channel': '渠道接入',
  '/process': '工单处理',
  '/review': '旅客回访',
  '/standards': '服务标准',
  '/rectify': '整改跟踪',
  '/analysis': '质量分析',
};

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || '铁路旅客服务质量';

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <div className="ml-60">
        <Header title={title} />
        <main className="p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
